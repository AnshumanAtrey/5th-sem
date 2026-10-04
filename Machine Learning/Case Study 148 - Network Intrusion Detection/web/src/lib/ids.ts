// The intrusion detector, in the browser: the exact maths of the trained sklearn pipeline (clean -> median fill ->
// log(1 + x) -> standardise -> gradient-boosted trees), read from public/model.json. tests/ids.test.ts checks it
// against sklearn's own predictions on 300 real test flows.
import { asset } from "./base"

export type Tree = {
  feature: number[]
  threshold: number[]
  left: number[]
  right: number[]
  leaf: number[]
  value: number[]
  missingLeft: number[]
}

export type Booster = { baseline: number[]; trees: Tree[][]; classes: string[] }

export type Model = {
  features: string[]
  leaky: string[]
  prep: { median: number[]; mean: number[]; scale: number[] }
  binary: Booster
  family: Booster
}

export type Flow = Record<string, unknown>

export type Verdict = {
  intrusion: number // probability, 0..1
  family: { name: string; p: number }[] // all 8 families, most likely first
  attackFamily: string // the most likely attack family (never "Benign")
  badCells: number // values that were missing, text, negative or infinite and got the training median
}

let cached: Promise<Model> | null = null

export function loadModel(): Promise<Model> {
  cached ??= fetch(asset("/model.json")).then((r) => {
    if (!r.ok) throw new Error(`could not load the model (${r.status})`)
    return r.json() as Promise<Model>
  })
  return cached
}

/** A cell as a number the model can use, or NaN when it is blank, text, negative or infinite. */
export function toNumber(value: unknown): number {
  if (typeof value !== "number" && typeof value !== "string") return NaN // null, undefined, booleans, objects
  if (typeof value === "string" && value.trim() === "") return NaN
  const n = Number(value)
  return Number.isFinite(n) && n >= 0 ? n : NaN
}

function prepare(model: Model, flow: Flow): { x: number[]; bad: number } {
  const { median, mean, scale } = model.prep
  let bad = 0
  const x = model.features.map((name, j) => {
    let v = toNumber(flow[name])
    if (Number.isNaN(v)) {
      bad += 1
      v = median[j]
    }
    return (Math.log1p(v) - mean[j]) / scale[j]
  })
  return { x, bad }
}

function treeValue(t: Tree, x: number[]): number {
  let node = 0
  while (!t.leaf[node]) {
    const v = x[t.feature[node]]
    const left = Number.isNaN(v) ? t.missingLeft[node] === 1 : v <= t.threshold[node]
    node = left ? t.left[node] : t.right[node]
  }
  return t.value[node]
}

function raw(b: Booster, x: number[]): number[] {
  const out = [...b.baseline]
  for (const round of b.trees) round.forEach((t, k) => (out[k] += treeValue(t, x)))
  return out
}

export function predict(model: Model, flow: Flow): Verdict {
  const { x, bad } = prepare(model, flow)
  const intrusion = 1 / (1 + Math.exp(-raw(model.binary, x)[0]))
  const r = raw(model.family, x)
  const top = Math.max(...r)
  const e = r.map((v) => Math.exp(v - top))
  const sum = e.reduce((a, b) => a + b, 0)
  const family = model.family.classes.map((name, k) => ({ name, p: e[k] / sum })).sort((a, b) => b.p - a.p)
  const attackFamily = family.find((f) => f.name !== "Benign")!.name
  return { intrusion, family, attackFamily, badCells: bad }
}

/** Feature columns a CSV is missing (extra columns are fine). */
export function missingColumns(model: Model, columns: string[]): string[] {
  const have = new Set(columns.map((c) => c.trim()))
  return model.features.filter((f) => !have.has(f))
}
