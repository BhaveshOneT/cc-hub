import { useRef, useMemo, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, Float, Sparkles } from '@react-three/drei'
import * as THREE from 'three'

// Centralized configuration (DRY)
import { WIZARD_COLORS as COLORS, WIZARD_AURA_COLORS } from '../../lib/theme'

// ============================================================================
// WIZARD CHARACTER - The Archmage protagonist (FULL REBUILD)
// Enhanced with: facial features, articulated fingers, smooth transitions,
// secondary motion, and eye tracking
// ============================================================================

export type WizardState =
  | 'idle'
  | 'walking'
  | 'thinking'
  | 'working'      // Spell casting
  | 'reading'
  | 'celebrating'
  | 'pointing'
  | 'channeling'   // Power flow
  | 'summoning'    // Conjuring spirits

interface WizardCharacterProps {
  state: WizardState
  targetPosition: [number, number, number]
  thought?: string
  lookAtTarget?: [number, number, number]  // What the wizard's eyes track
}

// ============================================================================
// POSE DEFINITIONS - Target rotations for each state
// ============================================================================

interface PoseConfig {
  // Body
  bodyY: number
  bodyRotX: number
  bodyRotZ: number
  // Head
  headRotX: number
  headRotY: number
  headRotZ: number
  // Arms (euler rotations)
  leftArmX: number
  leftArmZ: number
  rightArmX: number
  rightArmZ: number
  // Forearms
  leftForearmX: number
  rightForearmX: number
  // Staff
  staffRotZ: number
  // Hands (finger curl 0 = open, 1 = fist)
  leftHandCurl: number
  rightHandCurl: number
  // Special
  breatheIntensity: number
  floatIntensity: number
}

const BASE_POSE: PoseConfig = {
  bodyY: 0,
  bodyRotX: 0,
  bodyRotZ: 0,
  headRotX: 0,
  headRotY: 0,
  headRotZ: 0,
  leftArmX: 0,
  leftArmZ: 0.3,
  rightArmX: 0,
  rightArmZ: -0.3,
  leftForearmX: 0,
  rightForearmX: 0,
  staffRotZ: 0,
  leftHandCurl: 0.3,
  rightHandCurl: 0.5,
  breatheIntensity: 1,
  floatIntensity: 0,
}

const STATE_POSES: Record<WizardState, Partial<PoseConfig>> = {
  idle: {
    breatheIntensity: 1,
    leftHandCurl: 0.3,
    rightHandCurl: 0.5,
  },
  walking: {
    bodyY: 0.05,
    floatIntensity: 0.3,
    leftHandCurl: 0.4,
    rightHandCurl: 0.5,
  },
  thinking: {
    rightArmX: -1.0,
    rightArmZ: -0.3,
    rightForearmX: -1.5,
    headRotX: 0.1,
    headRotZ: 0.05,
    leftHandCurl: 0.2,
    rightHandCurl: 0.8,  // Chin stroke
  },
  working: {
    leftArmX: -0.8,
    leftArmZ: 0.5,
    rightArmX: -0.8,
    rightArmZ: -0.3,
    leftForearmX: -0.5,
    rightForearmX: -0.5,
    leftHandCurl: 0,  // Open palm
    rightHandCurl: 0.5,
    floatIntensity: 0.5,
  },
  reading: {
    bodyRotX: 0.15,
    headRotX: 0.3,
    leftArmX: -0.6,
    leftArmZ: 0.3,
    rightArmX: -0.6,
    rightArmZ: -0.3,
    leftForearmX: -0.8,
    rightForearmX: -0.8,
    leftHandCurl: 0.7,
    rightHandCurl: 0.7,
  },
  celebrating: {
    leftArmX: -2.5,
    rightArmX: -2.5,
    leftHandCurl: 0,  // Spread fingers
    rightHandCurl: 0.5,
    headRotX: -0.2,
    floatIntensity: 1,
  },
  pointing: {
    rightArmX: -1.2,
    rightArmZ: -0.2,
    rightForearmX: -0.3,
    staffRotZ: -0.3,
    headRotY: 0.1,
    leftHandCurl: 0.3,
    rightHandCurl: 0.8,  // Pointing finger
  },
  channeling: {
    leftArmX: -1.5,
    leftArmZ: 0.5,
    rightArmX: -1.5,
    rightArmZ: -0.5,
    leftForearmX: -0.3,
    rightForearmX: -0.3,
    bodyY: 0.1,
    leftHandCurl: 0,
    rightHandCurl: 0,
    floatIntensity: 0.8,
  },
  summoning: {
    leftArmX: -1.0,
    leftArmZ: 0.3,
    rightArmX: -1.0,
    rightArmZ: -0.3,
    bodyRotZ: 0.05,
    leftHandCurl: 0.1,
    rightHandCurl: 0.1,
    floatIntensity: 0.6,
  },
}

