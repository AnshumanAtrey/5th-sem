// Application service: loads parse + criteria, runs the pure routine, applies policy, logs.
import type { DB } from "./db";
import { screen } from "./ranking/routine";
import type { Criteria, Decision, ParsedResume } from "./types";

export interface CriteriaVersion {
  id: number;
  version: number;
  criteria: Criteria;
  note: string | null;
  author: string;
  created_at: string;
}

export function currentCriteria(db: DB, jobId: number): CriteriaVersion {
  const row = db
    .query<any, [number]>("SELECT * FROM criteria_versions WHERE job_id = ? ORDER BY version DESC LIMIT 1")
    .get(jobId);
  if (!row) throw new Error(`job ${jobId} has no criteria`);
  return { ...row, criteria: JSON.parse(row.criteria) };
}

export function currentParse(db: DB, appId: number): ParsedResume & { parseId: number } {
  const row = db
    .query<any, [number]>("SELECT id, result FROM parses WHERE application_id = ? AND is_current = 1 ORDER BY id DESC LIMIT 1")
    .get(appId);
  if (!row) throw new Error(`application ${appId} has no parse`);
  return { ...JSON.parse(row.result), parseId: row.id };
}

export function saveParse(db: DB, appId: number, p: ParsedResume, current: boolean, at: string) {
  if (current) db.run("UPDATE parses SET is_current = 0 WHERE application_id = ?", [appId]);
  db.run("INSERT INTO parses (application_id, parser, result, is_current, created_at) VALUES (?, ?, ?, ?, ?)", [
    appId, p.parser, JSON.stringify(p), current ? 1 : 0, at,
  ]);
}

/** Screen one application with the job's current criteria and append the decision to the log. */
export function screenApplication(
  db: DB,
  appId: number,
  { actor = "system", at = new Date().toISOString(), criteria }: { actor?: string; at?: string; criteria?: CriteriaVersion } = {},
): Decision {
  const app = db.query<any, [number]>("SELECT a.id, a.job_id, j.auto_reject_paused, j.paused_reason FROM applications a JOIN jobs j ON j.id = a.job_id WHERE a.id = ?").get(appId);
  if (!app) throw new Error(`application ${appId} not found`);
  const cv = criteria ?? currentCriteria(db, app.job_id);
  const parse = currentParse(db, appId);
  const d = screen(parse, cv.criteria);

  // Policy (outside the specified routine): a critical fairness breach pauses automated rejection.
  if (actor === "system" && app.auto_reject_paused && d.outcome === "reject") {
    d.tentativeOutcome = "reject";
    d.outcome = "manual_review";
    d.reasonCode = "AUTO_REJECT_PAUSED";
    d.reason = `Automated rejection paused for this job (${app.paused_reason ?? "fairness breach"}) — needs human review`;
    d.trace.push({ node: "P1", label: "Policy: auto-rejection paused?", result: true, detail: d.reason });
  }

  db.run(
    `INSERT INTO decision_log (application_id, job_id, outcome, tentative_outcome, reason_code, reason, score,
       criteria_version_id, parser, confidence, trace, actor, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [appId, app.job_id, d.outcome, d.tentativeOutcome, d.reasonCode, d.reason, d.score, cv.id, parse.parser, parse.confidence, JSON.stringify(d.trace), actor, at],
  );
  db.run("UPDATE applications SET status = ?, score = ?, criteria_version_id = ? WHERE id = ?", [d.outcome, d.score, cv.id, appId]);
  return d;
}
