import type { Metadata } from "next"
import { PlannedTab } from "@/components/planned-tab"

export const metadata: Metadata = { title: "3 · Prepare" }

export default function Page() {
  return <PlannedTab light="Get the data ready" bold="for learning"
    intro="Models only understand clean numbers on a fair scale. These are the steps that get the data there."
    items={[
      "Taking a fair sample: 46.7 million rows down to 458,995, without losing the rare attacks",
      "Checking for junk: duplicates, empty cells, impossible values",
      "Turning the answers into numbers: normal = 0, attack = 1, and the 8 families",
      "Locking away a final exam: 114,749 rows no model sees while learning",
      "Putting every number on the same scale, with one row followed step by step",
    ]} />
}
