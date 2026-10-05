"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { data } from "@/lib/data"
import { COLUMN_MEANING } from "@/lib/columns"
import { toNumber, type Flow } from "@/lib/ids"
import { cn } from "@/lib/utils"

function FeatureInput({ name, value, onChange }: { name: string; value: unknown; onChange: (v: string) => void }) {
  const id = `f-${name.replace(/\W/g, "_")}`
  const bad = Number.isNaN(toNumber(value))
  return (
    <div className="grid gap-1">
      <Label htmlFor={id} className="grid gap-0 text-xs font-normal text-muted-foreground">
        <span className="font-mono text-foreground">{name}</span>
        {COLUMN_MEANING[name] && <span className="text-[11px] leading-snug">{COLUMN_MEANING[name]}</span>}
      </Label>
      <Input id={id} inputMode="decimal" value={String(value ?? "")} aria-invalid={bad || undefined}
        onChange={(e) => onChange(e.target.value)} className="h-8 font-mono text-sm tabular" />
    </div>
  )
}

/** The flow being checked: pick a named example, or edit its numbers. */
export function FlowEditor({ features, flow, example, onExample, onChange }: {
  features: string[]
  flow: Flow
  example: string
  onExample: (name: string) => void
  onChange: (name: string, value: string) => void
}) {
  const [all, setAll] = useState(false)
  const top = data.top_features
  const rest = features.filter((f) => !top.includes(f))
  return (
    <section aria-labelledby="flow-title" className="grid content-start gap-5">
      <div className="grid gap-2">
        <h2 id="flow-title" className="mono-label flex items-center gap-2 text-muted-foreground"><span className="size-1.5 rounded-full bg-orange" />The flow</h2>
        <Select value={example} onValueChange={onExample}>
          <SelectTrigger className="w-full" aria-label="Load an example flow"><SelectValue placeholder="Load an example flow" /></SelectTrigger>
          <SelectContent>
            {Object.keys(data.examples).map((name) => <SelectItem key={name} value={name}>{name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-3">
        <p className="text-sm text-muted-foreground">The {top.length} columns the model relies on most (the ones that hurt it most when scrambled, step 5). Each shows its name in the dataset and what it means. Change any of them and the verdict updates.</p>
        <div className="grid grid-cols-2 gap-3">
          {top.map((f) => <FeatureInput key={f} name={f} value={flow[f]} onChange={(v) => onChange(f, v)} />)}
        </div>
      </div>
      <div className="grid gap-3">
        <Button variant="outline" size="sm" className="mono-label justify-self-start rounded-[2px]" aria-expanded={all} onClick={() => setAll(!all)}>
          {all ? "Hide" : "Show"} the other {rest.length} features
        </Button>
        <div className={cn("grid grid-cols-2 gap-3 sm:grid-cols-3", !all && "hidden")}>
          {rest.map((f) => <FeatureInput key={f} name={f} value={flow[f]} onChange={(v) => onChange(f, v)} />)}
        </div>
      </div>
    </section>
  )
}
