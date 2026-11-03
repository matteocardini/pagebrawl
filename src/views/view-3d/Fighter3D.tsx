import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { MathUtils } from 'three';
import type { Group, MeshStandardMaterial } from 'three';
import type { FighterId, Round } from '../../engine/types';
import { HIT_DELAY_S, SHAKE_S } from '../timing';
import type { RoundClock } from './round-fx';

const KO_ANGLE = 1.35;

type Props = {
  side: FighterId;
  name: string;
  x: number;
  height: number;
  color: string;
  energy: number;
  /** The round in which this fighter is being hit, if any. */
  hit: Round | null;
  attacking: boolean;
  knockedOut: boolean;
  clock: RoundClock;
  reducedMotion: boolean;
};

export function Fighter3D({ side, name, x, height, color, energy, hit, attacking, knockedOut, clock, reducedMotion }: Props) {
  const body = useRef<Group>(null);
  const material = useRef<MeshStandardMaterial>(null);

  useFrame((_, delta) => {
    const group = body.current;
    const mat = material.current;
    if (!group || !mat) return;
    const t = clock.current.elapsed;

    // hit shake and flash (skipped under reduced motion), then collapse on KO
    const sinceHit = t - HIT_DELAY_S;
    const hitting = !reducedMotion && hit !== null && sinceHit > 0 && sinceHit < SHAKE_S;
    group.position.x = hitting ? Math.sin(sinceHit * 90) * 0.25 * (1 - sinceHit / SHAKE_S) : 0;

    let glow = 0.25;
    if (!reducedMotion && attacking && t < HIT_DELAY_S) glow = 0.9;
    if (hitting) glow = 1.4 * (1 - sinceHit / SHAKE_S) + 0.25;
    mat.emissiveIntensity = glow;

    const direction = side === 'A' ? 1 : -1;
    const target = knockedOut ? direction * KO_ANGLE : 0;
    group.rotation.z = reducedMotion ? target : MathUtils.damp(group.rotation.z, target, 4, delta);
  });

  return (
    <group position={[x, 0, 0]}>
      <group ref={body}>
        <mesh position={[0, height / 2, 0]}>
          <boxGeometry args={[1.8, height, 1.8]} />
          <meshStandardMaterial ref={material} color={color} emissive={color} flatShading roughness={0.6} />
        </mesh>
      </group>

      <Html position={[0, height + 1.2, 0]} center zIndexRange={[10, 0]} style={{ pointerEvents: 'none' }}>
        <div className={`bar3d bar3d--${side.toLowerCase()}`}>
          <span className="bar3d__name" title={name}>
            {name}
          </span>
          <div
            className="bar3d__track"
            role="progressbar"
            aria-label={`${name} energy`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={energy}
          >
            <div className="bar3d__fill" style={{ width: `${energy}%` }} />
          </div>
        </div>
      </Html>

      {hit && (
        <Html position={[0, height + 3, 0]} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
          <div key={hit.index} className={hit.crit ? 'dmg3d dmg3d--crit' : 'dmg3d'}>
            -{hit.damage}
            {hit.crit && <small>CRIT!</small>}
          </div>
        </Html>
      )}
    </group>
  );
}
