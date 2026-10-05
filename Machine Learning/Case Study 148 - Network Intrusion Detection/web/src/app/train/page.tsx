import { ArrowRight } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { KeyTerms, Learned } from "@/components/explain"
import { PageTitle } from "@/components/page-title"
import { Section } from "@/components/section"
import { BoosterWalk } from "@/components/train/booster-walk"
import { ModelsAccordion } from "@/components/train/models-accordion"
import { data, int } from "@/lib/data"

export const metadata: Metadata = { title: "4 · Train" }

export default function Page() {
  const flow = [
    ["The prepared rows", `${int(data.n_train)} rows × 45 numbers, plus each row's answer (0 or 1)`],
    ["model.fit(rows, answers)", "the library adjusts the model's inner numbers until its guesses match the answers"],
    ["A trained model", "its learned numbers: weights, tree questions, cut-offs…"],
    ["model.predict_proba(new row)", "a chance of attack for a row it has never seen, e.g. 93%"],
  ]
  return (
    <div className="grid gap-16">
      <PageTitle light="Teach 11 models" bold="from the examples">
        Every model taught in the course learns from the same {int(data.n_train)} prepared rows. None of them is a
        formula we wrote: each is a ready-made class in scikit-learn, a free machine learning library. We choose a few
        settings, hand it the rows and their answers, and the library does the learning.
      </PageTitle>

      <Section title="What 'training' means" intro="The same four steps for every one of the 11 models.">
        <ol className="grid gap-px overflow-hidden rounded-md border bg-border md:grid-cols-4">
          {flow.map(([title, body], i) => (
            <li key={title} className="relative grid content-start gap-2 bg-background p-4">
              <span className="flex items-center gap-2">
                <span className="mono-label grid size-6 place-items-center rounded-[2px] border text-[11px]">{i + 1}</span>
                <b className={i % 2 ? "font-mono text-[13px]" : ""}>{title}</b>
              </span>
              <p className="text-sm text-muted-foreground">{body}</p>
              {i < 3 && <ArrowRight className="absolute top-1/2 -right-2 z-10 hidden size-4 -translate-y-1/2 rounded-full bg-background text-orange md:block" aria-hidden />}
            </li>
          ))}
        </ol>
        <pre className="overflow-x-auto rounded-md bg-ink p-5 font-mono text-[13px] leading-relaxed text-white">
{`from sklearn.ensemble import RandomForestClassifier   # 1. import a ready-made model

model = RandomForestClassifier(n_estimators=200)     # 2. choose its settings
model.fit(X_train, y_train)                          # 3. learn from the rows and answers
model.predict_proba(X_test)                          # 4. chance of attack for unseen rows`}
        </pre>
        <KeyTerms terms={[
          { term: "Supervised learning", means: "Learning from examples that come with the right answer.",
            ours: "10 of the 11 models learn from rows tagged normal (0) or attack (1). K-Means is the exception: it never sees an answer." },
          { term: "Training (.fit)", means: "Running the learning method on the examples so it works out its inner numbers.",
            ours: <>Every model calls .fit() on the same {int(data.n_train)} rows; it took from 0.4 seconds (KNN) to 235 seconds (AdaBoost).</> },
          { term: "Parameters vs settings", means: "Parameters are what the model learns by itself; settings (hyperparameters) are what we choose beforehand.",
            ours: "Random forest: we set '200 trees' (a setting); the questions inside each tree are learned (parameters)." },
          { term: "Overfitting", means: "Memorising the training examples instead of learning the pattern, so the model looks great on them and worse on new rows.",
            ours: "One decision tree overfits easily; random forest, bagging and early stopping exist largely to prevent it. The locked exam rows catch it." },
          { term: "Ensemble", means: "A model made of many smaller models that vote or add up.",
            ours: "Random forest (200 trees), bagging (100), AdaBoost (200 stumps) and gradient boosting (300 trees). Three of them took the top three places in step 5." },
        ]} />
      </Section>

      <Section title="The 11 models"
        intro="Grouped by syllabus module. Open one to see the problem it solves, how it decides, where its code comes from, and how it did on our data. Only one opens at a time.">
        <ModelsAccordion />
      </Section>

      <Section title="Inside the model on this website"
        intro="Gradient boosting runs the detector on this site. Pick a real exam row and drag the slider: every tree adds a small nudge, and you can watch the chance of attack settle as the trees add up.">
        <BoosterWalk />
        <Learned>
          No single tree is sure of anything; each adds a nudge worth a tenth of its vote. Together, 300 of them push a
          row from the starting 73.7% (the share of attacks in training) to a confident answer. The quiet spoofing row
          shows the weak spot: the trees pull it down from 73.7% to below the 50% alarm line, so it gets through.
        </Learned>
      </Section>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t pt-8">
        <p className="text-muted-foreground">Next: grading all 11 on the {int(data.n_test)} locked exam rows.</p>
        <Link href="/results/" className="notch mono-label inline-flex h-10 items-center bg-ink px-5 text-white hover:bg-graphite">
          Step 5: see the results
        </Link>
      </div>
    </div>
  )
}
