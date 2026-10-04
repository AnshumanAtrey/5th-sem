import type { Metadata } from "next"
import { PageTitle } from "@/components/page-title"
import { data, int, pct } from "@/lib/data"

export const metadata: Metadata = { title: "Data and method" }

export default function Page() {
  const r = data.results
  const trap = Object.entries(r.iat_trap).map(([name, v]) => ({ name, acc: v["accuracy, naming all 34 labels"] }))
  const iat = trap.find((t) => t.name.startsWith("IAT"))!
  const clean = trap.find((t) => t.name.startsWith("traffic"))!
  const best = r.comparison[0]
  const hardestTypes = r.hardest_types.slice(0, 4)
  const unseen = [...data.unseen].sort((a, b) => a["caught when NEVER seen"] - b["caught when NEVER seen"])
  const features = Object.keys(r.top_features).slice(0, 5)
  const weighted = r.imbalance["recall, balanced"]
  const plain = r.imbalance["recall, no weighting"]
  const nb = r.comparison.find((m) => m.model === "Naive Bayes")!
  const attackShare = 1 - data.family_report.find((f) => f.family === "Benign")!["test flows"] / data.n_test

  const steps = [
    ["Load", `${int(r.flows_full)} flows from the 169 CSV parts of CICIoT2023, captured in 2023 on a lab network of 105 real IoT devices.`],
    ["Sample fairly", `Every flow of the rare attacks, up to 12,000 of each big one, and 120,000 benign: ${int(r.flows_sample)} flows.`],
    ["Clean", `${int(r.duplicates_dropped)} exact duplicates and ${int(r.conflicts_dropped)} contradictory rows dropped before splitting, so no flow sits in both the training and the test set.`],
    ["Check for leaks", "One column, IAT, gives the answer away (below). It is removed from every model."],
    ["Lock the test set", `A stratified 75 / 25 split: ${int(data.n_train)} training flows, ${int(data.n_test)} test flows, ${r.features} features each.`],
    ["Prepare", "Fill gaps with the training median, take log(1 + x) to tame huge counts, standardise. Fitted on training flows only."],
    ["Train and compare", `All ${r.comparison.length} classifiers from the syllabus, scored on recall, precision, F1, accuracy and the confusion matrix, then 5-fold cross-validation.`],
    ["Deploy", "Gradient boosting exported to JSON and run in your browser with the same maths; a test checks it matches sklearn on 300 flows."],
  ]

  const answers = [
    ["Can machine learning tell normal and malicious traffic apart?", `Yes. The deployed model catches ${pct(data.test.recall, 2)} of attacks and flags ${pct(data.test["false alarm rate"], 2)} of normal flows on traffic it never saw.`],
    ["Which network features matter most?", `${features.join(", ")}: shuffling them hurts the model most (permutation importance).`],
    ["Which algorithm has the highest recall?", `${best.model}, ${pct(best.recall, 2)}, missing ${int(best["missed attacks"])} of the test attacks.`],
    ["Which attack categories are hardest?", `Reconnaissance and spoofing. The types missed most often: ${hardestTypes.map((t) => `${t.label} (${pct(t["miss rate"], 0)} missed)`).join(", ")}. They send a few ordinary-looking packets, not a flood; the floods are almost always caught.`],
    ["How does class imbalance affect the model?", `Accuracy misleads: ${pct(attackShare)} of test flows are attacks, so "always intrusion" already scores that, and naive bayes reaches ${pct(nb.precision)} precision while catching only ${pct(nb.recall)} of attacks. Class weighting does not raise macro F1 (${pct(plain["macro F1"])} vs ${pct(weighted["macro F1"])}); it moves recall to the rare families (brute force ${pct(plain.BruteForce, 0)} → ${pct(weighted.BruteForce, 0)}, web ${pct(plain.Web, 0)} → ${pct(weighted.Web, 0)}) at the cost of the big ones (DDoS ${pct(plain.DDoS, 0)} → ${pct(weighted.DDoS, 0)}).`],
    ["Can it detect previously unseen traffic?", `Partly. Retrained without a family, it still catches ${pct(unseen.at(-1)!["caught when NEVER seen"])} of ${unseen.at(-1)!["family left out of training"]} but only ${pct(unseen[0]["caught when NEVER seen"])} of ${unseen[0]["family left out of training"]}.`],
  ]

  return (
    <div className="grid max-w-3xl gap-14">
      <PageTitle light="How the detector" bold="was built">
          {data.dataset}: {int(r.flows_full)} labelled network flows, 33 attacks in 7 families (DDoS, DoS, Mirai botnet,
          reconnaissance, spoofing, web attacks, brute force) plus benign traffic.
      </PageTitle>

      <section className="grid gap-4">
        <h2 className="font-serif text-3xl font-light tracking-[-0.02em]">From raw capture to this page</h2>
        <ol className="grid gap-0 border-l">
          {steps.map(([title, body], i) => (
            <li key={title} className="relative grid gap-1 pb-5 pl-6 last:pb-0">
              <span className="absolute top-0.5 -left-3 grid size-6 place-items-center rounded-[2px] border bg-background font-mono text-xs tabular">{i + 1}</span>
              <span className="font-medium">{title}</span>
              <span className="text-muted-foreground">{body}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="grid gap-4">
        <h2 className="font-serif text-3xl font-light tracking-[-0.02em]">The column that knew too much</h2>
        <p className="text-muted-foreground">
          A decision tree naming all 34 labels, given different columns. One column alone scores {pct(iat.acc)}, against{" "}
          {pct(clean.acc)} for all {r.features} real traffic features together. IAT is meant to be the gap between packets, but in this dataset it tracks when in the capture a
          flow was recorded, and each attack ran in its own time window. So it identifies the recording session, not the
          traffic. On a live network a new attack happens at a new time, so the model never gets to see IAT.
        </p>
        <ul className="grid gap-3">
          {trap.map((t) => (
            <li key={t.name} className="grid grid-cols-[minmax(0,15rem)_1fr_4.5rem] items-center gap-3 text-sm">
              <span>{t.name}</span>
              <span className="h-2.5 rounded-[1px] bg-muted"><span className="block h-full rounded-[1px]" style={{ width: `${t.acc * 100}%`, background: t === iat ? "var(--orange)" : "var(--ink)" }} /></span>
              <span className="text-right font-mono tabular">{pct(t.acc)}</span>
            </li>
          ))}
        </ul>
        <p className="text-sm text-muted-foreground">Dropping it costs {pct(iat.acc - clean.acc)} of headline accuracy and buys a model that can work on traffic it was not recorded with.</p>
      </section>

      <section className="grid gap-4">
        <h2 className="font-serif text-3xl font-light tracking-[-0.02em]">The case study&apos;s six questions</h2>
        <dl className="grid gap-5">
          {answers.map(([q, a]) => (
            <div key={q} className="grid gap-1">
              <dt className="font-medium">{q}</dt>
              <dd className="text-muted-foreground">{a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="grid gap-4">
        <h2 className="font-serif text-3xl font-light tracking-[-0.02em]">Limitations</h2>
        <ul className="grid list-disc gap-2 pl-5 text-muted-foreground">
          <li>Lab traffic from one IoT testbed. A different network needs re-testing, ideally on its own captures.</li>
          <li>Each row summarises a window of packets, so the detector works on traffic summaries, not single packets.</li>
          <li>False alarms: {pct(data.test["false alarm rate"])} of normal flows are flagged at the default threshold. Raising it trades catch rate for fewer alarms (the slider on the detector shows exactly how much).</li>
          <li>The share of benign flows was set by our sampling. Real networks have far fewer attacks, which lowers precision for the same false-alarm rate.</li>
          <li>Attack families never seen in training are only partly caught. An anomaly detector alongside would help.</li>
          <li>One layer of defence, not a guarantee.</li>
        </ul>
      </section>
    </div>
  )
}
