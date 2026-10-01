"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { CheckIcon, PlusIcon, SparklesIcon, XIcon } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { send, type Outcome, type Parsed } from "@/lib/api"
import { OUTCOME_LABEL } from "@/lib/format"
import type { Taxonomy } from "@/lib/taxonomy"

interface Suggestion {
  model: string
  ms: number
  skills: string[]
  location: string | null
  yearsExperience: number | null
  positions: { title: string; company: string; start: string; end: string; grounded: boolean }[]
  dropped: string[]
}

const NONE = "__none__"

export function ReviewPanel({ appId, parse, taxonomy, reason, mandatory }: { appId: number; parse: Parsed; taxonomy: Taxonomy; reason: string; mandatory: string[] }) {
  const router = useRouter()
  const [skills, setSkills] = useState<string[]>(parse.skills)
  const [years, setYears] = useState<string>(parse.yearsExperience == null ? "" : String(parse.yearsExperience))
  const [location, setLocation] = useState<string>(parse.location ?? NONE)
  const [reviewer, setReviewer] = useState("")
  const [note, setNote] = useState("")
  const [ai, setAi] = useState<Suggestion | null>(null)
  const [aiError, setAiError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [aiPending, startAi] = useTransition()
  const [pending, start] = useTransition()
  const label = useMemo(() => Object.fromEntries(taxonomy.skills.map((s) => [s.id, s.label])), [taxonomy])

  const suggest = () =>
    startAi(async () => {
      setAiError(null)
      try {
        const s = await send<Suggestion>(`/applications/${appId}/ai-extract`, { method: "POST" })
        setAi(s)
        setSkills((cur) => [...new Set([...cur, ...s.skills])])
        if (s.yearsExperience != null) setYears(String(s.yearsExperience))
        if (s.location) setLocation(s.location)
      } catch (e) {
        setAiError((e as Error).message)
      }
    })

  const confirm = () =>
    start(async () => {
      try {
        const r = await send<{ decision: { outcome: Outcome; reason: string } }>(`/applications/${appId}/review`, {
          method: "POST",
          json: { reviewer, note, skills, yearsExperience: years === "" ? null : Number(years), location: location === NONE ? null : location },
        })
        toast.success(`Screened: ${OUTCOME_LABEL[r.decision.outcome]}`, { description: r.decision.reason })
        router.refresh()
      } catch (e) {
        toast.error((e as Error).message)
      }
    })

  return (
    <Card className="ring-outcome-review/40">
      <CardHeader>
        <CardTitle>Human review</CardTitle>
        <CardDescription>
          Routed here because: {reason}. Check the fields against the PDF. The same routine then decides with your verified values, and the log records you as the actor.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-dashed p-3">
          <Button variant="outline" size="sm" onClick={suggest} disabled={aiPending}>
            <SparklesIcon /> {aiPending ? "Reading résumé…" : "Suggest with local model"}
          </Button>
          <p className="min-w-52 flex-1 text-xs text-muted-foreground">
            A small on-device model (Ollama) proposes values. It only extracts; every value is checked against the résumé text, and you still confirm.
          </p>
          {aiError && <p className="w-full text-xs text-destructive">{aiError}</p>}
          {ai && (
            <div className="w-full space-y-1 text-xs">
              <div className="text-muted-foreground">{ai.model} · {(ai.ms / 1000).toFixed(1)}s · {ai.positions.filter((p) => p.grounded).length} positions read</div>
              {ai.positions.map((p, i) => (
                <div key={i} className={p.grounded ? "" : "text-muted-foreground line-through"}>{p.title} — {p.company} · {p.start} → {p.end}</div>
              ))}
              {ai.dropped.length > 0 && <div className="text-muted-foreground">Dropped (not grounded in text): {ai.dropped.join("; ")}</div>}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label>Skills</Label>
          <div className="flex flex-wrap items-center gap-1.5">
            {skills.map((s) => (
              <span key={s} className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-sm ${mandatory.includes(s) ? "bg-muted font-medium" : ""}`}>
                {label[s] ?? s}
                {ai?.skills.includes(s) && !parse.skills.includes(s) && <SparklesIcon className="size-3 text-muted-foreground" aria-label="suggested by model" />}
                <button type="button" aria-label={`Remove ${label[s]}`} className="text-muted-foreground hover:text-foreground" onClick={() => setSkills(skills.filter((x) => x !== s))}>
                  <XIcon className="size-3.5" />
                </button>
              </span>
            ))}
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild><Button variant="outline" size="sm"><PlusIcon /> Add</Button></PopoverTrigger>
              <PopoverContent className="w-64 p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search skills…" />
                  <CommandList>
                    <CommandEmpty>No skill found.</CommandEmpty>
                    <CommandGroup>
                      {taxonomy.skills.filter((s) => !skills.includes(s.id)).map((s) => (
                        <CommandItem key={s.id} value={s.label} onSelect={() => { setSkills([...skills, s.id]); setOpen(false) }}>{s.label}</CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="years">Years of experience</Label>
            <Input id="years" type="number" min={0} max={60} step={0.1} value={years} onChange={(e) => setYears(e.target.value)} placeholder="unknown" />
          </div>
          <div className="space-y-1.5">
            <Label>Location</Label>
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>Unknown</SelectItem>
                {taxonomy.cities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="reviewer">Reviewer</Label>
            <Input id="reviewer" value={reviewer} onChange={(e) => setReviewer(e.target.value)} placeholder="Your name" />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="note">Note (optional)</Label>
            <Textarea id="note" rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Scanned PDF — read manually" />
          </div>
        </div>
      </CardContent>
      <CardFooter className="justify-end border-t py-4">
        <Button onClick={confirm} disabled={pending || !reviewer.trim()}><CheckIcon /> Confirm fields and screen</Button>
      </CardFooter>
    </Card>
  )
}
