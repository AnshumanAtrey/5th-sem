"use client"

import { useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { FileUpIcon, ShieldCheckIcon } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { send, type Outcome } from "@/lib/api"
import { OUTCOME_LABEL } from "@/lib/format"
import { cn } from "@/lib/utils"

const GENDERS = ["Prefer not to say", "Woman", "Man", "Non-binary"]
const AGE_BANDS = ["Prefer not to say", "18–29", "30–39", "40+"]

export function UploadForm({ jobs, defaultJob }: { jobs: { id: number; title: string; location: string }[]; defaultJob: string }) {
  const router = useRouter()
  const input = useRef<HTMLInputElement>(null)
  const [job, setJob] = useState(defaultJob)
  const [file, setFile] = useState<File | null>(null)
  const [drag, setDrag] = useState(false)
  const [gender, setGender] = useState(GENDERS[0]!)
  const [ageBand, setAgeBand] = useState(AGE_BANDS[0]!)
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()

  const pick = (f: File | undefined) => {
    setError(null)
    if (!f) return
    if (f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")) return setError("Please choose a PDF file.")
    if (f.size > 5 * 1024 * 1024) return setError("PDF must be 5 MB or smaller.")
    setFile(f)
  }

  const submit = () =>
    start(async () => {
      if (!file) return
      const body = new FormData()
      body.set("jobId", job)
      body.set("file", file)
      body.set("gender", gender)
      body.set("ageBand", ageBand)
      try {
        const r = await send<{ id: number; decision: { outcome: Outcome; reason: string } }>("/applications", { method: "POST", body })
        toast.success(`Application #${r.id}: ${OUTCOME_LABEL[r.decision.outcome]}`, { description: r.decision.reason })
        router.push(`/applications/${r.id}`)
      } catch (e) {
        setError((e as Error).message)
      }
    })

  return (
    <div className="grid gap-4 @4xl/main:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <Card>
        <CardHeader>
          <CardTitle>Résumé</CardTitle>
          <CardDescription>PDF up to 5 MB. Try a scanned PDF too: it is routed to review instead of being rejected.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-1.5">
            <Label>Role</Label>
            <Select value={job} onValueChange={setJob}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {jobs.map((j) => <SelectItem key={j.id} value={String(j.id)}>{j.title} · {j.location}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <button
            type="button"
            onClick={() => input.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files[0]) }}
            className={cn("flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-6 py-12 text-center transition-colors", drag ? "border-foreground bg-muted" : "hover:bg-muted/50")}
          >
            <FileUpIcon className="size-6 text-muted-foreground" />
            {file ? (
              <span className="text-sm font-medium">{file.name} · {(file.size / 1024).toFixed(0)} KB</span>
            ) : (
              <>
                <span className="text-sm font-medium">Drop a PDF here or click to choose</span>
                <span className="text-xs text-muted-foreground">Parsed locally by the HireSense API</span>
              </>
            )}
          </button>
          <input ref={input} type="file" accept="application/pdf,.pdf" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
        <CardFooter className="justify-end border-t py-4">
          <Button disabled={!file || pending} onClick={submit}>{pending ? "Screening…" : "Parse and screen"}</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ShieldCheckIcon className="size-4" /> Voluntary self-identification</CardTitle>
          <CardDescription>
            Optional. Stored in a separate table read only by the bias audit. The screening routine and recruiters never see it.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Gender</Label>
            <Select value={gender} onValueChange={setGender}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>{GENDERS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Age band</Label>
            <Select value={ageBand} onValueChange={setAgeBand}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>{AGE_BANDS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
