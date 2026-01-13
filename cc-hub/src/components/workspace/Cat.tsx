import { useRef, useState, useEffect, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ============================================================================
// CAT - Cute animated cat companion with proper body shape
// ============================================================================

// Cat colors - cute orange tabby
const CAT_COLORS = {
  body: '#e8a45c',
  bodyDark: '#c4864a',
  bodyLight: '#f0b878',
  belly: '#f5dcc4',
  nose: '#ffb0b0',
  eyes: '#2d4a2d',
  eyeShine: '#ffffff',
  inner: '#f5c8b8',
  pawPads: '#e8a8a8',
}

// Behavior states
type CatBehavior =
  | 'sitting'
  | 'grooming'
  | 'stretching'
  | 'walking'
  | 'pawing'
  | 'sleeping'
  | 'looking_around'
  | 'tail_chase'
  | 'startled'  // Reaction to click
  | 'happy'     // Another click reaction
  | 'screen_block'

interface CatProps {
  onScreenBlock?: (blocked: boolean) => void
}

export function Cat({ onScreenBlock }: CatProps) {
  const groupRef = useRef<THREE.Group>(null)
  const [behavior, setBehavior] = useState<CatBehavior>('sitting')
  const [position, setPosition] = useState({ x: 0.9, y: 0.08, z: 0.4 })
  const [rotation, setRotation] = useState(-0.3)

  // Animation values
  const animRef = useRef({
    // Leg animations
    frontLeftLeg: 0,
    frontRightLeg: 0,
    backLeftLeg: 0,
    backRightLeg: 0,
    // Body animations
    bodyBob: 0,
    bodySquish: 0,  // For startled reaction
    tailWag: 0,
    tailCurl: 0.3,
    tailPuff: 1,    // For startled - tail puffs up
    // Head animations
    headTilt: 0,
    headTurn: 0,
    // Face
    earTwitch: 0,
    earFlatten: 0,  // For startled
    eyeBlink: 0,
    eyeWide: 0,     // For startled - eyes go wide
    eyeLook: 0,
    // General
    breathe: 0,
    walkCycle: 0,
    jumpScare: 0,   // Quick jump when startled
  })

  // Movement target
  const targetRef = useRef({ x: 0.9, z: 0.4, rotation: -0.3 })
  const behaviorTimeRef = useRef(0)
  const lastScreenBlockRef = useRef(0)
  const clickCountRef = useRef(0)

  // Pick random position on desk
  const getRandomDeskPos = () => ({
    x: -0.8 + Math.random() * 1.8,
    z: -0.2 + Math.random() * 0.8,
  })

  // Schedule next behavior
  const scheduleNextBehavior = useCallback(() => {
    behaviorTimeRef.current = 0

    // Very rare screen block (2% chance, 60s cooldown)
    const now = Date.now()
    if (Math.random() < 0.02 && now - lastScreenBlockRef.current > 60000) {
      lastScreenBlockRef.current = now
      setBehavior('screen_block')
      targetRef.current = { x: 0, z: -0.3, rotation: Math.PI }
      onScreenBlock?.(true)
      return 8000
    }

    // Regular behaviors - active on desk only
    const rand = Math.random()
    let nextBehavior: CatBehavior
    let duration: number

    if (rand < 0.25) {
      nextBehavior = 'walking'
      const pos = getRandomDeskPos()
      targetRef.current = { ...pos, rotation: Math.atan2(pos.x - position.x, pos.z - position.z) }
      duration = 2500 + Math.random() * 2500
    } else if (rand < 0.38) {
      nextBehavior = 'grooming'
      duration = 3000 + Math.random() * 3000
    } else if (rand < 0.50) {
      nextBehavior = 'pawing'
      duration = 2500 + Math.random() * 2000
    } else if (rand < 0.62) {
      nextBehavior = 'looking_around'
      duration = 2500 + Math.random() * 2500
    } else if (rand < 0.72) {
      nextBehavior = 'stretching'
      duration = 3000 + Math.random() * 2000
    } else if (rand < 0.82) {
      nextBehavior = 'tail_chase'
      duration = 2500 + Math.random() * 2000
    } else if (rand < 0.92) {
      nextBehavior = 'sleeping'
      duration = 5000 + Math.random() * 5000
    } else {
      nextBehavior = 'sitting'
      duration = 2000 + Math.random() * 2000
    }

    setBehavior(nextBehavior)
    return duration
  }, [position, onScreenBlock])

  // Start behavior loop
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>
    const loop = () => {
      const duration = scheduleNextBehavior()
      timeout = setTimeout(loop, duration)
    }
    timeout = setTimeout(loop, 2000)
    return () => clearTimeout(timeout)
  }, [scheduleNextBehavior])

  // Handle click - cat reacts!
  const handleClick = useCallback(() => {
    clickCountRef.current++
    const clickNum = clickCountRef.current

    if (behavior === 'screen_block') {
      // Move away from screen
      onScreenBlock?.(false)
      setBehavior('startled')
      const pos = getRandomDeskPos()
      targetRef.current = { ...pos, rotation: Math.random() * Math.PI * 2 }
      behaviorTimeRef.current = 0
      setTimeout(() => {
        if (clickCountRef.current === clickNum) {
          setBehavior('sitting')
        }
      }, 1500)
    } else if (behavior === 'sleeping') {
      // Wake up startled
      setBehavior('startled')
      behaviorTimeRef.current = 0
      setTimeout(() => {
        if (clickCountRef.current === clickNum) {
          setBehavior('looking_around')
        }
      }, 1200)
    } else {
      // Alternate between startled and happy reactions
      const reaction = Math.random() < 0.5 ? 'startled' : 'happy'
      setBehavior(reaction)
      behaviorTimeRef.current = 0
      setTimeout(() => {
        if (clickCountRef.current === clickNum) {
          setBehavior('sitting')
        }
      }, reaction === 'startled' ? 1000 : 1500)
    }
  }, [behavior, onScreenBlock])

  // Main animation loop
  useFrame((state, delta) => {
    const anim = animRef.current
    const time = state.clock.elapsedTime
    behaviorTimeRef.current += delta

    // Breathing (always)
    anim.breathe = Math.sin(time * 2) * 0.015

    // Eye blinking (random)
    if (behavior !== 'sleeping' && behavior !== 'startled') {
      if (Math.random() < 0.004) anim.eyeBlink = 1
      anim.eyeBlink *= 0.88
    }

    // Ear twitching (random)
    if (Math.random() < 0.012) anim.earTwitch = (Math.random() - 0.5) * 0.25
    anim.earTwitch *= 0.94

    // Default tail wag
    anim.tailWag = Math.sin(time * 2.5) * 0.15

    // Decay reaction values
    anim.bodySquish *= 0.92
    anim.jumpScare *= 0.88
    anim.eyeWide *= 0.9
    anim.earFlatten *= 0.9
    anim.tailPuff = THREE.MathUtils.lerp(anim.tailPuff, 1, delta * 3)

    // Movement for walking
    const isMoving = behavior === 'walking'

    if (isMoving) {
      const dx = targetRef.current.x - position.x
      const dz = targetRef.current.z - position.z
      const dist = Math.sqrt(dx * dx + dz * dz)

      if (dist > 0.05) {
        const moveSpeed = 1.0 * delta
        setPosition((p) => ({
          x: p.x + (dx / dist) * moveSpeed,
          y: 0.08,
          z: p.z + (dz / dist) * moveSpeed,
        }))
        const targetRot = Math.atan2(dx, dz)
        setRotation((r) => r + (targetRot - r) * delta * 4)
      }

      // Walk cycle
      anim.walkCycle += delta * 10
      anim.frontLeftLeg = Math.sin(anim.walkCycle) * 0.4
      anim.backRightLeg = Math.sin(anim.walkCycle) * 0.35
      anim.frontRightLeg = Math.sin(anim.walkCycle + Math.PI) * 0.4
      anim.backLeftLeg = Math.sin(anim.walkCycle + Math.PI) * 0.35
      anim.bodyBob = Math.abs(Math.sin(anim.walkCycle * 2)) * 0.02
      anim.tailCurl = 0.5
      anim.tailWag = Math.sin(time * 4) * 0.25
    } else {
      // Return legs to neutral
      anim.frontLeftLeg *= 0.9
      anim.frontRightLeg *= 0.9
      anim.backLeftLeg *= 0.9
      anim.backRightLeg *= 0.9
      anim.bodyBob *= 0.9
      anim.tailCurl = THREE.MathUtils.lerp(anim.tailCurl, 0.3, delta * 2)
    }

    // Behavior-specific animations
    switch (behavior) {
      case 'sitting':
        anim.headTilt = Math.sin(time * 0.7) * 0.08
        anim.eyeLook = Math.sin(time * 0.4) * 0.15
        break

      case 'grooming':
        anim.headTilt = -0.35 + Math.sin(time * 5) * 0.08
        anim.frontLeftLeg = -0.5 + Math.sin(time * 6) * 0.15
        anim.headTurn = 0.2
        break

      case 'stretching':
        const stretchT = Math.min(behaviorTimeRef.current / 2, 1)
        if (stretchT < 0.5) {
          anim.frontLeftLeg = -0.5 * (stretchT * 2)
          anim.frontRightLeg = -0.5 * (stretchT * 2)
          anim.bodyBob = -0.02 * (stretchT * 2)
        } else {
          anim.backLeftLeg = -0.25 * ((stretchT - 0.5) * 2)
          anim.backRightLeg = -0.25 * ((stretchT - 0.5) * 2)
          anim.bodyBob = 0.02 * ((stretchT - 0.5) * 2)
        }
        anim.tailCurl = 0.7
        break

      case 'pawing':
        anim.frontRightLeg = -Math.abs(Math.sin(time * 5)) * 0.6
        anim.headTilt = 0.15
        anim.headTurn = 0.25
        anim.tailWag = Math.sin(time * 3.5) * 0.3
        anim.eyeLook = 0.3
        break

      case 'looking_around':
        anim.headTurn = Math.sin(time * 1.3) * 0.5
        anim.headTilt = Math.sin(time * 1.8) * 0.15
        anim.eyeLook = Math.sin(time * 1.7) * 0.35
        anim.earTwitch = Math.sin(time * 2.5) * 0.12
        break

      case 'tail_chase':
        setRotation((r) => r + delta * 3.5)
        anim.tailWag = Math.sin(time * 7) * 0.4
        anim.headTurn = 0.7
        anim.walkCycle += delta * 12
        anim.frontLeftLeg = Math.sin(anim.walkCycle) * 0.25
        anim.frontRightLeg = Math.sin(anim.walkCycle + Math.PI) * 0.25
        break

      case 'sleeping':
        anim.eyeBlink = 0.95
        anim.breathe = Math.sin(time * 1.2) * 0.025
        anim.tailCurl = 0.5
        anim.tailWag = Math.sin(time * 0.4) * 0.04
        anim.headTilt = 0.1
        break

      case 'startled':
        // Jump and puff up!
        if (behaviorTimeRef.current < 0.15) {
          anim.jumpScare = 1
          anim.bodySquish = 0.15
          anim.eyeWide = 1
          anim.earFlatten = 1
          anim.tailPuff = 1.8
          anim.tailCurl = 0.9
        }
        anim.tailWag = Math.sin(time * 8) * 0.5
        break

      case 'happy':
        // Purring, kneading motion
        anim.eyeBlink = Math.sin(time * 2) * 0.3 + 0.3
        anim.frontLeftLeg = Math.sin(time * 4) * 0.15
        anim.frontRightLeg = Math.sin(time * 4 + Math.PI) * 0.15
        anim.tailWag = Math.sin(time * 3) * 0.35
        anim.tailCurl = 0.6
        anim.headTilt = Math.sin(time * 1.5) * 0.1
        anim.breathe = Math.sin(time * 3) * 0.02  // Purring
        break

      case 'screen_block':
        anim.headTilt = Math.sin(time * 1) * 0.12
        anim.tailWag = Math.sin(time * 2.2) * 0.3
        anim.eyeLook = Math.sin(time * 0.7) * 0.18
        setPosition((p) => ({
          x: THREE.MathUtils.lerp(p.x, 0, delta * 2),
          y: 0.08,
          z: THREE.MathUtils.lerp(p.z, -0.3, delta * 2),
        }))
        setRotation((r) => THREE.MathUtils.lerp(r, Math.PI, delta * 2.5))
        break
    }
  })

  return (
    <group
      ref={groupRef}
      position={[position.x, position.y + animRef.current.jumpScare * 0.08, position.z]}
      rotation={[0, rotation, 0]}
      onClick={handleClick}
      onPointerOver={() => (document.body.style.cursor = 'pointer')}
      onPointerOut={() => (document.body.style.cursor = 'auto')}
    >
      <CatModel anim={animRef.current} behavior={behavior} />
    </group>
  )
}

