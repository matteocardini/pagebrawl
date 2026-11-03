import { useFrame, useThree } from '@react-three/fiber';
import { useRef } from 'react';
import { MathUtils } from 'three';

type Props = {
  /** True while a round plays: the camera then holds a fixed framing. */
  fixed: boolean;
  reducedMotion: boolean;
};

const RADIUS = 18;

/** Slow sway around the arena while idle (intro and result); steady framing during rounds. */
export function CameraRig({ fixed, reducedMotion }: Props) {
  const camera = useThree((state) => state.camera);
  const angle = useRef(0);
  const time = useRef(0);

  useFrame((_, delta) => {
    time.current += delta;
    const target = fixed || reducedMotion ? 0 : Math.sin(time.current * 0.35) * 0.55;
    angle.current = MathUtils.damp(angle.current, target, 2.5, delta);
    camera.position.set(Math.sin(angle.current) * RADIUS, 6, Math.cos(angle.current) * RADIUS);
    camera.lookAt(0, 4.5, 0);
  });

  return null;
}
