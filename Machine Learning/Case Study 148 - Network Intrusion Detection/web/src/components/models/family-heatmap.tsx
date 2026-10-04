import { FAMILIES, pct } from "@/lib/data"

/** Models × families, a single-hue ramp: darker = handled better (benign: let through, attacks: caught). */
export function FamilyHeatmap({ models, byFamily }: { models: string[]; byFamily: Record<string, Record<string, number>> }) {
  return (
    <div className="overflow-x-auto rounded-[2px] border">
      <table className="w-full min-w-[720px] table-fixed border-separate border-spacing-0.5 p-2 text-sm">
        <caption className="sr-only">Share of each family&apos;s test flows each model handled correctly</caption>
        <thead>
          <tr>
            <th scope="col" className="w-48 px-2 py-1.5 text-left font-medium text-muted-foreground">Model</th>
            {FAMILIES.map((f) => <th key={f} scope="col" className="px-1 py-1.5 font-medium text-muted-foreground">{f}</th>)}
          </tr>
        </thead>
        <tbody>
          {models.map((m) => (
            <tr key={m}>
              <th scope="row" className="px-2 py-1 text-left font-normal whitespace-nowrap">{m}</th>
              {FAMILIES.map((f) => {
                const v = byFamily[m]?.[f] ?? 0
                return (
                  <td key={f} title={`${m} on ${f}: ${pct(v)}`} className="rounded-[3px] px-1 py-1.5 text-center font-mono text-xs tabular"
                    style={{ background: `color-mix(in oklab, var(--orange) ${Math.round(6 + v * 82)}%, white)`, color: v > 0.55 ? "white" : "var(--ink)" }}>
                    {(v * 100).toFixed(0)}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
