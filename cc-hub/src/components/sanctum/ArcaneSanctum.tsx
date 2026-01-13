import { useRef, useMemo, memo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, Text, Sparkles, Float } from '@react-three/drei'
import * as THREE from 'three'

// Centralized configuration (DRY)
import { SANCTUM_COLORS as COLORS, TOOL_ARTIFACTS, getContextVisuals } from '../../lib/theme'
import { PERF } from '../../lib/performance'

// ============================================================================
// ARCANE SANCTUM - Fantasy-themed wizard's study (OPTIMIZED)
// Twilight atmosphere, magical objects, mystical aesthetic
// ============================================================================

interface ArcaneSanctumProps {
  highlight?: string
  showTool?: string
  contextLevel?: number
}

export const ArcaneSanctum = memo(function ArcaneSanctum({ highlight, showTool, contextLevel = 20 }: ArcaneSanctumProps) {
  return (
    <group>
      <StonePlatform />
      <TriadFloor highlight={highlight === 'triad'} />
      <EternalHourglass position={[0, 0, 0]} highlight={highlight === 'center' || highlight === 'hourglass'} />
      <ArcaneReservoir position={[0, 0, 3.5]} highlight={highlight === 'reservoir'} fillLevel={contextLevel} />
      <GrimoireOfPermanence position={[0, 0, -3]} highlight={highlight === 'grimoire'} />
      <ArtifactWall position={[4, 0, 0]} highlight={highlight === 'artifacts'} activeTool={showTool} />
      <CleansingCircle position={[3, 0, 3]} highlight={highlight === 'circle'} />
      <EssenceCondenser position={[-3, 0, 3]} highlight={highlight === 'condenser'} />
      <WandRack position={[-1.5, 0, -2]} highlight={highlight === 'wands'} />
      <SummoningSanctum position={[-2, 0, 1.5]} highlight={highlight === 'summoning'} />
      <PortalNexus position={[-4, 0, 0]} highlight={highlight === 'portal'} />
      <AmbientMagicDust />
      <FloatingIslands />
      <ContextMist level={contextLevel} />
    </group>
  )
})

// ============================================================================
// STONE PLATFORM - The sanctum's foundation (OPTIMIZED)
// ============================================================================

const StonePlatform = memo(function StonePlatform() {
  const runeRef = useRef<THREE.Group>(null)
  const frameCount = useRef(0)

  useFrame((state) => {
    frameCount.current++
    if (frameCount.current % 3 !== 0) return
    if (runeRef.current) {
      runeRef.current.rotation.y = state.clock.elapsedTime * 0.02
    }
  })

  // Memoize rune positions
  const runePositions = useMemo(() =>
    Array.from({ length: 8 }).map((_, i) => {
      const angle = (i / 8) * Math.PI * 2
      return { x: Math.cos(angle) * 7, z: Math.sin(angle) * 7, angle }
    }), [])

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <circleGeometry args={[8, 32]} />
        <meshStandardMaterial color={COLORS.stone} roughness={0.9} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]}>
        <ringGeometry args={[7.5, 8, 32]} />
        <meshStandardMaterial color={COLORS.stoneDark} roughness={0.8} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, 0]}>
        <ringGeometry args={[6, 6.2, 32]} />
        <meshStandardMaterial
          color={COLORS.runeGold}
          emissive={COLORS.runeGold}
          emissiveIntensity={0.2}
          roughness={0.4}
        />
      </mesh>

      <group ref={runeRef} position={[0, 0.01, 0]}>
        {runePositions.map((pos, i) => (
          <mesh key={i} position={[pos.x, 0, pos.z]} rotation={[-Math.PI / 2, 0, pos.angle]}>
            <circleGeometry args={[0.12, 6]} />
            <meshBasicMaterial color={COLORS.runeGold} />
          </mesh>
        ))}
      </group>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <ringGeometry args={[8, 25, 32]} />
        <meshBasicMaterial color="#0f172a" />
      </mesh>
    </group>
  )
})

// ============================================================================
// TRIAD FLOOR - Skills + Subagents + MCP intersection (OPTIMIZED)
// ============================================================================

