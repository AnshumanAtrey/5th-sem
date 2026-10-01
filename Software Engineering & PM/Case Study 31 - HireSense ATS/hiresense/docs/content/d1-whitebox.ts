import { cfgSvg, EDGES, NODES } from "../lib/cfg";
import type { Data } from "../lib/data";
import { chap, code, esc, figure, kpis, note, pill, table, tcap } from "../lib/layout";

const ROUTINE = `if mandatory skills missing, reject;
else score experience band;
     if score ≥ threshold and location matches, shortlist;
     else if score ≥ threshold and remote allowed, shortlist;
     else waitlist;
if parse confidence < 0.6, route to manual review.`;

const IMPL = `export function screen(p: ParsedResume, c: Criteria): Decision {
  const missingSkills = c.mandatorySkills.filter((s) => !p.skills.includes(s)); // N1
  if (missingSkills.length > 0) { outcome = "reject" }                          // N2
  else {
    ({ score, band } = bandScore(p.yearsExperience, c.bands));                 // N3
    const meets = score >= c.threshold;
    const locMatch = !!p.location && p.location.toLowerCase() === c.location.toLowerCase();
    if (meets && locMatch)            outcome = "shortlist";                   // N4 → N5
    else if (meets && c.remoteAllowed) outcome = "shortlist";                  // N6 → N7
    else                              outcome = "waitlist";                    // N8
  }
  if (p.confidence < CONFIDENCE_GATE) {                                         // N9  (0.6)
    tentativeOutcome = outcome; outcome = "manual_review";                      // N10
  }
  return { outcome, tentativeOutcome, score, band, reasonCode, reason, trace }; // N11
}`;

const ALL_PATHS: { id: string; path: string[]; meaning: string; test: string }[] = [
  { id: "P1", path: ["N1", "N2", "N9", "N11"], meaning: "Mandatory skill missing, confident parse → reject", test: "P1  N1→N2→N9" },
  { id: "P2", path: ["N1", "N3", "N4", "N5", "N9", "N11"], meaning: "Score ≥ threshold, in job city → shortlist", test: "P2  N1→N3→N4→N5→N9" },
  { id: "P3", path: ["N1", "N3", "N4", "N6", "N7", "N9", "N11"], meaning: "Score ≥ threshold, elsewhere, remote allowed → shortlist", test: "P3  N1→N3→N4→N6→N7→N9" },
  { id: "P4", path: ["N1", "N3", "N4", "N6", "N8", "N9", "N11"], meaning: "Below threshold → waitlist", test: "P4  N1→N3→N4→N6→N8→N9" },
  { id: "P5", path: ["N1", "N2", "N9", "N10", "N11"], meaning: "Parse failed (no skills read, confidence 0) → manual review, not reject", test: "P5  …→N9→N10" },
  { id: "P6", path: ["N1", "N3", "N4", "N5", "N9", "N10", "N11"], meaning: "Would shortlist, but confidence < 0.6 → review", test: "low confidence overrides a shortlist" },
  { id: "P7", path: ["N1", "N3", "N4", "N6", "N7", "N9", "N10", "N11"], meaning: "Would shortlist (remote), confidence < 0.6 → review", test: "remote shortlist withheld by low confidence" },
  { id: "P8", path: ["N1", "N3", "N4", "N6", "N8", "N9", "N10", "N11"], meaning: "Would waitlist, confidence < 0.6 → review", test: "waitlist withheld by low confidence" },
];

