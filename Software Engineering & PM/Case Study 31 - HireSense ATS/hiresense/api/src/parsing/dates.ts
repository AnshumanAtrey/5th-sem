// Employment date-range parsing → total years of (non-overlapping) experience.

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
const MON = `(?:${MONTHS.join("|")})[a-z]*\\.?`;
const NOW = `(?:present|current|now|till date|to date|ongoing)`;
// includes − (U+2212) and ‒ (U+2012): OCR engines often emit these for a printed en dash
const DASH = `\\s*(?:-|–|—|−|‒|to|→|->|until)\\s*`;

export interface Range {
  start: number; // months since year 0
  end: number;
}

const ym = (y: number, m: number) => y * 12 + m;
const year2 = (s: string) => {
  const n = Number(s);
  return n < 100 ? (n > 50 ? 1900 + n : 2000 + n) : n;
};
const monIdx = (s: string) => MONTHS.indexOf(s.slice(0, 3).toLowerCase());

const PATTERNS: { re: RegExp; parse: (m: RegExpExecArray, now: number) => Range | null }[] = [
  {
    // Jan 2019 – Mar 2022 | January 2019 - Present
    // \s* not \s+: OCR often drops the space ("Sep2021- Jul2023")
    re: new RegExp(`(${MON})\\s*(\\d{4})${DASH}(?:(${MON})\\s*(\\d{4})|${NOW})`, "gi"),
    parse: (m, now) => ({ start: ym(+m[2]!, monIdx(m[1]!)), end: m[3] ? ym(+m[4]!, monIdx(m[3]!)) : now }),
  },
  {
    // 03/2019 – 06/2021 | 03.2019 - now
    re: new RegExp(`\\b(\\d{1,2})[/.](\\d{4})${DASH}(?:(\\d{1,2})[/.](\\d{4})|${NOW})`, "gi"),
    parse: (m, now) => ({ start: ym(+m[2]!, +m[1]! - 1), end: m[3] ? ym(+m[4]!, +m[3]! - 1) : now }),
  },
  {
    // 2019/03 → now | 2019-03 – 2021-06
    re: new RegExp(`\\b(\\d{4})[/-](\\d{1,2})${DASH}(?:(\\d{4})[/-](\\d{1,2})|${NOW})`, "gi"),
    parse: (m, now) => ({ start: ym(+m[1]!, +m[2]! - 1), end: m[3] ? ym(+m[3]!, +m[4]! - 1) : now }),
  },
  {
    // ’18 – ’22 | '18-now
    re: new RegExp(`['’‘](\\d{2})${DASH}(?:['’‘](\\d{2})|${NOW})`, "gi"),
    parse: (m, now) => ({ start: ym(year2(m[1]!), 0), end: m[2] ? ym(year2(m[2]!), 0) : now }),
  },
  {
    // Since Mar 2020 | since 2020
    re: new RegExp(`\\bsince\\s+(?:(${MON})\\s+)?(\\d{4})`, "gi"),
    parse: (m, now) => ({ start: ym(+m[2]!, m[1] ? monIdx(m[1]) : 0), end: now }),
  },
  {
    // 2019 – 2022 | 2019 - Present   (run last: year-only is the weakest signal)
    re: new RegExp(`\\b((?:19|20)\\d{2})${DASH}(?:((?:19|20)\\d{2})|${NOW})\\b`, "gi"),
    parse: (m, now) => ({ start: ym(+m[1]!, 0), end: m[2] ? ym(+m[2]!, 0) : now }),
  },
];

/** Find every date range in `text`; each character span is consumed by at most one pattern. */
export function findRanges(text: string, reference: Date): Range[] {
  const now = ym(reference.getFullYear(), reference.getMonth());
  const taken: [number, number][] = [];
  const out: Range[] = [];
  for (const { re, parse } of PATTERNS) {
    re.lastIndex = 0;
    for (let m; (m = re.exec(text)); ) {
      const a = m.index;
      const b = a + m[0].length;
      if (taken.some(([s, e]) => a < e && b > s)) continue;
      const r = parse(m, now);
      if (!r || r.end < r.start || r.start < ym(1970, 0) || r.end > now + 1) continue;
      taken.push([a, b]);
      out.push(r);
    }
  }
  return out;
}

/** Total years covered by the union of ranges (overlapping jobs are not double-counted). */
export function totalYears(ranges: Range[]): number {
  const sorted = [...ranges].sort((a, b) => a.start - b.start);
  let months = 0;
  let cur: Range | null = null;
  for (const r of sorted) {
    if (!cur || r.start > cur.end) {
      if (cur) months += cur.end - cur.start;
      cur = { ...r };
    } else cur.end = Math.max(cur.end, r.end);
  }
  if (cur) months += cur.end - cur.start;
  return Math.round((months / 12) * 10) / 10;
}
