import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import { auditRows, evaluate, runAudit } from "./audit/service";
import { IMPACT_RATIO_MIN, MIN_GROUP_SIZE } from "./audit/fairness";
import { openDb, RESUME_DIR } from "./db";
import { legacyOutcome, legacyParse, legacyScore } from "./legacy/legacy";
import { aiExtract, MODEL, ollamaAvailable } from "./parsing/llm";
import { ocrAvailable, ocrLayout } from "./parsing/ocr";
import { parseDocument } from "./parsing/parser";
import { extractLayout, readingOrder, toLines } from "./parsing/pdf";
import { CITIES, SKILL_LABEL, SKILLS } from "./parsing/taxonomy";
import { compareRank, explainOrder, type Rankable } from "./ranking/order";
import { CONFIDENCE_GATE, screen } from "./ranking/routine";
import { currentCriteria, currentParse, saveParse, screenApplication } from "./screening";
import type { Criteria, Outcome, ParsedResume } from "./types";

const db = openDb();
const app = new Hono().basePath("/api");
app.use(logger());
app.onError((err, c) => {
  if (err instanceof HTTPException) return c.json({ error: err.message }, err.status);
  console.error(err);
  return c.json({ error: "internal error" }, 500);
});

const OUTCOMES: Outcome[] = ["shortlist", "waitlist", "manual_review", "reject"];
const bad = (msg: string) => new HTTPException(400, { message: msg });
const notFound = (what: string) => new HTTPException(404, { message: `${what} not found` });
const intParam = (v: string | undefined, name: string) => {
  const n = Number(v);
  if (!Number.isInteger(n) || n <= 0) throw bad(`${name} must be a positive integer`);
  return n;
};
const json = <T>(s: string | null): T | null => (s ? JSON.parse(s) : null);

function statusCounts(where = "1=1", params: any[] = []) {
  const rows = db.query<{ status: Outcome; n: number }, any[]>(`SELECT status, COUNT(*) n FROM applications WHERE ${where} GROUP BY status`).all(...params);
  const out = Object.fromEntries(OUTCOMES.map((o) => [o, 0])) as Record<Outcome, number>;
  for (const r of rows) out[r.status] = r.n;
  return { ...out, total: rows.reduce((s, r) => s + r.n, 0) };
}

function jobSummary(j: any) {
  const cv = currentCriteria(db, j.id);
  const audit = db.query<any, [number]>("SELECT severity, min_ratio, created_at FROM audits WHERE job_id = ? ORDER BY id DESC LIMIT 1").get(j.id);
  return {
    id: j.id,
    title: j.title,
    department: j.department,
    status: j.status,
    openedAt: j.opened_at,
    autoRejectPaused: !!j.auto_reject_paused,
    pausedReason: j.paused_reason,
    location: cv.criteria.location,
    remoteAllowed: cv.criteria.remoteAllowed,
    criteriaVersion: cv.version,
    counts: statusCounts("job_id = ?", [j.id]),
    latestAudit: audit ? { severity: audit.severity, minRatio: audit.min_ratio, at: audit.created_at } : null,
  };
}

/** All applications of a job in explicit rank order (outcome → score → application time → id). */
function ranked(jobId: number) {
  const rows = db
    .query<any, [number]>(
      `SELECT a.id, a.status outcome, a.score, a.applied_at appliedAt, c.name, p.result parse,
         (SELECT reason FROM decision_log d WHERE d.application_id = a.id ORDER BY d.id DESC LIMIT 1) reason
       FROM applications a JOIN candidates c ON c.id = a.candidate_id
       LEFT JOIN parses p ON p.application_id = a.id AND p.is_current = 1
       WHERE a.job_id = ?`,
    )
    .all(jobId);
  rows.sort((a, b) => compareRank(a as Rankable, b as Rankable));
  return rows.map((r, i) => {
    const p: ParsedResume = JSON.parse(r.parse);
    return {
      rank: i + 1,
      id: r.id,
      name: r.name ?? p.name ?? `Applicant #${r.id}`,
      outcome: r.outcome as Outcome,
      score: r.score as number,
      appliedAt: r.appliedAt as string,
      location: p.location,
      yearsExperience: p.yearsExperience,
      skills: p.skills,
      confidence: p.confidence,
      reason: r.reason as string,
    };
  });
}

