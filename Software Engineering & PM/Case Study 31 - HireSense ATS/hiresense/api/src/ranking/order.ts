import type { Outcome } from "../types";

/** Explicit sort order: outcome, then band score, then first-come-first-served. */
export const OUTCOME_PRIORITY: Record<Outcome, number> = {
  shortlist: 0,
  waitlist: 1,
  manual_review: 2,
  reject: 3,
};

export interface Rankable {
  id: number;
  outcome: Outcome;
  score: number;
  appliedAt: string;
}

export function compareRank(a: Rankable, b: Rankable): number {
  return (
    OUTCOME_PRIORITY[a.outcome] - OUTCOME_PRIORITY[b.outcome] ||
    b.score - a.score ||
    a.appliedAt.localeCompare(b.appliedAt) ||
    a.id - b.id
  );
}

/** Answers "why is A ranked above B?" with the first rank key that differs. */
export function explainOrder(a: Rankable, b: Rankable): { winner: number; key: string; explanation: string } {
  const [hi, lo] = compareRank(a, b) <= 0 ? [a, b] : [b, a];
  if (hi.outcome !== lo.outcome)
    return { winner: hi.id, key: "outcome", explanation: `#${hi.id} is ${hi.outcome}; #${lo.id} is ${lo.outcome}. Outcome is the first rank key.` };
  if (hi.score !== lo.score)
    return { winner: hi.id, key: "score", explanation: `Both ${hi.outcome}; #${hi.id} has experience score ${hi.score} vs ${lo.score}.` };
  if (hi.appliedAt !== lo.appliedAt)
    return { winner: hi.id, key: "appliedAt", explanation: `Same outcome and score (${hi.score}); tie broken by application time — #${hi.id} applied first.` };
  return { winner: hi.id, key: "id", explanation: `Identical on every key; tie broken by application id.` };
}
