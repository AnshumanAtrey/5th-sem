import type { Data } from "../lib/data";
import { chap, esc, mermaid, note, pill, table, tcap } from "../lib/layout";

interface Req {
  id: string;
  title: string;
  statement: string;
  measure: string;
  priority: "Must" | "Should" | "Could";
  source: string;
  design: string;
  tests: string[]; // substrings of test names
}

/** Single source for the requirement tables and the traceability matrix. */
export const REQS: { group: string; intro: string; reqs: Req[] }[] = [
  {
    group: "Résumé parsing",
    intro: "The case study states parsing works on 71% of documents and fails silently on the rest. These requirements make every parse result carry its own reliability, and make failure visible.",
    reqs: [
      { id: "FR-P1", title: "Parse with confidence", statement: "The system shall extract skills, years of experience, city, name and email from a PDF résumé and attach a parse confidence in [0, 1] with a per-field breakdown.", measure: "Every stored parse has confidence ∈ [0,1] and a breakdown of 5 weighted fields summing to 1.", priority: "Must", source: "CS: parsing quality", design: "parsing/parser.ts · WEIGHTS", tests: ["v2 extracts every decision field", "half weight"] },
      { id: "FR-P2", title: "No silent failure", statement: "A résumé with no usable text layer (< 200 characters) or with a recognised section that yields no data shall receive confidence < 0.6 and must never be rejected automatically.", measure: "0 automated rejections of documents with confidence < 0.6 (decision log query).", priority: "Must", source: "CS: 29% fail silently", design: "parser.ts · MIN_TEXT_CHARS, ANOMALY_CAP", tests: ["v2 detects it", "unreadable season dates"] },
      { id: "FR-P3", title: "OCR fallback", statement: "Where the PDF has no text layer, the system should recover text by OCR and scale confidence by the mean OCR word confidence.", measure: "Scanned-résumé parse success ≥ 95% on the evaluation corpus.", priority: "Should", source: "Work package WP-P", design: "parsing/ocr.ts (PP-OCRv6 tiny)", tests: ["recovers the text of a scanned"] },
      { id: "FR-P4", title: "Parse acceptance threshold", statement: "Released parser versions shall correctly parse ≥ 95% of the evaluation corpus with ≤ 1% silent failures (wrong but confidence ≥ 0.6).", measure: "Measured by seed/evaluate.ts against ground truth on every build.", priority: "Must", source: "CS: define acceptance threshold", design: "seed/evaluate.ts", tests: ["two-column", "creative headings"] },
    ],
  },
  {
    group: "Configurable ranking criteria",
    intro: "Ranking criteria must be explicit and configurable. Criteria are data, never code.",
    reqs: [
      { id: "FR-C1", title: "Explicit criteria per job", statement: "Each job shall have explicit criteria: mandatory skills, experience bands with scores, shortlist threshold, job city and a remote-allowed flag.", measure: "Criteria schema validated on save; invalid criteria rejected with a message.", priority: "Must", source: "CS: explicit and configurable", design: "types.ts Criteria · index.ts validateCriteria", tests: ["no mandatory skills configured", "band edges"] },
      { id: "FR-C2", title: "Versioned changes", statement: "Changing criteria shall create a new immutable version with author, timestamp and a mandatory change note; every decision shall reference the version it used.", measure: "100% of decision_log rows carry a criteria_version_id.", priority: "Must", source: "CS: explainability", design: "criteria_versions table", tests: [] },
      { id: "FR-C3", title: "Impact preview", statement: "Before publishing, a recruiter should be able to dry-run draft criteria on all applicants of the job and see outcome shifts and the fairness check.", measure: "Preview returns outcome counts and impact ratios without writing to the log.", priority: "Should", source: "Preventive maintenance", design: "POST /jobs/:id/criteria/preview", tests: [] },
      { id: "FR-C4", title: "Ranking change isolation", statement: "A change to a ranking rule shall not require any change to the parsing module.", measure: "ranking/ and scoring/ import nothing from parsing/ (static dependency check).", priority: "Must", source: "CS outcome: modular design", design: "module boundaries (D3 §2)", tests: [] },
    ],
  },
  {
    group: "Screening and explainability",
    intro: "Nobody could explain why candidate 412 ranked above candidate 87. Every decision and every rank order must be explainable from stored facts.",
    reqs: [
      { id: "FR-S1", title: "Specified routine", statement: "Screening shall implement the routine exactly as given: missing mandatory skills → reject; else score experience band; shortlist if score ≥ threshold and location matches, else if score ≥ threshold and remote allowed; else waitlist; route to manual review if parse confidence < 0.6.", measure: "All 8 CFG paths produce the specified outcome (D1).", priority: "Must", source: "CS: ranking routine", design: "ranking/routine.ts screen()", tests: ["P1 ", "P2 ", "P3 ", "P4 ", "P5 "] },
      { id: "FR-S2", title: "Decision explanation", statement: "Every decision shall store a reason code, a human-readable reason and the trace of CFG nodes visited with the values tested at each.", measure: "100% of decisions have non-empty reason and a trace ending at N9/N10.", priority: "Must", source: "CS: explainability", design: "Decision.trace · decision_log.trace", tests: ["every decision carries a human-readable reason"] },
      { id: "FR-S3", title: "Explicit rank order", statement: "Candidates of a job shall be ordered by explicit keys only: outcome, then band score, then application time, then application id; the system shall answer \"why is A above B\" with the first differing key.", measure: "Compare view returns winner and key for any two applications.", priority: "Must", source: "CS: candidate 412 vs 87", design: "ranking/order.ts explainOrder()", tests: ["earlier application ranks higher", "outcome dominates score"] },
      { id: "FR-S4", title: "Protected attributes excluded", statement: "Screening and ranking shall not read university, name, email or any self-declared attribute.", measure: "Metamorphic tests: changing these leaves outcome and score unchanged.", priority: "Must", source: "CS: internal review (tier)", design: "self_id table segregated", tests: ["university = IIT Bombay", "name and email do not affect"] },
    ],
  },
  {
    group: "Audit logging",
    intro: "Every automated rejection must be logged with a reason.",
    reqs: [
      { id: "FR-L1", title: "Log every decision", statement: "Every automated and human decision shall be appended to a decision log with outcome, tentative outcome, reason code, reason, score, criteria version, parser version, confidence, trace, actor and timestamp.", measure: "count(decision_log) ≥ count(applications); every rejection has reason_code.", priority: "Must", source: "CS: log every rejection", design: "decision_log table · screening.ts", tests: [] },
      { id: "FR-L2", title: "Append-only", statement: "The decision log shall be append-only: update and delete shall be refused by the storage layer.", measure: "SQL UPDATE/DELETE on decision_log raise an error.", priority: "Must", source: "Auditability", design: "SQLite triggers", tests: ["UPDATE is refused", "DELETE is refused"] },
      { id: "FR-L3", title: "Export", statement: "Authorised users shall be able to filter the log (outcome, reason, job, actor) and export it as CSV.", measure: "CSV export contains every filtered row with 14 columns.", priority: "Should", source: "Audit evidence", design: "GET /decisions.csv", tests: [] },
    ],
  },
  {
    group: "Bias audit",
    intro: "Selection rate for any declared group must not fall below 80% of the highest group's rate.",
    reqs: [
      { id: "FR-F1", title: "Fairness rule (testable form)", statement: "For every declared group g with n_g ≥ 30 decided applications in the audit window, SR_g ≥ 0.80 × max_h SR_h, where SR = shortlisted ÷ decided. A group below this is a breach.", measure: "0.80 passes, 0.78 breaches; groups with n < 30 reported but not enforced.", priority: "Must", source: "CS: audit requirement", design: "audit/fairness.ts", tests: ["ratio exactly 0.80 passes", "ratio 0.78 breaches", "groups under 30"] },
      { id: "FR-F2", title: "Recurring audit", statement: "The audit shall run monthly over a rolling 90-day window per job and company-wide, after every criteria change, and on demand.", measure: "One scheduled audit per scope per month in the audits table.", priority: "Must", source: "CS: periodic bias audit", design: "audit/service.ts runAudit", tests: ["fair outcomes → pass"] },
      { id: "FR-F3", title: "Breach consequence", statement: "A statistically significant breach (z ≥ 1.96) shall pause automated rejection for the job until a re-audit passes; a non-significant breach shall open a warning incident.", measure: "After a critical audit, new rejections for the job are routed to manual review.", priority: "Must", source: "CS: defined consequence", design: "service.ts severityOf · screening policy", tests: ["significant breach → critical", "small-sample breach → warning", "passing re-audit resumes"] },
      { id: "FR-F4", title: "Self-identification", statement: "Declared groups shall come from voluntary self-identification stored separately from screening data, with \"Prefer not to say\" excluded from comparison.", measure: "self_id is read only by audit/; 'Prefer not to say' has no ratio.", priority: "Must", source: "Privacy", design: "self_id table", tests: ["'Prefer not to say' is never compared"] },
    ],
  },
  {
    group: "Human review",
    intro: "Low-confidence parses go to a person.",
    reqs: [
      { id: "FR-R1", title: "Review queue", statement: "Applications in manual review shall be listed oldest-first with the reason they were routed and the withheld automated outcome.", measure: "Queue shows reason code, confidence and tentative outcome per row.", priority: "Must", source: "CS: manual review", design: "GET /review", tests: [] },
      { id: "FR-R2", title: "Verified re-screen", statement: "A reviewer shall correct the parsed fields; the same routine then decides with confidence 1, and the log records the reviewer as actor.", measure: "Reviewer decisions have actor 'reviewer:<name>'.", priority: "Must", source: "Accountability", design: "POST /applications/:id/review", tests: [] },
      { id: "FR-R3", title: "AI-assisted extraction", statement: "A local small language model could propose field values; any value not found in the résumé text shall be discarded.", measure: "Hallucinated skills, cities and employers are dropped.", priority: "Could", source: "Reviewer productivity", design: "parsing/llm.ts", tests: ["drops hallucinated", "a headline or education line is not a job"] },
    ],
  },
];

