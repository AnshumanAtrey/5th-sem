"use client"

import Papa from "papaparse"
import { useEffect, useState } from "react"
import { asset } from "@/lib/base"
import { loadModel, predict, type Flow, type Model } from "@/lib/ids"

export type TapeFlow = { flow: Flow; label: string; intrusion: number }

/** The model plus the 300 demo flows from the locked test set, each already scored. */
export function useDetector() {
  const [model, setModel] = useState<Model | null>(null)
  const [tape, setTape] = useState<TapeFlow[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let live = true
    Promise.all([loadModel(), fetch(asset("/demo_flows.csv")).then((r) => r.text())])
      .then(([m, csv]) => {
        if (!live) return
        const rows = Papa.parse<Flow>(csv, { header: true, dynamicTyping: true, skipEmptyLines: true }).data
        setModel(m)
        setTape(rows.map((flow) => ({ flow, label: String(flow.true_label), intrusion: predict(m, flow).intrusion })))
      })
      .catch((e: Error) => live && setError(e.message))
    return () => {
      live = false
    }
  }, [])

  return { model, tape, error }
}
