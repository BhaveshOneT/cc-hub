import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'

// ============================================================================
// OFFICE - Minimalistic office environment for Claude Code simulator
// ============================================================================

// Helper: Convert degrees to radians (DRY - used in many plant components)
const toRad = (deg: number) => (deg * Math.PI) / 180

// Soft, pleasant color palette - light but not too bright
const OFFICE_COLORS = {
  // Walls - soft warm gray
  wallMain: '#e8e4df',
  wallAccent: '#d9d4ce',

  // Floor - light wood tone
  floor: '#c4b8a8',
  floorAccent: '#b8aa98',

  // Window - soft blue sky
  windowSky: '#c5d8e8',
  windowFrame: '#f5f2ee',

  // Accents
  plant: '#7a9e7e',
  plantPot: '#d4c4b0',
  shelf: '#c9bfb2',

  // Soft shadows
  shadow: 'rgba(0, 0, 0, 0.05)',
}

// Shared plant colors (DRY - used across multiple plant components)
const PLANT_COLORS = {
  soil: '#4a3a2a',
  soilAlt: '#5a4a3a',
  potTerracotta: '#8b7355',
  potCream: '#e8ddd0',
  potWhite: '#f5f0e8',
  potTan: '#c4a070',
  trunk: '#6b5a4a',
  stem: '#5a7a5e',
  leafDark: '#3a7a3e',
  leafMid: '#4a7a4e',
  leafLight: '#5a8a5e',
  leafBright: '#4a8a4e',
  succulentLight: '#7ab07a',
  succulentMid: '#8ac08a',
  succulentPale: '#9ac09a',
  succulentPalest: '#aad0aa',
  ivyDark: '#4a8a4e',
  ivyLight: '#5a9a5e',
}

export function Office() {
  return (
    <group>
      {/* Floor */}
      <Floor />

      {/* Ceiling to close off the top */}
      <Ceiling />

      {/* Back wall */}
      <BackWall />

      {/* Side walls (partial, for depth) */}
      <SideWalls />

      {/* Window on back wall */}
      <Window />

      {/* Framed wall art */}
      <TeamPhoto />

      {/* Minimalistic shelf */}
      <WallShelf />

      {/* Plants and greenery for aesthetics */}
      <Plant />
      <TallFloorPlant position={[2.5, 0, -1.8]} />
      <TallFloorPlant position={[-2.8, 0, -1.5]} scale={0.8} />
      <SmallSucculent position={[1.5, 0.04, 0.7]} />
      <SmallSucculent position={[-1.3, 0.04, 0.8]} variant="round" />
      <HangingPlant position={[3.5, 3.2, -2]} />
      <Monstera position={[-3.5, 0, -0.5]} />

      {/* Soft ambient elements */}
      <AmbientDecor />
    </group>
  )
}

// ============================================================================
// FLOOR - Light wooden floor
// ============================================================================

function Floor() {
  return (
    <group>
      {/* Main floor plane - extends to cover entire room */}
      <mesh position={[0, -0.01, 1]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[14, 10]} />
        <meshStandardMaterial
          color={OFFICE_COLORS.floor}
          roughness={0.7}
          metalness={0.0}
        />
      </mesh>

      {/* Subtle floor pattern/grain lines */}
      {[-3, -2, -1, 0, 1, 2, 3].map((x, i) => (
        <mesh key={i} position={[x * 1.5, -0.005, 1]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.02, 10]} />
          <meshStandardMaterial
            color={OFFICE_COLORS.floorAccent}
            roughness={0.8}
            transparent
            opacity={0.3}
          />
        </mesh>
      ))}
    </group>
  )
}

// ============================================================================
// CEILING - Close off the top of the office
// ============================================================================