// ---------- validation ----------
const SKILL_IDS = new Set(Object.keys(SKILLS));
function validateCriteria(c: any): Criteria {
  if (!c || typeof c !== "object") throw bad("criteria required");
  const { mandatorySkills, bands, threshold, location, remoteAllowed } = c;
  if (!Array.isArray(mandatorySkills) || mandatorySkills.some((s) => !SKILL_IDS.has(s))) throw bad("mandatorySkills must be known skill ids");
  if (!Array.isArray(bands) || !bands.length) throw bad("at least one experience band required");
  const sorted = [...bands].sort((a, b) => a.min - b.min);
  sorted.forEach((b, i) => {
    if (![b.min, b.max, b.score].every((n) => typeof n === "number" && Number.isFinite(n))) throw bad("band values must be numbers");
    if (b.min < 0 || b.max <= b.min) throw bad(`band ${i + 1}: max must be greater than min`);
    if (b.score < 0 || b.score > 100) throw bad(`band ${i + 1}: score must be 0–100`);
    if (i && b.min !== sorted[i - 1].max) throw bad(`bands must be contiguous (gap/overlap at ${b.min} yrs)`);
  });
  if (sorted[0].min !== 0) throw bad("bands must start at 0 years");
  if (typeof threshold !== "number" || threshold < 0 || threshold > 100) throw bad("threshold must be 0–100");
  if (!Object.keys(CITIES).includes(location)) throw bad("location must be a known city");
  if (typeof remoteAllowed !== "boolean") throw bad("remoteAllowed must be boolean");
  return { mandatorySkills: [...new Set(mandatorySkills as string[])], bands: sorted.map(({ min, max, score }) => ({ min, max, score })), threshold, location, remoteAllowed };
}

// ---------- routes ----------
app.get("/health", async (c) => c.json({ ok: true, model: MODEL, ai: await ollamaAvailable(), ocr: await ocrAvailable(), gate: CONFIDENCE_GATE, impactRatioMin: IMPACT_RATIO_MIN, minGroupSize: MIN_GROUP_SIZE }));

app.get("/taxonomy", (c) =>
  c.json({ skills: Object.keys(SKILLS).map((id) => ({ id, label: SKILL_LABEL[id] })), cities: Object.keys(CITIES) }),
);

app.get("/overview", (c) => {
  const series = db
    .query<any, []>(
      `SELECT substr(applied_at, 1, 7) month,
         SUM(status = 'shortlist') shortlist, SUM(status = 'waitlist') waitlist,
         SUM(status = 'reject') reject, SUM(status = 'manual_review') manual_review, COUNT(*) total
       FROM applications GROUP BY month ORDER BY month`,
    )
    .all();
  const recent = db
    .query<any, []>(
      `SELECT d.id, d.application_id applicationId, d.outcome, d.reason, d.actor, d.created_at createdAt, c.name, j.title job
       FROM decision_log d JOIN applications a ON a.id = d.application_id JOIN candidates c ON c.id = a.candidate_id JOIN jobs j ON j.id = a.job_id
       ORDER BY d.id DESC LIMIT 8`,
    )
    .all();
  const company = db.query<any, []>("SELECT * FROM audits WHERE job_id IS NULL ORDER BY period_start DESC LIMIT 1").get();
  const jobs = db.query<any, []>("SELECT * FROM jobs ORDER BY id").all().map(jobSummary);
  return c.json({
    counts: statusCounts(),
    series,
    recent,
    jobs,
    parserEval: json(db.query<{ value: string }, []>("SELECT value FROM meta WHERE key = 'parser_eval'").get()?.value ?? null),
    companyAudit: company && { ...company, results: JSON.parse(company.results) },
    decisions: db.query<{ n: number }, []>("SELECT COUNT(*) n FROM decision_log").get()!.n,
  });
});

