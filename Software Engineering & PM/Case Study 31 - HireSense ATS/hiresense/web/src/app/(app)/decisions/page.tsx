import Link from "next/link"
import { DownloadIcon } from "lucide-react"
import { OutcomeBadge } from "@/components/outcome-badge"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { api, type DecisionRow, type JobSummary, type Outcome } from "@/lib/api"
import { date, num, OUTCOME_LABEL, REASON_LABEL } from "@/lib/format"
import { cn } from "@/lib/utils"

export const metadata = { title: "Decision log" }

interface Log {
  total: number
  page: number
  pageSize: number
  rows: DecisionRow[]
  reasons: { code: string; outcome: Outcome; n: number }[]
}

export default async function DecisionsPage({ searchParams }: PageProps<"/decisions">) {
  const sp = await searchParams
  const pick = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : "all")
  const f = { outcome: pick("outcome"), reason: pick("reason"), job: pick("job"), actor: pick("actor") }
  const page = Number(sp.page ?? 1) || 1
  const qs = (over: Record<string, string | number> = {}) => new URLSearchParams({ ...f, page: String(page), ...Object.fromEntries(Object.entries(over).map(([k, v]) => [k, String(v)])) }).toString()
  const [log, jobs] = await Promise.all([api<Log>(`/decisions?${qs()}`), api<JobSummary[]>("/jobs")])
  const pages = Math.max(1, Math.ceil(log.total / log.pageSize))
  const csv = new URLSearchParams(Object.entries(f).filter(([, v]) => v !== "all")).toString()

  const filter = (name: keyof typeof f, options: [string, string][]) => (
    <div className="flex flex-wrap gap-1">
      {[["all", "All"] as [string, string], ...options].map(([v, l]) => (
        <Link key={v} href={`/decisions?${qs({ [name]: v, page: 1 })}`} className={cn("rounded-md px-2.5 py-1 text-sm", f[name] === v ? "bg-muted font-medium" : "text-muted-foreground hover:text-foreground")}>
          {l}
        </Link>
      ))}
    </div>
  )

  return (
    <>
      <PageHeader
        title="Decision log"
        description="Every automated and human decision, append-only: outcome, reason code, human-readable reason, criteria version, parser and confidence. Every automated rejection is here with its reason."
      >
        <Button asChild variant="outline" size="sm">
          <a href={`/api/decisions.csv${csv ? `?${csv}` : ""}`}><DownloadIcon /> Export CSV</a>
        </Button>
      </PageHeader>

      <Card>
        <CardContent className="space-y-2">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <span className="w-16 text-xs text-muted-foreground">Outcome</span>
            {filter("outcome", (["shortlist", "waitlist", "manual_review", "reject"] as const).map((o) => [o, OUTCOME_LABEL[o]]))}
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <span className="w-16 text-xs text-muted-foreground">Reason</span>
            {filter("reason", log.reasons.map((r) => [r.code, `${REASON_LABEL[r.code] ?? r.code} · ${num(r.n)}`]))}
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <span className="w-16 text-xs text-muted-foreground">Role</span>
            {filter("job", jobs.map((j) => [String(j.id), j.title]))}
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <span className="w-16 text-xs text-muted-foreground">Actor</span>
            {filter("actor", [["system", "Automated"], ["human", "Human reviewer"]])}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">#</TableHead>
                <TableHead>When</TableHead>
                <TableHead>Candidate</TableHead>
                <TableHead>Outcome</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead className="text-right">Score</TableHead>
                <TableHead>Criteria</TableHead>
                <TableHead className="text-right">Conf.</TableHead>
                <TableHead className="pr-4">Actor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {log.rows.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="pl-4 font-mono text-xs text-muted-foreground">{d.id}</TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">{date(d.createdAt, true)}</TableCell>
                  <TableCell>
                    <Link href={`/applications/${d.applicationId}`} className="font-medium hover:underline">{d.name ?? `#${d.applicationId}`}</Link>
                    <div className="text-xs text-muted-foreground">{d.job}</div>
                  </TableCell>
                  <TableCell>
                    <OutcomeBadge outcome={d.outcome} />
                    {d.tentative && <div className="mt-1 text-xs text-muted-foreground">withheld: {OUTCOME_LABEL[d.tentative]}</div>}
                  </TableCell>
                  <TableCell className="max-w-80">
                    <div className="font-mono text-[11px] text-muted-foreground">{d.reasonCode}</div>
                    <div className="truncate" title={d.reason}>{d.reason}</div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{d.score}</TableCell>
                  <TableCell className="text-muted-foreground">v{d.criteriaVersion}</TableCell>
                  <TableCell className="text-right tabular-nums">{d.confidence.toFixed(2)}</TableCell>
                  <TableCell className="pr-4 text-muted-foreground">{d.actor === "system" ? "automated" : d.actor.replace("reviewer:", "")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between px-4 pt-4 text-sm text-muted-foreground">
            <span>{num(log.total)} decisions · page {page} of {pages}</span>
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm" className={cn(page <= 1 && "pointer-events-none opacity-50")}><Link href={`/decisions?${qs({ page: page - 1 })}`}>Previous</Link></Button>
              <Button asChild variant="outline" size="sm" className={cn(page >= pages && "pointer-events-none opacity-50")}><Link href={`/decisions?${qs({ page: page + 1 })}`}>Next</Link></Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
