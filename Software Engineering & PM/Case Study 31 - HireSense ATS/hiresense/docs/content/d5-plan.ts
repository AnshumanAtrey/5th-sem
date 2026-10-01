import type { Data } from "../lib/data";
import { chap, esc, figure, kpis, mermaid, note, pill, table } from "../lib/layout";

// ---------- schedule model (single source for PERT, CPM and the Gantt) ----------
interface Act { id: string; name: string; inc: string; o: number; m: number; p: number; deps: string[] }
const ACTS: Act[] = [
  { id: "A", name: "Charter, stakeholder sign-off, baseline metrics", inc: "I0", o: 4, m: 6, p: 10, deps: [] },
  { id: "B", name: "Evaluation corpus + ground truth (legacy reproduces 29%)", inc: "I0", o: 6, m: 10, p: 16, deps: ["A"] },
  { id: "C", name: "Append-only decision log + shadow logging of legacy", inc: "I0", o: 6, m: 8, p: 12, deps: ["A"] },
  { id: "D", name: "Confidence gate around legacy parser (stop silent rejects)", inc: "I1", o: 4, m: 6, p: 10, deps: ["B", "C"] },
  { id: "E", name: "Parser v2: layout, sections, dates, confidence (WP-P)", inc: "I2", o: 12, m: 18, p: 28, deps: ["B"] },
  { id: "F", name: "OCR fallback for scanned PDFs (WP-P)", inc: "I2", o: 6, m: 10, p: 16, deps: ["E"] },
  { id: "G", name: "Criteria model, versioning, editor + preview", inc: "I3", o: 10, m: 14, p: 20, deps: ["C"] },
  { id: "H", name: "Specified routine, rank keys, explain-A-vs-B", inc: "I3", o: 6, m: 8, p: 12, deps: ["G"] },
  { id: "I", name: "Canary: one role on HireSense, legacy in shadow", inc: "I3", o: 10, m: 14, p: 20, deps: ["D", "E", "H"] },
  { id: "J", name: "Bias audit service, spec, scheduler, breach procedure", inc: "I4", o: 8, m: 12, p: 18, deps: ["H"] },
  { id: "K", name: "Review queue + AI-assisted extraction", inc: "I5", o: 6, m: 10, p: 16, deps: ["F", "H"] },
  { id: "L", name: "Parallel run, all roles (2 audit cycles)", inc: "I6", o: 16, m: 20, p: 28, deps: ["I", "J", "K"] },
  { id: "M", name: "Cut-over, legacy decommission, handover", inc: "I6", o: 4, m: 6, p: 10, deps: ["L"] },
];

function cpm() {
  const te = Object.fromEntries(ACTS.map((a) => [a.id, (a.o + 4 * a.m + a.p) / 6]));
  const sd = Object.fromEntries(ACTS.map((a) => [a.id, (a.p - a.o) / 6]));
  const ES: Record<string, number> = {};
  const EF: Record<string, number> = {};
  for (const a of ACTS) {
    ES[a.id] = Math.max(0, ...a.deps.map((d) => EF[d]!));
    EF[a.id] = ES[a.id]! + te[a.id]!;
  }
  const end = Math.max(...Object.values(EF));
  const LF: Record<string, number> = {};
  const LS: Record<string, number> = {};
  for (const a of [...ACTS].reverse()) {
    const succ = ACTS.filter((s) => s.deps.includes(a.id));
    LF[a.id] = succ.length ? Math.min(...succ.map((s) => LS[s.id]!)) : end;
    LS[a.id] = LF[a.id]! - te[a.id]!;
  }
  const slack = Object.fromEntries(ACTS.map((a) => [a.id, LS[a.id]! - ES[a.id]!]));
  const critical = ACTS.filter((a) => Math.abs(slack[a.id]!) < 1e-6).map((a) => a.id);
  const variance = critical.reduce((s, id) => s + sd[id]! ** 2, 0);
  return { te, sd, ES, EF, LS, LF, slack, critical, end, sigma: Math.sqrt(variance) };
}

