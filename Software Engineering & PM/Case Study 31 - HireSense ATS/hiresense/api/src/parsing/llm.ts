// Optional small-model assist (Ollama). The model only EXTRACTS; it never decides.
// Every value it returns is grounded against the résumé text; anything not found there is dropped.
import { totalYears, type Range } from "./dates";
import { matchCity, matchSkills, mentionsCity } from "./taxonomy";

export const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";
export const MODEL = process.env.HIRESENSE_MODEL ?? "qwen3:1.7b";

const SCHEMA = {
  type: "object",
  properties: {
    skills: { type: "array", items: { type: "string" } },
    city: { type: ["string", "null"] },
    positions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          company: { type: "string" },
          start: { type: "string", description: "YYYY-MM" },
          end: { type: "string", description: "YYYY-MM or present" },
        },
        required: ["title", "company", "start", "end"],
      },
    },
  },
  required: ["skills", "city", "positions"],
};

const SYSTEM = `You extract facts from a résumé. Return JSON only.
- skills: technical and professional skills exactly as written in the résumé.
- city: the candidate's own city (from the contact line), or null.
- positions: every job. Convert any date wording to YYYY-MM (Winter→01, Spring→04, Summer→07, Autumn→10). Use "present" for current roles.
Never invent values that are not in the text.`;

export interface AiSuggestion {
  model: string;
  ms: number;
  skills: string[];
  location: string | null;
  yearsExperience: number | null;
  positions: { title: string; company: string; start: string; end: string; grounded: boolean }[];
  dropped: string[];
}

export async function ollamaAvailable(): Promise<boolean> {
  try {
    const r = await fetch(`${OLLAMA_URL}/api/tags`, { signal: AbortSignal.timeout(800) });
    if (!r.ok) return false;
    const { models } = (await r.json()) as { models: { name: string }[] };
    return models.some((m) => m.name === MODEL || m.name.startsWith(`${MODEL}:`));
  } catch {
    return false;
  }
}

export async function aiExtract(text: string, reference: Date): Promise<AiSuggestion> {
  const t0 = performance.now();
  const res = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    signal: AbortSignal.timeout(90_000),
    body: JSON.stringify({
      model: MODEL,
      stream: false,
      think: false,
      format: SCHEMA,
      options: { temperature: 0, num_ctx: 4096 },
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: text.slice(0, 6000) },
      ],
    }),
  });
  if (!res.ok) throw new Error(`ollama ${res.status}: ${await res.text()}`);
  const body = (await res.json()) as { message: { content: string } };
  const raw = JSON.parse(body.message.content) as { skills?: string[]; city?: string | null; positions?: any[] };

  const dropped: string[] = [];
  const inText = new Set(matchSkills(text));
  const skills = new Set<string>();
  for (const s of raw.skills ?? []) {
    const ids = matchSkills(s);
    if (!ids.length) dropped.push(`skill "${s}" (not in taxonomy)`);
    for (const id of ids) inText.has(id) ? skills.add(id) : dropped.push(`skill "${s}" (not found in résumé)`);
  }

  let location: string | null = raw.city ? matchCity(raw.city) : null;
  if (location && !mentionsCity(text, location)) {
    dropped.push(`city "${raw.city}" (not found in résumé)`);
    location = null;
  }

  // The model segments positions; converting its date wording to months is done here, deterministically.
  const nowM = reference.getFullYear() * 12 + reference.getMonth();
  const positions = (raw.positions ?? []).map((p) => {
    const start = String(p.start ?? "");
    const end = String(p.end ?? "");
    const s = toMonths(start, nowM);
    const e = toMonths(end, nowM);
    const year = start.match(/\d{4}/)?.[0];
    const company = String(p.company ?? "").trim();
    // a real position names an employer that appears in the résumé (blocks "N/A", headline-as-job, etc.)
    const companyOk = company.length >= 2 && text.toLowerCase().includes(company.toLowerCase());
    const grounded = s != null && e != null && !!year && text.includes(year) && companyOk;
    if (!grounded)
      dropped.push(
        `position "${p.title}" (${s == null || e == null ? `unreadable dates "${start} – ${end}"` : !companyOk ? `employer "${company}" not in résumé` : `year ${year} not in résumé`})`,
      );
    return { title: String(p.title ?? ""), company: String(p.company ?? ""), start, end, grounded, range: grounded ? { start: s!, end: e! } : null };
  });
  const ranges: Range[] = positions.flatMap((p) => (p.range && p.range.end >= p.range.start && p.range.end <= nowM + 1 ? [p.range] : []));

  return {
    model: MODEL,
    ms: Math.round(performance.now() - t0),
    skills: [...skills],
    location,
    yearsExperience: ranges.length ? totalYears(ranges) : null,
    positions: positions.map(({ range, ...p }) => p),
    dropped,
  };
}

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
const SEASONS: Record<string, number> = { winter: 0, spring: 3, summer: 6, autumn: 9, fall: 9 };

/** "2023-04" | "Apr 2023" | "Spring 2023" | "2023" | "present" → months since year 0. */
export function toMonths(s: string, now: number): number | null {
  const t = s.trim().toLowerCase();
  if (/^(present|current|now|today|ongoing)/.test(t)) return now;
  let m;
  if ((m = t.match(/^(\d{4})-(\d{1,2})/))) return +m[1]! * 12 + (+m[2]! - 1);
  if ((m = t.match(/(winter|spring|summer|autumn|fall)\s+(\d{4})/))) return +m[2]! * 12 + SEASONS[m[1]!]!;
  if ((m = t.match(/([a-z]{3})[a-z]*\.?\s+(\d{4})/)) && MONTHS.includes(m[1]!)) return +m[2]! * 12 + MONTHS.indexOf(m[1]!);
  if ((m = t.match(/^(\d{4})$/))) return +m[1]! * 12;
  return null;
}