function Ceiling() {
  return (
    <mesh position={[0, 4.5, 0.5]} rotation={[Math.PI / 2, 0, 0]}>
      <planeGeometry args={[12, 10]} />
      <meshStandardMaterial
        color={OFFICE_COLORS.wallMain}
        roughness={0.95}
        metalness={0.0}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

// ============================================================================
// BACK WALL - Main wall behind desk
// ============================================================================

function BackWall() {
  return (
    <mesh position={[0, 2.25, -2.5]} receiveShadow>
      <planeGeometry args={[12, 6]} />
      <meshStandardMaterial
        color={OFFICE_COLORS.wallMain}
        roughness={0.9}
        metalness={0.0}
      />
    </mesh>
  )
}

// ============================================================================
// SIDE WALLS - Partial walls for depth perception
// ============================================================================

function SideWalls() {
  return (
    <group>
      {/* Left wall */}
      <mesh position={[-6, 2.25, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[8, 6]} />
        <meshStandardMaterial
          color={OFFICE_COLORS.wallAccent}
          roughness={0.9}
          metalness={0.0}
        />
      </mesh>

      {/* Right wall */}
      <mesh position={[6, 2.25, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[8, 6]} />
        <meshStandardMaterial
          color={OFFICE_COLORS.wallAccent}
          roughness={0.9}
          metalness={0.0}
        />
      </mesh>

      {/* Front wall (behind camera, closes off the room) */}
      <mesh position={[0, 2.25, 5]} rotation={[0, Math.PI, 0]} receiveShadow>
        <planeGeometry args={[12, 6]} />
        <meshStandardMaterial
          color={OFFICE_COLORS.wallAccent}
          roughness={0.9}
          metalness={0.0}
        />
      </mesh>
    </group>
  )
}

// ============================================================================
// WINDOW - Soft daylight window
// ============================================================================

function Window() {
  const glowRef = useRef<THREE.Mesh>(null)

  // Subtle light animation
  useFrame((state) => {
    if (glowRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 0.5) * 0.05 + 0.95
      const material = glowRef.current.material as THREE.MeshBasicMaterial
      material.opacity = 0.3 * pulse
    }
  })

  return (
    <group position={[2, 2.2, -2.45]}>
      {/* Window frame */}
      <mesh>
        <boxGeometry args={[1.8, 2.2, 0.1]} />
        <meshStandardMaterial
          color={OFFICE_COLORS.windowFrame}
          roughness={0.5}
          metalness={0.1}
        />
      </mesh>

      {/* Window glass/sky view */}
      <mesh position={[0, 0, 0.02]}>
        <planeGeometry args={[1.5, 1.9]} />
        <meshBasicMaterial
          color={OFFICE_COLORS.windowSky}
        />
      </mesh>

      {/* Window dividers */}
      <mesh position={[0, 0, 0.06]}>
        <boxGeometry args={[0.05, 1.9, 0.02]} />
        <meshStandardMaterial color={OFFICE_COLORS.windowFrame} />
      </mesh>
      <mesh position={[0, 0, 0.06]}>
        <boxGeometry args={[1.5, 0.05, 0.02]} />
        <meshStandardMaterial color={OFFICE_COLORS.windowFrame} />
      </mesh>

      {/* Soft glow from window */}
      <mesh ref={glowRef} position={[0, 0, 0.1]}>
        <planeGeometry args={[2, 2.4]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  )
}

// ============================================================================
// WALL ART - Framed picture on the wall
// ============================================================================

function TeamPhoto() {
  const texture = useTexture('/wall-art.png')

  return (
    <group position={[-1.2, 2.3, -2.44]}>
      {/* Frame - sleek black */}
      <mesh castShadow>
        <boxGeometry args={[1.2, 1.2, 0.06]} />
        <meshStandardMaterial
          color="#1a1a1a"
          roughness={0.4}
          metalness={0.3}
        />
      </mesh>

      {/* Art with texture - slightly inset to prevent z-fighting */}
      <mesh position={[0, 0, 0.035]}>
        <planeGeometry args={[1.0, 1.0]} />
        <meshBasicMaterial map={texture} />
      </mesh>
    </group>
  )
}

// ============================================================================
// WALL SHELF - Minimalistic floating shelf
// ============================================================================

function WallShelf() {
  return (
    <group position={[-2.2, 2.5, -2.4]}>
      {/* Shelf board */}
      <mesh castShadow>
        <boxGeometry args={[1.2, 0.04, 0.25]} />
        <meshStandardMaterial
          color={OFFICE_COLORS.shelf}
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>

      {/* Small book stack */}
      <mesh position={[-0.3, 0.1, 0]} castShadow>
        <boxGeometry args={[0.25, 0.18, 0.15]} />
        <meshStandardMaterial color="#8b7355" roughness={0.8} />
      </mesh>
      <mesh position={[-0.28, 0.22, 0]} castShadow rotation={[0, 0.1, 0]}>
        <boxGeometry args={[0.22, 0.06, 0.14]} />
        <meshStandardMaterial color="#a08060" roughness={0.8} />
      </mesh>

      {/* Small decorative object */}
      <mesh position={[0.35, 0.08, 0]} castShadow>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial
          color="#c4a882"
          roughness={0.4}
          metalness={0.2}
        />
      </mesh>
    </group>
  )
}

// ============================================================================
// PLANT - Small potted plant for life
// ============================================================================

function Plant() {
  const leavesRef = useRef<THREE.Group>(null)

  // Gentle swaying animation
  useFrame((state) => {
    if (leavesRef.current) {
      leavesRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.8) * 0.02
    }
  })

  return (
    <group position={[-1.8, 0, -1.5]}>
      {/* Pot */}
      <mesh position={[0, 0.12, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.1, 0.24, 16]} />
        <meshStandardMaterial
          color={OFFICE_COLORS.plantPot}
          roughness={0.7}
          metalness={0.0}
        />
      </mesh>

      {/* Soil */}
      <mesh position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.04, 16]} />
        <meshStandardMaterial color="#5a4a3a" roughness={0.9} />
      </mesh>

      {/* Leaves */}
      <group ref={leavesRef} position={[0, 0.25, 0]}>
        {[0, 72, 144, 216, 288].map((angle, i) => (
          <mesh
            key={i}
            position={[
              Math.cos(toRad(angle)) * 0.08,
              0.1 + i * 0.02,
              Math.sin(toRad(angle)) * 0.08,
            ]}
            rotation={[0.3 + i * 0.1, toRad(angle), 0.2]}
            castShadow
          >
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? OFFICE_COLORS.plant : '#6b8e6f'}
              roughness={0.8}
              metalness={0.0}
            />
          </mesh>
        ))}

        {/* Center stem */}
        <mesh position={[0, 0.15, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.3, 8]} />
          <meshStandardMaterial color="#5a7a5e" roughness={0.8} />
        </mesh>
      </group>
    </group>
  )
}

