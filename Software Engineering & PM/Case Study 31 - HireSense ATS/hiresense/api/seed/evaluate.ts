// Parser accuracy against seed ground truth: legacy (silent) vs v2 (confidence-gated).
import type { DB } from "../src/db";
import { CONFIDENCE_GATE } from "../src/ranking/routine";

export interface Truth {
  skills: string[];
  years: number;
  location: string;
}
interface Pred {
  skills: string[];
  yearsExperience: number | null;
  location: string | null;
}

export function fieldCheck(pred: Pred, t: Truth) {
  const tp = pred.skills.filter((s) => t.skills.includes(s)).length;
  const precision = pred.skills.length ? tp / pred.skills.length : 0;
  const recall = t.skills.length ? tp / t.skills.length : 1;
  const f1 = precision + recall ? (2 * precision * recall) / (precision + recall) : 0;
  const skills = f1 >= 0.8;
  const years = Math.abs((pred.yearsExperience ?? 0) - t.years) <= 1;
  const location = pred.location === t.location;
  return { skills, years, location, ok: skills && years && location };
}

type Tally = { total: number; legacyOk: number; v2Ok: number; v2Detected: number; v2Silent: number; v2FalseAlarm: number };
const blank = (): Tally => ({ total: 0, legacyOk: 0, v2Ok: 0, v2Detected: 0, v2Silent: 0, v2FalseAlarm: 0 });

export function evaluateParsers(db: DB) {
  const rows = db
    .query<{ case_type: string; truth: string; v2: string; legacy: string }, []>(
      `SELECT t.case_type, t.truth,
         (SELECT result FROM parses WHERE application_id = t.application_id AND parser LIKE 'v2%' ORDER BY id DESC LIMIT 1) AS v2,
         (SELECT result FROM parses WHERE application_id = t.application_id AND parser = 'legacy' ORDER BY id DESC LIMIT 1) AS legacy
       FROM seed_truth t`,
    )
    .all();

  const all = blank();
  const byCase: Record<string, Tally> = {};
  const fieldFailures = { legacy: { skills: 0, years: 0, location: 0 }, v2: { skills: 0, years: 0, location: 0 } };
  for (const r of rows) {
    const t: Truth = JSON.parse(r.truth);
    const v2 = JSON.parse(r.v2);
    const lg = JSON.parse(r.legacy);
    const cl = fieldCheck(lg, t);
    const cv = fieldCheck(v2, t);
    const flagged = v2.confidence < CONFIDENCE_GATE;
    for (const k of ["skills", "years", "location"] as const) {
      if (!cl[k]) fieldFailures.legacy[k]++;
      if (!cv[k]) fieldFailures.v2[k]++;
    }
    for (const x of [all, (byCase[r.case_type] ??= blank())]) {
      x.total++;
      if (cl.ok) x.legacyOk++;
      if (cv.ok) x.v2Ok++;
      if (!cv.ok && flagged) x.v2Detected++;
      if (!cv.ok && !flagged) x.v2Silent++;
      if (cv.ok && flagged) x.v2FalseAlarm++;
    }
  }
  return { evaluatedAt: new Date().toISOString(), gate: CONFIDENCE_GATE, ...all, byCase, fieldFailures };
}

if (import.meta.main) {
  const { openDb } = await import("../src/db");
  const db = openDb();
  const r = evaluateParsers(db);
  db.run("INSERT OR REPLACE INTO meta (key, value) VALUES ('parser_eval', ?)", [JSON.stringify(r)]);
  console.log(JSON.stringify(r, null, 2));
}
