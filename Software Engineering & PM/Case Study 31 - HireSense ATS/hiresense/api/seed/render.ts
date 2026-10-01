// Résumé PDF templates. "Hard" templates reproduce the real-world layouts that make the legacy
// parser fail silently: scanned/outlined (no text layer), two-column, non-standard headings, odd dates.
import * as fontkit from "fontkit";
import PDFDocument from "pdfkit";
import { label, type CaseType, type Job, type Profile } from "./people";
import type { Rng } from "./rng";

const FONT_DIR = `${import.meta.dir}/../node_modules/@fontsource/`;
const FILES: Record<string, string> = {
  Inter: `${FONT_DIR}inter/files/inter-latin-400-normal.woff`,
  "Inter-Semi": `${FONT_DIR}inter/files/inter-latin-600-normal.woff`,
  "Inter-Bold": `${FONT_DIR}inter/files/inter-latin-700-normal.woff`,
  Merri: `${FONT_DIR}merriweather/files/merriweather-latin-400-normal.woff`,
  "Merri-Bold": `${FONT_DIR}merriweather/files/merriweather-latin-700-normal.woff`,
};
const FK: Record<string, any> = Object.fromEntries(Object.entries(FILES).map(([k, p]) => [k, fontkit.openSync(p)]));

const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const SEASON = (m: number) => (m < 3 ? "Winter" : m < 6 ? "Spring" : m < 9 ? "Summer" : "Autumn");

type DateStyle = "standard" | "slash_arrow" | "apostrophe" | "since_dotted" | "seasons";

function fmtRange(j: Job, style: DateStyle): string {
  const [sy, sm] = j.start;
  const e = j.end;
  switch (style) {
    case "standard":
      return `${MON[sm]} ${sy} – ${e === "present" ? "Present" : `${MON[e[1]]} ${e[0]}`}`;
    case "slash_arrow":
      return `${sy}/${String(sm + 1).padStart(2, "0")} -> ${e === "present" ? "now" : `${e[0]}/${String(e[1] + 1).padStart(2, "0")}`}`;
    case "apostrophe":
      return `’${String(sy).slice(2)} – ${e === "present" ? "now" : `’${String(e[0]).slice(2)}`}`;
    case "since_dotted":
      return e === "present" ? `Since ${MON[sm]} ${sy}` : `${String(sm + 1).padStart(2, "0")}.${sy} - ${String(e[1] + 1).padStart(2, "0")}.${e[0]}`;
    case "seasons":
      return `${SEASON(sm)} ${sy} – ${e === "present" ? "today" : `${SEASON(e[1])} ${e[0]}`}`;
  }
}

class Writer {
  constructor(readonly doc: PDFKit.PDFDocument, readonly outline: boolean) {
    for (const [k, p] of Object.entries(FILES)) doc.registerFont(k, p);
  }
  width(t: string, f: string, size: number, spacing = 0): number {
    const fk = FK[f];
    if (fk) return (fk.layout(t).advanceWidth * size) / fk.unitsPerEm + spacing * t.length;
    return this.doc.font(f).fontSize(size).widthOfString(t) + spacing * t.length;
  }
  text(t: string, x: number, y: number, f: string, size: number, color = "#111111", spacing = 0) {
    if (!this.outline) {
      this.doc.font(f).fontSize(size).fillColor(color).text(t, x, y, { lineBreak: false, characterSpacing: spacing });
      return;
    }
    // Draw glyph outlines instead of text: looks identical, but the PDF has no text layer.
    const fk = FK[f]!;
    const run = fk.layout(t);
    const s = size / fk.unitsPerEm;
    const base = y + fk.ascent * s;
    let cx = x;
    run.glyphs.forEach((g: any, i: number) => {
      const d = g.path.toSVG();
      if (d) {
        this.doc.save().translate(cx, base).scale(s, -s).path(d).fill(color).restore();
      }
      cx += run.positions[i].xAdvance * s + spacing;
    });
  }
  wrap(t: string, f: string, size: number, maxW: number): string[] {
    const out: string[] = [];
    let line = "";
    for (const word of t.split(/\s+/)) {
      const next = line ? `${line} ${word}` : word;
      if (line && this.width(next, f, size) > maxW) {
        out.push(line);
        line = word;
      } else line = next;
    }
    if (line) out.push(line);
    return out;
  }
}

