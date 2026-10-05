"use client"

import { useState } from "react"
import eda from "@/data/eda.json"
import { FAMILY_COLOR } from "@/lib/data"

const { icoord, dcoord, leaves, families } = eda.tree
const ROW = 19, LEFT = 210, W = 760, TOP = 6
const maxD = Math.max(...dcoord.flat())

/** Ward family tree of the 34 labels, drawn sideways: joins near the left mean "very alike". */
export function FamilyTree() {
  const [hover, setHover] = useState<string | null>(null)
  const H = TOP + leaves.length * ROW + 24
  const r2 = (v: number) => Math.round(v * 100) / 100 // same text on server and browser
  const px = (d: number) => r2(LEFT + (d / maxD) * (W - LEFT - 12))
  const py = (i: number) => r2(TOP + ((i - 5) / 10) * ROW + ROW / 2)      // scipy puts leaf k at 10k + 5
  return (
    <div className="grid gap-2">
      <div className="overflow-x-auto rounded-md border p-3">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[620px]" role="img" aria-label="Family tree of the 34 labels">
          {icoord.map((ic, k) => (
            <polyline key={k} fill="none" stroke="var(--graphite)" strokeOpacity={0.55} strokeWidth={1.2}
              points={ic.map((i, j) => `${px(dcoord[k][j])},${py(i)}`).join(" ")} />
          ))}
          {leaves.map((label, i) => {
            const f = families[i]
            const dim = hover && hover !== f
            return (
              <g key={label} opacity={dim ? 0.25 : 1} onMouseEnter={() => setHover(f)} onMouseLeave={() => setHover(null)} className="cursor-default">
                <rect x={LEFT - 14} y={TOP + i * ROW + ROW / 2 - 4} width={8} height={8} fill={FAMILY_COLOR[f]} rx={1} />
                <text x={LEFT - 20} y={TOP + i * ROW + ROW / 2 + 4} textAnchor="end" className="fill-foreground font-mono text-[11px]">{label}</text>
              </g>
            )
          })}
          <text x={LEFT} y={H - 4} className="fill-muted-foreground text-[10px]">very alike</text>
          <text x={W - 12} y={H - 4} textAnchor="end" className="fill-muted-foreground text-[10px]">very different →</text>
        </svg>
      </div>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {hover ? <>Showing <b className="text-foreground">{hover}</b>: see where its labels sit in the tree.</> : "Point at a label to light up its whole family."}
      </p>
    </div>
  )
}
