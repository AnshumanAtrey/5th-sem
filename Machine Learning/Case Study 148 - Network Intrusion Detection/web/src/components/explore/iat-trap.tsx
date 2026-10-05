"use client"

import eda from "@/data/eda.json"
import { data, FAMILIES, FAMILY_COLOR, pct } from "@/lib/data"

const iat = eda.iat as Record<string, number[]>
const W = 760, LEFT = 100, ROW = 30, TOP = 6
const maxV = Math.max(...FAMILIES.flatMap((f) => iat[f]))

/** IAT per family as dots, and how well a model does with IAT alone vs the real traffic numbers. */
export function IatTrap() {
  const H = TOP + FAMILIES.length * ROW + 26
  const px = (v: number) => Math.round((LEFT + (v / maxV) * (W - LEFT - 16)) * 100) / 100 // same on server and browser
  const trap = Object.entries(data.results.iat_trap).map(([name, v]) => ({ name, acc: v["accuracy, naming all 34 labels"] }))
  return (
    <div className="grid gap-5">
      <div className="overflow-x-auto rounded-md border p-3">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[560px]" role="img" aria-label="IAT values per family">
          {[0, 0.25, 0.5, 0.75, 1].map((t) => (
            <g key={t}>
              <line x1={px(t * maxV)} x2={px(t * maxV)} y1={TOP} y2={H - 22} stroke="var(--border)" />
              <text x={px(t * maxV)} y={H - 8} textAnchor="middle" className="fill-muted-foreground font-mono text-[10px]">{Math.round((t * maxV) / 1e6)}M</text>
            </g>
          ))}
          {FAMILIES.map((f, r) => (
            <g key={f}>
              <text x={LEFT - 10} y={TOP + r * ROW + ROW / 2 + 4} textAnchor="end" className="fill-foreground text-[12px]">{f}</text>
              {iat[f].map((v, i) => (
                <circle key={i} cx={px(v)} cy={Math.round((TOP + r * ROW + ROW / 2 + (((i * 37) % 17) - 8) * 0.7) * 10) / 10} r={2.2} fill={FAMILY_COLOR[f]} fillOpacity={0.5} />
              ))}
            </g>
          ))}
        </svg>
      </div>
      <div className="grid max-w-2xl content-start gap-3">
        <p className="mono-label text-muted-foreground">A decision tree naming all 34 labels, given…</p>
        {trap.map((t, i) => (
          <div key={t.name} className="grid gap-1">
            <div className="flex justify-between text-sm"><span>{t.name}</span><span className="font-mono tabular">{pct(t.acc)}</span></div>
            <span className="h-2.5 rounded-[1px] bg-muted"><span className="block h-full rounded-[1px]" style={{ width: `${t.acc * 100}%`, background: i === 0 ? "var(--orange)" : "var(--ink)" }} /></span>
          </div>
        ))}
      </div>
    </div>
  )
}
