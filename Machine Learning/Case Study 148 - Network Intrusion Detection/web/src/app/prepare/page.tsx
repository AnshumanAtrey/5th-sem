import { CheckCircle2, CircleDot } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { HowWeDidIt, KeyTerms, Learned } from "@/components/explain"
import { PageTitle } from "@/components/page-title"
import { LabelMap } from "@/components/prepare/label-map"
import { SampleChart } from "@/components/prepare/sample-chart"
import { ScaleWalk } from "@/components/prepare/scale-walk"
import { Section } from "@/components/section"
import { data, FAMILIES, FAMILY_COLOR, int, pct } from "@/lib/data"
import { FAMILY_STORIES } from "@/lib/families"

export const metadata: Metadata = { title: "3 · Prepare" }

export default function Page() {
  const r = data.results
  const c = data.checks
  const famSample = (f: string) => data.counts.filter((x) => x.family === f).reduce((s, x) => s + x.sample, 0)
  const famFull = (f: string) => data.counts.filter((x) => x.family === f).reduce((s, x) => s + x.full, 0)
  const famTest = (f: string) => data.family_report.find((x) => x.family === f)!["test flows"]
  const name = (f: string) => FAMILY_STORIES.find((s) => s.key === f)!.name.split(":")[0]
  const checks = [
    { ok: c.duplicates === 0, title: "Duplicate rows", result: `${c.duplicates} found`, why: "The same row twice could land in both the learning set and the exam, so the exam would partly test memory." },
    { ok: c.conflicts === 0, title: "Same numbers, different answers", result: `${c.conflicts} found`, why: "Two identical rows with different labels can't both be right; no model could learn them." },
    { ok: c.missing === 0, title: "Empty cells", result: `${c.missing} found`, why: "Models can't do maths on a blank." },
    { ok: c.infinite === 0, title: "Infinite values", result: `${c.infinite} found`, why: "A division by zero somewhere upstream would show up as infinity." },
    { ok: c.negative === 0, title: "Negative values", result: `${c.negative} found`, why: "No count, size or duration can be below zero." },
    { ok: false, title: "Columns that never change", result: c.constant.join(", "), why: "Always the same value, so it tells the model nothing. Kept: after scaling it becomes all zeros and can't affect anything." },
    { ok: false, title: "Columns that copy another", result: c.copies.map((p) => p.join(" = ")).join(", "), why: "Kept as well, so the app accepts a standard CICIoT2023 row as-is." },
  ]
  return (
    <div className="grid gap-16">
      <PageTitle light="Get the data ready" bold="for learning">
        Models only understand clean numbers on a fair scale, with the answers kept apart. These five steps get the data
        there, in the order we ran them.
      </PageTitle>

      <Section title="1. Take a fair sample"
        intro={<>{(r.flows_full / 1e6).toFixed(1)} million rows is too many to train 11 models on, and step 1 showed how
          uneven they are. So we keep a smaller part, chosen so the rare attacks don&apos;t get lost.</>}>
        <SampleChart />
        <KeyTerms terms={[
          { term: "Class imbalance", means: "When some answers have far more examples than others.",
            ours: <>DDoS floods are {pct(famFull("DDoS") / r.flows_full, 0)} of all {(r.flows_full / 1e6).toFixed(1)} million rows; web attacks are only {pct(famFull("Web") / r.flows_full, 2)}.</> },
          { term: "Biased (toward the majority class)", means: "A model that learns mostly from one big group and leans toward always answering it, neglecting the small groups.",
            ours: <>Trained on all the rows, the model would learn floods very well and mostly ignore web attacks and brute force. So we kept every rare-attack row and only cut the repeated floods.</> },
        ]} />
        <Learned>
          {int(r.flows_full)} rows became {int(r.flows_sample)} (about 1%), and every rare attack is still there: web
          attacks went from {pct(famFull("Web") / r.flows_full, 2)} of the data to {pct(famSample("Web") / r.flows_sample, 1)}.
        </Learned>
        <HowWeDidIt tool="our own 10 lines, using pandas and NumPy"
          code={`counts = all label counts across the 169 files\nkeep   = (12_000 / counts).clip(upper=1)    # chance to keep a row\nkeep["BenignTraffic"] = 120_000 / counts["BenignTraffic"]\n\nrng = np.random.default_rng(42)            # fixed seed: same rows every run\nfor part in the 169 files:\n    part[rng.random(len(part)) < keep[part.label]]`}>
          <p>This is the one step we wrote ourselves (it is <b>sample_flows</b> in <span className="font-mono">src/flows.py</span>).
            It reads all 169 files twice: once to count every label, then to keep each row with a chance that gives about
            12,000 per attack type. <b>pandas</b> reads and counts the tables; <b>NumPy</b> rolls the random numbers. The
            fixed seed (42) means anyone re-running it gets the very same {int(r.flows_sample)} rows.</p>
        </HowWeDidIt>
      </Section>

      <Section title="2. Check for junk" intro="Before learning anything, every row and column is checked for problems.">
        <ul className="grid gap-px overflow-hidden rounded-md border bg-border md:grid-cols-2 md:[&>li:last-child:nth-child(odd)]:col-span-2">
          {checks.map((k) => (
            <li key={k.title} className="flex gap-3 bg-background p-4">
              {k.ok ? <CheckCircle2 className="mt-0.5 size-5 shrink-0" style={{ color: "var(--normal)" }} aria-hidden />
                : <CircleDot className="mt-0.5 size-5 shrink-0 text-orange" aria-hidden />}
              <div className="grid gap-1">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <b>{k.title}</b><span className="font-mono text-sm">{k.result}</span>
                </div>
                <p className="text-sm text-muted-foreground">{k.why}</p>
              </div>
            </li>
          ))}
        </ul>
        <Learned>
          The data is clean: no duplicates, no blanks, no impossible values, so all {int(c.left)} rows stay. Only one
          column ({c.constant.join(", ")}) is useless and two pairs are copies, and none of them can do harm.
        </Learned>
        <HowWeDidIt tool="pandas, built-in checks"
          code={`df = df.drop_duplicates()          # remove repeated rows\ndf.duplicated(columns, keep=False)  # same numbers, different label\nnp.isnan(values).sum()             # empty cells\nnp.isinf(values).sum()             # infinite values\n(values < 0).sum()                 # negative values\ndf[col].nunique() == 1             # a column that never changes`}>
          <p>Each check is one ready-made <b>pandas</b> or <b>NumPy</b> call. We only read the counts they return.</p>
        </HowWeDidIt>
      </Section>

      <Section title="3. Turn the answers into numbers"
        intro="Models do maths, so the text answer (like &quot;DDoS-ICMP_Flood&quot;) has to become a number. We make two answer columns: the attack family, for the 'which attack?' model, and a single 0 or 1 for the main 'is it an attack?' detector.">
        <LabelMap />
        <Learned>
          {data.counts.length} text labels became 8 families and one yes/no column: 0 for normal traffic, 1 for any attack.
          The 45 number columns need no change here: they are already numbers (the protocol ones are already 0 or 1).
        </Learned>
        <HowWeDidIt tool="pandas .map() and a small lookup of ours"
          code={`df["family"]    = df["label"].map(category)           # "DDoS-ICMP_Flood" → "DDoS"\ndf["intrusion"] = (df["label"] != "BenignTraffic").astype(int)   # → 0 or 1`}>
          <p><b>category</b> is a short lookup we wrote: names starting with &quot;DDoS-&quot; go to DDoS, &quot;Recon-&quot;
            to Recon, the six web attack names to Web, and so on. <b>pandas</b>&apos; <b>.map()</b> runs it on every row.
            Turning categories into numbers like this is called <b>encoding</b>.</p>
        </HowWeDidIt>
      </Section>

      <Section title="4. Lock away a final exam"
        intro="A model can memorise the rows it learns from. The only fair test is on rows it has never seen. So before any learning, a quarter of the rows are put aside, and no model looks at them until grading.">
        <div className="grid gap-3">
          <div className="flex h-12 overflow-hidden rounded-[2px] border font-mono text-sm">
            <div className="flex items-center bg-ink px-4 text-white" style={{ width: `${(data.n_train / r.flows_clean) * 100}%` }}>
              {int(data.n_train)} rows to learn from (75%)
            </div>
            <div className="flex flex-1 items-center justify-center bg-orange-soft px-2 text-orange-deep">{int(data.n_test)} for the exam (25%)</div>
          </div>
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full min-w-[480px] text-sm">
              <thead>
                <tr className="border-b bg-panel text-left">
                  <th scope="col" className="mono-label px-4 py-2.5 font-medium text-muted-foreground">Family</th>
                  <th scope="col" className="mono-label px-4 py-2.5 text-right font-medium text-muted-foreground">To learn from</th>
                  <th scope="col" className="mono-label px-4 py-2.5 text-right font-medium text-orange-deep">In the exam</th>
                  <th scope="col" className="mono-label px-4 py-2.5 text-right font-medium text-muted-foreground">Exam share</th>
                </tr>
              </thead>
              <tbody>
                {FAMILIES.map((f) => (
                  <tr key={f} className="border-b last:border-0">
                    <th scope="row" className="px-4 py-2 text-left font-normal"><span className="mr-2 inline-block size-2 rounded-[1px]" style={{ background: FAMILY_COLOR[f] }} />{name(f)}</th>
                    <td className="px-4 py-2 text-right font-mono tabular">{int(famSample(f) - famTest(f))}</td>
                    <td className="px-4 py-2 text-right font-mono tabular">{int(famTest(f))}</td>
                    <td className="px-4 py-2 text-right font-mono tabular">{pct(famTest(f) / famSample(f), 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <Learned>
          Every family, and inside it every one of the 34 labels, is split the same 75 / 25 way (a <b>stratified</b>{" "}
          split), so even the rarest attacks get fairly graded. A model that always says &quot;attack&quot; would already
          score {pct(1 - famTest("Benign") / data.n_test)} on this exam, which is why step 5 looks past plain accuracy.
        </Learned>
        <HowWeDidIt tool="scikit-learn's train_test_split"
          code={`from sklearn.model_selection import train_test_split\n\nX_train, X_test, y_train, y_test = train_test_split(\n    X, y, test_size=0.25, stratify=labels, random_state=42)`}>
          <p>A standard <b>scikit-learn</b> function. <b>test_size=0.25</b> puts a quarter aside; <b>stratify</b> keeps
            every label&apos;s share equal in both parts; <b>random_state=42</b> makes the split the same every run. We
            don&apos;t pick which rows go where: the function does, at random.</p>
        </HowWeDidIt>
      </Section>

      <Section title="5. Put every number on one scale"
        intro="Speed goes up to millions; 'uses TCP' is just 0 or 1. Many models would let the huge numbers drown out the small ones. So every number goes through the same four steps. Pick a column and a row, or type your own value, and follow it.">
        <ScaleWalk />
        <Learned>
          After these steps every column lives on the same scale, roughly −3 to +3, where 0 means typical. The median,
          average and spread used here were learned from the {int(data.n_train)} training rows only, then applied
          unchanged to the exam rows, so nothing about the exam leaks into learning.
        </Learned>
        <HowWeDidIt tool="a scikit-learn Pipeline of ready-made steps"
          code={`Pipeline([\n  ("clean", FunctionTransformer(clean)),         # bad values → empty\n  ("fill",  SimpleImputer(strategy="median")),   # empty → training median\n  ("log",   FunctionTransformer(np.log1p)),      # x → log(1 + x)\n  ("scale", StandardScaler()),                    # (x − average) ÷ spread\n  ("model", ...),                                 # step 4 trains this\n])`}>
          <p>A <b>Pipeline</b> chains the steps so they always run in the same order, for training, for the exam and on
            this website. <b>SimpleImputer</b> and <b>StandardScaler</b> are standard <b>scikit-learn</b> parts; the only
            bit we wrote is <b>clean</b>, a few lines that turn text, negative or infinite values into blanks. Putting
            numbers on one scale like this is called <b>standardization</b>.</p>
        </HowWeDidIt>
      </Section>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t pt-8">
        <p className="text-muted-foreground">Next: the 11 models learn from the {int(data.n_train)} prepared rows.</p>
        <Link href="/train/" className="notch mono-label inline-flex h-10 items-center bg-ink px-5 text-white hover:bg-graphite">
          Step 4: train the models
        </Link>
      </div>
    </div>
  )
}
