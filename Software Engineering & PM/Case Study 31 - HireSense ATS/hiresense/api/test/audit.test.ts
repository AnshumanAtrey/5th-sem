// Fairness requirement (SRS FR-FAIR-1): for every declared group with n ≥ 30 in the audit window,
// selection rate ≥ 0.80 × the highest group's selection rate. Plus the append-only decision log.
import { Database } from "bun:sqlite";
import { describe, expect, test } from "bun:test";
import { fairness, IMPACT_RATIO_MIN, MIN_GROUP_SIZE } from "../src/audit/fairness";
import { severityOf } from "../src/audit/service";
import { SCHEMA } from "../src/db";
import { compareRank, explainOrder } from "../src/ranking/order";
import type { Outcome } from "../src/types";

/** n applicants of a group, of whom `selected` were shortlisted. */
const group = (name: string, n: number, selected: number) =>
  Array.from({ length: n }, (_, i) => ({ group: name, outcome: (i < selected ? "shortlist" : "reject") as Outcome }));

describe("4/5ths impact-ratio rule", () => {
  test("ratio exactly 0.80 passes", () => {
    const r = fairness([...group("A", 100, 50), ...group("B", 100, 40)], "gender");
    expect(r.groups.find((g) => g.group === "B")!.impactRatio).toBeCloseTo(0.8);
    expect(r.breached).toBe(false);
  });

  test("ratio 0.78 breaches", () => {
    const r = fairness([...group("A", 100, 50), ...group("B", 100, 39)], "gender");
    expect(r.breached).toBe(true);
    expect(r.minImpactRatio).toBeCloseTo(0.78);
    expect(r.groups.find((g) => g.group === "B")!.breach).toBe(true);
  });

  test(`groups under ${MIN_GROUP_SIZE} are reported but cannot breach`, () => {
    const r = fairness([...group("A", 100, 50), ...group("B", 10, 1)], "gender");
    const b = r.groups.find((g) => g.group === "B")!;
    expect(b.lowSample).toBe(true);
    expect(b.impactRatio).toBeCloseTo(0.2);
    expect(r.breached).toBe(false);
  });

  test("'Prefer not to say' is never compared", () => {
    const r = fairness([...group("A", 100, 50), ...group("Prefer not to say", 100, 5)], "gender");
    expect(r.groups.find((g) => g.group === "Prefer not to say")!.impactRatio).toBeNull();
    expect(r.breached).toBe(false);
  });

  test("applications still in manual review are excluded from rates", () => {
    const rows = [...group("A", 40, 20), ...Array.from({ length: 50 }, () => ({ group: "A", outcome: "manual_review" as Outcome }))];
    const r = fairness(rows, "gender");
    expect(r.decided).toBe(40);
    expect(r.groups[0]!.rate).toBe(0.5);
  });

  test("a small group cannot set the benchmark rate", () => {
    const r = fairness([...group("A", 100, 40), ...group("B", 5, 5)], "gender");
    expect(r.groups.find((g) => g.group === "A")!.impactRatio).toBe(1);
  });

  test("only one comparable group → no ratio (not a vacuous 1.0)", () => {
    const r = fairness([...group("A", 100, 50), ...group("B", 10, 1)], "gender");
    expect(r.minImpactRatio).toBeNull();
  });

  test(`threshold constant is the case-study value`, () => expect(IMPACT_RATIO_MIN).toBe(0.8));
});

describe("breach severity", () => {
  const res = (rows: ReturnType<typeof group>) => [fairness(rows, "gender")];
  test("no breach → pass", () => expect(severityOf(res([...group("A", 100, 50), ...group("B", 100, 45)]))).toBe("pass"));
  test("breach that could be noise (n = 40, ratio 0.75) → warning", () => {
    const r = res([...group("A", 40, 20), ...group("B", 40, 15)]);
    expect(r[0]!.groups.find((g) => g.group === "B")!.significant).toBe(false);
    expect(severityOf(r)).toBe("warning");
  });
  test("significant breach (n = 300, ratio 0.70) → critical", () => {
    const r = res([...group("A", 300, 150), ...group("B", 300, 105)]);
    expect(r[0]!.groups.find((g) => g.group === "B")!.significant).toBe(true);
    expect(severityOf(r)).toBe("critical");
  });
});

describe("rank order is explicit and explainable", () => {
  const a = { id: 412, outcome: "shortlist" as Outcome, score: 85, appliedAt: "2026-05-01" };
  const b = { id: 87, outcome: "shortlist" as Outcome, score: 85, appliedAt: "2025-11-02" };
  test("same outcome and score → earlier application ranks higher", () => {
    expect(compareRank(a, b)).toBeGreaterThan(0);
    expect(explainOrder(a, b)).toMatchObject({ winner: 87, key: "appliedAt" });
  });
  test("higher score wins within the same outcome", () => {
    expect(explainOrder({ ...a, score: 90 }, b)).toMatchObject({ winner: 412, key: "score" });
  });
  test("outcome dominates score", () => {
    expect(explainOrder({ ...a, outcome: "waitlist", score: 99 }, b)).toMatchObject({ winner: 87, key: "outcome" });
  });
});

describe("decision log is append-only", () => {
  const db = new Database(":memory:");
  db.exec(SCHEMA);
  db.run("INSERT INTO jobs (id, title, department, opened_at) VALUES (1, 'x', 'y', 'z')");
  db.run("INSERT INTO candidates (id, created_at) VALUES (1, 'z')");
  db.run("INSERT INTO applications (id, candidate_id, job_id, resume_file, applied_at) VALUES (1, 1, 1, 'f', 'z')");
  db.run(`INSERT INTO decision_log (application_id, job_id, outcome, reason_code, reason, score, criteria_version_id, parser, confidence, trace, actor, created_at)
          VALUES (1, 1, 'reject', 'MISSING_MANDATORY_SKILLS', 'r', 0, 1, 'v2', 0.9, '[]', 'system', 'z')`);
  test("UPDATE is refused", () => expect(() => db.run("UPDATE decision_log SET outcome = 'shortlist'")).toThrow(/append-only/));
  test("DELETE is refused", () => expect(() => db.run("DELETE FROM decision_log")).toThrow(/append-only/));
});
