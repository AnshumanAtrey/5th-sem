// The browser detector against sklearn: same flows, same probabilities (tests/parity.json comes from
// scripts/export_model.py, which reads the predictions straight from the trained sklearn pipelines).
import { describe, expect, test } from "bun:test"
import { missingColumns, predict, toNumber, type Model } from "../src/lib/ids"

const model: Model = await Bun.file(new URL("../public/model.json", import.meta.url)).json()
const parity: { flows: Record<string, number>[]; binary: number[]; family: number[][] } = await Bun.file(
  new URL("./parity.json", import.meta.url),
).json()

describe("matches sklearn", () => {
  test("intrusion probability on 300 real test flows", () => {
    parity.flows.forEach((flow, i) => expect(Math.abs(predict(model, flow).intrusion - parity.binary[i])).toBeLessThan(1e-9))
  })

  test("all 8 family probabilities on the same flows", () => {
    parity.flows.forEach((flow, i) => {
      const got = predict(model, flow).family
      model.family.classes.forEach((name, k) => {
        expect(Math.abs(got.find((f) => f.name === name)!.p - parity.family[i][k])).toBeLessThan(1e-9)
      })
    })
  })
})

describe("bad input", () => {
  const flow = parity.flows[0]

  test("text, blanks, negative and infinite values count as bad cells and still score", () => {
    const [a, b, c, d] = model.features
    const v = predict(model, { ...flow, [a]: "oops", [b]: "", [c]: -3, [d]: Infinity })
    expect(v.badCells).toBe(4)
    expect(v.intrusion).toBeGreaterThanOrEqual(0)
    expect(v.intrusion).toBeLessThanOrEqual(1)
  })

  test("a bad cell is treated exactly like the training median", () => {
    const name = model.features[5]
    const median = model.prep.median[5]
    expect(predict(model, { ...flow, [name]: "n/a" }).intrusion).toBe(predict(model, { ...flow, [name]: median }).intrusion)
  })

  test("numbers typed as text are fine", () => {
    const asText = Object.fromEntries(Object.entries(flow).map(([k, v]) => [k, String(v)]))
    expect(predict(model, asText).intrusion).toBe(predict(model, flow).intrusion)
    expect(predict(model, asText).badCells).toBe(0)
  })

  test("toNumber rejects what the model cannot use", () => {
    expect(toNumber("12.5")).toBe(12.5)
    expect(toNumber(0)).toBe(0)
    for (const bad of ["", "  ", "abc", -1, NaN, Infinity, null, undefined]) expect(Number.isNaN(toNumber(bad))).toBe(true)
  })

  test("missing columns are named, extra and leaky columns are ignored", () => {
    expect(missingColumns(model, [...model.features, "IAT", "label"])).toEqual([])
    expect(missingColumns(model, model.features.slice(2))).toEqual(model.features.slice(0, 2))
    expect(model.features).not.toContain("IAT")
  })
})

test("the verdict lists all 8 families, most likely first, and names an attack family", () => {
  const v = predict(model, parity.flows[1])
  expect(v.family).toHaveLength(8)
  expect(v.family[0].p).toBeGreaterThanOrEqual(v.family[7].p)
  expect(v.attackFamily).not.toBe("Benign")
  expect(v.family.reduce((s, f) => s + f.p, 0)).toBeCloseTo(1, 12)
})

test("the site's label -> family mapping matches src/flows.py for all 34 CICIoT2023 labels", async () => {
  const { family } = await import("../src/lib/data")
  const expected: Record<string, string[]> = {
    Benign: ["BenignTraffic"],
    DDoS: ["DDoS-ICMP_Flood", "DDoS-UDP_Flood", "DDoS-TCP_Flood", "DDoS-PSHACK_Flood", "DDoS-SYN_Flood", "DDoS-RSTFINFlood",
      "DDoS-SynonymousIP_Flood", "DDoS-ICMP_Fragmentation", "DDoS-ACK_Fragmentation", "DDoS-UDP_Fragmentation",
      "DDoS-HTTP_Flood", "DDoS-SlowLoris"],
    DoS: ["DoS-UDP_Flood", "DoS-TCP_Flood", "DoS-SYN_Flood", "DoS-HTTP_Flood"],
    Mirai: ["Mirai-greeth_flood", "Mirai-udpplain", "Mirai-greip_flood"],
    Spoofing: ["MITM-ArpSpoofing", "DNS_Spoofing"],
    Recon: ["Recon-HostDiscovery", "Recon-OSScan", "Recon-PortScan", "Recon-PingSweep", "VulnerabilityScan"],
    BruteForce: ["DictionaryBruteForce"],
    Web: ["SqlInjection", "BrowserHijacking", "CommandInjection", "Backdoor_Malware", "XSS", "Uploading_Attack"],
  }
  const labels = Object.values(expected).flat()
  expect(labels).toHaveLength(34)
  for (const [fam, list] of Object.entries(expected)) for (const label of list) expect(family(label)).toBe(fam)
})
