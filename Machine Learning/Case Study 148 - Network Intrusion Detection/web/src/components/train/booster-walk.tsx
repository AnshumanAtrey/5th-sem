"use client"

import { useEffect, useMemo, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Slider } from "@/components/ui/slider"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { data, pct } from "@/lib/data"
import { loadModel, toNumber, type Model, type Tree } from "@/lib/ids"

const ROWS = [
  { key: "Benign · BenignTraffic", name: "Normal traffic" },
  { key: "DDoS · DDoS-PSHACK_Flood", name: "DDoS flood" },
  { key: "Recon · Recon-HostDiscovery", name: "Recon scan" },
  { key: "missed · DNS_Spoofing (gets through)", name: "A spoofing attack it misses" },
]
const sigmoid = (v: number) => 1 / (1 + Math.exp(-v))

/** Walk one row down a tree, recording the questions; returns the end point's score. */
function walk(t: Tree, x: number[], model: Model, record = false) {
  const steps: string[] = []
  let node = 0
  while (!t.leaf[node]) {
    const f = t.feature[node]
    const raw = Math.expm1(t.threshold[node] * model.prep.scale[f] + model.prep.mean[f])  // cut-off back in real units
    const left = x[f] <= t.threshold[node]
    if (record) steps.push(`${model.features[f]} ${left ? "≤" : ">"} ${raw >= 100 ? Math.round(raw).toLocaleString("en-IN") : raw.toFixed(2)}`)
    node = left ? t.left[node] : t.right[node]
  }
  return { value: t.value[node], steps }
}

/** Add gradient boosting's trees one by one and watch a real row's chance of attack settle. */
export function BoosterWalk() {
  const [model, setModel] = useState<Model | null>(null)
  const [row, setRow] = useState(ROWS[0].key)
  const [trees, setTrees] = useState(300)
  useEffect(() => { loadModel().then(setModel) }, [])

  const walkData = useMemo(() => {
    if (!model) return null
    const flow = data.examples[row]
    const x = model.features.map((name, j) => {
      const v = toNumber(flow[name])
      return (Math.log1p(Number.isNaN(v) ? model.prep.median[j] : v) - model.prep.mean[j]) / model.prep.scale[j]
    })
    const first = walk(model.binary.trees[0][0], x, model, true)
    const totals = [model.binary.baseline[0]]
    for (const round of model.binary.trees) totals.push(totals[totals.length - 1] + walk(round[0], x, model).value)
    return { first, totals }
  }, [model, row])

  if (!model || !walkData) return <Skeleton className="h-72 w-full rounded-md" />
  const { first, totals } = walkData
  const W = 760, H = 180, P = 28
  const px = (i: number) => P + (i / 300) * (W - 2 * P)
  const py = (p: number) => H - 24 - p * (H - 48)
  const path = totals.map((t, i) => `${i ? "L" : "M"}${px(i).toFixed(1)} ${py(sigmoid(t)).toFixed(1)}`).join(" ")
  const now = sigmoid(totals[trees])
  const truth = row.startsWith("Benign") ? "normal" : "an attack"
  return (
    <div className="grid gap-5">
      <ToggleGroup type="single" variant="outline" size="sm" value={row} onValueChange={(v) => v && setRow(v)} className="flex-wrap justify-start" aria-label="Row to follow">
        {ROWS.map((r) => <ToggleGroupItem key={r.key} value={r.key} className="rounded-[2px]">{r.name}</ToggleGroupItem>)}
      </ToggleGroup>
      <div className="grid gap-4 rounded-md border p-4 md:grid-cols-[1fr_1.4fr]">
        <div className="grid content-start gap-2">
          <p className="mono-label text-muted-foreground">Tree 1 of 300: the questions this row meets, top to bottom</p>
          <ol className="grid gap-1 font-mono text-sm">
            {first.steps.map((s, i) => <li key={i} className="flex gap-2"><span className="text-muted-foreground">{i + 1}.</span>{s}?</li>)}
          </ol>
          <p className="text-sm">End point (the bottom box it lands in): <b className="font-mono">{first.value >= 0 ? "+" : "−"}{Math.abs(first.value).toFixed(3)}</b>{" "}
            <span className="text-muted-foreground">({first.value >= 0 ? "a nudge towards attack" : "a nudge towards normal"})</span></p>
        </div>
        <div className="grid content-start gap-3">
          <div className="flex items-baseline justify-between">
            <span className="mono-label text-muted-foreground">After {trees} {trees === 1 ? "tree" : "trees"}</span>
            <span className="font-mono text-2xl tabular" style={{ color: now >= 0.5 ? "var(--orange)" : "var(--normal)" }}>{pct(now, 1)}</span>
          </div>
          <Slider min={0} max={300} step={1} value={[trees]} onValueChange={([v]) => setTrees(v)} aria-label="Trees added" />
          <p className="text-sm text-muted-foreground">
            Running score (the starting score plus every tree&apos;s nudge so far) {totals[trees] >= 0 ? "+" : "−"}{Math.abs(totals[trees]).toFixed(3)}, turned into a chance with the S-curve: {pct(now, 1)}. This row is really {truth}.
          </p>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-md border" role="img" aria-label="Chance of attack as trees are added">
        <line x1={P} x2={W - P} y1={py(0.5)} y2={py(0.5)} stroke="var(--border)" strokeDasharray="4 3" />
        <text x={W - P} y={py(0.5) - 4} textAnchor="end" className="fill-muted-foreground text-[10px]">50%: the alarm line</text>
        <path d={path} fill="none" stroke="var(--ink)" strokeWidth={1.8} />
        <circle cx={px(trees)} cy={py(now)} r={5} fill={now >= 0.5 ? "var(--orange)" : "var(--normal)"} stroke="white" strokeWidth={2} />
        <text x={P} y={H - 6} className="fill-muted-foreground text-[10px]">0 trees (start: {pct(sigmoid(totals[0]), 1)})</text>
        <text x={W - P} y={H - 6} textAnchor="end" className="fill-muted-foreground text-[10px]">300 trees</text>
      </svg>
    </div>
  )
}
