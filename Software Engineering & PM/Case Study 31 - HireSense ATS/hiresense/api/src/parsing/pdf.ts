import { getDocumentProxy } from "unpdf";

export interface TextItem {
  str: string;
  x: number;
  y: number; // PDF user space: larger y = higher on the page
  w: number;
  h: number;
  page: number;
}

export interface PdfLayout {
  pages: { width: number; height: number; items: TextItem[] }[];
}

/** Text items in content-stream order, with positions. Empty for image-only / outlined PDFs. */
export async function extractLayout(bytes: Uint8Array): Promise<PdfLayout> {
  const pdf = await getDocumentProxy(new Uint8Array(bytes));
  const pages: PdfLayout["pages"] = [];
  for (let n = 1; n <= pdf.numPages; n++) {
    const page = await pdf.getPage(n);
    const { width, height } = page.getViewport({ scale: 1 });
    const tc = await page.getTextContent();
    const items: TextItem[] = [];
    for (const it of tc.items as any[]) {
      if (!it.str || !it.str.trim()) continue;
      items.push({ str: it.str, x: it.transform[4], y: it.transform[5], w: it.width, h: it.height || Math.abs(it.transform[3]), page: n });
    }
    pages.push({ width, height, items });
  }
  await (pdf as any).cleanup?.();
  return { pages };
}

/** Group items sharing a baseline into lines (in the order given). */
export function toLines(items: TextItem[]): { text: string; h: number; y: number }[] {
  const lines: { parts: TextItem[]; y: number; page: number }[] = [];
  for (const it of items) {
    const last = lines[lines.length - 1];
    if (last && last.page === it.page && Math.abs(last.y - it.y) < Math.max(2, it.h * 0.4)) last.parts.push(it);
    else lines.push({ parts: [it], y: it.y, page: it.page });
  }
  return lines.map((l) => {
    const parts = [...l.parts].sort((a, b) => a.x - b.x);
    let text = "";
    let end = -Infinity;
    for (const p of parts) {
      if (text && p.x > end + 0.5 && !text.endsWith(" ") && !p.str.startsWith(" ")) text += " ";
      text += p.str;
      end = p.x + p.w;
    }
    return { text: text.replace(/\s+/g, " ").trim(), h: Math.max(...parts.map((p) => p.h)), y: l.y };
  });
}

/**
 * Reading order: detect a two-column layout (a vertical gutter no body item crosses) and read
 * the left column fully before the right. Everything above the point where both columns have
 * started (the name / contact header) is read first; gutter-crossing items below it, last.
 */
export function readingOrder(layout: PdfLayout): TextItem[] {
  const out: TextItem[] = [];
  const byPos = (a: TextItem, b: TextItem) => b.y - a.y || a.x - b.x;
  for (const { width, items } of layout.pages) {
    const split = findGutter(items, width);
    if (split == null) {
      out.push(...[...items].sort(byPos));
      continue;
    }
    const crosses = (i: TextItem) => i.x < split - 1 && i.x + i.w > split + 1;
    const body = items.filter((i) => !crosses(i));
    const top = (xs: TextItem[]) => Math.max(...xs.map((i) => i.y));
    const columnsStart = Math.min(top(body.filter((i) => i.x < split)), top(body.filter((i) => i.x >= split)));
    const header = items.filter((i) => i.y > columnsStart + 1);
    const rest = items.filter((i) => i.y <= columnsStart + 1);
    out.push(
      ...header.sort(byPos),
      ...rest.filter((i) => !crosses(i) && i.x < split).sort(byPos),
      ...rest.filter((i) => !crosses(i) && i.x >= split).sort(byPos),
      ...rest.filter(crosses).sort(byPos),
    );
  }
  return out;
}

function findGutter(items: TextItem[], width: number): number | null {
  if (items.length < 10) return null;
  const chars = items.reduce((n, i) => n + i.str.length, 0);
  const candidates = [...new Set(items.map((i) => Math.round(i.x)))].filter((x) => x > width * 0.25 && x < width * 0.75);
  let best: { x: number; balance: number } | null = null;
  for (const s of candidates) {
    const crossing = items.filter((i) => i.x < s - 1 && i.x + i.w > s + 1);
    if (crossing.length > items.length * 0.1) continue;
    const left = items.filter((i) => i.x + i.w <= s + 1).reduce((n, i) => n + i.str.length, 0);
    const right = items.filter((i) => i.x >= s - 1).reduce((n, i) => n + i.str.length, 0);
    const balance = Math.min(left, right) / chars;
    // both sides must carry real text, and lines must actually sit side by side
    if (balance < 0.08) continue;
    if (!sideBySide(items, s)) continue;
    if (!best || balance > best.balance) best = { x: s, balance };
  }
  return best?.x ?? null;
}

/** True when several baselines hold text on both sides of `s` (a genuine two-column page). */
function sideBySide(items: TextItem[], s: number): boolean {
  const leftYs = new Set(items.filter((i) => i.x + i.w <= s + 1).map((i) => Math.round(i.y)));
  let shared = 0;
  for (const i of items) if (i.x >= s - 1 && leftYs.has(Math.round(i.y))) shared++;
  return shared >= 5;
}
