import { lazy, Suspense } from 'react';
import type { MatchResult } from '../engine/types';
import { usePlayback } from '../state/use-playback';
import type { ViewMode } from '../state/use-view-mode';
import { View2D } from '../views/view-2d/View2D';

// The 3D arena (three.js) is only downloaded when someone asks for it.
const View3D = lazy(() => import('../views/view-3d/View3D').then((m) => ({ default: m.View3D })));

type Props = {
  result: MatchResult;
  mode: ViewMode;
  onRematch: () => void;
};

/**
 * Owns the playback, so whichever view is mounted below it only renders state.
 * Switching `mode` swaps the child view; the timers here keep running.
 * Remounting this component (a new match) is the only way to restart playback.
 */
export function MatchScreen({ result, mode, onRematch }: Props) {
  const { playback, skip, setSpeed } = usePlayback(result);
  const viewProps = { playback, onSkip: skip, onRematch, onSpeedChange: setSpeed };

  if (mode === '2d') return <View2D {...viewProps} />;
  return (
    <Suspense fallback={<p className="arena-3d-loading" role="status">Loading arena…</p>}>
      <View3D {...viewProps} />
    </Suspense>
  );
}
