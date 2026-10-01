import { cn } from "@/lib/utils"

export function SkillChips({ skills, labels, highlight = [], missing = [], max }: { skills: string[]; labels: Record<string, string>; highlight?: string[]; missing?: string[]; max?: number }) {
  const shown = max ? skills.slice(0, max) : skills
  return (
    <div className="flex flex-wrap gap-1">
      {shown.map((s) => (
        <span key={s} className={cn("rounded-md border px-1.5 py-0.5 text-xs", highlight.includes(s) ? "border-foreground/30 bg-muted font-medium" : "text-muted-foreground")}>
          {labels[s] ?? s}
        </span>
      ))}
      {missing.map((s) => (
        <span key={`m-${s}`} className="rounded-md border border-dashed border-outcome-reject/60 px-1.5 py-0.5 text-xs text-outcome-reject line-through decoration-1">
          {labels[s] ?? s}
        </span>
      ))}
      {max && skills.length > max && <span className="px-1 py-0.5 text-xs text-muted-foreground">+{skills.length - max}</span>}
      {!skills.length && !missing.length && <span className="text-xs text-muted-foreground">none found</span>}
    </div>
  )
}
