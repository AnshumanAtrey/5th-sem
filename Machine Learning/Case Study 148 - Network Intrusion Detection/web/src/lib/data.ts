// Everything the notebook measured, exported by scripts/export_model.py. No number on the site is typed by hand.
import raw from "@/data/app.json"

type Rate = number

export type ModelRow = {
  model: string
  module: string
  accuracy: Rate
  precision: Rate
  recall: Rate
  F1: Rate
  "missed attacks": number
  "false alarms": number
  "miss rate": Rate
  "false alarm rate": Rate
  "train s": number
  "score s": number
  "size MB": number
}

export type AppData = {
  counts: { label: string; family: string; full: number; sample: number }[]
  top_features: string[]
  examples: Record<string, Record<string, number>>
  thresholds: { threshold: number; recall: Rate; "false alarm rate": Rate }[]
  family_report: { family: string; precision: Rate; recall: Rate; F1: Rate; "test flows": number }[]
  unseen: {
    "family left out of training": string
    "caught when seen in training": Rate
    "caught when NEVER seen": Rate
    "false alarm rate on normal flows": Rate
    "K-Means detector (never saw ANY attack)": Rate
  }[]
  test: { recall: Rate; precision: Rate; "false alarm rate": Rate; "missed attacks": number; "false alarms": number }
  n_train: number
  n_test: number
  dataset: string
  results: {
    flows_full: number
    flows_sample: number
    flows_clean: number
    duplicates_dropped: number
    conflicts_dropped: number
    features: number
    kmeans_k: number
    pca_95: number
    best_recall_model: string
    family_accuracy: Rate
    family_macro_f1: Rate
    comparison: ModelRow[]
    iat_trap: Record<string, { "accuracy, naming all 34 labels": Rate; "macro F1": Rate }>
    cv: Record<string, Record<string, number>>
    by_family: Record<string, Record<string, Rate>>
    top_features: Record<string, Record<string, number>>
    hardest_types: { family: string; label: string; test_flows: number; missed: number; "miss rate": Rate }[]
    imbalance: Record<string, Record<string, Rate>>
  }
}

export const data = raw as unknown as AppData

export const FAMILIES = ["Benign", "DDoS", "DoS", "Mirai", "Recon", "Spoofing", "Web", "BruteForce"] as const

export const FAMILY_COLOR: Record<string, string> = {
  Benign: "var(--fam-benign)",
  DDoS: "var(--fam-ddos)",
  DoS: "var(--fam-dos)",
  Mirai: "var(--fam-mirai)",
  Recon: "var(--fam-recon)",
  Spoofing: "var(--fam-spoofing)",
  Web: "var(--fam-web)",
  BruteForce: "var(--fam-bruteforce)",
}

const WEB = new Set(["SqlInjection", "CommandInjection", "XSS", "BrowserHijacking", "Uploading_Attack", "Backdoor_Malware"])

/** The attack family of a CICIoT2023 label, the same mapping as src/flows.py. */
export function family(label: string): string {
  if (label === "BenignTraffic") return "Benign"
  if (WEB.has(label)) return "Web"
  if (label === "MITM-ArpSpoofing" || label === "DNS_Spoofing") return "Spoofing"
  if (label === "DictionaryBruteForce") return "BruteForce"
  if (label === "VulnerabilityScan" || label.startsWith("Recon-")) return "Recon"
  for (const f of ["DDoS", "DoS", "Mirai"]) if (label.startsWith(`${f}-`)) return f
  return "Unknown"
}

export const pct = (v: number, digits = 1) => `${(v * 100).toFixed(digits)}%`
export const int = (v: number) => Math.round(v).toLocaleString("en-IN")

/** What an alarm threshold (5..95) did on the locked test flows. */
export function atThreshold(t: number) {
  return data.thresholds.reduce((best, row) => (Math.abs(row.threshold - t) < Math.abs(best.threshold - t) ? row : best))
}
