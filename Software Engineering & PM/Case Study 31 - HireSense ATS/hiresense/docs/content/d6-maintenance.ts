import type { Data } from "../lib/data";
import { chap, esc, kpis, mermaid, note, pill, table } from "../lib/layout";

export function d6(d: Data) {
  const sched = d.audits.filter((a) => a.trigger === "scheduled");
  const byScope = new Map<string, any[]>();
  for (const a of sched) {
    const k = a.job ?? "Company-wide";
    byScope.set(k, [...(byScope.get(k) ?? []), a]);
  }
  const breaches = sched.filter((a) => a.breached).length;
  const critical = sched.filter((a) => a.severity === "critical").length;
  const pe = d.parserEval;
  const review = d.reviewByReason.reduce((n: number, r: any) => n + r.n, 0);

  const body = [
    chap("1", "Why a fairness audit is preventive maintenance", `
<p>Software maintenance is usually classified (ISO/IEC/IEEE 14764; Sommerville) as:</p>
${table(["Type", "Purpose", "Trigger", "HireSense example"], [
  ["Corrective", "Fix a defect after it has caused a failure", "A failure is observed", "BUG-04: season dates silently scored 0 years → anomaly cap added"],
  ["Adaptive", "Keep working in a changed environment", "External change", "A new OCR model or résumé tool changes text extraction"],
  ["Perfective", "Improve qualities or add features", "User need", "Intersectional audit groups; better date grammar"],
  ["<b>Preventive</b>", "<b>Detect and remove latent faults before they become failures</b>", "<b>Schedule, not failure</b>", "<b>The recurring fairness audit</b>"],
], { cls: "dense", widths: ["13%", "32%", "18%", "37%"] })}
${note(`<p>A screening system can become discriminatory <b>without any code change</b>. The applicant pool shifts, a recruiter edits a band, a new parser reads one layout better than another, or a criterion turns out to proxy a protected characteristic. These are <b>latent faults</b>: nothing crashes, and the harm accumulates silently, just like the silent parse failure. The fairness audit runs on a schedule, looks for the fault before anyone is harmed at scale, and triggers a fix. Running on a schedule to prevent failure is what makes it <b>preventive maintenance</b>.</p>`, "key")}
<p>The seeded data shows the point. HireSense never reads age, yet the audit found that the Senior Frontend role's experience bands select the 18–29 band at an impact ratio of about 0.46 (D4 §8). No test of the code could have found this, because it is a property of <i>criteria × applicant population</i>. Only recurring measurement of outcomes reveals it.</p>`, undefined, false),

    chap("2", "Sources of drift the process must catch", `
${table(["Source", "Example", "Detected by"], [
  ["Applicant population", "More early-career applicants after a campus drive", "Scheduled audit (rolling 90 days)"],
  ["Criteria edits", "Threshold raised from 75 to 85", "Preview before publish + automatic audit after"],
  ["Parser / OCR release", "New version reads two-column layouts differently", "Evaluation gate + post-release audit"],
  ["Skill taxonomy update", "An alias added or removed (\"JS\" vs \"Node.js\")", "Evaluation gate + audit"],
  ["Proxy variables", "Experience as an age proxy; location as a socio-economic proxy", "Audit by every declared dimension"],
  ["Process drift", "Reviewers start overriding in one direction", "Human-decision share and outcome KPIs"],
], { cls: "dense", widths: ["22%", "43%", "35%"] })}`),

    chap("3", "The recurring audit cycle", `
<div class="steps">${[
  ["1", "Plan", "Scopes, window, owners"], ["2", "Collect", "Decided outcomes + self-ID"], ["3", "Measure", "SR · IR · z per group"],
  ["4", "Evaluate", "Pass · warning · critical"], ["5", "Act", "Incident · pause · remediate"], ["6", "Verify", "Re-audit; 2 passes to close"], ["7", "Record & review", "Audit table · monthly review → back to 1"],
].map(([n, t, d]) => `<div class="step"><span>${n}</span><b>${t}</b><small>${d}</small></div>`).join("")}</div>
<p class="caption" style="text-align:center;margin-top:2pt"><b>Monthly preventive-maintenance cycle</b> (plan–do–check–act). Steps 2–4 and the containment in step 5 are automated; analysis and remediation are human.</p>
${table(["Cadence", "Activity", "Owner", "Output"], [
  ["Monthly (1st, 06:00)", "Scheduled audit of every role + company-wide, rolling 90 days", "System / audit lead", "audits rows; incidents"],
  ["Monthly (first week)", "Governance review: open incidents, KPIs (§6), criteria changes of the month", "Audit lead + Head of Talent", "Minutes, actions"],
  ["Weekly (while a warning is open)", "Escalated audit of the affected role", "System", "audits rows"],
  ["Quarterly", "Deep dive: threshold review (n ≥ 30, z ≥ 1.96), proxy analysis, self-ID non-response", "Audit lead", "Threshold decision record"],
  ["Per release", "Parser/OCR/taxonomy release gated on the evaluation corpus, then audit", "Engineering", "Eval report, audit"],
  ["Annually", "Independent review of the audit process and the tier list", "External reviewer", "Review report"],
], { cls: "dense", widths: ["22%", "42%", "18%", "18%"] })}`),

    chap("4", "Change management for criteria and parser", `
<div class="cols">
${mermaid(`flowchart TD
  A[Draft criteria change] --> B[Preview: outcomes + fairness]
  B --> C{Fairness OK?}
  C -- no --> A
  C -- yes --> D[Publish with author + note → new version]
  D --> E[Re-screen role · append decisions]
  E --> F[Automatic audit · trigger = criteria_change]
  F --> G{Critical?}
  G -- yes --> H[Pause auto-reject · incident]
  G -- no --> I[Done]`, "Criteria change workflow.")}
${mermaid(`flowchart TD
  A[Parser / OCR / taxonomy change] --> B[Run evaluation corpus]
  B --> C{"≥ 95% correct and ≤ 1% silent?"}
  C -- no --> X[Release blocked]
  C -- yes --> D[Unit + regression tests]
  D --> E[Release with new PARSER_VERSION]
  E --> F[Re-parse in shadow · compare]
  F --> G[Audit all roles]`, "Parser release gate.")}
</div>
<p>Every corrective fix ships with a <b>regression test</b> that would have caught the defect (D1 §8). Each release records the parser version on every parse and the criteria version on every decision, so any past decision can be explained with the exact rules and parser that produced it.</p>`),

    chap("5", "Event-driven (unscheduled) maintenance", `
${table(["Event", "Maintenance type", "Response"], [
  ["Candidate complaint or regulator query", "Corrective / preventive", "On-demand audit of the role; decision trace and log export within 2 working days"],
  ["Critical audit", "Preventive → corrective", "Containment (pause) is automatic; root cause and remediation per D4 §7"],
  ["New job family (e.g. non-tech roles)", "Adaptive", "Extend the taxonomy; evaluation corpus for the new layouts; audit after 90 days"],
  ["Review queue age > 2 days", "Perfective", "Investigate the routing reasons; improve the parser for the dominant cause"],
  ["Dependency update (OCR, model, PDF library)", "Adaptive", "Evaluation gate before deploy; pin versions"],
], { cls: "dense", widths: ["30%", "20%", "50%"] })}`),

    chap("6", "Maintenance metrics (KPIs)", `
${kpis([
  ["Scheduled audits", String(sched.length), `${byScope.size} scopes × ${Math.round(sched.length / Math.max(1, byScope.size))} months`],
  ["Audits with a breach", String(breaches), `${critical} critical`],
  ["Parse success", `${((pe.v2Ok / pe.total) * 100).toFixed(1)}%`, "target ≥ 95%"],
  ["Silent failure rate", `${((pe.v2Silent / pe.total) * 100).toFixed(2)}%`, "target ≤ 1%"],
])}
${table(["KPI", "Definition", "Target", "Current (seeded data)"], [
  ["Audit timeliness", "Scheduled audits completed on the 1st ÷ due", "100%", "100% (seeded schedule)"],
  ["Mean time to remediate (MTTR) a critical breach", "Critical audit → first passing re-audit", "≤ 30 days", "Open: Senior Frontend (age band)"],
  ["Breach rate", "Audits with a breach ÷ scheduled audits", "Trend ↓", `${((breaches / Math.max(1, sched.length)) * 100).toFixed(0)}%`],
  ["Parse success / silent failures", "Evaluation corpus, per release", "≥ 95% / ≤ 1%", `${((pe.v2Ok / pe.total) * 100).toFixed(1)}% / ${((pe.v2Silent / pe.total) * 100).toFixed(2)}%`],
  ["False-alarm routing", "Correct parses sent to review ÷ all parses", "≤ 1%", `${((pe.v2FalseAlarm / pe.total) * 100).toFixed(2)}%`],
  ["Review queue", "Applications awaiting a person", "Age ≤ 2 days", `${review} waiting`],
  ["Self-ID non-response", "'Prefer not to say' ÷ applicants", "≤ 40%", `${(((d.selfIdMix.find((m: any) => m.gender === "Prefer not to say")?.n ?? 0) / d.total) * 100).toFixed(0)}%`],
  ["Criteria change audits", "Changes followed by an automatic audit", "100%", "100% (enforced by the API)"],
], { cls: "dense", widths: ["26%", "34%", "15%", "25%"] })}`),

    chap("7", "Audit history as maintenance evidence", `
<p>Scheduled audits per scope (rolling 90-day windows, seeded data). Reading the history the way the monthly governance review would:</p>
<ul>
<li><b>Persistent, real disparity.</b> The age band (18–29) breaches in every company-wide window and repeatedly for Senior Frontend Engineer. It comes from the experience requirement (D4 §8), and the role is paused now.</li>
<li><b>False alarms.</b> Data Analyst (university tier, two windows) and Senior Frontend (gender, one window) were graded critical, although the demo data makes tier and gender <i>independent</i> of outcomes. With about ${(3 * 3 * 7 * 9).toLocaleString("en-IN")} group comparisons over the 9 scheduled months at the 5% level, a few chance "significant" results are expected. The pause → re-audit loop limited the cost: each cleared within one or two windows.</li>
<li><b>Warnings that clear on their own</b> (W) are the non-significant breaches. They correctly did not pause any role.</li>
</ul>
${note(`<p><b>Maintenance action from this review (perfective):</b> apply a multiple-comparison correction (Holm–Bonferroni across the groups and dimensions of a scope) before grading a breach as critical, and re-evaluate at the next quarterly deep dive. This is exactly the feedback loop a preventive-maintenance process should produce: the audit audits itself.</p>`, "warn")}
${table(["Scope", ...[...new Set(sched.map((a) => a.period_end))].sort().map((p) => p.slice(0, 7))], [...byScope.entries()].map(([scope, rows]) => [
  esc(scope), ...[...new Set(sched.map((a) => a.period_end))].sort().map((p) => {
    const a = rows.find((r: any) => r.period_end === p);
    return a ? pill(a.severity === "pass" ? "✓" : a.severity === "warning" ? "W" : "C", a.severity === "pass" ? "ok" : a.severity === "warning" ? "warn" : "bad") : "—";
  }),
]), { cls: "dense" })}
<p class="muted">✓ pass · W warning (breach, not significant) · C critical (significant breach → auto-reject paused for a role, or escalation company-wide).</p>`),

    chap("8", "Maintenance log (from this project)", `
<p>Corrective maintenance performed while building the prototype, classified. Each item has a regression test (D1 §8).</p>
${table(["Change", "Type", "Effect"], [
  ["Letter-spaced headings collapsed before matching", "Corrective", "721 standard résumés fixed for both parsers"],
  ["Earliest-occurrence city match", "Corrective", "95 wrong cities fixed"],
  ["Two-column detection: balance 8% + side-by-side check", "Corrective", "24 résumés fixed"],
  ["Anomaly cap for unreadable sections", "Preventive", "New class of silent failure made visible"],
  ["OCR fallback (PP-OCRv6 tiny)", "Perfective", "Parse success 91.1% → 99.0%; review queue 215 → 94"],
  ["OCR dash/space variants in dates", "Adaptive", "Scanned résumés 120 → 157 of 160 correct"],
  ["Grounding: employer must appear in the text", "Corrective", "AI assist no longer invents jobs"],
  ["Significance test before pausing", "Perfective", "Noise-driven 'critical' audits removed"],
  ["Null ratio when < 2 comparable groups", "Corrective", "No more vacuous 1.0 ratios"],
], { cls: "dense", widths: ["45%", "15%", "40%"] })}`),
  ].join("");

  return {
    id: "D6",
    title: "Maintenance Process",
    subtitle: "The recurring fairness audit defined as preventive maintenance: cycle, calendar, change control, KPIs and evidence.",
    purpose: "Why a bias audit is preventive maintenance, and the recurring process that keeps HireSense fair and reliable after go-live, without depending on a one-off report.",
    body,
  };
}