const TriadFloor = memo(function TriadFloor({ highlight }: { highlight: boolean }) {
  const groupRef = useRef<THREE.Group>(null)
  const frameCount = useRef(0)

  useFrame((state) => {
    if (!groupRef.current) return
    frameCount.current++
    if (frameCount.current % PERF.frameSkip !== 0) return

    const pulse = highlight ? 0.5 + Math.sin(state.clock.elapsedTime * 2) * 0.3 : 0.15
    groupRef.current.children.forEach((child) => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
        child.material.emissiveIntensity = pulse
      }
    })
  })

  return (
    <group ref={groupRef} position={[0, 0.02, 2]}>
      {[
        { pos: [-0.8, 0, -0.5], color: COLORS.skillsPurple },
        { pos: [0.8, 0, -0.5], color: COLORS.subagentsBlue },
        { pos: [0, 0, 0.7], color: COLORS.mcpGreen },
      ].map((circle, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={circle.pos as [number, number, number]}>
          <ringGeometry args={[1.2, 1.35, PERF.geoSegments]} />
          <meshStandardMaterial
            color={circle.color}
            emissive={circle.color}
            emissiveIntensity={0.15}
            transparent
            opacity={0.6}
          />
        </mesh>
      ))}
      {highlight && (
        <pointLight position={[0, 0.5, 0]} color="#ffffff" intensity={2} distance={3} decay={2} />
      )}
    </group>
  )
})

// ============================================================================
// ETERNAL HOURGLASS - The Agentic Loop (OPTIMIZED)
// ============================================================================

const EternalHourglass = memo(function EternalHourglass({ position, highlight }: { position: [number, number, number]; highlight: boolean }) {
  const sandRef = useRef<THREE.Group>(null)
  const groupRef = useRef<THREE.Group>(null)
  const frameCount = useRef(0)

  useFrame((state) => {
    frameCount.current++
    if (frameCount.current % PERF.frameSkip !== 0) return

    const t = state.clock.elapsedTime
    if (sandRef.current) {
      sandRef.current.rotation.y = t * 0.4
    }
    if (groupRef.current && highlight) {
      groupRef.current.position.y = position[1] + Math.sin(t * 1.2) * 0.08
    }
  })

  return (
    <group ref={groupRef} position={position}>
      {/* Top bulb - simplified glass */}
      <Float speed={1.5} floatIntensity={highlight ? 0.08 : 0}>
        <mesh position={[0, 1.2, 0]}>
          <sphereGeometry args={[0.4, PERF.geoSegments, PERF.geoSegments, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial
            color={highlight ? '#fef3c7' : '#e0f2fe'}
            emissive={highlight ? COLORS.magicGold : '#000000'}
            emissiveIntensity={highlight ? 0.25 : 0}
            transparent
            opacity={0.35}
          />
        </mesh>
      </Float>

      {/* Bottom bulb */}
      <mesh position={[0, 0.4, 0]} rotation={[Math.PI, 0, 0]}>
        <sphereGeometry args={[0.4, PERF.geoSegments, PERF.geoSegments, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial
          color={highlight ? '#fef3c7' : '#e0f2fe'}
          emissive={highlight ? COLORS.magicGold : '#000000'}
          emissiveIntensity={highlight ? 0.25 : 0}
          transparent
          opacity={0.35}
        />
      </mesh>

      {/* Center neck */}
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.3, PERF.geoSegmentsLow]} />
        <meshStandardMaterial
          color={highlight ? COLORS.magicGold : '#e0f2fe'}
          emissive={highlight ? COLORS.magicGold : '#000000'}
          emissiveIntensity={highlight ? 0.4 : 0}
          transparent
          opacity={0.45}
        />
      </mesh>

      {/* Combined rings into fewer meshes */}
      {[0.4, 0.8, 1.2].map((y, i) => (
        <mesh key={i} position={[0, y, 0]}>
          <torusGeometry args={[0.42, 0.03, PERF.geoSegmentsLow, PERF.geoSegments]} />
          <meshStandardMaterial
            color={COLORS.magicGold}
            emissive={COLORS.magicGold}
            emissiveIntensity={highlight ? 0.5 : 0.15}
            metalness={0.7}
            roughness={0.3}
          />
        </mesh>
      ))}

      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.5, 0.6, 0.3, PERF.geoSegmentsLow]} />
        <meshStandardMaterial color={COLORS.stoneDark} roughness={0.7} />
      </mesh>

      <group ref={sandRef} position={[0, 0.8, 0]}>
        <Sparkles
          count={highlight ? PERF.maxSparklesHighlight : PERF.maxSparkles}
          scale={highlight ? 0.8 : 0.5}
          size={highlight ? 2.5 : 1.5}
          speed={0.6}
          color={COLORS.magicGold}
        />
      </group>

      <Html position={[0, 1.9, 0]} center>
        <div className={`px-2 py-1 rounded text-xs font-medium backdrop-blur-sm transition-all ${
          highlight
            ? 'bg-amber-900/80 text-amber-100 border border-amber-400'
            : 'bg-stone-900/60 text-stone-300'
        }`}>
          <div>⟳ Eternal Hourglass</div>
          <div className="text-[10px] opacity-70 mt-0.5">Agentic Loop</div>
        </div>
      </Html>

      <pointLight
        position={[0, 0.8, 0]}
        color={COLORS.magicGold}
        intensity={highlight ? 4 : 0.8}
        distance={highlight ? 4 : 2}
        decay={2}
      />
    </group>
  )
})

