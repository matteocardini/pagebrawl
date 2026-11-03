import { Canvas } from '@react-three/fiber';
import { MatchControls } from '../../components/MatchControls';
import { ResultCard } from '../../components/ResultCard';
import { announcement } from '../announcement';
import { usePrefersReducedMotion } from '../use-reduced-motion';
import type { ViewProps } from '../view-props';
import { Scene } from './Scene';
import './view-3d.css';

export function View3D({ playback, onSkip, onRematch, onSpeedChange }: ViewProps) {
  const { result, phase, activeRound, speed } = playback;
  const reducedMotion = usePrefersReducedMotion();
  const finished = phase === 'finished';

  return (
    <section className="arena-3d" aria-label="Match, 3D view">
      <div className="arena-3d__canvas">
        <Canvas dpr={[1, 1.5]} camera={{ position: [0, 6, 18], fov: 45 }}>
          <Scene playback={playback} reducedMotion={reducedMotion} />
        </Canvas>
        <div className="arena-3d__callout" aria-hidden="true">
          {phase === 'intro' && <p className="callout callout--fight">FIGHT!</p>}
          {phase === 'round' && activeRound && (
            <p key={activeRound.index} className="callout">
              {activeRound.attacker ? `${activeRound.label.toUpperCase()}!` : 'BLOCKED!'}
            </p>
          )}
          {finished && result.finish === 'KO' && <p className="callout callout--ko">K.O.</p>}
        </div>
      </div>

      {finished && <ResultCard result={result} />}

      <MatchControls
        finished={finished}
        speed={speed}
        onSkip={onSkip}
        onRematch={onRematch}
        onSpeedChange={onSpeedChange}
      />
      <p className="sr-only" aria-live="polite">
        {announcement(playback)}
      </p>
    </section>
  );
}
