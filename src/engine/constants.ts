import type { MetricKey, MoveId } from './types';

export const START_ENERGY = 100;
export const MAX_DAMAGE = 25;
export const MIN_DAMAGE = 3;
export const CRIT_THRESHOLD = 0.6;
export const CRIT_MULTIPLIER = 1.25;

export type RoundDefinition = {
  moveId: MoveId;
  label: string;
  metricKey: MetricKey;
  /** Which direction wins the round. */
  better: 'higher' | 'lower';
  /**
   * Values are clamped up to the floor before they are compared: anything at or under it counts as equal to it.
   * A floor above 0 stops tiny absolute differences on metrics that sit near zero (TBT, CLS) from counting as
   * huge relative gaps. It is Lighthouse's "good" threshold.
   */
  floor: number;
};

export const ROUND_DEFINITIONS: readonly RoundDefinition[] = [
  { moveId: 'speed-punch', label: 'Speed Punch', metricKey: 'performanceScore', better: 'higher', floor: 0 },
  { moveId: 'paint-kick', label: 'Paint Kick', metricKey: 'lcpMs', better: 'lower', floor: 0 },
  { moveId: 'heavy-slam', label: 'Heavy Slam', metricKey: 'totalBytes', better: 'lower', floor: 0 },
  { moveId: 'request-combo', label: 'Request Combo', metricKey: 'requests', better: 'lower', floor: 0 },
  { moveId: 'freeze-ray', label: 'Freeze Ray', metricKey: 'tbtMs', better: 'lower', floor: 200 },
  { moveId: 'shake-quake', label: 'Shake Quake', metricKey: 'cls', better: 'lower', floor: 0.1 },
];
