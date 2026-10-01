import type { Data } from "../lib/data";
import { chap, code, kpis, pill, table } from "../lib/layout";

export function d0(d: Data) {
  const pe = d.parserEval;
  const body = [
    chap("1", "Deliverables required by the case study", table(["Case-study deliverable", "Document", "What it contains"], [
      ["White-Box Test Report: CFG, cyclomatic complexity, independent paths, coverage evidence", "<b>D1</b>", "CFG (11 nodes, 14 edges), V(G) = 5 by three methods, 8/8 paths tested, boundary/condition/metamorphic tests, the silent-parse-failure test, coverage, 11 bug reports"],
      ["SRS: explainability, configurability, logging and fairness requirements with thresholds", "<b>D2</b>", "IEEE 830 structure, stakeholders, 22 measurable functional requirements, NFRs, use cases, traceability matrix to code and tests, feasibility"],
      ["Design Pack: class diagram, activity diagram, module cohesion justification", "<b>D3</b>", "Architecture, cohesion/coupling with a measured dependency graph, class, activity, sequence, state, deployment and ER diagrams, UI screens"],
      ["Audit Specification: metrics, frequency, thresholds, breach response procedure", "<b>D4</b>", "Selection rate, impact ratio, z-test, 9 acceptance tests, rolling windows, severity ladder, RACI procedure, live results"],
      ["Project Plan: incremental WBS, Gantt, risk register including reputational risk", "<b>D5</b>", "Charter, 7 strangler increments, WBS, work package WP-P, COCOMO, PERT/CPM, Gantt, sprints, backlog, burndown, 12-risk register"],
      ["Maintenance Process: recurring audit cycle as preventive maintenance", "<b>D6</b>", "Maintenance types, drift sources, monthly cycle and calendar, change and release gates, KPIs, audit history, maintenance log"],
    ], { widths: ["38%", "10%", "52%"] }), undefined, false),

    chap("2", "Outcomes the case study asks for", table(["Expected outcome", "Evidence"], [
      ["A cyclomatic complexity value with the complete independent path set and tests", "D1 §3–4: V(G) = 5; basis paths P1–P5 plus P6–P8; every path has a passing test"],
      ["A test that specifically catches silent parse failure", "D1 §6: scanned résumé → legacy rejects silently; HireSense routes to review (and OCR recovers it)"],
      ["Fairness expressed as a number with a defined consequence when breached", "D4 §4–7: IR ≥ 0.80 for groups with n ≥ 30; a significant breach pauses automated rejection"],
      ["A modular design where changing a ranking rule does not touch parsing", "D3 §2: ranking and scoring import nothing from parsing (measured); criteria are versioned data"],
      ["A recurring audit process rather than a one-off report", "D4 §5 + D6 §3: monthly rolling audits, triggered audits, governance review, KPIs"],
    ], { widths: ["42%", "58%"] })),

    chap("3", "Mapping to the course rubric", table(["Rubric item (marks)", "Where"], [
      ["Problem analysis & requirement gathering (2)", "D2 §1–3"],
      ["SRS & documentation quality (3)", "D2 (IEEE 830), D0–D6"],
      ["UML design & architecture (3)", "D3: use-case (D2 §6), class, activity, sequence, state, deployment, ER"],
      ["Use of software-engineering tools (3)", "Bun test + coverage, JUnit, Mermaid UML, SQLite, Git, Next.js/shadcn, Ollama, PP-OCR, headless-browser doc build"],
      ["Project planning: WBS, Gantt, agile artefacts (3)", "D5 §3–7"],
      ["Testing artefacts: test cases, bug reports (2)", "D1 §4–9"],
      ["GitHub repository & version control (2)", "<code>hiresense/</code> monorepo (D5 §9)"],
      ["Presentation & viva (2)", "Live prototype demo"],
    ], { widths: ["45%", "55%"] })),

    chap("4", "The working prototype", `
${kpis([
  ["Applications screened", d.total.toLocaleString("en-IN"), "synthetic, 6 roles, 12 months"],
  ["Parse success", `${((pe.v2Ok / pe.total) * 100).toFixed(1)}%`, `legacy ${((pe.legacyOk / pe.total) * 100).toFixed(1)}%`],
  ["Silent failures", `${pe.total - pe.legacyOk} → ${pe.v2Silent}`, "legacy → HireSense"],
  ["Automated tests", `${d.tests.total} ${d.tests.failures ? "" : "✓"}`, `${d.tests.assertions} assertions, ${d.tests.failures} failures`],
])}
<p>Every number in D0–D6 is generated from the running prototype by <code>docs/build.ts</code>: the seeded database, a fresh test run with coverage, and the code itself. The documents cannot drift from the system.</p>
${code(`cd hiresense
bun run setup      # install + seed 2,000 synthetic résumés (PDFs, parses, decisions, audits)
bun run dev        # API http://localhost:8787/api · web http://localhost:3000
bun run test       # unit + integration tests with coverage
cd docs && bun run build   # regenerate these PDFs from live data`)}
<p class="muted">Stack: Next.js 16 · shadcn/ui · Bun + Hono · bun:sqlite · pdf.js · PP-OCRv6 tiny (ONNX) · optional Qwen3 1.7B via Ollama. All candidate data is synthetic. ${pill("Case-study figures used as given: routine, 0.6, 29%, 80%", "info")}</p>`),
  ].join("");

  return {
    id: "D0",
    title: "Submission Index",
    subtitle: "HireSense: deliverables, outcomes and rubric mapping for Case Study 31.",
    purpose: "Start here. Six documents answer the six required deliverables, backed by a working prototype whose data, tests and code generate every number in them.",
    body,
  };
}
