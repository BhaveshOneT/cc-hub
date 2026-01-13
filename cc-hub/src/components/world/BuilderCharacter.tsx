import { useRef, useMemo, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { type BuilderState, BUILDER_COLORS } from '../../content/story'

// ============================================================================
// BUILDER CHARACTER - A friendly humanoid construction worker
// ============================================================================

interface BuilderCharacterProps {
  state: BuilderState
  targetPosition: [number, number, number]
  thought?: string
}

export function BuilderCharacter({ state, targetPosition, thought }: BuilderCharacterProps) {
  const groupRef = useRef<THREE.Group>(null)
  const bodyRef = useRef<THREE.Group>(null)
  const leftArmRef = useRef<THREE.Group>(null)
  const rightArmRef = useRef<THREE.Group>(null)
  const leftLegRef = useRef<THREE.Group>(null)
  const rightLegRef = useRef<THREE.Group>(null)
  const headRef = useRef<THREE.Group>(null)

  // Track if component is mounted and ready
  const [isReady, setIsReady] = useState(false)

  // Pre-create vectors to avoid GC (prevents blank objects on reload)
  // Initialize currentPos to target position to avoid lerp from origin
  const currentPos = useMemo(() => new THREE.Vector3(...targetPosition), []) // eslint-disable-line react-hooks/exhaustive-deps
  const targetVec = useMemo(() => new THREE.Vector3(), [])
  const prevPos = useMemo(() => new THREE.Vector3(...targetPosition), []) // eslint-disable-line react-hooks/exhaustive-deps

  const color = BUILDER_COLORS[state]

  // Set ready after first render to ensure refs are populated
  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      setIsReady(true)
    })
    return () => cancelAnimationFrame(timer)
  }, [])

  useFrame((frameState) => {
    if (!isReady || !groupRef.current || !bodyRef.current) return

    const t = frameState.clock.elapsedTime

    // Track previous position for rotation
    prevPos.copy(currentPos)

    // Smooth movement to target
    targetVec.set(...targetPosition)
    currentPos.lerp(targetVec, 0.03)
    groupRef.current.position.copy(currentPos)

    // Face movement direction
    const dx = currentPos.x - prevPos.x
    const dz = currentPos.z - prevPos.z
    if (Math.abs(dx) > 0.001 || Math.abs(dz) > 0.001) {
      const targetAngle = Math.atan2(dx, dz)
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetAngle,
        0.1
      )
    }

    // State-based animations
    switch (state) {
      case 'idle':
        // Gentle breathing
        if (bodyRef.current) {
          bodyRef.current.position.y = Math.sin(t * 2) * 0.02
        }
        // Slight arm sway
        if (leftArmRef.current) leftArmRef.current.rotation.x = Math.sin(t * 1.5) * 0.05
        if (rightArmRef.current) rightArmRef.current.rotation.x = Math.sin(t * 1.5 + 0.5) * 0.05
        break

      case 'walking':
        // Walking animation
        const walkSpeed = 8
        if (leftLegRef.current) leftLegRef.current.rotation.x = Math.sin(t * walkSpeed) * 0.5
        if (rightLegRef.current) rightLegRef.current.rotation.x = Math.sin(t * walkSpeed + Math.PI) * 0.5
        if (leftArmRef.current) leftArmRef.current.rotation.x = Math.sin(t * walkSpeed + Math.PI) * 0.4
        if (rightArmRef.current) rightArmRef.current.rotation.x = Math.sin(t * walkSpeed) * 0.4
        if (bodyRef.current) {
          bodyRef.current.position.y = Math.abs(Math.sin(t * walkSpeed)) * 0.05
        }
        break

      case 'thinking':
        // Hand on chin pose
        if (rightArmRef.current) {
          rightArmRef.current.rotation.x = -1.2
          rightArmRef.current.rotation.z = -0.3
        }
        if (leftArmRef.current) leftArmRef.current.rotation.x = 0.2
        if (headRef.current) {
          headRef.current.rotation.z = Math.sin(t * 0.5) * 0.1
        }
        break

      case 'working':
        // Active arm movements (hammering/building)
        const workSpeed = 6
        if (rightArmRef.current) {
          rightArmRef.current.rotation.x = -0.8 + Math.sin(t * workSpeed) * 0.5
        }
        if (leftArmRef.current) {
          leftArmRef.current.rotation.x = -0.5 + Math.sin(t * workSpeed + Math.PI) * 0.3
        }
        if (bodyRef.current) {
          bodyRef.current.rotation.z = Math.sin(t * workSpeed * 0.5) * 0.05
        }
        break

      case 'reading':
        // Both arms forward, head tilted down
        if (rightArmRef.current) {
          rightArmRef.current.rotation.x = -0.7
          rightArmRef.current.rotation.y = -0.2
        }
        if (leftArmRef.current) {
          leftArmRef.current.rotation.x = -0.7
          leftArmRef.current.rotation.y = 0.2
        }
        if (headRef.current) {
          headRef.current.rotation.x = 0.3
        }
        break

      case 'celebrating':
        // Arms up, bouncing
        if (rightArmRef.current) {
          rightArmRef.current.rotation.x = -2.5 + Math.sin(t * 4) * 0.3
          rightArmRef.current.rotation.z = 0.3
        }
        if (leftArmRef.current) {
          leftArmRef.current.rotation.x = -2.5 + Math.sin(t * 4 + 0.5) * 0.3
          leftArmRef.current.rotation.z = -0.3
        }
        if (bodyRef.current) {
          bodyRef.current.position.y = Math.abs(Math.sin(t * 6)) * 0.15
        }
        break

      case 'pointing':
        // Right arm extended, pointing
        if (rightArmRef.current) {
          rightArmRef.current.rotation.x = -1.3
          rightArmRef.current.rotation.y = 0.2
        }
        if (leftArmRef.current) {
          leftArmRef.current.rotation.x = 0.1
        }
        break
    }

    // Reset rotations for non-active states
    if (state !== 'thinking' && state !== 'reading' && headRef.current) {
      headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, 0, 0.1)
      headRef.current.rotation.z = THREE.MathUtils.lerp(headRef.current.rotation.z, 0, 0.1)
    }
  })

  return (
    <group ref={groupRef}>
      <group ref={bodyRef}>
        {/* BODY - Torso */}
        <mesh position={[0, 0.9, 0]}>
          <boxGeometry args={[0.5, 0.6, 0.25]} />
          <meshStandardMaterial color="#2563eb" roughness={0.8} />
        </mesh>

        {/* Vest/Overalls detail */}
        <mesh position={[0, 0.95, 0.13]}>
          <boxGeometry args={[0.45, 0.5, 0.02]} />
          <meshStandardMaterial color="#1d4ed8" roughness={0.9} />
        </mesh>

        {/* HEAD */}
        <group ref={headRef} position={[0, 1.45, 0]}>
          {/* Head shape */}
          <mesh>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshStandardMaterial color="#fcd9b6" roughness={0.9} />
          </mesh>

          {/* Hard hat */}
          <mesh position={[0, 0.12, 0]}>
            <cylinderGeometry args={[0.22, 0.24, 0.12, 16]} />
            <meshStandardMaterial color="#fbbf24" roughness={0.5} metalness={0.2} />
          </mesh>
          <mesh position={[0, 0.05, 0]}>
            <cylinderGeometry args={[0.28, 0.28, 0.04, 16]} />
            <meshStandardMaterial color="#fbbf24" roughness={0.5} metalness={0.2} />
          </mesh>

          {/* Eyes */}
          <mesh position={[-0.07, 0, 0.17]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshBasicMaterial color="#1e293b" />
          </mesh>
          <mesh position={[0.07, 0, 0.17]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshBasicMaterial color="#1e293b" />
          </mesh>

          {/* Eye whites */}
          <mesh position={[-0.07, 0, 0.15]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh position={[0.07, 0, 0.15]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>

          {/* Smile */}
          <mesh position={[0, -0.08, 0.18]} rotation={[0, 0, 0]}>
            <torusGeometry args={[0.05, 0.015, 8, 8, Math.PI]} />
            <meshBasicMaterial color="#7c3aed" />
          </mesh>
        </group>

        {/* LEFT ARM */}
        <group ref={leftArmRef} position={[-0.35, 1.05, 0]}>
          {/* Upper arm */}
          <mesh position={[0, -0.15, 0]}>
            <boxGeometry args={[0.12, 0.3, 0.12]} />
            <meshStandardMaterial color="#2563eb" roughness={0.8} />
          </mesh>
          {/* Lower arm (skin) */}
          <mesh position={[0, -0.4, 0]}>
            <boxGeometry args={[0.1, 0.25, 0.1]} />
            <meshStandardMaterial color="#fcd9b6" roughness={0.9} />
          </mesh>
          {/* Hand */}
          <mesh position={[0, -0.55, 0]}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshStandardMaterial color="#fcd9b6" roughness={0.9} />
          </mesh>
        </group>

        {/* RIGHT ARM */}
        <group ref={rightArmRef} position={[0.35, 1.05, 0]}>
          {/* Upper arm */}
          <mesh position={[0, -0.15, 0]}>
            <boxGeometry args={[0.12, 0.3, 0.12]} />
            <meshStandardMaterial color="#2563eb" roughness={0.8} />
          </mesh>
          {/* Lower arm (skin) */}
          <mesh position={[0, -0.4, 0]}>
            <boxGeometry args={[0.1, 0.25, 0.1]} />
            <meshStandardMaterial color="#fcd9b6" roughness={0.9} />
          </mesh>
          {/* Hand */}
          <mesh position={[0, -0.55, 0]}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshStandardMaterial color="#fcd9b6" roughness={0.9} />
          </mesh>
        </group>

        {/* LEGS */}
        {/* Left Leg */}
        <group ref={leftLegRef} position={[-0.12, 0.55, 0]}>
          <mesh position={[0, -0.25, 0]}>
            <boxGeometry args={[0.15, 0.5, 0.15]} />
            <meshStandardMaterial color="#475569" roughness={0.9} />
          </mesh>
          {/* Boot */}
          <mesh position={[0, -0.55, 0.03]}>
            <boxGeometry args={[0.16, 0.12, 0.22]} />
            <meshStandardMaterial color="#78350f" roughness={0.9} />
          </mesh>
        </group>

        {/* Right Leg */}
        <group ref={rightLegRef} position={[0.12, 0.55, 0]}>
          <mesh position={[0, -0.25, 0]}>
            <boxGeometry args={[0.15, 0.5, 0.15]} />
            <meshStandardMaterial color="#475569" roughness={0.9} />
          </mesh>
          {/* Boot */}
          <mesh position={[0, -0.55, 0.03]}>
            <boxGeometry args={[0.16, 0.12, 0.22]} />
            <meshStandardMaterial color="#78350f" roughness={0.9} />
          </mesh>
        </group>

        {/* Tool belt */}
        <mesh position={[0, 0.58, 0]}>
          <boxGeometry args={[0.52, 0.08, 0.28]} />
          <meshStandardMaterial color="#78350f" roughness={0.9} />
        </mesh>

        {/* Belt buckle */}
        <mesh position={[0, 0.58, 0.14]}>
          <boxGeometry args={[0.08, 0.06, 0.02]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>

      {/* State indicator - small glow */}
      <pointLight
        position={[0, 1.7, 0]}
        color={color}
        intensity={1.5}
        distance={3}
      />

      {/* Thought bubble */}
      {thought && <ThoughtBubble text={thought} />}

      {/* Shadow */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.4, 16]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.3} />
      </mesh>
    </group>
  )
}

// ============================================================================
// THOUGHT BUBBLE
// ============================================================================

function ThoughtBubble({ text }: { text: string }) {
  return (
    <Html position={[0, 2, 0]} center distanceFactor={10}>
      <div
        className="px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap bg-white/90 border border-amber-300 text-amber-800 shadow-lg"
      >
        {text}
      </div>
    </Html>
  )
}

export default BuilderCharacter