app.get("/jobs", (c) => c.json(db.query<any, []>("SELECT * FROM jobs ORDER BY id").all().map(jobSummary)));

app.get("/jobs/:id", (c) => {
  const id = intParam(c.req.param("id"), "job id");
  const j = db.query<any, [number]>("SELECT * FROM jobs WHERE id = ?").get(id);
  if (!j) throw notFound("job");
  const versions = db
    .query<any, [number]>(
      `SELECT v.*, (SELECT COUNT(*) FROM decision_log d WHERE d.criteria_version_id = v.id) decisions
       FROM criteria_versions v WHERE job_id = ? ORDER BY version DESC`,
    )
    .all(id)
    .map((v) => ({ ...v, criteria: JSON.parse(v.criteria) }));
  return c.json({ ...jobSummary(j), criteria: versions[0], versions });
});

app.get("/jobs/:id/applications", (c) => {
  const id = intParam(c.req.param("id"), "job id");
  const status = c.req.query("status");
  const q = (c.req.query("q") ?? "").toLowerCase().trim();
  const page = Math.max(1, Number(c.req.query("page") ?? 1) || 1);
  const size = 25;
  let rows = ranked(id);
  if (status && status !== "all") rows = rows.filter((r) => r.outcome === status);
  if (q) rows = rows.filter((r) => r.name.toLowerCase().includes(q) || String(r.id) === q);
  return c.json({ total: rows.length, page, pageSize: size, rows: rows.slice((page - 1) * size, page * size) });
});

/** Dry-run: what would change (outcomes + fairness) if these criteria were published? */
app.post("/jobs/:id/criteria/preview", async (c) => {
  const id = intParam(c.req.param("id"), "job id");
  const criteria = validateCriteria((await c.req.json().catch(() => null))?.criteria);
  const rows = db
    .query<any, [number]>(
      `SELECT a.id, a.status, p.result, s.gender, s.age_band FROM applications a
       JOIN parses p ON p.application_id = a.id AND p.is_current = 1 LEFT JOIN self_id s ON s.candidate_id = a.candidate_id WHERE a.job_id = ?`,
    )
    .all(id);
  const counts = Object.fromEntries(OUTCOMES.map((o) => [o, 0])) as Record<Outcome, number>;
  const moved: Record<string, number> = {};
  const auditInput = rows.map((r) => {
    const p: ParsedResume = JSON.parse(r.result);
    const d = screen(p, criteria);
    counts[d.outcome]++;
    if (d.outcome !== r.status) moved[`${r.status}→${d.outcome}`] = (moved[`${r.status}→${d.outcome}`] ?? 0) + 1;
    return { outcome: d.outcome, gender: r.gender, age_band: r.age_band, university: p.university };
  });
  return c.json({ counts, current: statusCounts("job_id = ?", [id]), moved, fairness: evaluate(auditInput) });
});

/** Publish a new criteria version: re-screen every application of the job, then audit. */
app.post("/jobs/:id/criteria", async (c) => {
  const id = intParam(c.req.param("id"), "job id");
  const body = await c.req.json().catch(() => null);
  const criteria = validateCriteria(body?.criteria);
  const note = String(body?.note ?? "").trim();
  if (!note) throw bad("a change note is required (it is shown in the audit trail)");
  const author = String(body?.author ?? "recruiter").trim().slice(0, 60) || "recruiter";
  const before = statusCounts("job_id = ?", [id]);
  const at = new Date().toISOString();
  const version = db.transaction(() => {
    const prev = currentCriteria(db, id);
    db.run("INSERT INTO criteria_versions (job_id, version, criteria, note, author, created_at) VALUES (?,?,?,?,?,?)", [
      id, prev.version + 1, JSON.stringify(criteria), note.slice(0, 300), author, at,
    ]);
    // Re-screen every application; reviewer-verified parses (confidence 1) are re-decided on the verified facts.
    for (const { id: appId } of db.query<{ id: number }, [number]>("SELECT id FROM applications WHERE job_id = ?").all(id))
      screenApplication(db, appId, { at });
    return prev.version + 1;
  })();
  const end = at.slice(0, 10);
  const start = new Date(Date.now() - 90 * 864e5).toISOString().slice(0, 10);
  const audit = runAudit(db, { jobId: id, start, end: new Date(Date.now() + 864e5).toISOString().slice(0, 10), trigger: "criteria_change", at });
  return c.json({ version, before, after: statusCounts("job_id = ?", [id]), audit, window: { start, end } });
});

