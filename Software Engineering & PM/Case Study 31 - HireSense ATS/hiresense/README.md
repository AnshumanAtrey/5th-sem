# HireSense — explainable applicant screening

Working prototype for **SEPM Case Study 31: an applicant tracking system with a bias-audit requirement**.
The existing system's defects were an unexplainable ranking, ranking that tracked university tier, and a résumé parser that failed silently on 29% of documents.
HireSense replaces it with:

- **Explicit, configurable criteria.** Each job has versioned mandatory skills, experience bands, a threshold, a location and a remote flag.
- **The case study's screening routine, implemented exactly as written.** Every decision stores its path through the control-flow graph (N1…N11).
- **A parse-confidence gate.** Résumés with confidence < 0.6 go to a person instead of being silently rejected.
- **An append-only decision log.** Every automated rejection is logged with a reason code and a readable reason, and SQLite triggers refuse UPDATE and DELETE.
- **A recurring bias audit.** No declared group's selection rate may fall below 80% of the highest group's rate. Audits run monthly over a rolling 90-day window, and a significant breach pauses automated rejection for the role.
- **Shadow mode.** The legacy parser and ranker run on the same PDFs, so the improvement is measured rather than claimed.

> All candidates, résumés and outcomes are **synthetic**, generated deterministically by `bun run seed`.

## Run it

Requires [Bun](https://bun.sh) ≥ 1.3.

```bash
bun run setup      # install api + web, then seed 2,000 synthetic applications (~3 min)
bun run dev        # API on http://localhost:8787/api, web on http://localhost:3000
bun run test       # 82 tests with coverage
```

**OCR** for scanned PDFs is on by default: PP-OCRv6 tiny on ONNX Runtime (`ppu-paddle-ocr`), with pages rasterised by pdf.js on `@napi-rs/canvas`. The models (~5 MB) download on first use into `~/.cache/ppu-paddle-ocr`. The packages are `optionalDependencies`. Without them, or with `HIRESENSE_OCR=0`, scanned résumés go to manual review instead.

**Deliverables:** `cd docs && bun install && bun run build` regenerates the seven PDFs in `../deliverables/` from live data: the database, a fresh test run with coverage, and screenshots of the running web app if it is up.

**Optional:** the small local model for AI-assisted review. HireSense runs without it; the button just reports that the model isn't running.

```bash
brew install ollama        # or https://ollama.com/download
ollama serve &
ollama pull qwen3:1.7b     # 1.4 GB, runs on an 8 GB laptop
```

## Architecture

```
web/  Next.js 16 · React 19 · Tailwind 4 · shadcn/ui (radix-nova) · recharts · react-pdf
      Server components call the API; the browser reaches it through the /api rewrite.

api/  Bun · Hono · bun:sqlite (no database server to install)
  src/parsing/    PDF layout extraction (unpdf) → reading order → sections → fields → confidence
                  ocr.ts: no text layer → rasterise → PP-OCRv6 tiny → same layout items → same parser
  src/scoring/    experience-band score
  src/ranking/    routine.ts (the specified routine / CFG) · order.ts (explicit rank keys)
  src/audit/      fairness.ts (4/5ths rule, z-test) · service.ts (windows, severity, breach action)
  src/legacy/     the replaced system, for shadow comparison only
  src/screening.ts  service: parse + criteria → routine → policy → append-only log
  seed/           synthetic people, résumé PDF templates (pdfkit), ground truth, evaluation
  test/           white-box, boundary, metamorphic, parser, fairness and guardrail tests
```

**Module cohesion.** `ranking/` and `scoring/` import only `types.ts` and never `parsing/`. A change to a ranking rule is a new criteria *version* (data, not code), and a change to the routine cannot touch parsing.

**Protected attributes are segregated.** Self-identification (gender, age band) lives in its own `self_id` table, which only `audit/` reads. University tier is derived for the audit only. A metamorphic test proves that changing the university never changes a decision.

## Case-study figures, where they live

| Given | Where |
|---|---|
| Ranking routine | `api/src/ranking/routine.ts`. The CFG has 11 nodes and 14 edges, so **V(G) = 5**; the 5 basis paths are tested in `test/routine.test.ts`. |
| Parse confidence < 0.6 → manual review | `CONFIDENCE_GATE` in `routine.ts` (nodes N9 → N10) |
| 29% parse failure rate | The seed corpus uses layouts that break the legacy parser in exactly 29% of résumés, so the legacy parser measures **71.0%**. See the Parser health page. |
| Selection rate ≥ 80% of the highest group | `IMPACT_RATIO_MIN` in `audit/fairness.ts`. Boundary tests cover 0.80 (passes) and 0.78 (breaches). |

**Design parameters we chose** (they are not case-study figures):

| Parameter | Value |
|---|---|
| Minimum group size | 30 |
| Significance level | z ≥ 1.96 |
| Audit window | Rolling 90 days |
| Anomaly cap | 0.5 |
| Confidence weights | Skills 0.30, experience 0.30, email 0.15, location 0.15, name 0.10 |
| Parser acceptance targets | ≥ 95% success, ≤ 1% silent failures |
| OCR text-layer factor | Mean OCR word confidence |

## What the numbers say (seed corpus, 2,000 résumés)

| | Legacy | HireSense v2.2 |
|---|---|---|
| Correct decision fields | 71.0% | **99.0%** |
| Silent failures | 580 | 6 (0.3%) |
| Scanned résumés read | 0 / 160 | 157 / 160 (OCR, ~240 ms/page) |

- Both parser acceptance targets are met: ≥ 95% success and ≤ 1% silent failures. The mean OCR word confidence scales the parse confidence, so a poor scan still goes to review.
- **OCR engine choice was measured, not assumed.** On the 160 scanned résumés, PP-OCRv6 tiny scored 14/20 correct at 225 ms/doc on the first 20. tesseract.js scored 4/20 at 562 ms/doc and was dropped. After two date-parsing fixes found through this benchmark (OCR's `−` dash and missing spaces), PP-OCRv6 reached 157/160.
- **LiteOCR** runs the same PP-OCR models through ncnn, but it is a C++ library with no JavaScript bindings.
- The legacy ranker's tier bonus shows up as a Tier-3 impact ratio far below 0.80.
- v2 ignores tier. Its audit instead catches a genuine **proxy effect**: experience bands disadvantage the 18–29 age band on senior roles, which pauses auto-rejection for Senior Frontend Engineer.
