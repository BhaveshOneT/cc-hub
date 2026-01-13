import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sparkles, Float, QuadraticBezierLine } from '@react-three/drei'
import * as THREE from 'three'

// Centralized performance configuration (DRY)
import { PERF } from '../../lib/performance'

// ============================================================================
// MAGICAL EFFECTS - Visual enhancement system (PERFORMANCE OPTIMIZED)
// Energy beams, spell circles, aurora, floating runes, ambient creatures
// ============================================================================

// ============================================================================
// ENERGY BEAM - Connects wizard to active object
// ============================================================================

interface EnergyBeamProps {
  start: [number, number, number]
  end: [number, number, number]
  color: string
  intensity?: number
  active?: boolean
}

export function EnergyBeam({ start, end, color, intensity = 1, active = true }: EnergyBeamProps) {
  // Midpoint with some lift for arc
  const mid: [number, number, number] = useMemo(() => [
    (start[0] + end[0]) / 2,
    Math.max(start[1], end[1]) + 2,
    (start[2] + end[2]) / 2,
  ], [start, end])

  if (!active) return null

  return (
    <group>
      <QuadraticBezierLine
        start={start}
        end={end}
        mid={mid}
        color={color}
        lineWidth={3}
        transparent
        opacity={0.7 * intensity}
      />
      {/* Reduced particles along the beam */}
      <Sparkles
        count={8}
        scale={[
          Math.abs(end[0] - start[0]) + 1,
          2,
          Math.abs(end[2] - start[2]) + 1,
        ]}
        position={[
          (start[0] + end[0]) / 2,
          (start[1] + end[1]) / 2 + 1,
          (start[2] + end[2]) / 2,
        ]}
        size={2}
        speed={1.5}
        color={color}
      />
    </group>
  )
}

// ============================================================================
// SPELL CIRCLE - Animated rune circle (PERFORMANCE OPTIMIZED)
// ============================================================================

interface SpellCircleProps {
  position: [number, number, number]
  color: string
  radius?: number
  active?: boolean
  intensity?: number
}

