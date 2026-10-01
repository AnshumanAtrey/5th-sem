import Link from "next/link"
import { notFound } from "next/navigation"
import { PauseCircleIcon, SearchIcon, UploadIcon } from "lucide-react"
import { Confidence } from "@/components/confidence"
import { FairnessPanel } from "@/components/fairness-panel"
import { OutcomeBadge, SeverityBadge } from "@/components/outcome-badge"
import { PageHeader } from "@/components/page-header"
import { SkillChips } from "@/components/skill-chips"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { api, ApiError, type Audit, type CriteriaVersion, type FairnessResult, type JobSummary, type RankedRow } from "@/lib/api"
import { band, date, num, OUTCOME_LABEL, ratio } from "@/lib/format"
import { skillLabels, taxonomy } from "@/lib/taxonomy"
import { cn } from "@/lib/utils"
import { CriteriaEditor } from "./criteria-editor"

type Job = JobSummary & { criteria: CriteriaVersion; versions: CriteriaVersion[] }
const TABS = [
  { id: "candidates", label: "Ranked candidates" },
  { id: "criteria", label: "Criteria" },
  { id: "fairness", label: "Fairness" },
  { id: "history", label: "History" },
] as const

export async function generateMetadata({ params }: PageProps<"/jobs/[id]">) {
  const { id } = await params
  const job = await api<Job>(`/jobs/${id}`).catch(() => null)
  return { title: job?.title ?? "Job" }
}

