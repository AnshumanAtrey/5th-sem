"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { COLUMN_MEANING, PROTOCOLS } from "@/lib/columns"
import { data, FAMILY_COLOR } from "@/lib/data"
import { FAMILY_STORIES } from "@/lib/families"
import { cn } from "@/lib/utils"

const NORMAL = data.examples["Benign · BenignTraffic"]
const ATTACKS = FAMILY_STORIES.filter((f) => f.key !== "Benign" && f.example && data.examples[f.example])

// the few numbers that tell the story, with plain names and the words for "more" and "less"
const KEY = [
  { col: "Rate", name: "Speed", unit: "packets / second", more: "faster", less: "slower" },
  { col: "Tot size", name: "Packet size", unit: "bytes", more: "bigger", less: "smaller" },
  { col: "flow_duration", name: "How long it lasted", unit: "seconds", more: "longer", less: "shorter" },
  { col: "syn_count", name: "'Hello' (SYN) packets", unit: "per batch", more: "more", less: "fewer" },
  { col: "rst_count", name: "'Hang up' (RST) packets", unit: "per batch", more: "more", less: "fewer" },
]

const num = (v: number) => (v >= 100 ? Math.round(v).toLocaleString("en-IN") : v >= 1 ? v.toFixed(1) : v.toFixed(2))

function difference(normal: number, attack: number, more: string, less: string) {
  if (normal === 0 && attack === 0) return "same"
  if (normal === 0 || attack === 0) return attack > normal ? more : less
  const r = attack / normal
  if (r >= 1.5) return `${r >= 10 ? Math.round(r).toLocaleString("en-IN") : r.toFixed(1)}× ${more}`
  if (r <= 1 / 1.5) return `${1 / r >= 10 ? Math.round(1 / r).toLocaleString("en-IN") : (1 / r).toFixed(1)}× ${less}`
  return "about the same"
}

const protocols = (row: Record<string, number>) => PROTOCOLS.filter((p) => row[p] >= 0.5)

/** A real row of normal traffic next to a real attack row, in plain words. */
export function RowCompare() {
  const [pick, setPick] = useState(ATTACKS[1].key)
  const [all, setAll] = useState(false)
  const story = ATTACKS.find((f) => f.key === pick)!
  const attack = data.examples[story.example!]
  const label = story.example!.split(" · ")[1]
  return (
    <div className="grid gap-4">
      <ToggleGroup type="single" variant="outline" size="sm" value={pick} onValueChange={(v) => v && setPick(v)}
        aria-label="Attack to compare" className="flex-wrap justify-start">
        {ATTACKS.map((f) => (
          <ToggleGroupItem key={f.key} value={f.key} className="gap-2 rounded-[2px] data-[state=on]:border-ink">
            <span className="size-2 rounded-[1px]" style={{ background: FAMILY_COLOR[f.key] }} />{f.key}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <div className="overflow-x-auto rounded-md border">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b bg-panel">
              <th scope="col" className="mono-label px-4 py-3 text-left font-medium text-muted-foreground">What the number says</th>
              <th scope="col" className="mono-label px-4 py-3 text-right font-medium" style={{ color: "var(--normal)" }}>Normal traffic</th>
              <th scope="col" className="mono-label px-4 py-3 text-right font-medium text-orange-deep">{story.name.split(":")[0]}</th>
              <th scope="col" className="mono-label px-4 py-3 text-left font-medium text-muted-foreground">The attack is…</th>
            </tr>
          </thead>
          <tbody>
            {KEY.map((k) => (
              <tr key={k.col} className="border-b">
                <th scope="row" className="px-4 py-3 text-left font-normal">
                  {k.name} <span className="text-muted-foreground">({k.unit})</span>
                </th>
                <td className="px-4 py-3 text-right font-mono tabular">{num(NORMAL[k.col])}</td>
                <td className="px-4 py-3 text-right font-mono tabular">{num(attack[k.col])}</td>
                <td className="px-4 py-3 font-medium">{difference(NORMAL[k.col], attack[k.col], k.more, k.less)}</td>
              </tr>
            ))}
            <tr className="border-b">
              <th scope="row" className="px-4 py-3 text-left font-normal">Protocol used</th>
              <td className="px-4 py-3 text-right font-mono">{protocols(NORMAL).join(" + ") || "none of the listed"}</td>
              <td className="px-4 py-3 text-right font-mono">{protocols(attack).join(" + ") || "none of the listed"}</td>
              <td className="px-4 py-3" />
            </tr>
            <tr className="bg-orange-soft">
              <th scope="row" className="px-4 py-3 text-left font-semibold">The answer (the label)</th>
              <td className="px-4 py-3 text-right font-mono font-semibold" style={{ color: "var(--normal)" }}>BenignTraffic</td>
              <td className="px-4 py-3 text-right font-mono font-semibold text-orange-deep">{label}</td>
              <td className="px-4 py-3 text-muted-foreground">what the model must learn to guess</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-2xl text-sm text-muted-foreground">
          Each row has {Object.keys(NORMAL).length} numbers like these (plus one more, IAT, which we had to throw out:
          step 2 shows why). When the model is tested it never sees the answer. It has to work it out from the numbers
          alone. That is the whole job.
        </p>
        <Button variant="outline" size="sm" className="mono-label rounded-[2px]" aria-expanded={all} onClick={() => setAll(!all)}>
          {all ? "Hide" : "Show"} all {Object.keys(NORMAL).length} numbers
        </Button>
      </div>

      <div className={cn("overflow-x-auto rounded-md border", !all && "hidden")}>
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b bg-panel">
              <th scope="col" className="mono-label px-4 py-2.5 text-left font-medium text-muted-foreground">Column</th>
              <th scope="col" className="mono-label px-4 py-2.5 text-left font-medium text-muted-foreground">What it means</th>
              <th scope="col" className="mono-label px-4 py-2.5 text-right font-medium" style={{ color: "var(--normal)" }}>Normal</th>
              <th scope="col" className="mono-label px-4 py-2.5 text-right font-medium text-orange-deep">{story.key}</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(NORMAL).map((col) => (
              <tr key={col} className="border-b last:border-0">
                <th scope="row" className="px-4 py-2 text-left font-mono text-xs font-normal">{col}</th>
                <td className="px-4 py-2 text-muted-foreground">{COLUMN_MEANING[col]}</td>
                <td className="px-4 py-2 text-right font-mono text-xs tabular">{num(NORMAL[col])}</td>
                <td className="px-4 py-2 text-right font-mono text-xs tabular">{num(attack[col])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