// ============================================================================
// HELPER: Smooth interpolation for pose transitions
// ============================================================================

function lerpPose(current: PoseConfig, target: PoseConfig, t: number): PoseConfig {
  const result = { ...current }
  for (const key in target) {
    const k = key as keyof PoseConfig
    result[k] = THREE.MathUtils.lerp(current[k], target[k], t)
  }
  return result
}

// ============================================================================
// ARTICULATED HAND COMPONENT
// ============================================================================

interface HandProps {
  isLeft: boolean
  curl: number  // 0 = open, 1 = fist
  pose?: 'open' | 'fist' | 'point' | 'spread'
}

function ArticulatedHand({ isLeft, curl, pose = 'open' }: HandProps) {
  const mirror = isLeft ? -1 : 1

  // Finger configurations based on pose
  const getFingerCurl = (fingerIndex: number): number => {
    if (pose === 'point' && fingerIndex === 1) return 0.1  // Index extended
    if (pose === 'spread') return 0.1
    return curl
  }

  const fingerConfigs = [
    { name: 'thumb', basePos: [0.04 * mirror, 0, 0.02], length: 0.025, segments: 2, baseRot: [0, 0, -0.5 * mirror] },
    { name: 'index', basePos: [0.025 * mirror, 0, 0.035], length: 0.03, segments: 3, baseRot: [0, 0, -0.1 * mirror] },
    { name: 'middle', basePos: [0, 0, 0.038], length: 0.035, segments: 3, baseRot: [0, 0, 0] },
    { name: 'ring', basePos: [-0.025 * mirror, 0, 0.035], length: 0.03, segments: 3, baseRot: [0, 0, 0.1 * mirror] },
    { name: 'pinky', basePos: [-0.04 * mirror, 0, 0.03], length: 0.025, segments: 3, baseRot: [0, 0, 0.2 * mirror] },
  ]

  return (
    <group>
      {/* Palm */}
      <mesh>
        <boxGeometry args={[0.06, 0.02, 0.05]} />
        <meshStandardMaterial color={COLORS.skin} roughness={0.8} />
      </mesh>

      {/* Fingers */}
      {fingerConfigs.map((finger, i) => {
        const fingerCurl = getFingerCurl(i)
        const curlAngle = fingerCurl * 1.5  // Max curl angle

        return (
          <group
            key={finger.name}
            position={finger.basePos as [number, number, number]}
            rotation={finger.baseRot as [number, number, number]}
          >
            {/* First segment */}
            <group rotation={[curlAngle * 0.4, 0, 0]}>
              <mesh position={[0, 0, finger.length / 2]}>
                <capsuleGeometry args={[0.008, finger.length, 4, 8]} />
                <meshStandardMaterial color={COLORS.skin} roughness={0.8} />
              </mesh>

              {finger.segments >= 2 && (
                <group position={[0, 0, finger.length]} rotation={[curlAngle * 0.5, 0, 0]}>
                  <mesh position={[0, 0, finger.length * 0.4]}>
                    <capsuleGeometry args={[0.007, finger.length * 0.8, 4, 8]} />
                    <meshStandardMaterial color={COLORS.skin} roughness={0.8} />
                  </mesh>

                  {finger.segments >= 3 && (
                    <group position={[0, 0, finger.length * 0.8]} rotation={[curlAngle * 0.6, 0, 0]}>
                      <mesh position={[0, 0, finger.length * 0.3]}>
                        <capsuleGeometry args={[0.006, finger.length * 0.6, 4, 8]} />
                        <meshStandardMaterial color={COLORS.skin} roughness={0.8} />
                      </mesh>
                    </group>
                  )}
                </group>
              )}
            </group>
          </group>
        )
      })}
    </group>
  )
}

// ============================================================================
// FACIAL FEATURES COMPONENT
// ============================================================================

interface FaceProps {
  blinkProgress: number  // 0 = open, 1 = closed
  lookDirection: [number, number]  // x, y offset for eye direction
  mouthOpen: number  // 0 = closed, 1 = open (for talking/spells)
  eyebrowRaise: number  // -1 = frown, 0 = neutral, 1 = raised
}