app.get("/applications/:id", (c) => {
  const id = intParam(c.req.param("id"), "application id");
  const a = db
    .query<any, [number]>(
      `SELECT a.*, c.name, c.email, c.phone, j.title job_title FROM applications a
       JOIN candidates c ON c.id = a.candidate_id JOIN jobs j ON j.id = a.job_id WHERE a.id = ?`,
    )
    .get(id);
  if (!a) throw notFound("application");
  const parses = db.query<any, [number]>("SELECT id, parser, result, is_current, created_at FROM parses WHERE application_id = ? ORDER BY id").all(id);
  const decisions = db
    .query<any, [number]>(
      `SELECT d.*, v.version criteria_version FROM decision_log d JOIN criteria_versions v ON v.id = d.criteria_version_id
       WHERE application_id = ? ORDER BY d.id DESC`,
    )
    .all(id)
    .map((d) => ({ ...d, trace: JSON.parse(d.trace) }));
  const list = ranked(a.job_id);
  const cv = db.query<any, [number]>("SELECT * FROM criteria_versions WHERE id = ?").get(a.criteria_version_id);
  return c.json({
    id: a.id,
    jobId: a.job_id,
    jobTitle: a.job_title,
    appliedAt: a.applied_at,
    source: a.source,
    status: a.status,
    score: a.score,
    candidate: { name: a.name, email: a.email, phone: a.phone },
    rank: list.find((r) => r.id === id)?.rank ?? null,
    rankOf: list.length,
    parse: JSON.parse(parses.find((p) => p.is_current)?.result ?? "null"),
    parses: parses.map((p) => ({ id: p.id, parser: p.parser, current: !!p.is_current, createdAt: p.created_at, result: JSON.parse(p.result) })),
    legacy: { outcome: a.legacy_outcome, score: a.legacy_score },
    criteria: cv && { ...cv, criteria: JSON.parse(cv.criteria) },
    decisions,
  });
});

app.get("/applications/:id/resume", async (c) => {
  const id = intParam(c.req.param("id"), "application id");
  const a = db.query<{ resume_file: string }, [number]>("SELECT resume_file FROM applications WHERE id = ?").get(id);
  if (!a) throw notFound("application");
  const file = Bun.file(`${RESUME_DIR}${a.resume_file}`);
  if (!(await file.exists())) throw notFound("résumé file");
  return new Response(file, { headers: { "content-type": "application/pdf", "content-disposition": `inline; filename="application-${id}.pdf"` } });
});

const GENDERS = ["Woman", "Man", "Non-binary", "Prefer not to say"];
const AGE_BANDS = ["18–29", "30–39", "40+", "Prefer not to say"];

