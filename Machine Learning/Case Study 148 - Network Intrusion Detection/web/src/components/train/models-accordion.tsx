"use client"

import Link from "next/link"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { data, int, pct } from "@/lib/data"
import { MODEL_STORIES, MODULES } from "@/lib/models"
import { ModelSketch } from "./model-sketch"

const groups = Object.keys(MODULES).map((m) => ({ module: m, models: MODEL_STORIES.filter((s) => s.module === m) }))

/** The 11 models, grouped by syllabus module; one panel open at a time. */
export function ModelsAccordion() {
  return (
    <Accordion type="single" collapsible defaultValue="Random Forest" className="grid gap-6">
      {groups.map((g) => (
        <div key={g.module} className="grid gap-2">
          <p className="mono-label text-muted-foreground">{MODULES[g.module]}</p>
          <div className="rounded-md border">
            {g.models.map((m) => {
              const r = data.results.comparison.find((c) => c.model === m.name)!
              return (
                <AccordionItem key={m.name} value={m.name} className="px-5">
                  <AccordionTrigger className="py-4 hover:no-underline">
                    <span className="grid flex-1 gap-0.5 pr-3 text-left md:grid-cols-[13rem_1fr] md:items-baseline md:gap-4">
                      <span className="font-semibold">{m.name}</span>
                      <span className="text-sm font-normal text-muted-foreground">{m.oneLine}</span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="grid gap-6 pb-6 lg:grid-cols-[280px_1fr]">
                    <div className="grid content-start gap-4">
                      <div className="rounded-md border bg-panel p-3"><ModelSketch kind={m.sketch} /></div>
                      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-md border bg-border text-sm">
                        {[
                          ["Learned from", `${int(r["trained on"])} rows`],
                          ["Time to learn", `${r["train s"].toFixed(1)} s`],
                          ["Saved size", r["size MB"] < 0.1 ? "< 0.1 MB" : `${r["size MB"].toFixed(1)} MB`],
                          ["Attacks caught", pct(r.recall, 2)],
                        ].map(([k, v]) => (
                          <div key={k} className="bg-background p-3"><dt className="mono-label text-[10px] text-muted-foreground">{k}</dt><dd className="mt-1 font-mono tabular">{v}</dd></div>
                        ))}
                      </dl>
                      <Link href="/results/" className="mono-label text-[11px] text-orange-deep hover:underline">How it did on the exam: step 5</Link>
                    </div>
                    <div className="grid content-start gap-5 text-[15px]">
                      <div><p className="mono-label text-muted-foreground">The problem it solves</p><p className="mt-1">{m.problem}</p></div>
                      <div>
                        <p className="mono-label text-muted-foreground">How it decides</p>
                        <ol className="mt-1 grid list-decimal gap-1 pl-5">{m.how.map((h) => <li key={h}>{h}</li>)}</ol>
                      </div>
                      {m.faq && (
                        <div className="grid gap-3 rounded-md border border-orange/40 bg-orange-soft p-4">
                          {m.faq.map((f) => (
                            <div key={f.q} className="grid gap-1">
                              <p className="font-semibold">{f.q}</p>
                              <p className="text-[15px]">{f.a}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="grid gap-2">
                        <p className="mono-label text-muted-foreground">Where the code comes from</p>
                        <p>A ready-made class (a blueprint of code someone already wrote) from <b>scikit-learn</b>, the free machine learning library: we import it (load it into our program), choose the settings, and call <span className="font-mono">.fit()</span> (the &quot;now learn&quot; command). The learning itself is done by the library.</p>
                        <pre className="overflow-x-auto rounded-[2px] bg-ink p-3 font-mono text-[12.5px] leading-relaxed text-white">{m.code}</pre>
                        <table className="w-full text-sm">
                          <tbody>
                            {m.settings.map((s) => (
                              <tr key={s.name} className="border-b border-dashed last:border-0">
                                <th scope="row" className="py-1.5 pr-3 text-left align-top font-mono text-xs font-normal whitespace-nowrap">{s.value ? `${s.name} = ${s.value}` : s.name}</th>
                                <td className="py-1.5 text-muted-foreground">{s.means}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <p><b>What training works out by itself</b> (its parameters): {m.learns}</p>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <p className="rounded-[2px] border-l-2 px-3 py-2 text-sm" style={{ borderColor: "var(--normal)" }}><b>Good at:</b> {m.good}</p>
                        <p className="rounded-[2px] border-l-2 border-orange px-3 py-2 text-sm"><b>Weak at:</b> {m.bad}</p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </div>
        </div>
      ))}
    </Accordion>
  )
}
