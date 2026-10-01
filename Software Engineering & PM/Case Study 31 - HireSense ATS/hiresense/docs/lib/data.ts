// Every number in the deliverables comes from here: the seeded database, the test run, the code.
import { Database } from "bun:sqlite";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { evaluate, auditRows } from "../../api/src/audit/service";
import type { FairnessResult } from "../../api/src/audit/fairness";
import { screen } from "../../api/src/ranking/routine";

const HS = resolve(import.meta.dir, "../..");
const API = `${HS}/api`;
const db = new Database(`${API}/data/hiresense.db`, { readonly: true });
const q = <T = any>(sql: string, ...p: any[]) => db.query<T, any[]>(sql).all(...p);
const one = <T = any>(sql: string, ...p: any[]) => db.query<T, any[]>(sql).get(...p) as T;

function walk(dir: string, skip: RegExp): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    if (skip.test(p)) return [];
    return statSync(p).isDirectory() ? walk(p, skip) : /\.(ts|tsx)$/.test(f) ? [p] : [];
  });
}
function loc(files: string[]) {
  let code = 0;
  for (const f of files) code += readFileSync(f, "utf8").split("\n").filter((l) => l.trim() && !/^\s*(\/\/|\*|\/\*)/.test(l)).length;
  return { files: files.length, code };
}

