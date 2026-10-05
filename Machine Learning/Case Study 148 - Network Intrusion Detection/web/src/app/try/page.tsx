import type { Metadata } from "next"
import { Detector } from "@/components/detector/detector"
import { WordList } from "@/components/explain"
import { PageTitle } from "@/components/page-title"
import { TryTabs } from "@/components/try-tabs"
import { data, pct } from "@/lib/data"

export const metadata: Metadata = { title: "6 · Try it" }

export default function Page() {
  return (
    <div className="grid gap-8">
      <TryTabs />
      <PageTitle light="Check a network flow" bold="for intrusions">
        A gradient boosting model trained on {data.n_train.toLocaleString("en-IN")} flows from CICIoT2023, a real network of
        105 IoT devices attacked 33 ways in 2023. On flows it never saw, it catches {pct(data.test.recall, 2)} of attacks.
        It runs in your browser: nothing you enter leaves this page.
      </PageTitle>
      <WordList title="How to read this page" words={[
        { term: "Flow", means: "One row of the data: a summary of 10 or 100 packets between devices (speed, packet sizes, signals, protocol)." },
        { term: "The strip of 300 flows", means: "Real exam rows the model never learned from. Colour = what each really was; height = the model's intrusion score. Click one to load it." },
        { term: "Intrusion score", means: "The model's chance that the flow is an attack, from 0% to 100%." },
        { term: "Alarm threshold", means: "Where 'attack' starts: at or above it, the flow is called an intrusion. Default 50%; the slider moves it." },
        { term: "Attack family", means: "A second gradient boosting model, trained to name which of the 7 kinds of attack (or normal) a flow looks like." },
        { term: "Change a number", means: "Edit any value on the left and the verdict is worked out again instantly, by the same 300 trees, inside your browser." },
      ]} />
      <Detector />
    </div>
  )
}