// ============================================================================
// ARCANE RESERVOIR - Context Window (OPTIMIZED)
// ============================================================================

const ArcaneReservoir = memo(function ArcaneReservoir({ position, highlight, fillLevel }: {
  position: [number, number, number]
  highlight: boolean
  fillLevel: number
}) {
  const liquidRef = useRef<THREE.Mesh>(null)
  const frameCount = useRef(0)

  const getColor = (level: number) => {
    if (level < 30) return '#3b82f6'
    if (level < 45) return '#8b5cf6'
    if (level < 60) return '#f59e0b'
    return '#ef4444'
  }

  useFrame((state) => {
    if (!liquidRef.current) return
    frameCount.current++
    if (frameCount.current % PERF.frameSkip !== 0) return
    liquidRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.04
  })

  const liquidHeight = (fillLevel / 100) * 1.2
  const liquidColor = getColor(fillLevel)

  return (
    <group position={position}>
      {/* Glass vessel - simplified */}
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.5, 0.6, 1.4, PERF.geoSegments, 1, true]} />
        <meshStandardMaterial
          color="#e0f2fe"
          transparent
          opacity={0.2}
          roughness={0.05}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Magical liquid */}
      <mesh ref={liquidRef} position={[0, 0.15 + liquidHeight / 2, 0]}>
        <cylinderGeometry args={[0.45, 0.55, liquidHeight, PERF.geoSegments]} />
        <meshStandardMaterial
          color={liquidColor}
          emissive={liquidColor}
          emissiveIntensity={0.4}
          transparent
          opacity={0.65}
        />
      </mesh>

      {/* Stone base */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.65, 0.7, 0.2, PERF.geoSegments]} />
        <meshStandardMaterial color={COLORS.stoneDark} roughness={0.7} />
      </mesh>

      <Html position={[0, 1.7, 0]} center>
        <div className={`px-2 py-1 rounded text-xs font-medium backdrop-blur-sm ${
          highlight
            ? 'bg-blue-900/80 text-blue-100 border border-blue-400'
            : 'bg-stone-900/60 text-stone-300'
        }`}>
          <div>Arcane Reservoir ({fillLevel}%)</div>
          <div className="text-[10px] opacity-70 mt-0.5">Context Window (200K tokens)</div>
        </div>
      </Html>

      <pointLight
        position={[0, 0.8, 0.5]}
        color={liquidColor}
        intensity={highlight ? 2.5 : 0.8}
        distance={3}
        decay={2}
      />
    </group>
  )
})

// ============================================================================
// GRIMOIRE OF PERMANENCE - CLAUDE.md (OPTIMIZED)
// ============================================================================

