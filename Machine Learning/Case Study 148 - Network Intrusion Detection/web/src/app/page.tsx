import type { Metadata } from "next"
import Link from "next/link"
import { FamiliesAccordion } from "@/components/data/families-accordion"
import { ImbalanceChart } from "@/components/data/imbalance-chart"
import { LabPipeline } from "@/components/data/lab-pipeline"
import { RawPreview } from "@/components/data/raw-preview"
import { RowCompare } from "@/components/data/row-compare"
import { PageTitle } from "@/components/page-title"
import { Section } from "@/components/section"
import { data, pct } from "@/lib/data"
import { familyRows } from "@/lib/families"

export const metadata: Metadata = { title: "1 · Data" }

export default function Page() {
  const total = data.results.flows_full
  const share = (key: string) => familyRows.find((f) => f.key === key)!.rows / total
  const stats = [
    ["105", "real smart devices"],
    ["7", "attacker computers"],
    ["33", "kinds of attack"],
    [`${(total / 1e6).toFixed(1)} M`, "rows of examples"],
  ]
  return (
    <div className="grid gap-16">
      <PageTitle light="Every model starts" bold="with examples">
        A computer can&apos;t recognise an attack it has never seen. So before anything else, we need lots of real
        network traffic, each piece tagged with the right answer: normal, or which attack. This tab shows where those
        examples come from and what one of them looks like.
      </PageTitle>

      <Section title="Who made the data"
        intro={<>We didn&apos;t record any traffic ourselves. Researchers at the Canadian Institute for Cybersecurity
          (University of New Brunswick, Canada) built a smart home in their lab, attacked it on purpose, recorded
          everything and published it in 2023 so anyone can study it. It&apos;s called <b className="text-foreground">CICIoT2023</b>{" "}
          (<a className="text-orange-deep underline-offset-4 hover:underline" href="https://pmc.ncbi.nlm.nih.gov/articles/PMC10346235/">their paper</a>).</>}>
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-md border bg-border sm:grid-cols-4">
          {stats.map(([n, label]) => (
            <div key={label} className="bg-background p-5">
              <dd className="text-3xl font-semibold tracking-[-0.02em] tabular">{n}</dd>
              <dt className="mono-label mt-1 text-muted-foreground">{label}</dt>
            </div>
          ))}
        </dl>
      </Section>

      <Section title="From a recording to a table" intro="How a smart home under attack became rows of numbers.">
        <LabPipeline />
      </Section>

      <Section title="Peek at the real file"
        intro="The data is public. Here it is as the researchers published it, before we touched anything.">
        <RawPreview />
      </Section>

      <Section title="What one row looks like"
        intro="One row is one small batch of packets. Here is a real row of normal traffic next to a real attack row. Pick an attack to compare.">
        <RowCompare />
      </Section>

      <Section title="The answers the model can give"
        intro="Every row is tagged with one of 34 labels: normal traffic, or one of 33 attacks. The attacks come in 7 families. Open one to see what it is.">
        <FamiliesAccordion />
      </Section>

      <Section title="The data is very uneven"
        intro={<>Floods (DDoS) are {pct(share("DDoS"), 0)} of all rows. Web attacks are {pct(share("Web"), 2)}, so
          small their bar barely shows. Left like this, a model would hardly ever see a web attack and would never
          learn it. Step 3 shows how we fixed that.</>}>
        <ImbalanceChart />
      </Section>

      <Section title="How the files got into our code"
        intro="Nothing here is hand-made or typed in: the table we use is exactly what the researchers published.">
        <div className="grid gap-6 md:grid-cols-2">
          <ol className="grid content-start gap-3 text-[15px]">
            <li><b>Kaggle</b>, a free data-science website, keeps a copy of all 169 files.</li>
            <li>We opened a free <b>Kaggle notebook</b>: a computer in the cloud that runs Python, with the files attached.</li>
            <li>We read them with <b>pandas</b>, a free ready-made Python library for tables. Think of it as an npm
              package for spreadsheets: we install it and call it, we don&apos;t write it.</li>
          </ol>
          <pre className="overflow-x-auto rounded-md bg-ink p-5 font-mono text-[13px] leading-relaxed text-white">
{`import pandas as pd            # load the library

table = pd.read_csv("part-00000.csv")
table.shape                    # (238687, 47)
# → this one file: 238,687 rows, 47 columns
#   (46 numbers + the answer)`}
          </pre>
        </div>
      </Section>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t pt-8">
        <p className="text-muted-foreground">Next: before trusting the data, we look at it closely.</p>
        <Link href="/explore/" className="notch mono-label inline-flex h-10 items-center bg-ink px-5 text-white hover:bg-graphite">
          Step 2: explore the data
        </Link>
      </div>
    </div>
  )
}
