import { Cable, Crosshair, Home, Sigma, Table2 } from "lucide-react"
import { data } from "@/lib/data"

const millions = (n: number) => `${(n / 1e6).toFixed(1)} million`

const STEPS = [
  { icon: Home, title: "A smart home in a lab",
    text: "105 real devices: cameras, smart speakers, plugs, bulbs, sensors, a TV, a robot vacuum." },
  { icon: Crosshair, title: "Attacked on purpose",
    text: "7 Raspberry Pi mini computers attack them with real tools (hping3, nmap, ettercap, the real Mirai code). The rest of the time, nothing attacks: that's the normal traffic." },
  { icon: Cable, title: "Every packet recorded",
    text: "A network tap copies everything on the wire, and Wireshark saves it as .pcap recordings." },
  { icon: Sigma, title: "Boiled down to numbers",
    text: "Every 10 or 100 packets in a row are summarised into 46 numbers: speed, packet sizes, TCP flags, protocol." },
  { icon: Table2, title: "One big table",
    text: `Each summary becomes one row of a CSV file (a plain-text spreadsheet), tagged with what was really happening. ${millions(data.results.flows_full)} rows in 169 files.` },
]

/** How the researchers turned a smart home under attack into a table of numbers. */
export function LabPipeline() {
  return (
    <ol className="grid gap-px overflow-hidden rounded-md border bg-border md:grid-cols-5">
      {STEPS.map(({ icon: Icon, title, text }, i) => (
        <li key={title} className="grid content-start gap-3 bg-background p-5">
          <div className="flex items-center justify-between">
            <span className="mono-label grid size-6 place-items-center rounded-[2px] border text-[11px]">{i + 1}</span>
            <Icon className="size-5 text-orange" aria-hidden />
          </div>
          <h3 className="font-semibold leading-snug">{title}</h3>
          <p className="text-sm text-muted-foreground">{text}</p>
        </li>
      ))}
    </ol>
  )
}