// ============================================================================
// TALL FLOOR PLANT - Fiddle leaf fig style
// ============================================================================

interface TallPlantProps {
  position: [number, number, number]
  scale?: number
}

function TallFloorPlant({ position, scale = 1 }: TallPlantProps) {
  const leavesRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (leavesRef.current) {
      leavesRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.6 + position[0]) * 0.015
    }
  })

  return (
    <group position={position} scale={scale}>
      {/* Pot */}
      <mesh position={[0, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.15, 0.4, 16]} />
        <meshStandardMaterial color={PLANT_COLORS.potTerracotta} roughness={0.8} />
      </mesh>

      {/* Soil */}
      <mesh position={[0, 0.38, 0]}>
        <cylinderGeometry args={[0.17, 0.17, 0.05, 16]} />
        <meshStandardMaterial color={PLANT_COLORS.soil} roughness={0.9} />
      </mesh>

      {/* Trunk */}
      <mesh position={[0, 0.8, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.06, 0.8, 8]} />
        <meshStandardMaterial color={PLANT_COLORS.trunk} roughness={0.8} />
      </mesh>

      {/* Large leaves */}
      <group ref={leavesRef} position={[0, 1.2, 0]}>
        {[0, 60, 120, 180, 240, 300].map((angle, i) => (
          <mesh
            key={i}
            position={[
              Math.cos(toRad(angle)) * 0.2,
              i * 0.08 - 0.2,
              Math.sin(toRad(angle)) * 0.2,
            ]}
            rotation={[0.4, toRad(angle), 0.3]}
            castShadow
          >
            <sphereGeometry args={[0.18, 8, 6]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? PLANT_COLORS.leafMid : PLANT_COLORS.leafLight}
              roughness={0.7}
            />
          </mesh>
        ))}
      </group>
    </group>
  )
}

