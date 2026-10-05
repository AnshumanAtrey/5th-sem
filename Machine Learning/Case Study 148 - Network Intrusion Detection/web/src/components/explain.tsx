"use client"

import { Lightbulb, Wrench } from "lucide-react"
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
