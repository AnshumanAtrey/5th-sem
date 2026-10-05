"use client"

import { BookOpen, Lightbulb, Wrench } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

/** The one thing to take away from a section. */
export function Learned({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 rounded-[2px] border-l-2 border-orange bg-orange-soft px-4 py-3">
      <Lightbulb className="mt-0.5 size-4 shrink-0 text-orange-deep" aria-hidden />
      <p className="text-[15px]"><b className="mono-label mr-2 text-orange-deep">What we learned</b>{children}</p>
    </div>
  )
}

/** Where the code comes from: which ready-made library does the work, and the lines we actually ran. */
export function HowWeDidIt({ tool, children, code }: { tool: string; children: React.ReactNode; code: string }) {
  return (
    <Accordion type="single" collapsible className="rounded-md border">
      <AccordionItem value="how" className="px-4">
        <AccordionTrigger className="py-3 hover:no-underline">
          <span className="flex items-center gap-2">
            <Wrench className="size-4 text-muted-foreground" aria-hidden />
            <span className="mono-label">How we did it</span>
            <span className="text-sm text-muted-foreground">· {tool}</span>
          </span>
        </AccordionTrigger>
        <AccordionContent className="grid gap-3 pb-4 md:grid-cols-[1fr_1.2fr]">
          <div className="text-[15px] text-muted-foreground [&_b]:text-foreground">{children}</div>
          <pre className="overflow-x-auto rounded-[2px] bg-ink p-4 font-mono text-[12.5px] leading-relaxed text-white">{code}</pre>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

/** Exam keywords: the term, a one-line definition, and what it means in this project. */
export function KeyTerms({ terms }: { terms: { term: string; means: string; ours: React.ReactNode }[] }) {
  return (
    <div className="rounded-md border">
      <p className="mono-label flex items-center gap-2 border-b bg-panel px-4 py-2.5 text-muted-foreground">
        <BookOpen className="size-4" aria-hidden /> Key words
      </p>
      <dl className="divide-y">
        {terms.map((t) => (
          <div key={t.term} className="grid gap-1 px-4 py-3 md:grid-cols-[13rem_1fr]">
            <dt className="font-semibold">{t.term}</dt>
            <dd className="grid gap-1 text-[15px]">
              <span>{t.means}</span>
              <span className="text-muted-foreground"><b className="mono-label mr-1.5 text-orange-deep">In our project</b>{t.ours}</span>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

/** A plain-words dictionary for a page: each recurring term, explained once, before it is used. */
export function WordList({ title = "Words used on this page", words }: { title?: string; words: { term: string; means: string }[] }) {
  return (
    <div className="rounded-md border">
      <p className="mono-label flex items-center gap-2 border-b bg-panel px-4 py-2.5 text-muted-foreground">
        <BookOpen className="size-4" aria-hidden /> {title}
      </p>
      <dl className="grid gap-x-8 gap-y-3 p-4 md:grid-cols-2">
        {words.map((w) => (
          <div key={w.term} className="grid gap-0.5">
            <dt className="font-semibold">{w.term}</dt>
            <dd className="text-sm text-muted-foreground">{w.means}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
