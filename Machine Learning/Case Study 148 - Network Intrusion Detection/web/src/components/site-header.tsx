"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { asset } from "@/lib/base"
import { cn } from "@/lib/utils"

// the tabs follow how a machine learning model is made, start to finish
export const STEPS = [
  { href: "/", label: "Data" },
  { href: "/explore/", label: "Explore" },
  { href: "/prepare/", label: "Prepare" },
  { href: "/train/", label: "Train" },
  { href: "/results/", label: "Results" },
  { href: "/try/", label: "Try it" },
]

export function stepIndex(path: string) {
  const i = STEPS.findIndex((s) => s.href !== "/" && path.startsWith(s.href.replace(/\/$/, "")))
  return i === -1 ? 0 : i
}

export function SiteHeader() {
  const active = stepIndex(usePathname())
  return (
    <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-3 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <Image src={asset("/walrus-mark.png")} alt="" width={28} height={28} className="rounded-md" unoptimized priority />
          <span className="mono-label text-[13px] tracking-[0.08em]">
            Walrus <span className="text-orange">Securitas</span>
          </span>
          <span className="mono-label hidden border-l pl-2.5 text-muted-foreground sm:inline">Flow Sentinel</span>
        </Link>
      </div>
      <nav aria-label="Steps" className="mx-auto w-full max-w-6xl overflow-x-auto px-4 sm:px-6">
        <ol className="flex min-w-max">
          {STEPS.map((s, i) => (
            <li key={s.href}>
              <Link href={s.href} aria-current={i === active ? "step" : undefined}
                className={cn("mono-label flex items-center gap-2 border-b-2 border-transparent px-3 py-3 whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring focus-visible:outline-none",
                  i === active && "border-orange text-foreground")}>
                <span className={cn("grid size-5 place-items-center rounded-[2px] border text-[10px]", i === active && "border-orange bg-orange text-white")}>{i + 1}</span>
                {s.label}
              </Link>
            </li>
          ))}
        </ol>
      </nav>
    </header>
  )
}
