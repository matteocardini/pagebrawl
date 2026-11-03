import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import type { PlaybackState } from '../../state/use-playback';
import { Arena } from './Arena';
import { CameraRig } from './CameraRig';
import { Fighter3D } from './Fighter3D';
import { Projectile } from './Projectile';
import type { RoundClock } from './round-fx';
import { towerHeight } from './tower-height';

const X = { A: -4, B: 4 } as const;
const COLOR = { A: '#22d3ee', B: '#ec4899' } as const;

type Props = {
  playback: PlaybackState;
  reducedMotion: boolean;
};

/** Pure rendering of the playback state; it never computes damage or winners. */
export function Scene({ playback, reducedMotion }: Props) {
  const { result, phase, activeRound, energy, speed } = playback;
  const clock: RoundClock = useRef({ round: -1, elapsed: 0 });

  useFrame((_, delta) => {
    const index = activeRound?.index ?? -1;
    if (clock.current.round !== index) clock.current = { round: index, elapsed: 0 };
    else clock.current.elapsed += delta * speed;
  });

  const defender = activeRound?.attacker ? (activeRound.attacker === 'A' ? 'B' : 'A') : null;
  const loser = phase === 'finished' && result.finish === 'KO' ? (result.winner === 'A' ? 'B' : 'A') : null;

  return (
    <>
      <Arena />
      <CameraRig fixed={phase === 'round'} reducedMotion={reducedMotion} />
      {(['A', 'B'] as const).map((side) => (
        <Fighter3D
          key={side}
          side={side}
          name={result.fighters[side].hostname}
          x={X[side]}
          height={towerHeight(result.fighters[side].totalBytes)}
          color={COLOR[side]}
          energy={energy[side]}
          hit={defender === side ? activeRound : null}
          attacking={activeRound?.attacker === side}
          knockedOut={loser === side}
          clock={clock}
          reducedMotion={reducedMotion}
        />
      ))}
      {activeRound?.attacker && (
        <Projectile
          round={activeRound}
          fromX={X[activeRound.attacker]}
          toX={X[defender === 'A' ? 'A' : 'B']}
          clock={clock}
        />
      )}
    </>
  );
}
