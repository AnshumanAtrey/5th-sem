// White-box tests for the screening routine. One test per independent (basis) path of the CFG,
// V(G) = 5, plus boundary and metamorphic tests. Node ids match src/ranking/routine.ts.
import { describe, expect, test } from "bun:test";
import { CONFIDENCE_GATE, screen } from "../src/ranking/routine";
import { criteria, parsed } from "./fixtures";

const path = (d: ReturnType<typeof screen>) => d.trace.map((t) => t.node).join("→");

describe("basis paths (V(G) = 5)", () => {
  test("P1  N1→N2→N9 → N11: mandatory skill missing, confident parse → reject", () => {
    const d = screen(parsed({ skills: ["react"] }), criteria());
    expect(d.outcome).toBe("reject");
    expect(d.reasonCode).toBe("MISSING_MANDATORY_SKILLS");
    expect(d.missingSkills).toEqual(["typescript"]);
    expect(path(d)).toBe("N1→N2→N9");
  });

  test("P2  N1→N3→N4→N5→N9 → N11: score ≥ threshold and location matches → shortlist", () => {
    const d = screen(parsed(), criteria());
    expect(d.outcome).toBe("shortlist");
    expect(d.reasonCode).toBe("SHORTLIST_LOCATION");
    expect(path(d)).toBe("N1→N3→N4→N5→N9");
  });

  test("P3  N1→N3→N4→N6→N7→N9 → N11: score ≥ threshold, elsewhere, remote allowed → shortlist", () => {
    const d = screen(parsed({ location: "Pune" }), criteria());
    expect(d.outcome).toBe("shortlist");
    expect(d.reasonCode).toBe("SHORTLIST_REMOTE");
    expect(path(d)).toBe("N1→N3→N4→N6→N7→N9");
  });

  test("P4  N1→N3→N4→N6→N8→N9 → N11: below threshold → waitlist", () => {
    const d = screen(parsed({ yearsExperience: 3 }), criteria());
    expect(d.outcome).toBe("waitlist");
    expect(d.reasonCode).toBe("WAITLIST_BELOW_THRESHOLD");
    expect(path(d)).toBe("N1→N3→N4→N6→N8→N9");
  });

  test("P5  …→N9→N10 → N11: parse confidence < 0.6 → manual review (the silent-failure path)", () => {
    // A résumé that failed to parse looks like "no skills" — the old system silently rejected it.
    const d = screen(parsed({ skills: [], yearsExperience: null, confidence: 0 }), criteria());
    expect(d.outcome).toBe("manual_review");
    expect(d.tentativeOutcome).toBe("reject");
    expect(d.reasonCode).toBe("LOW_PARSE_CONFIDENCE");
    expect(path(d)).toBe("N1→N2→N9→N10");
  });
});

describe("remaining branch outcomes", () => {
  test("score ≥ threshold, elsewhere, remote NOT allowed → waitlist for location", () => {
    const d = screen(parsed({ location: "Pune" }), criteria({ remoteAllowed: false }));
    expect(d.outcome).toBe("waitlist");
    expect(d.reasonCode).toBe("WAITLIST_LOCATION");
  });

  test("low confidence overrides a shortlist too (automated outcome is only tentative)", () => {
    const d = screen(parsed({ confidence: 0.45 }), criteria());
    expect(d.outcome).toBe("manual_review");
    expect(d.tentativeOutcome).toBe("shortlist");
  });

  test("unknown location never matches the job city", () => {
    const d = screen(parsed({ location: null }), criteria({ remoteAllowed: false }));
    expect(d.outcome).toBe("waitlist");
  });
});

describe("boundary values", () => {
  test("score exactly at threshold is shortlisted (≥, not >)", () => {
    const d = screen(parsed(), criteria({ threshold: 85 }));
    expect(d.score).toBe(85);
    expect(d.outcome).toBe("shortlist");
  });

  test("score one below threshold is waitlisted", () => {
    expect(screen(parsed(), criteria({ threshold: 86 })).outcome).toBe("waitlist");
  });

  test(`confidence exactly ${CONFIDENCE_GATE} is NOT routed to review (< 0.6)`, () => {
    expect(screen(parsed({ confidence: 0.6 }), criteria()).outcome).toBe("shortlist");
  });

  test("confidence 0.59 is routed to review", () => {
    expect(screen(parsed({ confidence: 0.59 }), criteria()).outcome).toBe("manual_review");
  });

  test("band edges: 4.0 yrs falls in [4,7), 3.99 falls in [2,4)", () => {
    expect(screen(parsed({ yearsExperience: 4 }), criteria()).score).toBe(85);
    expect(screen(parsed({ yearsExperience: 3.99 }), criteria()).score).toBe(55);
  });

  test("unparsed experience scores 0", () => {
    expect(screen(parsed({ yearsExperience: null }), criteria()).score).toBe(0);
  });

  test("no mandatory skills configured → nothing can be missing", () => {
    expect(screen(parsed({ skills: [] }), criteria({ mandatorySkills: [] })).outcome).toBe("shortlist");
  });

  test("location match is case-insensitive", () => {
    expect(screen(parsed({ location: "bengaluru" }), criteria({ remoteAllowed: false })).outcome).toBe("shortlist");
  });
});

describe("metamorphic: attributes outside the criteria cannot change a decision", () => {
  const base = parsed();
  const ref = screen(base, criteria());
  for (const university of ["IIT Bombay", "Anna University", null])
    test(`university = ${university}`, () => {
      const d = screen({ ...base, university }, criteria());
      expect(d.outcome).toBe(ref.outcome);
      expect(d.score).toBe(ref.score);
    });

  test("name and email do not affect the decision", () => {
    const d = screen({ ...base, name: "Someone Else", email: null }, criteria());
    expect([d.outcome, d.score]).toEqual([ref.outcome, ref.score]);
  });
});

test("every decision carries a human-readable reason and a trace ending at the confidence gate", () => {
  for (const p of [parsed(), parsed({ skills: [] }), parsed({ location: "Pune" }), parsed({ confidence: 0.1 })]) {
    const d = screen(p, criteria());
    expect(d.reason.length).toBeGreaterThan(10);
    expect(d.trace.some((t) => t.node === "N9")).toBe(true);
  }
});