export async function collect() {
  // ---- tests + coverage (fresh run) ----
  const junitPath = `${import.meta.dir}/../out/junit.xml`;
  const run = Bun.spawnSync(["bun", "test", "--coverage", "--reporter=junit", `--reporter-outfile=${junitPath}`], { cwd: API, stderr: "pipe", stdout: "pipe" });
  const out = run.stdout.toString() + run.stderr.toString();
  const coverage = [...out.matchAll(/^[ \t]*(src\/\S+|All files)[ \t]*\|[ \t]*([\d.]+)[ \t]*\|[ \t]*([\d.]+)[ \t]*\|[ \t]*(.*)$/gm)].map((m) => ({ file: m[1]!, funcs: +m[2]!, lines: +m[3]!, uncovered: m[4]!.trim() }));
  const xml = readFileSync(junitPath, "utf8");
  const totals = xml.match(/<testsuites[^>]*tests="(\d+)" assertions="(\d+)" failures="(\d+)" skipped="(\d+)" time="([\d.]+)"/)!;
  const cases: { file: string; suite: string; name: string; time: number; failed: boolean; line: number }[] = [];
  let file = "";
  for (const line of xml.split("\n")) {
    const f = line.match(/<testsuite name="(test\/[^"]+)"/);
    if (f) file = f[1]!;
    const c = line.match(/<testcase name="([^"]*)" classname="([^"]*)" time="([\d.]+)"/);
    if (c) cases.push({ file, line: +(line.match(/ line="(\d+)"/)?.[1] ?? 0), suite: c[2]!, name: c[1]!.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/&quot;/g, '"'), time: +c[3]!, failed: !line.trim().endsWith("/>") });
  }
  const tests = { total: +totals[1]!, assertions: +totals[2]!, failures: +totals[3]!, skipped: +totals[4]!, time: +totals[5]!, cases };

  // ---- code size ----
  const skip = /node_modules|components\/ui|\.next|data\//;
  const size = {
    api: loc(walk(`${API}/src`, skip)),
    seed: loc(walk(`${API}/seed`, skip)),
    tests: loc(walk(`${API}/test`, skip)),
    web: loc(walk(`${HS}/web/src`, skip)),
  };

  // ---- data ----
  const counts = Object.fromEntries(q<{ status: string; n: number }>("SELECT status, COUNT(*) n FROM applications GROUP BY status").map((r) => [r.status, r.n]));
  const total = one<{ n: number }>("SELECT COUNT(*) n FROM applications").n;
  const decisions = one<{ n: number }>("SELECT COUNT(*) n FROM decision_log").n;
  const parserEval = JSON.parse(one<{ value: string }>("SELECT value FROM meta WHERE key='parser_eval'").value);
  const jobs = q("SELECT * FROM jobs ORDER BY id").map((j) => {
    const versions = q("SELECT * FROM criteria_versions WHERE job_id = ? ORDER BY version", j.id).map((v) => ({ ...v, criteria: JSON.parse(v.criteria) }));
    const c = Object.fromEntries(q<{ status: string; n: number }>("SELECT status, COUNT(*) n FROM applications WHERE job_id = ? GROUP BY status", j.id).map((r) => [r.status, r.n]));
    const latest = one("SELECT * FROM audits WHERE job_id = ? ORDER BY period_end DESC, id DESC LIMIT 1", j.id);
    return { ...j, versions, counts: c, total: Object.values(c).reduce((a: number, b: any) => a + b, 0), latestAudit: latest && { ...latest, results: JSON.parse(latest.results) } };
  });
  const audits = q("SELECT a.*, j.title job FROM audits a LEFT JOIN jobs j ON j.id = a.job_id ORDER BY a.period_end, a.job_id").map((a) => ({ ...a, results: JSON.parse(a.results) as FairnessResult[] }));
  const fairnessAll = { current: evaluate(auditRows(db as any, null, "0000", "9999")), legacy: evaluate(auditRows(db as any, null, "0000", "9999", true)) };
  const fairnessByJob = Object.fromEntries(jobs.map((j) => [j.id, { current: evaluate(auditRows(db as any, j.id, "0000", "9999")), legacy: evaluate(auditRows(db as any, j.id, "0000", "9999", true)) }]));
  const reasons = q("SELECT reason_code code, outcome, COUNT(*) n FROM decision_log GROUP BY reason_code, outcome ORDER BY n DESC");
  // how often each CFG path was taken across every logged decision
  const paths: Record<string, number> = {};
  for (const r of q<{ trace: string }>("SELECT trace FROM decision_log")) {
    const sig = (JSON.parse(r.trace) as { node: string }[]).map((t) => t.node).filter((n) => /^N\d+$/.test(n)).join("→") + "→N11";
    paths[sig] = (paths[sig] ?? 0) + 1;
  }
  const legacyVsNew = q("SELECT legacy_outcome legacy, status, COUNT(*) n FROM applications GROUP BY 1, 2");
  const reviewByReason = q("SELECT d.reason_code code, COUNT(*) n FROM applications a JOIN decision_log d ON d.id = (SELECT MAX(id) FROM decision_log WHERE application_id = a.id) WHERE a.status = 'manual_review' GROUP BY 1");
  const ocrParses = one<{ n: number }>("SELECT COUNT(*) n FROM parses WHERE is_current = 1 AND parser LIKE '%ocr'").n;
  const selfIdMix = q("SELECT gender, COUNT(*) n FROM self_id GROUP BY 1 ORDER BY n DESC");

  // module dependency graph (static imports between api/src modules)
  const deps: Record<string, string[]> = {};
  for (const f of walk(`${API}/src`, skip)) {
    const rel = f.slice(`${API}/src/`.length);
    const mod = rel.includes("/") ? rel.split("/")[0]! : rel.replace(/\.ts$/, "");
    for (const m of readFileSync(f, "utf8").matchAll(/^import [^;]*? from "(\.{1,2}\/[^"]+)"/gm)) {
      const target = join(f, "..", m[1]!).slice(`${API}/src/`.length);
      const tmod = target.includes("/") ? target.split("/")[0]! : target.replace(/\.ts$/, "");
      if (tmod !== mod) (deps[mod] ??= []).includes(tmod) || deps[mod]!.push(tmod);
    }
  }

  // what-if for the age-proxy finding: Senior Frontend with the 2–4 yr band raised to the threshold
  const j1cv = JSON.parse(one<{ criteria: string }>("SELECT criteria FROM criteria_versions WHERE job_id = 1 ORDER BY version DESC LIMIT 1").criteria);
  const whatIfCriteria = { ...j1cv, bands: j1cv.bands.map((b: any) => (b.min === 2 ? { ...b, score: j1cv.threshold } : b)) };
  const whatIfRows = q("SELECT p.result, s.gender, s.age_band FROM applications a JOIN parses p ON p.application_id = a.id AND p.is_current = 1 LEFT JOIN self_id s ON s.candidate_id = a.candidate_id WHERE a.job_id = 1").map((r) => {
    const parsed = JSON.parse(r.result);
    return { outcome: screen(parsed, whatIfCriteria).outcome, gender: r.gender, age_band: r.age_band, university: parsed.university };
  });
  const whatIf = { criteria: whatIfCriteria, fairness: evaluate(whatIfRows as any) };

  return { whatIf, deps, tests, coverage, size, counts, total, decisions, parserEval, jobs, audits, fairnessAll, fairnessByJob, reasons, paths, legacyVsNew, reviewByReason, ocrParses, selfIdMix };
}
export type Data = Awaited<ReturnType<typeof collect>>;
