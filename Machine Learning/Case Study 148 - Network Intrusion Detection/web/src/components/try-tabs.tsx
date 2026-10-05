"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const TABS = [
  { href: "/try/", label: "Check one flow" },
  { href: "/try/scan/", label: "Scan a file" },
]

export function TryTabs() {
  const path = usePathname()
  return (
    <div role="tablist" aria-label="Try it" className="flex gap-1 border-b">
      {TABS.map((t) => {
        const on = t.href === "/try/" ? !path.includes("/scan") : path.includes("/scan")
        return (
          <Link key={t.href} href={t.href} role="tab" aria-selected={on}
            className={cn("mono-label -mb-px border-b-2 border-transparent px-3 py-2.5 text-muted-foreground hover:text-foreground", on && "border-ink text-foreground")}>
            {t.label}
          </Link>
        )
      })}
    </div>
  )
}
