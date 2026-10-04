"use client"

import { FileUp, Download } from "lucide-react"
import Papa from "papaparse"
import { useMemo, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { asset } from "@/lib/base"
import { FAMILIES, FAMILY_COLOR, int, pct } from "@/lib/data"
import { loadModel, missingColumns, predict, type Flow, type Verdict } from "@/lib/ids"
import { cn } from "@/lib/utils"
import { ResultsTable, type Row } from "./results-table"

const MAX_ROWS = 20_000
const MAX_MB = 25

type Problem = { title: string; detail: string }

export function Scanner() {
  const [rows, setRows] = useState<Row[] | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [problem, setProblem] = useState<Problem | null>(null)
  const [notes, setNotes] = useState<string[]>([])
  const [threshold, setThreshold] = useState(50)
  const [busy, setBusy] = useState(false)
  const [over, setOver] = useState(false)

  async function score(text: string, name: string) {
    setBusy(true)
    setProblem(null)
    setNotes([])
    setRows(null)
    setFileName(name)
    try {
      const model = await loadModel()
      const parsed = Papa.parse<Flow>(text, { header: true, dynamicTyping: true, skipEmptyLines: true, preview: MAX_ROWS + 1 })
      const missing = missingColumns(model, parsed.meta.fields ?? [])
      if (missing.length === model.features.length) {
        return setProblem({ title: "This does not look like a flow file", detail: "None of the 45 feature columns were found. Check that the first row holds the column names." })
      }
      if (missing.length) {
        return setProblem({ title: `The file is missing ${missing.length} feature column${missing.length > 1 ? "s" : ""}`, detail: missing.join(", ") })
      }
      let flows = parsed.data
      if (!flows.length) return setProblem({ title: "The file has the right columns but no rows", detail: "Add at least one flow below the header row." })
      const extra: string[] = []
      if (flows.length > MAX_ROWS) {
        flows = flows.slice(0, MAX_ROWS)
        extra.push(`Only the first ${int(MAX_ROWS)} rows were checked.`)
      }
      const scored: Row[] = flows.map((flow, i) => {
        const v: Verdict = predict(model, flow)
        const truth = flow.true_label != null ? String(flow.true_label) : undefined
        return { i: i + 1, intrusion: v.intrusion, attackFamily: v.attackFamily, badCells: v.badCells, truth }
      })
      const bad = scored.reduce((s, r) => s + r.badCells, 0)
      if (bad) extra.push(`${int(bad)} cell${bad > 1 ? "s were" : " was"} blank, text, negative or infinite and got the training median. Treat those rows with care.`)
      setNotes(extra)
      setRows(scored)
    } catch (e) {
      setProblem({ title: "The file could not be read", detail: (e as Error).message })
    } finally {
      setBusy(false)
    }
  }

  function readFile(file: File | undefined) {
    if (!file) return
    if (file.size > MAX_MB * 1e6) return setProblem({ title: "The file is too large", detail: `It is ${(file.size / 1e6).toFixed(0)} MB; the limit is ${MAX_MB} MB.` })
    file.text().then((t) => score(t, file.name), () => setProblem({ title: "The file could not be read", detail: "Pick a plain-text CSV file." }))
  }

  const summary = useMemo(() => {
    if (!rows) return null
    const flagged = rows.filter((r) => r.intrusion * 100 >= threshold)
    const labelled = rows.filter((r) => r.truth)
    const agree = labelled.filter((r) => (r.truth !== "BenignTraffic") === r.intrusion * 100 >= threshold).length
    const byFamily = FAMILIES.slice(1).map((f) => ({ f, n: flagged.filter((r) => r.attackFamily === f).length })).filter((x) => x.n)
    return { flagged: flagged.length, agree: labelled.length ? agree / labelled.length : null, byFamily }
  }, [rows, threshold])

  function download() {
    if (!rows) return
    const csv = Papa.unparse(rows.map((r) => ({
      row: r.i, intrusion_score: r.intrusion.toFixed(4), verdict: r.intrusion * 100 >= threshold ? "intrusion" : "normal",
      attack_family: r.intrusion * 100 >= threshold ? r.attackFamily : "", ...(r.truth ? { true_label: r.truth } : {}),
    })))
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }))
    Object.assign(document.createElement("a"), { href: url, download: "flow-verdicts.csv" }).click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="grid gap-6">
      <label
        onDragOver={(e) => (e.preventDefault(), setOver(true))}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => (e.preventDefault(), setOver(false), readFile(e.dataTransfer.files[0]))}
        className={cn("grid cursor-pointer place-items-center gap-3 rounded-[2px] border border-dashed bg-panel px-6 py-10 text-center transition-colors focus-within:ring-3 focus-within:ring-ring/50",
          over && "border-primary bg-accent")}>
        <FileUp className="size-7 text-orange" aria-hidden />
        <span className="font-serif text-2xl font-light">{busy ? "Scoring…" : "Drop a CSV here, or choose a file"}</span>
        <span className="text-sm text-muted-foreground">{fileName && !busy ? `Last file: ${fileName}` : "Up to 20,000 flows, 25 MB"}</span>
        <input type="file" accept=".csv,text/csv" className="sr-only" onChange={(e) => (readFile(e.target.files?.[0]), (e.target.value = ""))} />
      </label>
      <div className="flex flex-wrap gap-2">
        <Button disabled={busy} className="notch mono-label h-10 rounded-none px-5" onClick={() => fetch(asset("/demo_flows.csv")).then((r) => r.text()).then((t) => score(t, "demo_flows.csv"))}>
          Scan the demo file (300 test flows)
        </Button>
        <Button variant="outline" asChild className="mono-label h-10 rounded-[2px] px-5">
          <a href={asset("/demo_flows.csv")} download><Download aria-hidden /> Download the demo file</a>
        </Button>
      </div>

      {problem && (
        <Alert variant="destructive">
          <AlertTitle>{problem.title}</AlertTitle>
          <AlertDescription className="break-words">{problem.detail}</AlertDescription>
        </Alert>
      )}
      {notes.map((n) => <Alert key={n}><AlertDescription>{n}</AlertDescription></Alert>)}

      {rows && summary && (
        <section aria-label="Results" className="grid gap-6">
          <div className="grid gap-6 rounded-[2px] border p-5 sm:p-6 lg:grid-cols-[1fr_1fr]">
            <dl className="grid grid-cols-3 gap-4">
              <div><dt className="mono-label text-muted-foreground">Flows checked</dt><dd className="mt-1 text-3xl font-semibold tabular">{int(rows.length)}</dd></div>
              <div><dt className="mono-label text-muted-foreground">Flagged</dt><dd className="mt-1 text-3xl font-semibold tabular text-orange">{int(summary.flagged)}</dd><dd className="text-sm text-muted-foreground">{pct(summary.flagged / rows.length, 0)} of flows</dd></div>
              {summary.agree != null && (
                <div><dt className="mono-label text-muted-foreground">Match the true label</dt><dd className="mt-1 text-3xl font-semibold tabular">{pct(summary.agree)}</dd></div>
              )}
              <div className="col-span-3 grid gap-2 pt-2 text-sm">
                <span className="flex justify-between"><span className="mono-label text-muted-foreground">Alarm threshold</span><span className="font-mono tabular">{threshold}%</span></span>
                <Slider min={5} max={95} step={5} value={[threshold]} onValueChange={([v]) => setThreshold(v)} aria-label="Alarm threshold" />
              </div>
            </dl>
            <div className="grid content-start gap-2">
              <h2 className="mono-label text-muted-foreground">Flagged flows by attack family</h2>
              {summary.byFamily.length === 0 && <p className="text-sm text-muted-foreground">Nothing crossed the alarm threshold.</p>}
              <ul className="grid gap-1.5">
                {summary.byFamily.map(({ f, n }) => (
                  <li key={f} className="grid grid-cols-[6.5rem_1fr_3rem] items-center gap-3 text-sm">
                    <span>{f}</span>
                    <span className="h-2 rounded-[1px] bg-muted"><span className="block h-full rounded-[1px]" style={{ width: `${(n / summary.flagged) * 100}%`, background: FAMILY_COLOR[f] }} /></span>
                    <span className="text-right font-mono text-xs tabular text-muted-foreground">{int(n)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-serif text-3xl font-light tracking-[-0.02em]">Every flow</h2>
            <Button variant="outline" size="sm" onClick={download} className="mono-label rounded-[2px]"><Download aria-hidden /> Download the verdicts</Button>
          </div>
          <ResultsTable rows={rows} threshold={threshold} />
        </section>
      )}
    </div>
  )
}
