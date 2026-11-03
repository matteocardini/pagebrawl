import type { MetricKey } from '../engine/types';

export function formatSeconds(ms: number): string {
  return `${(ms / 1000).toFixed(1)} s`;
}

export function formatMegabytes(bytes: number): string {
  return `${(bytes / 1_000_000).toFixed(1)} MB`;
}

export function formatMetric(key: MetricKey, value: number): string {
  if (key === 'lcpMs') return formatSeconds(value);
  if (key === 'totalBytes') return formatMegabytes(value);
  return String(value);
}