function Face({ blinkProgress, lookDirection, mouthOpen, eyebrowRaise }: FaceProps) {
  const eyeScale = 1 - blinkProgress * 0.8

  return (
    <group>
      {/* Nose */}
      <mesh position={[0, -0.02, 0.16]} rotation={[0.3, 0, 0]}>
        <coneGeometry args={[0.025, 0.06, 6]} />
        <meshStandardMaterial color={COLORS.nose} roughness={0.85} />
      </mesh>

      {/* Nose bridge */}
      <mesh position={[0, 0.04, 0.155]}>
        <boxGeometry args={[0.025, 0.06, 0.02]} />
        <meshStandardMaterial color={COLORS.nose} roughness={0.85} />
      </mesh>

      {/* Eyes */}
      {[-0.06, 0.06].map((x, i) => (
        <group key={i} position={[x, 0.03, 0.13]}>
          {/* Eye socket depression (subtle) */}
          <mesh position={[0, 0, -0.01]}>
            <sphereGeometry args={[0.035, 8, 8]} />
            <meshStandardMaterial color={COLORS.skinDark} roughness={0.9} />
          </mesh>

          {/* Eye white */}
          <group scale={[1, eyeScale, 1]}>
            <mesh>
              <sphereGeometry args={[0.028, 12, 12]} />
              <meshStandardMaterial color={COLORS.eyeWhite} roughness={0.3} />
            </mesh>

            {/* Iris */}
            <mesh position={[lookDirection[0] * 0.01, lookDirection[1] * 0.01, 0.015]}>
              <sphereGeometry args={[0.015, 10, 10]} />
              <meshStandardMaterial color={COLORS.eyeIris} roughness={0.4} />
            </mesh>

            {/* Pupil */}
            <mesh position={[lookDirection[0] * 0.012, lookDirection[1] * 0.012, 0.022]}>
              <sphereGeometry args={[0.008, 8, 8]} />
              <meshBasicMaterial color={COLORS.eyePupil} />
            </mesh>

            {/* Eye highlight */}
            <mesh position={[0.005, 0.005, 0.025]}>
              <sphereGeometry args={[0.004, 6, 6]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          </group>

          {/* Eyelid (for blinking) */}
          <mesh
            position={[0, 0.015 + blinkProgress * 0.01, 0.02]}
            scale={[1, 0.3 + blinkProgress * 0.7, 1]}
          >
            <sphereGeometry args={[0.03, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color={COLORS.skin} roughness={0.8} />
          </mesh>
        </group>
      ))}

      {/* Eyebrows */}
      {[-0.06, 0.06].map((x, i) => (
        <mesh
          key={`brow-${i}`}
          position={[x, 0.08 + eyebrowRaise * 0.02, 0.14]}
          rotation={[0, 0, (i === 0 ? 0.2 : -0.2) - eyebrowRaise * 0.1]}
        >
          <boxGeometry args={[0.04, 0.012, 0.015]} />
          <meshStandardMaterial color={COLORS.beardDark} roughness={0.9} />
        </mesh>
      ))}

      {/* Mouth */}
      <group position={[0, -0.1, 0.12]}>
        {/* Upper lip */}
        <mesh position={[0, 0.005, 0]}>
          <capsuleGeometry args={[0.015, 0.04, 4, 8]} />
          <meshStandardMaterial color={COLORS.mouth} roughness={0.7} />
        </mesh>

        {/* Lower lip */}
        <mesh position={[0, -0.008 - mouthOpen * 0.02, 0]} rotation={[mouthOpen * 0.3, 0, 0]}>
          <capsuleGeometry args={[0.012, 0.035, 4, 8]} />
          <meshStandardMaterial color={COLORS.mouth} roughness={0.7} />
        </mesh>

        {/* Mouth interior (when open) */}
        {mouthOpen > 0.1 && (
          <mesh position={[0, -0.005, -0.01]}>
            <sphereGeometry args={[0.015 * mouthOpen, 6, 6]} />
            <meshBasicMaterial color="#1a0a0a" />
          </mesh>
        )}
      </group>

      {/* Cheekbones (subtle) */}
      {[-0.1, 0.1].map((x, i) => (
        <mesh key={`cheek-${i}`} position={[x, -0.02, 0.08]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color={COLORS.skin} roughness={0.85} />
        </mesh>
      ))}

      {/* Chin */}
      <mesh position={[0, -0.14, 0.08]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color={COLORS.skin} roughness={0.85} />
      </mesh>
    </group>
  )
}

// ============================================================================
// ROBE WITH SECONDARY MOTION
// ============================================================================

interface RobeProps {
  swayAmount: [number, number]  // x, z sway
  breatheScale: number
}

function EnhancedRobe({ swayAmount, breatheScale }: RobeProps) {
  return (
    <group>
      {/* Main robe body - torso */}
      <mesh position={[0, 0.3, 0]} scale={[1, breatheScale, 1]}>
        <cylinderGeometry args={[0.22, 0.35, 0.8, 12]} />
        <meshStandardMaterial color={COLORS.robes} roughness={0.75} />
      </mesh>

      {/* Robe collar */}
      <mesh position={[0, 0.65, 0]}>
        <torusGeometry args={[0.18, 0.04, 8, 16]} />
        <meshStandardMaterial color={COLORS.robesDark} roughness={0.7} />
      </mesh>

      {/* Robe bottom flare with sway */}
      <group position={[swayAmount[0] * 0.05, -0.1, swayAmount[1] * 0.05]}>
        <mesh>
          <coneGeometry args={[0.45, 0.5, 12]} />
          <meshStandardMaterial color={COLORS.robes} roughness={0.75} />
        </mesh>

        {/* Robe hem - outer edge */}
        <mesh position={[0, -0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.42, 0.025, 8, 24]} />
          <meshStandardMaterial color={COLORS.trim} metalness={0.5} roughness={0.4} />
        </mesh>
      </group>

      {/* Inner robe visible at front */}
      <mesh position={[0, 0.25, 0.15]}>
        <boxGeometry args={[0.18, 0.6, 0.05]} />
        <meshStandardMaterial color={COLORS.robesInner} roughness={0.7} />
      </mesh>

      {/* Decorative trim lines */}
      {[-0.15, 0.15].map((x, i) => (
        <mesh key={i} position={[x, 0.25, 0.12]}>
          <boxGeometry args={[0.015, 0.55, 0.02]} />
          <meshStandardMaterial color={COLORS.trim} metalness={0.6} roughness={0.4} />
        </mesh>
      ))}

      {/* Gold belt with buckle */}
      <mesh position={[0, 0.1, 0]}>
        <torusGeometry args={[0.24, 0.035, 8, 24]} />
        <meshStandardMaterial color={COLORS.trim} metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Belt buckle */}
      <mesh position={[0, 0.1, 0.24]}>
        <boxGeometry args={[0.06, 0.08, 0.02]} />
        <meshStandardMaterial color={COLORS.trimDark} metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Belt pouch */}
      <mesh position={[0.2, 0.05, 0.15]} rotation={[0, -0.3, 0]}>
        <boxGeometry args={[0.08, 0.1, 0.06]} />
        <meshStandardMaterial color={COLORS.staffWood} roughness={0.85} />
      </mesh>
    </group>
  )
}

// ============================================================================
// ENHANCED STAFF
// ============================================================================

interface StaffProps {
  glowIntensity: number
  rotation: number
}

function EnhancedStaff({ glowIntensity, rotation }: StaffProps) {
  return (
    <group rotation={[0, 0, rotation]}>
      {/* Staff shaft - main body */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.025, 0.04, 1.4, 8]} />
        <meshStandardMaterial color={COLORS.staffWood} roughness={0.75} />
      </mesh>

      {/* Carved grip section */}
      <group position={[0, 0.1, 0]}>
        {[0, 0.08, 0.16].map((y, i) => (
          <mesh key={i} position={[0, y, 0]}>
            <torusGeometry args={[0.03, 0.008, 6, 12]} />
            <meshStandardMaterial color={COLORS.staffWoodLight} roughness={0.7} />
          </mesh>
        ))}
      </group>

      {/* Crystal holder - ornate metal cage */}
      <group position={[0, 1.15, 0]}>
        {[0, 1, 2, 3].map((i) => (
          <mesh
            key={i}
            position={[
              Math.cos((i / 4) * Math.PI * 2) * 0.06,
              0.05,
              Math.sin((i / 4) * Math.PI * 2) * 0.06
            ]}
            rotation={[0.3, (i / 4) * Math.PI * 2, 0]}
          >
            <cylinderGeometry args={[0.008, 0.005, 0.15, 6]} />
            <meshStandardMaterial color={COLORS.trim} metalness={0.8} roughness={0.2} />
          </mesh>
        ))}

        {/* Holder base ring */}
        <mesh position={[0, -0.02, 0]}>
          <torusGeometry args={[0.05, 0.012, 6, 12]} />
          <meshStandardMaterial color={COLORS.trim} metalness={0.8} roughness={0.2} />
        </mesh>
      </group>

      {/* Crystal orb at top */}
      <Float speed={3} floatIntensity={0.1}>
        <group position={[0, 1.25, 0]}>
          {/* Main crystal */}
          <mesh>
            <octahedronGeometry args={[0.12]} />
            <meshPhysicalMaterial
              color={COLORS.staffCrystal}
              emissive={COLORS.staffCrystal}
              emissiveIntensity={glowIntensity}
              transparent
              opacity={0.85}
              roughness={0.1}
              metalness={0.1}
              clearcoat={1}
            />
          </mesh>

          {/* Inner glow core */}
          <mesh>
            <sphereGeometry args={[0.05, 12, 12]} />
            <meshBasicMaterial color={COLORS.staffCrystal} transparent opacity={0.6 * glowIntensity} />
          </mesh>

          {/* Orbiting mini crystals when active */}
          {glowIntensity > 0.7 && (
            <group>
              {[0, 1, 2].map((i) => (
                <Float key={i} speed={4 + i} floatIntensity={0.3}>
                  <mesh position={[
                    Math.cos((i / 3) * Math.PI * 2) * 0.18,
                    0,
                    Math.sin((i / 3) * Math.PI * 2) * 0.18
                  ]}>
                    <octahedronGeometry args={[0.025]} />
                    <meshStandardMaterial
                      color={COLORS.staffCrystal}
                      emissive={COLORS.staffCrystal}
                      emissiveIntensity={1}
                    />
                  </mesh>
                </Float>
              ))}
            </group>
          )}
        </group>
      </Float>

      {/* Crystal glow light */}
      <pointLight
        position={[0, 1.25, 0]}
        color={COLORS.staffCrystal}
        intensity={glowIntensity * 3}
        distance={2}
        decay={2}
      />
    </group>
  )
}

// ============================================================================
// MAIN WIZARD CHARACTER COMPONENT
// ============================================================================

export function WizardCharacter({ state, targetPosition, thought, lookAtTarget }: WizardCharacterProps) {
  const groupRef = useRef<THREE.Group>(null)
  const bodyRef = useRef<THREE.Group>(null)
  const headRef = useRef<THREE.Group>(null)
  const leftArmRef = useRef<THREE.Group>(null)
  const rightArmRef = useRef<THREE.Group>(null)
  const leftForearmRef = useRef<THREE.Group>(null)
  const rightForearmRef = useRef<THREE.Group>(null)
  const runesRef = useRef<THREE.Group>(null)

  // State management
  const [currentPose, setCurrentPose] = useState<PoseConfig>({ ...BASE_POSE })
  const [blinkProgress, setBlinkProgress] = useState(0)
  const [mouthOpen, setMouthOpen] = useState(0)
  const [eyebrowRaise, setEyebrowRaise] = useState(0)
  const prevState = useRef<WizardState>(state)
  const stateTransitionProgress = useRef(1)

  // Movement vectors
  const currentPos = useMemo(() => new THREE.Vector3(...targetPosition), [])
  const targetVec = useMemo(() => new THREE.Vector3(), [])
  const prevPos = useMemo(() => new THREE.Vector3(...targetPosition), [])
  const velocity = useMemo(() => new THREE.Vector3(), [])

  // Eye look direction
  const lookDir = useMemo(() => ({ x: 0, y: 0 }), [])

  // Initialize
  useMemo(() => {
    currentPos.set(...targetPosition)
    prevPos.set(...targetPosition)
  }, [])

  // Handle state changes with smooth transitions
  useEffect(() => {
    if (state !== prevState.current) {
      stateTransitionProgress.current = 0
      prevState.current = state
    }
  }, [state])

  useFrame((frameState, delta) => {
    if (!groupRef.current) return

    const t = frameState.clock.elapsedTime

    // ========================================
    // SMOOTH POSITION MOVEMENT
    // ========================================
    targetVec.set(...targetPosition)
    prevPos.copy(currentPos)
    currentPos.lerp(targetVec, 0.03)
    groupRef.current.position.copy(currentPos)

    // Track velocity for secondary motion
    velocity.subVectors(currentPos, prevPos)

    // Rotation based on movement
    const dx = currentPos.x - prevPos.x
    const dz = currentPos.z - prevPos.z
    if (Math.abs(dx) > 0.001 || Math.abs(dz) > 0.001) {
      const targetAngle = Math.atan2(dx, dz)
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetAngle,
        0.08
      )
    }

    // ========================================
    // SMOOTH STATE TRANSITIONS (POSE BLENDING)
    // ========================================
    stateTransitionProgress.current = Math.min(1, stateTransitionProgress.current + delta * 3) // 0.33s transition

    const targetPose: PoseConfig = { ...BASE_POSE, ...STATE_POSES[state] }
    const blendedPose = lerpPose(currentPose, targetPose, stateTransitionProgress.current * 0.1)
    setCurrentPose(blendedPose)

    // ========================================
    // BLINKING (every 3-5 seconds)
    // ========================================
    const blinkCycle = (t * 0.7) % 4
    if (blinkCycle < 0.15) {
      setBlinkProgress(Math.sin((blinkCycle / 0.15) * Math.PI))
    } else {
      setBlinkProgress(0)
    }

    // ========================================
    // EYE TRACKING
    // ========================================
    if (lookAtTarget) {
      const lookTarget = new THREE.Vector3(...lookAtTarget)
      const headWorldPos = new THREE.Vector3()
      if (headRef.current) {
        headRef.current.getWorldPosition(headWorldPos)
      }
      const dirToTarget = lookTarget.sub(headWorldPos).normalize()
      lookDir.x = THREE.MathUtils.lerp(lookDir.x, THREE.MathUtils.clamp(dirToTarget.x, -1, 1), 0.1)
      lookDir.y = THREE.MathUtils.lerp(lookDir.y, THREE.MathUtils.clamp(dirToTarget.y, -0.5, 0.5), 0.1)
    } else {
      // Default slight movement
      lookDir.x = THREE.MathUtils.lerp(lookDir.x, Math.sin(t * 0.5) * 0.3, 0.05)
      lookDir.y = THREE.MathUtils.lerp(lookDir.y, Math.sin(t * 0.3) * 0.2, 0.05)
    }

    // ========================================
    // FACIAL EXPRESSIONS BASED ON STATE
    // ========================================
    let targetMouth = 0
    let targetBrow = 0
    switch (state) {
      case 'working':
      case 'channeling':
        targetMouth = 0.3 + Math.sin(t * 4) * 0.1
        targetBrow = 0.3
        break
      case 'celebrating':
        targetMouth = 0.5
        targetBrow = 0.8
        break
      case 'thinking':
        targetBrow = -0.3
        break
      case 'summoning':
        targetMouth = 0.2 + Math.sin(t * 3) * 0.1
        targetBrow = 0.2
        break
    }
    setMouthOpen(THREE.MathUtils.lerp(mouthOpen, targetMouth, 0.1))
    setEyebrowRaise(THREE.MathUtils.lerp(eyebrowRaise, targetBrow, 0.1))

    // ========================================
    // APPLY POSE TO SKELETON
    // ========================================
    if (bodyRef.current) {
      // Breathing animation
      const breathe = Math.sin(t * 1.5) * 0.015 * blendedPose.breatheIntensity
      bodyRef.current.position.y = blendedPose.bodyY + breathe
      bodyRef.current.rotation.x = blendedPose.bodyRotX
      bodyRef.current.rotation.z = blendedPose.bodyRotZ + Math.sin(t * 0.5) * 0.01

      // Walking bob
      if (state === 'walking') {
        bodyRef.current.position.y += Math.sin(t * 4) * 0.03
      }
    }

    if (headRef.current) {
      headRef.current.rotation.x = blendedPose.headRotX
      headRef.current.rotation.y = blendedPose.headRotY
      headRef.current.rotation.z = blendedPose.headRotZ + Math.sin(t * 0.5) * 0.02
    }

    if (leftArmRef.current) {
      // Base pose + animation overlay
      let armAnimX = 0
      if (state === 'walking') armAnimX = Math.sin(t * 4) * 0.2
      if (state === 'working') armAnimX = Math.sin(t * 2) * 0.2
      if (state === 'summoning') armAnimX = Math.sin(t * 2) * 0.5

      leftArmRef.current.rotation.x = blendedPose.leftArmX + armAnimX
      leftArmRef.current.rotation.z = blendedPose.leftArmZ
    }

    if (rightArmRef.current) {
      let armAnimX = 0
      if (state === 'walking') armAnimX = Math.sin(t * 4 + Math.PI) * 0.2
      if (state === 'working') armAnimX = Math.sin(t * 2 + 0.5) * 0.2
      if (state === 'summoning') armAnimX = Math.cos(t * 2) * 0.5

      rightArmRef.current.rotation.x = blendedPose.rightArmX + armAnimX
      rightArmRef.current.rotation.z = blendedPose.rightArmZ
    }

    if (leftForearmRef.current) {
      leftForearmRef.current.rotation.x = blendedPose.leftForearmX
    }

    if (rightForearmRef.current) {
      rightForearmRef.current.rotation.x = blendedPose.rightForearmX
    }

    // Thinking/summoning runes orbit
    if (runesRef.current && (state === 'thinking' || state === 'summoning')) {
      runesRef.current.rotation.y = t * 0.5
    }
  })

  const auraColor = WIZARD_AURA_COLORS[state]
  const staffGlow = (state === 'working' || state === 'channeling' || state === 'summoning') ? 1 : 0.4

  // Robe sway based on movement
  const robeSway: [number, number] = [
    -velocity.x * 50,
    -velocity.z * 50
  ]

  return (
      <group ref={groupRef}>
        {/* ================================ */}
        {/* BODY / TORSO WITH ROBES */}
        {/* ================================ */}
        <group ref={bodyRef} position={[0, 0.8, 0]}>
          <EnhancedRobe
            swayAmount={robeSway}
            breatheScale={1 + Math.sin(Date.now() * 0.003) * 0.01}
          />
        </group>

        {/* ================================ */}
        {/* HEAD WITH FACE */}
        {/* ================================ */}
        <group ref={headRef} position={[0, 1.55, 0]}>
          {/* Head base - slightly elongated */}
          <mesh>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshStandardMaterial color={COLORS.skin} roughness={0.8} />
          </mesh>

          {/* Face features */}
          <Face
            blinkProgress={blinkProgress}
            lookDirection={[lookDir.x, lookDir.y]}
            mouthOpen={mouthOpen}
            eyebrowRaise={eyebrowRaise}
          />

          {/* Wizard Hat */}
          <group position={[0, 0.18, -0.02]}>
            {/* Hat brim */}
            <mesh>
              <cylinderGeometry args={[0.3, 0.3, 0.04, 20]} />
              <meshStandardMaterial color={COLORS.hat} roughness={0.65} />
            </mesh>

            {/* Hat cone with slight bend */}
            <group position={[0, 0.02, 0]} rotation={[0.1, 0, 0.05]}>
              <mesh position={[0, 0.28, 0]}>
                <coneGeometry args={[0.2, 0.55, 12]} />
                <meshStandardMaterial color={COLORS.hat} roughness={0.65} />
              </mesh>

              {/* Hat tip */}
              <mesh position={[0.02, 0.52, 0.05]} rotation={[0.3, 0, 0.2]}>
                <coneGeometry args={[0.06, 0.15, 8]} />
                <meshStandardMaterial color={COLORS.hatDark} roughness={0.6} />
              </mesh>
            </group>

            {/* Hat band */}
            <mesh position={[0, 0.06, 0]}>
              <torusGeometry args={[0.19, 0.025, 8, 20]} />
              <meshStandardMaterial color={COLORS.trim} metalness={0.7} roughness={0.3} />
            </mesh>

            {/* Stars on hat */}
            {[
              [0, 0.35, 0.18],
              [-0.12, 0.25, 0.12],
              [0.1, 0.42, 0.1],
            ].map((pos, i) => (
              <mesh key={i} position={pos as [number, number, number]}>
                <octahedronGeometry args={[0.03 + i * 0.005]} />
                <meshStandardMaterial
                  color={COLORS.trim}
                  emissive={COLORS.trim}
                  emissiveIntensity={0.6}
                />
              </mesh>
            ))}
          </group>

          {/* Beard - fuller and more detailed */}
          <group position={[0, -0.12, 0.08]}>
            {/* Main beard mass */}
            <mesh position={[0, -0.05, 0]}>
              <coneGeometry args={[0.14, 0.35, 8]} />
              <meshStandardMaterial color={COLORS.beard} roughness={0.9} />
            </mesh>

            {/* Beard sides */}
            {[-0.08, 0.08].map((x, i) => (
              <mesh key={i} position={[x, 0, 0.02]}>
                <sphereGeometry args={[0.06, 8, 8]} />
                <meshStandardMaterial color={COLORS.beard} roughness={0.9} />
              </mesh>
            ))}

            {/* Mustache */}
            <mesh position={[0, 0.06, 0.04]} rotation={[0.3, 0, 0]}>
              <capsuleGeometry args={[0.02, 0.1, 4, 8]} />
              <meshStandardMaterial color={COLORS.beardDark} roughness={0.85} />
            </mesh>
          </group>
        </group>

        {/* ================================ */}
        {/* LEFT ARM */}
        {/* ================================ */}
        <group ref={leftArmRef} position={[-0.3, 1.2, 0]}>
          {/* Shoulder */}
          <mesh>
            <sphereGeometry args={[0.07, 8, 8]} />
            <meshStandardMaterial color={COLORS.robes} roughness={0.75} />
          </mesh>

          {/* Upper arm (sleeve) */}
          <mesh position={[-0.05, -0.12, 0]} rotation={[0, 0, 0.4]}>
            <cylinderGeometry args={[0.07, 0.055, 0.22, 8]} />
            <meshStandardMaterial color={COLORS.robes} roughness={0.75} />
          </mesh>

          {/* Sleeve cuff */}
          <mesh position={[-0.1, -0.22, 0]}>
            <torusGeometry args={[0.05, 0.015, 6, 12]} />
            <meshStandardMaterial color={COLORS.trim} metalness={0.6} roughness={0.4} />
          </mesh>

          {/* Forearm */}
          <group ref={leftForearmRef} position={[-0.1, -0.25, 0]}>
            {/* Forearm mesh */}
            <mesh position={[0, -0.08, 0]}>
              <cylinderGeometry args={[0.04, 0.035, 0.18, 8]} />
              <meshStandardMaterial color={COLORS.skin} roughness={0.8} />
            </mesh>

            {/* Hand */}
            <group position={[0, -0.2, 0.03]} rotation={[0.3, 0, 0]}>
              <ArticulatedHand
                isLeft={true}
                curl={currentPose.leftHandCurl}
                pose={state === 'channeling' ? 'spread' : 'open'}
              />
            </group>
          </group>
        </group>

        {/* ================================ */}
        {/* RIGHT ARM + STAFF */}
        {/* ================================ */}
        <group ref={rightArmRef} position={[0.3, 1.2, 0]}>
          {/* Shoulder */}
          <mesh>
            <sphereGeometry args={[0.07, 8, 8]} />
            <meshStandardMaterial color={COLORS.robes} roughness={0.75} />
          </mesh>

          {/* Upper arm */}
          <mesh position={[0.05, -0.12, 0]} rotation={[0, 0, -0.4]}>
            <cylinderGeometry args={[0.07, 0.055, 0.22, 8]} />
            <meshStandardMaterial color={COLORS.robes} roughness={0.75} />
          </mesh>

          {/* Sleeve cuff */}
          <mesh position={[0.1, -0.22, 0]}>
            <torusGeometry args={[0.05, 0.015, 6, 12]} />
            <meshStandardMaterial color={COLORS.trim} metalness={0.6} roughness={0.4} />
          </mesh>

          {/* Forearm */}
          <group ref={rightForearmRef} position={[0.1, -0.25, 0]}>
            <mesh position={[0, -0.08, 0]}>
              <cylinderGeometry args={[0.04, 0.035, 0.18, 8]} />
              <meshStandardMaterial color={COLORS.skin} roughness={0.8} />
            </mesh>

            {/* Hand holding staff */}
            <group position={[0.02, -0.2, 0.03]} rotation={[0.5, 0, 0]}>
              <ArticulatedHand
                isLeft={false}
                curl={currentPose.rightHandCurl}
                pose={state === 'pointing' ? 'point' : 'fist'}
              />
            </group>

            {/* Staff */}
            <group position={[0.05, -0.25, 0.05]}>
              <EnhancedStaff
                glowIntensity={staffGlow}
                rotation={currentPose.staffRotZ + Math.sin(Date.now() * 0.002) * 0.02}
              />
            </group>
          </group>
        </group>

        {/* ================================ */}
        {/* MAGICAL AURA - renders inside-out, behind wizard */}
        {/* ================================ */}
        <mesh position={[0, 1, 0]}>
          <sphereGeometry args={[0.7, 16, 16]} />
          <meshBasicMaterial
            color={auraColor}
            transparent
            opacity={0.06}
            side={THREE.BackSide}
            depthWrite={false}
          />
        </mesh>

        {/* Aura glow light */}
        <pointLight
          position={[0, 1.8, 0]}
          color={auraColor}
          intensity={1.5}
          distance={2.5}
          decay={2}
        />

        {/* ================================ */}
        {/* THINKING/SUMMONING RUNES */}
        {/* ================================ */}
        {(state === 'thinking' || state === 'summoning') && (
          <group ref={runesRef} position={[0, 1.6, 0]}>
            {Array.from({ length: 6 }).map((_, i) => {
              const angle = (i / 6) * Math.PI * 2
              const radius = 0.45
              return (
                <Float key={i} speed={2 + i * 0.2} floatIntensity={0.15}>
                  <mesh position={[Math.cos(angle) * radius, Math.sin(i * 0.5) * 0.1, Math.sin(angle) * radius]}>
                    <octahedronGeometry args={[0.035]} />
                    <meshStandardMaterial
                      color={state === 'summoning' ? '#8b5cf6' : '#0ea5e9'}
                      emissive={state === 'summoning' ? '#8b5cf6' : '#0ea5e9'}
                      emissiveIntensity={0.9}
                    />
                  </mesh>
                </Float>
              )
            })}
          </group>
        )}

        {/* ================================ */}
        {/* CELEBRATION EFFECTS */}
        {/* ================================ */}
        {state === 'celebrating' && (
          <>
            <Sparkles
              count={40}
              scale={2}
              size={3}
              speed={3}
              color="#ec4899"
              position={[0, 2.2, 0]}
            />
            <Sparkles
              count={20}
              scale={1.5}
              size={2}
              speed={2}
              color="#fbbf24"
              position={[0, 2, 0]}
            />
          </>
        )}

        {/* ================================ */}
        {/* SPELL CASTING EFFECTS */}
        {/* ================================ */}
        {(state === 'working' || state === 'channeling') && (
          <>
            <Sparkles
              count={25}
              scale={1.2}
              size={2}
              speed={1.5}
              color="#22c55e"
              position={[-0.3, 1.2, 0.3]}
            />
            {state === 'channeling' && (
              <Sparkles
                count={25}
                scale={1.2}
                size={2}
                speed={1.5}
                color="#3b82f6"
                position={[0.3, 1.2, 0.3]}
              />
            )}
          </>
        )}

        {/* ================================ */}
        {/* SUMMONING GROUND EFFECT */}
        {/* ================================ */}
        {state === 'summoning' && (
          <mesh rotation={[-Math.PI / 2, 0, Date.now() * 0.001]} position={[0, 0.02, 0]}>
            <ringGeometry args={[0.5, 0.8, 32]} />
            <meshBasicMaterial
              color="#8b5cf6"
              transparent
              opacity={0.4}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}

        {/* ================================ */}
        {/* THOUGHT BUBBLE */}
        {/* ================================ */}
        {thought && (
          <Html position={[0, 2.4, 0]} center distanceFactor={10}>
            <div className="bg-stone-900/90 text-stone-100 px-3 py-2 rounded-lg text-xs max-w-[150px] text-center border border-purple-500/50 backdrop-blur-sm shadow-lg">
              {thought}
            </div>
          </Html>
        )}

        {/* ================================ */}
        {/* SHADOW - flat on ground */}
        {/* ================================ */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <circleGeometry args={[0.4, 20]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.35} depthWrite={false} />
        </mesh>
      </group>
  )
}

export default WizardCharacter
