import type { Metadata } from "next"
import { PageTitle } from "@/components/page-title"
import { TryTabs } from "@/components/try-tabs"
import { Scanner } from "@/components/scan/scanner"

export const metadata: Metadata = { title: "6 · Try it: scan a file" }

export default function Page() {
  return (
    <div className="grid gap-8">
      <TryTabs />
      <PageTitle light="Scan a whole file" bold="of network flows">
        A CSV with the 45 CICIoT2023 feature columns, one flow per row, up to 20,000 rows. Extra columns are ignored,
        including IAT, which the model deliberately never uses. The file is read in your browser and never uploaded.
      </PageTitle>
      <Scanner />
    </div>
  )
}
