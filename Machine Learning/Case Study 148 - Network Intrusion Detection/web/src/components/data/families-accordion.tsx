"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { data, FAMILY_COLOR, int } from "@/lib/data"
import { FAMILY_STORIES } from "@/lib/families"

/** Normal traffic and the 7 attack families, one open at a time. */
export function FamiliesAccordion() {
  return (
    <Accordion type="single" collapsible defaultValue="Benign" className="rounded-md border">
      {FAMILY_STORIES.map((f) => {
        const labels = data.counts.filter((c) => c.family === f.key).sort((a, b) => b.full - a.full)
        const rows = labels.reduce((s, c) => s + c.full, 0)
        return (
          <AccordionItem key={f.key} value={f.key} className="px-5">
            <AccordionTrigger className="py-4 hover:no-underline">
              <span className="flex flex-1 items-center gap-3">
                <span className="size-3 rounded-[2px]" style={{ background: FAMILY_COLOR[f.key] }} />
                <span className="font-semibold">{f.name}</span>
                <span className="mono-label ml-auto pr-3 text-[11px] text-muted-foreground">{int(rows)} rows</span>
              </span>
            </AccordionTrigger>
            <AccordionContent className="grid gap-4 pb-5 text-[15px] md:grid-cols-[1fr_1fr]">
              <dl className="grid content-start gap-3">
                <div><dt className="mono-label text-muted-foreground">What it is</dt><dd className="mt-1">{f.what}</dd></div>
                <div><dt className="mono-label text-muted-foreground">How the lab made it</dt><dd className="mt-1">{f.how}</dd></div>
                <div><dt className="mono-label text-muted-foreground">How it shows in the numbers</dt><dd className="mt-1">{f.looks}</dd></div>
              </dl>
              <div className="grid content-start gap-2">
                <span className="mono-label text-muted-foreground">
                  {labels.length === 1 ? "Its label in the data" : `The ${labels.length} labels in this family`}
                </span>
                <ul className="grid gap-1">
                  {labels.map((c) => (
                    <li key={c.label} className="flex justify-between gap-4 border-b border-dashed py-1 text-sm last:border-0">
                      <span className="font-mono">{c.label}</span>
                      <span className="font-mono tabular text-muted-foreground">{int(c.full)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>
        )
      })}
    </Accordion>
  )
}
