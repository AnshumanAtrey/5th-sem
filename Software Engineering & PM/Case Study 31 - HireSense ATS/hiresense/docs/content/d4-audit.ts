import type { Data } from "../lib/data";
import { chap, esc, kpis, mermaid, note, pill, table } from "../lib/layout";

const DIM: Record<string, string> = { gender: "Gender (self-declared)", age_band: "Age band (self-declared)", university_tier: "University tier (derived)" };
const r2 = (x: number | null | undefined) => (x == null ? "—" : x.toFixed(2));
const sev = (s: string) => pill(s[0]!.toUpperCase() + s.slice(1), s === "pass" ? "ok" : s === "warning" ? "warn" : "bad");

export function d4(d: Data) {
  const company = d.audits.filter((a) => a.job_id == null && a.trigger === "scheduled");
  const latestCo = company[company.length - 1]!;
  const jobRows = d.jobs.map((j) => {
    const a = j.latestAudit;
    return [esc(j.title), a ? `${a.period_start} → ${a.period_end}` : "—", a ? sev(a.severity) : "—", `<span class="r">${r2(a?.min_ratio)}</span>`, j.auto_reject_paused ? pill("Paused", "bad") : pill("Active", "ok")];
  });
  const groupTable = (cur: any, leg: any) =>
    table(["Group", "n decided", "Selected", "Impact ratio", "z", "Legacy ratio"], cur.groups.map((g: any) => {
      const lg = leg.groups.find((x: any) => x.group === g.group);
      return [esc(g.group) + (g.lowSample ? ' <span class="muted">(n &lt; 30)</span>' : ""), `<span class="r">${g.applicants}</span>`, `${(g.rate * 100).toFixed(0)}%`,
        g.breach ? `<b style="color:var(--bad)">${r2(g.impactRatio)}${g.significant ? "*" : ""}</b>` : r2(g.impactRatio), g.z == null ? "—" : g.z.toFixed(2), lg?.breach ? `<span style="color:var(--bad)">${r2(lg.impactRatio)}</span>` : r2(lg?.impactRatio)];
    }), { cls: "dense" });
  const j1 = d.jobs.find((j) => j.id === 1)!;
  const j1f = d.fairnessByJob[1]!;
  const ageJ1 = j1f.current.find((r: any) => r.dimension === "age_band");
  const tierAll = d.fairnessAll.current.find((r: any) => r.dimension === "university_tier");
  const tierAllLeg = d.fairnessAll.legacy.find((r: any) => r.dimension === "university_tier");

  const body = [
    chap("1", "Purpose and scope", `
<p>This specification defines the <b>recurring bias audit</b> of HireSense screening outcomes: what is measured, for which groups, how often, the thresholds, and the response procedure when a threshold is breached. It implements the case-study requirement:</p>
${note(`<p><b>"Selection rate for any declared group must not fall below 80% of the highest group's rate."</b></p>`, "key")}
<p>The audit covers automated and human screening decisions (shortlist / waitlist / reject) for every open role, and company-wide. It audits <b>outcomes</b>, not intentions. The screening routine never reads group attributes (D2 FR-S4), yet outcomes can still differ between groups through proxies. Catching that is the audit's purpose.</p>`, undefined, false),

    chap("2", "Declared groups and data sources", `
${table(["Dimension", "Groups", "Source", "Handling"], [
  ["Gender", "Woman · Man · Non-binary · Prefer not to say", "Voluntary self-identification at application", "'Prefer not to say' is never compared"],
  ["Age band", "18–29 · 30–39 · 40+ · Prefer not to say", "Voluntary self-identification", "Same"],
  ["University tier", "Tier 1 · Tier 2 · Tier 3 · Unknown", "Derived from the parsed university, <b>for the audit only</b>", "Included because the internal review found the old ranking tracked tier; 'Unknown' not compared"],
], { cls: "dense", widths: ["16%", "30%", "27%", "27%"] })}
<p>Self-identification is stored in a separate <code>self_id</code> table. Only the audit module reads it. It is never shown to recruiters or returned by application APIs (D2 NFR-5).</p>`),

    chap("3", "Metrics", `
${table(["Metric", "Definition", "Notes"], [
  ["Selection rate", "SR<sub>g</sub> = shortlisted<sub>g</sub> ÷ decided<sub>g</sub>", "Decided = shortlist + waitlist + reject. Applications still in manual review are excluded until a person decides them."],
  ["Impact ratio", "IR<sub>g</sub> = SR<sub>g</sub> ÷ max<sub>h ∈ C</sub> SR<sub>h</sub>", "C = comparable groups: n ≥ 30 and not 'Prefer not to say'/'Unknown'. Small groups cannot set the benchmark."],
  ["Lowest impact ratio", "min<sub>g ∈ C</sub> IR<sub>g</sub> per dimension", "Reported as 'none' when fewer than two groups are comparable (insufficient sample)."],
  ["Significance", "z = (SR<sub>best</sub> − SR<sub>g</sub>) ÷ √(p̂(1−p̂)(1/n<sub>g</sub> + 1/n<sub>best</sub>))", "Two-proportion z-test with pooled p̂; |z| ≥ 1.96 ⇒ the gap is unlikely to be sampling noise (5% level)."],
  ["Sample size", "n<sub>g</sub> decided applications in the window", "Groups with n &lt; 30 are reported, not enforced."],
], { cls: "dense", widths: ["17%", "38%", "45%"] })}`),

    chap("4", "Requirement and acceptance tests", `
<h2>Testable requirement (FR-F1)</h2>
${note(`<p>For every declared group g in a dimension with <b>n<sub>g</sub> ≥ 30</b> decided applications in the audit window: <b>IR<sub>g</sub> ≥ 0.80</b>. Any comparable group with IR<sub>g</sub> &lt; 0.80 is a <b>breach</b> of that dimension.</p>`, "key")}
${table(["#", "Given", "Then", "Automated test"], [
  ["AT-1", "A: 100 decided, 50 selected · B: 100 decided, 40 selected", "IR<sub>B</sub> = 0.80 → <b>pass</b> (boundary is inclusive)", pill("Pass", "ok")],
  ["AT-2", "A: 50/100 · B: 39/100", "IR<sub>B</sub> = 0.78 → <b>breach</b>", pill("Pass", "ok")],
  ["AT-3", "A: 50/100 · B: 1/10", "B is low-sample → reported, no breach", pill("Pass", "ok")],
  ["AT-4", "A: 50/100 · 'Prefer not to say': 5/100", "never compared", pill("Pass", "ok")],
  ["AT-5", "A: 40 decided + 50 in manual review", "rate uses the 40 decided only", pill("Pass", "ok")],
  ["AT-6", "Only one group has n ≥ 30", "no ratio, 'insufficient sample'", pill("Pass", "ok")],
  ["AT-7", "A: 20/40 · B: 15/40 (IR 0.75, not significant)", "<b>warning</b>, job not paused", pill("Pass", "ok")],
  ["AT-8", "A: 150/300 · B: 105/300 (IR 0.70, z ≥ 1.96)", "<b>critical</b>, auto-reject paused, the next rejection goes to review", pill("Pass", "ok")],
  ["AT-9", "Paused job, re-audit passes", "auto-reject resumes", pill("Pass", "ok")],
], { cls: "dense nw1", widths: ["6%", "40%", "40%", "14%"] })}
<p class="muted">AT-1 to AT-6 are in <code>audit.test.ts</code> and AT-7 to AT-9 in <code>audit-service.test.ts</code> (in-memory database, end to end).</p>`),

    chap("5", "Frequency, windows and triggers", `
${table(["Trigger", "When", "Scope", "Window"], [
  ["Scheduled", "1st of every month, 06:00", "Each open role + company-wide", "Rolling 90 days (enough sample per group)"],
  ["Criteria change", "Immediately after a new criteria version is published", "That role", "Last 90 days, re-screened under the new version"],
  ["Pre-publication (preview)", "Before publishing criteria", "That role", "All applicants, dry run (nothing recorded)"],
  ["Parser / taxonomy release", "After a new parser, OCR model or skill-taxonomy version", "All roles", "Last 90 days, re-parsed"],
  ["On demand", "Audit lead, complaint, or Head of Talent request", "Any", "Last 90 days"],
  ["Escalated cadence", "After a warning", "That role", "Weekly until two consecutive passes"],
], { cls: "dense", widths: ["20%", "33%", "22%", "25%"] })}
${note(`<p><b>Why a rolling 90-day window, not a calendar month?</b> One role receives about 30 applications a month, which is too few for stable rates per group. In the demo data, monthly company-wide windows (~150 decisions) produced "critical" breaches from sampling noise alone. Ninety-day windows with n ≥ 30 per group and a significance test separate real disparities from noise.</p>`)}`),

    chap("6", "Thresholds and severity ladder", `
${table(["Severity", "Condition", "Automatic action", "Human action and deadline"], [
  [sev("pass"), "No comparable group below 0.80", "Record audit; resume auto-reject if paused", "—"],
  [sev("warning"), "Breach (IR &lt; 0.80) but not significant (z &lt; 1.96)", "Open incident; raise this role's audit cadence to weekly", "Criteria owner reviews the job-relatedness of the criteria within <b>5 working days</b>"],
  [sev("critical"), "Breach and significant (z ≥ 1.96)", "<b>Pause automated rejection</b> for the role: every rejection is routed to human review", "Audit lead and criteria owner start root-cause analysis within <b>2 working days</b>; Head of Talent informed"],
], { cls: "dense", widths: ["11%", "27%", "30%", "32%"] })}
<p>Company-wide breaches escalate to the Head of Talent and trigger per-role audits. They do not pause a role on their own.</p>`),

    chap("7", "Breach response procedure", `
${mermaid(`flowchart LR
  A[Audit runs] --> B{Breach?}
  B -- no --> P[Record pass · resume if paused]
  B -- yes --> C{Significant?}
  C -- no --> W[Warning · incident · weekly audits]
  C -- yes --> K[Critical · pause auto-reject]
  W --> R[Root-cause analysis]
  K --> R
  R --> D{Criterion job-related and necessary?}
  D -- no --> F[Change criteria · preview impact · publish]
  D -- yes --> J[Document justification · consider less-discriminatory alternative]
  F --> X[Re-audit]
  J --> X
  X --> B`, "Breach response loop. Every step leaves a record in the audit table or the decision log.")}
${table(["Step", "What happens", "Responsible", "Accountable", "Record"], [
  ["1 Detect", "Scheduled or triggered audit computes ratios and grades severity", "System", "Audit lead", "audits row (results, severity, action)"],
  ["2 Contain", "Critical: auto-reject paused for the role", "System", "Audit lead", "jobs.auto_reject_paused + reason"],
  ["3 Notify", "Criteria owner and Head of Talent informed with the audit link", "Audit lead", "Head of Talent", "Incident ticket"],
  ["4 Analyse", "Which criterion drives the gap? Compare by criterion; use the impact preview to test alternatives", "Criteria owner", "Audit lead", "Analysis note"],
  ["5 Remediate", "Change criteria (new version, with a mandatory note), or document job-relatedness", "Criteria owner", "Head of Talent", "criteria_versions row / justification"],
  ["6 Verify", "Re-audit (automatic on criteria change); two consecutive passes close it", "System", "Audit lead", "audits rows"],
  ["7 Review", "Monthly governance review of open incidents and KPIs (D6)", "Audit lead", "Head of Talent", "Minutes"],
], { cls: "dense nw1", widths: ["11%", "39%", "14%", "14%", "22%"] })}`),

    chap("8", "Current results (seeded data)", `
${kpis([
  ["Audits recorded", String(d.audits.length), "scheduled + triggered"],
  ["Latest company audit", latestCo.severity, `${latestCo.period_start} → ${latestCo.period_end}`],
  ["Roles paused", String(d.jobs.filter((j) => j.auto_reject_paused).length), "auto-reject paused now"],
  ["Rejections held for review", String(d.reviewByReason.find((r: any) => r.code === "AUTO_REJECT_PAUSED")?.n ?? 0), "because of a pause"],
])}
<h2>Per-role status (latest scheduled audit)</h2>
${table(["Role", "Window", "Severity", "Lowest ratio", "Automated rejection"], jobRows, { cls: "dense" })}
<h2>Finding 1: the legacy ranker's university-tier bias is gone</h2>
<p>Company-wide, over all decided applications, on the same applicants in shadow mode:</p>
${groupTable(tierAll, tierAllLeg)}
<p>The legacy score added 30 points for Tier 1 and 12 for Tier 2. HireSense does not read university, and the Tier-3 impact ratio moves from <b>${r2(tierAllLeg?.groups.find((g: any) => g.group === "Tier 3")?.impactRatio)}</b> (legacy) to <b>${r2(tierAll?.groups.find((g: any) => g.group === "Tier 3")?.impactRatio)}</b>.</p>
<h2>Finding 2: experience bands act as an age proxy on a senior role</h2>
<p>${esc(j1.title)}, age band, all decided applications:</p>
${groupTable(ageJ1, j1f.legacy.find((r: any) => r.dimension === "age_band"))}
<p>The routine never sees age. Yet a threshold that needs 4+ years of experience selects the 18–29 band at a much lower rate, and the gap is significant (*). The audit marked the role <b>critical</b> and paused automated rejection. The next step under §7 is for the criteria owner to show the experience requirement is job-related, or to lower it. The impact preview (dry run, computed for this report) shows that raising the 2–4 year band's score to the threshold (${d.whatIf.criteria.threshold}) moves the age-band ratio from ${r2(ageJ1?.minImpactRatio)} to <b>${r2(d.whatIf.fairness.find((r: any) => r.dimension === "age_band")?.minImpactRatio)}</b>${(d.whatIf.fairness.find((r: any) => r.dimension === "age_band")?.minImpactRatio ?? 1) < 0.8 ? ": better, but still below 0.80, so the change alone would not close the incident" : ", which would clear the breach"}. A real disparity that the routine itself cannot see is exactly what a recurring audit exists to find.</p>
<p class="muted">* significant at the 5% level (z ≥ 1.96). All candidates and outcomes are synthetic; the age–experience relationship is a property of how the demo data was generated.</p>`),

    chap("9", "Limitations", `
<ul>
<li><b>Self-ID non-response.</b> Groups exist only for applicants who choose to declare. Non-response is reported, and if it grows the audit loses power.</li>
<li><b>Multiple comparisons.</b> 3 dimensions × several groups × 7 scopes per month mean some "significant" breaches occur by chance. The seeded history shows two such false alarms (D6 §7). A Holm–Bonferroni correction before grading critical is the planned improvement.</li>
<li><b>Intersectional groups</b> (e.g. women aged 40+) are not audited in v1; they need larger samples. This is planned as a perfective maintenance item (D6).</li>
<li><b>Selection ≠ quality.</b> The 4/5ths rule measures adverse impact, not whether criteria predict job performance. Validity checks against later performance are a separate study.</li>
<li><b>Derived tier list</b> is illustrative and must be reviewed before production use.</li>
</ul>`),
  ].join("");

  return {
    id: "D4",
    title: "Audit Specification",
    subtitle: "Metrics, measurement frequency, thresholds and the breach response procedure for the recurring bias audit.",
    purpose: "Turns \"selection rate for any declared group must not fall below 80% of the highest group's rate\" into a measurable, repeatable audit with a defined consequence, and reports the current results.",
    body,
  };
}