// ============================================================================
// SMALL SUCCULENT - Desk plant
// ============================================================================

interface SucculentProps {
  position: [number, number, number]
  variant?: 'spiky' | 'round'
}

function SmallSucculent({ position, variant = 'spiky' }: SucculentProps) {
  return (
    <group position={position}>
      {/* Small pot */}
      <mesh position={[0, 0.04, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.05, 0.08, 12]} />
        <meshStandardMaterial color={PLANT_COLORS.potCream} roughness={0.6} />
      </mesh>

      {/* Soil */}
      <mesh position={[0, 0.075, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.02, 12]} />
        <meshStandardMaterial color={PLANT_COLORS.soilAlt} roughness={0.9} />
      </mesh>

      {/* Succulent */}
      {variant === 'spiky' ? (
        // Aloe-style spiky succulent
        <group position={[0, 0.1, 0]}>
          {[0, 72, 144, 216, 288].map((angle, i) => (
            <mesh
              key={i}
              position={[
                Math.cos(toRad(angle)) * 0.02,
                0.02 + i * 0.005,
                Math.sin(toRad(angle)) * 0.02,
              ]}
              rotation={[0.5 - i * 0.05, toRad(angle), 0]}
            >
              <coneGeometry args={[0.015, 0.06, 6]} />
              <meshStandardMaterial color={PLANT_COLORS.succulentLight} roughness={0.6} />
            </mesh>
          ))}
          <mesh position={[0, 0.03, 0]}>
            <coneGeometry args={[0.02, 0.08, 6]} />
            <meshStandardMaterial color={PLANT_COLORS.succulentMid} roughness={0.6} />
          </mesh>
        </group>
      ) : (
        // Round succulent rosette
        <group position={[0, 0.1, 0]}>
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
            <mesh
              key={i}
              position={[
                Math.cos(toRad(angle)) * 0.025,
                0.01,
                Math.sin(toRad(angle)) * 0.025,
              ]}
              rotation={[0.8, toRad(angle), 0]}
            >
              <sphereGeometry args={[0.02, 8, 6]} />
              <meshStandardMaterial color={PLANT_COLORS.succulentPale} roughness={0.5} />
            </mesh>
          ))}
          <mesh position={[0, 0.025, 0]}>
            <sphereGeometry args={[0.018, 8, 8]} />
            <meshStandardMaterial color={PLANT_COLORS.succulentPalest} roughness={0.5} />
          </mesh>
        </group>
      )}
    </group>
  )
}

// ============================================================================
// HANGING PLANT - Trailing ivy style
// ============================================================================

interface HangingPlantProps {
  position: [number, number, number]
}