/** Working days → calendar date (Mon–Fri), from the project start. */
const START = new Date("2026-10-12T00:00:00Z");
function workday(n: number) {
  const d = new Date(START);
  let left = Math.round(n);
  while (left > 0) {
    d.setUTCDate(d.getUTCDate() + 1);
    if (d.getUTCDay() !== 0 && d.getUTCDay() !== 6) left--;
  }
  return d.toISOString().slice(0, 10);
}

const STORIES: [string, string, string, number, string][] = [
  ["US-01", "As an audit lead, I want every automated rejection logged with a reason, so that any decision can be defended.", "Must", 5, "S1"],
  ["US-02", "As a recruiter, I want unreadable résumés routed to a person instead of rejected, so that good candidates are not lost.", "Must", 5, "S1"],
  ["US-03", "As engineering, I want an evaluation corpus with ground truth, so that parser quality is measured, not guessed.", "Must", 8, "S1"],
  ["US-04", "As a recruiter, I want two-column and creative résumés parsed correctly.", "Must", 8, "S2"],
  ["US-05", "As a recruiter, I want unusual date formats understood, so that experience is not undercounted.", "Should", 5, "S2"],
  ["US-06", "As a reviewer, I want scanned PDFs read by OCR, so that the review queue shrinks.", "Should", 8, "S3"],
  ["US-07", "As a criteria owner, I want to edit mandatory skills, bands, threshold, city and remote without a deploy.", "Must", 8, "S3"],
  ["US-08", "As a criteria owner, I want every change versioned with a note, so that I can see which version decided what.", "Must", 3, "S3"],
  ["US-09", "As a recruiter, I want to see why candidate A ranks above B.", "Must", 5, "S4"],
  ["US-10", "As a criteria owner, I want to preview the impact and fairness of a change before publishing.", "Should", 5, "S4"],
  ["US-11", "As an audit lead, I want a monthly bias audit with selection rates and impact ratios per declared group.", "Must", 8, "S5"],
  ["US-12", "As an audit lead, I want a significant breach to pause automated rejection automatically.", "Must", 5, "S5"],
  ["US-13", "As a candidate, I want to self-identify voluntarily, knowing screening never sees it.", "Must", 3, "S5"],
  ["US-14", "As a reviewer, I want a queue sorted by age with the reason and the withheld outcome.", "Must", 3, "S6"],
  ["US-15", "As a reviewer, I want AI-suggested field values that are grounded in the résumé text.", "Could", 5, "S6"],
  ["US-16", "As an audit lead, I want to export the decision log as CSV.", "Should", 2, "S6"],
  ["US-17", "As the Head of Talent, I want a parallel run on all roles before legacy is switched off.", "Must", 8, "S7"],
  ["US-18", "As engineering, I want a CI gate that blocks a parser release below the acceptance threshold.", "Must", 3, "S7"],
  ["US-19", "As the Head of Talent, I want a clean cut-over and handover.", "Must", 5, "S8"],
];

