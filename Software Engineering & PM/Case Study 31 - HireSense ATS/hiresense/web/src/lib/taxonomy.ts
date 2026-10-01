import { api } from "./api";

export interface Taxonomy {
  skills: { id: string; label: string }[];
  cities: string[];
}

// The taxonomy is static for the life of the API process, so fetch it once per server process.
let cached: Promise<Taxonomy> | null = null;
export function taxonomy(): Promise<Taxonomy> {
  cached ??= api<Taxonomy>("/taxonomy").catch((e) => {
    cached = null;
    throw e;
  });
  return cached;
}

export async function skillLabels(): Promise<Record<string, string>> {
  const t = await taxonomy();
  return Object.fromEntries(t.skills.map((s) => [s.id, s.label]));
}
