import { useRef, useMemo, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Text, MeshDistortMaterial, Sphere, OrbitControls, Trail, Sparkles } from '@react-three/drei'
import * as THREE from 'three'

// ============================================================================
// FLOATING PARTICLES - Ambient thought particles
// ============================================================================

function ThoughtParticles({ count = 100 }: { count?: number }) {
  const mesh = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const particles = useMemo(() => {
    const temp = []
    for (let i = 0; i < count; i++) {
      temp.push({
        position: [(Math.random() - 0.5) * 20, (Math.random() - 0.5) * 12, (Math.random() - 0.5) * 10 - 5],
        speed: 0.01 + Math.random() * 0.02,
        offset: Math.random() * Math.PI * 2,
        scale: 0.02 + Math.random() * 0.04,
      })
    }
    return temp
  }, [count])

  useFrame((state) => {
    if (!mesh.current) return
    particles.forEach((particle, i) => {
      const t = state.clock.elapsedTime + particle.offset
      dummy.position.set(
        particle.position[0] + Math.sin(t * 0.5) * 0.3,
        particle.position[1] + Math.cos(t * 0.3) * 0.5 + Math.sin(t * 0.2) * 0.2,
        particle.position[2] + Math.sin(t * 0.4) * 0.2
      )
      dummy.scale.setScalar(particle.scale * (1 + Math.sin(t * 2) * 0.2))
      dummy.updateMatrix()
      mesh.current!.setMatrixAt(i, dummy.matrix)
    })
    mesh.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color="#fbbf24" transparent opacity={0.4} />
    </instancedMesh>
  )
}

// ============================================================================
// NEURAL NETWORK - Represents "Think First" concept
// ============================================================================

interface NeuronProps {
  position: [number, number, number]
  delay: number
  color?: string
}

function Neuron({ position, delay, color = "#fbbf24" }: NeuronProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [intensity, setIntensity] = useState(0.3)

  useFrame((state) => {
    if (!meshRef.current) return
    const t = state.clock.elapsedTime + delay
    const pulse = Math.sin(t * 2) * 0.5 + 0.5
    meshRef.current.scale.setScalar(0.08 + pulse * 0.03)
    setIntensity(0.3 + pulse * 0.7)
  })

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[1, 16, 16]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={intensity}
        transparent
        opacity={0.9}
      />
    </mesh>
  )
}

function NeuralConnection({ start, end, delay }: { start: [number, number, number]; end: [number, number, number]; delay: number }) {
  const lineRef = useRef<THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial>>(null)

  const curve = useMemo(() => {
    const midPoint = [
      (start[0] + end[0]) / 2 + (Math.random() - 0.5) * 0.5,
      (start[1] + end[1]) / 2 + (Math.random() - 0.5) * 0.5,
      (start[2] + end[2]) / 2 + (Math.random() - 0.5) * 0.5,
    ]
    return new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(...start),
      new THREE.Vector3(midPoint[0], midPoint[1], midPoint[2]),
      new THREE.Vector3(...end)
    )
  }, [start, end])

  const points = useMemo(() => curve.getPoints(20), [curve])
  const geometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points])

  useFrame((state) => {
    if (!lineRef.current) return
    const t = (state.clock.elapsedTime + delay) % 3
    const opacity = t < 1 ? t : t < 2 ? 1 : 3 - t
    lineRef.current.material.opacity = opacity * 0.4
  })

  return (
    <primitive object={new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: '#fbbf24', transparent: true, opacity: 0.3 }))} ref={lineRef} />
  )
}

function NeuralNetwork() {
  const neurons: [number, number, number][] = useMemo(() => [
    [-2, 1, 0], [-1.5, -0.5, 0.5], [-0.5, 1.2, -0.3],
    [0, 0, 0], [0.5, -1, 0.2], [1, 0.8, -0.4],
    [1.5, -0.3, 0.3], [2, 0.5, 0], [2.5, -0.8, -0.2],
  ], [])

  const connections = useMemo(() => {
    const conns: Array<{ start: [number, number, number]; end: [number, number, number]; delay: number }> = []
    for (let i = 0; i < neurons.length; i++) {
      for (let j = i + 1; j < neurons.length; j++) {
        if (Math.random() > 0.5) {
          conns.push({ start: neurons[i], end: neurons[j], delay: Math.random() * 3 })
        }
      }
    }
    return conns
  }, [neurons])

  return (
    <group>
      {neurons.map((pos, i) => (
        <Neuron key={i} position={pos} delay={i * 0.3} />
      ))}
      {connections.map((conn, i) => (
        <NeuralConnection key={i} {...conn} />
      ))}
    </group>
  )
}

