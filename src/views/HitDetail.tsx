import { formatMetric } from '../components/format';
import type { Round } from '../engine/types';
import { METRIC_LABEL } from './metric-labels';

/** Under the damage number: which metric the defender lost on, and the two values. */
export function HitDetail({ round }: { round: Round }) {
  const attackerIsA = round.attacker === 'A';
  const attackerValue = attackerIsA ? round.valueA : round.valueB;
  const defenderValue = attackerIsA ? round.valueB : round.valueA;
  return (
    <>
      <small className="hit-detail hit-detail--metric">{METRIC_LABEL[round.metricKey]}</small>
      <small className="hit-detail">
        {formatMetric(round.metricKey, defenderValue)} vs {formatMetric(round.metricKey, attackerValue)}
      </small>
    </>
  );
}
