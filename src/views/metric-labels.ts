import type { MetricKey } from '../engine/types';

/** What a round is fought on, in words a player understands. */
export const METRIC_LABEL: Record<MetricKey, string> = {
  performanceScore: 'PAGESPEED SCORE',
  lcpMs: 'LOAD SPEED (LCP)',
  totalBytes: 'PAGE WEIGHT',
  requests: 'REQUESTS',
  tbtMs: 'BLOCKING TIME (TBT)',
  cls: 'LAYOUT SHIFT (CLS)',
};