// ============================================================================
// CONTEXT METER - Visual degradation at 20-40%
// ============================================================================

function ContextMeter({ fillLevel = 0.35 }: { fillLevel?: number }) {
  const groupRef = useRef<THREE.Group>(null)

  const getColor = (level: number) => {
    if (level < 0.2) return '#22c55e' // Green - healthy
    if (level < 0.4) return '#f59e0b' // Amber - warning
    return '#ef4444' // Red - danger
  }

  useFrame((state) => {
    if (!groupRef.current) return
    groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1
  })

  return (
    <group ref={groupRef}>
      {/* Container */}
      <mesh>
        <cylinderGeometry args={[1, 1, 3, 32, 1, true]} />
        <meshStandardMaterial
          color="#3f3f46"
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Fill level */}
      <mesh position={[0, -1.5 + fillLevel * 1.5, 0]}>
        <cylinderGeometry args={[0.95, 0.95, fillLevel * 3, 32]} />
        <MeshDistortMaterial
          color={getColor(fillLevel)}
          distort={0.2}
          speed={2}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Warning zone marker at 20% */}
      <mesh position={[0, -1.5 + 0.6, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.9, 1.05, 32]} />
        <meshBasicMaterial color="#f59e0b" transparent opacity={0.5} />
      </mesh>

      {/* Danger zone marker at 40% */}
      <mesh position={[0, -1.5 + 1.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.9, 1.05, 32]} />
        <meshBasicMaterial color="#ef4444" transparent opacity={0.5} />
      </mesh>
    </group>
  )
}

// ============================================================================
// AGENTIC LOOP - Orbital visualization
// ============================================================================

interface LoopNodeProps {
  angle: number
  radius: number
  label: string
  color: string
  speed?: number
}

function LoopNode({ angle, radius, label, color, speed = 0.2 }: LoopNodeProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.elapsedTime * speed + angle
    groupRef.current.position.x = Math.cos(t) * radius
    groupRef.current.position.z = Math.sin(t) * radius
    groupRef.current.position.y = Math.sin(t * 2) * 0.2

    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01
    }
  })

  return (
    <group ref={groupRef}>
      <Trail
        width={0.3}
        length={6}
        color={color}
        attenuation={(t) => t * t}
      >
        <mesh
          ref={meshRef}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          scale={hovered ? 1.2 : 1}
        >
          <octahedronGeometry args={[0.25, 0]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={hovered ? 0.8 : 0.4}
          />
        </mesh>
      </Trail>
      <Float speed={2} rotationIntensity={0} floatIntensity={0.3}>
        <Text
          position={[0, 0.5, 0]}
          fontSize={0.15}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {label}
        </Text>
      </Float>
    </group>
  )
}

function AgenticLoop() {
  const nodes = [
    { label: 'Prompt', color: '#fbbf24', angle: 0 },
    { label: 'Context', color: '#8b5cf6', angle: Math.PI * 0.4 },
    { label: 'Think', color: '#0ea5e9', angle: Math.PI * 0.8 },
    { label: 'Tool', color: '#22c55e', angle: Math.PI * 1.2 },
    { label: 'Result', color: '#f43f5e', angle: Math.PI * 1.6 },
  ]

  return (
    <group>
      {/* Central orb */}
      <Sphere args={[0.5, 32, 32]} position={[0, 0, 0]}>
        <MeshDistortMaterial
          color="#fbbf24"
          distort={0.3}
          speed={3}
          transparent
          opacity={0.7}
        />
      </Sphere>

      {/* Orbit ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2, 0.02, 16, 100]} />
        <meshBasicMaterial color="#71717a" transparent opacity={0.3} />
      </mesh>

      {/* Nodes */}
      {nodes.map((node, i) => (
        <LoopNode key={i} {...node} radius={2} speed={0.3} />
      ))}

      <Sparkles count={50} scale={5} size={1} speed={0.3} color="#fbbf24" />
    </group>
  )
}

