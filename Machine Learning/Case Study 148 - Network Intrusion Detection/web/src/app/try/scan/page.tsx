import type { Metadata } from "next"
import { WordList } from "@/components/explain"
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
      <WordList title="How to read this page" words={[
        { term: "CSV file", means: "A plain-text table: one flow per line, values separated by commas. Excel can save one." },
        { term: "Columns it needs", means: "The 45 CICIoT2023 number columns, named exactly as in the dataset (step 1 lists them). Extra columns are fine." },
        { term: "Demo file", means: "300 real exam rows with a true_label column, so the page can also count how often the model agrees with the truth." },
        { term: "Bad cell", means: "A blank, text, negative or infinite value. It gets the training median (the typical value) instead, as in step 3." },
        { term: "Verdict", means: "Intrusion if the row's chance of attack reaches the alarm threshold, otherwise normal." },
        { term: "Where it runs", means: "Every row goes through the same 4 preparation steps and 300 trees, inside your browser. The file is never uploaded." },
      ]} />
      <Scanner />
    </div>
  )
}
