import type { Metadata } from "next"
import Link from "next/link"
import { KeyTerms, Learned, WordList } from "@/components/explain"
import { ModelBars, UnseenBars } from "@/components/models/charts"
import { FamilyHeatmap } from "@/components/models/family-heatmap"
import { PageTitle } from "@/components/page-title"
import { GradeCard } from "@/components/results/grade-card"
import { Section } from "@/components/section"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { data, int, pct } from "@/lib/data"
import { MODULES } from "@/lib/models"
import { cn } from "@/lib/utils"

export const metadata: Metadata = { title: "5 · Results" }

const DEPLOYED = "Gradient Boosting"
const WORDS = [
  { term: "Exam rows", means: `The ${int(data.n_test)} rows locked away in step 3. No model saw them while learning, so they show how it does on new traffic.` },
  { term: "Confusion matrix", means: "A 2×2 table sorting every exam answer: caught, missed, false alarm, or correctly left alone." },
  { term: "Recall (catch rate)", means: "Of the real attacks, the share the model caught. The most important score for an intrusion detector." },
  { term: "Missed attack (false negative)", means: "A real attack the model called normal. The dangerous mistake: the attacker gets in." },
  { term: "False alarm (false positive)", means: "Normal traffic the model called an attack. Wastes the security team's time." },
  { term: "Precision", means: "Of the alarms raised, the share that were real attacks." },
  { term: "Accuracy", means: "Of all exam rows, the share answered right. Misleading here, because most exam rows are attacks." },
  { term: "Alarm threshold", means: "The chance of attack at which we call it an attack. Default 50%; moving it trades catches for false alarms." },
]