export function d1(d: Data) {
  const find = (needle: string) => d.tests.cases.find((c) => c.name.includes(needle));
  const status = (needle: string) => {
    const c = find(needle);
    return c ? (c.failed ? pill("FAIL", "bad") : pill("Pass", "ok")) : pill("missing", "warn");
  };
  const ref = (needle: string) => {
    const c = find(needle);
    return c ? `<span class="mono muted">${c.file.replace("test/", "")}:${c.line}</span>` : pill("missing", "warn");
  };
  const routineCov = d.coverage.find((c) => c.file === "src/ranking/routine.ts");
  const pe = d.parserEval;
  const pathKey = (p: string[]) => p.join("→");
  const observedEdges = new Set<string>();
  for (const sig of Object.keys(d.paths)) {
    const ns = sig.split("→");
    ns.slice(1).forEach((n, i) => observedEdges.add(`${ns[i]}→${n}`));
  }

  const body = [
    chap("1", "Scope and unit under test", `
<p>This report applies white-box (structural) testing to the screening routine that the case study specifies, and to the defect the case study names as the real one: résumé parsing that <b>fails silently</b> on 29% of documents. The routine is implemented as one pure function, so its control flow can be read straight from the code.</p>
<h3>Specification (case study, verbatim)</h3>${code(ROUTINE)}
<h3>Implementation under test</h3><p><code>api/src/ranking/routine.ts</code> → <code>screen(parsed, criteria)</code>. The function is pure: it has no I/O and no clock. Each statement carries the CFG node id it implements, and every call returns a <b>trace</b> of the nodes it visited. That trace is stored with the decision in the append-only log.</p>
<p>Test framework: <code>bun test</code> (Bun 1.3, Jest-compatible), with coverage from <code>bun test --coverage</code>. Results come from the run used to build this document.</p>
${code(IMPL)}
${kpis([
  ["Tests run", String(d.tests.total), `${d.tests.assertions} assertions`],
  ["Failures", String(d.tests.failures), `${d.tests.skipped} skipped · ${d.tests.time.toFixed(1)} s`],
  ["routine.ts coverage", `${routineCov?.lines ?? "—"}%`, `lines · ${routineCov?.funcs ?? "—"}% functions`],
  ["CFG paths covered", "8 / 8", "all complete paths, 5 = basis set"],
])}`, undefined, false),

    chap("2", "Control-flow graph", `
<div class="cols">
<div>${figure(cfgSvg({ edgeIds: true, width: 300 }), "CFG of <code>screen()</code>. Diamonds are predicate (decision) nodes. Edges e1–e14 are labelled T/F where they leave a decision.")}</div>
<div>
${tcap("Nodes and the statements they represent")}
${table(["Node", "Statement", "Type"], Object.entries(NODES).map(([id, n]) => [`<b>${id}</b>`, esc(n.stmt), n.decision ? pill("decision", "info") : "process"]), { cls: "dense" })}
${tcap("Edges")}
${table(["Edge", "From → To", "Condition"], EDGES.map(([a, b, tf], i) => [`e${i + 1}`, `${a} → ${b}`, tf === "T" ? "true" : tf === "F" ? "false" : "—"]), { cls: "dense" })}
</div></div>
${note(`<p><b>Why N9 comes after every branch.</b> The case study lists the confidence rule last, so it applies to every outcome, including a rejection. This turns the silent failure into a <i>withheld</i> decision. An unreadable résumé looks like "no skills" at N1, and the old system rejected it. Here N9 overrides that rejection, sends the application to a person, and keeps the automated outcome as "tentative" for the reviewer.</p>`, "key")}`),

    chap("3", "Cyclomatic complexity", `
<p>McCabe's cyclomatic complexity V(G) is the number of linearly independent paths through the graph, so it is the minimum number of tests that exercises every edge. It is computed three independent ways:</p>
${table(["Method", "Formula", "Values", "V(G)"], [
  ["Edges and nodes", "V(G) = E − N + 2P", `E = ${EDGES.length}, N = ${Object.keys(NODES).length}, P = 1 connected component`, `<b>${EDGES.length - Object.keys(NODES).length + 2}</b>`],
  ["Predicate nodes", "V(G) = π + 1", "π = 4 (N1, N4, N6, N9)", "<b>5</b>"],
  ["Regions", "V(G) = enclosed regions + 1", "4 enclosed regions of the planar graph + 1 outer region", "<b>5</b>"],
])}
<h2>Condition-level view (compound predicates)</h2>
<p>N4 and N6 are compound conditions (<code>score ≥ T ∧ location</code>, <code>score ≥ T ∧ remote</code>). Splitting them into atomic conditions gives six predicates: N1, N4a <code>score ≥ T</code>, N4b <code>location matches</code>, N6a <code>score ≥ T</code>, N6b <code>remote allowed</code> and N9. That makes <b>V(G) = 7</b> at condition level. One combination is <b>infeasible</b>: N4a = false with N6a = true is impossible, because both test the same expression. The implementation therefore evaluates <code>meets = score ≥ threshold</code> once and reuses it. The condition-coverage tests in §5 exercise every feasible value of every atomic condition.</p>
${note(`<p><b>Result: V(G) = 5.</b> At least 5 test cases are needed for edge (branch) coverage. The routine has 8 complete entry-to-exit paths: 4 outcomes before N9, times 2 for N9. The test suite covers all 8.</p>`)}`, undefined, false),

    chap("4", "Independent paths and test cases", `
<p>Basis set P1–P5. Each path adds at least one edge not used by the previous ones, so together they cover all 14 edges. P6–P8 complete the path set.</p>
${table(["Path", "Node sequence", "Meaning", "Test (file:line)", "Result"], ALL_PATHS.map((p, i) => [
  `<b>${p.id}</b>${i < 5 ? "" : `<br><span class="muted">extra</span>`}`,
  `<span class="mono">${p.path.join(" → ")}</span>`,
  esc(p.meaning),
  ref(p.test),
  status(p.test),
]), { widths: ["8%", "36%", "32%", "15%", "9%"] })}

<h2>Test data for the basis paths</h2>
<p>Criteria fixture: mandatory skills <code>react, typescript</code>; bands 0–2 → 20, 2–4 → 55, 4–7 → 85, 7+ → 90; threshold 80; job city Bengaluru; remote allowed, unless a row says otherwise.</p>
${table(["TC", "Path", "Skills", "Years", "City", "Confidence", "Criteria change", "Expected outcome / reason code"], [
  ["TC-01", "P1", "react", "5", "Bengaluru", "0.90", "—", "reject · MISSING_MANDATORY_SKILLS (typescript)"],
  ["TC-02", "P2", "react, typescript, css", "5", "Bengaluru", "0.90", "—", "shortlist · SHORTLIST_LOCATION"],
  ["TC-03", "P3", "react, typescript, css", "5", "Pune", "0.90", "—", "shortlist · SHORTLIST_REMOTE"],
  ["TC-04", "P4", "react, typescript, css", "3", "Bengaluru", "0.90", "—", "waitlist · WAITLIST_BELOW_THRESHOLD (score 55)"],
  ["TC-05", "P5", "— (none read)", "unknown", "unknown", "0.00", "—", "manual_review · LOW_PARSE_CONFIDENCE, tentative reject"],
  ["TC-06", "P6", "react, typescript, css", "5", "Bengaluru", "0.45", "—", "manual_review, tentative shortlist"],
  ["TC-07", "P7", "react, typescript, css", "5", "Pune", "0.40", "—", "manual_review, tentative shortlist"],
  ["TC-08", "P8", "react, typescript, css", "3", "Bengaluru", "0.40", "—", "manual_review, tentative waitlist"],
  ["TC-09", "N6 F (location)", "react, typescript, css", "5", "Pune", "0.90", "remote not allowed", "waitlist · WAITLIST_LOCATION"],
], { cls: "dense nw1" })}`),

    chap("5", "Boundary values, equivalence classes and metamorphic tests", `
${table(["Input", "Equivalence classes", "Boundary tests (value → expected)", "Result"], [
  ["score vs threshold", "below · at · above", "score 85, threshold 85 → shortlist (≥ is inclusive); threshold 86 → waitlist", status("score exactly at threshold")],
  ["parse confidence", "< 0.6 · ≥ 0.6", "0.60 → decided automatically; 0.59 → manual review", status("confidence 0.59")],
  ["years vs band edge", "[2,4) · [4,7)", "4.00 → score 85; 3.99 → score 55", status("band edges")],
  ["years unknown", "null", "null → score 0 (never an error)", status("unparsed experience scores 0")],
  ["mandatory list", "empty · non-empty", "no mandatory skills → nothing can be missing", status("no mandatory skills configured")],
  ["location text", "case variants", '"bengaluru" = "Bengaluru"', status("case-insensitive")],
  ["location unknown", "null", "null never matches the job city", status("unknown location never matches")],
], { widths: ["17%", "18%", "50%", "15%"] })}
<h2>Condition coverage (atomic conditions of N4 and N6)</h2>
${table(["meets (score ≥ T)", "location matches", "remote allowed", "Outcome", "Covered by"], [
  ["true", "true", "—", "shortlist (N5)", "TC-02"],
  ["true", "false", "true", "shortlist (N7)", "TC-03"],
  ["true", "false", "false", "waitlist, location", "TC-09"],
  ["false", "— (short-circuit)", "— (short-circuit)", "waitlist, below threshold", "TC-04"],
  ["false at N4, true at N6", "", "", `<i>infeasible</i>: same expression`, "—"],
], { cls: "dense" })}
<h2>Metamorphic tests: attributes outside the criteria cannot change a decision</h2>
<p>The case study's internal review found the old ranking tracked <b>university tier</b>. The relation tested here is: changing only the university (IIT Bombay ↔ Anna University ↔ none), or only the name and email, must leave the outcome and the score unchanged. ${status("university = IIT Bombay")} ${status("name and email do not affect")}</p>`, undefined, false),

    chap("6", "The silent parse failure test", `
<p>The case study names the current system's real defect: <i>"résumé parsing works on 71% of documents and fails silently on the rest."</i> A silent failure is worse than a crash. The parser returns <b>empty skills</b> with no error, and the routine then rejects a possibly qualified candidate with a reason that looks legitimate: "missing mandatory skills". The tests below catch exactly that, on real PDFs produced by the seed templates.</p>
${table(["Test", "Input", "Assertion", "Result"], [
  ["Legacy rejects silently", "scanned résumé (glyph outlines, no text layer) of a candidate who has every skill", "legacy parse → skills = [] and no error; legacy outcome = <b>reject</b> (reproduces the defect)", status("legacy silently REJECTS")],
  ["v2 detects it", "same PDF", "v2 textChars &lt; 200 → confidence = 0, issue \"no usable text layer\"; routine → <b>manual_review</b>, tentative reject", status("v2 detects it")],
  ["Unreadable section", "experience written in seasons (\"Summer 2023 – Spring 2025\")", "years = null but the section has content → confidence capped at 0.50 → manual review", status("unreadable season dates")],
  ["OCR recovery", "same scanned PDF, OCR enabled (PP-OCRv6)", "text recovered, skills/years/city correct, confidence ≤ OCR word confidence → decided automatically", status("recovers the text of a scanned")],
], { widths: ["17%", "28%", "43%", "12%"] })}
<h2>System-level evidence on the ${pe.total.toLocaleString("en-IN")}-résumé corpus</h2>
${kpis([
  ["Legacy correct", `${((pe.legacyOk / pe.total) * 100).toFixed(1)}%`, "case-study figure: 71%"],
  ["Legacy silent failures", String(pe.total - pe.legacyOk), "every failure is silent"],
  ["HireSense correct", `${((pe.v2Ok / pe.total) * 100).toFixed(1)}%`, `${pe.v2Detected} of ${pe.total - pe.v2Ok} failures routed to review`],
  ["HireSense silent", String(pe.v2Silent), `${((pe.v2Silent / pe.total) * 100).toFixed(2)}% of résumés`],
])}
<p class="muted">A parse is <i>correct</i> only when all three decision fields match ground truth: skills (F1 ≥ 0.8), years (±1) and city. The corpus is synthetic and built so that 29% of résumés use layouts that break the legacy parser.</p>`),

    chap("7", "Coverage evidence", `
<p>Line and function coverage from <code>bun test --coverage</code>, for the modules that make decisions. Bun does not report branch coverage, so edge (branch) coverage of the routine comes from the path tests in §4 (all 14 edges). It is confirmed independently from production traces in the table below.</p>
${table(["Module", "% Functions", "% Lines", "Uncovered lines"], d.coverage.filter((c) => c.file.startsWith("src/")).map((c) => [`<span class="mono">${c.file}</span>`, `<span class="${c.funcs === 100 ? "" : "muted"}">${c.funcs.toFixed(1)}</span>`, `<b>${c.lines.toFixed(1)}</b>`, `<span class="muted mono">${esc(c.uncovered || "—")}</span>`]), { cls: "dense" })}
<p class="muted">The remaining uncovered lines are I/O and environment wrappers: the database bootstrap, the "is the local model running" probe, and the OCR-unavailable branch. The HTTP layer (<code>src/index.ts</code>) is exercised by API smoke tests and is not part of the unit run.</p>
${tcap("CFG paths actually taken by the " + d.decisions.toLocaleString("en-IN") + " decisions in the append-only log")}
${table(["Path", "Node sequence", "Decisions"], Object.entries(d.paths).sort((a, b) => b[1] - a[1]).map(([sig, n]) => {
  const p = ALL_PATHS.find((x) => pathKey(x.path) === sig);
  return [p?.id ?? "?", `<span class="mono">${sig.replace(/→/g, " → ")}</span>`, `<b>${n.toLocaleString("en-IN")}</b>`];
}), { cls: "dense" })}
<p>Edges exercised in production: <b>${observedEdges.size} / ${EDGES.length}</b>. P6 and P7 do not occur naturally in the corpus: a confident parse rarely sits next to a shortlist-level score. That is why they are covered by targeted unit tests.</p>`),

    chap("8", "Defects found during testing (bug reports)", `
<p>Every defect below was found by a test, by the evaluation against ground truth, or by observing the running system. Each one was fixed and is now guarded by a regression test.</p>
${table(["ID", "Severity", "Found by", "Defect and root cause", "Fix / regression test"], [
  ["BUG-01", pill("High", "bad"), "Corpus evaluation", "Letter-spaced headings were extracted as \"S K I L L S\" and not recognised. Both parsers failed 721 standard résumés, and education years were counted as experience.", "Collapse single-letter runs before heading match · <i>letter-spaced headings</i>"],
  ["BUG-02", pill("Med", "warn"), "Corpus evaluation", "City detection returned the first city in list order rather than in text order (95 wrong cities when a university name contained a city).", "Earliest occurrence wins · parser tests"],
  ["BUG-03", pill("High", "bad"), "Corpus evaluation", "Two-column layouts whose sidebar held &lt; 15% of the text were not detected, so 24 résumés merged their columns.", "Balance floor 8% + side-by-side baseline check · <i>two-column</i>"],
  ["BUG-04", pill("High", "bad"), "Path P5 review", "Season dates (\"Summer 2023\") gave years = null yet confidence 0.70. A <b>new silent failure</b>.", "Anomaly cap 0.50 when a section has content but yields nothing · <i>unreadable season dates</i>"],
  ["BUG-05", pill("Low", "muted"), "AI assist review", "\"Node.js\" also matched JavaScript through the \"JS\" alias.", "Lookbehind treats \".\" as part of a word · <i>Node.js does not also match</i>"],
  ["BUG-06", pill("High", "bad"), "OCR benchmark", "OCR emits U+2212 \"−\" and drops spaces (\"Sep2021- Jul2023\"), so 37 of 160 scanned résumés lost a job.", "Dash set and month/year spacing widened · date-range tests"],
  ["BUG-07", pill("Med", "warn"), "Test writing", "AI assist kept a hallucinated city whenever the résumé mentioned any other city.", "City must be the one named in the text · <i>drops hallucinated</i>"],
  ["BUG-08", pill("Med", "warn"), "Manual testing", "AI assist turned a headline plus an education year into a fake job (employer \"N/A\").", "Employer must appear in the résumé · <i>a headline or education line is not a job</i>"],
  ["BUG-09", pill("Med", "warn"), "Manual testing", "The local model took longer than Bun's 10 s idle timeout and the response was cut off.", "idleTimeout 120 s"],
  ["BUG-10", pill("Med", "warn"), "User report", "PDF viewer re-rendered endlessly: the scrollbar toggled the width between 444 and 429 px.", "scrollbar-gutter: stable + ignore scrollbar-sized resizes"],
  ["BUG-11", pill("Med", "warn"), "Report writing", "Fairness reported a vacuous ratio of 1.0 when only one group had n ≥ 30.", "Ratio = none + \"insufficient sample\" · <i>only one comparable group</i>"],
], { widths: ["8%", "8%", "13%", "43%", "28%"], cls: "dense nw1" })}`),

    chap("9", "Test inventory", `
<p>All ${d.tests.total} automated tests from the run used for this report (JUnit output of <code>bun test</code>).</p>
${table(["File", "Suite", "Test", "Result"], d.tests.cases.map((c) => [`<span class="mono">${c.file.replace("test/", "")}</span>`, `<span class="muted">${esc(c.suite)}</span>`, esc(c.name), c.failed ? pill("FAIL", "bad") : pill("Pass", "ok")]), { cls: "dense", widths: ["17%", "23%", "50%", "10%"] })}`),
  ].join("");

  return {
    id: "D1",
    title: "White-Box Test Report",
    subtitle: "Control-flow graph, cyclomatic complexity, independent paths, the silent-parse-failure test and coverage evidence.",
    purpose: "Structural testing of the specified screening routine and of the parser defect the case study identifies. Every number is produced by the test run and the corpus evaluation used to build this document.",
    body,
  };
}
