import type { ConfidenceBreakdown, ParsedResume } from "../types";
import { findRanges, totalYears } from "./dates";
import { OCR_ENGINE, ocrLayout } from "./ocr";
import { extractLayout, readingOrder, toLines, type PdfLayout } from "./pdf";
import { matchCity, matchSkills, matchUniversity } from "./taxonomy";

export const PARSER_VERSION = "v2.2";

/** Below this many characters the PDF has no usable text layer (scanned / outlined). */
export const MIN_TEXT_CHARS = 200;

/** Confidence ceiling when a section is present but unreadable. */
export const ANOMALY_CAP = 0.5;

/** Confidence weights of the decision-relevant fields (sum = 1). */
export const WEIGHTS = { name: 0.1, email: 0.15, skills: 0.3, experience: 0.3, location: 0.15 } as const;

const HEADINGS: Record<string, string[]> = {
  skills: ["skills", "technical skills", "key skills", "core skills", "skills & tools", "toolbox", "my toolbox", "tech stack", "technologies", "tools & technologies", "core competencies", "what i work with", "expertise"],
  experience: ["experience", "work experience", "professional experience", "employment history", "work history", "career history", "where i've worked", "where i’ve worked", "journey", "my journey", "career"],
  education: ["education", "academic background", "academics", "qualifications", "education & training"],
  other: ["summary", "profile", "about", "about me", "objective", "projects", "certifications", "languages", "interests", "contact", "achievements"],
};
const HEADING_OF = new Map(Object.entries(HEADINGS).flatMap(([k, v]) => v.map((h) => [h, k] as const)));

type Section = "header" | "skills" | "experience" | "education" | "other";

function headingOf(line: string): Section | null {
  // letter-spaced headings extract as "S K I L L S"; collapse single-letter runs first
  const collapsed = /^(?:\S ){2,}\S$/.test(line.trim()) ? line.replace(/ /g, "") : line;
  const key = collapsed.toLowerCase().replace(/[:•|]/g, "").trim();
  return (HEADING_OF.get(key) as Section | undefined) ?? null;
}

export interface ParseOptions {
  referenceDate: Date; // "Present" in a date range resolves to this (the application date)
  /** Set when the layout came from OCR; its mean word confidence becomes the text-layer factor. */
  ocr?: { engine: string; meanConfidence: number };
}

export async function parseResume(bytes: Uint8Array, opts: ParseOptions): Promise<ParsedResume> {
  return parseDocument(bytes, await extractLayout(bytes), opts);
}

/** Parse the PDF's own text; if it has no usable text layer, fall back to OCR when available. */
export async function parseDocument(bytes: Uint8Array, layout: PdfLayout, opts: ParseOptions): Promise<ParsedResume> {
  const parsed = parseLayout(layout, opts);
  if (parsed.textChars >= MIN_TEXT_CHARS) return parsed;
  const ocr = await ocrLayout(bytes);
  if (!ocr) return parsed;
  return parseLayout(ocr.layout, { ...opts, ocr: { engine: OCR_ENGINE, meanConfidence: ocr.meanConfidence } });
}

