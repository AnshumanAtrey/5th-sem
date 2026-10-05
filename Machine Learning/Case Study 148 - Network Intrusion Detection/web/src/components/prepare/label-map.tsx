"use client"

import { ArrowRight } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { data, FAMILY_COLOR } from "@/lib/data"
import { cn } from "@/lib/utils"

const EXAMPLES = ["BenignTraffic", "DDoS-ICMP_Flood", "DoS-SYN_Flood", "Recon-PortScan", "XSS"]

function Row({ label }: { label: string }) {
  const fam = data.counts.find((c) => c.label === label)!.family
  const bit = label === "BenignTraffic" ? 0 : 1
  return (
    <tr className="border-b border-dashed last:border-0">
      <td className="py-2 pr-3 font-mono text-xs">&quot;{label}&quot;</td>
      <td className="px-2 text-muted-foreground"><ArrowRight className="size-3.5" aria-hidden /></td>
      <td className="py-2 pr-3"><span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-[1px]" style={{ background: FAMILY_COLOR[fam] }} />{fam}</span></td>
      <td className="px-2 text-muted-foreground"><ArrowRight className="size-3.5" aria-hidden /></td>
      <td className={cn("py-2 font-mono font-semibold", bit ? "text-orange-deep" : "")} style={bit ? undefined : { color: "var(--normal)" }}>{bit}</td>
    </tr>
  )
}

/** Text labels become two answer columns: the family, and 0 (normal) / 1 (attack). */
export function LabelMap() {
  const [all, setAll] = useState(false)
  const labels = all ? data.counts.map((c) => c.label) : EXAMPLES
  return (
    <div className="grid gap-3">
      <div className="overflow-x-auto rounded-md border px-4">
        <table className="w-full min-w-[480px] text-sm">
          <thead>
            <tr className="text-left">
              <th scope="col" className="mono-label py-3 font-medium text-muted-foreground">The label (text)</th>
              <th />
              <th scope="col" className="mono-label py-3 font-medium text-muted-foreground">family</th>
              <th />
              <th scope="col" className="mono-label py-3 font-medium text-muted-foreground">intrusion</th>
            </tr>
          </thead>
          <tbody>{labels.map((l) => <Row key={l} label={l} />)}</tbody>
        </table>
      </div>
      <Button variant="outline" size="sm" className="mono-label justify-self-start rounded-[2px]" aria-expanded={all} onClick={() => setAll(!all)}>
        {all ? "Show 5 examples" : `Show all ${data.counts.length} labels`}
      </Button>
    </div>
  )
}
