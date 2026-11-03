import type { MatchResult } from '../engine/types';
import { usePlayback } from '../state/use-playback';
import { View2D } from '../views/view-2d/View2D';

type Props = {
  result: MatchResult;
  onRematch: () => void;
};

/**
 * Owns the playback, so whichever view is mounted below it only renders state.
 * Remounting this component (a new match) is the only way to restart playback.
 */
export function MatchScreen({ result, onRematch }: Props) {
  const { playback, skip, setSpeed } = usePlayback(result);
  return <View2D playback={playback} onSkip={skip} onRematch={onRematch} onSpeedChange={setSpeed} />;
}
