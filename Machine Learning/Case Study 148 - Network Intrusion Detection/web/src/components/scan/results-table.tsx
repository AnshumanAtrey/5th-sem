"use client"

import { ArrowDown, ArrowUp } from "lucide-react"
import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { family, FAMILY_COLOR, int, pct } from "@/lib/data"

export type Row = { i: number; intrusion: number; attackFamily: string; badCells: number; truth?: string }

const PAGE = 25
type Key = "i" | "intrusion"
type Show = "all" | "intrusion" | "normal" | "wrong"

export function ResultsTable({ rows, threshold }: { rows: Row[]; threshold: number }) {
  const [sort, setSort] = useState<{ key: Key; desc: boolean }>({ key: "intrusion", desc: true })
  const [show, setShow] = useState<Show>("all")
  const [page, setPage] = useState(0)
  const flagged = (r: Row) => r.intrusion * 100 >= threshold
  const labelled = rows.some((r) => r.truth)

  const view = useMemo(() => {
    const flagged = (r: Row) => r.intrusion * 100 >= threshold
    const keep = rows.filter((r) =>
      show === "all" ? true : show === "intrusion" ? flagged(r) : show === "normal" ? !flagged(r) : r.truth != null && (r.truth !== "BenignTraffic") !== flagged(r))
    return keep.sort((a, b) => (sort.desc ? b[sort.key] - a[sort.key] : a[sort.key] - b[sort.key]))
  }, [rows, sort, show, threshold])
  const pages = Math.max(1, Math.ceil(view.length / PAGE))
  const at = Math.min(page, pages - 1)

  const header = (key: Key, label: string) => (
    <button className="inline-flex items-center gap-1 font-medium"
      onClick={() => setSort((s) => ({ key, desc: s.key === key ? !s.desc : true }))}>
      {label}
      {sort.key === key && (sort.desc ? <ArrowDown className="size-3.5" aria-hidden /> : <ArrowUp className="size-3.5" aria-hidden />)}
    </button>
  )

  const ariaSort = (key: Key) => (sort.key === key ? (sort.desc ? "descending" : "ascending") : "none")

  return (
    <div className="grid gap-3">
      <ToggleGroup type="single" variant="outline" size="sm" value={show} onValueChange={(v) => v && (setShow(v as Show), setPage(0))} aria-label="Show">
        <ToggleGroupItem value="all">All</ToggleGroupItem>
        <ToggleGroupItem value="intrusion">Intrusions</ToggleGroupItem>
        <ToggleGroupItem value="normal">Normal</ToggleGroupItem>
        {labelled && <ToggleGroupItem value="wrong">Wrong vs true label</ToggleGroupItem>}
      </ToggleGroup>
      <div className="rounded-[2px] border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20" aria-sort={ariaSort("i")}>{header("i", "Row")}</TableHead>
              <TableHead aria-sort={ariaSort("intrusion")}>{header("intrusion", "Intrusion score")}</TableHead>
              <TableHead>Verdict</TableHead>
              <TableHead>Attack family</TableHead>
              {labelled && <TableHead>True label</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {view.slice(at * PAGE, at * PAGE + PAGE).map((r) => (
              <TableRow key={r.i}>
                <TableCell className="font-mono text-xs tabular text-muted-foreground">{r.i}</TableCell>
                <TableCell>
                  <span className="flex items-center gap-3">
                    <span className="h-1.5 w-24 rounded-[1px] bg-muted"><span className="block h-full rounded-[1px]" style={{ width: `${r.intrusion * 100}%`, background: flagged(r) ? "var(--orange)" : "var(--normal)" }} /></span>
                    <span className="font-mono text-xs tabular">{pct(r.intrusion)}</span>
                  </span>
                </TableCell>
                <TableCell className={flagged(r) ? "font-medium text-orange-deep" : "text-normal"}>{flagged(r) ? "Intrusion" : "Normal"}</TableCell>
                <TableCell>
                  {flagged(r) && <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-sm" style={{ background: FAMILY_COLOR[r.attackFamily] }} />{r.attackFamily}</span>}
                </TableCell>
                {labelled && <TableCell className="text-muted-foreground">{r.truth} <span className="text-xs">({family(r.truth ?? "")})</span></TableCell>}
              </TableRow>
            ))}
            {view.length === 0 && (
              <TableRow><TableCell colSpan={5} className="py-8 text-center text-muted-foreground">No flows match this filter.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{int(view.length)} flows</span>
        <span className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={at === 0} onClick={() => setPage(at - 1)}>Previous</Button>
          <span className="tabular">Page {at + 1} of {pages}</span>
          <Button variant="outline" size="sm" disabled={at >= pages - 1} onClick={() => setPage(at + 1)}>Next</Button>
        </span>
      </div>
    </div>
  )
}
