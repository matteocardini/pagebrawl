import { METRIC_LABEL } from './metric-labels';
import type { PlaybackState } from '../state/use-playback';

/** Plain-text description of what is happening now, for screen readers (shared by both views). */
export function announcement({ phase, activeRound, result }: PlaybackState): string {
  if (phase === 'intro') return 'Fight!';
  if (phase === 'finished') {
    return result.winner === 'draw' ? 'Draw.' : `${result.fighters[result.winner].hostname} wins by ${result.finish}.`;
  }
  if (!activeRound) return '';
  if (!activeRound.attacker) return `${activeRound.label}: blocked.`;
  const name = result.fighters[activeRound.attacker].hostname;
  return `${activeRound.label}: ${name} hits for ${activeRound.damage} on ${METRIC_LABEL[activeRound.metricKey].toLowerCase()}${activeRound.crit ? ', critical' : ''}.`;
}
