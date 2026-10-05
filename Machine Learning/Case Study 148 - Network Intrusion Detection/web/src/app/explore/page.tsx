import type { Metadata } from "next"
import Link from "next/link"
import { HowWeDidIt, Learned } from "@/components/explain"
import { FamilySpread } from "@/components/explore/family-spread"
import { FamilyTree } from "@/components/explore/family-tree"
import { IatTrap } from "@/components/explore/iat-trap"
import { LinkedColumns } from "@/components/explore/linked-columns"
import { PcaMap } from "@/components/explore/pca-map"
import { PageTitle } from "@/components/page-title"
import { Section } from "@/components/section"
import eda from "@/data/eda.json"
import { data, int, pct } from "@/lib/data"

export const metadata: Metadata = { title: "2 · Explore" }

export default function Page() {
  const trap = Object.values(data.results.iat_trap)
  const [iatAlone, clean] = [trap[0]["accuracy, naming all 34 labels"], trap[1]["accuracy, naming all 34 labels"]]
  const ddosSize = (eda.spread.columns as Record<string, Record<string, number[]>>)["Tot size"].DDoS[2]
  return (
    <div className="grid gap-16">
      <PageTitle light="Look at the data" bold="before trusting it">
        Exploring the data (EDA, exploratory data analysis) means counting and drawing it before building anything, the
        way you&apos;d read logs before writing detection rules. It shows what separates attacks from normal traffic and
        catches problems early. We explored a fair sample of {int(eda.rows)} rows (step 3 shows how we picked it).
      </PageTitle>

      <Section title="How the families differ"
        intro="Pick a number. For each family, the dark tick is the middle row, the shaded box holds the middle half of the rows, and the thin line covers 90% of them. The axis grows ×10 at every step, so tiny and huge values both fit.">
        <FamilySpread />
        <Learned>
          Floods (DDoS, DoS) are not faster on average. What gives them away is tiny packets (the middle DDoS row is{" "}
          {Math.round(ddosSize)} bytes) and connections that last a split second. Recon, web and brute force sit inside
          normal traffic&apos;s range on almost every number: those will be the hard ones to catch.
        </Learned>
        <HowWeDidIt tool="pandas and Matplotlib, two free Python libraries we import"
          code={`by_family = df.groupby("family")["Tot size"]\nby_family.quantile([0.05, 0.25, 0.5, 0.75, 0.95])\n# → for each family: the value 5%, 25%, 50% (middle),\n#   75% and 95% of its rows are below`}>
          <p>For every family, <b>pandas</b> sorts the rows by the chosen number and reads off the values at the 5%,
            25%, 50%, 75% and 95% marks (<b>quantiles</b>). In the notebook, <b>Matplotlib</b>&apos;s ready-made box plot
            draws them; this page draws the same numbers. No formula of ours: both are standard tools.</p>
        </HowWeDidIt>
      </Section>

      <Section title="Columns that say the same thing"
        intro="Correlation is a score from 0 to 1 for how strongly two columns move together. 1 means one column is just a copy of the other.">
        <LinkedColumns />
        <Learned>
          <span className="font-mono">Rate</span> and <span className="font-mono">Srate</span> are identical, and so are{" "}
          <span className="font-mono">IPv</span> and <span className="font-mono">LLC</span>. Copies don&apos;t hurt most
          models, but naive bayes treats every column as separate evidence, so it counts the same clue twice. That is one
          reason it does badly in step 5.
        </Learned>
        <HowWeDidIt tool="pandas' built-in .corr()"
          code={`np.log1p(df[columns]).corr()\n# → a ${eda.corr.columns.length} × ${eda.corr.columns.length} grid: one score for every pair of columns`}>
          <p><b>pandas</b> has correlation built in (the standard <b>Pearson</b> formula). We shrink the huge numbers
            with a log first, so a few giant values can&apos;t dominate, then ask for every pair at once.</p>
        </HowWeDidIt>
      </Section>

      <Section title="Squeezing 45 numbers onto a flat map"
        intro="Each row is 45 numbers, so it's a point in 45 dimensions, which nobody can draw. PCA (principal component analysis) finds the 2 directions in which the rows differ most and lays every row out on them, like the shadow of a 3-D object on a wall: detail is lost, but the shape shows. Click a family to hide or show it.">
        <PcaMap />
        <Learned>
          Mirai and the floods form their own tight clouds, so they should be easy. Normal traffic, recon, spoofing, web
          and brute force pile up in one shared cloud: the models will need all 45 numbers, and a lot of care, to pull
          them apart.
        </Learned>
        <HowWeDidIt tool="scikit-learn's PCA (syllabus module VIII)"
          code={`from sklearn.decomposition import PCA\n\nxy = PCA(n_components=2).fit_transform(rows)\n# → 2 numbers per row: its spot on the map`}>
          <p>PCA is a standard algorithm, and <b>scikit-learn</b> (the free machine learning library we use throughout)
            has it built in. We hand it {int(eda.pca.rows)} rows (up to 2,500 per family, already shrunk and put on one
            scale), and it hands back 2 numbers per row. This page shows 400 dots per family.</p>
        </HowWeDidIt>
      </Section>

      <Section title="Which attacks look alike"
        intro="We take each of the 34 labels' average row, join the two most alike labels, then the next most alike, and keep going until everything is one tree. This is hierarchical clustering. Joins near the left mean very alike.">
        <FamilyTree />
        <Learned>
          Every DoS flood sits right next to its DDoS twin (the same attack from one machine or from many), and normal
          traffic sits right next to ARP and DNS spoofing. That predicts exactly what the models will struggle with in
          step 5.
        </Learned>
        <HowWeDidIt tool="SciPy's linkage (syllabus module VII)"
          code={`from scipy.cluster.hierarchy import linkage, dendrogram\n\ntree = linkage(average_row_per_label, method="ward")\ndendrogram(tree)   # draws the tree`}>
          <p><b>SciPy</b>, a free science library, builds the tree. <b>Ward</b> is the joining rule: at every step it
            joins the pair whose merged group stays tightest. We only chose the rule; the joining is done by the library.</p>
        </HowWeDidIt>
      </Section>

      <Section title="The column that cheats"
        intro="IAT is supposed to mean 'time since the previous packet'. But its values sit in neat bands near 0, 83 million and 167 million, and each family lives in its own bands. Real packet gaps don't look like that.">
        <IatTrap />
        <Learned>
          IAT alone names the right label {pct(iatAlone)} of the time, more than all 45 real traffic numbers together
          ({pct(clean)}). It tracks <i>when</i> each attack was recorded in the lab, not the traffic itself. On a real
          network a new attack happens at a new time, so this clue would vanish. <b>We threw IAT out</b> before training
          anything.
        </Learned>
        <HowWeDidIt tool="scikit-learn's DecisionTreeClassifier, as a quick test"
          code={`from sklearn.tree import DecisionTreeClassifier\n\ntree = DecisionTreeClassifier().fit(train[["IAT"]], train_labels)\ntree.score(test[["IAT"]], test_labels)   # → ${pct(iatAlone)}`}>
          <p>A quick experiment on 60,000 rows: train a simple decision tree that may only look at IAT, then one that sees
            the 45 real columns, and score both on rows they never saw. One column beating 45 is the alarm bell.</p>
        </HowWeDidIt>
      </Section>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t pt-8">
        <p className="text-muted-foreground">Next: we clean the data up and get it ready for learning.</p>
        <Link href="/prepare/" className="notch mono-label inline-flex h-10 items-center bg-ink px-5 text-white hover:bg-graphite">
          Step 3: prepare the data
        </Link>
      </div>
    </div>
  )
}
