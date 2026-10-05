import type { Metadata } from "next"
import { PlannedTab } from "@/components/planned-tab"

export const metadata: Metadata = { title: "4 · Train" }

export default function Page() {
  return <PlannedTab light="Teach 11 models" bold="from the examples"
    intro="Every model taught in the course learns from the same 344,246 rows. Each gets one panel, opened one at a time."
    items={[
      "What 'training' means and where the code comes from (scikit-learn: a free library, not a formula we wrote)",
      "For each model: the problem it fixes, how it decides, the settings we chose, how it ran on our data",
      "From one decision tree to a forest: how random forest builds its 200 different trees",
      "Inside the deployed model: following one real row through gradient boosting's trees",
    ]} />
}
