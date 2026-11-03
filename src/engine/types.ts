export type SiteMetrics = {
  url: string;
  hostname: string;
  performanceScore: number;
  lcpMs: number;
  totalBytes: number;
  requests: number;
};

export type FighterId = 'A' | 'B';
export type MoveId = 'speed-punch' | 'paint-kick' | 'heavy-slam' | 'request-combo';
export type MetricKey = 'performanceScore' | 'lcpMs' | 'totalBytes' | 'requests';

export type Round = {
  index: number;
  moveId: MoveId;
  label: string;
  metricKey: MetricKey;
  valueA: number;
  valueB: number;
  attacker: FighterId | null;
  damage: number;
  crit: boolean;
  energyAfter: Record<FighterId, number>;
};

export type MatchResult = {
  fighters: Record<FighterId, SiteMetrics>;
  rounds: Round[];
  winner: FighterId | 'draw';
  finish: 'KO' | 'decision' | 'draw';
};
