import { ImpactRatioBars } from "@/components/charts"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { FairnessResult } from "@/lib/api"
import { DIMENSION_LABEL, pct, ratio } from "@/lib/format"
import { cn } from "@/lib/utils"

export function FairnessPanel({ current, legacy }: { current: FairnessResult[]; legacy?: FairnessResult[] }) {
  return (
    <div className="grid gap-4 @5xl/main:grid-cols-3">
      {current.map((r) => {
        const l = legacy?.find((x) => x.dimension === r.dimension)
        return (
          <Card key={r.dimension}>
            <CardHeader>
              <CardTitle>{DIMENSION_LABEL[r.dimension]}</CardTitle>
              <CardDescription>
                {r.decided.toLocaleString("en-IN")} decided · lowest ratio {ratio(r.minImpactRatio)}
                {l && <> · legacy {ratio(l.minImpactRatio)}</>}
              </CardDescription>
              <CardAction>
                <span className={cn("rounded-full border px-2 py-0.5 text-xs font-medium", r.breached ? "border-outcome-reject/40 text-outcome-reject" : "text-muted-foreground")}>
                  {r.breached ? "Breach" : "Within rule"}
                </span>
              </CardAction>
            </CardHeader>
            <CardContent className="space-y-4">
              <ImpactRatioBars current={r} legacy={l} />
              <table className="w-full text-xs">
                <thead className="text-muted-foreground">
                  <tr className="border-b">
                    <th className="py-1.5 text-left font-medium">Group</th>
                    <th className="py-1.5 text-right font-medium">n</th>
                    <th className="py-1.5 text-right font-medium">Selected</th>
                    <th className="py-1.5 text-right font-medium">Ratio</th>
                    {l && <th className="py-1.5 text-right font-medium">Legacy</th>}
                  </tr>
                </thead>
                <tbody>
                  {r.groups.map((g) => {
                    const lg = l?.groups.find((x) => x.group === g.group)
                    return (
                      <tr key={g.group} className="border-b last:border-0">
                        <td className="py-1.5">
                          {g.group}
                          {g.lowSample && <span className="ml-1 text-muted-foreground" title="Fewer than 30 decided applicants — reported, not enforced">(low n)</span>}
                        </td>
                        <td className="py-1.5 text-right tabular-nums">{g.applicants}</td>
                        <td className="py-1.5 text-right tabular-nums">{pct(g.rate)}</td>
                        <td className={cn("py-1.5 text-right tabular-nums", g.breach && "font-semibold text-outcome-reject")} title={g.z != null ? `z = ${g.z.toFixed(2)}${g.significant ? " (significant)" : ""}` : undefined}>
                          {ratio(g.impactRatio)}
                          {g.breach && g.significant && "*"}
                        </td>
                        {l && <td className={cn("py-1.5 text-right tabular-nums text-muted-foreground", lg?.breach && "text-outcome-reject")}>{ratio(lg?.impactRatio)}</td>}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