// ============================================================================
// FLOATING DOCUMENT - Represents CLAUDE.md
// ============================================================================

function FloatingDocument() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!groupRef.current) return
    groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.1
  })

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <group ref={groupRef}>
        {/* Document body */}
        <mesh>
          <boxGeometry args={[2, 2.5, 0.05]} />
          <meshStandardMaterial color="#18181b" />
        </mesh>

        {/* Document border */}
        <mesh position={[0, 0, 0.03]}>
          <boxGeometry args={[2.05, 2.55, 0.01]} />
          <meshStandardMaterial color="#3f3f46" />
        </mesh>

        {/* Code lines */}
        {[-0.8, -0.4, 0, 0.4, 0.8].map((y, i) => (
          <mesh key={i} position={[-0.2 + (i % 2) * 0.1, y, 0.04]}>
            <boxGeometry args={[1.2 - (i % 3) * 0.2, 0.08, 0.01]} />
            <meshStandardMaterial
              color={i === 0 ? '#22c55e' : i === 2 ? '#fbbf24' : '#71717a'}
              emissive={i === 0 ? '#22c55e' : i === 2 ? '#fbbf24' : '#71717a'}
              emissiveIntensity={0.3}
            />
          </mesh>
        ))}

        {/* Header */}
        <Text
          position={[0, 1.0, 0.04]}
          fontSize={0.15}
          color="#fbbf24"
          anchorX="center"
        >
          CLAUDE.md
        </Text>
      </group>
    </Float>
  )
}

// ============================================================================
// HERO SCENE - Main 3D background
// ============================================================================

function HeroBackground() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#fbbf24" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />

      <ThoughtParticles count={80} />

      {/* Subtle gradient sphere in background */}
      <Sphere args={[15, 32, 32]} position={[0, 0, -20]}>
        <meshBasicMaterial color="#09090b" side={THREE.BackSide} />
      </Sphere>
    </>
  )
}

// ============================================================================
// EXPORTED CANVAS SCENES
// ============================================================================

export function HeroCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 60 }}
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
    >
      <HeroBackground />
    </Canvas>
  )
}

export function NeuralNetworkCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 50 }}
      style={{ width: '100%', height: '300px' }}
    >
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={1} color="#fbbf24" />
      <NeuralNetwork />
      <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
    </Canvas>
  )
}

export function ContextMeterCanvas({ fillLevel = 0.35 }: { fillLevel?: number }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 50 }}
      style={{ width: '100%', height: '250px' }}
    >
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={1} color="#fbbf24" />
      <ContextMeter fillLevel={fillLevel} />
      <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.3} />
    </Canvas>
  )
}

export function AgenticLoopCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 2, 5], fov: 50 }}
      style={{ width: '100%', height: '350px' }}
    >
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={1} color="#fbbf24" />
      <pointLight position={[-5, -5, -5]} intensity={0.5} color="#8b5cf6" />
      <AgenticLoop />
      <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
    </Canvas>
  )
}

export function ClaudeMdCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0, 4], fov: 50 }}
      style={{ width: '100%', height: '280px' }}
    >
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={1} color="#fbbf24" />
      <FloatingDocument />
      <OrbitControls enableZoom={false} enablePan={false} />
    </Canvas>
  )
}

// ============================================================================
// INTERACTIVE BRAIN - For hero section
// ============================================================================

function InteractiveBrain() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!groupRef.current) return
    // Gentle rotation based on time
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.1
    // Subtle oscillation
    groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1
  })

  return (
    <group ref={groupRef} position={[3, 0, -2]}>
      <NeuralNetwork />
      <Sparkles count={30} scale={6} size={2} speed={0.5} color="#fbbf24" />
    </group>
  )
}

export function InteractiveHeroCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 60 }}
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
    >
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#fbbf24" />
      <pointLight position={[-10, 5, -10]} intensity={0.5} color="#8b5cf6" />

      <ThoughtParticles count={60} />
      <InteractiveBrain />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        maxPolarAngle={Math.PI / 1.5}
        minPolarAngle={Math.PI / 3}
      />
    </Canvas>
  )
}
