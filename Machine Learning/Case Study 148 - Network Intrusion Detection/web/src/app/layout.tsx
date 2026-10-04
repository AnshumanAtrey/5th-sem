import type { Metadata } from "next"
import { Aleo, Azeret_Mono, Host_Grotesk } from "next/font/google"
import { SiteHeader } from "@/components/site-header"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import "./globals.css"

// the walrussecuritas.com type system: Host Grotesk for text, Azeret Mono for labels and data, Aleo for headlines
const host = Host_Grotesk({ variable: "--font-host", subsets: ["latin"], weight: ["400", "500", "600", "700"] })
const azeret = Azeret_Mono({ variable: "--font-azeret", subsets: ["latin"], weight: ["400", "500"] })
const aleo = Aleo({ variable: "--font-aleo", subsets: ["latin"], weight: ["300", "400"] })

export const metadata: Metadata = {
  title: { default: "Flow Sentinel · Walrus Securitas", template: "%s · Flow Sentinel" },
  description: "A machine-learning network intrusion detector trained on CICIoT2023, by Walrus Securitas (Case Study 148).",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning className={`${host.variable} ${azeret.variable} ${aleo.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-background">
        <ThemeProvider>
          <TooltipProvider>
            <SiteHeader />
            <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-10 pb-20 sm:px-6">{children}</main>
            <footer className="border-t">
              <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-muted-foreground sm:px-6">
                <span className="mono-label">Flow Sentinel by <a href="https://walrussecuritas.com/" className="text-orange hover:underline">Walrus Securitas</a></span>
                <span className="mono-label">Case Study 148 · ML Fundamentals</span>
              </div>
            </footer>
          </TooltipProvider>
          <Toaster position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  )
}
