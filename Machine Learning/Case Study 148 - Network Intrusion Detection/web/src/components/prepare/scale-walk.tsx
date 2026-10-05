"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { data } from "@/lib/data"
import { toNumber } from "@/lib/ids"

const COLS = [
  { col: "Rate", name: "Speed (packets / second)" },
  { col: "Tot size", name: "Packet size (bytes)" },
  { col: "Header_Length", name: "Header bytes" },
  { col: "flow_duration", name: "How long it lasted (s)" },
]
const ROWS = [
  { key: "Benign · BenignTraffic", name: "Normal traffic" },
  { key: "DDoS · DDoS-PSHACK_Flood", name: "DDoS flood" },
  { key: "DoS · DoS-UDP_Flood", name: "DoS flood" },
  { key: "Recon · Recon-HostDiscovery", name: "Recon scan" },
]
const f = (v: number, d = 2) => (Math.abs(v) >= 1000 ? Math.round(v).toLocaleString("en-IN") : v.toFixed(d))

/** One number through the 4 preparation steps, with the real arithmetic; type your own value to try it. */
export function ScaleWalk() {
  const [col, setCol] = useState(COLS[0].col)
  const [row, setRow] = useState(ROWS[0].key)
  const [typed, setTyped] = useState<string | null>(null)
  const j = data.prep.columns.indexOf(col)
  const [median, mean, scale] = [data.prep.median[j], data.prep.mean[j], data.prep.scale[j]]
  const rawText = typed ?? String(data.examples[row][col])
  const value = toNumber(rawText)
  const bad = Number.isNaN(value)
  const filled = bad ? median : value
  const logged = Math.log1p(filled)
  const z = (logged - mean) / scale
  const pos = Math.min(100, Math.max(0, ((z + 3) / 6) * 100))

  const steps = [
    { n: 1, title: "Clean", body: bad ? <>&quot;{rawText}&quot; is not a usable number (text, blank, negative or infinite), so it becomes an <b>empty cell</b>.</> : <>{f(value)} is a normal number: it passes through unchanged.</> },
    { n: 2, title: "Fill gaps", body: bad ? <>The empty cell gets the <b>median</b> of this column in the training rows: <b className="font-mono">{f(median)}</b>.</> : <>Nothing is empty, so nothing to fill. (A gap would get the training median, {f(median)}.)</> },
    { n: 3, title: "Shrink", body: <>log(1 + {f(filled)}) = <b className="font-mono">{f(logged)}</b>. Huge numbers shrink a lot, small ones barely; 0 stays 0.</> },
    { n: 4, title: "Compare to typical", body: <>({f(logged)} − {f(mean)} average) ÷ {f(scale)} spread = <b className="font-mono">{z >= 0 ? "+" : "−"}{f(Math.abs(z))}</b></> },
  ]
  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-end gap-4">
        <div className="grid gap-1.5">
          <span className="mono-label text-muted-foreground">Column</span>
          <ToggleGroup type="single" variant="outline" size="sm" value={col} onValueChange={(v) => v && (setCol(v), setTyped(null))} className="flex-wrap justify-start">
            {COLS.map((c) => <ToggleGroupItem key={c.col} value={c.col} className="rounded-[2px]">{c.name}</ToggleGroupItem>)}
          </ToggleGroup>
        </div>
        <div className="grid gap-1.5">
          <span className="mono-label text-muted-foreground">Row</span>
          <ToggleGroup type="single" variant="outline" size="sm" value={typed === null ? row : ""} onValueChange={(v) => v && (setRow(v), setTyped(null))} className="flex-wrap justify-start">
            {ROWS.map((r) => <ToggleGroupItem key={r.key} value={r.key} className="rounded-[2px]">{r.name}</ToggleGroupItem>)}
          </ToggleGroup>
        </div>
        <label className="grid gap-1.5">
          <span className="mono-label text-muted-foreground">Or type any value</span>
          <Input value={rawText} onChange={(e) => setTyped(e.target.value)} className="h-8 w-40 font-mono" aria-label="Value to prepare" />
        </label>
      </div>
      <ol className="grid gap-px overflow-hidden rounded-md border bg-border md:grid-cols-4">
        {steps.map((s) => (
          <li key={s.n} className="grid content-start gap-2 bg-background p-4">
            <span className="flex items-center gap-2"><span className="mono-label grid size-6 place-items-center rounded-[2px] border text-[11px]">{s.n}</span><b>{s.title}</b></span>
            <p className="text-sm text-muted-foreground [&_b]:text-foreground">{s.body}</p>
          </li>
        ))}
      </ol>
      <div className="grid gap-2">
        <div className="relative h-10">
          <div className="absolute inset-x-0 top-4 h-1.5 rounded-[1px] bg-muted" />
          <div className="absolute top-3 h-3.5 w-px bg-ink" style={{ left: "50%" }} />
          <div className="absolute top-1 size-4 -translate-x-1/2 rounded-full border-2 border-white bg-orange shadow" style={{ left: `${pos}%` }} />
        </div>
        <div className="flex justify-between font-mono text-xs text-muted-foreground">
          <span>−3 far below typical</span><span>0 typical</span><span>far above typical +3</span>
        </div>
      </div>
    </div>
  )
}
