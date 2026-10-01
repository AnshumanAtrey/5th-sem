import Link from "next/link"
import { CfgDiagram } from "@/components/cfg-diagram"
import { Confidence } from "@/components/confidence"
import { OutcomeBadge } from "@/components/outcome-badge"
import { PageHeader } from "@/components/page-header"
import { SkillChips } from "@/components/skill-chips"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { api, ApiError, type Outcome, type TraceStep } from "@/lib/api"
import { date } from "@/lib/format"
import { skillLabels } from "@/lib/taxonomy"

export const metadata = { title: "Compare" }

interface Side {
  id: number
  jobId: number
  job: string
  outcome: Outcome
  score: number
  appliedAt: string
  name: string | null
  rank: number
  trace: TraceStep[]
  reason: string
  skills: string[]
  yearsExperience: number | null
  location: string | null
  confidence: number
  university: string | null
}
interface Comparison { a: Side; b: Side; sameJob: boolean; order: { winner: number; key: string; explanation: string } }

export default async function ComparePage({ searchParams }: PageProps<"/compare">) {
  const sp = await searchParams
  const a = typeof sp.a === "string" ? sp.a : "412"
  const b = typeof sp.b === "string" ? sp.b : "87"
  let cmp: Comparison | null = null
  let error: string | null = null
  try {
    cmp = await api<Comparison>(`/compare?a=${encodeURIComponent(a)}&b=${encodeURIComponent(b)}`)
  } catch (e) {
    if (!(e instanceof ApiError)) throw e
    error = e.message
  }
  const labels = await skillLabels()

  return (
    <>
      <PageHeader
        title="Why did one candidate rank above another?"
        description="The question the old system could not answer. Pick any two applications; the explicit rank keys and each candidate’s decision path are shown side by side."
      >
        <form className="flex items-center gap-2" action="/compare">
          <Input name="a" defaultValue={a} className="w-24" aria-label="Application A" placeholder="#A" />
          <span className="text-sm text-muted-foreground">vs</span>
          <Input name="b" defaultValue={b} className="w-24" aria-label="Application B" placeholder="#B" />
          <Button type="submit" variant="outline">Compare</Button>
        </form>
      </PageHeader>

      {error && <p className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">{error}</p>}

      {cmp && (
        <>
          <Card>
            <CardHeader>
              <CardDescription>{cmp.sameJob ? `Same role · ${cmp.a.job}` : "Different roles — ranks are per role, so compare outcomes and criteria rather than rank numbers"}</CardDescription>
              <CardTitle className="text-lg">
                #{cmp.order.winner} ranks higher: {cmp.order.explanation}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Rank keys, in order: outcome (shortlist › waitlist › manual review › reject) → experience-band score → application time → application id. University, name and every self-declared attribute are not rank keys.
            </CardContent>
          </Card>
          <div className="grid gap-4 @5xl/main:grid-cols-2">
            {[cmp.a, cmp.b].map((s) => (
              <Card key={s.id} className={s.id === cmp!.order.winner ? "ring-foreground/30" : ""}>
                <CardHeader>
                  <CardTitle>
                    <Link href={`/applications/${s.id}`} className="hover:underline">{s.name ?? `Applicant #${s.id}`}</Link>
                  </CardTitle>
                  <CardDescription>#{s.id} · {s.job} · applied {date(s.appliedAt, true)}</CardDescription>
                  <CardAction className="text-right">
                    <div className="text-2xl font-semibold tabular-nums">#{s.rank}</div>
                  </CardAction>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div className="flex flex-wrap items-center gap-3">
                    <OutcomeBadge outcome={s.outcome} />
                    <span>Score <b className="tabular-nums">{s.score}</b></span>
                    <span className="text-muted-foreground">{s.yearsExperience ?? "?"} yrs · {s.location ?? "unknown city"}</span>
                    <Confidence value={s.confidence} />
                  </div>
                  <p>{s.reason}</p>
                  <SkillChips skills={s.skills} labels={labels} />
                  <CfgDiagram trace={s.trace} className="mx-auto max-w-sm" />
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </>
  )
}