const RISKS: [string, string, string, number, number, string, string, string][] = [
  ["R1", "<b>Reputational:</b> a candidate or the press shows the screener discriminates (e.g. an age or tier proxy)", "Reputational", 3, 5, "Recurring audit; automatic pause on significant breach; documented job-relatedness; candidate-facing explanation", "Pause auto-reject company-wide; public statement; external audit", "Critical audit / complaint"],
  ["R2", "Silent parse failures continue during migration and reject qualified candidates", "Quality", 4, 4, "I1 ships the confidence gate in week 3, before any new parser", "Route all rejects to review until gate is live", "Silent-failure KPI > 1%"],
  ["R3", "Screening stops or slows during cut-over", "Operational", 2, 5, "Strangler increments; canary; legacy stays primary until exit criteria met; rollback switch per role", "Flip role back to legacy", "Queue age > 2 days"],
  ["R4", "Recruiters over-trust the new ranking (automation bias)", "Human", 4, 3, "Show reasons and paths, not just a rank; training; reviewers decide low-confidence cases", "Sample audit of shortlists", "Override rate ≈ 0"],
  ["R5", "Review queue overload after the gate goes live (29% of résumés)", "Operational", 4, 3, "OCR fallback (WP-P) cut the queue 215 → 94 in the prototype; staffing plan for reviewers", "Temporary reviewers", "Queue > 2 days"],
  ["R6", "Legal non-compliance with data-protection law for self-ID data", "Legal", 2, 5, "Separate table; audit-role access only; consent text; retention limits (DPDP Act 2023)", "Suspend self-ID collection", "Access-log anomaly"],
  ["R7", "Audit false alarms from small samples cause alert fatigue", "Quality", 3, 3, "n ≥ 30; rolling 90 days; significance test before pausing", "Review thresholds quarterly", "> 2 warnings/month with no cause"],
  ["R8", "Criteria change introduces new adverse impact", "Quality", 3, 4, "Mandatory preview + automatic audit on publish", "Revert to previous version", "Critical audit after change"],
  ["R9", "OCR / language model dependency unavailable or changes behaviour", "Technical", 2, 3, "Optional, with graceful fallback to manual review; pinned model versions; evaluation gate", "Disable component", "Eval drops below threshold"],
  ["R10", "Low self-ID response makes the audit blind", "Quality", 3, 3, "Explain purpose to candidates; track non-response as a KPI", "Proxy-free analyses only", "Non-response > 40%"],
  ["R11", "Decision log tampering or loss", "Security", 1, 5, "Append-only triggers; backups; access control", "Restore from backup", "Trigger violation logged"],
  ["R12", "Scope creep (interviews, offers)", "Project", 3, 2, "Scope fixed in charter; change control board", "Defer to phase 2", "Unplanned stories > 10%"],
];

