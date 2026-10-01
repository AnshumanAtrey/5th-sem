// Typed access to the Bun API. Server components call it directly; the browser goes through
// the /api rewrite in next.config.ts.
export const API_URL = process.env.API_URL ?? "http://localhost:8787";

export type Outcome = "shortlist" | "waitlist" | "reject" | "manual_review";
export type Severity = "pass" | "warning" | "critical";
export type Counts = Record<Outcome, number> & { total: number };

export interface Band { min: number; max: number; score: number }
export interface Criteria { mandatorySkills: string[]; bands: Band[]; threshold: number; location: string; remoteAllowed: boolean }
export interface TraceStep { node: string; label: string; result: boolean | number | string; detail: string }

export interface Parsed {
  name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  skills: string[];
  yearsExperience: number | null;
  university: string | null;
  confidence: number;
  breakdown: { textLayer: number; fields: Record<string, { weight: number; found: boolean; note?: string }>; anomalies?: string[] };
  issues: string[];
  textChars: number;
  parser: string;
}

export interface JobSummary {
  id: number;
  title: string;
  department: string;
  status: string;
  openedAt: string;
  autoRejectPaused: boolean;
  pausedReason: string | null;
  location: string;
  remoteAllowed: boolean;
  criteriaVersion: number;
  counts: Counts;
  latestAudit: { severity: Severity; minRatio: number | null; at: string } | null;
}

export interface CriteriaVersion { id: number; version: number; criteria: Criteria; note: string | null; author: string; created_at: string; decisions?: number }

export interface GroupResult { group: string; applicants: number; selected: number; rate: number; impactRatio: number | null; lowSample: boolean; breach: boolean; z: number | null; significant: boolean }
export interface FairnessResult { dimension: "gender" | "age_band" | "university_tier"; groups: GroupResult[]; minImpactRatio: number | null; breached: boolean; decided: number }

export interface Audit {
  id: number;
  job_id: number | null;
  job: string | null;
  period_start: string;
  period_end: string;
  trigger: string;
  results: FairnessResult[];
  breached: number;
  min_ratio: number | null;
  severity: Severity;
  action: string;
  created_at: string;
}

export interface Tally { total: number; legacyOk: number; v2Ok: number; v2Detected: number; v2Silent: number; v2FalseAlarm: number }
export interface ParserEval extends Tally {
  evaluatedAt: string;
  gate: number;
  byCase: Record<string, Tally>;
  fieldFailures: Record<"legacy" | "v2", Record<"skills" | "years" | "location", number>>;
}

export interface RankedRow {
  rank: number;
  id: number;
  name: string;
  outcome: Outcome;
  score: number;
  appliedAt: string;
  location: string | null;
  yearsExperience: number | null;
  skills: string[];
  confidence: number;
  reason: string;
}

export interface DecisionRow {
  id: number;
  applicationId: number;
  jobId: number;
  job: string;
  name: string | null;
  outcome: Outcome;
  tentative: Outcome | null;
  reasonCode: string;
  reason: string;
  score: number;
  criteriaVersion: number;
  parser: string;
  confidence: number;
  actor: string;
  createdAt: string;
}

export interface ApplicationDetail {
  id: number;
  jobId: number;
  jobTitle: string;
  appliedAt: string;
  source: string;
  status: Outcome;
  score: number;
  candidate: { name: string | null; email: string | null; phone: string | null };
  rank: number | null;
  rankOf: number;
  parse: Parsed;
  parses: { id: number; parser: string; current: boolean; createdAt: string; result: unknown }[];
  legacy: { outcome: Outcome; score: number };
  criteria: CriteriaVersion;
  decisions: {
    id: number;
    outcome: Outcome;
    tentative_outcome: Outcome | null;
    reason_code: string;
    reason: string;
    score: number;
    criteria_version: number;
    parser: string;
    confidence: number;
    trace: TraceStep[];
    actor: string;
    created_at: string;
  }[];
}

export class ApiError extends Error {
  constructor(readonly status: number, message: string) {
    super(message);
  }
}

/** Server-side fetch (no caching: screening data changes with every decision). */
export async function api<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}/api${path}`, { cache: "no-store" });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new ApiError(res.status, body.error ?? res.statusText);
  }
  return res.json() as Promise<T>;
}

/** Browser-side JSON request through the /api rewrite. */
export async function send<T>(path: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  const { json, ...rest } = init;
  const res = await fetch(`/api${path}`, {
    ...rest,
    headers: json !== undefined ? { "content-type": "application/json", ...rest.headers } : rest.headers,
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, body.error ?? res.statusText);
  return body as T;
}
