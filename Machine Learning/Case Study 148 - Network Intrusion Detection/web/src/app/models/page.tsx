import type { Metadata } from "next"
import { ModelBars, UnseenBars } from "@/components/models/charts"
import { FamilyHeatmap } from "@/components/models/family-heatmap"
import { PageTitle } from "@/components/page-title"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { data, int, pct } from "@/lib/data"
import { cn } from "@/lib/utils"

export const metadata: Metadata = { title: "Model comparison" }

const DEPLOYED = "Gradient Boosting"
const MODULE_NAME: Record<string, string> = {
  V: "V · Classification", VII: "VII · Unsupervised", VIII: "VIII · Ensembles", IX: "IX · Neural networks", "case study": "Case study",
}

function Section({ title, intro, children }: { title: string; intro: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="grid content-start gap-4">
      <div className="max-w-3xl">
        <h2 className="font-serif text-3xl font-light tracking-[-0.02em]">{title}</h2>
        <p className="mt-1.5 text-muted-foreground">{intro}</p>
      </div>
      {children}
    </section>
  )
}

export default function Page() {
  const r = data.results
  const rows = r.comparison
  const best = rows[0]
  const unseen = data.unseen.map((u) => ({
    family: u["family left out of training"], seen: u["caught when seen in training"], never: u["caught when NEVER seen"],
    kmeans: u["K-Means detector (never saw ANY attack)"],
  }))
  return (
    <div className="grid gap-14">
      <PageTitle light="Every model from the course," bold="on the same test">
          The case study asks for six algorithms. All {rows.length} classifiers taught in the syllabus were trained on the same{" "}
          {int(data.n_train)} flows and scored on the same {int(data.n_test)} locked test flows. For an intrusion detector the
          number that matters most is recall: of the real attacks, how many were caught.
      </PageTitle>

      <Section title="The leaderboard" intro={<>Sorted by recall. {best.model} misses the fewest attacks; {DEPLOYED} runs in this site because it is nearly as good and its saved model is a fraction of the size.</>}>
        <div className="overflow-x-auto rounded-[2px] border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Model</TableHead>
                <TableHead>Syllabus module</TableHead>
                <TableHead className="text-right">Recall</TableHead>
                <TableHead className="text-right">Precision</TableHead>
                <TableHead className="text-right">F1</TableHead>
                <TableHead className="text-right">Accuracy</TableHead>
                <TableHead className="text-right">Attacks missed</TableHead>
                <TableHead className="text-right">False alarms</TableHead>
                <TableHead className="text-right">Model size</TableHead>
                <TableHead className="text-right">Training time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((m) => (
                <TableRow key={m.model} className={cn(m.model === DEPLOYED && "bg-orange-soft")}>
                  <TableCell className="font-medium whitespace-nowrap">
                    {m.model}
                    {m.model === DEPLOYED && <Badge className="mono-label ml-2 rounded-[2px] bg-orange-soft text-[10px] text-orange-deep">Runs on this site</Badge>}
                  </TableCell>
                  <TableCell className="text-muted-foreground whitespace-nowrap">{MODULE_NAME[m.module] ?? m.module}</TableCell>
                  {[m.recall, m.precision, m.F1, m.accuracy].map((v, i) => <TableCell key={i} className="text-right font-mono tabular">{pct(v, 2)}</TableCell>)}
                  <TableCell className="text-right font-mono tabular">{int(m["missed attacks"])}</TableCell>
                  <TableCell className="text-right font-mono tabular">{int(m["false alarms"])}</TableCell>
                  <TableCell className="text-right font-mono tabular">{m["size MB"] < 0.1 ? "<0.1" : m["size MB"].toFixed(1)} MB</TableCell>
                  <TableCell className="text-right font-mono tabular">{m["train s"].toFixed(1)} s</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Section>

      <Section title="The two mistakes, model by model" intro="A missed attack walks straight into the network; a false alarm wastes an analyst's time. Same order as the leaderboard.">
        <div className="grid gap-8 lg:grid-cols-2">
          <div><h3 className="mb-2 text-sm font-medium">Attacks missed (false negatives)</h3>
            <ModelBars rows={rows} field="missed attacks" label="Attacks missed" format="int" deployed={DEPLOYED} /></div>
          <div><h3 className="mb-2 text-sm font-medium">Normal flows flagged (false positives)</h3>
            <ModelBars rows={rows} field="false alarms" label="False alarms" format="int" deployed={DEPLOYED} /></div>
        </div>
      </Section>

      <Section title="Which model catches which attack family" intro="Each cell is the share of that family's test flows the model got right: for benign, flows let through; for attacks, flows caught. A good average can hide a blind spot.">
        <FamilyHeatmap models={rows.map((m) => m.model)} byFamily={r.by_family} />
      </Section>

      <Section title="Attacks the model has never seen" intro={<>Gradient boosting retrained seven times, each time with one whole family removed, then tested on that family. The K-Means detector (k = {r.kmeans_k}, picked by the elbow method) learned only normal traffic and never saw any attack.</>}>
        <UnseenBars data={unseen} />
      </Section>

      <div className="grid items-start gap-10 lg:grid-cols-2">
        <Section title="Not a lucky split" intro="5-fold cross-validation on the training flows: five retrains, each scored on a different fifth.">
          <Table>
            <TableHeader><TableRow><TableHead>Model</TableHead><TableHead className="text-right">Recall</TableHead><TableHead className="text-right">F1</TableHead></TableRow></TableHeader>
            <TableBody>
              {Object.entries(r.cv).map(([m, v]) => (
                <TableRow key={m}>
                  <TableCell>{m}</TableCell>
                  <TableCell className="text-right font-mono tabular">{pct(v["recall mean"], 2)} ± {(v["recall std"] * 100).toFixed(2)}</TableCell>
                  <TableCell className="text-right font-mono tabular">{pct(v["F1 mean"], 2)} ± {(v["F1 std"] * 100).toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Section>
        <Section title="Naming the attack family" intro={<>The 8-class model behind the detector&apos;s family bars: {pct(r.family_accuracy)} accuracy, macro F1 {pct(r.family_macro_f1)}.</>}>
          <Table>
            <TableHeader><TableRow><TableHead>Family</TableHead><TableHead className="text-right">Precision</TableHead><TableHead className="text-right">Recall</TableHead><TableHead className="text-right">Test flows</TableHead></TableRow></TableHeader>
            <TableBody>
              {[...data.family_report].sort((a, b) => a.recall - b.recall).map((f) => (
                <TableRow key={f.family}>
                  <TableCell>{f.family}</TableCell>
                  <TableCell className="text-right font-mono tabular">{pct(f.precision)}</TableCell>
                  <TableCell className="text-right font-mono tabular">{pct(f.recall)}</TableCell>
                  <TableCell className="text-right font-mono tabular">{int(f["test flows"])}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Section>
      </div>
    </div>
  )
}