interface Theme {
  regular: string;
  bold: string;
  accent: string;
  headingSpacing: number;
}

interface Opts {
  theme: Theme;
  headings: { summary: string; skills: string; experience: string; education: string };
  dateStyle: DateStyle;
}

const STD_HEADINGS = { summary: "SUMMARY", skills: "SKILLS", experience: "EXPERIENCE", education: "EDUCATION" };
const CREATIVE_SKILLS = ["Toolbox", "Tech Stack", "What I Work With", "Stuff I'm Good At"];
const CREATIVE_EXPERIENCE = ["Where I've Worked", "Journey", "Career History", "Things I've Done"];

/** Single-column layout shared by the classic, modern, creative, odd-date and scanned variants. */
function singleColumn(w: Writer, p: Profile, o: Opts) {
  const { theme: t, headings: h } = o;
  const L = 50;
  const W = 495;
  let y = 48;
  const need = (dy: number) => {
    if (y + dy > 795) {
      w.doc.addPage();
      y = 50;
    }
  };

  w.text(p.name, L, y, t.bold, 22);
  y += 30;
  w.text(p.headline, L, y, t.regular, 11, t.accent);
  y += 17;
  w.text(`${p.city}, India  ·  ${p.email}  ·  ${p.phone}`, L, y, t.regular, 9, "#555555");
  y += 26;

  const heading = (s: string) => {
    need(40);
    w.text(s, L, y, t.bold, 10, t.accent, t.headingSpacing);
    y += 14;
    w.doc.moveTo(L, y).lineTo(L + W, y).lineWidth(0.5).strokeColor("#cccccc").stroke();
    y += 8;
  };
  const para = (s: string, f = t.regular, size = 9.5, color = "#222222", indent = 0) => {
    for (const line of w.wrap(s, f, size, W - indent)) {
      need(14);
      w.text(line, L + indent, y, f, size, color);
      y += size + 4;
    }
  };

  heading(h.summary);
  para(p.summary);
  y += 8;

  heading(h.skills);
  para(p.skills.map(label).join(", "));
  y += 8;

  if (p.jobs.length) {
    heading(h.experience);
    for (const j of p.jobs) {
      need(50);
      w.text(`${j.title} — ${j.company}`, L, y, t.bold, 10.5);
      y += 15;
      w.text(fmtRange(j, o.dateStyle), L, y, t.regular, 9, "#666666");
      y += 14;
      for (const b of j.bullets) {
        const lines = w.wrap(b, t.regular, 9.5, W - 14);
        lines.forEach((line, i) => {
          need(14);
          if (i === 0) w.text("•", L + 2, y, t.regular, 9.5, "#444444");
          w.text(line, L + 14, y, t.regular, 9.5, "#222222");
          y += 13.5;
        });
      }
      y += 8;
    }
  }

  heading(h.education);
  w.text(`${p.degree} — ${p.university}`, L, y, t.bold, 10);
  y += 15;
  w.text(`${p.gradYear - 4} – ${p.gradYear}`, L, y, t.regular, 9, "#666666");
}

/**
 * Two-column layout written row by row across both columns — the way many design tools export.
 * A reader that ignores x-positions merges the sidebar and main column into garbled lines.
 */
