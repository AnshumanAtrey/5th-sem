"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { asset } from "@/lib/base"
import { cn } from "@/lib/utils"

const LINKS = [
  { href: "/", label: "Detector" },
  { href: "/scan/", label: "Scan a file" },
  { href: "/models/", label: "Models" },
  { href: "/method/", label: "Method" },
]

export function SiteHeader() {
  const path = usePathname()
  return (
    <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-6 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <Image src={asset("/walrus-mark.png")} alt="" width={30} height={30} className="rounded-md" unoptimized priority />
          <span className="mono-label text-[13px] tracking-[0.08em]">
            Walrus <span className="text-orange">Securitas</span>
          </span>
          <span className="mono-label hidden border-l pl-2.5 text-muted-foreground sm:inline">Flow Sentinel</span>
        </Link>
        <nav aria-label="Main" className="-mx-1 flex min-w-0 flex-1 justify-end gap-1 overflow-x-auto">
          {LINKS.map((l) => {
            const active = l.href === "/" ? path === "/" : path.startsWith(l.href.replace(/\/$/, ""))
            return (
              <Link key={l.href} href={l.href} aria-current={active ? "page" : undefined}
                className={cn("mono-label px-2.5 py-1.5 whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring focus-visible:outline-none",
                  active && "text-foreground shadow-[inset_0_-2px_0_var(--orange)]")}>
                {l.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
