"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { data, int, pct } from "@/lib/data"

const NORMAL = data.family_report.find((f) => f.family === "Benign")!["test flows"]
const ATTACKS = data.n_test - NORMAL

/** Pick a model: its real 2×2 table of exam outcomes, and every score worked out from those 4 counts. */
export function GradeCard() {
  const [name, setName] = useState("Gradient Boosting")
  const m = data.results.comparison.find((c) => c.model === name)!
  const missed = m["missed attacks"], fa = m["false alarms"]
  const caught = ATTACKS - missed, ignored = NORMAL - fa
  const P = caught / (caught + fa), R = caught / ATTACKS
  const cells = [
    { label: "Correctly left alone", sub: "really normal, said normal", n: ignored, good: true },
    { label: "False alarm", sub: "really normal, said attack", n: fa, good: false },
    { label: "Missed attack", sub: "really an attack, said normal", n: missed, good: false },
    { label: "Caught", sub: "really an attack, said attack", n: caught, good: true },
  ]
  const scores = [
    { name: "Recall (catch rate)", q: "Of the real attacks, how many were caught?", math: `${int(caught)} ÷ ${int(ATTACKS)}`, v: R },
    { name: "Precision", q: "Of all the alarms, how many were real attacks?", math: `${int(caught)} ÷ (${int(caught)} + ${int(fa)})`, v: P },
    { name: "False alarm rate", q: "Of the normal rows, how many were wrongly flagged?", math: `${int(fa)} ÷ ${int(NORMAL)}`, v: fa / NORMAL },
    { name: "Accuracy", q: "Of all the exam rows, how many were right?", math: `(${int(ignored)} + ${int(caught)}) ÷ ${int(data.n_test)}`, v: (ignored + caught) / data.n_test },
    { name: "F1", q: "One score that drops if either precision or recall is bad", math: `2 × ${P.toFixed(3)} × ${R.toFixed(3)} ÷ (${P.toFixed(3)} + ${R.toFixed(3)})`, v: (2 * P * R) / (P + R) },
  ]
  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <span className="mono-label text-muted-foreground">Model</span>
        <Select value={name} onValueChange={setName}>
          <SelectTrigger className="w-64" aria-label="Model to grade"><SelectValue /></SelectTrigger>
          <SelectContent>{data.results.comparison.map((c) => <SelectItem key={c.model} value={c.model}>{c.model}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <div className="grid content-start gap-2">
          <p className="mono-label text-muted-foreground">Its {int(data.n_test)} exam answers, sorted into 4 boxes (the confusion matrix)</p>
          <div className="grid grid-cols-[auto_1fr_1fr] gap-px overflow-hidden rounded-md border bg-border text-sm">
            <div className="bg-panel p-2" />
            <div className="mono-label bg-panel p-2 text-center text-[11px] text-muted-foreground">Model said normal</div>
            <div className="mono-label bg-panel p-2 text-center text-[11px] text-muted-foreground">Model said attack</div>
            {[0, 1].map((r) => (
              <div key={r} className="contents">
                <div className="mono-label grid place-items-center bg-panel p-2 text-[11px] text-muted-foreground [writing-mode:vertical-rl] rotate-180">
                  {r === 0 ? `Really normal (${int(NORMAL)})` : `Really attack (${int(ATTACKS)})`}
                </div>
                {cells.slice(r * 2, r * 2 + 2).map((c) => (
                  <div key={c.label} className="grid gap-1 p-4" style={{ background: c.good ? "color-mix(in oklab, var(--normal) 9%, white)" : "var(--orange-soft)" }}>
                    <span className="font-mono text-2xl font-semibold tabular">{int(c.n)}</span>
                    <span className="font-semibold">{c.label}</span>
                    <span className="text-xs text-muted-foreground">{c.sub}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="grid content-start gap-2">
          <p className="mono-label text-muted-foreground">Every score comes from those 4 boxes</p>
          <ul className="divide-y rounded-md border">
            {scores.map((s) => (
              <li key={s.name} className="grid gap-1 p-3 sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  <p className="font-semibold">{s.name}</p>
                  <p className="text-sm text-muted-foreground">{s.q}</p>
                  <p className="font-mono text-xs text-muted-foreground">{s.math}</p>
                </div>
                <span className="font-mono text-xl tabular">{pct(s.v, 2)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
