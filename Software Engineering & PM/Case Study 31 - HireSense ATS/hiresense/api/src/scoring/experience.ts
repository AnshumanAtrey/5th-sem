import type { Band } from "../types";

/** Score an experience value against configured bands. Unknown experience scores 0. */
export function bandScore(years: number | null, bands: Band[]): { score: number; band: Band | null } {
  if (years == null) return { score: 0, band: null };
  const band = bands.find((b) => years >= b.min && years < b.max) ?? null;
  return { score: band?.score ?? 0, band };
}

export function formatBand(b: Band | null): string {
  if (!b) return "no band";
  return b.max >= 99 ? `${b.min}+ yrs` : `${b.min}–${b.max} yrs`;
}