const NFRS: [string, string, string, string][] = [
  ["NFR-1 Performance", "Screening decision for a parsed application", "≤ 50 ms p95 (routine is O(skills)); OCR ≤ 3 s per page", "Routine < 1 ms per call in unit tests; OCR 237 ms/page on an M2 laptop"],
  ["NFR-2 Throughput", "Volume from the case study", "90,000 applications/year ≈ 360 per working day (250 days); peak 5× = 1,800/day", "Seed of 2,000 parses + screens in ≈ 4 min including OCR"],
  ["NFR-3 Availability", "Screening during migration", "Screening never stops: legacy remains primary until each increment's exit criteria are met (D5)", "Shadow mode runs both systems on the same PDFs"],
  ["NFR-4 Auditability", "Decision records", "100% of decisions reproducible from (parse, criteria version, routine version)", "Append-only log; versions on every row"],
  ["NFR-5 Privacy", "Personal & self-ID data", "Self-ID visible to audit role only; never shown to recruiters; data minimised (DPDP Act 2023)", "Separate table; not returned by application APIs"],
  ["NFR-6 Maintainability", "Rule change effort", "A ranking rule change touches 0 files in parsing/; criteria change needs no deploy", "Static import check; criteria are data"],
  ["NFR-7 Usability", "Recruiter task", "Explain any decision in ≤ 2 clicks from the ranked list", "Candidate page shows path, reason, rank keys"],
  ["NFR-8 Portability", "Deployment", "Runs on a single host with Bun; SQLite file DB; no external services required", "OCR and AI optional with graceful fallback"],
];

