import Link from "next/link"
import { InboxIcon } from "lucide-react"
import { Confidence } from "@/components/confidence"
import { OutcomeBadge } from "@/components/outcome-badge"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { api, type Outcome } from "@/lib/api"
import { date, num, REASON_LABEL } from "@/lib/format"
import { cn } from "@/lib/utils"

export const metadata = { title: "Review queue" }

interface Queue {
  total: number
  byReason: Record<string, number>
  rows: { id: number; appliedAt: string; jobId: number; job: string; name: string; reasonCode: string; reason: string; tentative: Outcome | null; confidence: number; issues: string[]; textChars: number }[]
}

export default async function ReviewPage({ searchParams }: PageProps<"/review">) {
  const sp = await searchParams
  const reason = typeof sp.reason === "string" ? sp.reason : "all"
  const q = await api<Queue>("/review")
  const rows = reason === "all" ? q.rows : q.rows.filter((r) => r.reasonCode === reason)

  return (
    <>
      <PageHeader
        title="Review queue"
        description="Applications the system will not decide on its own: parse confidence below 0.6, or automated rejection paused after a fairness breach. Oldest first."
      />
      <div className="flex flex-wrap gap-1">
        {[["all", q.total] as const, ...Object.entries(q.byReason)].map(([k, n]) => (
          <Link key={k} href={`/review?reason=${k}`} className={cn("rounded-md px-2.5 py-1 text-sm", reason === k ? "bg-muted font-medium" : "text-muted-foreground hover:text-foreground")}>
            {k === "all" ? "All" : REASON_LABEL[k] ?? k} <span className="tabular-nums text-muted-foreground">{num(n)}</span>
          </Link>
        ))}
      </div>
      <Card>
        <CardContent className="px-0">
          {rows.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon"><InboxIcon /></EmptyMedia>
                <EmptyTitle>Queue is clear</EmptyTitle>
                <EmptyDescription>Every application has a decision.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Candidate</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Why it’s here</TableHead>
                  <TableHead>Parse</TableHead>
                  <TableHead>Withheld outcome</TableHead>
                  <TableHead className="pr-4">Waiting since</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="pl-4">
                      <Link href={`/applications/${r.id}`} className="font-medium hover:underline">{r.name}</Link>
                      <div className="text-xs text-muted-foreground">#{r.id}</div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{r.job}</TableCell>
                    <TableCell className="max-w-96">
                      <div className="text-sm">{REASON_LABEL[r.reasonCode] ?? r.reasonCode}</div>
                      <div className="truncate text-xs text-muted-foreground" title={r.issues.join(" · ")}>{r.textChars < 200 ? "No text layer (scanned / outlined PDF)" : r.issues[0] ?? r.reason}</div>
                    </TableCell>
                    <TableCell><Confidence value={r.confidence} /></TableCell>
                    <TableCell>{r.tentative ? <OutcomeBadge outcome={r.tentative} /> : "—"}</TableCell>
                    <TableCell className="pr-4 text-muted-foreground">{date(r.appliedAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  )
}