const GrimoireOfPermanence = memo(function GrimoireOfPermanence({ position, highlight }: { position: [number, number, number]; highlight: boolean }) {
  const bookRef = useRef<THREE.Group>(null)
  const frameCount = useRef(0)

  useFrame((state) => {
    if (!bookRef.current) return
    frameCount.current++
    if (frameCount.current % PERF.frameSkip !== 0) return
    if (highlight) {
      bookRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.25) * 0.08
    }
  })

  return (
    <group position={position}>
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[0.8, 0.08, 0.6]} />
        <meshStandardMaterial color={COLORS.stoneDark} roughness={0.6} />
      </mesh>

      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.15, 0.25, 0.6, PERF.geoSegmentsLow]} />
        <meshStandardMaterial color={COLORS.stone} roughness={0.7} />
      </mesh>

      <group ref={bookRef} position={[0, 0.75, 0]} rotation={[-0.3, 0, 0]}>
        <mesh position={[-0.25, 0, 0]} rotation={[0, 0, 0.2]}>
          <boxGeometry args={[0.5, 0.02, 0.65]} />
          <meshStandardMaterial color="#4c1d95" roughness={0.6} />
        </mesh>
        <mesh position={[0.25, 0, 0]} rotation={[0, 0, -0.2]}>
          <boxGeometry args={[0.5, 0.02, 0.65]} />
          <meshStandardMaterial color="#4c1d95" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.03, 0]}>
          <boxGeometry args={[0.45, 0.04, 0.6]} />
          <meshStandardMaterial color="#fef3c7" roughness={0.9} />
        </mesh>
        {/* Simplified text lines */}
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[0, 0.06, -0.15 + i * 0.15]}>
            <boxGeometry args={[0.3, 0.002, 0.02]} />
            <meshBasicMaterial color={COLORS.magicGold} />
          </mesh>
        ))}
      </group>

      <Float speed={0.8} floatIntensity={0.15}>
        <Text
          position={[0, 1.2, 0]}
          fontSize={0.1}
          color={COLORS.magicGold}
          anchorX="center"
        >
          CLAUDE.md
        </Text>
      </Float>

      <Html position={[0, 1.5, 0]} center>
        <div className={`px-2 py-1 rounded text-xs font-medium backdrop-blur-sm ${
          highlight
            ? 'bg-purple-900/80 text-purple-100 border border-purple-400'
            : 'bg-stone-900/60 text-stone-300'
        }`}>
          <div>Grimoire of Permanence</div>
          <div className="text-[10px] opacity-70 mt-0.5">CLAUDE.md</div>
        </div>
      </Html>

      <pointLight
        position={[0, 1, 0.3]}
        color={COLORS.magicGold}
        intensity={highlight ? 2.5 : 0.5}
        distance={2.5}
        decay={2}
      />
      {highlight && (
        <Sparkles count={15} scale={0.8} size={1} color={COLORS.magicGold} speed={0.4} position={[0, 0.9, 0]} />
      )}
    </group>
  )
})

// ============================================================================
// ARTIFACT WALL - The 8 Tool Artifacts (OPTIMIZED)
// ============================================================================

