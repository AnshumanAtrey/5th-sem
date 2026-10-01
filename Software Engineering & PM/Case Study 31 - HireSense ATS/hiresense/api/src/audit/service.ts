import type { DB } from "../db";
import { universityTier } from "../parsing/taxonomy";
import type { Outcome } from "../types";
import { DIMENSIONS, fairness, IMPACT_RATIO_MIN, MIN_GROUP_SIZE, type AuditRow, type Dimension, type FairnessResult } from "./fairness";

export type Severity = "pass" | "warning" | "critical";

interface Row {
  outcome: Outcome;
  gender: string | null;
  age_band: string | null;
  university: string | null;
}

/** Decided applications (current status) in a window, with the audit-only group attributes. */
export function auditRows(db: DB, jobId: number | null, start: string, end: string, legacy = false): Row[] {
  return db
    .query<Row, [number | null, number | null, string, string]>(
      `SELECT ${legacy ? "a.legacy_outcome" : "a.status"} AS outcome, s.gender, s.age_band, json_extract(p.result, '$.university') AS university
       FROM applications a
       LEFT JOIN self_id s ON s.candidate_id = a.candidate_id
       LEFT JOIN parses p ON p.application_id = a.id AND p.is_current = 1
       WHERE (? IS NULL OR a.job_id = ?) AND a.applied_at >= ? AND a.applied_at < ?`,
    )
    .all(jobId, jobId, start, end)
    .filter((r) => r.outcome);
}

export function groupOf(r: Row, d: Dimension): string {
  if (d === "gender") return r.gender ?? "Prefer not to say";
  if (d === "age_band") return r.age_band ?? "Prefer not to say";
  return universityTier(r.university);
}

export function evaluate(rows: Row[]): FairnessResult[] {
  return DIMENSIONS.map((d) => fairness(rows.map((r): AuditRow => ({ outcome: r.outcome, group: groupOf(r, d) })), d));
}

/**
 * Breach response ladder. A breach (ratio < 0.80, n ≥ 30) is always reported. It escalates to
 * critical — pausing automated rejection — only when the gap is also statistically significant;
 * otherwise it is a warning (possibly sampling noise) with closer monitoring.
 */
export function severityOf(results: FairnessResult[]): Severity {
  const breached = results.filter((r) => r.breached);
  if (!breached.length) return "pass";
  return breached.some((r) => r.groups.some((g) => g.breach && g.significant)) ? "critical" : "warning";
}

export function runAudit(
  db: DB,
  { jobId, start, end, trigger, at = new Date().toISOString() }: { jobId: number | null; start: string; end: string; trigger: string; at?: string },
) {
  const results = evaluate(auditRows(db, jobId, start, end));
  const severity = severityOf(results);
  const breachedDims = results.filter((r) => r.breached);
  const minRatio = results.reduce<number | null>((m, r) => (r.minImpactRatio == null ? m : m == null ? r.minImpactRatio : Math.min(m, r.minImpactRatio)), null);

  const which = breachedDims
    .map((r) => `${r.dimension}: ${r.groups.filter((g) => g.breach).map((g) => `${g.group} ${g.impactRatio!.toFixed(3)}${g.significant ? " (significant)" : ""}`).join(", ")}`)
    .join("; ");
  let action = results.every((r) => r.minImpactRatio == null)
    ? `Insufficient sample — fewer than two groups with n ≥ ${MIN_GROUP_SIZE} in any dimension; reported only.`
    : "No action — every comparable declared group at or above the 0.80 impact ratio.";
  if (severity === "warning")
    action = `Warning: ${which}. Not statistically significant yet — incident opened, criteria owner to review within 5 working days, audit frequency raised to weekly.`;
  if (severity === "critical") {
    action = `Critical: ${which}. ${jobId ? "Automated rejection PAUSED for this job — rejections route to human review until a re-audit passes." : "Escalated to Head of Talent; per-job audits triggered."}`;
    if (jobId) db.run("UPDATE jobs SET auto_reject_paused = 1, paused_reason = ? WHERE id = ?", [`audit ${at.slice(0, 10)}: impact ratio below ${IMPACT_RATIO_MIN}`, jobId]);
  }
  if (severity === "pass" && jobId) db.run("UPDATE jobs SET auto_reject_paused = 0, paused_reason = NULL WHERE id = ?", [jobId]);

  const res = db.run(
    `INSERT INTO audits (job_id, period_start, period_end, trigger, results, breached, min_ratio, severity, action, created_at)
     VALUES (?,?,?,?,?,?,?,?,?,?)`,
    [jobId, start, end, trigger, JSON.stringify(results), breachedDims.length ? 1 : 0, minRatio, severity, action, at],
  );
  return { id: Number(res.lastInsertRowid), results, severity, action, minRatio };
}
