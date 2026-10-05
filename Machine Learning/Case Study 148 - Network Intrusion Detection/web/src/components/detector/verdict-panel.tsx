"use client"

import { Slider } from "@/components/ui/slider"
import { atThreshold, data, FAMILY_COLOR, pct } from "@/lib/data"
import type { Verdict } from "@/lib/ids"

export function VerdictPanel({ verdict, threshold, onThreshold, truth }: {
  verdict: Verdict
  threshold: number
  onThreshold: (t: number) => void
  truth?: string
}) {
  const alarm = verdict.intrusion * 100 >= threshold
  const at = atThreshold(threshold)
  const fam = verdict.family.find((f) => f.name === verdict.attackFamily)!
  return (
    <section aria-labelledby="verdict-title" aria-live="polite" className="overflow-hidden rounded-md border shadow-[0_24px_48px_-24px_#14141733]">
      <div className="relative flex h-10 items-center border-b px-4" aria-hidden>
        <span className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-[#ff5f57]" /><span className="size-2.5 rounded-full bg-[#febc2e]" /><span className="size-2.5 rounded-full bg-[#28c840]" />
        </span>
        <span className="absolute inset-x-0 text-center text-sm text-muted-foreground">Walrus — flow verdict</span>
      </div>
      <div className="grid content-start gap-6 p-5 sm:p-6">
      <div>
        <h2 id="verdict-title" className="mono-label flex items-center gap-2 text-muted-foreground">
          <span className="size-1.5 rounded-full" style={{ background: alarm ? "var(--orange)" : "var(--normal)" }} />Verdict
        </h2>
        <p className="mt-3 text-5xl font-semibold tracking-[-0.03em] sm:text-6xl" style={{ color: alarm ? "var(--orange)" : "var(--normal)" }}>
          {alarm ? "Intrusion" : "Normal traffic"}
        </p>
        <p className="mt-2 text-muted-foreground">
          {alarm
            ? <>Most likely a <b className="text-foreground">{verdict.attackFamily}</b> attack ({pct(fam.p)} by the family model).</>
            : <>Below your alarm threshold. Closest attack family: {verdict.attackFamily}.</>}
          {truth && <> True label in the test set: <b className="text-foreground">{truth}</b>.</>}
        </p>
        {verdict.badCells > 0 && (
          <p className="mt-2 text-sm text-intrusion">
            {verdict.badCells} value{verdict.badCells > 1 ? "s are" : " is"} not a usable number, so the training median is used instead.
          </p>
        )}
      </div>

      <div className="grid gap-3">
        <div className="flex items-baseline justify-between text-sm">
          <span><span className="mono-label text-muted-foreground">Intrusion score</span> <span className="text-xs text-muted-foreground">(the chance this flow is an attack)</span></span>
          <span className="font-mono text-lg tabular">{pct(verdict.intrusion, 2)}</span>
        </div>
        <div className="relative h-3 rounded-[1px] bg-muted" aria-hidden>
          <div className="h-full rounded-[1px]" style={{ width: `${verdict.intrusion * 100}%`, background: alarm ? "var(--orange)" : "var(--normal)" }} />
          <div className="absolute -top-1 h-5 w-0.5 bg-ink" style={{ left: `${threshold}%` }} />
        </div>
        <label className="grid gap-2 pt-2 text-sm">
          <span className="flex justify-between"><span><span className="mono-label text-muted-foreground">Alarm threshold</span> <span className="text-xs text-muted-foreground">(at or above it: intrusion)</span></span><span className="font-mono tabular">{threshold}%</span></span>
          <Slider min={5} max={95} step={5} value={[threshold]} onValueChange={([v]) => onThreshold(v)} aria-label="Alarm threshold" />
        </label>
        <p className="text-sm text-muted-foreground">
          On the {data.n_test.toLocaleString("en-IN")} locked test flows, {threshold}% catches <b className="text-foreground">{pct(at.recall, 2)}</b> of
          attacks and flags <b className="text-foreground">{pct(at["false alarm rate"], 2)}</b> of normal flows.
        </p>
      </div>

      <div className="grid gap-2">
        <h3><span className="mono-label text-muted-foreground">Attack family</span> <span className="text-xs text-muted-foreground">(a second model that names the kind of attack: each bar is its chance)</span></h3>
        <ul className="grid gap-1.5">
          {verdict.family.map((f) => (
            <li key={f.name} className="grid grid-cols-[6.5rem_1fr_3.5rem] items-center gap-3 text-sm">
              <span>{f.name}</span>
              <span className="h-2 rounded-[1px] bg-muted">
                <span className="block h-full rounded-[1px]" style={{ width: `${Math.max(f.p * 100, 0.5)}%`, background: FAMILY_COLOR[f.name] }} />
              </span>
              <span className="text-right font-mono text-xs tabular text-muted-foreground">{pct(f.p)}</span>
            </li>
          ))}
        </ul>
      </div>
      </div>
    </section>
  )
}
