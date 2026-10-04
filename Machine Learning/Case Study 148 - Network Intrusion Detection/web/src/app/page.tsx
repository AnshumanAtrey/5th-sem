import { Detector } from "@/components/detector/detector"
import { PageTitle } from "@/components/page-title"
import { data, pct } from "@/lib/data"

export default function Page() {
  return (
    <div className="grid gap-8">
      <PageTitle light="Check a network flow" bold="for intrusions">
        A gradient boosting model trained on {data.n_train.toLocaleString("en-IN")} flows from CICIoT2023, a real network of
        105 IoT devices attacked 33 ways in 2023. On flows it never saw, it catches {pct(data.test.recall, 2)} of attacks.
        It runs in your browser: nothing you enter leaves this page.
      </PageTitle>
      <Detector />
    </div>
  )
}
