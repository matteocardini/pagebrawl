const MIN_HEIGHT = 2;
const MAX_HEIGHT = 8;

/** Page weight → tower height: 100 kB → 2, 10 MB → 8 (log scale, clamped). */
export function towerHeight(totalBytes: number): number {
  const t = Math.min(1, Math.max(0, Math.log10(totalBytes / 100_000) / 2));
  return MIN_HEIGHT + (MAX_HEIGHT - MIN_HEIGHT) * t;
}
