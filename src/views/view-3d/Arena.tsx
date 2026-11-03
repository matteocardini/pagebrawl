import { towerHeight } from './tower-height';

const SIDE_COLOR = { A: '#22d3ee', B: '#ec4899' } as const;

type TowerProps = {
  x: number;
  height: number;
  color: string;
};

function Tower({ x, height, color }: TowerProps) {
  return (
    <mesh position={[x, height / 2, 0]}>
      <boxGeometry args={[1.8, height, 1.8]} />
      <meshStandardMaterial color={color} flatShading emissive={color} emissiveIntensity={0.25} roughness={0.6} />
    </mesh>
  );
}

type Props = {
  bytesA: number;
  bytesB: number;
};

/** Static low-poly arena: floor, grid, fog, two rim lights and one tower per fighter. */
export function Arena({ bytesA, bytesB }: Props) {
  return (
    <>
      <color attach="background" args={['#0a0e1f']} />
      <fog attach="fog" args={['#0a0e1f', 14, 34]} />
      <ambientLight intensity={0.35} />
      <pointLight color={SIDE_COLOR.A} position={[-7, 6, 5]} intensity={140} />
      <pointLight color={SIDE_COLOR.B} position={[7, 6, 5]} intensity={140} />

      <mesh rotation-x={-Math.PI / 2}>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#0d1130" roughness={1} />
      </mesh>
      <gridHelper args={[60, 60, '#7c3aed', '#2a2f6b']} position-y={0.01} />

      <Tower x={-4} height={towerHeight(bytesA)} color={SIDE_COLOR.A} />
      <Tower x={4} height={towerHeight(bytesB)} color={SIDE_COLOR.B} />
    </>
  );
}
