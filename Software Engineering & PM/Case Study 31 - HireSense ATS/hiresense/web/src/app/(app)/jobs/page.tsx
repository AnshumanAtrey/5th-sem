import Link from "next/link"
import { SeverityBadge, outcomeDot } from "@/components/outcome-badge"
import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { api, type JobSummary, type Outcome } from "@/lib/api"
import { num, OUTCOME_LABEL } from "@/lib/format"
import { cn } from "@/lib/utils"

export const metadata = { title: "Jobs" }

const ORDER: Outcome[] = ["shortlist", "waitlist", "manual_review", "reject"]

export default async function JobsPage() {
  const jobs = await api<JobSummary[]>("/jobs")
  return (
    <>
      <PageHeader title="Jobs" description="Each role has its own explicit, versioned ranking criteria. Changing a rule creates a new version and re-screens the role." />
      <div className="grid gap-4 @3xl/main:grid-cols-2 @6xl/main:grid-cols-3">
        {jobs.map((j) => (
          <Link key={j.id} href={`/jobs/${j.id}`} className="group">
            <Card className="h-full transition-colors group-hover:ring-foreground/25">
              <CardHeader>
                <CardTitle>{j.title}</CardTitle>
                <CardDescription>
                  {j.department} · {j.location}
                  {j.remoteAllowed ? " · remote OK" : ""}
                </CardDescription>
                <CardAction>{j.latestAudit && <SeverityBadge severity={j.latestAudit.severity} />}</CardAction>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex h-2 overflow-hidden rounded-full bg-muted">
                  {ORDER.map((o) => (
                    <div key={o} className={cn("h-full", outcomeDot(o))} style={{ width: `${(j.counts[o] / Math.max(1, j.counts.total)) * 100}%` }} />
                  ))}
                </div>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  {ORDER.map((o) => (
                    <div key={o}>
                      <div className="text-base font-semibold tabular-nums">{num(j.counts[o])}</div>
                      <div className="text-muted-foreground">{OUTCOME_LABEL[o]}</div>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-muted-foreground">
                  <span>{num(j.counts.total)} applicants</span>
                  <span>·</span>
                  <span>criteria v{j.criteriaVersion}</span>
                  {j.autoRejectPaused && <Badge variant="destructive">Auto-reject paused</Badge>}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </>
  )
}