export function d5(d: Data) {
  const s = cpm();
  const kloc = (d.size.api.code + d.size.seed.code + d.size.web.code) / 1000;
  const E = 2.4 * kloc ** 1.05;
  const D = 2.5 * E ** 0.38;
  const staff = E / D;
  const rate = 125000;
  const totalPts = STORIES.reduce((n, x) => n + x[3], 0);
  const sprints = ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8"];
  const remaining = [totalPts, ...sprints.map((sp, i) => totalPts - STORIES.filter((x) => sprints.indexOf(x[4]) <= i).reduce((n, x) => n + x[3], 0))];
  const pe = d.parserEval;

  // burndown SVG (planned scope vs ideal)
  const W = 460, H = 180, P = 30;
  const xs = (i: number) => P + (i * (W - 2 * P)) / sprints.length;
  const ys = (v: number) => H - P + 6 - (v / totalPts) * (H - 2 * P);
  const burn = `<svg viewBox="0 0 ${W} ${H}" width="460" font-family="Inter" font-size="9">
    ${[0, 0.25, 0.5, 0.75, 1].map((f) => `<line x1="${P}" x2="${W - P}" y1="${ys(f * totalPts)}" y2="${ys(f * totalPts)}" stroke="#e3e5e8"/><text x="${P - 6}" y="${ys(f * totalPts) + 3}" text-anchor="end" fill="#80858f">${Math.round(f * totalPts)}</text>`).join("")}
    <line x1="${xs(0)}" y1="${ys(totalPts)}" x2="${xs(sprints.length)}" y2="${ys(0)}" stroke="#a3a8b0" stroke-dasharray="4 3"/>
    <polyline fill="none" stroke="#17191c" stroke-width="2" points="${remaining.map((v, i) => `${xs(i)},${ys(v)}`).join(" ")}"/>
    ${remaining.map((v, i) => `<circle cx="${xs(i)}" cy="${ys(v)}" r="2.6" fill="#17191c"/>`).join("")}
    ${["Start", ...sprints].map((l, i) => `<text x="${xs(i)}" y="${H - 6}" text-anchor="middle" fill="#80858f">${l}</text>`).join("")}
    <text x="${W - P}" y="${P - 8}" text-anchor="end" fill="#4b5059">— planned remaining points · - - ideal</text>
  </svg>`;

  const gantt = `gantt
  dateFormat YYYY-MM-DD
  axisFormat %d %b
  excludes weekends
${["I0", "I1", "I2", "I3", "I4", "I5", "I6"].map((inc) => {
  const acts = ACTS.filter((a) => a.inc === inc);
  if (!acts.length) return "";
  const names: Record<string, string> = { I0: "I0 Foundations", I1: "I1 Stop silent rejects", I2: "I2 Parser v2 + OCR", I3: "I3 Criteria + routine", I4: "I4 Bias audit", I5: "I5 Review + AI assist", I6: "I6 Parallel run + cut-over" };
  return `  section ${names[inc]}\n${acts.map((a) => `  ${a.id} ${a.name.split(/[(:]/)[0]!.slice(0, 38).replace(/[,;]/g, "")} :${s.critical.includes(a.id) ? "crit, " : ""}${a.id}, ${workday(s.ES[a.id]!)}, ${Math.max(1, Math.round(s.te[a.id]!))}d`).join("\n")}`;
}).join("\n")}`;

  const body = [
    chap("1", "Project charter", `
${table(["", ""], [
  ["<b>Project</b>", "Rebuild of the applicant-screening system as HireSense"],
  ["<b>Sponsor</b>", "Head of Talent"],
  ["<b>Problem</b>", "Unexplainable ranking that tracks university tier; résumé parsing fails silently on 29% of documents; no rejection log; no bias audit"],
  ["<b>Objectives</b>", "Explicit, configurable, versioned criteria · every automated rejection logged with a reason · parse failures never silent · recurring bias audit with a defined consequence · screening never stops during the rebuild"],
  ["<b>Measurable success criteria</b>", "Parse success ≥ 95% and silent failures ≤ 1% on the evaluation corpus · 100% of decisions logged with reason and criteria version · monthly audit on time 100% · zero days without screening · all Must requirements in the SRS verified"],
  ["<b>Scope</b>", "Parsing, criteria, screening, ranking, decision log, review queue, bias audit, legacy shadow comparison"],
  ["<b>Out of scope</b>", "Interview scheduling, offers, job board, payroll"],
  ["<b>Constraints</b>", "Case-study figures used as given; 90,000 applications/year; legacy must keep running until cut-over"],
  ["<b>Team</b>", "1 project lead / scrum master · 2 engineers · 1 QA · 0.5 talent-ops SME · 0.25 audit/compliance lead"],
], { cls: "dense", widths: ["22%", "78%"] })}`, undefined, false),

    chap("2", "Incremental delivery: screening never stops", `
<p>The rebuild follows the <b>strangler-fig</b> pattern. Each increment is shippable on its own and adds a capability <i>around</i> the legacy system before replacing any part of it. Legacy stays the system of record until the increment's exit criteria are met, and every role has a rollback switch back to legacy.</p>
${table(["Increment", "Delivers", "Screening during this increment", "Exit criteria"], [
  ["<b>I0</b> Foundations", "Evaluation corpus with ground truth; append-only decision log; legacy decisions shadow-logged", "Legacy only (now logged)", "Legacy reproduces 71% on the corpus; 100% of legacy decisions logged"],
  ["<b>I1</b> Stop silent rejects", "Confidence gate wrapped around the <i>legacy</i> parser", "Legacy + gate: low-confidence rejects go to review", "0 automated rejections at confidence &lt; 0.6"],
  ["<b>I2</b> Parser v2 + OCR", "Layout-aware parser, anomaly cap, OCR fallback (WP-P)", "Legacy primary; v2 in shadow", "≥ 95% correct, ≤ 1% silent on the corpus"],
  ["<b>I3</b> Criteria + routine", "Versioned criteria, editor, preview; specified routine; rank keys; explain view", "Canary: one role on HireSense, others legacy", "Canary role: 2 weeks, review queue age &lt; 2 days, no Sev-1 defects"],
  ["<b>I4</b> Bias audit", "Audit service, specification (D4), scheduler, breach procedure", "Canary + audits on all roles (shadow)", "Two scheduled audits completed; breach drill passed"],
  ["<b>I5</b> Review + AI assist", "Review queue, verified re-screen, grounded AI extraction", "Canary", "Median review time recorded; no ungrounded values accepted"],
  ["<b>I6</b> Parallel run + cut-over", "All roles on HireSense with legacy in shadow; then decommission", "HireSense primary, legacy shadow, then legacy off", "Two audit cycles pass; sponsor sign-off"],
], { cls: "dense", widths: ["15%", "33%", "27%", "25%"] })}`),

    chap("3", "Work breakdown structure", `
<p>Deliverable-oriented WBS. Level-1 elements follow the increments; work packages map to the schedule activities (§6). The parsing work package <b>WP-P</b> is defined in §4.</p>
${table(["WBS", "Element / work package", "Increment", "Activity", "Deliverable"], [
  ["<b>1</b>", "<b>Project management</b>", "all", "—", "Charter, plan, status reports"],
  ["1.1", "Charter and baseline metrics", "I0", "A", "Signed charter"],
  ["1.2", "Sprint ceremonies, risk and change control", "all", "—", "Sprint reviews, risk register"],
  ["<b>2</b>", "<b>Foundations</b>", "I0", "", ""],
  ["2.1", "Evaluation corpus and ground truth", "I0", "B", "Corpus (legacy reproduces 71%)"],
  ["2.2", "Append-only decision log and shadow logging", "I0", "C", "decision_log, triggers"],
  ["<b>3</b>", "<b>Parsing (WP-P)</b>", "I1–I2", "", ""],
  ["3.1", "Confidence gate around the legacy parser", "I1", "D", "No silent rejects in production"],
  ["3.2", "Parser v2: layout, sections, dates, confidence", "I2", "E", "parser v2.x"],
  ["3.3", "OCR fallback for scanned PDFs", "I2", "F", "ocr.ts"],
  ["3.4", "CI evaluation gate", "I2", "E/F", "Blocked releases below threshold"],
  ["<b>4</b>", "<b>Criteria and screening</b>", "I3", "", ""],
  ["4.1", "Criteria model, versions, editor and preview", "I3", "G", "criteria_versions, editor"],
  ["4.2", "Specified routine, rank keys, explain view", "I3", "H", "routine.ts, order.ts"],
  ["4.3", "Canary on one role", "I3", "I", "Canary report"],
  ["<b>5</b>", "<b>Bias audit</b>", "I4", "J", "Audit service, D4, breach drill"],
  ["<b>6</b>", "<b>Review and UX</b>", "I5", "K", "Review queue, AI assist"],
  ["<b>7</b>", "<b>Transition</b>", "I6", "", ""],
  ["7.1", "Parallel run on all roles (2 audit cycles)", "I6", "L", "Parallel-run report"],
  ["7.2", "Cut-over, legacy decommission, handover", "I6", "M", "Sign-off"],
], { cls: "dense nw1", widths: ["7%", "45%", "11%", "9%", "28%"] })}`),

    chap("4", "Work package WP-P: parsing quality", `
<p>The case study gives the current parsing quality as a <b>29% failure rate</b> and asks for an acceptance threshold, plus the effort to reach it, defined as a work package.</p>
${table(["Field", "Definition"], [
  ["Baseline", "Legacy parser: 71% correct, 29% failing; every failure is silent (no confidence, no error)"],
  ["Correct parse", "All decision fields right: skills (F1 ≥ 0.8), years of experience (±1 year) and city, against ground truth"],
  ["<b>Acceptance threshold</b>", "<b>≥ 95% correct</b> on the evaluation corpus, <b>and ≤ 1% silent failures</b> (wrong but confidence ≥ 0.6), <b>and ≥ 90% correct in every layout class</b>"],
  ["Measurement", "<code>seed/evaluate.ts</code> on every build; release blocked in CI below threshold"],
  ["Owner / duration", "Engineer 1 · activities E + F · " + (s.te.E! + s.te.F!).toFixed(1) + " working days expected (PERT)"],
], { cls: "dense", widths: ["22%", "78%"] })}
${table(["Task", "Effort (person-days)", "Output"], [
  ["Evaluation corpus with layout classes and ground truth", "4", "2,000 résumés; 29% hard layouts"],
  ["Reading-order reconstruction (two-column detection)", "6", "pdf.ts readingOrder"],
  ["Section headings: synonyms, letter-spacing", "3", "parser.ts headings"],
  ["Date-range grammar (7 formats + OCR variants)", "3", "dates.ts"],
  ["Confidence model, anomaly cap, gate", "3", "WEIGHTS, ANOMALY_CAP"],
  ["OCR fallback (rasterise + PP-OCRv6) and engine benchmark", "5", "ocr.ts; PP-OCRv6 vs tesseract.js"],
  ["Evaluation harness + CI gate", "3", "evaluate.ts"],
  ["Regression tests for every defect found", "2", "parser.test.ts"],
  ["<b>Total</b>", "<b>29</b>", "≈ activities E + F in the schedule"],
], { cls: "dense", widths: ["50%", "18%", "32%"] })}
${kpis([
  ["Baseline correct", `${((pe.legacyOk / pe.total) * 100).toFixed(1)}%`, "legacy"],
  ["Achieved correct", `${((pe.v2Ok / pe.total) * 100).toFixed(1)}%`, "target ≥ 95%"],
  ["Silent failures", `${((pe.v2Silent / pe.total) * 100).toFixed(2)}%`, "target ≤ 1%"],
  ["Worst layout class", `${Math.min(...Object.values(pe.byCase).map((t: any) => (t.v2Ok / t.total) * 100)).toFixed(0)}%`, "target ≥ 90%"],
])}
${(() => {
  const cases = Object.entries(pe.byCase).map(([k, t]: [string, any]) => [k, t.v2Ok / t.total] as const);
  const worst = cases.reduce((a, b) => (b[1] < a[1] ? b : a));
  const overall = pe.v2Ok / pe.total >= 0.95;
  const silent = pe.v2Silent / pe.total <= 0.01;
  const perClass = worst[1] >= 0.9;
  const label: Record<string, string> = { odd_dates: "unusual dates", scanned: "scanned", two_column: "two-column", creative_headings: "creative headings", standard: "standard" };
  return note(`<p><b>Status: ${[overall, silent, perClass].filter(Boolean).length} of 3 acceptance criteria met.</b> Overall correctness ${overall ? "✓" : "✗"} · silent failures ${silent ? "✓" : "✗"} · every layout class ≥ 90% ${perClass ? "✓" : `✗ (${label[worst[0]] ?? worst[0]}: ${(worst[1] * 100).toFixed(0)}%)`}.</p>${perClass ? "" : `<p>The gap is season-style dates ("Summer 2023 – Spring 2025"), which the date grammar does not read. Of the ${(pe.byCase as any)[worst[0]].total - (pe.byCase as any)[worst[0]].v2Ok} failures in this class, the anomaly cap routes ${(pe.byCase as any)[worst[0]].v2Detected} to review; ${(pe.byCase as any)[worst[0]].v2Silent} remain silent (a partially read date range). <b>Remaining task:</b> add a season grammar (≈ 1 person-day), then re-run the evaluation gate.</p>`}<p>Without OCR, v2 reached 91.1% overall. The 8% of scanned résumés made the OCR task necessary for the 95% target.</p>`, perClass ? "info" : "warn");
})()}`),

    chap("5", "Effort and cost estimation (COCOMO)", `
<p>Basic COCOMO, organic mode (a small team, familiar domain), sized from the <b>actual prototype</b>: ${(d.size.api.code + d.size.seed.code + d.size.web.code).toLocaleString("en-IN")} non-blank, non-comment lines in the API, seed generator and web client. Generated UI-library code and tests are excluded.</p>
${table(["Quantity", "Formula", "Value"], [
  ["Size", "KLOC", `<b>${kloc.toFixed(2)}</b>`],
  ["Effort", "E = 2.4 × KLOC<sup>1.05</sup>", `<b>${E.toFixed(1)}</b> person-months`],
  ["Duration", "D = 2.5 × E<sup>0.38</sup>", `<b>${D.toFixed(1)}</b> months`],
  ["Average staff", "E ÷ D", `<b>${staff.toFixed(1)}</b> people`],
  ["Cost", `E × ₹${rate.toLocaleString("en-IN")} / person-month (blended, assumption)`, `<b>₹${((E * rate) / 1e5).toFixed(1)} lakh</b>`],
], { cls: "dense", widths: ["20%", "50%", "30%"] })}
${note(`<p><b>Cross-check against the bottom-up plan.</b> The PERT schedule (§6) has an expected critical path of ${s.end.toFixed(0)} working days (≈ ${(s.end / 21).toFixed(1)} months). With about 4 FTE (1 lead, 2 engineers, 1 QA, plus part-time SMEs), that is ≈ ${((s.end / 21) * 4).toFixed(1)} person-months, against COCOMO's ${E.toFixed(1)} person-months over ${D.toFixed(1)} months. The two estimates agree within ${Math.round((Math.abs((s.end / 21) * 4 - E) / E) * 100)}%. The plan is shorter than COCOMO's duration because it uses more people in parallel than COCOMO's ${staff.toFixed(1)}. COCOMO is calibrated on conventional projects, so it is used here as an independent sanity check.</p>`)}`),

    chap("6", "Schedule: PERT and critical path", `
${table(["ID", "Activity", "Inc.", "Pred.", "o", "m", "p", "t<sub>e</sub>", "ES", "EF", "Slack"], ACTS.map((a) => [
  `<b>${a.id}</b>`, esc(a.name), a.inc, a.deps.join(", ") || "—", a.o, a.m, a.p, `<b>${s.te[a.id]!.toFixed(1)}</b>`, s.ES[a.id]!.toFixed(1), s.EF[a.id]!.toFixed(1),
  s.critical.includes(a.id) ? pill("critical", "bad") : s.slack[a.id]!.toFixed(1),
]), { cls: "dense", widths: ["4%", "37%", "5%", "8%", "5%", "5%", "5%", "6%", "8%", "8%", "9%"] })}
<p>t<sub>e</sub> = (o + 4m + p) / 6, in working days. <b>Critical path: ${s.critical.join(" → ")}</b>. Expected duration <b>${s.end.toFixed(1)} days</b> (σ ≈ ${s.sigma.toFixed(1)}), so there is a ~95% chance of finishing within ${(s.end + 1.645 * s.sigma).toFixed(0)} working days, by ${workday(s.end + 1.645 * s.sigma)}. The project starts on ${START.toISOString().slice(0, 10)}.</p>
${mermaid(gantt, "Gantt chart from the CPM early-start dates (working days; critical activities highlighted).")}`),

    chap("7", "Agile execution: sprints, backlog, burndown", `
${table(["Sprint", "Weeks", "Goal (increment)"], [
  ["S1", "1–2", "I0 foundations + I1 confidence gate"], ["S2", "3–4", "I2 parser v2 (layout, sections, dates)"], ["S3", "5–6", "I2 OCR + I3 criteria model and versions"],
  ["S4", "7–8", "I3 routine, rank keys, explain; canary starts"], ["S5", "9–10", "I4 bias audit + self-ID"], ["S6", "11–12", "I5 review queue, AI assist, CSV export"],
  ["S7", "13–14", "I6 parallel run all roles + CI gate"], ["S8", "15–16", "I6 cut-over, decommission, handover"],
], { cls: "dense nw1", widths: ["10%", "12%", "78%"] })}
<h2>Product backlog</h2>
${table(["ID", "User story", "Priority", "Points", "Sprint"], STORIES.map((x) => [x[0], esc(x[1]), pill(x[2], x[2] === "Must" ? "info" : "muted"), `<span class="r">${x[3]}</span>`, x[4]]), { cls: "dense nw1", widths: ["8%", "68%", "9%", "7%", "8%"] })}
<p>Total <b>${totalPts} story points</b> over 8 sprints, about ${Math.round(totalPts / 8)} points per sprint planned velocity. <b>Definition of Done:</b> code reviewed, unit tests and evaluation gate pass, decision log unaffected, docs updated, demo to the product owner.</p>
${figure(burn, "Release burndown (planned): remaining story points at the end of each sprint vs the ideal line. Actuals are recorded against this baseline as sprints complete.")}`),

    chap("8", "Risk register", `
<p>Probability (P) and impact (I) on a 1–5 scale; score = P × I. ${pill("≥ 15 high", "bad")} ${pill("8–14 medium", "warn")} ${pill("&lt; 8 low", "ok")}</p>
${table(["ID", "Risk", "Category", "P", "I", "Score", "Mitigation", "Contingency", "Trigger"], RISKS.map((r) => {
  const sc = r[3] * r[4];
  return [`<b>${r[0]}</b>`, r[1], r[2], r[3], r[4], pill(String(sc), sc >= 15 ? "bad" : sc >= 8 ? "warn" : "ok"), esc(r[5]), esc(r[6]), esc(r[7])];
}), { cls: "dense", widths: ["4%", "22%", "9%", "3%", "3%", "6%", "23%", "16%", "14%"] })}`),

    chap("9", "Governance: RACI, communication, configuration management", `
${table(["Activity", "Project lead", "Engineers", "QA", "Talent ops", "Audit lead", "Head of Talent"], [
  ["Sprint planning & review", "A/R", "R", "R", "C", "I", "I"],
  ["Criteria changes", "I", "C", "I", "R", "C", "A"],
  ["Parser release (eval gate)", "A", "R", "R", "I", "I", "I"],
  ["Monthly bias audit", "I", "C", "I", "C", "R", "A"],
  ["Breach response", "C", "C", "I", "R", "R", "A"],
  ["Cut-over decision", "R", "C", "C", "C", "C", "A"],
], { cls: "dense" })}
<p class="muted">R responsible · A accountable · C consulted · I informed.</p>
<h2>Configuration management and version control</h2>
<ul>
<li><b>Git</b> with trunk-based development: short-lived feature branches, pull requests with review, and CI running <code>bun test</code> plus the parser evaluation gate.</li>
<li><b>Versioned artefacts:</b> the routine (code), the parser (<code>PARSER_VERSION</code>, stored on every parse), criteria (<code>criteria_versions</code>, stored on every decision), and the OCR and language models (pinned names). Any decision can therefore be reproduced exactly.</li>
<li><b>Change control:</b> criteria changes need a note and pass through preview and an automatic audit. Scope changes go to the project lead and sponsor.</li>
<li><b>Communication:</b> weekly status to the sponsor; a monthly audit report to the Head of Talent; incident notices within 1 working day of a critical audit.</li>
</ul>`),
  ].join("");

  return {
    id: "D5",
    title: "Project Plan",
    subtitle: "Incremental WBS that keeps screening running, the parsing work package, estimates, PERT/CPM, Gantt, sprints and a risk register including reputational risk.",
    purpose: "How the rebuild is delivered in seven increments without stopping screening, with a measurable acceptance threshold for parsing and a schedule computed from the activity network.",
    body,
  };
}
