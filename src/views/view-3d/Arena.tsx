/** Static low-poly environment: background, fog, rim lights, floor and grid. */
export function Arena() {
  return (
    <>
      <color attach="background" args={['#0a0e1f']} />
      <fog attach="fog" args={['#0a0e1f', 14, 34]} />
      <ambientLight intensity={0.35} />
      <pointLight color="#22d3ee" position={[-7, 6, 5]} intensity={140} />
      <pointLight color="#ec4899" position={[7, 6, 5]} intensity={140} />

      <mesh rotation-x={-Math.PI / 2}>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#0d1130" roughness={1} />
      </mesh>
      <gridHelper args={[60, 60, '#7c3aed', '#2a2f6b']} position-y={0.01} />
    </>
  );
}
