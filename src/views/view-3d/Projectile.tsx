import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import type { Mesh, MeshBasicMaterial } from 'three';
import type { Round } from '../../engine/types';
import { HIT_DELAY_S } from '../timing';
import type { RoundClock } from './round-fx';

const TRAIL = 7;
const TRAIL_GAP = 0.05;
const IMPACT_S = 0.4;

type Props = {
  round: Round;
  from: { x: number; y: number };
  to: { x: number; y: number };
  clock: RoundClock;
  reducedMotion: boolean;
};

/**
 * A big glowing pulse with a fading tail, flying from the attacker's tower to the defender's during the
 * first beat of a round, then a shock ring where it lands.
 */
export function Projectile({ round, from, to, clock, reducedMotion }: Props) {
  const trail = useRef<(Mesh | null)[]>([]);
  const ring = useRef<Mesh>(null);
  const ringMaterial = useRef<MeshBasicMaterial>(null);
  const size = round.crit ? 0.85 : 0.55;
  const color = round.crit ? '#f43f5e' : round.attacker === 'A' ? '#22d3ee' : '#ec4899';

  useFrame(() => {
    const elapsed = clock.current.elapsed;
    trail.current.forEach((mesh, i) => {
      if (!mesh) return;
      const p = elapsed / HIT_DELAY_S - i * TRAIL_GAP;
      mesh.visible = p >= 0 && p < 1;
      mesh.position.set(from.x + (to.x - from.x) * p, from.y + (to.y - from.y) * p + Math.sin(p * Math.PI) * 1.5, 0.4);
      mesh.scale.setScalar(1 - (i / TRAIL) * 0.75);
    });

    const impact = (elapsed - HIT_DELAY_S) / IMPACT_S;
    const shock = ring.current;
    const mat = ringMaterial.current;
    if (!shock || !mat) return;
    shock.visible = !reducedMotion && impact >= 0 && impact < 1;
    shock.scale.setScalar(1 + impact * 3);
    mat.opacity = 1 - impact;
  });

  return (
    <>
      {Array.from({ length: TRAIL }, (_, i) => (
        <mesh key={i} ref={(mesh) => void (trail.current[i] = mesh)} visible={false}>
          <icosahedronGeometry args={[size, 0]} />
          <meshBasicMaterial color={color} transparent opacity={1 - (i / TRAIL) * 0.7} />
        </mesh>
      ))}
      <mesh ref={ring} position={[to.x, to.y, 0.4]} visible={false}>
        <ringGeometry args={[0.6, 0.9, 20]} />
        <meshBasicMaterial ref={ringMaterial} color={color} transparent side={2} />
      </mesh>
    </>
  );
}
