import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial, Sparkles, Stars } from '@react-three/drei'

// Oggetto centrale: una sfera che si deforma in modo organico e segue il mouse
function Blob() {
  const group = useRef()

  useFrame((state, delta) => {
    const { x, y } = state.pointer
    // Rotazione morbida verso la posizione del mouse
    group.current.rotation.y += (x * 0.8 - group.current.rotation.y) * 2 * delta
    group.current.rotation.x += (-y * 0.5 - group.current.rotation.x) * 2 * delta
    group.current.rotation.z += delta * 0.1
  })

  return (
    <group ref={group}>
      <Float speed={1.6} rotationIntensity={0.4} floatIntensity={1.2}>
        <mesh>
          <icosahedronGeometry args={[1.5, 24]} />
          <MeshDistortMaterial
            color="#7c5cff"
            emissive="#2a1a80"
            emissiveIntensity={0.6}
            roughness={0.15}
            metalness={0.7}
            distort={0.45}
            speed={2}
          />
        </mesh>
      </Float>
    </group>
  )
}

// Numeri pseudo-casuali ripetibili (stesso risultato a ogni render)
const seeded = (n) => {
  const x = Math.sin(n * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

// Anello di piccoli cubi che orbita attorno all'oggetto
function Orbit({ count = 60, radius = 3 }) {
  const ref = useRef()
  const items = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const a = (i / count) * Math.PI * 2
        return {
          position: [Math.cos(a) * radius, Math.sin(a * 3) * 0.4, Math.sin(a) * radius],
          scale: 0.05 + seeded(i + 1) * 0.1,
          rotation: [seeded(i + 100) * Math.PI, seeded(i + 200) * Math.PI, 0],
        }
      }),
    [count, radius],
  )

  useFrame((_, delta) => {
    ref.current.rotation.y += delta * 0.25
  })

  return (
    <group ref={ref} rotation={[0.4, 0, 0.2]}>
      {items.map((item, i) => (
        <mesh key={i} position={item.position} rotation={item.rotation} scale={item.scale}>
          <boxGeometry />
          <meshStandardMaterial color="#5ce1ff" emissive="#5ce1ff" emissiveIntensity={1.2} />
        </mesh>
      ))}
    </group>
  )
}

export default function Scene() {
  return (
    <Canvas camera={{ position: [0, 0, 7], fov: 50 }} dpr={[1, 2]}>
      <color attach="background" args={['#07060d']} />
      <fog attach="fog" args={['#07060d', 8, 18]} />

      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={2} color="#ffffff" />
      <pointLight position={[-5, -3, 2]} intensity={30} color="#ff4fd8" />
      <pointLight position={[4, -2, -3]} intensity={25} color="#5ce1ff" />

      <Blob />
      <Orbit />
      <Sparkles count={120} scale={[12, 8, 8]} size={3} speed={0.4} color="#c9b8ff" />
      <Stars radius={60} depth={40} count={1500} factor={3} fade speed={1} />
    </Canvas>
  )
}
