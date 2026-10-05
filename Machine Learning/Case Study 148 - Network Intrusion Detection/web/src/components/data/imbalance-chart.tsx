"use client"

import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { int } from "@/lib/data"
import { familyRows } from "@/lib/families"

const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 })
const config = { rows: { label: "Rows in the dataset", color: "var(--ink)" } } satisfies ChartConfig

/** Rows per family in the full dataset: one hue, real (not log) scale, so the imbalance is visible as it is. */
export function ImbalanceChart() {
  return (
    <ChartContainer config={config} className="aspect-auto w-full" style={{ height: 40 + familyRows.length * 38 }}>
      <BarChart data={familyRows} layout="vertical" margin={{ left: 4, right: 64 }} barCategoryGap={8}>
        <CartesianGrid horizontal={false} />
        <XAxis type="number" tickLine={false} axisLine={false} tickFormatter={(v) => compact.format(Number(v))} />
        <YAxis type="category" dataKey="family" tickLine={false} axisLine={false} width={140} />
        <ChartTooltip cursor={{ fill: "var(--muted)" }}
          content={<ChartTooltipContent hideIndicator formatter={(v) => <span className="font-mono tabular">{int(Number(v))} rows</span>} />} />
        <Bar dataKey="rows" fill="var(--color-rows)" radius={[0, 2, 2, 0]} maxBarSize={22}>
          <LabelList dataKey="rows" position="right" className="fill-foreground font-mono text-[11px]" formatter={(v: unknown) => compact.format(Number(v))} />
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}
