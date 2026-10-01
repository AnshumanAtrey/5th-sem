import Link from "next/link"
import { notFound } from "next/navigation"
import { CheckIcon, GitCompareArrowsIcon, MinusIcon, TriangleAlertIcon } from "lucide-react"
import { CfgDiagram } from "@/components/cfg-diagram"
import { Confidence } from "@/components/confidence"
import { OutcomeBadge } from "@/components/outcome-badge"
import { PageHeader } from "@/components/page-header"
import { PdfViewerLazy } from "@/components/pdf-viewer-lazy"
import { SkillChips } from "@/components/skill-chips"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { api, ApiError, type ApplicationDetail } from "@/lib/api"
import { date, OUTCOME_LABEL, REASON_LABEL } from "@/lib/format"
import { skillLabels, taxonomy } from "@/lib/taxonomy"
import { cn } from "@/lib/utils"
import { ReviewPanel } from "./review-panel"

export async function generateMetadata({ params }: PageProps<"/applications/[id]">) {
  const { id } = await params
  return { title: `Application #${id}` }
}

export default async function ApplicationPage({ params }: PageProps<"/applications/[id]">) {
  const { id } = await params
  const a = await api<ApplicationDetail>(`/applications/${id}`).catch((e) => {
    if (e instanceof ApiError && (e.status === 404 || e.status === 400)) notFound()
    throw e
  })
  const [labels, tax] = await Promise.all([skillLabels(), taxonomy()])
  const latest = a.decisions[0]!
  const p = a.parse
  const mandatory = a.criteria.criteria.mandatorySkills
  const missing = mandatory.filter((s) => !p.skills.includes(s))
  const name = a.candidate.name ?? p.name ?? `Applicant #${a.id}`

  return (
    <>
      <PageHeader
        title={name}
        description={
          <>
            #{a.id} · <Link href={`/jobs/${a.jobId}`} className="underline-offset-4 hover:underline">{a.jobTitle}</Link> · applied {date(a.appliedAt, true)}
            {a.source === "upload" && " · uploaded"}
          </>
        }
      >
        <Button asChild variant="outline" size="sm">
          <Link href={`/compare?a=${a.id}`}><GitCompareArrowsIcon /> Compare</Link>
        </Button>
      </PageHeader>

      <div className="grid gap-4 @5xl/main:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <Card className="h-fit gap-0 overflow-hidden p-0 @5xl/main:sticky @5xl/main:top-4">
          <div className="flex items-center justify-between border-b px-4 py-2.5 text-sm">
            <span className="font-medium">Résumé</span>
            <a href={`/api/applications/${a.id}/resume`} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground">Open PDF ↗</a>
          </div>
          {/* stable gutter: a scrollbar appearing must not change the width, or the PDF re-renders in a loop */}
          <div className="max-h-[80vh] overflow-y-auto bg-white [scrollbar-gutter:stable]">
            <PdfViewerLazy url={`/api/applications/${a.id}/resume`} />
          </div>
        </Card>

        <div className="min-w-0 space-y-4">
          <Card>
            <CardHeader>
              <CardDescription>Decision</CardDescription>
              <CardTitle className="flex flex-wrap items-center gap-3 text-xl">
                {OUTCOME_LABEL[a.status]}
                <OutcomeBadge outcome={a.status} />
              </CardTitle>
              <CardAction className="text-right text-sm">
                <div className="text-2xl font-semibold tabular-nums">#{a.rank}</div>
                <div className="text-xs text-muted-foreground">of {a.rankOf} in role</div>
              </CardAction>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">{latest.reason}</p>
              <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
                <span>Band score <b className="text-foreground">{a.score}</b> / threshold {a.criteria.criteria.threshold}</span>
                <span>Criteria v{latest.criteria_version}</span>
                <span>Parser {latest.parser}</span>
                <span>{latest.actor === "system" ? "Automated" : `By ${latest.actor.replace("reviewer:", "")}`} · {date(latest.created_at, true)}</span>
                {latest.tentative_outcome && <span>Automated outcome withheld: <b className="text-foreground">{OUTCOME_LABEL[latest.tentative_outcome]}</b></span>}
              </div>
              <div className="grid items-start gap-4 rounded-lg border p-3 @3xl/main:grid-cols-[minmax(0,11fr)_minmax(0,9fr)]">
                <CfgDiagram trace={latest.trace} className="mx-auto max-w-none" />
                <ol className="space-y-2.5 text-sm">
                  {latest.trace.map((t) => (
                    <li key={t.node} className="flex gap-2.5">
                      <span className="mt-0.5 w-8 shrink-0 font-mono text-xs text-muted-foreground">{t.node}</span>
                      <div className="min-w-0">
                        <div className="font-medium">{t.label} {typeof t.result === "boolean" && <span className="font-normal text-muted-foreground">→ {t.result ? "true" : "false"}</span>}</div>
                        <div className="text-xs break-words text-muted-foreground">{t.detail}</div>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </CardContent>
          </Card>

          {a.status === "manual_review" && (
            <ReviewPanel appId={a.id} parse={p} taxonomy={tax} reason={REASON_LABEL[latest.reason_code] ?? latest.reason_code} mandatory={mandatory} />
          )}

          <Card>
            <CardHeader>
              <CardTitle>Parsed résumé</CardTitle>
              <CardDescription>Parser {p.parser} · {p.textChars.toLocaleString("en-IN")} characters of text</CardDescription>
              <CardAction><Confidence value={p.confidence} /></CardAction>
            </CardHeader>
            <CardContent className="space-y-5 text-sm">
              <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                <Field label="Email" value={p.email} />
                <Field label="Phone" value={p.phone} />
                <Field label="Location" value={p.location} />
                <Field label="Experience" value={p.yearsExperience == null ? null : `${p.yearsExperience} years`} />
                <div className="sm:col-span-2">
                  <dt className="mb-1 text-xs text-muted-foreground">Skills (mandatory bold, missing struck through)</dt>
                  <dd><SkillChips skills={p.skills} labels={labels} highlight={mandatory} missing={missing} /></dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs text-muted-foreground">University</dt>
                  <dd>{p.university ?? "—"} <span className="text-xs text-muted-foreground">· used only by the bias audit, never by scoring</span></dd>
                </div>
              </dl>

              {p.breakdown.textLayer > 0 && (
                <div className="overflow-hidden rounded-lg border">
                  <table className="w-full text-xs">
                    <thead className="bg-muted/50 text-muted-foreground">
                      <tr><th className="px-3 py-1.5 text-left font-medium">Confidence component</th><th className="px-3 py-1.5 text-right font-medium">Weight</th><th className="px-3 py-1.5 text-left font-medium">Found</th></tr>
                    </thead>
                    <tbody>
                      {Object.entries(p.breakdown.fields).map(([k, f]) => (
                        <tr key={k} className="border-t">
                          <td className="px-3 py-1.5 capitalize">{k}{f.note && <span className="ml-1 normal-case text-muted-foreground">— {f.note}</span>}</td>
                          <td className="px-3 py-1.5 text-right tabular-nums">{f.weight.toFixed(2)}</td>
                          <td className="px-3 py-1.5">{f.found ? <CheckIcon className="size-3.5" /> : <MinusIcon className="size-3.5 text-muted-foreground" />}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {p.issues.length > 0 && (
                <ul className="space-y-1.5">
                  {p.issues.map((i) => (
                    <li key={i} className="flex gap-2 text-xs"><TriangleAlertIcon className="mt-0.5 size-3.5 shrink-0 text-outcome-waitlist" />{i}</li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Legacy system (shadow mode)</CardTitle>
              <CardDescription>The replaced ranker ran on the same PDF for comparison. It never affects decisions.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm">
              <div><div className="text-xs text-muted-foreground">Legacy outcome</div><OutcomeBadge outcome={a.legacy.outcome} className="mt-1" /></div>
              <div><div className="text-xs text-muted-foreground">Opaque legacy score</div><div className="mt-0.5 font-semibold tabular-nums">{a.legacy.score}</div></div>
              <p className={cn("min-w-60 flex-1 text-xs", a.legacy.outcome !== a.status ? "text-foreground" : "text-muted-foreground")}>
                {a.legacy.outcome === a.status
                  ? "Both systems agree."
                  : a.legacy.outcome === "reject" && a.status !== "reject"
                    ? "The legacy system would have rejected this candidate — typically a silent parse failure (skills not extracted) or missing context."
                    : "The systems disagree; HireSense's reason is shown above and can be traced step by step."}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Decision history</CardTitle>
              <CardDescription>Append-only log · {a.decisions.length} entr{a.decisions.length === 1 ? "y" : "ies"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {a.decisions.map((d) => (
                <div key={d.id} className="flex flex-wrap items-start gap-3 border-b pb-3 text-sm last:border-0 last:pb-0">
                  <OutcomeBadge outcome={d.outcome} />
                  <div className="min-w-0 flex-1">
                    <div>{d.reason}</div>
                    <div className="text-xs text-muted-foreground">
                      {d.actor === "system" ? "automated" : d.actor.replace("reviewer:", "reviewed by ")} · criteria v{d.criteria_version} · {d.parser} · confidence {d.confidence.toFixed(2)} · {date(d.created_at, true)}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className={cn("truncate", !value && "text-muted-foreground")}>{value ?? "not found"}</dd>
    </div>
  )
}