app.post("/applications", async (c) => {
  const form = await c.req.parseBody();
  const jobId = intParam(String(form.jobId ?? ""), "jobId");
  if (!db.query("SELECT 1 FROM jobs WHERE id = ?").get(jobId)) throw notFound("job");
  const file = form.file;
  if (!(file instanceof File)) throw bad("file (PDF) is required");
  if (file.size > 5 * 1024 * 1024) throw bad("PDF must be 5 MB or smaller");
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (new TextDecoder().decode(bytes.slice(0, 5)) !== "%PDF-") throw bad("file is not a PDF");
  const gender = GENDERS.includes(String(form.gender)) ? String(form.gender) : "Prefer not to say";
  const ageBand = AGE_BANDS.includes(String(form.ageBand)) ? String(form.ageBand) : "Prefer not to say";

  let layout;
  try {
    layout = await extractLayout(bytes);
  } catch {
    throw bad("could not read this PDF (corrupt or encrypted)");
  }
  const now = new Date();
  const at = now.toISOString();
  const parsed = await parseDocument(bytes, layout, { referenceDate: now });
  const lg = legacyParse(layout, now);
  const cv = currentCriteria(db, jobId);

  const id = db.transaction(() => {
    const cand = db.run("INSERT INTO candidates (name, email, phone, created_at) VALUES (?,?,?,?)", [parsed.name, parsed.email, parsed.phone, at]);
    const candId = Number(cand.lastInsertRowid);
    db.run("INSERT INTO self_id (candidate_id, gender, age_band) VALUES (?,?,?)", [candId, gender, ageBand]);
    const res = db.run(
      "INSERT INTO applications (candidate_id, job_id, resume_file, applied_at, source, legacy_outcome, legacy_score) VALUES (?,?,?,?,?,?,?)",
      [candId, jobId, "pending", at, "upload", legacyOutcome(lg, cv.criteria.mandatorySkills), legacyScore(lg)],
    );
    const appId = Number(res.lastInsertRowid);
    db.run("UPDATE applications SET resume_file = ? WHERE id = ?", [`${appId}.pdf`, appId]);
    saveParse(db, appId, { ...(lg as any), parser: "legacy" }, false, at);
    saveParse(db, appId, parsed, true, at);
    return appId;
  })();
  await Bun.write(`${RESUME_DIR}${id}.pdf`, bytes);
  const decision = screenApplication(db, id, { at });
  return c.json({ id, decision, parse: parsed }, 201);
});

/** Human review: the reviewer confirms/corrects the parsed fields; the same routine then decides. */
app.post("/applications/:id/review", async (c) => {
  const id = intParam(c.req.param("id"), "application id");
  const body = await c.req.json().catch(() => null);
  if (!body) throw bad("JSON body required");
  const reviewer = String(body.reviewer ?? "").trim().slice(0, 60);
  if (!reviewer) throw bad("reviewer name is required");
  const skills = Array.isArray(body.skills) ? [...new Set((body.skills as string[]).filter((s) => SKILL_IDS.has(s)))] : null;
  if (!skills) throw bad("skills must be an array of skill ids");
  const years = body.yearsExperience === null ? null : Number(body.yearsExperience);
  if (years !== null && (!Number.isFinite(years) || years < 0 || years > 60)) throw bad("yearsExperience must be 0–60 or null");
  const location = body.location == null || body.location === "" ? null : String(body.location);
  if (location && !Object.keys(CITIES).includes(location)) throw bad("unknown city");

  const prev = currentParse(db, id);
  const at = new Date().toISOString();
  const verified: ParsedResume = {
    ...prev,
    skills,
    yearsExperience: years,
    location,
    confidence: 1,
    breakdown: { textLayer: prev.breakdown.textLayer, fields: prev.breakdown.fields, anomalies: [] },
    issues: [`Verified by ${reviewer}${body.note ? `: ${String(body.note).slice(0, 200)}` : ""}`],
    parser: "reviewer",
  };
  saveParse(db, id, verified, true, at);
  const decision = screenApplication(db, id, { actor: `reviewer:${reviewer}`, at });
  return c.json({ decision });
});

