"use client"

import { useMemo, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { useDetector } from "@/hooks/use-detector"
import { data } from "@/lib/data"
import { predict, type Flow } from "@/lib/ids"
import { FlowEditor } from "./flow-editor"
import { TrafficTape } from "./traffic-tape"
import { VerdictPanel } from "./verdict-panel"

const FIRST = Object.keys(data.examples).find((k) => !k.startsWith("Benign")) ?? Object.keys(data.examples)[0]

export function Detector() {
  const { model, tape, error } = useDetector()
  const [flow, setFlow] = useState<Flow>(data.examples[FIRST])
  const [example, setExample] = useState(FIRST)
  const [selected, setSelected] = useState<number | null>(null)
  const [truth, setTruth] = useState<string | undefined>(undefined)
  const [threshold, setThreshold] = useState(50)
  const verdict = useMemo(() => (model ? predict(model, flow) : null), [model, flow])

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>The model did not load</AlertTitle>
        <AlertDescription>{error}. Reload the page; if it keeps failing, run <code>bun run export-model</code>.</AlertDescription>
      </Alert>
    )
  }
  if (!model || !verdict) return <Skeleton className="h-[640px] w-full rounded-[2px]" />

  return (
    <div className="grid gap-6">
      <TrafficTape tape={tape} selected={selected} onSelect={(i) => {
        setSelected(i)
        setFlow(tape[i].flow)
        setTruth(tape[i].label)
        setExample("")
      }} />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,26rem)_1fr]">
        <FlowEditor features={model.features} flow={flow} example={example}
          onExample={(name) => {
            setExample(name)
            setFlow(data.examples[name])
            setSelected(null)
            setTruth(undefined)
          }}
          onChange={(name, value) => setFlow((f) => ({ ...f, [name]: value }))} />
        <VerdictPanel verdict={verdict} threshold={threshold} onThreshold={setThreshold} truth={truth} />
      </div>
    </div>
  )
}
