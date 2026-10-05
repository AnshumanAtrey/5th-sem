"use client"

import { Download, ExternalLink, FileCode2, FileSpreadsheet, FileText, Folder } from "lucide-react"
import { useState } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import raw from "@/data/raw.json"
import { asset } from "@/lib/base"
import { int } from "@/lib/data"

const size = (b: number) => (b >= 1e9 ? `${(b / 1e9).toFixed(1)} GB` : b >= 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1e3))} KB`)

const parts = raw.files.filter((f) => f.name.startsWith("csv/CICIoT2023/"))
const others = raw.files.filter((f) => !f.name.startsWith("csv/CICIoT2023/"))
const partsSize = parts.reduce((s, f) => s + f.size, 0)

// what each non-CSV file is, in plain words
const NOTE: Record<string, string> = {
  "README - README.pdf": "the researchers' guide to the dataset",
  "csv/README_csv - README.pdf": "the researchers' notes on the CSV files",
  "example/example.ipynb": "their example notebook that trains a model",
  "supplementary/README.pdf": "notes on the code and tools below",
  "supplementary/pcap2csv/Feature_extraction.py": "their code that turns packets into the 46 numbers",
  "supplementary/pcap2csv/Generating_dataset.py": "their code that builds the dataset",
}

function icon(name: string) {
  if (name.endsWith(".py") || name.endsWith(".ipynb")) return <FileCode2 className="size-4 text-muted-foreground" aria-hidden />
  if (name.endsWith(".csv")) return <FileSpreadsheet className="size-4 text-muted-foreground" aria-hidden />
  return <FileText className="size-4 text-muted-foreground" aria-hidden />
}

/** The dataset as published: links, the first rows of the first file, and everything in the download. */
export function RawPreview() {
  const [n, setN] = useState("10")
  const rows = raw.head.slice(0, Number(n))
  const last = raw.columns.length - 1
  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap gap-2">
        {[
          ["The original dataset (University of New Brunswick)", raw.original],
          ["The Kaggle copy we used", raw.kaggle],
          ["The researchers' paper", raw.paper],
        ].map(([label, href]) => (
          <a key={href} href={href} target="_blank" rel="noreferrer"
            className="mono-label inline-flex h-9 items-center gap-2 rounded-[2px] border px-3 hover:border-ink">
            {label} <ExternalLink className="size-3.5" aria-hidden />
          </a>
        ))}
      </div>

      <Accordion type="single" collapsible className="rounded-md border">
        <AccordionItem value="rows" className="px-5">
          <AccordionTrigger className="py-4 hover:no-underline">
            <span className="flex flex-1 flex-wrap items-center gap-x-3 gap-y-1">
              <FileSpreadsheet className="size-4 text-orange" aria-hidden />
              <span className="font-semibold">See the first rows of the raw file</span>
              <span className="mono-label ml-auto pr-3 text-[11px] text-muted-foreground">
                {int(raw.rows)} rows × {raw.columns.length} columns
              </span>
            </span>
          </AccordionTrigger>
          <AccordionContent className="grid gap-3 pb-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                <span className="font-mono text-foreground">{raw.file}</span>, the first of the 169 files, exactly as
                published: nothing cleaned or changed. Scroll sideways for all {raw.columns.length} columns; the last one,
                <b className="text-foreground"> label</b>, is the answer.
              </p>
              <div className="flex items-center gap-2">
                <ToggleGroup type="single" variant="outline" size="sm" value={n} onValueChange={(v) => v && setN(v)} aria-label="Rows to show">
                  <ToggleGroupItem value="10" className="mono-label rounded-[2px]">10 rows</ToggleGroupItem>
                  <ToggleGroupItem value="20" className="mono-label rounded-[2px]">20 rows</ToggleGroupItem>
                </ToggleGroup>
                <a href={asset("/raw_first_20_rows.csv")} download
                  className="mono-label inline-flex h-8 items-center gap-1.5 rounded-[2px] border px-2.5 hover:border-ink">
                  <Download className="size-3.5" aria-hidden /> CSV
                </a>
              </div>
            </div>
            <div className="max-h-[480px] overflow-auto rounded-[2px] border">
              <table className="w-max border-separate border-spacing-0 font-mono text-xs">
                <thead className="sticky top-0 z-10">
                  <tr>
                    <th scope="col" className="sticky left-0 z-20 border-r border-b bg-panel px-3 py-2 text-left font-medium text-muted-foreground">#</th>
                    {raw.columns.map((c, i) => (
                      <th key={c} scope="col" className={`border-b bg-panel px-3 py-2 text-left font-medium whitespace-nowrap ${i === last ? "bg-orange-soft text-orange-deep" : ""}`}>{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, ri) => (
                    <tr key={ri}>
                      <th scope="row" className="sticky left-0 border-r border-b bg-background px-3 py-1.5 text-left font-normal text-muted-foreground">{ri + 1}</th>
                      {r.map((v, i) => (
                        <td key={i} className={`border-b px-3 py-1.5 whitespace-nowrap tabular ${i === last ? "bg-orange-soft font-medium text-orange-deep" : "text-right"}`}>{v}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="files" className="px-5">
          <AccordionTrigger className="py-4 hover:no-underline">
            <span className="flex flex-1 flex-wrap items-center gap-x-3 gap-y-1">
              <Folder className="size-4 text-orange" aria-hidden />
              <span className="font-semibold">See everything in the download</span>
              <span className="mono-label ml-auto pr-3 text-[11px] text-muted-foreground">{raw.files.length} files</span>
            </span>
          </AccordionTrigger>
          <AccordionContent className="grid gap-4 pb-5 md:grid-cols-[1fr_1fr]">
            <div className="grid content-start gap-2">
              <p className="text-sm">
                <b>{parts.length} CSV files</b> with the rows, {size(partsSize)} in total ({size(Math.min(...parts.map((p) => p.size)))}{" "}
                to {size(Math.max(...parts.map((p) => p.size)))} each). They all have the same {raw.columns.length} columns; the data
                was simply cut into pieces.
              </p>
              <ul className="max-h-60 overflow-auto rounded-[2px] border font-mono text-xs">
                {parts.map((f) => (
                  <li key={f.name} className="flex justify-between gap-4 border-b px-3 py-1.5 last:border-0">
                    <span className="truncate">{f.name.split("/").pop()}</span>
                    <span className="shrink-0 text-muted-foreground tabular">{size(f.size)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid content-start gap-2">
              <p className="text-sm">
                <b>{others.length} more files</b>: the researchers&apos; guides, an example notebook, and their own code that
                turned the packet recordings into these numbers.
              </p>
              <ul className="grid gap-1.5 text-sm">
                {others.map((f) => (
                  <li key={f.name} className="flex items-start gap-2">
                    {icon(f.name)}
                    <span className="min-w-0">
                      <span className="font-mono text-xs break-all">{f.name}</span>
                      {NOTE[f.name] && <span className="text-muted-foreground"> · {NOTE[f.name]}</span>}
                    </span>
                    <span className="ml-auto shrink-0 font-mono text-xs text-muted-foreground tabular">{size(f.size)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