// ============================================================================
// CAT MODEL - Cute detailed cat with proper body shape
// ============================================================================

interface CatModelProps {
  anim: {
    frontLeftLeg: number
    frontRightLeg: number
    backLeftLeg: number
    backRightLeg: number
    bodyBob: number
    bodySquish: number
    tailWag: number
    tailCurl: number
    tailPuff: number
    headTilt: number
    headTurn: number
    earTwitch: number
    earFlatten: number
    eyeBlink: number
    eyeWide: number
    eyeLook: number
    breathe: number
  }
  behavior: CatBehavior
}

function CatModel({ anim, behavior }: CatModelProps) {
  const scale = 0.11
  const isSleeping = behavior === 'sleeping'

  // Body compression for startled reaction
  const squishY = 1 - anim.bodySquish
  const squishXZ = 1 + anim.bodySquish * 0.5

  return (
    <group scale={scale}>
      {/* === BODY === */}
      <group position={[0, 0.55 + anim.bodyBob, 0]} scale={[squishXZ, squishY, squishXZ]}>
        {/* Main torso - chest area (front, larger) */}
        <mesh position={[0, 0.15, 0.15]} castShadow>
          <sphereGeometry args={[0.32 + anim.breathe, 16, 16]} />
          <meshStandardMaterial color={CAT_COLORS.body} roughness={0.9} />
        </mesh>

        {/* Torso middle */}
        <mesh position={[0, 0.1, -0.05]} castShadow>
          <sphereGeometry args={[0.30 + anim.breathe, 16, 16]} />
          <meshStandardMaterial color={CAT_COLORS.body} roughness={0.9} />
        </mesh>

        {/* Torso back/hips (slightly smaller) */}
        <mesh position={[0, 0.08, -0.28]} castShadow>
          <sphereGeometry args={[0.28 + anim.breathe * 0.5, 16, 16]} />
          <meshStandardMaterial color={CAT_COLORS.body} roughness={0.9} />
        </mesh>

        {/* Back spine curve (gives cat-like silhouette) */}
        <mesh position={[0, 0.32, -0.05]} rotation={[0.2, 0, 0]} castShadow>
          <capsuleGeometry args={[0.12, 0.4, 6, 12]} />
          <meshStandardMaterial color={CAT_COLORS.body} roughness={0.9} />
        </mesh>

        {/* Belly (lighter underside) */}
        <mesh position={[0, -0.08, 0]} scale={[0.85, 0.6, 1.1]}>
          <sphereGeometry args={[0.28, 14, 14]} />
          <meshStandardMaterial color={CAT_COLORS.belly} roughness={0.95} />
        </mesh>

        {/* Chest fluff */}
        <mesh position={[0, 0.05, 0.35]} scale={[0.55, 0.5, 0.35]}>
          <sphereGeometry args={[0.25, 12, 12]} />
          <meshStandardMaterial color={CAT_COLORS.belly} roughness={0.95} />
        </mesh>

        {/* Shoulder bumps */}
        <mesh position={[-0.18, 0.18, 0.12]} scale={[0.7, 0.8, 0.8]}>
          <sphereGeometry args={[0.15, 10, 10]} />
          <meshStandardMaterial color={CAT_COLORS.body} roughness={0.9} />
        </mesh>
        <mesh position={[0.18, 0.18, 0.12]} scale={[0.7, 0.8, 0.8]}>
          <sphereGeometry args={[0.15, 10, 10]} />
          <meshStandardMaterial color={CAT_COLORS.body} roughness={0.9} />
        </mesh>

        {/* Hip bumps */}
        <mesh position={[-0.15, 0.05, -0.25]} scale={[0.8, 0.7, 0.8]}>
          <sphereGeometry args={[0.14, 10, 10]} />
          <meshStandardMaterial color={CAT_COLORS.body} roughness={0.9} />
        </mesh>
        <mesh position={[0.15, 0.05, -0.25]} scale={[0.8, 0.7, 0.8]}>
          <sphereGeometry args={[0.14, 10, 10]} />
          <meshStandardMaterial color={CAT_COLORS.body} roughness={0.9} />
        </mesh>
      </group>

      {/* === NECK === */}
      <mesh position={[0, 0.75 + anim.bodyBob, 0.32]} rotation={[0.3, 0, 0]} castShadow>
        <capsuleGeometry args={[0.12, 0.15, 6, 12]} />
        <meshStandardMaterial color={CAT_COLORS.body} roughness={0.9} />
      </mesh>

      {/* === HEAD === */}
      <group
        position={[0, 0.88 + anim.bodyBob, 0.42]}
        rotation={[anim.headTilt, anim.headTurn, 0]}
      >
        {/* Main head */}
        <mesh castShadow>
          <sphereGeometry args={[0.28, 16, 16]} />
          <meshStandardMaterial color={CAT_COLORS.body} roughness={0.9} />
        </mesh>

        {/* Forehead (slightly protruding) */}
        <mesh position={[0, 0.08, 0.12]} scale={[1, 0.8, 0.7]}>
          <sphereGeometry args={[0.18, 12, 12]} />
          <meshStandardMaterial color={CAT_COLORS.body} roughness={0.9} />
        </mesh>

        {/* Cheeks */}
        <mesh position={[-0.14, -0.05, 0.1]} scale={[0.7, 0.65, 0.6]}>
          <sphereGeometry args={[0.14, 10, 10]} />
          <meshStandardMaterial color={CAT_COLORS.bodyLight} roughness={0.9} />
        </mesh>
        <mesh position={[0.14, -0.05, 0.1]} scale={[0.7, 0.65, 0.6]}>
          <sphereGeometry args={[0.14, 10, 10]} />
          <meshStandardMaterial color={CAT_COLORS.bodyLight} roughness={0.9} />
        </mesh>

        {/* Muzzle */}
        <mesh position={[0, -0.08, 0.2]} scale={[0.55, 0.4, 0.45]}>
          <sphereGeometry args={[0.15, 12, 12]} />
          <meshStandardMaterial color={CAT_COLORS.belly} roughness={0.95} />
        </mesh>

        {/* Nose */}
        <mesh position={[0, -0.03, 0.28]}>
          <sphereGeometry args={[0.045, 8, 8]} />
          <meshStandardMaterial color={CAT_COLORS.nose} roughness={0.5} />
        </mesh>

        {/* Mouth line */}
        <mesh position={[0, -0.1, 0.24]} rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.008, 0.03, 4, 8]} />
          <meshStandardMaterial color={CAT_COLORS.nose} roughness={0.8} />
        </mesh>

        {/* === EYES === */}
        <group position={[0, 0.03, 0.18]}>
          {/* Left eye */}
          <group position={[-0.1, 0, 0]}>
            {/* Eye white */}
            <mesh>
              <sphereGeometry args={[0.07, 14, 14]} />
              <meshStandardMaterial color="#fffff8" />
            </mesh>
            {/* Iris/Pupil */}
            <mesh
              position={[anim.eyeLook * 0.015, 0, 0.04]}
              scale={[1, 1 - anim.eyeBlink * 0.9, 1]}
            >
              <sphereGeometry args={[0.05 + anim.eyeWide * 0.015, 12, 12]} />
              <meshStandardMaterial color={CAT_COLORS.eyes} />
            </mesh>
            {/* Pupil slit */}
            <mesh
              position={[anim.eyeLook * 0.015, 0, 0.055]}
              scale={[0.3, (1 - anim.eyeBlink * 0.9) * (1 - anim.eyeWide * 0.3), 1]}
            >
              <sphereGeometry args={[0.035, 8, 8]} />
              <meshStandardMaterial color="#111111" />
            </mesh>
            {/* Eye shine */}
            <mesh position={[-0.015, 0.025, 0.06]}>
              <sphereGeometry args={[0.015, 6, 6]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            {/* Eyelid */}
            <mesh
              position={[0, 0.04 - anim.eyeBlink * 0.08, 0.01]}
              scale={[1.15, Math.max(0.01, anim.eyeBlink), 1]}
            >
              <sphereGeometry args={[0.07, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshStandardMaterial color={CAT_COLORS.body} />
            </mesh>
          </group>

          {/* Right eye */}
          <group position={[0.1, 0, 0]}>
            <mesh>
              <sphereGeometry args={[0.07, 14, 14]} />
              <meshStandardMaterial color="#fffff8" />
            </mesh>
            <mesh
              position={[anim.eyeLook * 0.015, 0, 0.04]}
              scale={[1, 1 - anim.eyeBlink * 0.9, 1]}
            >
              <sphereGeometry args={[0.05 + anim.eyeWide * 0.015, 12, 12]} />
              <meshStandardMaterial color={CAT_COLORS.eyes} />
            </mesh>
            <mesh
              position={[anim.eyeLook * 0.015, 0, 0.055]}
              scale={[0.3, (1 - anim.eyeBlink * 0.9) * (1 - anim.eyeWide * 0.3), 1]}
            >
              <sphereGeometry args={[0.035, 8, 8]} />
              <meshStandardMaterial color="#111111" />
            </mesh>
            <mesh position={[0.015, 0.025, 0.06]}>
              <sphereGeometry args={[0.015, 6, 6]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            <mesh
              position={[0, 0.04 - anim.eyeBlink * 0.08, 0.01]}
              scale={[1.15, Math.max(0.01, anim.eyeBlink), 1]}
            >
              <sphereGeometry args={[0.07, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshStandardMaterial color={CAT_COLORS.body} />
            </mesh>
          </group>
        </group>

        {/* === EARS === */}
        {/* Left ear */}
        <group
          position={[-0.16, 0.22, -0.02]}
          rotation={[0.15 - anim.earFlatten * 0.4, -0.15, -0.15 + anim.earTwitch]}
        >
          <mesh castShadow>
            <coneGeometry args={[0.09, 0.18, 4]} />
            <meshStandardMaterial color={CAT_COLORS.body} roughness={0.9} />
          </mesh>
          <mesh position={[0, -0.015, 0.02]} scale={[0.6, 0.75, 0.5]}>
            <coneGeometry args={[0.07, 0.13, 4]} />
            <meshStandardMaterial color={CAT_COLORS.inner} roughness={0.95} />
          </mesh>
        </group>

        {/* Right ear */}
        <group
          position={[0.16, 0.22, -0.02]}
          rotation={[0.15 - anim.earFlatten * 0.4, 0.15, 0.15 - anim.earTwitch]}
        >
          <mesh castShadow>
            <coneGeometry args={[0.09, 0.18, 4]} />
            <meshStandardMaterial color={CAT_COLORS.body} roughness={0.9} />
          </mesh>
          <mesh position={[0, -0.015, 0.02]} scale={[0.6, 0.75, 0.5]}>
            <coneGeometry args={[0.07, 0.13, 4]} />
            <meshStandardMaterial color={CAT_COLORS.inner} roughness={0.95} />
          </mesh>
        </group>

        {/* Whiskers */}
        {[-0.06, 0, 0.06].map((yOff, i) => (
          <group key={i} position={[0, -0.07 + yOff * 0.25, 0.22]}>
            <mesh position={[-0.08, 0, 0]} rotation={[0, 0.25 + i * 0.08, yOff * 0.4]}>
              <cylinderGeometry args={[0.003, 0.001, 0.18, 4]} />
              <meshStandardMaterial color="#ffffff" transparent opacity={0.6} />
            </mesh>
            <mesh position={[0.08, 0, 0]} rotation={[0, -0.25 - i * 0.08, -yOff * 0.4]}>
              <cylinderGeometry args={[0.003, 0.001, 0.18, 4]} />
              <meshStandardMaterial color="#ffffff" transparent opacity={0.6} />
            </mesh>
          </group>
        ))}
      </group>

      {/* === FRONT LEFT LEG === */}
      <group position={[-0.16, 0.38, 0.22]} rotation={[anim.frontLeftLeg, 0, 0]}>
        <mesh position={[0, -0.1, 0]} castShadow>
          <capsuleGeometry args={[0.055, 0.15, 6, 10]} />
          <meshStandardMaterial color={CAT_COLORS.body} roughness={0.9} />
        </mesh>
        <group position={[0, -0.25, 0]} rotation={[-anim.frontLeftLeg * 0.4, 0, 0]}>
          <mesh castShadow>
            <capsuleGeometry args={[0.045, 0.12, 6, 10]} />
            <meshStandardMaterial color={CAT_COLORS.body} roughness={0.9} />
          </mesh>
          <mesh position={[0, -0.12, 0.025]}>
            <sphereGeometry args={[0.055, 8, 8]} />
            <meshStandardMaterial color={CAT_COLORS.body} roughness={0.9} />
          </mesh>
          <mesh position={[0, -0.13, 0.05]}>
            <sphereGeometry args={[0.03, 6, 6]} />
            <meshStandardMaterial color={CAT_COLORS.pawPads} roughness={0.7} />
          </mesh>
        </group>
      </group>

      {/* === FRONT RIGHT LEG === */}
      <group position={[0.16, 0.38, 0.22]} rotation={[anim.frontRightLeg, 0, 0]}>
        <mesh position={[0, -0.1, 0]} castShadow>
          <capsuleGeometry args={[0.055, 0.15, 6, 10]} />
          <meshStandardMaterial color={CAT_COLORS.body} roughness={0.9} />
        </mesh>
        <group position={[0, -0.25, 0]} rotation={[-anim.frontRightLeg * 0.4, 0, 0]}>
          <mesh castShadow>
            <capsuleGeometry args={[0.045, 0.12, 6, 10]} />
            <meshStandardMaterial color={CAT_COLORS.body} roughness={0.9} />
          </mesh>
          <mesh position={[0, -0.12, 0.025]}>
            <sphereGeometry args={[0.055, 8, 8]} />
            <meshStandardMaterial color={CAT_COLORS.body} roughness={0.9} />
          </mesh>
          <mesh position={[0, -0.13, 0.05]}>
            <sphereGeometry args={[0.03, 6, 6]} />
            <meshStandardMaterial color={CAT_COLORS.pawPads} roughness={0.7} />
          </mesh>
        </group>
      </group>

      {/* === BACK LEFT LEG === */}
      <group position={[-0.15, 0.42, -0.22]} rotation={[anim.backLeftLeg, 0, 0]}>
        <mesh position={[0, -0.08, 0.03]} rotation={[0.25, 0, 0]} castShadow>
          <capsuleGeometry args={[0.07, 0.12, 6, 10]} />
          <meshStandardMaterial color={CAT_COLORS.body} roughness={0.9} />
        </mesh>
        <group position={[0, -0.24, 0.05]} rotation={[-anim.backLeftLeg * 0.25 - 0.15, 0, 0]}>
          <mesh castShadow>
            <capsuleGeometry args={[0.045, 0.15, 6, 10]} />
            <meshStandardMaterial color={CAT_COLORS.body} roughness={0.9} />
          </mesh>
          <mesh position={[0, -0.13, 0.025]}>
            <sphereGeometry args={[0.055, 8, 8]} />
            <meshStandardMaterial color={CAT_COLORS.body} roughness={0.9} />
          </mesh>
          <mesh position={[0, -0.14, 0.05]}>
            <sphereGeometry args={[0.03, 6, 6]} />
            <meshStandardMaterial color={CAT_COLORS.pawPads} roughness={0.7} />
          </mesh>
        </group>
      </group>

      {/* === BACK RIGHT LEG === */}
      <group position={[0.15, 0.42, -0.22]} rotation={[anim.backRightLeg, 0, 0]}>
        <mesh position={[0, -0.08, 0.03]} rotation={[0.25, 0, 0]} castShadow>
          <capsuleGeometry args={[0.07, 0.12, 6, 10]} />
          <meshStandardMaterial color={CAT_COLORS.body} roughness={0.9} />
        </mesh>
        <group position={[0, -0.24, 0.05]} rotation={[-anim.backRightLeg * 0.25 - 0.15, 0, 0]}>
          <mesh castShadow>
            <capsuleGeometry args={[0.045, 0.15, 6, 10]} />
            <meshStandardMaterial color={CAT_COLORS.body} roughness={0.9} />
          </mesh>
          <mesh position={[0, -0.13, 0.025]}>
            <sphereGeometry args={[0.055, 8, 8]} />
            <meshStandardMaterial color={CAT_COLORS.body} roughness={0.9} />
          </mesh>
          <mesh position={[0, -0.14, 0.05]}>
            <sphereGeometry args={[0.03, 6, 6]} />
            <meshStandardMaterial color={CAT_COLORS.pawPads} roughness={0.7} />
          </mesh>
        </group>
      </group>

      {/* === TAIL === */}
      <group
        position={[0, 0.5 + anim.bodyBob, -0.4]}
        rotation={[-0.4 + anim.tailCurl, anim.tailWag, 0]}
        scale={[anim.tailPuff, 1, anim.tailPuff]}
      >
        <mesh castShadow>
          <capsuleGeometry args={[0.04 * anim.tailPuff, 0.2, 6, 10]} />
          <meshStandardMaterial color={CAT_COLORS.body} roughness={0.9} />
        </mesh>
        <group position={[0, 0.16, 0]} rotation={[anim.tailCurl * 0.4, anim.tailWag * 0.6, 0]}>
          <mesh castShadow>
            <capsuleGeometry args={[0.035 * anim.tailPuff, 0.18, 6, 10]} />
            <meshStandardMaterial color={CAT_COLORS.body} roughness={0.9} />
          </mesh>
          <group position={[0, 0.14, 0]} rotation={[anim.tailCurl * 0.25, anim.tailWag * 0.4, 0]}>
            <mesh castShadow>
              <capsuleGeometry args={[0.025 * anim.tailPuff, 0.14, 6, 10]} />
              <meshStandardMaterial color={CAT_COLORS.bodyDark} roughness={0.9} />
            </mesh>
          </group>
        </group>
      </group>

      {/* Tabby stripes on back */}
      {!isSleeping && [0.12, 0, -0.12, -0.24].map((zOff, i) => (
        <mesh
          key={i}
          position={[0, 0.78 + anim.bodyBob, zOff - 0.05]}
          rotation={[0.1, 0, Math.PI / 2]}
          scale={[0.08, 0.012, 0.18 - i * 0.02]}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial
            color={CAT_COLORS.bodyDark}
            roughness={0.95}
            transparent
            opacity={0.35}
          />
        </mesh>
      ))}
    </group>
  )
}

export default Cat
