"use client"

import { useState } from "react"
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { data, FAMILIES, int, pct } from "@/lib/data"
import { FAMILY_STORIES } from "@/lib/families"

const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 })
const rows = FAMILIES.map((f) => ({
  family: FAMILY_STORIES.find((s) => s.key === f)!.name.split(":")[0],
  full: data.counts.filter((c) => c.family === f).reduce((s, c) => s + c.full, 0),
  sample: data.counts.filter((c) => c.family === f).reduce((s, c) => s + c.sample, 0),
}))
const config = { value: { label: "Rows", color: "var(--ink)" } } satisfies ChartConfig

// a few labels that show the rule at work, from the biggest to the rarest
const SHOWN = ["DDoS-ICMP_Flood", "BenignTraffic", "Recon-OSScan", "DictionaryBruteForce", "Uploading_Attack"]

/** Rows per family before and after the fair sample: same chart, flip between the two. */
export function SampleChart() {
  const [view, setView] = useState<"full" | "sample">("full")
  const shown = [...rows].sort((a, b) => b[view] - a[view]).map((r) => ({ family: r.family, value: r[view] }))
  const total = rows.reduce((s, r) => s + r[view], 0)
  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
      <div className="grid content-start gap-3">
        <ToggleGroup type="single" variant="outline" size="sm" value={view} onValueChange={(v) => v && setView(v as "full" | "sample")}
          aria-label="Which data" className="justify-start">
          <ToggleGroupItem value="full" className="mono-label rounded-[2px]">The full dataset</ToggleGroupItem>
          <ToggleGroupItem value="sample" className="mono-label rounded-[2px]">Our fair sample</ToggleGroupItem>
        </ToggleGroup>
        <p className="text-sm text-muted-foreground" aria-live="polite">{int(total)} rows in total</p>
        <ChartContainer config={config} className="aspect-auto w-full" style={{ height: 40 + rows.length * 36 }}>
          <BarChart data={shown} layout="vertical" margin={{ left: 4, right: 60 }} barCategoryGap={8}>
            <CartesianGrid horizontal={false} />
            <XAxis type="number" tickLine={false} axisLine={false} tickFormatter={(v) => compact.format(Number(v))} />
            <YAxis type="category" dataKey="family" tickLine={false} axisLine={false} width={130} />
            <ChartTooltip cursor={{ fill: "var(--muted)" }} content={<ChartTooltipContent hideIndicator formatter={(v) => <span className="font-mono tabular">{int(Number(v))} rows</span>} />} />
            <Bar dataKey="value" fill="var(--color-value)" radius={[0, 2, 2, 0]} maxBarSize={20}>
              <LabelList dataKey="value" position="right" className="fill-foreground font-mono text-[11px]" formatter={(v: unknown) => compact.format(Number(v))} />
            </Bar>
          </BarChart>
        </ChartContainer>
      </div>
      <div className="grid content-start gap-3">
        <p className="mono-label text-muted-foreground">The rule at work, label by label</p>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th scope="col" className="py-2 font-normal">Label</th>
              <th scope="col" className="py-2 text-right font-normal">Had</th>
              <th scope="col" className="py-2 text-right font-normal">Kept</th>
              <th scope="col" className="py-2 text-right font-normal">Share kept</th>
            </tr>
          </thead>
          <tbody>
            {SHOWN.map((l) => {
              const c = data.counts.find((x) => x.label === l)!
              return (
                <tr key={l} className="border-b border-dashed last:border-0">
                  <th scope="row" className="py-2 text-left font-mono text-xs font-normal">{l}</th>
                  <td className="py-2 text-right font-mono tabular">{int(c.full)}</td>
                  <td className="py-2 text-right font-mono tabular">{int(c.sample)}</td>
                  <td className="py-2 text-right font-mono tabular">{pct(c.sample / c.full, c.sample / c.full < 0.01 ? 2 : 0)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <p className="text-sm text-muted-foreground">
          The rule: every attack type keeps up to about 12,000 rows, picked at random from all 169 files; a type with
          fewer keeps all of them. Normal traffic keeps about 120,000, so there are plenty of normal examples too.
        </p>
      </div>
    </div>
  )
}
