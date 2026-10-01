import type { Data } from "../lib/data";
import { chap, esc, figure, img, mermaid, note, pill, table } from "../lib/layout";

export function d3(d: Data, shots: Record<string, string>) {
  const shot = (k: string, cap: string) => (shots[k] ? figure(img(shots[k], cap), cap) : "");
  const depRows = Object.entries(d.deps).sort().map(([m, ts]) => [`<span class="mono">${m}</span>`, ts.sort().map((t) => `<span class="mono">${t}</span>`).join(", ")]);
  const rankingClean = !(d.deps.ranking ?? []).includes("parsing") && !(d.deps.scoring ?? []).includes("parsing");

  const body = [
    chap("1", "Architecture overview", `
<p>HireSense is a layered, modular system. A web client (Next.js) talks to a screening API (Bun + Hono). The API is composed of single-purpose modules around one pure decision function. Parsing, scoring, ranking and auditing are separate modules that communicate only through plain data types (<code>ParsedResume</code>, <code>Criteria</code>, <code>Decision</code>).</p>
${mermaid(`flowchart TB
  subgraph Client[Web client · Next.js 16]
    UI[Pages: overview · jobs · candidate · review · log · audit · parser health · compare]
  end
  subgraph API[Screening API · Bun + Hono]
    H[HTTP routes] --> SVC[screening service]
    H --> AUD[audit service]
    SVC --> RT[ranking.routine · pure]
    RT --> SC[scoring.experience]
    SVC --> LOG[(decision log · append-only)]
    H --> P[parsing]
    P --> OCR[ocr · PP-OCRv6 tiny]
    P --> TX[taxonomy]
    AUD --> FR[fairness · 4/5ths + z-test]
    H --> LEG[legacy · shadow only]
  end
  DB[(SQLite)]
  LLM[[local LLM · qwen3:1.7b]]
  UI -->|/api rewrite| H
  SVC --> DB
  AUD --> DB
  H -.optional.-> LLM`, "Component view. Dashed: optional dependency with graceful fallback.")}
${table(["Decision", "Choice", "Why"], [
  ["Criteria representation", "Versioned data rows, not code", "Recruiters change rules without a deploy; every decision references the version it used (explainability)"],
  ["Decision core", "One pure function per the specified routine", "Directly testable (white-box); the CFG is read from the code; the trace is free"],
  ["Log integrity", "SQLite triggers refuse UPDATE/DELETE", "The storage layer enforces append-only, not only the application"],
  ["Migration", "Shadow mode (legacy runs on the same PDFs)", "Screening never stops; improvement is measured, not claimed"],
  ["Parsing reliability", "Confidence + gate + OCR fallback", "Turns silent failure into routed, explained review"],
  ["AI use", "Local small model for extraction only, grounded in text", "Never decides; hallucinated values are discarded"],
  ["Storage", "SQLite file", "Zero-ops for the prototype; schema portable to Postgres"],
], { cls: "dense", widths: ["20%", "30%", "50%"] })}`, undefined, false),

    chap("2", "Module decomposition, cohesion and coupling", `
<p>The case study asks that <b>parsing, scoring and ranking</b> be separate cohesive modules, so that <b>changing a ranking rule does not touch parsing</b>. The table gives each module's single responsibility and its cohesion type (Sommerville; the Yourdon & Constantine scale).</p>
${table(["Module", "Responsibility", "Cohesion", "Coupling to others"], [
  ["parsing/", "PDF → text items → reading order → sections → fields → confidence; OCR fallback", pill("Functional", "ok") + " one transformation", "Produces ParsedResume (data coupling)"],
  ["scoring/", "Years of experience → band score", pill("Functional", "ok"), "Reads Band[] (data)"],
  ["ranking/routine", "The specified screening routine; returns Decision + trace", pill("Functional", "ok"), "ParsedResume + Criteria in, Decision out (data)"],
  ["ranking/order", "Explicit rank keys; explain A vs B", pill("Functional", "ok"), "Rankable records (data)"],
  ["audit/fairness", "Selection rate, impact ratio, z-test for one dimension", pill("Functional", "ok"), "Rows of (outcome, group) (data)"],
  ["audit/service", "Windows, severity, breach action, persistence", pill("Sequential", "info") + " pipeline", "DB + fairness"],
  ["screening.ts", "Load parse + criteria → routine → policy → log", pill("Sequential", "info"), "DB + routine; the only writer of decisions"],
  ["legacy/", "Reconstructed old parser/ranker for shadow comparison", pill("Functional", "ok"), "Read-only use of pdf + taxonomy"],
], { cls: "dense", widths: ["15%", "40%", "20%", "25%"] })}
<h2>Measured dependency graph</h2>
<p>Generated from the static imports in <code>api/src</code> at build time:</p>
<div class="cols"><div>${table(["Module", "Imports from"], depRows, { cls: "dense" })}</div>
<div>${note(`<p><b>Isolation check: ${rankingClean ? "passes" : "FAILS"}.</b> <code>ranking</code> and <code>scoring</code> import only <code>types</code> (and ranking imports scoring), with no dependency on <code>parsing</code>. A ranking rule change is a new criteria <i>version</i> (data) or an edit inside <code>ranking/</code>, and neither can affect parsing.</p><p>The one cross-module read is <code>audit → parsing/taxonomy</code>, for the university-tier lookup the audit uses. It is a read-only table (data coupling), and the routine never sees it.</p>`, "key")}</div></div>
<p>No module uses <b>common coupling</b> (shared mutable globals) or <b>control coupling</b> (flags that steer another module's logic). Modules exchange only immutable records.</p>`),

    chap("3", "Class diagrams", `
${mermaid(`classDiagram
  direction TB
  class Job { +id  +title  +department  +autoRejectPaused  +pausedReason }
  class CriteriaVersion { +version  +note  +author  +createdAt }
  class Criteria { +mandatorySkills  +threshold  +location  +remoteAllowed }
  class Band { +min  +max  +score }
  class Candidate { +id  +name  +email }
  class SelfId { +gender  +ageBand }
  class Application { +appliedAt  +status  +score }
  class ParsedResume { +skills  +yearsExperience  +location  +university  +confidence  +parser }
  class DecisionLogEntry { +outcome  +tentativeOutcome  +reasonCode  +reason  +actor  +createdAt }
  class TraceStep { +node  +label  +result  +detail }
  class Audit { +window  +trigger  +severity  +minRatio  +action }
  class GroupResult { +group  +n  +rate  +impactRatio  +z }
  Job "1" *-- "1..*" CriteriaVersion
  CriteriaVersion *-- Criteria
  Criteria "1" *-- "1..*" Band
  Candidate "1" -- "0..1" SelfId
  Candidate "1" -- "1..*" Application
  Job "1" -- "0..*" Application
  Application "1" *-- "1..*" ParsedResume
  Application "1" *-- "1..*" DecisionLogEntry
  DecisionLogEntry "1" *-- "1..*" TraceStep
  DecisionLogEntry --> CriteriaVersion : used
  Job "1" -- "0..*" Audit
  Audit "1" *-- "1..*" GroupResult`, "Domain model. Composition marks ownership; every decision references the criteria version it used.")}
${mermaid(`classDiagram
  direction LR
  class Parser { +parseDocument(pdf) ParsedResume }
  class OcrService { +ocrLayout(pdf) Layout }
  class Screener { +screen(ParsedResume, Criteria) Decision }
  class BandScorer { +bandScore(years, bands) }
  class RankOrder { +compareRank(a, b)  +explainOrder(a, b) }
  class ScreeningService { +screenApplication(id) Decision }
  class AuditService { +runAudit(scope, window) Audit }
  class Fairness { +fairness(rows, dimension) }
  class LlmAssist { +aiExtract(text) Suggestion }
  Parser ..> OcrService : fallback
  ScreeningService ..> Screener
  Screener ..> BandScorer
  AuditService ..> Fairness
  LlmAssist ..> Parser : grounded against text`, "Service view. Dependencies point from parsing to OCR, and from screening to the routine and scoring. Nothing in scoring or ranking depends on parsing.")}`, undefined, true),

    chap("4", "Activity diagram: screening pipeline", `<div class="cols">
${mermaid(`flowchart TD
  A([Application received]) --> B[Store PDF + voluntary self-ID]
  B --> C[Extract text layer · pdf.js]
  C --> D{"≥ 200 characters?"}
  D -- no --> E[Rasterise pages]
  E --> E2[OCR · PP-OCRv6 tiny]
  E2 --> F[Parse · confidence × OCR word confidence]
  D -- yes --> G[Layout-aware parse · confidence]
  F --> H[Load job's current criteria version]
  G --> H
  H --> X([to screening →])`, "a. Ingestion and parsing.")}
${mermaid(`flowchart TD
  I{"N1 skills missing?"} -- yes --> J[reject]
  I -- no --> K[N3 score band]
  K --> L{"N4 ≥ T and location?"}
  L -- yes --> M[shortlist]
  L -- no --> N{"N6 ≥ T and remote?"}
  N -- yes --> M
  N -- no --> O[waitlist]
  J --> P{"N9 confidence < 0.6?"}
  M --> P
  O --> P
  P -- yes --> Q[manual review]
  P -- no --> R{"job paused and reject?"}
  R -- yes --> Q
  R -- no --> U[(append to decision log)]
  Q --> T[reviewer verifies · routine decides] --> U
  U --> V([rank · audited monthly])`, "b. Screening, policy and review.")}
</div>
<p class="muted">The routine (N1–N9) is exactly the specified one. The OCR fallback runs before it, and the pause policy after it, so neither changes the routine.</p>`, undefined, true),

    chap("5", "Sequence diagrams", `
${mermaid(`sequenceDiagram
  autonumber
  actor C as Candidate
  participant W as Web (Next.js)
  participant A as API (Hono)
  participant P as parsing
  participant O as OCR
  participant S as screening
  participant R as routine
  participant DB as SQLite
  C->>W: Upload PDF + self-ID
  W->>A: POST /api/applications (multipart)
  A->>P: extractLayout(pdf)
  alt no text layer
    P->>O: ocrLayout(pdf)
    O-->>P: text items + word confidence
  end
  P-->>A: ParsedResume (confidence)
  A->>DB: insert candidate, self_id, application, parses
  A->>S: screenApplication(id)
  S->>DB: load current parse + criteria version
  S->>R: screen(parsed, criteria)
  R-->>S: Decision + trace
  S->>S: apply pause policy
  S->>DB: INSERT decision_log (append-only)
  A-->>W: 201 {id, decision}
  W-->>C: Application page with reason and path`, "Sequence: submitting and screening an application.")}
${mermaid(`sequenceDiagram
  autonumber
  actor O as Criteria owner
  participant W as Web
  participant A as API
  participant S as screening
  participant AU as audit
  participant DB as SQLite
  O->>W: Edit bands / threshold
  W->>A: POST /criteria/preview
  A-->>W: outcome deltas + impact ratios (nothing saved)
  O->>W: Publish with note
  W->>A: POST /criteria
  A->>DB: INSERT criteria_versions (v+1)
  loop every application of the job
    A->>S: screenApplication(id)
    S->>DB: append decision
  end
  A->>AU: runAudit(job, last 90 days, trigger = criteria_change)
  AU->>DB: INSERT audits, set/clear auto_reject_paused
  A-->>W: version, before/after, audit severity`, "Sequence: changing criteria. Preview, publish, re-screen, then an automatic audit.")}`, undefined, true),

    chap("6", "State diagrams", `<div class="cols">
${mermaid(`stateDiagram-v2
  [*] --> Received
  Received --> Parsed : text layer or OCR
  Parsed --> Decided : routine (shortlist / waitlist / reject)
  Parsed --> ManualReview : confidence < 0.6 or auto-reject paused
  ManualReview --> Decided : reviewer verified
  Decided --> Parsed : new criteria version (re-screen)
  Decided --> [*]`, "Application lifecycle.")}
${mermaid(`stateDiagram-v2
  [*] --> Active
  Active --> Warning : breach, not significant
  Warning --> Active : re-audit passes
  Warning --> Paused : breach becomes significant
  Active --> Paused : significant breach (z ≥ 1.96)
  Paused --> Active : re-audit passes
  note right of Paused
    rejections routed to
    human review
  end note`, "Job automated-rejection state, driven by audits.")}
</div>`),

    chap("7", "Deployment and data model", `
<div class="cols">
${mermaid(`flowchart TB
  subgraph Browser
    B[Recruiter browser]
  end
  subgraph Host[Application host · laptop or VM]
    N[Next.js server :3000]
    API[Bun API :8787]
    F[(hiresense.db · SQLite WAL)]
    PDF[(resumes/*.pdf)]
    M[ONNX Runtime · PP-OCRv6 models ~5 MB]
    OL[Ollama :11434 · qwen3:1.7b · optional]
  end
  B -- HTTPS --> N
  N -- /api rewrite --> API
  API --> F
  API --> PDF
  API --> M
  API -.-> OL`, "Deployment diagram (prototype topology).")}
${mermaid(`erDiagram
  JOBS ||--o{ CRITERIA_VERSIONS : has
  JOBS ||--o{ APPLICATIONS : receives
  CANDIDATES ||--o{ APPLICATIONS : submits
  CANDIDATES ||--o| SELF_ID : declares
  APPLICATIONS ||--o{ PARSES : parsed_as
  APPLICATIONS ||--o{ DECISION_LOG : decided
  CRITERIA_VERSIONS ||--o{ DECISION_LOG : used_by
  JOBS ||--o{ AUDITS : audited
  DECISION_LOG {
    int id PK
    int application_id FK
    text outcome
    text reason_code
    int criteria_version_id FK
    text trace
    text actor
  }`, "Entity–relationship model. decision_log is append-only (triggers).")}
</div>`),

    chap("8", "User interface", `
<p>The web client is built on <b>shadcn/ui</b> (the <code>dashboard-01</code> block, ★125k) with a minimal, monochrome style, and semantic colour reserved for outcomes. Screens below are from the running prototype with the seeded data.</p>
${shot("overview", "Overview: outcomes over time, parser health, latest audit, open roles.")}
${shot("job", "Ranked candidates for a role. Rank keys are explicit, and parse confidence is shown with the 0.6 gate.")}
${shot("application", "Candidate page: the résumé PDF beside the decision, its path through the CFG, parsed fields and the shadow legacy result.")}
${shot("criteria", "Criteria editor: mandatory skills, bands, threshold, location and remote flag, with an impact preview before publishing.")}
${shot("audit", "Bias audit: impact ratio per declared group, HireSense vs legacy, audit specification and history.")}
${shot("compare", "Explaining one candidate's rank against another (#412 vs #87).")}`, undefined, true),
  ].join("");

  return {
    id: "D3",
    title: "Design Pack",
    subtitle: "Architecture, module cohesion justification, class, activity, sequence, state, deployment and data-model diagrams, and the user interface.",
    purpose: "How HireSense separates parsing, scoring and ranking into cohesive modules so that a ranking-rule change never touches parsing, shown with UML views and a dependency graph measured from the code.",
    body,
  };
}
