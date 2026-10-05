"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import eda from "@/data/eda.json"
import { COLUMN_MEANING } from "@/lib/columns"
import { cn } from "@/lib/utils"

const { columns, matrix, top } = eda.corr

/** The column pairs that move together most, and (on demand) the full grid. */
export function LinkedColumns() {
  const [grid, setGrid] = useState(false)
  const [cell, setCell] = useState<[number, number] | null>(null)
  const n = columns.length, S = 13, L = 110
  return (
    <div className="grid gap-4">
      <ul className="grid gap-2">
        {top.slice(0, 8).map((p) => (
          <li key={p.a + p.b} className="grid items-center gap-x-4 gap-y-1 border-b border-dashed pb-2 text-sm md:grid-cols-[minmax(0,1fr)_200px_3.5rem]">
            <span><span className="font-mono">{p.a}</span> <span className="text-muted-foreground">and</span> <span className="font-mono">{p.b}</span></span>
            <span className="h-2 rounded-[1px] bg-muted"><span className="block h-full rounded-[1px] bg-orange" style={{ width: `${p.r * 100}%` }} /></span>
            <span className="text-right font-mono tabular">{p.r.toFixed(3)}</span>
          </li>
        ))}
      </ul>
      <Button variant="outline" size="sm" className="mono-label justify-self-start rounded-[2px]" aria-expanded={grid} onClick={() => setGrid(!grid)}>
        {grid ? "Hide" : "Show"} every pair ({n} × {n} grid)
      </Button>
      <div className={cn("grid gap-2", !grid && "hidden")}>
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {cell
            ? <><span className="font-mono text-foreground">{columns[cell[0]]}</span> and <span className="font-mono text-foreground">{columns[cell[1]]}</span>:{" "}
                <b className="text-foreground">{Math.abs(matrix[cell[0]][cell[1]]).toFixed(2)}</b>. {COLUMN_MEANING[columns[cell[0]]]}; {COLUMN_MEANING[columns[cell[1]]]?.toLowerCase()}.</>
            : "Point at a square: darker means the two columns move together more."}
        </p>
        <div className="overflow-x-auto rounded-md border p-2">
          <svg viewBox={`0 0 ${L + n * S} ${L + n * S}`} className="w-full min-w-[560px] max-w-[760px]" onMouseLeave={() => setCell(null)}>
            {columns.map((c, i) => (
              <g key={c}>
                <text x={L - 4} y={L + i * S + S * 0.75} textAnchor="end" className="fill-muted-foreground font-mono text-[8px]">{c}</text>
                <text transform={`translate(${L + i * S + S * 0.7}, ${L - 4}) rotate(-90)`} className="fill-muted-foreground font-mono text-[8px]">{c}</text>
              </g>
            ))}
            {matrix.map((row, i) => row.map((v, j) => (
              <rect key={`${i}-${j}`} x={L + j * S} y={L + i * S} width={S - 1} height={S - 1}
                fill={`color-mix(in oklab, var(--orange) ${Math.round(Math.abs(v) * 100)}%, white)`}
                stroke={cell && cell[0] === i && cell[1] === j ? "var(--ink)" : "none"} onMouseEnter={() => setCell([i, j])} />
            )))}
          </svg>
        </div>
      </div>
    </div>
  )
}