app.post("/applications/:id/ai-extract", async (c) => {
  const id = intParam(c.req.param("id"), "application id");
  const a = db.query<any, [number]>("SELECT resume_file, applied_at FROM applications WHERE id = ?").get(id);
  if (!a) throw notFound("application");
  if (!(await ollamaAvailable())) throw new HTTPException(503, { message: `local model ${MODEL} is not running — start it with: ollama serve & ollama pull ${MODEL}` });
  const bytes = new Uint8Array(await Bun.file(`${RESUME_DIR}${a.resume_file}`).arrayBuffer());
  const toText = (l: Awaited<ReturnType<typeof extractLayout>>) => toLines(readingOrder(l)).map((x) => x.text).join("\n");
  let text = toText(await extractLayout(bytes));
  if (text.length < 50) text = toText((await ocrLayout(bytes))?.layout ?? { pages: [] }); // scanned: read the OCR text
  if (text.length < 50) throw new HTTPException(422, { message: "no readable text in this PDF, even with OCR — review from the rendered PDF" });
  return c.json(await aiExtract(text, new Date(a.applied_at)));
});

app.get("/review", (c) => {
  const job = c.req.query("job");
  const rows = db
    .query<any, [string | null, string | null]>(
      `SELECT a.id, a.applied_at appliedAt, a.job_id jobId, j.title job, c.name, p.result parse,
         d.reason_code reasonCode, d.reason, d.tentative_outcome tentative
       FROM applications a JOIN jobs j ON j.id = a.job_id JOIN candidates c ON c.id = a.candidate_id
       JOIN parses p ON p.application_id = a.id AND p.is_current = 1
       JOIN decision_log d ON d.id = (SELECT MAX(id) FROM decision_log WHERE application_id = a.id)
       WHERE a.status = 'manual_review' AND (? IS NULL OR a.job_id = ?)
       ORDER BY a.applied_at`,
    )
    .all(job ?? null, job ?? null)
    .map((r) => {
      const p: ParsedResume = JSON.parse(r.parse);
      return { ...r, parse: undefined, name: r.name ?? `Applicant #${r.id}`, confidence: p.confidence, issues: p.issues, textChars: p.textChars };
    });
  const byReason = rows.reduce<Record<string, number>>((m, r) => ((m[r.reasonCode] = (m[r.reasonCode] ?? 0) + 1), m), {});
  return c.json({ total: rows.length, byReason, rows });
});

function decisionQuery(c: any) {
  const where: string[] = [];
  const params: any[] = [];
  for (const [key, col] of [["outcome", "d.outcome"], ["reason", "d.reason_code"], ["job", "d.job_id"]] as const) {
    const v = c.req.query(key);
    if (v && v !== "all") (where.push(`${col} = ?`), params.push(key === "job" ? Number(v) : v));
  }
  const actor = c.req.query("actor");
  if (actor === "system") where.push("d.actor = 'system'");
  if (actor === "human") where.push("d.actor != 'system'");
  return { sql: where.length ? `WHERE ${where.join(" AND ")}` : "", params };
}

const DECISION_SELECT = `SELECT d.id, d.application_id applicationId, d.job_id jobId, j.title job, c.name, d.outcome, d.tentative_outcome tentative,
  d.reason_code reasonCode, d.reason, d.score, v.version criteriaVersion, d.parser, d.confidence, d.actor, d.created_at createdAt
  FROM decision_log d JOIN applications a ON a.id = d.application_id JOIN candidates c ON c.id = a.candidate_id
  JOIN jobs j ON j.id = d.job_id JOIN criteria_versions v ON v.id = d.criteria_version_id`;

app.get("/decisions", (c) => {
  const { sql, params } = decisionQuery(c);
  const page = Math.max(1, Number(c.req.query("page") ?? 1) || 1);
  const size = 50;
  const total = db.query<{ n: number }, any[]>(`SELECT COUNT(*) n FROM decision_log d ${sql}`).get(...params)!.n;
  const rows = db.query<any, any[]>(`${DECISION_SELECT} ${sql} ORDER BY d.id DESC LIMIT ? OFFSET ?`).all(...params, size, (page - 1) * size);
  const reasons = db.query<any, []>("SELECT reason_code code, outcome, COUNT(*) n FROM decision_log GROUP BY reason_code ORDER BY n DESC").all();
  return c.json({ total, page, pageSize: size, rows, reasons });
});

