// Print-grade HTML shell for the deliverables: A4, Inter, quiet tables, Mermaid diagrams.
import { pathToFileURL } from "node:url";

const ROOT = `${import.meta.dir}/..`;
const font = (w: number) => pathToFileURL(`${ROOT}/../api/node_modules/@fontsource/inter/files/inter-latin-${w}-normal.woff2`).href;
const MERMAID = pathToFileURL(`${ROOT}/node_modules/mermaid/dist/mermaid.min.js`).href;

export const META = {
  project: "HireSense",
  caseStudy: "Case Study 31 — Applicant Tracking System with a Bias Audit Requirement",
  course: "Software Engineering & Project Management",
  programme: "B.Tech CSE · Batch 2024–28 · Semester V",
  institute: "ITM Skills University",
  author: "Anshuman Atrey",
  roll: "150096724029",
  date: "1 October 2026",
  version: "1.0",
};

export const esc = (s: unknown) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Table from rows; cells are trusted HTML (callers escape user data with esc()). */
export function table(head: string[], rows: (string | number)[][], opts: { cls?: string; widths?: string[]; caption?: string } = {}) {
  const cols = opts.widths ? `<colgroup>${opts.widths.map((w) => `<col style="width:${w}">`).join("")}</colgroup>` : "";
  return `<table class="tbl ${opts.cls ?? ""}">${cols}<thead><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows
    .map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`)
    .join("")}</tbody></table>${opts.caption ? `<p class="caption">${opts.caption}</p>` : ""}`;
}

let figN = 0;
let tabN = 0;
export const resetCounters = () => ((figN = 0), (tabN = 0));
export const figure = (body: string, caption: string, cls = "") => `<figure class="${cls}">${body}<figcaption><b>Figure ${++figN}.</b> ${caption}</figcaption></figure>`;
export const tcap = (caption: string) => `<p class="tcap"><b>Table ${++tabN}.</b> ${caption}</p>`;
export const mermaid = (src: string, caption: string, cls = "") => figure(`<pre class="mermaid">${esc(src)}</pre>`, caption, cls);
export const note = (html: string, kind: "info" | "key" | "warn" = "info") => `<div class="note ${kind}">${html}</div>`;
export const kpis = (items: [string, string, string?][]) =>
  `<div class="kpis">${items.map(([l, v, h]) => `<div class="kpi"><div class="kl">${l}</div><div class="kv">${v}</div>${h ? `<div class="kh">${h}</div>` : ""}</div>`).join("")}</div>`;
export const pill = (text: string, tone: "ok" | "warn" | "bad" | "info" | "muted" = "muted") => `<span class="pill ${tone}">${text}</span>`;
export const code = (s: string) => `<pre class="code">${esc(s)}</pre>`;
export const img = (file: string, alt: string) => `<img class="shot" src="${pathToFileURL(file).href}" alt="${esc(alt)}">`;

export function page({ id, title, subtitle, purpose, body }: { id: string; title: string; subtitle: string; purpose: string; body: string }) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${esc(`${id} ${title}`)} — HireSense</title>
<style>
@font-face{font-family:Inter;font-weight:400;src:url(${font(400)})}
@font-face{font-family:Inter;font-weight:500;src:url(${font(500)})}
@font-face{font-family:Inter;font-weight:600;src:url(${font(600)})}
@font-face{font-family:Inter;font-weight:700;src:url(${font(700)})}
@page{size:A4;margin:16mm 16mm 15mm 16mm}
:root{--fg:#17191c;--mid:#4b5059;--mute:#80858f;--line:#e3e5e8;--soft:#f5f6f8;--ok:#1f8a5b;--warn:#b7791f;--bad:#c2410c;--info:#2f5bd3}
*{box-sizing:border-box}
html{-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{margin:0;font:400 9.4pt/1.52 Inter,system-ui,sans-serif;color:var(--fg);font-feature-settings:"cv11"}
.kv,.r,td.n{font-variant-numeric:tabular-nums}
p{margin:0 0 7pt}
a{color:inherit}
b,strong{font-weight:600}
h1{font-size:16pt;font-weight:600;letter-spacing:-.01em;margin:0 0 4pt;padding-top:2pt;break-after:avoid}
h1 .num{color:var(--mute);font-weight:500;margin-right:6pt}
section.chap{break-before:auto;margin-top:16pt}
section.chap.brk{break-before:page}
h2{font-size:11.6pt;font-weight:600;margin:14pt 0 5pt;break-after:avoid}
h3{font-size:9.8pt;font-weight:600;margin:10pt 0 3pt;break-after:avoid}
.lead{color:var(--mid);font-size:10pt;margin-bottom:10pt}
ul,ol{margin:0 0 7pt;padding-left:15pt}li{margin:1.5pt 0}
.tbl{width:100%;border-collapse:collapse;margin:4pt 0 9pt;font-size:8.3pt;line-height:1.4;break-inside:auto}
.tbl th{text-align:left;font-weight:600;color:var(--mid);font-size:7.4pt;text-transform:uppercase;letter-spacing:.04em;border-bottom:1px solid #c9ccd1;padding:4pt 6pt 4pt 0;vertical-align:bottom}
.tbl td{border-bottom:1px solid var(--line);padding:4pt 6pt 4pt 0;vertical-align:top}
.tbl tr{break-inside:avoid}
.tbl.dense td{padding:2.6pt 6pt 2.6pt 0}
.tbl td.r,.tbl th.r{text-align:right}
.tbl.nw1 td:first-child{white-space:nowrap}
.mono,code{font-family:"SF Mono",Menlo,Consolas,monospace;font-size:.9em}
code{background:var(--soft);padding:0 2.5pt;border-radius:3px}
pre.code{font:7.6pt/1.5 "SF Mono",Menlo,monospace;background:var(--soft);border:1px solid var(--line);border-radius:6px;padding:7pt 9pt;white-space:pre-wrap;margin:4pt 0 9pt;break-inside:avoid}
.caption,.tcap{font-size:7.8pt;color:var(--mute);margin:-4pt 0 10pt}
.tcap{margin:6pt 0 2pt;color:var(--mid)}
figure{margin:8pt 0 12pt;break-inside:avoid;text-align:center}
figure>*:first-child{margin:0 auto}
figcaption{font-size:7.8pt;color:var(--mute);margin-top:5pt;text-align:center}
figure.left{text-align:left}
pre.mermaid{background:none;margin:0 auto;font-size:11px}
pre.mermaid svg{max-width:100%!important;height:auto;max-height:200mm}
.tall pre.mermaid svg{max-height:225mm}
.note{border:1px solid var(--line);border-left:3px solid var(--info);background:#f7f9ff;border-radius:5px;padding:7pt 10pt;margin:6pt 0 10pt;break-inside:avoid}
.note.key{border-left-color:var(--fg);background:var(--soft)}
.note.warn{border-left-color:var(--warn);background:#fffaf0}
.note p:last-child{margin:0}
.kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:6pt;margin:6pt 0 12pt;break-inside:avoid}
.kpi{border:1px solid var(--line);border-radius:6px;padding:7pt 9pt}
.kl{font-size:7.4pt;color:var(--mute);text-transform:uppercase;letter-spacing:.04em}
.kv{font-size:15pt;font-weight:600;letter-spacing:-.01em;margin-top:1pt}
.kh{font-size:7.6pt;color:var(--mid)}
.pill{display:inline-block;border:1px solid var(--line);border-radius:99px;padding:0 5pt;font-size:7.4pt;font-weight:500;white-space:nowrap}
.pill.ok{color:var(--ok);border-color:#bfe3d1}.pill.warn{color:var(--warn);border-color:#f0d9a8}.pill.bad{color:var(--bad);border-color:#f3c6b0}.pill.info{color:var(--info);border-color:#c8d4f6}
.cols{display:grid;grid-template-columns:1fr 1fr;gap:12pt}
.cols>*{min-width:0}
.row5{display:grid;grid-template-columns:repeat(5,1fr);gap:6pt;align-items:end}
.row5 figure{margin:0}
.steps{display:grid;grid-template-columns:repeat(7,1fr);gap:5pt;margin:8pt 0 6pt}
.step{border:1px solid var(--line);border-radius:6px;padding:6pt 7pt;position:relative;font-size:8pt}
.step span{display:inline-flex;width:14pt;height:14pt;border-radius:99px;background:var(--fg);color:#fff;font-size:7pt;font-weight:600;align-items:center;justify-content:center;margin-bottom:3pt}
.step b{display:block;font-size:8.6pt}
.step small{color:var(--mid);font-size:7.4pt;line-height:1.35;display:block}
.row3{display:grid;grid-template-columns:repeat(3,1fr);gap:8pt}
img.shot{width:100%;border:1px solid var(--line);border-radius:6px}
.req{font-family:"SF Mono",Menlo,monospace;font-size:7.8pt;font-weight:600;white-space:nowrap}
.muted{color:var(--mute)}
.toc{display:grid;grid-template-columns:1fr 1fr;column-gap:18pt;font-size:8.8pt;margin:4pt 0 0}
.toc .num{display:inline-block;width:16pt;color:var(--mute);font-weight:500}
.toc a{text-decoration:none;display:block;padding:1.5pt 0;border-bottom:1px dotted var(--line)}
.toc a.l2{padding-left:10pt;color:var(--mid);font-size:8.2pt}
/* cover */
.cover{height:262mm;display:flex;flex-direction:column;break-after:page}
.brand{display:flex;align-items:center;gap:7pt;font-weight:600;font-size:10pt}
.brand i{display:inline-flex;width:18pt;height:18pt;border-radius:4pt;background:var(--fg);color:#fff;font-style:normal;font-size:7pt;align-items:center;justify-content:center;font-weight:700}
.cover .doc-id{margin-top:58mm;font:600 9pt Inter;color:var(--mute);letter-spacing:.08em;text-transform:uppercase}
.cover h1.title{font-size:30pt;line-height:1.08;letter-spacing:-.025em;margin:6pt 0 8pt;font-weight:650}
.cover .sub{font-size:12pt;color:var(--mid);max-width:150mm}
.cover .purpose{margin-top:14pt;max-width:150mm;color:var(--mid)}
.cover .meta{margin-top:auto;display:grid;grid-template-columns:repeat(3,1fr);gap:10pt;border-top:1px solid var(--fg);padding-top:9pt;font-size:8.4pt}
.cover .meta div span{display:block;color:var(--mute);font-size:7.2pt;text-transform:uppercase;letter-spacing:.05em}
</style></head><body>
<div class="cover">
  <div class="brand"><i>HS</i>HireSense <span class="muted" style="font-weight:400">· ${esc(META.caseStudy)}</span></div>
  <div class="doc-id">${esc(id)} · Deliverable</div>
  <h1 class="title">${esc(title)}</h1>
  <div class="sub">${esc(subtitle)}</div>
  <p class="purpose">${purpose}</p>
  <div><h3 style="margin-top:16pt">Contents</h3><div class="toc" id="toc"></div></div>
  <div class="meta">
    <div><span>Author</span>${esc(META.author)}<br>Roll ${esc(META.roll)}</div>
    <div><span>Course</span>${esc(META.course)}<br>${esc(META.programme)}</div>
    <div><span>Document</span>${esc(id)} · v${esc(META.version)}<br>${esc(META.date)} · ${esc(META.institute)}</div>
  </div>
</div>
${body}
<script src="${MERMAID}"></script>
<script>
(async () => {
  // contents from section headings
  const toc = document.getElementById("toc");
  document.querySelectorAll("section.chap").forEach((s, i) => {
    const h = s.querySelector("h1"); if (!h) return;
    s.id = s.id || "s" + (i + 1);
    toc.insertAdjacentHTML("beforeend", '<a href="#' + s.id + '">' + h.innerHTML + "</a>");
  });
  mermaid.initialize({ startOnLoad: false, securityLevel: "loose", theme: "base", fontFamily: "Inter",
    themeVariables: { fontFamily: "Inter", fontSize: "12px", primaryColor: "#f5f6f8", primaryTextColor: "#17191c", primaryBorderColor: "#9aa0a8",
      lineColor: "#6b7079", secondaryColor: "#eef1f6", tertiaryColor: "#ffffff", noteBkgColor: "#fffaf0", noteBorderColor: "#e4c98b",
      actorBkg: "#f5f6f8", actorBorder: "#9aa0a8", signalColor: "#4b5059", labelBoxBkgColor: "#f5f6f8", clusterBkg: "#fafbfc", clusterBorder: "#d5d8dd",
      taskBkgColor: "#d9dee8", taskBorderColor: "#7f8794", activeTaskBkgColor: "#17191c", activeTaskBorderColor: "#17191c", critBkgColor: "#c2410c", critBorderColor: "#9a3412",
      doneTaskBkgColor: "#a7b3c6", gridColor: "#e3e5e8", sectionBkgColor: "#f5f6f8", altSectionBkgColor: "#ffffff", todayLineColor: "transparent" },
    flowchart: { curve: "basis", htmlLabels: true, padding: 10 }, gantt: { barHeight: 18, fontSize: 13, sectionFontSize: 13, leftPadding: 190, barGap: 6, topPadding: 40, gridLineStartPadding: 40, rightPadding: 40 },
    class: { hideEmptyMembersBox: true }, sequence: { mirrorActors: false, actorMargin: 40 } });
  try { await mermaid.run({ querySelector: ".mermaid" }); } catch (e) { document.body.insertAdjacentHTML("afterbegin", '<pre style="color:red">' + e + "</pre>"); }
  await document.fonts.ready;
  await Promise.all([...document.images].map((i) => i.complete ? 0 : new Promise((r) => (i.onload = i.onerror = r))));
  window.__docReady = true;
})();
</script></body></html>`;
}

/** A chapter: numbered section starting on a new page. */
export const chap = (num: string, title: string, body: string, lead?: string, brk = false) =>
  `<section class="chap${brk ? " brk" : ""}"><h1><span class="num">${num}</span>${esc(title)}</h1>${lead ? `<p class="lead">${lead}</p>` : ""}${body}</section>`;