const ArtifactWall = memo(function ArtifactWall({ position, highlight, activeTool }: {
  position: [number, number, number]
  highlight: boolean
  activeTool?: string
}) {
  const tools = useMemo(() => Object.entries(TOOL_ARTIFACTS), [])

  return (
    <group position={position}>
      <mesh position={[0, 1.2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <cylinderGeometry args={[2.5, 2.5, 2.4, PERF.geoSegments, 1, true, -Math.PI / 4, Math.PI / 2]} />
        <meshStandardMaterial color={COLORS.stone} roughness={0.9} side={THREE.DoubleSide} />
      </mesh>

      {tools.map(([key, tool], i) => {
        const row = Math.floor(i / 2)
        const col = i % 2
        const angle = -Math.PI / 8 + col * (Math.PI / 4)
        const y = 1.8 - row * 0.5
        const x = Math.sin(angle) * -2.3
        const z = Math.cos(angle) * -2.3
        // Case-insensitive comparison to fix tool highlighting bug
        const isActive = activeTool?.toLowerCase() === key.toLowerCase()

        return (
          <group key={key} position={[x, y, z]} rotation={[0, angle, 0]}>
            <mesh>
              <boxGeometry args={[0.28, 0.32, 0.12]} />
              <meshStandardMaterial color={COLORS.stoneDark} roughness={0.8} />
            </mesh>
            <mesh position={[0, 0, 0.08]}>
              <dodecahedronGeometry args={[0.08]} />
              <meshStandardMaterial
                color={tool.color}
                emissive={tool.color}
                emissiveIntensity={isActive ? 0.8 : 0.2}
                metalness={0.5}
                roughness={0.3}
              />
            </mesh>
            <Text
              position={[0, -0.22, 0.08]}
              fontSize={0.045}
              color={isActive ? tool.color : '#a8a29e'}
              anchorX="center"
            >
              {tool.fantasy}
            </Text>
            <Text
              position={[0, -0.32, 0.08]}
              fontSize={0.035}
              color={isActive ? '#ffffff' : '#78716c'}
              anchorX="center"
            >
              ({tool.tech})
            </Text>
            {isActive && (
              <pointLight color={tool.color} intensity={2} distance={1.2} decay={2} />
            )}
          </group>
        )
      })}

      <Html position={[-0.5, 2.4, 0]} center>
        <div className={`px-2 py-1 rounded text-xs font-medium backdrop-blur-sm ${
          highlight
            ? 'bg-green-900/80 text-green-100 border border-green-400'
            : 'bg-stone-900/60 text-stone-300'
        }`}>
          <div>Enchanted Artifacts</div>
          <div className="text-[10px] opacity-70 mt-0.5">Claude Code Tools</div>
        </div>
      </Html>

      {highlight && (
        <pointLight position={[-0.5, 1.2, 0.5]} color={COLORS.magicGreen} intensity={3} distance={3} decay={2} />
      )}
    </group>
  )
})

// ============================================================================
// CLEANSING CIRCLE - /clear command (OPTIMIZED)
// ============================================================================

const CleansingCircle = memo(function CleansingCircle({ position, highlight }: { position: [number, number, number]; highlight: boolean }) {
  const circleRef = useRef<THREE.Mesh>(null)
  const frameCount = useRef(0)

  useFrame((state) => {
    if (!circleRef.current) return
    frameCount.current++
    if (frameCount.current % PERF.frameSkip !== 0) return
    circleRef.current.rotation.z = state.clock.elapsedTime * 0.15
    if (highlight && circleRef.current.material instanceof THREE.MeshStandardMaterial) {
      circleRef.current.material.emissiveIntensity = 0.4 + Math.sin(state.clock.elapsedTime * 3) * 0.3
    }
  })

  return (
    <group position={position}>
      <mesh ref={circleRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[0.8, 1, PERF.geoSegments]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={highlight ? 0.6 : 0.15}
          transparent
          opacity={0.7}
        />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <ringGeometry args={[0.3, 0.5, 6]} />
        <meshStandardMaterial
          color={COLORS.magicBlue}
          emissive={COLORS.magicBlue}
          emissiveIntensity={0.25}
          transparent
          opacity={0.6}
        />
      </mesh>

      <Html position={[0, 0.7, 0]} center>
        <div className={`px-2 py-1 rounded text-xs font-medium backdrop-blur-sm ${
          highlight
            ? 'bg-white/80 text-stone-900 border border-white'
            : 'bg-stone-900/60 text-stone-300'
        }`}>
          <div>Cleansing Circle</div>
          <div className={`text-[10px] mt-0.5 ${highlight ? 'opacity-60' : 'opacity-70'}`}>/clear command</div>
        </div>
      </Html>

      {highlight && (
        <>
          <pointLight position={[0, 0.4, 0]} color="#ffffff" intensity={3} distance={2.5} decay={2} />
          <Sparkles count={20} scale={1.5} size={1.5} color="#ffffff" speed={0.8} />
        </>
      )}
    </group>
  )
})

// ============================================================================
// ESSENCE CONDENSER - /compact command (OPTIMIZED)
// ============================================================================

const EssenceCondenser = memo(function EssenceCondenser({ position, highlight }: { position: [number, number, number]; highlight: boolean }) {
  const tubeRef = useRef<THREE.Mesh>(null)
  const frameCount = useRef(0)

  useFrame((state) => {
    if (!tubeRef.current || !highlight) return
    frameCount.current++
    if (frameCount.current % PERF.frameSkip !== 0) return
    tubeRef.current.rotation.y = state.clock.elapsedTime * 1.5
  })

  return (
    <group position={position}>
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.4, 0.5, 0.3, PERF.geoSegmentsLow]} />
        <meshStandardMaterial color={COLORS.stoneDark} roughness={0.7} />
      </mesh>

      <mesh position={[0, 0.6, 0]}>
        <sphereGeometry args={[0.3, PERF.geoSegments, PERF.geoSegments]} />
        <meshStandardMaterial
          color="#e0f2fe"
          transparent
          opacity={0.35}
          roughness={0.1}
        />
      </mesh>

      <mesh ref={tubeRef} position={[0, 1, 0]}>
        <cylinderGeometry args={[0.05, 0.1, 0.5, PERF.geoSegmentsLow]} />
        <meshStandardMaterial
          color={COLORS.magicPurple}
          emissive={COLORS.magicPurple}
          emissiveIntensity={highlight ? 0.6 : 0.2}
        />
      </mesh>

      {highlight && (
        <Float speed={2.5} floatIntensity={0.25}>
          <mesh position={[0, 0.6, 0]}>
            <sphereGeometry args={[0.07, PERF.geoSegmentsLow, PERF.geoSegmentsLow]} />
            <meshBasicMaterial color={COLORS.magicPurple} />
          </mesh>
        </Float>
      )}

      <Html position={[0, 1.4, 0]} center>
        <div className={`px-2 py-1 rounded text-xs font-medium backdrop-blur-sm ${
          highlight
            ? 'bg-purple-900/80 text-purple-100 border border-purple-400'
            : 'bg-stone-900/60 text-stone-300'
        }`}>
          <div>Essence Condenser</div>
          <div className="text-[10px] opacity-70 mt-0.5">/compact command</div>
        </div>
      </Html>

      <pointLight
        position={[0, 0.8, 0]}
        color={COLORS.magicPurple}
        intensity={highlight ? 2 : 0.5}
        distance={2.5}
        decay={2}
      />
    </group>
  )
})

// ============================================================================
// WAND RACK - Skills System (OPTIMIZED)
// ============================================================================

const WandRack = memo(function WandRack({ position, highlight }: { position: [number, number, number]; highlight: boolean }) {
  const wandColors = useMemo(() => ['#ef4444', '#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'], [])

  return (
    <group position={position}>
      {/* Rack backing - enhanced wood texture */}
      <mesh position={[0, 1.2, -0.1]}>
        <boxGeometry args={[1.2, 0.8, 0.1]} />
        <meshStandardMaterial color={COLORS.stoneDark} roughness={0.85} metalness={0.05} />
      </mesh>

      {wandColors.map((color, i) => {
        const x = -0.4 + (i % 3) * 0.4
        const y = 1.4 - Math.floor(i / 3) * 0.3
        return (
          <Float key={i} speed={1.5} floatIntensity={0.08}>
            <group position={[x, y, 0.1]} rotation={[0, 0, Math.PI / 6]}>
              {/* Wand handle */}
              <mesh>
                <cylinderGeometry args={[0.018, 0.028, 0.28, PERF.geoSegmentsLow]} />
                <meshStandardMaterial color="#78350f" roughness={0.8} />
              </mesh>
              {/* Crystal tip - simplified */}
              <mesh position={[0, 0.18, 0]}>
                <octahedronGeometry args={[0.04]} />
                <meshStandardMaterial
                  color={color}
                  emissive={color}
                  emissiveIntensity={highlight ? 0.6 : 0.2}
                />
              </mesh>
            </group>
          </Float>
        )
      })}

      <Html position={[0, 1.9, 0]} center>
        <div className={`px-2 py-1 rounded text-xs font-medium backdrop-blur-sm ${
          highlight
            ? 'bg-purple-900/80 text-purple-100 border border-purple-400'
            : 'bg-stone-900/60 text-stone-300'
        }`}>
          <div>Wand Rack</div>
          <div className="text-[10px] opacity-70 mt-0.5">Skills System</div>
        </div>
      </Html>

      {highlight && (
        <pointLight position={[0, 1.3, 0.5]} color={COLORS.skillsPurple} intensity={2} distance={2.5} decay={2} />
      )}
    </group>
  )
})

// ============================================================================
// SUMMONING SANCTUM - Subagents (OPTIMIZED)
// ============================================================================

const SummoningSanctum = memo(function SummoningSanctum({ position, highlight }: { position: [number, number, number]; highlight: boolean }) {
  const circlesRef = useRef<THREE.Group>(null)
  const frameCount = useRef(0)

  const spirits = useMemo(() => [
    { name: 'Scout', color: '#60a5fa' },
    { name: 'Sage', color: '#a78bfa' },
    { name: 'Battle Mage', color: '#4ade80' },
  ], [])

  useFrame((state) => {
    if (!circlesRef.current || !highlight) return
    frameCount.current++
    if (frameCount.current % PERF.frameSkip !== 0) return
    circlesRef.current.children.forEach((child, i) => {
      if (child instanceof THREE.Group) {
        const mesh = child.children[0] as THREE.Mesh
        if (mesh) mesh.rotation.z = state.clock.elapsedTime * (0.15 + i * 0.08)
      }
    })
  })

  return (
    <group position={position}>
      <group ref={circlesRef}>
        {spirits.map((spirit, i) => {
          const angle = (i / 3) * Math.PI * 2 - Math.PI / 2
          const x = Math.cos(angle) * 0.8
          const z = Math.sin(angle) * 0.8
          return (
            <group key={i} position={[x, 0.02, z]}>
              <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.4, 0.5, PERF.geoSegments]} />
                <meshStandardMaterial
                  color={spirit.color}
                  emissive={spirit.color}
                  emissiveIntensity={highlight ? 0.5 : 0.15}
                  transparent
                  opacity={0.6}
                />
              </mesh>
              {highlight && (
                <Float speed={2.5} floatIntensity={0.4}>
                  <mesh position={[0, 0.7, 0]}>
                    <sphereGeometry args={[0.12, PERF.geoSegmentsLow, PERF.geoSegmentsLow]} />
                    <meshBasicMaterial color={spirit.color} transparent opacity={0.5} />
                  </mesh>
                </Float>
              )}
              <Text
                position={[0, 0.05, 0.55]}
                fontSize={0.07}
                color={spirit.color}
                anchorX="center"
              >
                {spirit.name}
              </Text>
            </group>
          )
        })}
      </group>

      <Html position={[0, 1.4, 0]} center>
        <div className={`px-2 py-1 rounded text-xs font-medium backdrop-blur-sm ${
          highlight
            ? 'bg-blue-900/80 text-blue-100 border border-blue-400'
            : 'bg-stone-900/60 text-stone-300'
        }`}>
          <div>Summoning Sanctum</div>
          <div className="text-[10px] opacity-70 mt-0.5">Subagents (Task tool)</div>
        </div>
      </Html>

      {highlight && (
        <pointLight position={[0, 0.8, 0]} color={COLORS.subagentsBlue} intensity={3} distance={3} decay={2} />
      )}
    </group>
  )
})

