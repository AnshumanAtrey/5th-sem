import Link from "next/link"
import { RatioTrend } from "@/components/charts"
import { FairnessPanel } from "@/components/fairness-panel"
import { SeverityBadge } from "@/components/outcome-badge"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { api, type Audit, type FairnessResult, type JobSummary } from "@/lib/api"
import { date, ratio } from "@/lib/format"
import { cn } from "@/lib/utils"
import { RunAuditButton } from "./run-audit-button"

export const metadata = { title: "Bias audit" }

const SPEC = [
  ["Metric", "Selection rate per declared group = shortlisted ÷ decided applicants. Impact ratio = group rate ÷ highest group’s rate."],
  ["Requirement", "Every declared group with n ≥ 30 must have impact ratio ≥ 0.80 (4/5ths rule). Smaller groups are reported, not enforced."],
  ["Frequency", "Monthly, over a rolling 90-day window, per role and company-wide; also after every criteria change; on demand."],
  ["Warning", "Breach that is not statistically significant (z < 1.96): incident opened, criteria owner reviews within 5 working days, weekly audits."],
  ["Critical", "Significant breach: automated rejection paused for the role; rejections go to human review until a re-audit passes."],
]

export default async function AuditPage({ searchParams }: PageProps<"/audit">) {
  const sp = await searchParams
  const scope = typeof sp.scope === "string" ? sp.scope : "company"
  const jobId = scope === "company" ? null : Number(scope)
  const [jobs, fair, audits] = await Promise.all([
    api<JobSummary[]>("/jobs"),
    api<{ current: FairnessResult[]; legacy: FairnessResult[] }>(`/fairness${jobId ? `?job=${jobId}` : ""}`),
    api<Audit[]>(`/audits?job=${jobId ?? "company"}`),
  ])
  const trend = [...audits]
    .filter((a) => a.trigger === "scheduled")
    .sort((a, b) => a.period_end.localeCompare(b.period_end))
    .map((a) => {
      const by = (d: string) => a.results.find((r) => r.dimension === d)?.minImpactRatio ?? null
      return { period: a.period_end, gender: by("gender"), age_band: by("age_band"), university_tier: by("university_tier") }
    })
  const scopes: [string, string][] = [["company", "Company-wide"], ...jobs.map((j) => [String(j.id), j.title] as [string, string])]

  return (
    <>
      <PageHeader
        title="Bias audit"
        description="A recurring audit, not a one-off report. Group attributes come from voluntary self-identification (gender, age band) or are derived for audit only (university tier). The screening routine never reads them."
      >
        <RunAuditButton jobId={jobId} />
      </PageHeader>

      <div className="flex flex-wrap gap-1">
        {scopes.map(([k, l]) => (
          <Link key={k} href={`/audit?scope=${k}`} className={cn("rounded-md px-2.5 py-1 text-sm", scope === k ? "bg-muted font-medium" : "text-muted-foreground hover:text-foreground")}>{l}</Link>
        ))}
      </div>

      <div className="grid gap-4 @5xl/main:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Lowest impact ratio per scheduled audit</CardTitle>
            <CardDescription>Rolling 90-day windows · dashed line = 0.80 rule</CardDescription>
          </CardHeader>
          <CardContent>{trend.length ? <RatioTrend data={trend} /> : <p className="text-sm text-muted-foreground">No scheduled audits yet.</p>}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Audit specification</CardTitle>
            <CardDescription>What is measured, how often, and what a breach triggers</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3 text-sm">
              {SPEC.map(([k, v]) => (
                <div key={k} className="grid grid-cols-[84px_1fr] gap-3">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-2">
        <h2 className="text-base font-semibold">All decided applications {jobId ? "for this role" : "company-wide"}</h2>
        <p className="text-sm text-muted-foreground">Dark bars: HireSense. Light bars: the legacy ranker on the same applicants (shadow mode), whose score rewarded university tier. * = significant gap.</p>
      </div>
      <FairnessPanel current={fair.current} legacy={fair.legacy} />

      <Card>
        <CardHeader>
          <CardTitle>Audit history</CardTitle>
          <CardDescription>{audits.length} audits · newest first</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Window</TableHead>
                <TableHead>Trigger</TableHead>
                <TableHead>Result</TableHead>
                <TableHead className="text-right">Lowest ratio</TableHead>
                <TableHead className="pr-4">Action taken</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {audits.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="pl-4 whitespace-nowrap">{date(a.period_start)} – {date(a.period_end)}</TableCell>
                  <TableCell className="text-muted-foreground capitalize">{a.trigger.replace("_", " ")}</TableCell>
                  <TableCell><SeverityBadge severity={a.severity} /></TableCell>
                  <TableCell className={cn("text-right tabular-nums", a.breached && "text-outcome-reject")}>{ratio(a.min_ratio)}</TableCell>
                  <TableCell className="max-w-xl pr-4 text-sm whitespace-normal text-muted-foreground">{a.action}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  )
}
