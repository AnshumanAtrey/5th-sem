import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export function StatCard({ label, value, hint, children }: { label: string; value: React.ReactNode; hint?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <Card className="@container/card gap-3">
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">{value}</CardTitle>
      </CardHeader>
      {(hint || children) && (
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          {children}
          {hint && <div className="text-muted-foreground">{hint}</div>}
        </CardFooter>
      )}
    </Card>
  )
}
