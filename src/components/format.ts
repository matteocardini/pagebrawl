import type { MetricKey } from '../engine/types';

export function formatSeconds(ms: number): string {
  return `${(ms / 1000).toFixed(1)} s`;
}

export function formatMegabytes(bytes: number): string {
  return `${(bytes / 1_000_000).toFixed(1)} MB`;
}

/** Page weight: kB for light pages (a 2.3 kB page is not "0.0 MB"), MB from 1 MB up. */
export function formatBytes(bytes: number): string {
  if (bytes >= 1_000_000) return formatMegabytes(bytes);
  return `${(bytes / 1000).toFixed(bytes < 10_000 ? 1 : 0)} kB`;
}

export function formatMetric(key: MetricKey, value: number): string {
  if (key === 'lcpMs') return formatSeconds(value);
  if (key === 'totalBytes') return formatBytes(value);
  if (key === 'tbtMs') return `${value} ms`;
  if (key === 'cls') return String(Number(value.toFixed(3)));
  return String(value);
}
