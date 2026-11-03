import { MatchControls } from '../../components/MatchControls';
import { announcement } from '../announcement';
import type { ViewProps } from '../view-props';
import { EnergyBar } from './EnergyBar';
import { Fighter2D } from './Fighter2D';
import './view-2d.css';

export function View2D({ playback, onSkip, onRematch, onSpeedChange }: ViewProps) {
  const { result, phase, activeRound, energy, speed } = playback;
  const { A, B } = result.fighters;
  const finished = phase === 'finished';
  const defender = activeRound?.attacker ? (activeRound.attacker === 'A' ? 'B' : 'A') : null;
  const knockedOut = finished && result.finish === 'KO' ? (result.winner === 'A' ? 'B' : 'A') : null;

  return (
    <section className="arena" aria-label="Match, 2D view">
      <div className="arena__hud">
        <EnergyBar side="A" name={A.hostname} energy={energy.A} />
        <EnergyBar side="B" name={B.hostname} energy={energy.B} />
      </div>

      <div className="arena__stage">
        <Fighter2D
          side="A"
          hit={defender === 'A' ? activeRound : null}
          attacking={activeRound?.attacker === 'A'}
          knockedOut={knockedOut === 'A'}
        />
        <div className="arena__center" aria-hidden="true">
          {phase === 'intro' && <p className="callout callout--fight">FIGHT!</p>}
          {phase === 'round' && activeRound && (
            <p key={activeRound.index} className="callout">
              {activeRound.attacker ? `${activeRound.label.toUpperCase()}!` : 'BLOCKED!'}
            </p>
          )}
          {finished && result.finish === 'KO' && <p className="callout callout--ko">K.O.</p>}
        </div>
        <Fighter2D
          side="B"
          hit={defender === 'B' ? activeRound : null}
          attacking={activeRound?.attacker === 'B'}
          knockedOut={knockedOut === 'B'}
        />
      </div>

      {finished && (
        <div className="verdict">
          <p className="verdict__winner">
            {result.winner === 'draw' ? 'DRAW' : `${result.fighters[result.winner].hostname} WINS`}
          </p>
          <p className="verdict__finish">{result.finish === 'draw' ? 'Dead even' : `by ${result.finish}`}</p>
        </div>
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
