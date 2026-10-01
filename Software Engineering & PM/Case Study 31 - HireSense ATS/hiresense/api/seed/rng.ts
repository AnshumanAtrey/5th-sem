// Deterministic PRNG so `bun run seed` always produces the same corpus.
export function rng(seed: number) {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const r = {
    next,
    int: (lo: number, hi: number) => lo + Math.floor(next() * (hi - lo + 1)),
    chance: (p: number) => next() < p,
    pick: <T>(xs: readonly T[]): T => xs[Math.floor(next() * xs.length)]!,
    weighted: <T>(pairs: readonly (readonly [T, number])[]): T => {
      let x = next() * pairs.reduce((s, [, w]) => s + w, 0);
      for (const [v, w] of pairs) if ((x -= w) < 0) return v;
      return pairs[pairs.length - 1]![0];
    },
    normal: (mean: number, sd: number) => mean + sd * Math.sqrt(-2 * Math.log(1 - next())) * Math.cos(2 * Math.PI * next()),
    shuffle: <T>(xs: T[]): T[] => {
      for (let i = xs.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [xs[i], xs[j]] = [xs[j]!, xs[i]!];
      }
      return xs;
    },
    sample: <T>(xs: readonly T[], n: number): T[] => r.shuffle([...xs]).slice(0, n),
  };
  return r;
}
export type Rng = ReturnType<typeof rng>;
