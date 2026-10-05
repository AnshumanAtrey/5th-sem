"use client"

import { useMemo, useState } from "react"
import { CartesianGrid, Scatter, ScatterChart, XAxis, YAxis } from "recharts"
import { ChartContainer, type ChartConfig } from "@/components/ui/chart"
import eda from "@/data/eda.json"
import { FAMILIES, FAMILY_COLOR, pct } from "@/lib/data"
import { cn } from "@/lib/utils"

const { x, y, family, explained, cumulative } = eda.pca
const config = Object.fromEntries(FAMILIES.map((f) => [f, { label: f, color: FAMILY_COLOR[f] }])) satisfies ChartConfig

/** Every row squeezed from 45 numbers to 2, one dot per row; click a family to hide or show it. */
export function PcaMap() {
  const [off, setOff] = useState<Set<string>>(new Set())
  const series = useMemo(() => FAMILIES.map((f) => ({
    f, points: x.map((xi, i) => ({ x: xi, y: y[i], fam: family[i] })).filter((p) => p.fam === f),
  })), [])
  const toggle = (f: string) => setOff((s) => { const n = new Set(s); if (n.has(f)) n.delete(f); else n.add(f); return n })
  const need95 = cumulative.findIndex((v) => v >= 0.95) + 1
  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Families on the map">
        {FAMILIES.map((f) => (
          <button key={f} onClick={() => toggle(f)} aria-pressed={!off.has(f)}
            className={cn("inline-flex items-center gap-1.5 rounded-[2px] border px-2.5 py-1 text-sm transition-opacity", off.has(f) && "opacity-40")}>
            <span className="size-2.5 rounded-full" style={{ background: FAMILY_COLOR[f] }} />{f}
          </button>
        ))}
        <button onClick={() => setOff(new Set())} className="mono-label px-2 text-muted-foreground hover:text-foreground">Show all</button>
      </div>
      <ChartContainer config={config} className="aspect-[16/10] w-full rounded-md border p-2">
        <ScatterChart margin={{ top: 10, right: 10, bottom: 24, left: 4 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" dataKey="x" tickLine={false} axisLine={false} tick={false}
            label={{ value: `direction 1: ${pct(explained[0], 0)} of the differences`, position: "insideBottom", offset: -12, className: "fill-muted-foreground text-xs" }} />
          <YAxis type="number" dataKey="y" tickLine={false} axisLine={false} tick={false} width={20}
            label={{ value: `direction 2: ${pct(explained[1], 0)}`, angle: -90, position: "insideLeft", className: "fill-muted-foreground text-xs" }} />
          {series.filter((s) => !off.has(s.f)).map((s) => (
            <Scatter key={s.f} data={s.points} fill={FAMILY_COLOR[s.f]} fillOpacity={0.55} shape="circle" isAnimationActive={false}
              legendType="none" r={2} />
          ))}
        </ScatterChart>
      </ChartContainer>
      <p className="text-sm text-muted-foreground">
        Each dot is one real row. These 2 directions keep {pct(cumulative[1], 0)} of how rows differ; it takes{" "}
        {need95} directions to keep 95%. So a flat picture is a rough sketch, which is why the models get all 45 numbers.
      </p>
    </div>
  )
}
