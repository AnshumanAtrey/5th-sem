// bun run build — renders the six deliverables (and a combined report) to PDF from live data.
import { mkdirSync } from "node:fs";
import { launch } from "./lib/cdp";
import { collect } from "./lib/data";
import { page, resetCounters } from "./lib/layout";
import { d0 } from "./content/d0-index";
import { d1 } from "./content/d1-whitebox";
import { d2 } from "./content/d2-srs";
import { d3 } from "./content/d3-design";
import { d4 } from "./content/d4-audit";
import { d5 } from "./content/d5-plan";
import { d6 } from "./content/d6-maintenance";

const OUT = `${import.meta.dir}/out`;
const DELIV = `${import.meta.dir}/../../deliverables`;
mkdirSync(OUT, { recursive: true });
mkdirSync(DELIV, { recursive: true });

const only = process.argv.slice(2);
const t0 = performance.now();
const data = await collect();
console.log(`data collected (${data.tests.total} tests, ${data.total} applications) in ${((performance.now() - t0) / 1000).toFixed(1)}s`);

const DOCS = [
  { file: "D0-Submission-Index", make: d0 },
  { file: "D1-White-Box-Test-Report", make: (d: any) => d1(d) },
  { file: "D2-Software-Requirements-Specification", make: d2 },
  { file: "D3-Design-Pack", make: d3 },
  { file: "D4-Audit-Specification", make: d4 },
  { file: "D5-Project-Plan", make: d5 },
  { file: "D6-Maintenance-Process", make: d6 },
];

const browser = await launch();
const WEB = process.env.WEB_URL ?? "http://localhost:3001";
const SHOTS = [
  ["overview", "/"], ["job", "/jobs/1"], ["criteria", "/jobs/1?tab=criteria"], ["application", "/applications/412"],
  ["audit", "/audit?scope=1"], ["parsing", "/parsing"], ["compare", "/compare"], ["review", "/review"], ["decisions", "/decisions"],
] as const;
const shots: Record<string, string> = {};
try {
  const up = await fetch(WEB).then((r) => r.ok).catch(() => false);
  if (up && !process.env.NO_SHOTS) {
    mkdirSync(`${OUT}/shots`, { recursive: true });
    for (const [name, path] of SHOTS) {
      const file = `${OUT}/shots/${name}.png`;
      await browser.screenshot(`${WEB}${path}`, file, { setup: "localStorage.setItem('theme','light')", wait: name === "application" ? 3500 : 2200 });
      shots[name] = file;
    }
    console.log(`screenshots: ${Object.keys(shots).length}`);
  } else console.log(`web app not reachable at ${WEB} — building without screenshots`);
  for (const doc of DOCS) {
    if (only.length && !only.some((o) => doc.file.startsWith(o))) continue;
    resetCounters();
    const spec = doc.make(data, shots);
    const html = `${OUT}/${doc.file}.html`;
    await Bun.write(html, page(spec));
    await browser.pdf(`file://${html}`, `${DELIV}/${doc.file}.pdf`, `HireSense · ${spec.id} ${spec.title} · Case Study 31`);
    console.log(`✓ ${doc.file}.pdf`);
  }
} finally {
  await browser.close();
}

// one combined PDF for submission (D0 first)
if (!only.length) {
  const files = DOCS.map((d) => `${DELIV}/${d.file}.pdf`);
  const out = `${DELIV}/HireSense-Case-Study-31-All-Deliverables.pdf`;
  const r = Bun.spawnSync(["qpdf", "--empty", "--pages", ...files, "--", out]);
  console.log(r.exitCode === 0 ? `✓ ${out.split("/").pop()}` : `combined PDF skipped (qpdf missing): ${r.stderr}`);
}
