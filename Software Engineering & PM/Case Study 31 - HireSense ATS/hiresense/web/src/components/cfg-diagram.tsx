import type { TraceStep } from "@/lib/api"
import { cn } from "@/lib/utils"

// Control-flow graph of the screening routine (api/src/ranking/routine.ts).
// 11 nodes, 14 edges → V(G) = 14 − 11 + 2 = 5.
const NODES: Record<string, { x: number; y: number; label: string; decision?: boolean }> = {
  N1: { x: 150, y: 30, label: "skills missing?", decision: true },
  N2: { x: 40, y: 112, label: "reject" },
  N3: { x: 230, y: 112, label: "score band" },
  N4: { x: 230, y: 194, label: "≥T & location?", decision: true },
  N5: { x: 110, y: 276, label: "shortlist" },
  N6: { x: 300, y: 276, label: "≥T & remote?", decision: true },
  N7: { x: 220, y: 358, label: "shortlist" },
  N8: { x: 350, y: 358, label: "waitlist" },
  N9: { x: 150, y: 440, label: "confidence < 0.6?", decision: true },
  N10: { x: 40, y: 514, label: "review" },
  N11: { x: 150, y: 580, label: "end" },
}

const EDGES: [string, string, string?][] = [
  ["N1", "N2", "T"], ["N1", "N3", "F"], ["N3", "N4"], ["N4", "N5", "T"], ["N4", "N6", "F"],
  ["N6", "N7", "T"], ["N6", "N8", "F"], ["N2", "N9"], ["N5", "N9"], ["N7", "N9"], ["N8", "N9"],
  ["N9", "N10", "T"], ["N9", "N11", "F"], ["N10", "N11"],
]

const R = 17

export function CfgDiagram({ trace, className }: { trace?: TraceStep[]; className?: string }) {
  const path = trace ? [...trace.map((t) => t.node).filter((n) => n in NODES), "N11"] : []
  const visited = new Set(path)
  const onPath = (a: string, b: string) => path.some((n, i) => n === a && path[i + 1] === b)

  return (
    <svg viewBox="0 0 470 610" className={cn("w-full max-w-md", className)} role="img" aria-label="Control-flow graph of the screening routine with the decision path highlighted">
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" className="fill-muted-foreground/50" />
        </marker>
        <marker id="arrow-on" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" className="fill-foreground" />
        </marker>
      </defs>
      {EDGES.map(([a, b, tf]) => {
        const p = NODES[a]!
        const q = NODES[b]!
        const dx = q.x - p.x
        const dy = q.y - p.y
        const len = Math.hypot(dx, dy)
        const [x1, y1] = [p.x + (dx / len) * R, p.y + (dy / len) * R]
        const [x2, y2] = [q.x - (dx / len) * (R + 2), q.y - (dy / len) * (R + 2)]
        const on = onPath(a, b)
        return (
          <g key={`${a}-${b}`}>
            <line
              x1={x1} y1={y1} x2={x2} y2={y2}
              className={on ? "stroke-foreground" : "stroke-muted-foreground/35"}
              strokeWidth={on ? 2 : 1.2}
              markerEnd={on ? "url(#arrow-on)" : "url(#arrow)"}
            />
            {tf && (
              <text x={(x1 + x2) / 2 + (dx > 0 ? 6 : -12)} y={(y1 + y2) / 2 - 2} className={cn("text-[13px]", on ? "fill-foreground font-semibold" : "fill-muted-foreground")}>
                {tf}
              </text>
            )}
          </g>
        )
      })}
      {Object.entries(NODES).map(([id, n]) => {
        const on = visited.has(id)
        return (
          <g key={id}>
            {n.decision ? (
              <rect x={n.x - R} y={n.y - R} width={R * 2} height={R * 2} rx={4} transform={`rotate(45 ${n.x} ${n.y})`}
                className={on ? "fill-foreground stroke-foreground" : "fill-background stroke-muted-foreground/50"} strokeWidth={1.2} />
            ) : (
              <circle cx={n.x} cy={n.y} r={R} className={on ? "fill-foreground stroke-foreground" : "fill-background stroke-muted-foreground/50"} strokeWidth={1.2} />
            )}
            <text x={n.x} y={n.y + 3.5} textAnchor="middle" className={cn("text-[12px] font-semibold", on ? "fill-background" : "fill-muted-foreground")}>
              {id}
            </text>
            <text x={n.x + R + 7} y={n.y + 5} className={cn("text-[15px]", on ? "fill-foreground font-medium" : "fill-muted-foreground")}>
              {n.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