export function parseLayout(layout: PdfLayout, { referenceDate, ocr }: ParseOptions): ParsedResume {
  const parser = ocr ? `${PARSER_VERSION}+ocr` : PARSER_VERSION;
  const textLayer = ocr ? Math.round(ocr.meanConfidence * 100) / 100 : 1;
  const ordered = readingOrder(layout);
  const lines = toLines(ordered);
  const textChars = lines.reduce((n, l) => n + l.text.length, 0);
  const issues: string[] = [];

  const fields: ConfidenceBreakdown["fields"] = {
    name: { weight: WEIGHTS.name, found: false },
    email: { weight: WEIGHTS.email, found: false },
    skills: { weight: WEIGHTS.skills, found: false },
    experience: { weight: WEIGHTS.experience, found: false },
    location: { weight: WEIGHTS.location, found: false },
  };

  if (textChars < MIN_TEXT_CHARS) {
    issues.push(
      ocr
        ? `OCR recovered only ${textChars} characters — unreadable scan`
        : `No usable text layer (${textChars} characters) — scanned image or outlined text`,
    );
    return {
      name: null, email: null, phone: null, location: null, skills: [], yearsExperience: null, university: null,
      confidence: 0, breakdown: { textLayer: 0, fields }, issues, textChars, parser,
    };
  }
  if (ocr) issues.push(`No text layer — text recovered by OCR (${ocr.engine}, mean word confidence ${textLayer.toFixed(2)})`);

  // Split lines into sections by recognised headings.
  const sections: Record<Section, string[]> = { header: [], skills: [], experience: [], education: [], other: [] };
  let current: Section = "header";
  const seen = new Set<Section>();
  for (const l of lines) {
    const h = headingOf(l.text);
    if (h) {
      current = h;
      seen.add(h);
      continue;
    }
    sections[current].push(l.text);
  }
  const all = lines.map((l) => l.text).join("\n");

  // Name: the largest text near the top of page 1.
  const first = layout.pages[0]?.items ?? [];
  const tallest = [...first].sort((a, b) => b.h - a.h || b.y - a.y)[0];
  const name = tallest && /^[A-Za-z .'-]{3,40}$/.test(tallest.str.trim()) ? tallest.str.trim() : null;
  fields.name!.found = !!name;

  const email = all.match(/[\w.+-]+@[\w-]+\.[\w.]+/)?.[0] ?? null;
  fields.email!.found = !!email;
  const phone = all.match(/(?:\+91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}/)?.[0] ?? null;

  // Location: header/contact lines first, then anywhere outside experience/education.
  const location = matchCity(sections.header.join(" ")) ?? matchCity(sections.other.join(" ")) ?? matchCity(sections.skills.join(" "));
  fields.location!.found = !!location;
  if (!location) issues.push("No city found in header or contact details");

  // Skills: a recognised skills section is full credit; matches elsewhere are half credit.
  let skills = matchSkills(sections.skills.join(" , "));
  if (skills.length) fields.skills!.found = true;
  else {
    skills = matchSkills([...sections.header, ...sections.other, ...sections.experience].join(" , "));
    if (skills.length) {
      fields.skills!.weight = WEIGHTS.skills / 2;
      fields.skills!.found = true;
      fields.skills!.note = "no skills section; matched in body text (half credit)";
      issues.push("No skills section heading recognised — skills inferred from body text");
    } else issues.push("No skills recognised");
  }

  // Experience: date ranges in the experience section; elsewhere (excluding education) is half credit.
  let ranges = findRanges(sections.experience.join("\n"), referenceDate);
  if (ranges.length) fields.experience!.found = true;
  else {
    // education years ("2014 – 2018") are never employment, so that section stays excluded
    ranges = findRanges([...sections.header, ...sections.other, ...sections.skills].join("\n"), referenceDate);
    if (ranges.length) {
      fields.experience!.weight = WEIGHTS.experience / 2;
      fields.experience!.found = true;
      fields.experience!.note = seen.has("experience") ? "dates outside experience section (half credit)" : "no experience heading (half credit)";
      issues.push("Experience dates found outside a recognised experience section");
    } else issues.push("No employment date ranges parsed");
  }
  const yearsExperience = ranges.length ? totalYears(ranges) : null;

  const university = matchUniversity(sections.education.join(" ")) ?? matchUniversity(all);

  let confidence = Math.round(textLayer * Object.values(fields).reduce((s, f) => s + (f.found ? f.weight : 0), 0) * 100) / 100;

  // Anomaly cap: a section that has content but yielded nothing means the parser is failing on
  // this document — never let that pass the gate silently.
  const anomalies: string[] = [];
  if (sections.experience.length >= 2 && !ranges.length) anomalies.push("Experience section has content but no dates could be read");
  if (sections.skills.length >= 1 && !matchSkills(sections.skills.join(" , ")).length) anomalies.push("Skills section has content but no known skills matched");
  if (anomalies.length) {
    confidence = Math.min(confidence, ANOMALY_CAP);
    issues.push(...anomalies.map((a) => `${a} — confidence capped at ${ANOMALY_CAP}`));
  }

  return {
    name, email, phone, location, skills, yearsExperience, university,
    confidence, breakdown: { textLayer, fields, anomalies }, issues, textChars, parser,
  };
}
