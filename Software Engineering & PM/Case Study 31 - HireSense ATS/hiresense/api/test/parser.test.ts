// Parser tests on real PDFs rendered by the seed templates — including the silent-failure
// defect of the legacy system and how v2 turns it into a routed, explained manual review.
import { describe, expect, test } from "bun:test";
import { legacyOutcome, legacyParse } from "../src/legacy/legacy";
import { findRanges, totalYears } from "../src/parsing/dates";
import { ANOMALY_CAP, MIN_TEXT_CHARS, parseLayout } from "../src/parsing/parser";
import { extractLayout, type PdfLayout } from "../src/parsing/pdf";
import { screen } from "../src/ranking/routine";
import { renderResume } from "../seed/render";
import { rng } from "../seed/rng";
import { criteria, profile } from "./fixtures";
import type { CaseType } from "../seed/people";

const layoutOf = async (caseType: CaseType, over = {}): Promise<PdfLayout> =>
  extractLayout(new Uint8Array(await renderResume(profile({ caseType, ...over }), rng(1))));
const ref = new Date("2026-03-15T10:00:00Z");
const job = criteria({ location: "Pune" });

describe("standard résumé", () => {
  test("v2 extracts every decision field with full confidence", async () => {
    const p = parseLayout(await layoutOf("standard"), { referenceDate: ref });
    expect(p.name).toBe("Ananya Iyer");
    expect(p.email).toBe("ananya.iyer@example.com");
    expect(p.location).toBe("Pune");
    expect(p.skills.sort()).toEqual(["css", "react", "redux", "typescript"]);
    expect(p.yearsExperience).toBeCloseTo(6.4, 0);
    expect(p.university).toBe("PES University");
    expect(p.confidence).toBe(1);
  });

  test("legacy parser also handles the standard layout", async () => {
    const l = legacyParse(await layoutOf("standard"), ref);
    expect(l.skills.sort()).toEqual(["css", "react", "redux", "typescript"]);
    expect(l.location).toBe("Pune");
  });
});

describe("silent parse failure — the current system's real defect", () => {
  test("scanned/outlined PDF: legacy silently REJECTS a qualified candidate", async () => {
    const layout = await layoutOf("scanned");
    const l = legacyParse(layout, ref);
    expect(l.skills).toEqual([]); // nothing extracted, and nothing reported
    expect(legacyOutcome(l, job.mandatorySkills)).toBe("reject");
  });

  test("scanned/outlined PDF: v2 detects it (confidence 0) and routes to manual review", async () => {
    const p = parseLayout(await layoutOf("scanned"), { referenceDate: ref });
    expect(p.textChars).toBeLessThan(MIN_TEXT_CHARS);
    expect(p.confidence).toBe(0);
    expect(p.issues[0]).toMatch(/no usable text layer/i);
    const d = screen(p, job);
    expect(d.outcome).toBe("manual_review");
    expect(d.tentativeOutcome).toBe("reject");
  });

  test("unreadable season dates cap confidence below the gate instead of scoring 0 years silently", async () => {
    const layout = extractLayout(
      new Uint8Array(await renderResume(profile({ caseType: "odd_dates" }), { ...rng(3), weighted: () => "seasons" } as any)),
    );
    const p = parseLayout(await layout, { referenceDate: ref });
    expect(p.yearsExperience).toBeNull();
    expect(p.confidence).toBeLessThanOrEqual(ANOMALY_CAP);
    expect(screen(p, job).outcome).toBe("manual_review");
  });
});

describe("layouts the legacy parser gets wrong", () => {
  test("two-column: v2 reads columns separately", async () => {
    const layout = await layoutOf("two_column");
    const p = parseLayout(layout, { referenceDate: ref });
    expect(p.skills.sort()).toEqual(["css", "react", "redux", "typescript"]);
    expect(p.location).toBe("Pune");
    expect(p.yearsExperience).toBeCloseTo(6.4, 0);
    expect(legacyParse(layout, ref).skills).toEqual([]);
  });

  test("creative headings: v2 knows 'Toolbox' / 'Where I've Worked'; legacy does not", async () => {
    const layout = await layoutOf("creative_headings");
    const p = parseLayout(layout, { referenceDate: ref });
    expect(p.skills.sort()).toEqual(["css", "react", "redux", "typescript"]);
    expect(p.yearsExperience).toBeCloseTo(6.4, 0);
    expect(legacyParse(layout, ref).skills).toEqual([]);
  });
});

describe("date ranges", () => {
  const years = (s: string) => totalYears(findRanges(s, new Date("2026-01-15")));
  test.each([
    ["Jan 2019 – Jan 2022", 3],
    ["January 2020 - Present", 6],
    ["03/2019 – 03/2021", 2],
    ["2019/03 -> now", 6.8],
    ["’18 – ’22", 4],
    ["Since Jan 2024", 2],
    ["03.2017 - 03.2020", 3],
    ["2016 – 2019", 3],
    ["Mar 2019 − Mar 2022", 3], // U+2212 minus, as OCR emits
    ["Jul2022-Jan2024", 1.5], // OCR dropped the spaces
  ])("%s → %d yrs", (s, y) => expect(years(s)).toBeCloseTo(y, 1));

  test("overlapping jobs are not double counted", () => {
    expect(years("Jan 2019 – Jan 2021\nJan 2020 – Jan 2022")).toBe(3);
  });

  test("future and inverted ranges are ignored", () => {
    expect(years("Jan 2027 – Jan 2028\nMar 2022 – Jan 2020")).toBe(0);
  });
});

test("letter-spaced headings ('S K I L L S') are still recognised", () => {
  const item = (str: string, y: number, x = 50) => ({ str, x, y, w: str.length * 5, h: 10, page: 1 });
  const layout: PdfLayout = {
    pages: [{ width: 595, height: 842, items: [
      item("Kiran Rao", 800), item("Pune, India · kiran@example.com", 780), item("S K I L L S", 740),
      item("React, TypeScript, Redux, CSS, HTML, Git and a long line of filler text to pass the text-layer floor", 725),
      item("E X P E R I E N C E", 700), item("Engineer — Zoho", 685), item("Jan 2020 – Jan 2024", 670),
      item("Built React features used by many users across India and abroad with a lot of care and tests", 655),
    ] }],
  };
  const p = parseLayout(layout, { referenceDate: ref });
  expect(p.skills).toContain("react");
  expect(p.breakdown.fields.skills!.note).toBeUndefined(); // found in a real skills section
  expect(p.yearsExperience).toBe(4);
});

describe("OCR fallback (scanned PDFs)", async () => {
  const { ocrAvailable } = await import("../src/parsing/ocr");
  const { parseDocument } = await import("../src/parsing/parser");
  const available = await ocrAvailable();

  test.skipIf(!available)("recovers the text of a scanned résumé and passes the gate", async () => {
    const bytes = new Uint8Array(await renderResume(profile({ caseType: "scanned" }), rng(1)));
    const p = await parseDocument(bytes, await extractLayout(bytes), { referenceDate: ref });
    expect(p.parser).toEndWith("+ocr");
    expect(p.skills.sort()).toEqual(["css", "react", "redux", "typescript"]);
    expect(p.yearsExperience).toBeCloseTo(6.4, 0);
    expect(p.location).toBe("Pune");
    expect(p.breakdown.textLayer).toBeGreaterThan(0.9); // mean OCR word confidence scales the result
    expect(p.confidence).toBeLessThanOrEqual(p.breakdown.textLayer);
    expect(screen(p, job).outcome).not.toBe("manual_review");
  }, 30_000);
});
