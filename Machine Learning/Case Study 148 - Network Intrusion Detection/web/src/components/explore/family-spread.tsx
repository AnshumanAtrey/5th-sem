"use client"

import { useState } from "react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import eda from "@/data/eda.json"
import { FAMILIES, FAMILY_COLOR } from "@/lib/data"
import { FAMILY_STORIES } from "@/lib/families"

const COLUMNS = [
  { col: "Tot size", name: "Packet size", unit: "bytes" },
  { col: "flow_duration", name: "How long it lasts", unit: "seconds" },
  { col: "Rate", name: "Speed", unit: "packets / second" },
  { col: "Header_Length", name: "Header bytes", unit: "bytes" },
  { col: "rst_count", name: "'Hang up' packets", unit: "per batch" },
  { col: "syn_count", name: "'Hello' packets", unit: "per batch" },
]
const spread = eda.spread.columns as Record<string, Record<string, number[]>>
const fam = (k: string) => FAMILY_STORIES.find((s) => s.key === k)!.name.split(":")[0]
const show = (v: number) => (v >= 1000 ? Math.round(v).toLocaleString("en-IN") : v >= 10 ? v.toFixed(0) : v >= 1 ? v.toFixed(1) : v.toFixed(2))
const lg = (v: number) => Math.log10(1 + Math.max(0, v))
const r2 = (v: number) => Math.round(v * 100) / 100 // same text on server and browser

const W = 760, LEFT = 120, RIGHT = 16, ROW = 34, TOP = 8

/** For one column: where most rows of each family fall, on a ×10 axis so tiny and huge values both fit. */
export function FamilySpread() {
  const [col, setCol] = useState(COLUMNS[0].col)
  const [hover, setHover] = useState<string | null>(null)
  const meta = COLUMNS.find((c) => c.col === col)!
  const data = spread[col]
  const max = Math.max(1, Math.ceil(Math.max(...FAMILIES.map((f) => lg(data[f][4])))))
  const x = (v: number) => r2(LEFT + (lg(v) / max) * (W - LEFT - RIGHT))
  const ticks = Array.from({ length: max + 1 }, (_, k) => (k === 0 ? 0 : 10 ** k))
  const H = TOP + FAMILIES.length * ROW + 30
  const medians = FAMILIES.map((f) => ({ f, m: data[f][2] })).sort((a, b) => b.m - a.m)
  const focus = hover ?? FAMILIES[0]
  const [p5, p25, p50, p75, p95] = data[focus]

  return (
    <div className="grid gap-4">
      <ToggleGroup type="single" variant="outline" size="sm" value={col} onValueChange={(v) => v && setCol(v)}
        aria-label="Which number to compare" className="flex-wrap justify-start">
        {COLUMNS.map((c) => <ToggleGroupItem key={c.col} value={c.col} className="rounded-[2px]">{c.name}</ToggleGroupItem>)}
      </ToggleGroup>
      <div className="overflow-x-auto rounded-md border p-3">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[620px]" role="img" aria-label={`${meta.name} by family`}>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={x(t)} x2={x(t)} y1={TOP} y2={H - 26} stroke="var(--border)" />
              <text x={x(t)} y={H - 10} textAnchor="middle" className="fill-muted-foreground font-mono text-[10px]">
                {t >= 1e6 ? `${t / 1e6}M` : t >= 1e3 ? `${t / 1e3}k` : t}
              </text>
            </g>
          ))}
          {FAMILIES.map((f, i) => {
            const [a, b, m, c, d] = data[f]
            const y = TOP + i * ROW + ROW / 2
            const dim = hover && hover !== f
            return (
              <g key={f} opacity={dim ? 0.3 : 1} onMouseEnter={() => setHover(f)} onMouseLeave={() => setHover(null)} className="cursor-default">
                <rect x={0} y={y - ROW / 2} width={W} height={ROW} fill="transparent" />
                <text x={LEFT - 10} y={y + 4} textAnchor="end" className="fill-foreground text-[12px]">{fam(f)}</text>
                <line x1={x(a)} x2={x(d)} y1={y} y2={y} stroke={FAMILY_COLOR[f]} strokeWidth={2} />
                <rect x={x(b)} y={y - 9} width={Math.max(2, x(c) - x(b))} height={18} fill={FAMILY_COLOR[f]} fillOpacity={0.35} stroke={FAMILY_COLOR[f]} rx={1} />
                <line x1={x(m)} x2={x(m)} y1={y - 11} y2={y + 11} stroke="var(--ink)" strokeWidth={2.5} />
              </g>
            )
          })}
        </svg>
      </div>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        <b className="text-foreground">{fam(focus)}</b> ({meta.unit}): the middle row is <b className="text-foreground">{show(p50)}</b>;
        half the rows are between {show(p25)} and {show(p75)}; 90% between {show(p5)} and {show(p95)}.
        {!hover && " Point at a family to read its numbers."}
      </p>
      <p className="text-sm">
        Middle row, biggest to smallest:{" "}
        {medians.map(({ f, m }, i) => <span key={f}>{i > 0 && " · "}<span style={{ color: FAMILY_COLOR[f] }}>■</span> {fam(f)} {show(m)}</span>)}
      </p>
    </div>
  )
}