app.get("/decisions.csv", (c) => {
  const { sql, params } = decisionQuery(c);
  const rows = db.query<any, any[]>(`${DECISION_SELECT} ${sql} ORDER BY d.id`).all(...params);
  const cols = ["id", "createdAt", "applicationId", "name", "job", "outcome", "tentative", "reasonCode", "reason", "score", "criteriaVersion", "parser", "confidence", "actor"];
  const esc = (v: any) => (v == null ? "" : /[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v));
  const csv = [cols.join(","), ...rows.map((r) => cols.map((k) => esc(r[k])).join(","))].join("\n");
  return c.body(csv, 200, { "content-type": "text/csv; charset=utf-8", "content-disposition": 'attachment; filename="hiresense-decision-log.csv"' });
});

app.get("/audits", (c) => {
  const job = c.req.query("job");
  const rows = db
    .query<any, []>(`SELECT a.*, j.title job FROM audits a LEFT JOIN jobs j ON j.id = a.job_id ${job === "company" ? "WHERE a.job_id IS NULL" : job ? `WHERE a.job_id = ${intParam(job, "job")}` : ""} ORDER BY a.period_end DESC, a.id DESC`)
    .all()
    .map((a) => ({ ...a, results: JSON.parse(a.results) }));
  return c.json(rows);
});

/** Live fairness over all decided applications (optionally one job), HireSense vs legacy shadow. */
app.get("/fairness", (c) => {
  const job = c.req.query("job");
  const jobId = job && job !== "all" ? intParam(job, "job") : null;
  return c.json({
    jobId,
    current: evaluate(auditRows(db, jobId, "0000", "9999")),
    legacy: evaluate(auditRows(db, jobId, "0000", "9999", true)),
    impactRatioMin: IMPACT_RATIO_MIN,
    minGroupSize: MIN_GROUP_SIZE,
  });
});

app.post("/audits/run", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const jobId = body?.jobId == null ? null : intParam(String(body.jobId), "jobId");
  const now = Date.now();
  const start = new Date(now - 90 * 864e5).toISOString().slice(0, 10);
  const end = new Date(now + 864e5).toISOString().slice(0, 10);
  return c.json(runAudit(db, { jobId, start, end, trigger: "manual" }));
});

app.get("/parsing/eval", (c) => c.json(json(db.query<{ value: string }, []>("SELECT value FROM meta WHERE key = 'parser_eval'").get()?.value ?? null)));

app.get("/compare", (c) => {
  const a = intParam(c.req.query("a"), "a");
  const b = intParam(c.req.query("b"), "b");
  const load = (id: number) => {
    const r = db
      .query<any, [number]>(
        `SELECT a.id, a.job_id jobId, j.title job, a.status outcome, a.score, a.applied_at appliedAt, c.name, p.result parse,
           (SELECT trace FROM decision_log WHERE application_id = a.id ORDER BY id DESC LIMIT 1) trace,
           (SELECT reason FROM decision_log WHERE application_id = a.id ORDER BY id DESC LIMIT 1) reason
         FROM applications a JOIN jobs j ON j.id = a.job_id JOIN candidates c ON c.id = a.candidate_id
         JOIN parses p ON p.application_id = a.id AND p.is_current = 1 WHERE a.id = ?`,
      )
      .get(id);
    if (!r) throw notFound(`application ${id}`);
    const p: ParsedResume = JSON.parse(r.parse);
    const rank = ranked(r.jobId).find((x) => x.id === id)!.rank;
    return { ...r, parse: undefined, rank, trace: JSON.parse(r.trace), skills: p.skills, yearsExperience: p.yearsExperience, location: p.location, confidence: p.confidence, university: p.university };
  };
  const A = load(a);
  const B = load(b);
  return c.json({ a: A, b: B, sameJob: A.jobId === B.jobId, order: explainOrder(A, B) });
});

const port = Number(process.env.PORT ?? 8787);
// idleTimeout: the local model can take longer than Bun's 10 s default to answer.
export default { port, fetch: app.fetch, idleTimeout: 120 };
console.log(`HireSense API → http://localhost:${port}/api`);
