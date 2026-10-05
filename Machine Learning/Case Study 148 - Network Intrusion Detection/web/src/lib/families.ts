// The normal traffic and the 7 attack families, in plain words. Row counts come from the data (counts in app.json).
import { data, FAMILIES } from "./data"

export type Family = {
  key: string
  name: string
  what: string // what it is
  how: string // how the lab produced it
  looks: string // how it tends to show up in the numbers
  example?: string // key of a real example row in app.json
}

export const FAMILY_STORIES: Family[] = [
  {
    key: "Benign", name: "Normal traffic", example: "Benign · BenignTraffic",
    what: "Everyday traffic with no attack going on: a camera streaming video, a smart plug checking in with its cloud, a speaker fetching music. Its label in the data is BenignTraffic (benign means harmless).",
    how: "Recorded while the devices were simply being used, with no attacker running.",
    looks: "A wide mix of packet sizes, and connections that last a while (half last over 25 seconds).",
  },
  {
    key: "DDoS", name: "DDoS: distributed denial of service", example: "DDoS · DDoS-PSHACK_Flood",
    what: "Many machines flood one target with junk traffic at the same time, until it can't answer real users.",
    how: "The attacker Raspberry Pis together, mostly with the hping3 flooding tool.",
    looks: "Tiny packets (about 55 bytes) in connections that last a split second. Surprisingly, not faster on average."
  },
  {
    key: "DoS", name: "DoS: denial of service", example: "DoS · DoS-UDP_Flood",
    what: "The same flooding idea, from a single machine.",
    how: "One attacker at a time, with hping3, udp-flood and an HTTP flooding tool.",
    looks: "Almost identical to DDoS, which is why telling DoS and DDoS apart is hard.",
  },
  {
    key: "Mirai", name: "Mirai botnet", example: "Mirai · Mirai-udpplain",
    what: "Mirai is real malware that hijacks smart devices and turns them into a flooding army. It took down big parts of the internet in 2016.",
    how: "The researchers ran an adapted copy of the real Mirai source code.",
    looks: "Every packet the same middle size (about 570 bytes), in very short connections."
  },
  {
    key: "Recon", name: "Recon: reconnaissance", example: "Recon · Recon-HostDiscovery",
    what: "Casing the house before breaking in: scanning to find which devices exist, which ports are open and which software they run.",
    how: "nmap, fping and a vulnerability scanner.",
    looks: "Small packets at normal-looking speeds, in long connections. Easy to confuse with normal traffic."
  },
  {
    key: "Spoofing", name: "Spoofing", example: "Spoofing · DNS_Spoofing",
    what: "Pretending to be someone else: fake ARP replies so traffic flows through the attacker (man-in-the-middle), or fake DNS answers that send you to the wrong address.",
    how: "ettercap.",
    looks: "On average it looks very much like normal traffic, which makes it one of the hardest to catch.",
  },
  {
    key: "Web", name: "Web attacks", example: "Web · Uploading_Attack",
    what: "Attacking a website through its forms and pages: SQL injection, cross-site scripting (XSS), command injection, malicious uploads, a backdoor, browser hijacking.",
    how: "A deliberately vulnerable test website (DVWA), BeEF for browser hijacking.",
    looks: "Long, slow connections with small packets. The rarest family in the data."
  },
  {
    key: "BruteForce", name: "Brute force", example: "BruteForce · DictionaryBruteForce",
    what: "Guessing a login password by trying words from a list, one after another.",
    how: "A dictionary attack: trying passwords from a word list.",
    looks: "Slow traffic with long-lasting connections and few packets per second.",
  },
]

/** Rows per family in the full dataset, biggest first. */
export const familyRows = FAMILIES.map((f) => ({
  family: FAMILY_STORIES.find((s) => s.key === f)!.name.split(":")[0],
  key: f,
  rows: data.counts.filter((c) => c.family === f).reduce((s, c) => s + c.full, 0),
})).sort((a, b) => b.rows - a.rows)