export default async function JobPage({ params, searchParams }: PageProps<"/jobs/[id]">) {
  const { id } = await params
  const sp = await searchParams
  const tab = (TABS.find((t) => t.id === sp.tab)?.id ?? "candidates") as (typeof TABS)[number]["id"]
  const job = await api<Job>(`/jobs/${id}`).catch((e) => {
    if (e instanceof ApiError && (e.status === 404 || e.status === 400)) notFound()
    throw e
  })
  const c = job.criteria.criteria

  return (
    <>
      <PageHeader
        title={job.title}
        description={
          <>
            {job.department} · {c.location} · {c.remoteAllowed ? "remote allowed" : "on-site only"} · criteria v{job.criteriaVersion} · opened {date(job.openedAt)}
          </>
        }
      >
        <Button asChild variant="outline" size="sm">
          <Link href={`/upload?job=${job.id}`}><UploadIcon /> Add applicant</Link>
        </Button>
      </PageHeader>

      {job.autoRejectPaused && (
        <Alert variant="destructive">
          <PauseCircleIcon />
          <AlertTitle>Automated rejection is paused for this role</AlertTitle>
          <AlertDescription>{job.pausedReason}. Rejections are routed to the review queue until a re-audit passes.</AlertDescription>
        </Alert>
      )}

      <nav className="flex gap-1 border-b">
        {TABS.map((t) => (
          <Link
            key={t.id}
            href={`/jobs/${job.id}?tab=${t.id}`}
            className={cn("-mb-px border-b-2 px-3 py-2 text-sm transition-colors", tab === t.id ? "border-foreground font-medium" : "border-transparent text-muted-foreground hover:text-foreground")}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {tab === "candidates" && <Candidates job={job} sp={sp} />}
      {tab === "criteria" && <CriteriaTab job={job} />}
      {tab === "fairness" && <FairnessTab jobId={job.id} />}
      {tab === "history" && <HistoryTab job={job} />}
    </>
  )
}

async function Candidates({ job, sp }: { job: Job; sp: Record<string, string | string[] | undefined> }) {
  const status = typeof sp.status === "string" ? sp.status : "all"
  const q = typeof sp.q === "string" ? sp.q : ""
  const page = Number(sp.page ?? 1) || 1
  const qs = (over: Record<string, string | number>) => {
    const u = new URLSearchParams({ tab: "candidates", status, q, page: String(page), ...Object.fromEntries(Object.entries(over).map(([k, v]) => [k, String(v)])) })
    return `/jobs/${job.id}?${u}`
  }
  const [list, labels] = await Promise.all([
    api<{ total: number; page: number; pageSize: number; rows: RankedRow[] }>(`/jobs/${job.id}/applications?status=${status}&q=${encodeURIComponent(q)}&page=${page}`),
    skillLabels(),
  ])
  const pages = Math.max(1, Math.ceil(list.total / list.pageSize))
  const mandatory = job.criteria.criteria.mandatorySkills
  const filters: [string, string, number][] = [
    ["all", "All", job.counts.total],
    ...(["shortlist", "waitlist", "manual_review", "reject"] as const).map((o): [string, string, number] => [o, OUTCOME_LABEL[o], job.counts[o]]),
  ]

  return (
    <Card>
      <CardHeader className="gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1">
            {filters.map(([k, label, n]) => (
              <Link key={k} href={qs({ status: k, page: 1 })} className={cn("rounded-md px-2.5 py-1 text-sm", status === k ? "bg-muted font-medium" : "text-muted-foreground hover:text-foreground")}>
                {label} <span className="tabular-nums text-muted-foreground">{num(n)}</span>
              </Link>
            ))}
          </div>
          <form className="relative w-full max-w-xs" action={`/jobs/${job.id}`}>
            <input type="hidden" name="tab" value="candidates" />
            <input type="hidden" name="status" value={status} />
            <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input name="q" defaultValue={q} placeholder="Search name or application #" className="pl-8" />
          </form>
        </div>
        <CardDescription>
          Rank order is explicit: outcome → experience-band score → application time. Mandatory skills are bold.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-14 pl-4">Rank</TableHead>
              <TableHead>Candidate</TableHead>
              <TableHead>Outcome</TableHead>
              <TableHead className="text-right">Score</TableHead>
              <TableHead className="text-right">Exp.</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Skills</TableHead>
              <TableHead>Parse</TableHead>
              <TableHead className="pr-4">Reason</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="pl-4 tabular-nums text-muted-foreground">{r.rank}</TableCell>
                <TableCell>
                  <Link href={`/applications/${r.id}`} className="font-medium hover:underline">{r.name}</Link>
                  <div className="text-xs text-muted-foreground">#{r.id} · {date(r.appliedAt)}</div>
                </TableCell>
                <TableCell><OutcomeBadge outcome={r.outcome} /></TableCell>
                <TableCell className="text-right tabular-nums">{r.score}</TableCell>
                <TableCell className="text-right tabular-nums">{r.yearsExperience ?? "—"}</TableCell>
                <TableCell>{r.location ?? <span className="text-muted-foreground">—</span>}</TableCell>
                <TableCell className="max-w-56"><SkillChips skills={r.skills} labels={labels} highlight={mandatory} max={4} /></TableCell>
                <TableCell><Confidence value={r.confidence} /></TableCell>
                <TableCell className="max-w-72 truncate pr-4 text-muted-foreground" title={r.reason}>{r.reason}</TableCell>
              </TableRow>
            ))}
            {!list.rows.length && (
              <TableRow>
                <TableCell colSpan={9} className="py-10 text-center text-muted-foreground">No applications match.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between px-4 pt-4 text-sm text-muted-foreground">
          <span>{num(list.total)} applications · page {page} of {pages}</span>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm" className={cn(page <= 1 && "pointer-events-none opacity-50")}><Link href={qs({ page: page - 1 })}>Previous</Link></Button>
            <Button asChild variant="outline" size="sm" className={cn(page >= pages && "pointer-events-none opacity-50")}><Link href={qs({ page: page + 1 })}>Next</Link></Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

async function CriteriaTab({ job }: { job: Job }) {
  const tax = await taxonomy()
  return <CriteriaEditor jobId={job.id} version={job.criteriaVersion} initial={job.criteria.criteria} taxonomy={tax} />
}

async function FairnessTab({ jobId }: { jobId: number }) {
  const f = await api<{ current: FairnessResult[]; legacy: FairnessResult[] }>(`/fairness?job=${jobId}`)
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        All decided applications for this role. Impact ratio = group selection rate ÷ highest group&apos;s rate; the rule requires ≥ 0.80 for every declared group with n ≥ 30.
        Light bars show the legacy ranker on the same applicants (shadow mode). * = statistically significant gap (z ≥ 1.96).
      </p>
      <FairnessPanel current={f.current} legacy={f.legacy} />
    </div>
  )
}

async function HistoryTab({ job }: { job: Job }) {
  const [audits, labels] = await Promise.all([api<Audit[]>(`/audits?job=${job.id}`), skillLabels()])
  return (
    <div className="grid gap-4 @5xl/main:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Criteria versions</CardTitle>
          <CardDescription>Immutable; every decision records the version it used.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {job.versions.map((v) => (
            <div key={v.id} className="relative border-l pl-4">
              <span className="absolute top-1.5 -left-[5px] size-2.5 rounded-full border-2 border-background bg-foreground" />
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="font-medium">v{v.version}</span>
                <span className="text-xs text-muted-foreground">{date(v.created_at, true)} · {v.author} · {num(v.decisions ?? 0)} decisions</span>
              </div>
              {v.note && <p className="mt-1 text-sm">{v.note}</p>}
              <div className="mt-2 space-y-1.5 text-xs text-muted-foreground">
                <SkillChips skills={v.criteria.mandatorySkills} labels={labels} highlight={v.criteria.mandatorySkills} />
                <div>Threshold {v.criteria.threshold} · {v.criteria.location} · remote {v.criteria.remoteAllowed ? "allowed" : "not allowed"}</div>
                <div>{v.criteria.bands.map((b) => `${band(b)}: ${b.score}`).join(" · ")}</div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Audits for this role</CardTitle>
          <CardDescription>Monthly over a rolling 90-day window, plus after every criteria change.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {audits.map((a) => (
            <div key={a.id} className="rounded-lg border p-3 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <SeverityBadge severity={a.severity} />
                <span className="font-medium">{date(a.period_start)} – {date(a.period_end)}</span>
                <span className="text-xs text-muted-foreground">{a.trigger.replace("_", " ")} · lowest ratio {ratio(a.min_ratio)}</span>
              </div>
              <p className="mt-1.5 text-muted-foreground">{a.action}</p>
            </div>
          ))}
          {!audits.length && <p className="text-sm text-muted-foreground">No audits yet.</p>}
        </CardContent>
      </Card>
    </div>
  )
}
