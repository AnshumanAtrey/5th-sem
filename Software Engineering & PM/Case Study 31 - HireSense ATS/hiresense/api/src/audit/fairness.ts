import type { Outcome } from "../types";

/** Case study rule: no declared group's selection rate may fall below 80% of the highest group's. */
export const IMPACT_RATIO_MIN = 0.8;
/** Design parameter: groups smaller than this are reported but cannot trigger a breach on their own. */
export const MIN_GROUP_SIZE = 30;
/** Groups never compared (non-disclosure is not a group). */
export const EXCLUDED_GROUPS = new Set(["Prefer not to say", "Unknown"]);

export type Dimension = "gender" | "age_band" | "university_tier";
export const DIMENSIONS: Dimension[] = ["gender", "age_band", "university_tier"];

export interface AuditRow {
  outcome: Outcome;
  group: string;
}

export interface GroupResult {
  group: string;
  applicants: number;
  selected: number;
  rate: number;
  impactRatio: number | null;
  lowSample: boolean;
  breach: boolean;
  /** Two-proportion z statistic vs the best group; |z| ≥ 1.96 ⇒ gap unlikely to be sampling noise. */
  z: number | null;
  significant: boolean;
}

/** z-test critical value for a two-sided 5% significance level. */
export const Z_CRITICAL = 1.96;

export interface FairnessResult {
  dimension: Dimension;
  groups: GroupResult[];
  minImpactRatio: number | null;
  breached: boolean;
  decided: number;
}

/**
 * Selection rate = shortlisted / decided applicants in the group.
 * Applications still in manual review are excluded until a human decides them.
 */
export function fairness(rows: AuditRow[], dimension: Dimension): FairnessResult {
  const by = new Map<string, { applicants: number; selected: number }>();
  let decided = 0;
  for (const r of rows) {
    if (r.outcome === "manual_review") continue;
    decided++;
    const g = by.get(r.group) ?? { applicants: 0, selected: 0 };
    g.applicants++;
    if (r.outcome === "shortlist") g.selected++;
    by.set(r.group, g);
  }

  const groups: GroupResult[] = [...by.entries()]
    .map(([group, g]) => ({
      group,
      applicants: g.applicants,
      selected: g.selected,
      rate: g.applicants ? g.selected / g.applicants : 0,
      impactRatio: null as number | null,
      lowSample: g.applicants < MIN_GROUP_SIZE,
      breach: false,
      z: null as number | null,
      significant: false,
    }))
    .sort((a, b) => a.group.localeCompare(b.group));

  const comparable = groups.filter((g) => !EXCLUDED_GROUPS.has(g.group) && !g.lowSample);
  const top = comparable.reduce<GroupResult | null>((b, g) => (!b || g.rate > b.rate ? g : b), null);
  const best = top?.rate ?? 0;
  for (const g of groups) {
    if (EXCLUDED_GROUPS.has(g.group) || !top || best === 0) continue;
    g.impactRatio = g.rate / best;
    g.breach = !g.lowSample && g.impactRatio < IMPACT_RATIO_MIN;
    if (g !== top) {
      const pooled = (g.selected + top.selected) / (g.applicants + top.applicants);
      const se = Math.sqrt(pooled * (1 - pooled) * (1 / g.applicants + 1 / top.applicants));
      g.z = se ? (top.rate - g.rate) / se : 0;
      g.significant = g.z >= Z_CRITICAL;
    }
  }

  // With fewer than two comparable groups there is nothing to compare: report "no ratio", not 1.0.
  const ratios = comparable.map((g) => g.impactRatio).filter((r): r is number => r != null);
  return {
    dimension,
    groups,
    minImpactRatio: comparable.length >= 2 ? Math.min(...ratios) : null,
    breached: groups.some((g) => g.breach),
    decided,
  };
}
