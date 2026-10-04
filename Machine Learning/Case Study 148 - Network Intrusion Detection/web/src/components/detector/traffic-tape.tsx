"use client"

import { family, FAMILIES, FAMILY_COLOR } from "@/lib/data"
import type { TapeFlow } from "@/hooks/use-detector"

const H = 64 // tick area height in px

/** The 300 demo flows as a capture strip: colour = true family, height = the model's intrusion score. */
export function TrafficTape({ tape, selected, onSelect }: { tape: TapeFlow[]; selected: number | null; onSelect: (i: number) => void }) {
  const n = tape.length
  const move = (step: number) => onSelect(Math.min(n - 1, Math.max(0, (selected ?? -1) + step)))
  const current = selected != null ? tape[selected] : null

  return (
    <section aria-labelledby="tape-title" className="rounded-[2px] border bg-panel p-4 sm:p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h2 id="tape-title" className="mono-label flex items-center gap-2"><span className="size-1.5 rounded-full bg-orange" />{n} real flows from the locked test set</h2>
        <p className="text-sm text-muted-foreground">Height is the model&apos;s intrusion score. Click a flow, or use the arrow keys, to load it.</p>
      </div>
      <div
        role="group"
        tabIndex={0}
        aria-label="Test flows. Left and right arrow keys move between flows."
        onKeyDown={(e) => {
          const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key]
          if (step) {
            e.preventDefault()
            move(step)
          }
        }}
        className="mt-4 rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <svg viewBox={`0 0 ${n * 4} ${H + 6}`} preserveAspectRatio="none" className="block h-20 w-full" aria-hidden>
          <line x1="0" x2={n * 4} y1={H * 0.5} y2={H * 0.5} stroke="var(--border)" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />
          {tape.map((t, i) => {
            const h = Math.max(4, t.intrusion * H)
            return (
              <rect key={i} x={i * 4 + 0.6} width={2.8} y={H - h} height={h} rx={0.8}
                fill={FAMILY_COLOR[family(t.label)]} opacity={selected == null || selected === i ? 1 : 0.55}
                className="cursor-pointer" onClick={() => onSelect(i)} />
            )
          })}
          {selected != null && <rect x={selected * 4} y={H + 2} width={4} height={4} fill="var(--ink)" />}
        </svg>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
        <ul className="flex flex-wrap gap-x-3 gap-y-1" aria-label="Families">
          {FAMILIES.map((f) => (
            <li key={f} className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm" style={{ background: FAMILY_COLOR[f] }} />
              {f}
            </li>
          ))}
        </ul>
        <span aria-live="polite">{current ? `Flow ${selected! + 1} of ${n}: ${current.label}` : "Dashed line: 50% score"}</span>
      </div>
    </section>
  )
}
