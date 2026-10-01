import { bandScore, formatBand } from "../scoring/experience";
import type { Criteria, Decision, Outcome, ParsedResume, TraceStep } from "../types";

/** Parse-confidence gate given by the case study. */
export const CONFIDENCE_GATE = 0.6;

/**
 * The screening routine, exactly as specified in Case Study 31:
 *
 *   if mandatory skills missing, reject;
 *   else score experience band;
 *     if score ≥ threshold and location matches, shortlist;
 *     else if score ≥ threshold and remote allowed, shortlist;
 *     else waitlist;
 *   if parse confidence < 0.6, route to manual review.
 *
 * Node ids (N1…N11) match the control-flow graph in the White-Box Test Report.
 * 11 nodes, 14 edges → V(G) = 14 − 11 + 2 = 5 (4 predicate nodes + 1).
 */
export function screen(p: ParsedResume, c: Criteria): Decision {
  const trace: TraceStep[] = [];
  let outcome: Outcome;
  let reasonCode: string;
  let reason: string;
  let score = 0;
  let band = null as Decision["band"];

  // N1 — D1: are mandatory skills missing?
  const have = new Set(p.skills);
  const missingSkills = c.mandatorySkills.filter((s) => !have.has(s));
  trace.push({
    node: "N1",
    label: "Mandatory skills missing?",
    result: missingSkills.length > 0,
    detail: missingSkills.length
      ? `missing: ${missingSkills.join(", ")}`
      : `all present: ${c.mandatorySkills.join(", ") || "(none required)"}`,
  });

  if (missingSkills.length > 0) {
    // N2 — reject
    outcome = "reject";
    reasonCode = "MISSING_MANDATORY_SKILLS";
    reason = `Missing mandatory skill${missingSkills.length > 1 ? "s" : ""}: ${missingSkills.join(", ")}`;
    trace.push({ node: "N2", label: "Reject", result: "reject", detail: reason });
  } else {
    // N3 — score experience band
    ({ score, band } = bandScore(p.yearsExperience, c.bands));
    trace.push({
      node: "N3",
      label: "Score experience band",
      result: score,
      detail: `${p.yearsExperience ?? "unknown"} yrs → ${formatBand(band)} → score ${score} (threshold ${c.threshold})`,
    });

    const meets = score >= c.threshold;
    const locMatch = !!p.location && p.location.toLowerCase() === c.location.toLowerCase();

    // N4 — D2: score ≥ threshold and location matches?
    const d2 = meets && locMatch;
    trace.push({
      node: "N4",
      label: "Score ≥ threshold and location matches?",
      result: d2,
      detail: `${score} ${meets ? "≥" : "<"} ${c.threshold}; location ${p.location ?? "unknown"} ${locMatch ? "=" : "≠"} ${c.location}`,
    });

    if (d2) {
      // N5 — shortlist (on-site)
      outcome = "shortlist";
      reasonCode = "SHORTLIST_LOCATION";
      reason = `Score ${score} ≥ ${c.threshold} and based in ${c.location}`;
      trace.push({ node: "N5", label: "Shortlist", result: "shortlist", detail: reason });
    } else {
      // N6 — D3: score ≥ threshold and remote allowed?
      const d3 = meets && c.remoteAllowed;
      trace.push({
        node: "N6",
        label: "Score ≥ threshold and remote allowed?",
        result: d3,
        detail: `${score} ${meets ? "≥" : "<"} ${c.threshold}; remote ${c.remoteAllowed ? "allowed" : "not allowed"}`,
      });
      if (d3) {
        // N7 — shortlist (remote)
        outcome = "shortlist";
        reasonCode = "SHORTLIST_REMOTE";
        reason = `Score ${score} ≥ ${c.threshold}; outside ${c.location} but remote allowed`;
        trace.push({ node: "N7", label: "Shortlist", result: "shortlist", detail: reason });
      } else {
        // N8 — waitlist
        outcome = "waitlist";
        reasonCode = meets ? "WAITLIST_LOCATION" : "WAITLIST_BELOW_THRESHOLD";
        reason = meets
          ? `Score ${score} meets threshold but not in ${c.location} and remote not allowed`
          : `Score ${score} below threshold ${c.threshold}`;
        trace.push({ node: "N8", label: "Waitlist", result: "waitlist", detail: reason });
      }
    }
  }

  // N9 — D4: parse confidence < 0.6?
  const lowConfidence = p.confidence < CONFIDENCE_GATE;
  trace.push({
    node: "N9",
    label: `Parse confidence < ${CONFIDENCE_GATE}?`,
    result: lowConfidence,
    detail: `confidence ${p.confidence.toFixed(2)}`,
  });

  let tentativeOutcome: Outcome | null = null;
  if (lowConfidence) {
    // N10 — manual review; the automated outcome is kept as "tentative" for the reviewer
    tentativeOutcome = outcome;
    outcome = "manual_review";
    reasonCode = "LOW_PARSE_CONFIDENCE";
    reason = `Parse confidence ${p.confidence.toFixed(2)} < ${CONFIDENCE_GATE} — automated outcome "${tentativeOutcome}" withheld for human review`;
    trace.push({ node: "N10", label: "Manual review", result: "manual_review", detail: reason });
  }

  // N11 — end
  return { outcome, tentativeOutcome, score, band, reasonCode, reason, missingSkills, trace };
}