// ============================================================================
// PORTAL NEXUS - MCP Connectors (OPTIMIZED)
// ============================================================================

const PortalNexus = memo(function PortalNexus({ position, highlight }: { position: [number, number, number]; highlight: boolean }) {
  const portalRef = useRef<THREE.Mesh>(null)
  const anchorsRef = useRef<THREE.Group>(null)
  const frameCount = useRef(0)

  const portals = useMemo(() => [
    { name: 'GitHub', color: '#22c55e' },
    { name: 'Slack', color: '#8b5cf6' },
    { name: 'Drive', color: '#3b82f6' },
    { name: 'Database', color: '#f97316' },
    { name: 'Linear', color: '#fbbf24' },
  ], [])

  useFrame((state) => {
    frameCount.current++
    if (frameCount.current % PERF.frameSkip !== 0) return

    const t = state.clock.elapsedTime
    if (portalRef.current) {
      portalRef.current.rotation.z = t * (highlight ? 0.6 : 0.2)
      if (highlight) {
        const scale = 1 + Math.sin(t * 2.5) * 0.08
        portalRef.current.scale.setScalar(scale)
      }
    }
    if (anchorsRef.current) {
      anchorsRef.current.rotation.y = t * (highlight ? 0.4 : 0.15)
    }
  })

  return (
    <group position={position}>
      <mesh position={[0, 1.3, 0]}>
        <torusGeometry args={[1.1, 0.15, PERF.geoSegmentsLow, PERF.geoSegments, Math.PI]} />
        <meshStandardMaterial
          color={COLORS.stone}
          roughness={0.8}
          emissive={highlight ? COLORS.mcpGreen : '#000000'}
          emissiveIntensity={highlight ? 0.08 : 0}
        />
      </mesh>

      <mesh position={[0, 1.3, 0.05]}>
        <torusGeometry args={[0.95, 0.04, PERF.geoSegmentsLow, PERF.geoSegments, Math.PI]} />
        <meshStandardMaterial
          color={COLORS.mcpGreen}
          emissive={COLORS.mcpGreen}
          emissiveIntensity={highlight ? 0.6 : 0.25}
        />
      </mesh>

      {[-1.1, 1.1].map((side, i) => (
        <mesh key={i} position={[side, 0.65, 0]}>
          <boxGeometry args={[0.3, 1.2, 0.3]} />
          <meshStandardMaterial color={COLORS.stoneDark} roughness={0.7} />
        </mesh>
      ))}

      <mesh ref={portalRef} position={[0, 1.3, 0.15]}>
        <circleGeometry args={[0.55, PERF.geoSegments]} />
        <meshStandardMaterial
          color={highlight ? '#ffffff' : COLORS.mcpGreen}
          emissive={COLORS.mcpGreen}
          emissiveIntensity={highlight ? 0.9 : 0.4}
          transparent
          opacity={highlight ? 0.8 : 0.55}
        />
      </mesh>

      <group ref={anchorsRef} position={[0, 1.3, 0]}>
        {portals.map((portal, i) => {
          const angle = (i / portals.length) * Math.PI * 2
          const radius = highlight ? 1.8 : 1.5
          return (
            <Float key={i} speed={1.5} floatIntensity={highlight ? 0.2 : 0.08}>
              <group position={[Math.cos(angle) * radius, Math.sin(angle) * 0.3, Math.sin(angle) * 0.4]}>
                <mesh>
                  <sphereGeometry args={[highlight ? 0.15 : 0.12, PERF.geoSegmentsLow, PERF.geoSegmentsLow]} />
                  <meshStandardMaterial
                    color={portal.color}
                    emissive={portal.color}
                    emissiveIntensity={highlight ? 0.7 : 0.3}
                  />
                </mesh>
                {highlight && (
                  <Text position={[0, 0.3, 0]} fontSize={0.1} color={portal.color} anchorX="center">
                    {portal.name}
                  </Text>
                )}
              </group>
            </Float>
          )
        })}
      </group>

      <Sparkles
        count={highlight ? 35 : 15}
        scale={highlight ? 2.5 : 1.8}
        size={highlight ? 1.5 : 1}
        speed={highlight ? 1.2 : 0.4}
        color={COLORS.mcpGreen}
        position={[0, 1.3, 0]}
      />

      <Html position={[0, 2.6, 0]} center>
        <div className={`px-3 py-1.5 rounded text-xs font-medium backdrop-blur-sm transition-all ${
          highlight
            ? 'bg-green-900/80 text-green-100 border border-green-400'
            : 'bg-stone-900/60 text-stone-300'
        }`}>
          <div>Portal Nexus</div>
          <div className="text-[10px] opacity-70 mt-0.5">MCP Connectors</div>
        </div>
      </Html>

      <pointLight
        position={[0, 1.3, 0.5]}
        color={COLORS.mcpGreen}
        intensity={highlight ? 5 : 1.5}
        distance={highlight ? 5 : 3}
        decay={2}
      />
    </group>
  )
})

