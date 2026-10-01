// The small model only extracts. These tests pin the guardrails around it: deterministic date
// normalisation and grounding (anything not present in the résumé text is dropped).
import { afterEach, describe, expect, mock, test } from "bun:test";
import { aiExtract, toMonths } from "../src/parsing/llm";
import { matchSkills } from "../src/parsing/taxonomy";

const NOW = 2026 * 12 + 2; // Mar 2026

describe("toMonths", () => {
  test.each([
    ["2023-04", 2023 * 12 + 3],
    ["Apr 2023", 2023 * 12 + 3],
    ["April 2023", 2023 * 12 + 3],
    ["Spring 2023", 2023 * 12 + 3],
    ["Winter 2020", 2020 * 12],
    ["2019", 2019 * 12],
    ["present", NOW],
    ["today", NOW],
  ])("%s", (s, m) => expect(toMonths(s, NOW)).toBe(m));
  test("unreadable wording → null", () => expect(toMonths("a while ago", NOW)).toBeNull());
});

describe("grounding", () => {
  const realFetch = globalThis.fetch;
  afterEach(() => void (globalThis.fetch = realFetch));
  const reply = (content: object) =>
    (globalThis.fetch = mock(async () => new Response(JSON.stringify({ message: { content: JSON.stringify(content) } }))) as any);

  const resume = "Priya Nair\nPune, India\nSKILLS\nReact, TypeScript\nEXPERIENCE\nEngineer — Zoho\nSpring 2021 – today";

  test("keeps grounded values and converts season dates", async () => {
    reply({ skills: ["React", "TypeScript"], city: "Pune", positions: [{ title: "Engineer", company: "Zoho", start: "Spring 2021", end: "today" }] });
    const s = await aiExtract(resume, new Date("2026-03-15"));
    expect(s.skills.sort()).toEqual(["react", "typescript"]);
    expect(s.location).toBe("Pune");
    expect(s.yearsExperience).toBeCloseTo(4.9, 1);
    expect(s.dropped).toEqual([]);
  });

  test("a headline or education line is not a job (employer must appear in the résumé)", async () => {
    reply({ skills: [], city: "Pune", positions: [{ title: "Aspiring Engineer", company: "N/A", start: "2021", end: "present" }] });
    const s = await aiExtract(resume, new Date("2026-03-15"));
    expect(s.yearsExperience).toBeNull();
    expect(s.dropped.join(" ")).toMatch(/employer "N\/A" not in résumé/);
  });

  test("drops hallucinated skills, cities and positions", async () => {
    reply({ skills: ["React", "Kubernetes"], city: "Mumbai", positions: [{ title: "CTO", company: "Google", start: "2012-01", end: "2015-01" }] });
    const s = await aiExtract(resume, new Date("2026-03-15"));
    expect(s.skills).toEqual(["react"]);
    expect(s.location).toBeNull(); // résumé says Pune, model said Mumbai
    expect(s.yearsExperience).toBeNull();
    expect(s.dropped.join(" ")).toMatch(/Kubernetes.*not found/);
    expect(s.dropped.join(" ")).toMatch(/CTO.*employer "Google" not in résumé/);
  });
});

test("'Node.js' does not also match JavaScript's 'JS' alias", () => {
  expect(matchSkills("Node.js, Next.js")).toEqual(["next.js", "node.js"]);
  expect(matchSkills("JS, ES6")).toEqual(["javascript"]);
});
