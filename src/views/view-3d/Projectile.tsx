import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import type { Mesh } from 'three';
import type { Round } from '../../engine/types';
import { HIT_DELAY_S } from '../timing';
import type { RoundClock } from './round-fx';

type Props = {
  round: Round | null;
  fromX: number;
  toX: number;
  clock: RoundClock;
};

/** A glowing pulse flying from the attacker's tower to the defender's during the first beat of a round. */
export function Projectile({ round, fromX, toX, clock }: Props) {
  const mesh = useRef<Mesh>(null);

  useFrame(() => {
    const m = mesh.current;
    if (!m) return;
    const progress = clock.current.elapsed / HIT_DELAY_S;
    m.visible = progress >= 0 && progress < 1;
    m.position.set(fromX + (toX - fromX) * progress, 2.4 + Math.sin(progress * Math.PI) * 1.2, 0);
  });

  if (!round?.attacker) return null;
  const color = round.crit ? '#f43f5e' : round.attacker === 'A' ? '#22d3ee' : '#ec4899';
  return (
    <mesh ref={mesh} scale={round.crit ? 1.7 : 1} visible={false}>
      <icosahedronGeometry args={[0.35, 0]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
}
