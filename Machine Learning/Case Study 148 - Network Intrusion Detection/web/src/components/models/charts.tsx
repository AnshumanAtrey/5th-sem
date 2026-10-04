"use client"

import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { int, pct } from "@/lib/data"

/** One measure per model as horizontal bars, the deployed model in brand orange, the rest in grey. */
export function ModelBars({ rows, field, label, format, deployed }: {
  rows: Record<string, number | string>[]
  field: string
  label: string
  format: "int" | "pct"
  deployed: string
}) {
  const config = { [field]: { label, color: "var(--chart-3)" } } satisfies ChartConfig
  const fmt = (v: number) => (format === "int" ? int(v) : pct(v, 2))
  const data = rows.map((r) => ({ ...r, fill: r.model === deployed ? "var(--orange)" : "var(--chart-3)" }))
  return (
    <ChartContainer config={config} className="aspect-auto w-full" style={{ height: 36 + rows.length * 30 }}>
      <BarChart data={data} layout="vertical" margin={{ left: 4, right: 56 }} barCategoryGap={6}>
        <CartesianGrid horizontal={false} />
        <XAxis type="number" tickLine={false} axisLine={false} tickFormatter={(v) => fmt(Number(v))} />
        <YAxis type="category" dataKey="model" tickLine={false} axisLine={false} width={150} />
        <ChartTooltip cursor={{ fill: "var(--muted)" }} content={<ChartTooltipContent formatter={(v) => <span className="font-mono tabular">{fmt(Number(v))} {label.toLowerCase()}</span>} hideIndicator />} />
        <Bar dataKey={field} radius={[0, 4, 4, 0]} maxBarSize={18}>
          <LabelList dataKey={field} position="right" className="fill-foreground font-mono text-[11px]" formatter={(v: unknown) => fmt(Number(v))} />
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}

const unseenConfig = {
  seen: { label: "Gradient boosting, family seen in training", color: "#141417" },
  never: { label: "Gradient boosting, family never seen", color: "#fe5301" },
  kmeans: { label: "K-Means detector, no attack ever seen", color: "#a1a1a6" },
} satisfies ChartConfig

export function UnseenBars({ data }: { data: { family: string; seen: number; never: number; kmeans: number }[] }) {
  return (
    <ChartContainer config={unseenConfig} className="aspect-auto h-80 w-full">
      <BarChart data={data} margin={{ left: 0, right: 8, top: 8 }} barGap={2}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="family" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis tickLine={false} axisLine={false} width={44} domain={[0, 1]} tickFormatter={(v) => pct(Number(v), 0)} />
        <ChartTooltip cursor={{ fill: "var(--muted)" }} content={<ChartTooltipContent formatter={(v, name) => (
          <span className="flex w-full justify-between gap-4"><span>{unseenConfig[name as keyof typeof unseenConfig].label}</span><span className="font-mono tabular">{pct(Number(v))}</span></span>)} />} />
        <ChartLegend content={<ChartLegendContent />} />
        {(["seen", "never", "kmeans"] as const).map((k) => <Bar key={k} dataKey={k} fill={`var(--color-${k})`} radius={[4, 4, 0, 0]} maxBarSize={22} />)}
      </BarChart>
    </ChartContainer>
  )
}