export function SpellCircle({ position, color, radius = 1.5, active = true, intensity = 1 }: SpellCircleProps) {
  const groupRef = useRef<THREE.Group>(null)
  const pulseRingRef = useRef<THREE.Mesh>(null)
  const frameCount = useRef(0)

  useFrame((state) => {
    if (!groupRef.current || !active) return

    // Skip frames for performance
    frameCount.current++
    if (frameCount.current % PERF.frameSkip !== 0) return

    const t = state.clock.elapsedTime

    // Rotate the whole group
    groupRef.current.rotation.z = t * 0.3

    // Pulse emissive on outer ring
    const outerRing = groupRef.current.children[0] as THREE.Mesh
    if (outerRing?.material instanceof THREE.MeshStandardMaterial) {
      outerRing.material.emissiveIntensity = (0.5 + Math.sin(t * 2) * 0.3) * intensity
    }

    // Animate the pulse ring (single expanding ring, loops)
    if (pulseRingRef.current) {
      const cycleTime = 2 // 2 second cycle
      const progress = (t % cycleTime) / cycleTime
      const scale = 1 + progress * 0.8
      pulseRingRef.current.scale.set(scale, scale, 1)
      const mat = pulseRingRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = Math.max(0, (1 - progress) * 0.4 * intensity)
    }
  })

  if (!active) return null

  return (
    <group ref={groupRef} position={position} rotation={[-Math.PI / 2, 0, 0]}>
      {/* Outer ring */}
      <mesh>
        <ringGeometry args={[radius * 0.95, radius, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.6 * intensity}
          transparent
          opacity={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Inner ring */}
      <mesh>
        <ringGeometry args={[radius * 0.6, radius * 0.65, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.4 * intensity}
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Central symbol - hexagonal */}
      <mesh position={[0, 0, 0.01]}>
        <ringGeometry args={[radius * 0.15, radius * 0.25, 6]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.8 * intensity}
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* Single pulsing ring - ref-based animation, no useState */}
      <mesh ref={pulseRingRef} position={[0, 0, -0.01]}>
        <ringGeometry args={[radius * 0.85, radius * 0.9, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>

      {/* Single glow light */}
      <pointLight color={color} intensity={1.5 * intensity} distance={radius * 1.5} decay={2} />
    </group>
  )
}

// ============================================================================
// AURORA - Northern lights effect (PERFORMANCE OPTIMIZED)
// ============================================================================

export function Aurora() {
  const meshRef = useRef<THREE.Mesh>(null)
  const frameCount = useRef(0)

  useFrame((state) => {
    // Skip frames - aurora is slow moving
    frameCount.current++
    if (frameCount.current % 3 !== 0) return

    if (meshRef.current) {
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.1) * 0.1
      meshRef.current.position.y = 25 + Math.sin(state.clock.elapsedTime * 0.2) * 2
    }
  })

  // Reduced to 2 aurora planes for performance
  return (
    <group>
      <Float speed={0.3} floatIntensity={0.5}>
        <mesh ref={meshRef} position={[-10, 25, -30]} rotation={[0.3, 0, 0]}>
          <planeGeometry args={[40, 20, 8, 4]} />
          <meshBasicMaterial
            color="#8b5cf6"
            transparent
            opacity={0.12}
            side={THREE.DoubleSide}
          />
        </mesh>
      </Float>
      <Float speed={0.4} floatIntensity={0.5}>
        <mesh position={[10, 28, -30]} rotation={[0.3, 0, 0.2]}>
          <planeGeometry args={[35, 18, 8, 4]} />
          <meshBasicMaterial
            color="#22c55e"
            transparent
            opacity={0.1}
            side={THREE.DoubleSide}
          />
        </mesh>
      </Float>
    </group>
  )
}

// ============================================================================
// FLOATING RUNES - Mystical symbols (OPTIMIZED - fewer runes, instanced)
// ============================================================================

export function FloatingRunes() {
  const groupRef = useRef<THREE.Group>(null)
  const frameCount = useRef(0)

  // Reduced to 10 runes
  const runes = useMemo(() => {
    return Array.from({ length: 10 }).map(() => ({
      position: [
        (Math.random() - 0.5) * 14,
        1.5 + Math.random() * 4,
        (Math.random() - 0.5) * 14,
      ] as [number, number, number],
      speed: 0.3 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2,
    }))
  }, [])

  useFrame((state) => {
    if (!groupRef.current) return

    // Skip frames
    frameCount.current++
    if (frameCount.current % PERF.frameSkip !== 0) return

    const t = state.clock.elapsedTime
    groupRef.current.children.forEach((child, i) => {
      if (child instanceof THREE.Group) {
        const rune = runes[i]
        child.position.y = rune.position[1] + Math.sin(t * rune.speed + rune.phase) * 0.3
        child.rotation.y = t * 0.15 + rune.phase
      }
    })
  })

  return (
    <group ref={groupRef}>
      {runes.map((rune, i) => (
        <group key={i} position={rune.position}>
          <mesh>
            <planeGeometry args={[0.25, 0.25]} />
            <meshBasicMaterial
              color="#fbbf24"
              transparent
              opacity={0.35}
            />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// ============================================================================
// WILL-O-WISPS - Floating light creatures (PERFORMANCE OPTIMIZED)
// ============================================================================

interface WispProps {
  initialPosition: [number, number, number]
  color: string
  speed?: number
  index: number
}

function Wisp({ initialPosition, color, speed = 1, index }: WispProps) {
  const groupRef = useRef<THREE.Group>(null)
  const offset = useMemo(() => index * Math.PI * 0.5, [index])
  const frameCount = useRef(0)

  useFrame((state) => {
    if (!groupRef.current) return

    // Skip frames for performance
    frameCount.current++
    if (frameCount.current % PERF.frameSkip !== 0) return

    const t = state.clock.elapsedTime * speed + offset

    // Smooth movement
    groupRef.current.position.x = initialPosition[0] + Math.sin(t) * 1.5
    groupRef.current.position.y = initialPosition[1] + Math.sin(t * 2) * 0.3
    groupRef.current.position.z = initialPosition[2] + Math.cos(t) * 1.5
  })

  return (
    <group ref={groupRef} position={initialPosition}>
      {/* Core - using BasicMaterial for performance */}
      <mesh>
        <sphereGeometry args={[0.06, 6, 6]} />
        <meshBasicMaterial color={color} />
      </mesh>
      {/* Glow */}
      <mesh>
        <sphereGeometry args={[0.12, 6, 6]} />
        <meshBasicMaterial color={color} transparent opacity={0.25} />
      </mesh>
    </group>
  )
}

export function WillOWisps() {
  // 3 wisps - reduced for performance
  const wisps = useMemo(() => [
    { pos: [4, 2, 4] as [number, number, number], color: '#60a5fa', speed: 0.6 },
    { pos: [-3, 1.5, 2] as [number, number, number], color: '#a78bfa', speed: 0.5 },
    { pos: [2, 2.5, -3] as [number, number, number], color: '#4ade80', speed: 0.55 },
  ], [])

  return (
    <group>
      {wisps.map((wisp, i) => (
        <Wisp key={i} index={i} initialPosition={wisp.pos} color={wisp.color} speed={wisp.speed} />
      ))}
    </group>
  )
}

// ============================================================================
// MAGIC PARTICLES - Dense ambient particles (OPTIMIZED - single system)
// ============================================================================

export function MagicParticles() {
  return (
    <Sparkles
      count={Math.floor(80 * PERF.particleMultiplier)}
      scale={[18, 6, 18]}
      position={[0, 3, 0]}
      size={1}
      speed={0.2}
      opacity={0.35}
      color="#a78bfa"
      noise={[0.5, 0.3, 0.5]}
    />
  )
}

// ============================================================================
// PORTAL VORTEX - Swirling energy for MCP portal (OPTIMIZED)
// ============================================================================

interface PortalVortexProps {
  position: [number, number, number]
  color: string
  active?: boolean
  scale?: number
}

export function PortalVortex({ position, color, active = true, scale = 1 }: PortalVortexProps) {
  const ringsRef = useRef<THREE.Group>(null)
  const frameCount = useRef(0)

  useFrame((state) => {
    if (!ringsRef.current || !active) return

    frameCount.current++
    if (frameCount.current % PERF.frameSkip !== 0) return

    const t = state.clock.elapsedTime
    ringsRef.current.children.forEach((child, i) => {
      if (child instanceof THREE.Mesh) {
        child.rotation.z = t * (0.8 + i * 0.2) * (i % 2 === 0 ? 1 : -1)
      }
    })
  })

  if (!active) return null

  return (
    <group position={position} scale={scale}>
      <group ref={ringsRef}>
        {/* Reduced to 3 rings */}
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[0, 0, i * 0.03]}>
            <ringGeometry args={[0.3 + i * 0.2, 0.35 + i * 0.2, 24]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={0.4}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}
      </group>
      <Sparkles count={12} scale={1.5} size={1.2} speed={1} color={color} />
    </group>
  )
}

// ============================================================================
// SUMMONING SPIRITS - Ethereal beings (OPTIMIZED)
// ============================================================================

interface SpiritProps {
  position: [number, number, number]
  color: string
  active?: boolean
}

export function SummoningSpirit({ position, color, active = true }: SpiritProps) {
  const groupRef = useRef<THREE.Group>(null)
  const frameCount = useRef(0)

  useFrame((state) => {
    if (!groupRef.current || !active) return

    frameCount.current++
    if (frameCount.current % PERF.frameSkip !== 0) return

    const t = state.clock.elapsedTime
    groupRef.current.position.y = position[1] + Math.sin(t * 1.5) * 0.15
    groupRef.current.rotation.y = t * 0.3
  })

  if (!active) return null

  return (
    <group ref={groupRef} position={position}>
      {/* Spirit core - simplified geometry */}
      <mesh>
        <sphereGeometry args={[0.2, 12, 12]} />
        <meshBasicMaterial color={color} transparent opacity={0.7} />
      </mesh>

      {/* Outer aura */}
      <mesh>
        <sphereGeometry args={[0.35, 12, 12]} />
        <meshBasicMaterial color={color} transparent opacity={0.15} />
      </mesh>

      {/* Minimal sparkles */}
      <Sparkles count={6} scale={0.8} size={1} speed={1.5} color={color} />
    </group>
  )
}

// ============================================================================
// ENERGY PULSE - Radial pulse effect (OPTIMIZED)
// ============================================================================

interface EnergyPulseProps {
  position: [number, number, number]
  color: string
  active?: boolean
  maxRadius?: number
}

export function EnergyPulse({ position, color, active = true, maxRadius = 6 }: EnergyPulseProps) {
  const ringRef = useRef<THREE.Mesh>(null)
  const radiusRef = useRef(0)

  useFrame((_, delta) => {
    if (!ringRef.current || !active) return

    radiusRef.current += delta * 1.5
    if (radiusRef.current > maxRadius) {
      radiusRef.current = 0
    }

    const scale = radiusRef.current / 2 + 0.1
    ringRef.current.scale.set(scale, scale, 1)

    const material = ringRef.current.material as THREE.MeshBasicMaterial
    material.opacity = Math.max(0, 1 - radiusRef.current / maxRadius) * 0.4
  })

  if (!active) return null

  return (
    <mesh ref={ringRef} position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[1.8, 2, 32]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.4}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

// ============================================================================
// CRYSTAL FORMATION - Decorative crystals (PERFORMANCE OPTIMIZED)
// ============================================================================

interface CrystalFormationProps {
  position: [number, number, number]
  color: string
  scale?: number
}

export function CrystalFormation({ position, color, scale = 1 }: CrystalFormationProps) {
  // Static - no animation for performance
  return (
    <group position={position} scale={scale}>
      {/* Main crystal - using StandardMaterial instead of Physical */}
      <mesh position={[0, 0.35, 0]}>
        <octahedronGeometry args={[0.15, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
          transparent
          opacity={0.7}
        />
      </mesh>
      {/* Secondary crystal */}
      <mesh position={[0.15, 0.2, 0.1]} rotation={[0.2, 0.3, 0.1]}>
        <octahedronGeometry args={[0.1, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.25}
          transparent
          opacity={0.6}
        />
      </mesh>
    </group>
  )
}

export default {
  EnergyBeam,
  SpellCircle,
  Aurora,
  FloatingRunes,
  WillOWisps,
  MagicParticles,
  PortalVortex,
  SummoningSpirit,
  EnergyPulse,
  CrystalFormation,
}