function HangingPlant({ position }: HangingPlantProps) {
  const vineRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (vineRef.current) {
      vineRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.4) * 0.03
    }
  })

  return (
    <group position={position}>
      {/* Hanging pot */}
      <mesh castShadow>
        <cylinderGeometry args={[0.12, 0.1, 0.15, 12]} />
        <meshStandardMaterial color={PLANT_COLORS.potTan} roughness={0.7} />
      </mesh>

      {/* Trailing vines */}
      <group ref={vineRef}>
        {[0, 120, 240].map((angle, vineIndex) => (
          <group key={vineIndex} rotation={[0, toRad(angle), 0]}>
            {/* Vine strand with leaves */}
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <group key={i} position={[0.08 + i * 0.02, -0.15 - i * 0.15, 0]}>
                <mesh rotation={[0.3, 0, 0.5 + i * 0.1]}>
                  <sphereGeometry args={[0.04, 6, 4]} />
                  <meshStandardMaterial
                    color={i % 2 === 0 ? PLANT_COLORS.ivyLight : PLANT_COLORS.ivyDark}
                    roughness={0.6}
                  />
                </mesh>
              </group>
            ))}
          </group>
        ))}
      </group>
    </group>
  )
}

// ============================================================================
// MONSTERA - Large tropical plant
// ============================================================================

interface MonsteraProps {
  position: [number, number, number]
}

// Monstera leaf positions for cleaner JSX
const MONSTERA_LEAVES = [
  { angle: 30, height: 0.4, scale: 1 },
  { angle: 120, height: 0.5, scale: 1.2 },
  { angle: 200, height: 0.3, scale: 0.9 },
  { angle: 280, height: 0.6, scale: 1.1 },
  { angle: 350, height: 0.45, scale: 1 },
]

function Monstera({ position }: MonsteraProps) {
  const leavesRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (leavesRef.current) {
      leavesRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.02
    }
  })

  return (
    <group position={position}>
      {/* Large decorative pot */}
      <mesh position={[0, 0.25, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.2, 0.5, 16]} />
        <meshStandardMaterial color={PLANT_COLORS.potWhite} roughness={0.5} />
      </mesh>

      {/* Pot rim */}
      <mesh position={[0, 0.48, 0]}>
        <torusGeometry args={[0.25, 0.03, 8, 16]} />
        <meshStandardMaterial color={PLANT_COLORS.potWhite} roughness={0.5} />
      </mesh>

      {/* Soil */}
      <mesh position={[0, 0.48, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.06, 16]} />
        <meshStandardMaterial color={PLANT_COLORS.soil} roughness={0.9} />
      </mesh>

      {/* Large monstera leaves */}
      <group ref={leavesRef} position={[0, 0.6, 0]}>
        {MONSTERA_LEAVES.map(({ angle, height, scale }, i) => (
          <group
            key={i}
            position={[
              Math.cos(toRad(angle)) * 0.15,
              height,
              Math.sin(toRad(angle)) * 0.15,
            ]}
            rotation={[0.5, toRad(angle), 0.2]}
            scale={scale}
          >
            <mesh castShadow>
              <sphereGeometry args={[0.25, 8, 6]} />
              <meshStandardMaterial
                color={i % 2 === 0 ? PLANT_COLORS.leafDark : PLANT_COLORS.leafBright}
                roughness={0.6}
              />
            </mesh>
            <mesh position={[0, -0.2, 0]} rotation={[0.5, 0, 0]}>
              <cylinderGeometry args={[0.015, 0.02, 0.4, 6]} />
              <meshStandardMaterial color={PLANT_COLORS.stem} roughness={0.7} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  )
}

// ============================================================================
// AMBIENT DECOR - Subtle elements for depth
// ============================================================================

function AmbientDecor() {
  return (
    <group>
      {/* Subtle wall shadow/ambient occlusion where wall meets floor */}
      <mesh position={[0, 0.01, -2.45]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 0.3]} />
        <meshBasicMaterial
          color="#000000"
          transparent
          opacity={0.03}
        />
      </mesh>

      {/* Soft corner shadows */}
      <mesh position={[-4.95, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.3, 6]} />
        <meshBasicMaterial
          color="#000000"
          transparent
          opacity={0.02}
        />
      </mesh>
      <mesh position={[4.95, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.3, 6]} />
        <meshBasicMaterial
          color="#000000"
          transparent
          opacity={0.02}
        />
      </mesh>
    </group>
  )
}

export default Office
