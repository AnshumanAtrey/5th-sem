import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { api, type ParserEval } from "@/lib/api"
import { date, num, pct } from "@/lib/format"
import { cn } from "@/lib/utils"

export const metadata = { title: "Parser health" }

const CASES: Record<string, { label: string; what: string }> = {
  standard: { label: "Standard layout", what: "Single column, standard headings and dates" },
  scanned: { label: "Scanned / outlined", what: "No text layer — read by the OCR fallback (PP-OCRv6 tiny)" },
  two_column: { label: "Two-column", what: "Sidebar layout written row by row across columns" },
  creative_headings: { label: "Creative headings", what: "“Toolbox”, “Where I’ve worked”, “Journey”…" },
  odd_dates: { label: "Unusual dates", what: "’18 – ’22, 2019/03 -> now, Since 2020, seasons" },
}

/** Work-package acceptance targets (see Project Plan, WP-P). */
const TARGET_SUCCESS = 0.95
const TARGET_SILENT = 0.01

export default async function ParsingPage() {
  const e = await api<ParserEval | null>("/parsing/eval")
  if (!e) return <PageHeader title="Parser health" description="No evaluation yet — run bun run seed in api/." />
  const failures = e.total - e.v2Ok
  const silentRate = e.v2Silent / e.total

  return (
    <>
      <PageHeader
        title="Parser health"
        description={`Both parsers measured against ground truth on ${num(e.total)} synthetic résumés. A parse is correct only if skills (F1 ≥ 0.8), years of experience (±1) and city are all right. Evaluated ${date(e.evaluatedAt, true)}.`}
      />

      <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        <StatCard label="Legacy parse success" value={pct(e.legacyOk / e.total, 1)} hint={`${num(e.total - e.legacyOk)} failures, all silent`} />
        <StatCard label="HireSense v2 parse success" value={pct(e.v2Ok / e.total, 1)} hint={`${num(failures)} failures`} />
        <StatCard label="Failures caught by the gate" value={pct(failures ? e.v2Detected / failures : 1, 1)} hint={`${num(e.v2Detected)} of ${num(failures)} routed to review (confidence < ${e.gate})`} />
        <StatCard label="Silent failures" value={`${num(e.total - e.legacyOk)} → ${num(e.v2Silent)}`} hint={`${num(e.v2FalseAlarm)} correct parses sent to review unnecessarily`} />
      </div>

      <div className="grid gap-4 @5xl/main:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <Card>
          <CardHeader>
            <CardTitle>By résumé layout</CardTitle>
            <CardDescription>29% of the corpus uses layouts that break the legacy parser, matching the case study’s 29% failure rate</CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Layout</TableHead>
                  <TableHead className="text-right">Résumés</TableHead>
                  <TableHead className="text-right">Legacy</TableHead>
                  <TableHead className="text-right">v2</TableHead>
                  <TableHead className="w-32 pr-4" title="correct · caught · silent">v2 split</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(e.byCase).sort((a, b) => b[1].total - a[1].total).map(([k, t]) => (
                  <TableRow key={k}>
                    <TableCell className="pl-4">
                      <div className="font-medium">{CASES[k]?.label ?? k}</div>
                      <div className="text-xs text-muted-foreground">{CASES[k]?.what}</div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{num(t.total)}</TableCell>
                    <TableCell className={cn("text-right tabular-nums", t.legacyOk < t.total && "text-outcome-reject")}>{pct(t.legacyOk / t.total)}</TableCell>
                    <TableCell className="text-right tabular-nums">{pct(t.v2Ok / t.total)}</TableCell>
                    <TableCell className="pr-4">
                      <div className="flex h-2 overflow-hidden rounded-full bg-muted">
                        <div className="bg-foreground/80" style={{ width: `${(t.v2Ok / t.total) * 100}%` }} />
                        <div className="bg-outcome-review" style={{ width: `${(t.v2Detected / t.total) * 100}%` }} />
                        <div className="bg-outcome-reject" style={{ width: `${(t.v2Silent / t.total) * 100}%` }} />
                      </div>
                      <div className="mt-1 text-[11px] text-muted-foreground tabular-nums">{t.v2Ok} · {t.v2Detected} · {t.v2Silent}</div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Acceptance threshold</CardTitle>
              <CardDescription>Work package WP-P: parser rebuild</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <Target label="Parse success" target={`≥ ${pct(TARGET_SUCCESS)}`} actual={pct(e.v2Ok / e.total, 1)} met={e.v2Ok / e.total >= TARGET_SUCCESS} />
              <Target label="Silent failure rate" target={`≤ ${pct(TARGET_SILENT)}`} actual={pct(silentRate, 2)} met={silentRate <= TARGET_SILENT} />
              <p className="text-xs text-muted-foreground">
                Scanned and outlined PDFs (8% of the corpus) have no text layer. They are rasterised and read by an on-device OCR model (PP-OCRv6 tiny,
                ONNX); its mean word confidence scales the parse confidence, so a shaky scan still lands in review.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>How confidence is computed</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>confidence = text-layer × Σ weights of fields found</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span>Skills 0.30</span><span>Experience 0.30</span><span>Email 0.15</span><span>Location 0.15</span><span>Name 0.10</span>
              </div>
              <ul className="list-disc space-y-1 pl-4 text-xs text-muted-foreground">
                <li>No text layer (&lt; 200 characters) → OCR; text-layer factor = mean OCR word confidence</li>
                <li>No text even after OCR → 0</li>
                <li>Field found outside its section → half weight</li>
                <li>Section present but unreadable → capped at 0.50</li>
                <li>&lt; 0.60 → manual review (node N9 → N10)</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Which field failed</CardTitle>
          <CardDescription>Count of résumés where each decision field was wrong</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-3">
          {(["skills", "years", "location"] as const).map((k) => (
            <div key={k} className="space-y-2">
              <div className="text-sm font-medium capitalize">{k === "years" ? "Experience" : k}</div>
              {(["legacy", "v2"] as const).map((p) => (
                <div key={p} className="flex items-center gap-2 text-xs">
                  <span className="w-12 text-muted-foreground">{p === "v2" ? "v2" : "Legacy"}</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div className={p === "v2" ? "h-full bg-foreground" : "h-full bg-muted-foreground/50"} style={{ width: `${(e.fieldFailures[p][k] / e.total) * 100 * 3}%` }} />
                  </div>
                  <span className="w-10 text-right tabular-nums">{e.fieldFailures[p][k]}</span>
                </div>
              ))}
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  )
}

function Target({ label, target, actual, met }: { label: string; target: string; actual: string; met: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <div>{label}</div>
        <div className="text-xs text-muted-foreground">target {target}</div>
      </div>
      <div className="text-right">
        <div className="font-semibold tabular-nums">{actual}</div>
        <div className={cn("text-xs", met ? "text-outcome-shortlist" : "text-outcome-waitlist")}>{met ? "met" : "not yet met"}</div>
      </div>
    </div>
  )
}