function twoColumn(w: Writer, p: Profile) {
  const t = { regular: "Inter", bold: "Inter-Bold", accent: "#0f766e" };
  w.doc.rect(0, 0, 200, 842).fill("#f1f5f4");
  w.text(p.name, 50, 44, t.bold, 22);
  w.text(`${p.headline}  ·  ${p.city}, India  ·  ${p.email}  ·  ${p.phone}`, 50, 74, t.regular, 9, "#555555");

  type Row = { s: string; f: string; size: number; color?: string };
  const left: Row[] = [];
  const right: Row[] = [];
  const LW = 130;
  const RW = 320;
  const push = (rows: Row[], s: string, f: string, size: number, width: number, color?: string) => {
    for (const line of w.wrap(s, f, size, width)) rows.push({ s: line, f, size, color });
  };

  left.push({ s: "SKILLS", f: t.bold, size: 9.5, color: t.accent });
  for (const s of p.skills) left.push({ s: label(s), f: t.regular, size: 9 });
  left.push({ s: "", f: t.regular, size: 9 });
  left.push({ s: "EDUCATION", f: t.bold, size: 9.5, color: t.accent });
  push(left, p.degree, t.regular, 9, LW);
  push(left, p.university, t.regular, 9, LW);
  left.push({ s: `${p.gradYear - 4} – ${p.gradYear}`, f: t.regular, size: 9, color: "#666666" });
  left.push({ s: "", f: t.regular, size: 9 });
  left.push({ s: "LANGUAGES", f: t.bold, size: 9.5, color: t.accent });
  left.push({ s: "English, Hindi", f: t.regular, size: 9 });

  right.push({ s: "SUMMARY", f: t.bold, size: 9.5, color: t.accent });
  push(right, p.summary, t.regular, 9, RW);
  right.push({ s: "", f: t.regular, size: 9 });
  if (p.jobs.length) {
    right.push({ s: "EXPERIENCE", f: t.bold, size: 9.5, color: t.accent });
    for (const j of p.jobs) {
      push(right, `${j.title} — ${j.company}`, t.bold, 9.5, RW);
      right.push({ s: fmtRange(j, "standard"), f: t.regular, size: 8.5, color: "#666666" });
      for (const b of j.bullets) push(right, `• ${b}`, t.regular, 9, RW);
      right.push({ s: "", f: t.regular, size: 9 });
    }
  }

  const rows = Math.min(52, Math.max(left.length, right.length));
  for (let i = 0; i < rows; i++) {
    const y = 110 + i * 13.5;
    const l = left[i];
    const r = right[i];
    if (l?.s) w.text(l.s, 50, y, l.f, l.size, l.color);
    if (r?.s) w.text(r.s, 225, y, r.f, r.size, r.color);
  }
}

export function renderResume(p: Profile, r: Rng): Promise<Buffer> {
  return new Promise((resolve) => {
    const doc = new PDFDocument({ size: "A4", margin: 0, info: { Title: `${p.name} — Résumé`, Author: p.name } });
    const chunks: Buffer[] = [];
    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));

    const classic: Theme = { regular: "Helvetica", bold: "Helvetica-Bold", accent: "#1f2937", headingSpacing: 0.5 };
    const modern: Theme = { regular: "Inter", bold: "Inter-Semi", accent: r.pick(["#2563eb", "#7c3aed", "#0f766e", "#b45309"]), headingSpacing: 0 };
    const serif: Theme = { regular: "Merri", bold: "Merri-Bold", accent: "#7f1d1d", headingSpacing: 0 };
    const kind: CaseType = p.caseType;

    if (kind === "two_column") twoColumn(new Writer(doc, false), p);
    else if (kind === "scanned") {
      // Paper tint, speckle and a slight skew, then every glyph drawn as a vector outline.
      doc.rect(0, 0, 595, 842).fill("#f5f3ee");
      for (let i = 0; i < 260; i++) doc.circle(r.int(0, 595), r.int(0, 842), r.next() * 0.9).fill(r.pick(["#d6d3cb", "#c9c5bb", "#e1ded6"]));
      doc.save().rotate(r.normal(0, 0.35), { origin: [297, 421] });
      singleColumn(new Writer(doc, true), p, { theme: { ...modern, accent: "#333333" }, headings: STD_HEADINGS, dateStyle: "standard" });
      doc.restore();
    } else if (kind === "creative_headings")
      singleColumn(new Writer(doc, false), p, {
        theme: serif,
        headings: { summary: "About Me", skills: r.pick(CREATIVE_SKILLS), experience: r.pick(CREATIVE_EXPERIENCE), education: "Academics" },
        dateStyle: "standard",
      });
    else if (kind === "odd_dates")
      singleColumn(new Writer(doc, false), p, {
        theme: r.chance(0.5) ? classic : modern,
        headings: STD_HEADINGS,
        dateStyle: r.weighted<DateStyle>([["slash_arrow", 3], ["apostrophe", 3], ["since_dotted", 3], ["seasons", 1]]),
      });
    else singleColumn(new Writer(doc, false), p, { theme: r.chance(0.5) ? classic : modern, headings: STD_HEADINGS, dateStyle: "standard" });

    doc.end();
  });
}
