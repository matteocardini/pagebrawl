import { Canvas } from '@react-three/fiber';
import { MatchControls } from '../../components/MatchControls';
import { announcement } from '../announcement';
import type { ViewProps } from '../view-props';
import { Arena } from './Arena';
import './view-3d.css';

export function View3D({ playback, onSkip, onRematch, onSpeedChange }: ViewProps) {
  const { result, phase, energy, speed } = playback;
  const { A, B } = result.fighters;
  const finished = phase === 'finished';

  return (
    <section className="arena-3d" aria-label="Match, 3D view">
      <div className="arena-3d__hud">
        <p className="arena-3d__fighter arena-3d__fighter--a">
          <span title={A.hostname}>{A.hostname}</span> <b>{energy.A}</b>
        </p>
        <p className="arena-3d__fighter arena-3d__fighter--b">
          <b>{energy.B}</b> <span title={B.hostname}>{B.hostname}</span>
        </p>
      </div>

      <div className="arena-3d__canvas">
        <Canvas dpr={[1, 1.5]} camera={{ position: [0, 5, 15], fov: 45 }} onCreated={({ camera }) => camera.lookAt(0, 3, 0)}>
          <Arena bytesA={A.totalBytes} bytesB={B.totalBytes} />
        </Canvas>
      </div>

      {finished && (
        <p className="arena-3d__verdict">
          {result.winner === 'draw'
            ? 'DRAW'
            : `${result.fighters[result.winner].hostname} WINS${result.finish === 'KO' ? ' BY K.O.' : ''}`}
        </p>
      )}

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
