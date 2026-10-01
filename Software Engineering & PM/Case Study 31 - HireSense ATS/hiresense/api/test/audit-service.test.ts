// Integration: the recurring audit reads decided applications + self-ID, grades the breach and
// applies the response (pause / resume automated rejection) — on an in-memory database.
import { Database } from "bun:sqlite";
import { beforeEach, describe, expect, test } from "bun:test";
import { runAudit } from "../src/audit/service";
import { SCHEMA, type DB } from "../src/db";
import { saveParse, screenApplication } from "../src/screening";
import { criteria, parsed } from "./fixtures";

let db: DB;
let next = 1;
const AT = "2026-06-15T10:00:00.000Z";

function seedJob() {
  db = new Database(":memory:", { strict: true }) as DB;
  db.exec(SCHEMA);
  db.run("INSERT INTO jobs (id, title, department, opened_at) VALUES (1, 'Frontend', 'Eng', ?)", [AT]);
  db.run("INSERT INTO criteria_versions (job_id, version, criteria, author, created_at) VALUES (1, 1, ?, 't', ?)", [JSON.stringify(criteria()), AT]);
  next = 1;
}

/** n applicants of a gender; the first `selected` are qualified (shortlisted), the rest lack TypeScript (rejected). */
function applicants(gender: string, n: number, selected: number) {
  for (let i = 0; i < n; i++) {
    const id = next++;
    db.run("INSERT INTO candidates (id, created_at) VALUES (?, ?)", [id, AT]);
    db.run("INSERT INTO self_id (candidate_id, gender, age_band) VALUES (?, ?, '30–39')", [id, gender]);
    db.run("INSERT INTO applications (id, candidate_id, job_id, resume_file, applied_at) VALUES (?, ?, 1, 'x.pdf', ?)", [id, id, AT]);
    saveParse(db, id, parsed(i < selected ? {} : { skills: ["react"] }), true, AT);
    screenApplication(db, id, { at: AT });
  }
}

const audit = () => runAudit(db, { jobId: 1, start: "2026-06-01", end: "2026-07-01", trigger: "manual", at: AT });
const paused = () => db.query<{ p: number }, []>("SELECT auto_reject_paused p FROM jobs WHERE id = 1").get()!.p;

describe("runAudit", () => {
  beforeEach(seedJob);

  test("fair outcomes → pass, automated rejection stays on", () => {
    applicants("Woman", 60, 30);
    applicants("Man", 60, 30);
    const r = audit();
    expect(r.severity).toBe("pass");
    expect(paused()).toBe(0);
  });

  test("significant breach → critical, auto-reject paused, later rejections routed to review", () => {
    applicants("Woman", 200, 60); // 30%
    applicants("Man", 200, 120); // 60% → ratio 0.5
    const r = audit();
    expect(r.severity).toBe("critical");
    expect(r.action).toMatch(/PAUSED/);
    expect(paused()).toBe(1);

    applicants("Man", 1, 0); // would be an automated rejection
    const last = db.query<{ outcome: string; reason_code: string }, []>("SELECT outcome, reason_code FROM decision_log ORDER BY id DESC LIMIT 1").get()!;
    expect(last).toEqual({ outcome: "manual_review", reason_code: "AUTO_REJECT_PAUSED" });
  });

  test("small-sample breach → warning, not paused", () => {
    applicants("Woman", 35, 10);
    applicants("Man", 35, 17);
    const r = audit();
    expect(r.severity).toBe("warning");
    expect(paused()).toBe(0);
  });

  test("a passing re-audit resumes automated rejection", () => {
    db.run("UPDATE jobs SET auto_reject_paused = 1, paused_reason = 'earlier breach' WHERE id = 1");
    applicants("Woman", 60, 30);
    applicants("Man", 60, 30);
    expect(audit().severity).toBe("pass");
    expect(paused()).toBe(0);
  });

  test("no comparable groups → reported as insufficient sample", () => {
    applicants("Woman", 10, 5);
    expect(audit().action).toMatch(/Insufficient sample/);
  });
});
