import type { Metadata } from "next"
import { PlannedTab } from "@/components/planned-tab"

export const metadata: Metadata = { title: "2 · Explore" }

export default function Page() {
  return <PlannedTab light="Look at the data" bold="before trusting it"
    intro="Exploring the data (EDA) means counting and drawing it before building anything, to spot problems early."
    items={[
      "How the families differ: speed, size and duration side by side",
      "Which columns say the same thing (correlation), and why that matters",
      "Squeezing 45 numbers into a 2-D map (PCA): which attacks stand apart, which hide in normal traffic",
      "The family tree of all 34 labels (hierarchical clustering)",
      "The cheating column: how one number (IAT) gave the answer away, and why we threw it out",
    ]} />
}
