import type { MetricKey, MoveId } from './types';

export const START_ENERGY = 100;
export const MAX_DAMAGE = 35;
export const MIN_DAMAGE = 3;
export const CRIT_THRESHOLD = 0.6;
export const CRIT_MULTIPLIER = 1.25;

export type RoundDefinition = {
  moveId: MoveId;
  label: string;
  metricKey: MetricKey;
  /** Which direction wins the round. */
  better: 'higher' | 'lower';
};

export const ROUND_DEFINITIONS: readonly RoundDefinition[] = [
  { moveId: 'speed-punch', label: 'Speed Punch', metricKey: 'performanceScore', better: 'higher' },
  { moveId: 'paint-kick', label: 'Paint Kick', metricKey: 'lcpMs', better: 'lower' },
  { moveId: 'heavy-slam', label: 'Heavy Slam', metricKey: 'totalBytes', better: 'lower' },
  { moveId: 'request-combo', label: 'Request Combo', metricKey: 'requests', better: 'lower' },
];
