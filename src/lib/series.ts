import { createRng } from "./utils";

/** Commit-intensity grid (weeks × 7) that ramps up over time, quieter on weekends. */
export function contributionGrid(seed: number, weeks = 26, density = 1): number[] {
  const rng = createRng(seed);
  const cells: number[] = [];
  for (let w = 0; w < weeks; w++) {
    const ramp = 0.5 + 0.5 * (w / (weeks - 1));
    for (let d = 0; d < 7; d++) {
      const weekend = d === 0 || d === 6 ? 0.45 : 1;
      const v = rng() * ramp * weekend * density + rng() * 0.12;
      cells.push(v < 0.16 ? 0 : v < 0.36 ? 1 : v < 0.58 ? 2 : v < 0.78 ? 3 : 4);
    }
  }
  return cells;
}

/** Scale a series so its last point equals `end`, preserving shape. */
export function scaleTo(series: number[], end: number): number[] {
  const last = series[series.length - 1] || 1;
  return series.map((v) => Math.round((v / last) * end));
}
