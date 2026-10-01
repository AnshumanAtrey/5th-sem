// Reconstruction of the system being replaced, kept only to run in shadow mode for comparison.
// Its two defects are deliberate: it fails SILENTLY (no confidence, no error) and its opaque
// score rewards university tier.

import { toLines, type PdfLayout } from "../parsing/pdf";
import { matchCity, matchSkills, matchUniversity, UNIVERSITIES } from "../parsing/taxonomy";

export interface LegacyParse {
  skills: string[];
  yearsExperience: number;
  location: string | null;
  university: string | null;
}

const LEGACY_RANGE = /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{4})\s*[-–]\s*(?:(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{4})|present)/gi;
const MONTHS = "janfebmaraprmayjunjulaugsepoctnovdec";
const m = (s: string) => MONTHS.indexOf(s.slice(0, 3).toLowerCase()) / 3;

function block(lines: string[], heading: RegExp): string[] {
  const i = lines.findIndex((l) => heading.test(l));
  if (i < 0) return [];
  const out: string[] = [];
  for (const l of lines.slice(i + 1)) {
    if (/^[A-Z][A-Z &]{3,}$/.test(l)) break; // next ALL-CAPS heading
    out.push(l);
  }
  return out;
}

/** Raw content-stream text, exact headings, one date format. Never reports failure. */
export function legacyParse(layout: PdfLayout, reference: Date): LegacyParse {
  const items = layout.pages.flatMap((p) => p.items);
  const lines = toLines(items).map((l) => l.text);

  const skills = matchSkills(block(lines, /^skills$/i).join(" , "));

  let months = 0;
  for (const mt of block(lines, /^(work )?experience$/i).join("\n").matchAll(LEGACY_RANGE)) {
    const start = +mt[2]! * 12 + m(mt[1]!);
    const end = mt[3] ? +mt[4]! * 12 + m(mt[3]) : reference.getFullYear() * 12 + reference.getMonth();
    months += Math.max(0, end - start);
  }

  return {
    skills,
    yearsExperience: Math.round((months / 12) * 10) / 10,
    location: matchCity(lines.slice(0, 4).join(" ")),
    university: matchUniversity(lines.join(" ")),
  };
}

/** The opaque legacy score recruiters trusted: experience + skill count + a university-tier bonus. */
export function legacyScore(p: LegacyParse): number {
  const tier = p.university ? UNIVERSITIES[p.university] : undefined;
  const tierBonus = tier === 1 ? 30 : tier === 2 ? 12 : 0;
  return Math.round(Math.min(p.yearsExperience, 10) * 6 + p.skills.length * 3 + tierBonus);
}

export const LEGACY_SHORTLIST_SCORE = 60;

export function legacyOutcome(p: LegacyParse, mandatory: string[]): "shortlist" | "waitlist" | "reject" {
  if (mandatory.some((s) => !p.skills.includes(s))) return "reject";
  return legacyScore(p) >= LEGACY_SHORTLIST_SCORE ? "shortlist" : "waitlist";
}
