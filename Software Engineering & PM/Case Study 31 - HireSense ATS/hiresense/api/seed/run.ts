// `bun run seed` — rebuilds data/ from scratch: jobs, 2,000 synthetic applications with rendered
// résumé PDFs, legacy shadow parse, v2 parse + screening, monthly rolling-window fairness audits, parser eval.
import { mkdirSync, rmSync } from "node:fs";
import { DATA_DIR, openDb, RESUME_DIR } from "../src/db";
import { runAudit } from "../src/audit/service";
import { legacyOutcome, legacyParse, legacyScore } from "../src/legacy/legacy";
import { parseDocument } from "../src/parsing/parser";
import { extractLayout } from "../src/parsing/pdf";
import { saveParse, screenApplication, type CriteriaVersion } from "../src/screening";
import { evaluateParsers } from "./evaluate";
import { JOBS } from "./jobs";
import { ageBand, makeProfile, type CaseType, type Profile } from "./people";
import { renderResume } from "./render";
import { rng } from "./rng";

const t0 = performance.now();
rmSync(`${DATA_DIR}hiresense.db`, { force: true });
rmSync(`${DATA_DIR}hiresense.db-wal`, { force: true });
rmSync(`${DATA_DIR}hiresense.db-shm`, { force: true });
rmSync(RESUME_DIR, { recursive: true, force: true });
mkdirSync(RESUME_DIR, { recursive: true });
const db = openDb();
const r = rng(31); // case study 31

const START = Date.UTC(2025, 9, 1);
const END = Date.UTC(2026, 8, 28);
const OPENED = "2025-09-15T09:00:00.000Z";

// Jobs and criteria versions
const criteriaByJob = new Map<number, CriteriaVersion[]>();
JOBS.forEach((j, i) => {
  const id = i + 1;
  db.run("INSERT INTO jobs (id, title, department, opened_at) VALUES (?, ?, ?, ?)", [id, j.title, j.department, OPENED]);
  const versions = [{ criteria: j.criteria, at: OPENED, note: "Initial criteria agreed with hiring manager" }];
  if (j.revision) versions.push({ criteria: j.revision.criteria, at: `${j.revision.from}T09:00:00.000Z`, note: j.revision.note });
  const list: CriteriaVersion[] = [];
  versions.forEach((v, k) => {
    const res = db.run("INSERT INTO criteria_versions (job_id, version, criteria, note, author, created_at) VALUES (?,?,?,?,?,?)", [
      id, k + 1, JSON.stringify(v.criteria), v.note, "talent-ops", v.at,
    ]);
    list.push({ id: Number(res.lastInsertRowid), version: k + 1, criteria: v.criteria, note: v.note, author: "talent-ops", created_at: v.at });
  });
  criteriaByJob.set(id, list);
});

// Profiles, chronological so application ids follow time
type Pending = Omit<Profile, "caseType"> & { jobId: number };
const pending: Pending[] = [];
JOBS.forEach((j, i) => {
  for (let k = 0; k < j.applications; k++) {
    const at = new Date(START + r.next() * (END - START));
    pending.push({ ...makeProfile(r, j, at), jobId: i + 1 });
  }
});
pending.sort((a, b) => a.appliedAt.getTime() - b.appliedAt.getTime());

// Exactly 29% of résumés use a layout the legacy parser fails on (the case-study figure).
const N = pending.length;
const hard = Math.round(N * 0.29);
const mix: [CaseType, number][] = [["scanned", 0.08], ["two_column", 0.07], ["creative_headings", 0.07]];
const caseOf = new Array<CaseType>(N).fill("standard");
const pool = r.shuffle([...Array(N).keys()]);
let assigned = 0;
for (const [type, share] of mix) {
  for (let k = 0; k < Math.round(N * share); k++) caseOf[pool.pop()!] = type;
  assigned += Math.round(N * share);
}
// odd date formats only break the legacy parser when there is real experience to miss
const oddEligible = pool.filter((i) => pending[i]!.years >= 2);
for (const i of oddEligible.slice(0, hard - assigned)) caseOf[i] = "odd_dates";