export default function Page() {
  const r = data.results
  const rows = r.comparison
  const top = rows.slice(0, 4)
  const NORMAL = data.family_report.find((f) => f.family === "Benign")!["test flows"]
  const ATTACKS = data.n_test - NORMAL
  const km = rows.find((m) => m.model === "K-Means detector")!
  const kmFam = r.by_family["K-Means detector"]
  const unseen = data.unseen.map((u) => ({
    family: u["family left out of training"], seen: u["caught when seen in training"], never: u["caught when NEVER seen"],
    kmeans: u["K-Means detector (never saw ANY attack)"],
  }))
  const byNever = [...data.unseen].sort((a, b) => a["caught when NEVER seen"] - b["caught when NEVER seen"])
  const best = rows[0]
  const nb = rows.find((m) => m.model === "Naive Bayes")!
  const plain = r.imbalance["recall, no weighting"], weighted = r.imbalance["recall, balanced"]
  const answers = [
    ["Can machine learning tell normal and malicious traffic apart?", `Yes. The model on this site catches ${pct(data.test.recall, 2)} of attacks in the exam, and ${pct(data.test.precision, 2)} of its alarms are real.`],
    ["Which network features matter most?", `${Object.keys(r.top_features).slice(0, 5).join(", ")}: scrambling them hurts the model most (the 'hang up' and 'urgent' counts, batch size, duration and header size).`],
    ["Which algorithm has the highest recall?", `${best.model}, ${pct(best.recall, 2)} (tied with random forest), missing ${int(best["missed attacks"])} of ${int(ATTACKS)} exam attacks.`],
    ["Which attack categories are hardest?", `Recon and spoofing. Missed most often: ${r.hardest_types.slice(0, 4).map((t) => `${t.label} (${pct(t["miss rate"], 0)})`).join(", ")}. They send a few ordinary-looking packets, not a flood.`],
    ["How does class imbalance affect the model?", `Accuracy misleads (always saying 'attack' scores ${pct(ATTACKS / data.n_test)}); naive bayes reaches ${pct(nb.precision)} precision while catching only ${pct(nb.recall)}. Weighting the rare families raises their catch rate (brute force ${pct(plain.BruteForce, 0)} → ${pct(weighted.BruteForce, 0)}) at the big families' cost, without improving the total.`],
    ["Can it detect previously unseen traffic?", `Partly. Retrained without a family, it still catches ${pct(byNever.at(-1)!["caught when NEVER seen"], 0)} of ${byNever.at(-1)!["family left out of training"]} but only ${pct(byNever[0]["caught when NEVER seen"], 0)} of ${byNever[0]["family left out of training"]}.`],
  ]
  return (
    <div className="grid gap-16">
      <PageTitle light="Grade every model" bold="on the locked exam">
        Each of the 11 trained models answers the {int(data.n_test)} exam rows it has never seen ({int(ATTACKS)} attacks
        and {int(NORMAL)} normal). We compare every answer with the truth and count. Nothing here is a model&apos;s own
        opinion of itself: it is all counted on the exam.
      </PageTitle>

      <WordList words={WORDS} />

      <Section title="How we grade a model"
        intro="Every exam answer lands in one of 4 boxes. All the scores are simple divisions of those 4 counts. Pick any model to see its real boxes.">
        <GradeCard />
        <KeyTerms terms={[
          { term: "Why recall comes first", means: "A missed attack is far worse than a false alarm: one lets an attacker in, the other costs a few minutes of checking.",
            ours: "So every ranking on this page is sorted by recall, and we check the false alarms right after." },
        ]} />
      </Section>

      <Section title="The leaderboard" intro={`All 11 models on the same ${int(data.n_test)} exam rows, sorted by catch rate (recall).`}>
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Model</TableHead>
                <TableHead>Syllabus module</TableHead>
                <TableHead className="text-right">Catch rate (recall)</TableHead>
                <TableHead className="text-right">Precision</TableHead>
                <TableHead className="text-right">Missed attacks</TableHead>
                <TableHead className="text-right">False alarms</TableHead>
                <TableHead className="text-right">Accuracy</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((m) => (
                <TableRow key={m.model} className={cn(m.model === DEPLOYED && "bg-orange-soft")}>
                  <TableCell className="font-medium whitespace-nowrap">
                    {m.model}
                    {m.model === DEPLOYED && <Badge className="mono-label ml-2 rounded-[2px] bg-orange-soft text-[10px] text-orange-deep">Runs on this site</Badge>}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">{MODULES[m.module]?.split(" · ")[0]}</TableCell>
                  <TableCell className="text-right font-mono tabular">{pct(m.recall, 2)}</TableCell>
                  <TableCell className="text-right font-mono tabular">{pct(m.precision, 2)}</TableCell>
                  <TableCell className="text-right font-mono tabular">{int(m["missed attacks"])}</TableCell>
                  <TableCell className="text-right font-mono tabular">{int(m["false alarms"])}</TableCell>
                  <TableCell className="text-right font-mono tabular">{pct(m.accuracy, 2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="grid gap-8 lg:grid-cols-2">
          <div><h3 className="mb-2 text-sm font-medium">Missed attacks (attackers who got in)</h3>
            <ModelBars rows={rows} field="missed attacks" label="Attacks missed" format="int" deployed={DEPLOYED} /></div>
          <div><h3 className="mb-2 text-sm font-medium">False alarms (normal traffic flagged)</h3>
            <ModelBars rows={rows} field="false alarms" label="False alarms" format="int" deployed={DEPLOYED} /></div>
        </div>
        <Learned>
          The tree ensembles (random forest, bagging, gradient boosting) and the neural network lead, all above 95.8%.
          The straight-line models (logistic regression, perceptron) can&apos;t separate the quiet attacks. Naive bayes
          almost always says &quot;normal&quot;, so its few alarms are right ({pct(nb.precision)} precision) but it misses{" "}
          {pct(1 - nb.recall, 0)} of attacks: proof that one score alone can fool you.
        </Learned>
      </Section>

      <Section title="Which model catches which attack family"
        intro="Each cell: the share of that family's exam rows the model got right (for normal traffic: let through; for attacks: caught). Darker = better. A good average can hide a blind spot.">
        <FamilyHeatmap models={rows.map((m) => m.model)} byFamily={r.by_family} />
        <Learned>
          Floods (DDoS, DoS, Mirai) are caught by nearly every model. Recon, spoofing and brute force are where the models
          differ, and where even the best ones lose most of their misses.
        </Learned>
      </Section>

      <Section title="Which model we use, and why"
        intro="The website needs one model. The top four are close on catch rate, so the choice comes down to false alarms and size.">
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Model</TableHead>
                <TableHead className="text-right">Catch rate</TableHead>
                <TableHead className="text-right">False alarms</TableHead>
                <TableHead className="text-right">Saved file size</TableHead>
                <TableHead className="text-right">Time to learn</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {top.map((m) => (
                <TableRow key={m.model} className={cn(m.model === DEPLOYED && "bg-orange-soft")}>
                  <TableCell className="font-medium">{m.model}{m.model === DEPLOYED && <span className="mono-label ml-2 text-[10px] text-orange-deep">chosen</span>}</TableCell>
                  <TableCell className="text-right font-mono tabular">{pct(m.recall, 2)}</TableCell>
                  <TableCell className="text-right font-mono tabular">{int(m["false alarms"])}</TableCell>
                  <TableCell className="text-right font-mono tabular">{m["size MB"] < 1 ? `${m["size MB"].toFixed(1)} MB` : `${Math.round(m["size MB"])} MB`}</TableCell>
                  <TableCell className="text-right font-mono tabular">{Math.round(m["train s"])} s</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <ol className="grid gap-2 text-[15px] md:grid-cols-3">
          <li className="rounded-md border p-4"><b>Almost the best catch rate.</b> {pct(rows.find((m) => m.model === DEPLOYED)!.recall, 2)}, only{" "}
            {((best.recall - rows.find((m) => m.model === DEPLOYED)!.recall) * 100).toFixed(1)} points behind the top two.</li>
          <li className="rounded-md border p-4"><b>The fewest false alarms</b> of the top four ({int(rows.find((m) => m.model === DEPLOYED)!["false alarms"])}), so the
            security team chases the fewest ghosts.</li>
          <li className="rounded-md border p-4"><b>Small enough for a browser.</b> Its 300 small trees save to 0.5 MB, against 23 MB
            for bagging and 106 MB for random forest, so it runs right inside this web page, with nothing sent to a server.</li>
        </ol>
        <Learned>
          We use <b>gradient boosting</b>. Bagging and random forest catch 0.4 points more attacks, but they raise more
          false alarms and are about 40 to 200 times bigger: too heavy to load in a web page.
        </Learned>
      </Section>

      <Section title="Where clustering fits"
        intro="Clustering means grouping similar rows without being told the answers (unsupervised learning, syllabus module VII). We used it twice, for two different jobs, and neither is the main detector.">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid content-start gap-2 rounded-md border p-5">
            <p className="mono-label text-orange-deep">1 · K-Means, as a detector</p>
            <p>Learned 20 groups of <b>normal</b> traffic only (never saw an attack) and flags anything far from all of them.
              Score: catches {pct(km.recall, 1)} of attacks with very few false alarms ({int(km["false alarms"])}).</p>
            <p className="text-sm text-muted-foreground">
              By family: Mirai {pct(kmFam.Mirai, 0)}, DoS {pct(kmFam.DoS, 0)}, DDoS {pct(kmFam.DDoS, 0)}, but recon {pct(kmFam.Recon, 0)}, spoofing {pct(kmFam.Spoofing, 0)}, web {pct(kmFam.Web, 0)}.
            </p>
            <p className="text-sm"><b>Why not the main detector:</b> loud floods stand out from normal traffic, quiet attacks
              don&apos;t, so it misses most of the hard ones. Its value is that it needs no attack examples, so it could still
              flag a brand-new flood nobody has labelled yet.</p>
          </div>
          <div className="grid content-start gap-2 rounded-md border p-5">
            <p className="mono-label text-orange-deep">2 · Hierarchical clustering, to understand the data</p>
            <p>Built the family tree of the 34 labels in step 2 (Explore): it joins the most alike labels first.</p>
            <p className="text-sm text-muted-foreground">It showed every DoS sitting next to its DDoS twin, and normal traffic sitting next to ARP and DNS spoofing.</p>
            <p className="text-sm"><b>Why it matters:</b> it predicted exactly where the models would struggle: spoofing hides
              in normal traffic, and DoS and DDoS get mixed up when naming the family. It explains results; it doesn&apos;t
              make predictions.</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">(PCA, the 2-D map in step 2, is not clustering: it squeezes 45 columns into 2 for a picture, it doesn&apos;t group rows.)</p>
      </Section>

      <Section title="Is it luck?"
        intro="One exam could flatter a model by chance. 5-fold cross-validation repeats the test 5 times: the training rows are cut into 5 parts, and each time the model learns from 4 and is graded on the 5th.">
        <Table>
          <TableHeader><TableRow><TableHead>Model</TableHead><TableHead className="text-right">Catch rate over the 5 tries</TableHead><TableHead className="text-right">F1 over the 5 tries</TableHead></TableRow></TableHeader>
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
        <Learned>The 5 tries differ by about a tenth of a percent (± is the typical wobble), so the results are not a lucky split.</Learned>
      </Section>

      <Section title="Attacks it has never seen"
        intro="New attacks appear all the time. So we retrained gradient boosting 7 times, each time with one whole family removed, then tested it on that family. Next to it, the K-Means detector, which never saw any attack at all.">
        <UnseenBars data={unseen} />
        <Learned>
          A new kind of flood is still caught (they look like other floods). A new quiet attack mostly isn&apos;t: spoofing
          drops to {pct(data.unseen.find((u) => u["family left out of training"] === "Spoofing")!["caught when NEVER seen"], 0)} when the model has never seen it.
        </Learned>
      </Section>

      <Section title="The alarm threshold"
        intro="The model gives a chance; we decide where 'attack' starts. Lower the line and more attacks are caught, but more normal traffic is flagged too. The detector in step 6 has a slider for this.">
        <Table>
          <TableHeader><TableRow><TableHead>Alarm at</TableHead><TableHead className="text-right">Attacks caught</TableHead><TableHead className="text-right">Normal rows flagged</TableHead><TableHead className="text-right">Missed attacks</TableHead><TableHead className="text-right">False alarms</TableHead></TableRow></TableHeader>
          <TableBody>
            {data.thresholds.filter((t) => [10, 30, 50, 70, 90].includes(t.threshold)).map((t) => (
              <TableRow key={t.threshold} className={cn(t.threshold === 50 && "bg-orange-soft")}>
                <TableCell className="font-mono">{t.threshold}%{t.threshold === 50 && <span className="mono-label ml-2 text-[10px] text-orange-deep">default</span>}</TableCell>
                <TableCell className="text-right font-mono tabular">{pct(t.recall, 2)}</TableCell>
                <TableCell className="text-right font-mono tabular">{pct(t["false alarm rate"], 2)}</TableCell>
                <TableCell className="text-right font-mono tabular">{int(Math.round(ATTACKS * (1 - t.recall)))}</TableCell>
                <TableCell className="text-right font-mono tabular">{int(Math.round(NORMAL * t["false alarm rate"]))}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Section>

      <Section title="The case study's six questions">
        <dl className="grid gap-5">
          {answers.map(([q, a]) => (
            <div key={q} className="grid gap-1 border-l-2 border-orange pl-4">
              <dt className="font-semibold">{q}</dt>
              <dd className="text-muted-foreground">{a}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section title="Limitations, said plainly">
        <ul className="grid list-disc gap-2 pl-5 text-muted-foreground">
          <li>{pct(data.test["false alarm rate"])} of normal traffic is flagged at the 50% line. Moving the line to 90% cuts that below 1%, but more attacks get through.</li>
          <li>All the traffic comes from one lab network; another network needs re-testing.</li>
          <li>Each row summarises 10 or 100 packets, so the detector never sees single packets.</li>
          <li>Our sampling set the mix of normal and attack rows, not a real network.</li>
          <li>The IAT leak shows how easily a dataset can flatter a model; other columns could hide subtler leaks.</li>
          <li>One layer of defence, not a guarantee.</li>
        </ul>
      </Section>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t pt-8">
        <p className="text-muted-foreground">Next: use the chosen model yourself.</p>
        <Link href="/try/" className="notch mono-label inline-flex h-10 items-center bg-ink px-5 text-white hover:bg-graphite">Step 6: try it</Link>
      </div>
    </div>
  )
}
