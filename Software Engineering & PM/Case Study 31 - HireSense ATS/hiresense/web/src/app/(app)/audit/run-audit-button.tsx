"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { PlayIcon } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { send } from "@/lib/api"

export function RunAuditButton({ jobId }: { jobId: number | null }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  return (
    <Button
      size="sm"
      disabled={pending}
      onClick={() =>
        start(async () => {
          try {
            const r = await send<{ severity: string; action: string }>("/audits/run", { method: "POST", json: { jobId } })
            toast[r.severity === "pass" ? "success" : "warning"](`Audit: ${r.severity}`, { description: r.action })
            router.refresh()
          } catch (e) {
            toast.error((e as Error).message)
          }
        })
      }
    >
      <PlayIcon /> {pending ? "Running…" : "Run audit now"}
    </Button>
  )
}
