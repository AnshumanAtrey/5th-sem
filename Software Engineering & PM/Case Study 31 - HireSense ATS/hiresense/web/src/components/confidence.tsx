import { cn } from "@/lib/utils"

/** Parse-confidence meter with the 0.6 routing gate marked. */
export function Confidence({ value, gate = 0.6, className, showValue = true }: { value: number; gate?: number; className?: string; showValue?: boolean }) {
  const low = value < gate
  return (
    <div className={cn("flex items-center gap-2", className)} title={`Parse confidence ${value.toFixed(2)} (gate ${gate})`}>
      <div className="relative h-1.5 w-16 overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full", low ? "bg-outcome-review" : "bg-foreground/70")} style={{ width: `${Math.max(value * 100, 3)}%` }} />
        <div className="absolute inset-y-0 w-px bg-foreground/40" style={{ left: `${gate * 100}%` }} />
      </div>
      {showValue && <span className={cn("text-xs tabular-nums", low ? "text-outcome-review font-medium" : "text-muted-foreground")}>{value.toFixed(2)}</span>}
    </div>
  )
}
