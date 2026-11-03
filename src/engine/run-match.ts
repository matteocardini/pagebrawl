import {
  CRIT_MULTIPLIER,
  CRIT_THRESHOLD,
  MAX_DAMAGE,
  MIN_DAMAGE,
  ROUND_DEFINITIONS,
  START_ENERGY,
} from './constants';
import type { RoundDefinition } from './constants';
import type { FighterId, MatchResult, Round, SiteMetrics } from './types';

type Energy = Record<FighterId, number>;

function otherFighter(id: FighterId): FighterId {
  return id === 'A' ? 'B' : 'A';
}

function resolveRound(
  definition: RoundDefinition,
  index: number,
  a: SiteMetrics,
  b: SiteMetrics,
  energy: Energy,
): Round {
  const x = a[definition.metricKey];
  const y = b[definition.metricKey];
  const base = {
    index,
    moveId: definition.moveId,
    label: definition.label,
    metricKey: definition.metricKey,
    valueA: x,
    valueB: y,
  };
  const max = Math.max(x, y);

  if (x === y || max === 0) {
    return { ...base, attacker: null, damage: 0, crit: false, energyAfter: { ...energy } };
  }

  const aWins = definition.better === 'higher' ? x > y : x < y;
  const attacker: FighterId = aWins ? 'A' : 'B';
  const defender = otherFighter(attacker);

  const advantage = Math.abs(x - y) / max;
  const crit = advantage >= CRIT_THRESHOLD;
  const raw = advantage * MAX_DAMAGE * (crit ? CRIT_MULTIPLIER : 1);
  const damage = Math.max(MIN_DAMAGE, Math.round(raw));

  const energyAfter: Energy = { ...energy, [defender]: Math.max(0, energy[defender] - damage) };
  return { ...base, attacker, damage, crit, energyAfter };
}

function decideWinner(
  energy: Energy,
  a: SiteMetrics,
  b: SiteMetrics,
): Pick<MatchResult, 'winner' | 'finish'> {
  if (energy.A === 0) return { winner: 'B', finish: 'KO' };
  if (energy.B === 0) return { winner: 'A', finish: 'KO' };
  if (energy.A !== energy.B) {
    return { winner: energy.A > energy.B ? 'A' : 'B', finish: 'decision' };
  }
  if (a.performanceScore !== b.performanceScore) {
    return { winner: a.performanceScore > b.performanceScore ? 'A' : 'B', finish: 'decision' };
  }
  return { winner: 'draw', finish: 'draw' };
}

/** Plays a full match. Pure and deterministic: same input, same output. */
export function runMatch(a: SiteMetrics, b: SiteMetrics): MatchResult {
  const rounds: Round[] = [];
  let energy: Energy = { A: START_ENERGY, B: START_ENERGY };

  for (const [i, definition] of ROUND_DEFINITIONS.entries()) {
    const round = resolveRound(definition, i + 1, a, b, energy);
    rounds.push(round);
    energy = round.energyAfter;
    if (energy.A === 0 || energy.B === 0) break;
  }

  return { fighters: { A: a, B: b }, rounds, ...decideWinner(energy, a, b) };
}