// ============================================================================
// AMBIENT EFFECTS (OPTIMIZED)
// ============================================================================

const AmbientMagicDust = memo(function AmbientMagicDust() {
  return (
    <Sparkles
      count={60}
      scale={[14, 5, 14]}
      position={[0, 2.5, 0]}
      size={0.7}
      speed={0.15}
      opacity={0.35}
      color="#a78bfa"
      noise={[0.8, 0.4, 0.8]}
    />
  )
})

const FloatingIslands = memo(function FloatingIslands() {
  const islands = useMemo(() => [
    { pos: [-12, 8, -10] as [number, number, number], scale: 0.7 },
    { pos: [14, 10, -8] as [number, number, number], scale: 0.5 },
    { pos: [12, 9, 6] as [number, number, number], scale: 0.6 },
  ], [])

  return (
    <>
      {islands.map((island, i) => (
        <Float key={i} speed={0.4} floatIntensity={0.25}>
          <group position={island.pos} scale={island.scale}>
            <mesh>
              <dodecahedronGeometry args={[1.3]} />
              <meshBasicMaterial color="#44403c" />
            </mesh>
            <mesh position={[0, 0.9, 0]}>
              <sphereGeometry args={[0.9, 6, 4, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshBasicMaterial color="#15803d" />
            </mesh>
            <mesh position={[0, 1.5, 0]}>
              <coneGeometry args={[0.35, 0.9, 5]} />
              <meshBasicMaterial color="#166534" />
            </mesh>
          </group>
        </Float>
      ))}
    </>
  )
})

// Context mist uses centralized getContextVisuals from lib/theme.ts
const ContextMist = memo(function ContextMist({ level }: { level: number }) {
  const visuals = getContextVisuals(level)

  // Always render the mist container for smooth transitions
  return (
    <group>
      {/* Main mist sphere */}
      <mesh position={[0, 1, 0]}>
        <sphereGeometry args={[15, 16, 16]} />
        <meshBasicMaterial
          color={visuals.color}
          transparent
          opacity={visuals.mistOpacity * 0.3}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Inner warning mist - more intense at higher levels */}
      {level > 45 && (
        <mesh position={[0, 0.5, 0]}>
          <sphereGeometry args={[8, 12, 12]} />
          <meshBasicMaterial
            color={visuals.color}
            transparent
            opacity={visuals.mistOpacity * 0.15}
            side={THREE.BackSide}
          />
        </mesh>
      )}

      {/* Edge fog particles at high levels */}
      {level > 60 && (
        <Sparkles
          count={Math.floor((level - 60) / 2)}
          scale={[12, 3, 12]}
          position={[0, 1, 0]}
          size={0.5}
          speed={0.1}
          opacity={0.3}
          color={visuals.color}
        />
      )}
    </group>
  )
})

export default ArcaneSanctum
