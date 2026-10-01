import type { Outcome, Severity } from "@/lib/api"
import { OUTCOME_LABEL } from "@/lib/format"
import { cn } from "@/lib/utils"

const DOT: Record<Outcome, string> = {
  shortlist: "bg-outcome-shortlist",
  waitlist: "bg-outcome-waitlist",
  manual_review: "bg-outcome-review",
  reject: "bg-outcome-reject",
}

export function OutcomeBadge({ outcome, className }: { outcome: Outcome; className?: string }) {
  return (
    <span className={cn("inline-flex h-5 items-center gap-1.5 rounded-full border px-2 text-xs font-medium whitespace-nowrap", className)}>
      <span className={cn("size-1.5 rounded-full", DOT[outcome])} />
      {OUTCOME_LABEL[outcome]}
    </span>
  )
}

export const outcomeDot = (o: Outcome) => DOT[o]

const SEVERITY: Record<Severity, { label: string; cls: string }> = {
  pass: { label: "Pass", cls: "bg-outcome-shortlist" },
  warning: { label: "Warning", cls: "bg-outcome-waitlist" },
  critical: { label: "Critical", cls: "bg-outcome-reject" },
}

export function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <span className="inline-flex h-5 items-center gap-1.5 rounded-full border px-2 text-xs font-medium">
      <span className={cn("size-1.5 rounded-full", SEVERITY[severity].cls)} />
      {SEVERITY[severity].label}
    </span>
  )
}