// Monthly audits over a rolling 90-day window (enough sample per group for the 4/5ths rule).
const auditDates = ["2026-01-01", "2026-02-01", "2026-03-01", "2026-04-01", "2026-05-01", "2026-06-01", "2026-07-01", "2026-08-01", "2026-09-01"];
const windowStart = (end: string) => {
  const d = new Date(`${end}T00:00:00.000Z`);
  d.setUTCMonth(d.getUTCMonth() - 3);
  return d.toISOString().slice(0, 10);
};
const auditAll = (end: string) => {
  const at = `${end}T06:00:00.000Z`;
  runAudit(db, { jobId: null, start: windowStart(end), end, trigger: "scheduled", at });
  for (let j = 1; j <= JOBS.length; j++) runAudit(db, { jobId: j, start: windowStart(end), end, trigger: "scheduled", at });
};

const insertCand = db.prepare("INSERT INTO candidates (id, name, email, phone, created_at) VALUES (?,?,?,?,?)");
const insertSelf = db.prepare("INSERT INTO self_id (candidate_id, gender, age_band) VALUES (?,?,?)");
const insertApp = db.prepare("INSERT INTO applications (id, candidate_id, job_id, resume_file, applied_at, source, legacy_outcome, legacy_score) VALUES (?,?,?,?,?,?,?,?)");
const insertTruth = db.prepare("INSERT INTO seed_truth (application_id, case_type, truth) VALUES (?,?,?)");

let q = 0;
const rescreened = new Set<number>();
for (let i = 0; i < N; i++) {
  const p: Profile = { ...pending[i]!, caseType: caseOf[i]! };
  const { jobId } = pending[i]!;
  const id = i + 1;
  const at = p.appliedAt.toISOString();

  // Audit boundary: may pause (or resume) automated rejection for a job before later screenings.
  while (q < auditDates.length && at >= auditDates[q]!) auditAll(auditDates[q++]!);

  // Criteria revision published: re-screen the job's existing applications, as the live API does.
  for (const [j, versions] of criteriaByJob)
    for (const v of versions.slice(1))
      if (at >= v.created_at && !rescreened.has(v.id)) {
        rescreened.add(v.id);
        for (const { id: appId } of db.query<{ id: number }, [number]>("SELECT id FROM applications WHERE job_id = ?").all(j))
          screenApplication(db, appId, { at: v.created_at, criteria: v });
      }

  const bytes = await renderResume(p, r);
  await Bun.write(`${RESUME_DIR}${id}.pdf`, bytes);
  const layout = await extractLayout(new Uint8Array(bytes));
  const v2 = await parseDocument(new Uint8Array(bytes), layout, { referenceDate: p.appliedAt });
  const lg = legacyParse(layout, p.appliedAt);

  const versions = criteriaByJob.get(jobId)!;
  const cv = [...versions].reverse().find((v) => v.created_at <= at)!;

  db.transaction(() => {
    insertCand.run(id, p.name, p.email, p.phone, at);
    const withheld = p.gender === "Prefer not to say";
    insertSelf.run(id, p.gender, withheld && r.chance(0.5) ? "Prefer not to say" : ageBand(p.age));
    insertApp.run(id, id, jobId, `${id}.pdf`, at, "seed", legacyOutcome(lg, cv.criteria.mandatorySkills), legacyScore(lg));
    saveParse(db, id, { ...(lg as any), parser: "legacy" }, false, at);
    saveParse(db, id, v2, true, at);
    insertTruth.run(id, p.caseType, JSON.stringify({ skills: p.skills, years: p.years, location: p.city }));
    screenApplication(db, id, { at: new Date(p.appliedAt.getTime() + 3 * 60_000).toISOString(), criteria: cv });
  })();

  if (id % 250 === 0) console.log(`  ${id}/${N} applications`);
}

while (q < auditDates.length) auditAll(auditDates[q++]!);

const evalResult = evaluateParsers(db);
db.run("INSERT OR REPLACE INTO meta (key, value) VALUES ('parser_eval', ?)", [JSON.stringify(evalResult)]);
db.run("INSERT OR REPLACE INTO meta (key, value) VALUES ('seeded_at', ?)", [new Date().toISOString()]);

const counts = db.query("SELECT status, COUNT(*) n FROM applications GROUP BY status").all();
console.log("status:", counts);
console.log("parser eval:", { total: evalResult.total, legacyOk: evalResult.legacyOk, v2Ok: evalResult.v2Ok, v2Detected: evalResult.v2Detected, v2Silent: evalResult.v2Silent, v2FalseAlarm: evalResult.v2FalseAlarm });
console.log("by case:", evalResult.byCase);
console.log(`seeded ${N} applications in ${((performance.now() - t0) / 1000).toFixed(1)}s → ${DATA_DIR}`);
