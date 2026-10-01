"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { FlaskConicalIcon, PlusIcon, SendIcon, XIcon } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { send, type Counts, type Criteria, type FairnessResult, type Outcome } from "@/lib/api"
import { DIMENSION_LABEL, OUTCOME_LABEL, ratio } from "@/lib/format"
import type { Taxonomy } from "@/lib/taxonomy"
import { cn } from "@/lib/utils"

interface Preview {
  counts: Record<Outcome, number>
  current: Counts
  moved: Record<string, number>
  fairness: FairnessResult[]
}

const OUTCOMES: Outcome[] = ["shortlist", "waitlist", "manual_review", "reject"]

export function CriteriaEditor({ jobId, version, initial, taxonomy }: { jobId: number; version: number; initial: Criteria; taxonomy: Taxonomy }) {
  const router = useRouter()
  const [draft, setDraft] = useState<Criteria>(initial)
  const [note, setNote] = useState("")
  const [author, setAuthor] = useState("")
  const [preview, setPreview] = useState<Preview | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()
  const [open, setOpen] = useState(false)
  const label = useMemo(() => Object.fromEntries(taxonomy.skills.map((s) => [s.id, s.label])), [taxonomy])
  const dirty = JSON.stringify(draft) !== JSON.stringify(initial)

  const update = (patch: Partial<Criteria>) => {
    setDraft((d) => ({ ...d, ...patch }))
    setPreview(null)
    setError(null)
  }
  const setBand = (i: number, key: "max" | "score", value: number) => {
    const bands = draft.bands.map((b) => ({ ...b }))
    bands[i]![key] = value
    if (key === "max" && bands[i + 1]) bands[i + 1]!.min = value // keep bands contiguous
    update({ bands })
  }
  const addBand = () => {
    const bands = draft.bands.map((b) => ({ ...b }))
    const last = bands[bands.length - 1]!
    const split = last.max >= 99 ? last.min + 3 : last.max
    if (last.max >= 99) last.max = split
    bands.push({ min: split, max: 99, score: last.score })
    update({ bands })
  }
  const removeBand = (i: number) => {
    if (draft.bands.length <= 1) return
    const bands = draft.bands.filter((_, k) => k !== i).map((b) => ({ ...b }))
    bands.forEach((b, k) => (b.min = k === 0 ? 0 : bands[k - 1]!.max))
    bands[bands.length - 1]!.max = Math.max(bands[bands.length - 1]!.max, bands[bands.length - 1]!.min + 1)
    update({ bands })
  }

  const runPreview = () =>
    start(async () => {
      try {
        setPreview(await send<Preview>(`/jobs/${jobId}/criteria/preview`, { method: "POST", json: { criteria: draft } }))
        setError(null)
      } catch (e) {
        setError((e as Error).message)
      }
    })

  const publish = () =>
    start(async () => {
      try {
        const r = await send<{ version: number; audit: { severity: string } }>(`/jobs/${jobId}/criteria`, { method: "POST", json: { criteria: draft, note, author } })
        toast.success(`Published criteria v${r.version}`, { description: `Role re-screened · fairness audit: ${r.audit.severity}` })
        setNote("")
        setPreview(null)
        router.refresh()
      } catch (e) {
        setError((e as Error).message)
      }
    })

  return (
    <div className="grid gap-4 @5xl/main:grid-cols-[1fr_380px]">
      <Card>
        <CardHeader>
          <CardTitle>Ranking criteria</CardTitle>
          <CardDescription>Editing v{version}. The screening routine is fixed; these values are the only inputs a recruiter can change.</CardDescription>
          {dirty && <CardAction><span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">Unsaved draft</span></CardAction>}
        </CardHeader>
        <CardContent className="space-y-7">
          <section className="space-y-2">
            <Label>Mandatory skills</Label>
            <p className="text-xs text-muted-foreground">Missing any of these → reject (N1 → N2).</p>
            <div className="flex flex-wrap items-center gap-1.5">
              {draft.mandatorySkills.map((s) => (
                <span key={s} className="inline-flex items-center gap-1 rounded-md border bg-muted px-2 py-1 text-sm">
                  {label[s] ?? s}
                  <button type="button" aria-label={`Remove ${label[s]}`} className="text-muted-foreground hover:text-foreground" onClick={() => update({ mandatorySkills: draft.mandatorySkills.filter((x) => x !== s) })}>
                    <XIcon className="size-3.5" />
                  </button>
                </span>
              ))}
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm"><PlusIcon /> Add skill</Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search skills…" />
                    <CommandList>
                      <CommandEmpty>No skill found.</CommandEmpty>
                      <CommandGroup>
                        {taxonomy.skills
                          .filter((s) => !draft.mandatorySkills.includes(s.id))
                          .map((s) => (
                            <CommandItem key={s.id} value={s.label} onSelect={() => { update({ mandatorySkills: [...draft.mandatorySkills, s.id] }); setOpen(false) }}>
                              {s.label}
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </section>

          <section className="space-y-2">
            <Label>Experience bands</Label>
            <p className="text-xs text-muted-foreground">Years of experience → score (N3). Bands are contiguous from 0 years.</p>
            <div className="overflow-hidden rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-xs text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">From (yrs)</th>
                    <th className="px-3 py-2 text-left font-medium">To (yrs)</th>
                    <th className="px-3 py-2 text-left font-medium">Score</th>
                    <th className="w-10" />
                  </tr>
                </thead>
                <tbody>
                  {draft.bands.map((b, i) => {
                    const last = i === draft.bands.length - 1
                    return (
                      <tr key={i} className="border-t">
                        <td className="px-3 py-1.5 tabular-nums text-muted-foreground">{b.min}</td>
                        <td className="px-3 py-1.5">
                          {last && b.max >= 99 ? (
                            <span className="text-muted-foreground">and above</span>
                          ) : (
                            <Input type="number" min={b.min + 0.5} step={0.5} value={b.max} onChange={(e) => setBand(i, "max", Number(e.target.value))} className="h-8 w-24" aria-label={`Band ${i + 1} upper bound`} />
                          )}
                        </td>
                        <td className="px-3 py-1.5">
                          <Input type="number" min={0} max={100} value={b.score} onChange={(e) => setBand(i, "score", Number(e.target.value))}
                            className={cn("h-8 w-20", b.score >= draft.threshold && "font-semibold")} aria-label={`Band ${i + 1} score`} />
                        </td>
                        <td className="pr-2">
                          <Button variant="ghost" size="icon-sm" aria-label="Remove band" disabled={draft.bands.length <= 1} onClick={() => removeBand(i)}><XIcon /></Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <Button variant="outline" size="sm" onClick={addBand}><PlusIcon /> Add band</Button>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="threshold">Shortlist threshold</Label>
              <Input id="threshold" type="number" min={0} max={100} value={draft.threshold} onChange={(e) => update({ threshold: Number(e.target.value) })} className="h-8 w-20" />
            </div>
            <Slider min={0} max={100} step={5} value={[draft.threshold]} onValueChange={([v]) => update({ threshold: v! })} />
            <p className="text-xs text-muted-foreground">Band scores at or above this can be shortlisted (N4, N6). Bold scores in the table qualify.</p>
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Job location</Label>
              <Select value={draft.location} onValueChange={(v) => update({ location: v })}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {taxonomy.cities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="remote">Remote allowed</Label>
              <div className="flex h-9 items-center gap-2">
                <Switch id="remote" checked={draft.remoteAllowed} onCheckedChange={(v) => update({ remoteAllowed: v })} />
                <span className="text-sm text-muted-foreground">{draft.remoteAllowed ? "Out-of-city candidates can be shortlisted" : "Must be based in the job city"}</span>
              </div>
            </div>
          </section>
        </CardContent>
        <CardFooter className="flex-wrap justify-between gap-2 border-t py-4">
          <Button variant="ghost" disabled={!dirty || pending} onClick={() => { setDraft(initial); setPreview(null); setError(null) }}>Reset</Button>
          <Button variant="outline" disabled={pending} onClick={runPreview}><FlaskConicalIcon /> Preview impact</Button>
        </CardFooter>
      </Card>

      <div className="space-y-4">
        {error && <p className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">{error}</p>}
        <Card>
          <CardHeader>
            <CardTitle>Impact preview</CardTitle>
            <CardDescription>Dry run of the routine on every applicant for this role. Nothing is saved. Policy holds (a paused auto-reject) still apply on publish.</CardDescription>
          </CardHeader>
          <CardContent>
            {!preview ? (
              <p className="text-sm text-muted-foreground">Change the criteria and run a preview to see outcome shifts and the fairness check before publishing.</p>
            ) : (
              <div className="space-y-5 text-sm">
                <table className="w-full">
                  <thead className="text-xs text-muted-foreground">
                    <tr><th className="pb-1 text-left font-medium">Outcome</th><th className="pb-1 text-right font-medium">Now</th><th className="pb-1 text-right font-medium">Draft</th><th className="pb-1 text-right font-medium">Δ</th></tr>
                  </thead>
                  <tbody>
                    {OUTCOMES.map((o) => {
                      const d = preview.counts[o] - preview.current[o]
                      return (
                        <tr key={o} className="border-t">
                          <td className="py-1.5">{OUTCOME_LABEL[o]}</td>
                          <td className="py-1.5 text-right tabular-nums">{preview.current[o]}</td>
                          <td className="py-1.5 text-right tabular-nums">{preview.counts[o]}</td>
                          <td className={cn("py-1.5 text-right tabular-nums", d > 0 && "text-outcome-shortlist", d < 0 && "text-outcome-reject")}>{d > 0 ? `+${d}` : d || "·"}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                <div className="space-y-1.5">
                  <div className="text-xs font-medium text-muted-foreground">Fairness under draft (lowest impact ratio)</div>
                  {preview.fairness.map((f) => (
                    <div key={f.dimension} className="flex justify-between">
                      <span>{DIMENSION_LABEL[f.dimension]}</span>
                      <span className={cn("tabular-nums", f.breached && "font-semibold text-outcome-reject")}>{ratio(f.minImpactRatio)}{f.breached && " · breach"}</span>
                    </div>
                  ))}
                </div>
                {Object.keys(preview.moved).length > 0 && (
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-muted-foreground">Applicants that would move</div>
                    {Object.entries(preview.moved).sort((a, b) => b[1] - a[1]).map(([k, n]) => (
                      <div key={k} className="flex justify-between text-xs"><span>{k.split("→").map((o) => OUTCOME_LABEL[o as Outcome]).join(" → ")}</span><span className="tabular-nums">{n}</span></div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Publish v{version + 1}</CardTitle>
            <CardDescription>Re-screens every applicant with the new version and runs a fairness audit.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="author">Your name</Label>
              <Input id="author" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="e.g. Talent ops" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="note">Why is this changing?</Label>
              <Textarea id="note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Shown in the version history and audit trail" rows={3} />
            </div>
          </CardContent>
          <CardFooter className="border-t py-4">
            <Button className="w-full" disabled={!dirty || !note.trim() || pending} onClick={publish}><SendIcon /> Publish and re-screen</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
