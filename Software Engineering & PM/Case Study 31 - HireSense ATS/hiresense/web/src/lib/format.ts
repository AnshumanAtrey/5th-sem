import type { Outcome } from "./api";

export const OUTCOME_LABEL: Record<Outcome, string> = {
  shortlist: "Shortlisted",
  waitlist: "Waitlisted",
  reject: "Rejected",
  manual_review: "Manual review",
};

export const REASON_LABEL: Record<string, string> = {
  MISSING_MANDATORY_SKILLS: "Missing mandatory skills",
  SHORTLIST_LOCATION: "Meets threshold · on-site",
  SHORTLIST_REMOTE: "Meets threshold · remote",
  WAITLIST_BELOW_THRESHOLD: "Below score threshold",
  WAITLIST_LOCATION: "Location, remote not allowed",
  LOW_PARSE_CONFIDENCE: "Low parse confidence",
  AUTO_REJECT_PAUSED: "Auto-reject paused (fairness)",
};

export const DIMENSION_LABEL: Record<string, string> = {
  gender: "Gender (self-declared)",
  age_band: "Age band (self-declared)",
  university_tier: "University tier (derived)",
};


export const pct = (x: number | null | undefined, digits = 0) => (x == null ? "—" : `${(x * 100).toFixed(digits)}%`);
export const num = (x: number) => x.toLocaleString("en-IN");
export const ratio = (x: number | null | undefined) => (x == null ? "—" : x.toFixed(2));

export function date(iso: string, withTime = false) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
}

export const month = (ym: string) => new Date(`${ym}-01T00:00:00Z`).toLocaleDateString("en-IN", { month: "short", year: "2-digit" });

export const band = (b: { min: number; max: number }) => (b.max >= 99 ? `${b.min}+ yrs` : `${b.min}–${b.max} yrs`);
