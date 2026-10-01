"use client"

import { Bar, BarChart, CartesianGrid, Line, LineChart, ReferenceLine, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import type { FairnessResult } from "@/lib/api"
import { month } from "@/lib/format"

const outcomeConfig = {
  shortlist: { label: "Shortlisted", color: "var(--outcome-shortlist)" },
  waitlist: { label: "Waitlisted", color: "var(--outcome-waitlist)" },
  manual_review: { label: "Manual review", color: "var(--outcome-review)" },
  reject: { label: "Rejected", color: "var(--outcome-reject)" },
} satisfies ChartConfig

export function OutcomeTrend({ data }: { data: { month: string; shortlist: number; waitlist: number; manual_review: number; reject: number }[] }) {
  return (
    <ChartContainer config={outcomeConfig} className="aspect-auto h-64 w-full">
      <BarChart data={data} margin={{ left: 0, right: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={month} />
        <YAxis tickLine={false} axisLine={false} width={40} />
        <ChartTooltip cursor={false} content={<ChartTooltipContent labelFormatter={(v) => month(String(v))} />} />
        <ChartLegend content={<ChartLegendContent />} />
        {(["shortlist", "waitlist", "manual_review", "reject"] as const).map((k, i, all) => (
          <Bar key={k} dataKey={k} stackId="a" fill={`var(--color-${k})`} radius={i === all.length - 1 ? [4, 4, 0, 0] : 0} maxBarSize={36} />
        ))}
      </BarChart>
    </ChartContainer>
  )
}

const ratioConfig = {
  current: { label: "HireSense", color: "var(--foreground)" },
  legacy: { label: "Legacy (shadow)", color: "var(--muted-foreground)" },
} satisfies ChartConfig

/** Impact ratio per group, HireSense vs the legacy ranker on the same applications. */
export function ImpactRatioBars({ current, legacy, min = 0.8 }: { current: FairnessResult; legacy?: FairnessResult; min?: number }) {
  const data = current.groups
    .filter((g) => g.impactRatio != null)
    .map((g) => ({
      group: g.group,
      current: +(g.impactRatio ?? 0).toFixed(3),
      legacy: +(legacy?.groups.find((l) => l.group === g.group)?.impactRatio ?? 0).toFixed(3),
    }))
  return (
    <ChartContainer config={ratioConfig} className="aspect-auto w-full" style={{ height: 44 + data.length * 44 }}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }} barGap={2}>
        <CartesianGrid horizontal={false} />
        <XAxis type="number" domain={[0, 1.2]} ticks={[0, 0.4, 0.8, 1.2]} tickLine={false} axisLine={false} />
        <YAxis type="category" dataKey="group" tickLine={false} axisLine={false} width={96} />
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        <ReferenceLine x={min} stroke="var(--outcome-reject)" strokeDasharray="4 3" label={{ value: `${min}`, position: "top", fontSize: 10, fill: "var(--outcome-reject)" }} />
        <Bar dataKey="current" fill="var(--color-current)" radius={3} barSize={10} />
        {legacy && <Bar dataKey="legacy" fill="var(--color-legacy)" fillOpacity={0.45} radius={3} barSize={10} />}
      </BarChart>
    </ChartContainer>
  )
}

const trendConfig = {
  gender: { label: "Gender", color: "var(--chart-2)" },
  age_band: { label: "Age band", color: "var(--outcome-review)" },
  university_tier: { label: "University tier", color: "var(--outcome-waitlist)" },
} satisfies ChartConfig

export function RatioTrend({ data, min = 0.8 }: { data: { period: string; gender: number | null; age_band: number | null; university_tier: number | null }[]; min?: number }) {
  return (
    <ChartContainer config={trendConfig} className="aspect-auto h-60 w-full">
      <LineChart data={data} margin={{ left: 0, right: 12 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="period" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(v) => month(String(v).slice(0, 7))} />
        <YAxis domain={[0.4, 1.05]} ticks={[0.4, 0.6, 0.8, 1]} tickLine={false} axisLine={false} width={40} />
        <ChartTooltip content={<ChartTooltipContent labelFormatter={(v) => `Window ending ${month(String(v).slice(0, 7))}`} />} />
        <ChartLegend content={<ChartLegendContent />} />
        <ReferenceLine y={min} stroke="var(--outcome-reject)" strokeDasharray="4 3" />
        {(["gender", "age_band", "university_tier"] as const).map((k) => (
          <Line key={k} dataKey={k} type="monotone" stroke={`var(--color-${k})`} strokeWidth={2} dot={{ r: 3 }} connectNulls />
        ))}
      </LineChart>
    </ChartContainer>
  )
}
