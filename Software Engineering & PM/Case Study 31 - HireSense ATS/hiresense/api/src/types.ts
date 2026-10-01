// Shared domain types. Parsing produces ParsedResume; scoring/ranking consume it
// and never import from parsing/ — changing a ranking rule cannot touch parsing.

export type Outcome = "shortlist" | "waitlist" | "reject" | "manual_review";

/** Experience band: years in [min, max) earn `score`. */
export interface Band {
  min: number;
  max: number;
  score: number;
}

/** Explicit, versioned, per-job ranking criteria (configurable by recruiters). */
export interface Criteria {
  mandatorySkills: string[];
  bands: Band[];
  threshold: number;
  location: string;
  remoteAllowed: boolean;
}

export interface ConfidenceBreakdown {
  textLayer: number; // 0 when the PDF has no extractable text (scanned / outlined)
  fields: Record<string, { weight: number; found: boolean; note?: string }>;
  anomalies?: string[];
}

export interface ParsedResume {
  name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  skills: string[];
  yearsExperience: number | null;
  university: string | null;
  confidence: number; // 0..1, the routine routes < 0.6 to manual review
  breakdown: ConfidenceBreakdown;
  issues: string[];
  textChars: number;
  parser: string;
}

/** One visited node of the screening CFG, kept so every decision is explainable. */
export interface TraceStep {
  node: string;
  label: string;
  result: boolean | number | string;
  detail: string;
}

export interface Decision {
  outcome: Outcome;
  tentativeOutcome: Outcome | null; // set when the confidence gate overrides
  score: number;
  band: Band | null;
  reasonCode: string;
  reason: string;
  missingSkills: string[];
  trace: TraceStep[];
}