export function d2(d: Data) {
  const find = (needle: string) => d.tests.cases.find((c) => c.name.includes(needle));
  const testRefs = (r: Req) =>
    r.tests.length
      ? r.tests.map((t) => { const c = find(t); return c ? `<span class="mono">${c.file.replace("test/", "")}:${c.line}</span>` : `<span class="muted">${esc(t)}</span>`; }).join("<br>")
      : `<span class="muted">API smoke / review</span>`;
  const all = REQS.flatMap((g) => g.reqs);

  const body = [
    chap("1", "Introduction", `
<h2>1.1 Purpose</h2>
<p>This Software Requirements Specification defines the requirements for <b>HireSense</b>, the rebuilt applicant-screening system of a staffing company that screens <b>90,000 applications a year</b>. It follows the structure of IEEE Std 830-1998. It is written so that every requirement is <i>testable</i>: each one has a measurable acceptance criterion and traces to a design element and a test (§7).</p>
<h2>1.2 Scope</h2>
<p>HireSense ingests PDF résumés, parses them with a confidence score, screens them with the specified routine against explicit per-job criteria, ranks candidates by explicit keys, logs every decision append-only, and runs a recurring bias audit with a defined consequence on breach. Out of scope: interview scheduling, offers, payroll, and candidate-facing job boards.</p>
<h2>1.3 Problem statement (from the case study)</h2>
${note(`<p>The current tool ranks candidates and recruiters trust the ranking. Nobody can explain why candidate 412 ranked above candidate 87. An internal review found the ranking correlated with the applicant's university tier far more strongly than with later job performance. Résumé parsing works on 71% of documents and fails silently on the rest.</p>`, "key")}
<h2>1.4 Definitions</h2>
${table(["Term", "Definition"], [
  ["Parse confidence", "Weighted share of decision fields extracted reliably, × text-layer factor (1, or mean OCR word confidence). Range 0–1."],
  ["Criteria version", "Immutable snapshot of a job's mandatory skills, bands, threshold, city and remote flag."],
  ["Selection rate (SR)", "Shortlisted ÷ decided applications for a group in an audit window."],
  ["Impact ratio", "SR of a group ÷ highest SR among comparable groups (4/5ths rule when ≥ 0.80)."],
  ["Declared group", "Group from voluntary self-identification (gender, age band), or derived for audit only (university tier)."],
  ["Silent failure", "A parse that is wrong but has confidence ≥ 0.6, so it is decided automatically."],
  ["Shadow mode", "The legacy system runs on the same input for comparison but never affects decisions."],
], { cls: "dense", widths: ["22%", "78%"] })}
<h2>1.5 References</h2>
<ul><li>Case Study 31, SEPM, B.Tech CSE (given data used verbatim).</li><li>IEEE Std 830-1998, Recommended Practice for Software Requirements Specifications.</li><li>I. Sommerville, <i>Software Engineering</i> (prescribed text): requirements engineering and validation.</li><li>Uniform Guidelines on Employee Selection Procedures, 29 CFR §1607.4(D): the four-fifths rule.</li><li>Digital Personal Data Protection Act, 2023 (India).</li></ul>`, undefined, false),

    chap("2", "Overall description", `
<h2>2.1 Product perspective</h2>
<p>HireSense replaces the legacy screener without stopping screening: it runs in <b>shadow mode</b> beside the legacy system until each increment's exit criteria are met (Project Plan, D5). It is a web application (Next.js) with a screening API (Bun + Hono), a SQLite store, an optional on-device OCR model and an optional local language model.</p>
<h2>2.2 Stakeholders and user classes</h2>
${table(["Stakeholder", "Interest", "Influence", "Key needs"], [
  ["Recruiter", "Fast, defensible shortlists", "High", "Ranked list with reasons; trust that unreadable résumés are not dropped"],
  ["Reviewer (talent ops)", "Clear manual-review queue", "Medium", "See why an application was routed; correct fields quickly"],
  ["Criteria owner / hiring manager", "Hire the right people", "High", "Configure criteria without engineers; preview impact"],
  ["Compliance / audit lead", "Defensible, non-discriminatory process", "High", "Recurring audit, evidence, defined breach response"],
  ["Head of Talent", "Reputation, throughput", "High", "Escalations, KPIs"],
  ["Candidates", "Fair and explainable treatment", "Low (individually) · high (collectively, reputational)", "Not rejected because a parser failed; data protection"],
  ["Engineering", "Maintainable system", "Medium", "Isolation of parsing and ranking; tests; versioning"],
], { cls: "dense", widths: ["20%", "22%", "18%", "40%"] })}
<h2>2.3 Product functions</h2>
<ul><li>Ingest résumé PDFs; parse with confidence; OCR fallback for scans.</li><li>Configure, version and preview ranking criteria per job.</li><li>Screen with the specified routine; rank by explicit keys; explain any decision or ordering.</li><li>Append-only decision log with search and CSV export.</li><li>Manual review queue with optional AI-assisted extraction.</li><li>Recurring bias audit with severity grading and automatic consequence.</li></ul>
<h2>2.4 Constraints</h2>
<ul><li>Use the case-study figures as given: the routine, the 0.6 confidence gate, the 29% failure rate, and the 80% rule.</li><li>Screening must continue during the rebuild.</li><li>Self-declared attributes must never be inputs to screening.</li><li>Runs on commodity hardware (reference: 8 GB laptop).</li></ul>
<h2>2.5 Assumptions and dependencies</h2>
<ul><li>Self-identification is voluntary. A non-trivial share answers "Prefer not to say" (${d.selfIdMix.find((m: any) => m.gender === "Prefer not to say")?.n ?? "—"} of ${d.total.toLocaleString("en-IN")} in the demo data).</li><li>University tiers are an illustrative list used only to audit for the proxy the internal review found.</li><li>All candidate data in the prototype is synthetic.</li></ul>`),

    chap("3", "Requirement elicitation and analysis", `
<p>Requirements were elicited by <b>document analysis</b> of the case study and its internal-review findings, by <b>scenario analysis</b> of the failure modes (silent parse failure, unexplainable ranking, tier correlation), and by <b>prototyping</b>: a working prototype was built and measured against ground truth, and it exposed requirements the text did not state, such as the anomaly cap and the minimum group size.</p>
${table(["Problem in the case study", "Root cause", "Requirement response"], [
  ["Nobody can explain why 412 ranked above 87", "Opaque score; implicit ordering", "FR-S1–S3: specified routine, stored trace, explicit rank keys"],
  ["Ranking tracked university tier", "Tier used directly or by proxy", "FR-S4 (excluded inputs) + FR-F1–F4 (audit catches proxies)"],
  ["Parsing fails silently on 29%", "No confidence; failure looks like 'no skills'", "FR-P1–P4: confidence, routing, OCR, acceptance threshold"],
  ["Rejections not traceable", "No reason logging", "FR-L1–L3: append-only log with reasons"],
], { cls: "dense" })}`, undefined, false),

    chap("4", "Functional requirements", REQS.map((g, gi) => `
<h2>4.${gi + 1} ${esc(g.group)}</h2><p class="muted">${esc(g.intro)}</p>
${table(["ID", "Requirement", "Acceptance criterion (measurable)", "Priority"], g.reqs.map((r) => [`<span class="req">${r.id}</span><br><span class="muted">${esc(r.title)}</span>`, esc(r.statement), esc(r.measure), pill(r.priority, r.priority === "Must" ? "info" : "muted")]), { widths: ["15%", "45%", "30%", "10%"] })}`).join("") + `
<h2>4.7 Fairness requirement as an executable test</h2>
${note(`<p><b>Given</b> 100 decided applicants in group A with 50 shortlisted, and 100 in group B with 40 shortlisted, <b>when</b> the audit runs, <b>then</b> B's impact ratio is 0.40 / 0.50 = <b>0.80</b> and the audit passes.<br>
<b>Given</b> B instead has 39 shortlisted, <b>then</b> the ratio is 0.78, a <b>breach</b> is reported for B, and the job's severity is graded by significance (FR-F3).<br>
<b>Given</b> B has only 10 decided applicants, <b>then</b> B is reported as low-sample and cannot trigger a breach.</p>`, "key")}`),

    chap("5", "Non-functional requirements", table(["Requirement", "Scope", "Target", "Evidence"], NFRS.map((r) => r.map(esc)), { cls: "dense", widths: ["18%", "20%", "36%", "26%"] })),

    chap("6", "Use cases", `
${mermaid(`flowchart LR
  R["👤 Recruiter"]:::actor
  O["👤 Criteria owner"]:::actor
  V["👤 Reviewer"]:::actor
  C["👤 Candidate"]:::actor
  A["👤 Audit lead"]:::actor
  S["⏱ Scheduler"]:::actor
  subgraph HS[HireSense]
    direction TB
    U1([UC1 Submit application])
    U2([UC2 Screen application])
    U3([UC3 Configure & preview criteria])
    U4([UC4 Review low-confidence application])
    U5([UC5 Explain ranking A vs B])
    U6([UC6 Run bias audit])
    U7([UC7 Respond to breach])
    U8([UC8 Export decision log])
  end
  C --- U1
  R --- U5
  R --- U8
  O --- U3
  V --- U4
  S --- U6
  A --- U6
  A --- U7
  U1 -. «include» .-> U2
  U3 -. «include» .-> U2
  U4 -. «include» .-> U2
  U7 -. «extend» .-> U6
  classDef actor fill:#fff,stroke:#17191c,stroke-width:1.2px`, "Use-case diagram. Screening (UC2) is included by submission, by review and by criteria publication. A breach response extends the audit.")}
${table(["UC", "Actor", "Main flow", "Alternative / exception", "Reqs"], [
  ["UC1 Submit application", "Candidate", "Upload PDF + optional self-ID → stored → UC2", "Not a PDF / > 5 MB → rejected with message", "FR-P1, FR-F4"],
  ["UC2 Screen application", "System", "Parse → (OCR if no text) → routine → policy → log → rank", "Confidence < 0.6 → manual review; job paused → rejections to review", "FR-P2, FR-S1, FR-L1"],
  ["UC3 Configure criteria", "Criteria owner", "Edit → preview impact → publish with note → re-screen job → audit", "Invalid bands/skills → error; no note → blocked", "FR-C1–C3, FR-F2"],
  ["UC4 Review application", "Reviewer", "Open queue → compare PDF and fields → (AI suggest) → confirm → routine decides", "Model unavailable → manual entry", "FR-R1–R3"],
  ["UC5 Explain ranking", "Recruiter", "Pick A and B → first differing rank key + both paths", "Different jobs → compare outcomes, not ranks", "FR-S2, FR-S3"],
  ["UC6 Run bias audit", "Scheduler / audit lead", "Monthly / on change / on demand → compute ratios → grade → record", "Insufficient sample → reported only", "FR-F1, FR-F2"],
  ["UC7 Respond to breach", "Audit lead", "Warning → incident; critical → pause auto-reject → remediate → re-audit", "Re-audit passes → resume", "FR-F3"],
  ["UC8 Export log", "Recruiter / audit lead", "Filter → CSV", "—", "FR-L3"],
], { cls: "dense", widths: ["17%", "13%", "33%", "25%", "12%"] })}`),

    chap("7", "Requirements traceability matrix", `
<p>Each requirement traces forward to the design element that implements it and the automated test that verifies it (test references are <code>file:line</code> in <code>api/test/</code>). Requirements verified at system level are verified through the API and the review checklist.</p>
${table(["Req", "Source", "Design element", "Verified by", "Status"], all.map((r) => [`<span class="req">${r.id}</span>`, esc(r.source), `<span class="mono">${esc(r.design)}</span>`, testRefs(r), r.tests.length && r.tests.every((t) => find(t) && !find(t)!.failed) ? pill("Verified", "ok") : r.tests.length ? pill("Check", "warn") : pill("System test", "info")]), { cls: "dense", widths: ["9%", "20%", "31%", "26%", "14%"] })}
${tcap("Coverage of the matrix")}
<p>${all.length} functional requirements · ${all.filter((r) => r.tests.length).length} verified by automated unit/integration tests · ${all.filter((r) => !r.tests.length).length} verified by system tests through the API. Non-functional requirements are verified by measurement (§5).</p>`),

    chap("8", "Feasibility and validation", `
${table(["Feasibility", "Assessment"], [
  ["Technical", "Feasible: a working prototype implements every Must requirement. Measured 99.0% parse success and 6 silent failures in 2,000 résumés; all automated tests pass."],
  ["Operational", "Feasible: shadow mode and increments let recruiters keep working; the review queue load fell from 215 to 94 after OCR."],
  ["Economic", "Open-source stack (Bun, Next.js, SQLite, PP-OCR, Qwen3 1.7B), no licence fees; runs on existing laptops/servers. Effort estimate in D5."],
  ["Legal / ethical", "Self-ID is voluntary and segregated; adverse-impact monitoring follows the four-fifths rule; personal data minimised (DPDP Act 2023)."],
], { cls: "dense", widths: ["18%", "82%"] })}
<h2>Requirement validation checklist</h2>
${table(["Check", "Result"], [
  ["Every requirement has a unique ID and a measurable acceptance criterion", pill("Yes", "ok")],
  ["Case-study figures used verbatim (routine, 0.6, 29%, 80%)", pill("Yes", "ok")],
  ["Design parameters we chose are labelled as such (n ≥ 30, z ≥ 1.96, 90-day window, weights)", pill("Yes", "ok")],
  ["No requirement conflicts (e.g. 'never reject a low-confidence parse' vs routine): resolved by N9 overriding to manual review", pill("Yes", "ok")],
  ["Each Must requirement is traced to design and verification", pill("Yes", "ok")],
], { cls: "dense", widths: ["85%", "15%"] })}`),
  ].join("");

  return {
    id: "D2",
    title: "Software Requirements Specification",
    subtitle: "Explainability, configurable criteria, audit logging and the fairness threshold, as measurable and traceable requirements.",
    purpose: "IEEE 830-style SRS for HireSense. Every requirement carries an acceptance criterion and traces to the module that implements it and the test that verifies it.",
    body,
  };
}
