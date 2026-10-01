import Link from "next/link"
import { ArrowUpRightIcon } from "lucide-react"
import { OutcomeTrend } from "@/components/charts"
import { OutcomeBadge, SeverityBadge } from "@/components/outcome-badge"
import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { api, type Audit, type Counts, type JobSummary, type Outcome, type ParserEval } from "@/lib/api"
import { date, DIMENSION_LABEL, num, pct, ratio } from "@/lib/format"

export const metadata = { title: "Overview" }

interface Overview {
  counts: Counts
  series: { month: string; shortlist: number; waitlist: number; reject: number; manual_review: number; total: number }[]
  recent: { id: number; applicationId: number; outcome: Outcome; reason: string; actor: string; createdAt: string; name: string | null; job: string }[]
  jobs: JobSummary[]
  parserEval: ParserEval | null
  companyAudit: Audit | null
  decisions: number
}

export default async function OverviewPage() {
  const o = await api<Overview>("/overview")
  const e = o.parserEval
  const paused = o.jobs.filter((j) => j.autoRejectPaused)

  return (
    <>
      <PageHeader
        title="Overview"
        description="Every automated decision is explained, logged and audited. Ranking criteria are explicit per job; résumés the parser can’t read are routed to a person instead of being silently rejected."
      />

      <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        <StatCard label="Applications screened" value={num(o.counts.total)} hint={`${num(o.decisions)} decisions in the append-only log`} />
        <StatCard label="Shortlisted" value={pct(o.counts.shortlist / o.counts.total, 1)} hint={`${num(o.counts.shortlist)} candidates across ${o.jobs.length} roles`} />
        <StatCard
          label="Awaiting human review"
          value={num(o.counts.manual_review)}
          hint={
            <Link href="/review" className="inline-flex items-center gap-1 underline-offset-4 hover:underline">
              Open review queue <ArrowUpRightIcon className="size-3.5" />
            </Link>
          }
        />
        {e && (
          <StatCard label="Silent parse failures" value={<span>{num(e.total - e.legacyOk)} → {num(e.v2Silent)}</span>} hint={`Legacy vs HireSense on ${num(e.total)} résumés`} />
        )}
      </div>

      <div className="grid gap-4 @5xl/main:grid-cols-3">
        <Card className="@5xl/main:col-span-2">
          <CardHeader>
            <CardTitle>Screening outcomes</CardTitle>
            <CardDescription>Applications per month by current outcome</CardDescription>
          </CardHeader>
          <CardContent>
            <OutcomeTrend data={o.series} />
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {e && (
            <Card>
              <CardHeader>
                <CardTitle>Parser health</CardTitle>
                <CardDescription>Decision fields correct vs ground truth</CardDescription>
                <CardAction>
                  <Button asChild variant="ghost" size="sm"><Link href="/parsing">Details</Link></Button>
                </CardAction>
              </CardHeader>
              <CardContent className="space-y-3">
                <Meter label="Legacy parser" value={e.legacyOk / e.total} note="failures are silent" muted />
                <Meter label="HireSense v2" value={e.v2Ok / e.total} note={`${e.v2Detected} of ${e.total - e.v2Ok} failures caught`} />
              </CardContent>
            </Card>
          )}
          {o.companyAudit && (
            <Card>
              <CardHeader>
                <CardTitle>Latest bias audit</CardTitle>
                <CardDescription>
                  Company-wide · {date(o.companyAudit.period_start)} – {date(o.companyAudit.period_end)}
                </CardDescription>
                <CardAction><SeverityBadge severity={o.companyAudit.severity} /></CardAction>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {o.companyAudit.results.map((r) => (
                  <div key={r.dimension} className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground">{DIMENSION_LABEL[r.dimension]}</span>
                    <span className={r.breached ? "font-medium text-outcome-reject tabular-nums" : "tabular-nums"}>{ratio(r.minImpactRatio)}</span>
                  </div>
                ))}
                <p className="pt-1 text-xs text-muted-foreground">Lowest impact ratio per dimension · rule: ≥ 0.80</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Open roles</CardTitle>
          <CardDescription>
            {paused.length ? `${paused.length} role${paused.length > 1 ? "s have" : " has"} automated rejection paused after a fairness breach.` : "Automated screening active on every role."}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Role</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-right">Applicants</TableHead>
                <TableHead className="text-right">Shortlisted</TableHead>
                <TableHead className="text-right">In review</TableHead>
                <TableHead>Criteria</TableHead>
                <TableHead className="pr-4">Fairness</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {o.jobs.map((j) => (
                <TableRow key={j.id}>
                  <TableCell className="pl-4">
                    <Link href={`/jobs/${j.id}`} className="font-medium hover:underline">{j.title}</Link>
                    <div className="text-xs text-muted-foreground">{j.department}</div>
                  </TableCell>
                  <TableCell>
                    {j.location}
                    {j.remoteAllowed && <Badge variant="secondary" className="ml-2">Remote OK</Badge>}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{num(j.counts.total)}</TableCell>
                  <TableCell className="text-right tabular-nums">{num(j.counts.shortlist)}</TableCell>
                  <TableCell className="text-right tabular-nums">{num(j.counts.manual_review)}</TableCell>
                  <TableCell className="text-muted-foreground">v{j.criteriaVersion}</TableCell>
                  <TableCell className="pr-4">
                    <div className="flex items-center gap-2">
                      {j.latestAudit ? <SeverityBadge severity={j.latestAudit.severity} /> : "—"}
                      {j.autoRejectPaused && <Badge variant="destructive">Auto-reject paused</Badge>}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Latest decisions</CardTitle>
          <CardAction>
            <Button asChild variant="ghost" size="sm"><Link href="/decisions">Decision log</Link></Button>
          </CardAction>
        </CardHeader>
        <CardContent className="divide-y">
          {o.recent.map((d) => (
            <div key={d.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-2.5 text-sm first:pt-0 last:pb-0">
              <OutcomeBadge outcome={d.outcome} />
              <Link href={`/applications/${d.applicationId}`} className="font-medium hover:underline">
                {d.name ?? `Applicant #${d.applicationId}`}
              </Link>
              <span className="text-muted-foreground">{d.job}</span>
              <span className="min-w-0 flex-1 truncate text-muted-foreground">{d.reason}</span>
              <span className="text-xs text-muted-foreground">{d.actor === "system" ? "automated" : d.actor.replace("reviewer:", "")} · {date(d.createdAt, true)}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  )
}

function Meter({ label, value, note, muted }: { label: string; value: number; note: string; muted?: boolean }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between text-sm">
        <span>{label}</span>
        <span className="font-semibold tabular-nums">{pct(value, 1)}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div className={muted ? "h-full bg-muted-foreground/50" : "h-full bg-foreground"} style={{ width: `${value * 100}%` }} />
      </div>
      <p className="text-xs text-muted-foreground">{note}</p>
    </div>
  )
}
