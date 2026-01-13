import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, Text, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { TOOL_INFO } from '../../content/story'

// ============================================================================
// WORKSHOP SCENE - Earth-themed construction workshop
// Light mode, outdoor setting, builder aesthetic
// ============================================================================

interface WorkshopSceneProps {
  highlight?: string
  showTool?: string
}

export function WorkshopScene({ highlight, showTool }: WorkshopSceneProps) {
  return (
    <group>
      {/* Ground - Grass */}
      <Ground />

      {/* Workshop elements */}
      <Workbench position={[0, 0, 2.5]} highlight={highlight === 'workbench'} />
      <ToolWall position={[3, 0, 0]} highlight={highlight === 'toolwall'} activeTool={showTool} />
      <BlueprintBoard position={[0, 0, -2.5]} highlight={highlight === 'blueprint'} />
      <CommandRadio position={[-3, 0, 0]} highlight={highlight === 'radio'} />
      <MemoryCrate position={[-2, 0, 2]} highlight={highlight === 'crate'} />

      {/* Decorative elements */}
      <Trees />
      <Fence />
    </group>
  )
}

// ============================================================================
// GROUND - Grassy field
// ============================================================================

function Ground() {
  return (
    <group>
      {/* Main grass - let R3F manage geometry lifecycle */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.01, 0]}
        receiveShadow
      >
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#4ade80" roughness={0.9} />
      </mesh>

      {/* Workshop platform */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <circleGeometry args={[5, 32]} />
        <meshStandardMaterial color="#d4a574" roughness={0.8} />
      </mesh>

      {/* Platform border */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[4.8, 5, 32]} />
        <meshStandardMaterial color="#92400e" roughness={0.7} />
      </mesh>
    </group>
  )
}

// ============================================================================
// WORKBENCH - Where building happens
// ============================================================================

function Workbench({ position, highlight }: { position: [number, number, number]; highlight: boolean }) {
  const glowRef = useRef<THREE.PointLight>(null)

  useFrame((state) => {
    if (glowRef.current && highlight) {
      glowRef.current.intensity = 3 + Math.sin(state.clock.elapsedTime * 3) * 1
    }
  })

  return (
    <group position={position}>
      {/* Main bench surface */}
      <RoundedBox args={[2, 0.1, 1]} radius={0.02} position={[0, 0.85, 0]}>
        <meshStandardMaterial color="#92400e" roughness={0.6} />
      </RoundedBox>

      {/* Legs */}
      {[[-0.8, 0, -0.35], [0.8, 0, -0.35], [-0.8, 0, 0.35], [0.8, 0, 0.35]].map((pos, i) => (
        <mesh key={i} position={[pos[0], 0.4, pos[2]]}>
          <boxGeometry args={[0.1, 0.8, 0.1]} />
          <meshStandardMaterial color="#78350f" roughness={0.8} />
        </mesh>
      ))}

      {/* Vice on bench */}
      <mesh position={[0.7, 0.95, 0]}>
        <boxGeometry args={[0.15, 0.15, 0.2]} />
        <meshStandardMaterial color="#64748b" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Some wood pieces */}
      <mesh position={[-0.3, 0.93, 0.2]} rotation={[0, 0.3, 0]}>
        <boxGeometry args={[0.4, 0.05, 0.1]} />
        <meshStandardMaterial color="#c4a574" roughness={0.9} />
      </mesh>

      {/* Label */}
      <Html position={[0, 1.3, 0]} center>
        <div className={`px-2 py-1 rounded text-xs font-medium ${highlight ? 'bg-amber-100 text-amber-800 border border-amber-400' : 'bg-stone-100 text-stone-600'}`}>
          Workbench
        </div>
      </Html>

      {/* Highlight glow */}
      {highlight && (
        <pointLight ref={glowRef} position={[0, 1, 0]} color="#fbbf24" intensity={3} distance={3} />
      )}
    </group>
  )
}

// ============================================================================
// TOOL WALL - Display of available tools
// ============================================================================

function ToolWall({ position, highlight, activeTool }: { position: [number, number, number]; highlight: boolean; activeTool?: string }) {
  const tools = Object.entries(TOOL_INFO)

  return (
    <group position={position}>
      {/* Wall backing */}
      <mesh position={[0, 1.2, 0]}>
        <boxGeometry args={[0.15, 2.2, 2.5]} />
        <meshStandardMaterial color="#d6d3d1" roughness={0.9} />
      </mesh>

      {/* Pegboard texture overlay */}
      <mesh position={[-0.08, 1.2, 0]}>
        <boxGeometry args={[0.02, 2, 2.3]} />
        <meshStandardMaterial color="#a8a29e" roughness={0.8} />
      </mesh>

      {/* Tool hooks */}
      {tools.map(([key, tool], i) => {
        const row = Math.floor(i / 2)
        const col = i % 2
        const y = 1.8 - row * 0.5
        const z = col === 0 ? -0.5 : 0.5
        const isActive = activeTool === key

        return (
          <group key={key} position={[-0.15, y, z]}>
            {/* Tool representation */}
            <mesh>
              <boxGeometry args={[0.15, 0.15, 0.3]} />
              <meshStandardMaterial
                color={tool.color}
                emissive={isActive ? tool.color : '#000000'}
                emissiveIntensity={isActive ? 0.5 : 0}
              />
            </mesh>

            {/* Tool label */}
            <Text
              position={[-0.2, 0, 0]}
              rotation={[0, Math.PI / 2, 0]}
              fontSize={0.08}
              color={isActive ? tool.color : '#57534e'}
              anchorX="center"
            >
              {tool.icon} {tool.name}
            </Text>

            {/* Glow when active */}
            {isActive && (
              <pointLight color={tool.color} intensity={2} distance={1.5} />
            )}
          </group>
        )
      })}

      {/* Label */}
      <Html position={[-0.3, 2.5, 0]} center>
        <div className={`px-2 py-1 rounded text-xs font-medium ${highlight ? 'bg-green-100 text-green-800 border border-green-400' : 'bg-stone-100 text-stone-600'}`}>
          Tool Wall
        </div>
      </Html>

      {/* Highlight glow */}
      {highlight && (
        <pointLight position={[-0.5, 1.2, 0]} color="#22c55e" intensity={4} distance={4} />
      )}
    </group>
  )
}

// ============================================================================
// BLUEPRINT BOARD - Shows project instructions (CLAUDE.md)
// ============================================================================

function BlueprintBoard({ position, highlight }: { position: [number, number, number]; highlight: boolean }) {
  const boardRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (boardRef.current && highlight) {
      boardRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05
    }
  })

  return (
    <group position={position}>
      {/* Easel legs */}
      <mesh position={[-0.4, 0.8, 0.3]} rotation={[0.2, 0, 0]}>
        <boxGeometry args={[0.05, 1.8, 0.05]} />
        <meshStandardMaterial color="#78350f" roughness={0.9} />
      </mesh>
      <mesh position={[0.4, 0.8, 0.3]} rotation={[0.2, 0, 0]}>
        <boxGeometry args={[0.05, 1.8, 0.05]} />
        <meshStandardMaterial color="#78350f" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.8, -0.2]} rotation={[-0.3, 0, 0]}>
        <boxGeometry args={[0.05, 1.6, 0.05]} />
        <meshStandardMaterial color="#78350f" roughness={0.9} />
      </mesh>

      {/* Board */}
      <mesh ref={boardRef} position={[0, 1.4, 0.2]}>
        <boxGeometry args={[1.2, 0.9, 0.05]} />
        <meshStandardMaterial color="#f5f5f4" roughness={0.9} />
      </mesh>

      {/* Blueprint paper */}
      <mesh position={[0, 1.4, 0.23]}>
        <planeGeometry args={[1, 0.7]} />
        <meshStandardMaterial color="#dbeafe" roughness={0.9} />
      </mesh>

      {/* Grid lines on blueprint */}
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh key={`h${i}`} position={[0, 1.15 + i * 0.12, 0.235]}>
          <planeGeometry args={[0.9, 0.005]} />
          <meshBasicMaterial color="#93c5fd" />
        </mesh>
      ))}
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh key={`v${i}`} position={[-0.36 + i * 0.18, 1.4, 0.235]}>
          <planeGeometry args={[0.005, 0.6]} />
          <meshBasicMaterial color="#93c5fd" />
        </mesh>
      ))}

      {/* CLAUDE.md label */}
      <Text
        position={[0, 1.65, 0.24]}
        fontSize={0.08}
        color="#1e40af"
        anchorX="center"
      >
        CLAUDE.md
      </Text>

      {/* Label */}
      <Html position={[0, 2.1, 0]} center>
        <div className={`px-2 py-1 rounded text-xs font-medium ${highlight ? 'bg-blue-100 text-blue-800 border border-blue-400' : 'bg-stone-100 text-stone-600'}`}>
          Blueprint Board
        </div>
      </Html>

      {/* Highlight glow */}
      {highlight && (
        <pointLight position={[0, 1.4, 0.5]} color="#3b82f6" intensity={3} distance={3} />
      )}
    </group>
  )
}

// ============================================================================
// COMMAND RADIO - For shell commands (Bash)
// ============================================================================

function CommandRadio({ position, highlight }: { position: [number, number, number]; highlight: boolean }) {
  const antennaRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (antennaRef.current) {
      antennaRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 2) * 0.1
    }
  })

  return (
    <group position={position}>
      {/* Table */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.8, 0.05, 0.6]} />
        <meshStandardMaterial color="#92400e" roughness={0.7} />
      </mesh>

      {/* Table legs */}
      {[[-0.35, 0, -0.25], [0.35, 0, -0.25], [-0.35, 0, 0.25], [0.35, 0, 0.25]].map((pos, i) => (
        <mesh key={i} position={[pos[0], 0.25, pos[2]]}>
          <boxGeometry args={[0.06, 0.5, 0.06]} />
          <meshStandardMaterial color="#78350f" roughness={0.8} />
        </mesh>
      ))}

      {/* Radio body */}
      <RoundedBox args={[0.5, 0.3, 0.3]} radius={0.03} position={[0, 0.7, 0]}>
        <meshStandardMaterial color="#1f2937" roughness={0.5} metalness={0.3} />
      </RoundedBox>

      {/* Screen */}
      <mesh position={[0, 0.72, 0.16]}>
        <planeGeometry args={[0.35, 0.15]} />
        <meshBasicMaterial color="#22c55e" />
      </mesh>

      {/* Terminal text effect */}
      <Text
        position={[0, 0.72, 0.17]}
        fontSize={0.03}
        color="#15803d"
        anchorX="center"
      >
        $ _
      </Text>

      {/* Antenna */}
      <mesh ref={antennaRef} position={[0.15, 1, 0]}>
        <cylinderGeometry args={[0.01, 0.015, 0.4, 8]} />
        <meshStandardMaterial color="#71717a" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Antenna tip */}
      <mesh position={[0.15, 1.22, 0]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.5} />
      </mesh>

      {/* Dials */}
      {[-0.1, 0.1].map((x, i) => (
        <mesh key={i} position={[x, 0.6, 0.16]}>
          <cylinderGeometry args={[0.03, 0.03, 0.02, 16]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}

      {/* Label */}
      <Html position={[0, 1.1, 0]} center>
        <div className={`px-2 py-1 rounded text-xs font-medium ${highlight ? 'bg-red-100 text-red-800 border border-red-400' : 'bg-stone-100 text-stone-600'}`}>
          Command Radio
        </div>
      </Html>

      {/* Highlight glow */}
      {highlight && (
        <pointLight position={[0, 0.8, 0.5]} color="#ef4444" intensity={3} distance={3} />
      )}
    </group>
  )
}

// ============================================================================
// MEMORY CRATE - Shows context/memory storage
// ============================================================================

function MemoryCrate({ position, highlight }: { position: [number, number, number]; highlight: boolean }) {
  const groupRef = useRef<THREE.Group>(null)

  // Pre-create paper data with stable values (seeded by index, not random)
  const papers = useMemo(() => (
    Array.from({ length: 8 }, (_, i) => ({
      y: 0.05 + i * 0.06,
      rotation: ((i * 0.618) % 1 - 0.5) * 0.2, // Deterministic pseudo-random
      color: ['#fef3c7', '#fde68a', '#fcd34d', '#fbbf24'][i % 4],
    }))
  ), [])

  useFrame((state) => {
    if (!groupRef.current || !highlight) return

    // Animate papers by traversing the group's children
    groupRef.current.children.forEach((child) => {
      if (child.userData.isPaper && papers[child.userData.paperIndex]) {
        const paperData = papers[child.userData.paperIndex]
        child.position.y = paperData.y + 0.3 + Math.sin(state.clock.elapsedTime * 2 + child.userData.paperIndex) * 0.01
      }
    })
  })

  return (
    <group position={position}>
      {/* Crate body */}
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[0.8, 0.6, 0.5]} />
        <meshStandardMaterial color="#92400e" roughness={0.9} />
      </mesh>

      {/* Crate slats */}
      {[-0.25, 0, 0.25].map((y, i) => (
        <mesh key={`slat-${i}`} position={[0, 0.1 + y * 0.8, 0.26]}>
          <boxGeometry args={[0.75, 0.08, 0.02]} />
          <meshStandardMaterial color="#78350f" roughness={0.9} />
        </mesh>
      ))}

      {/* Papers inside (representing messages) */}
      <group ref={groupRef}>
        {papers.map((paper, i) => (
          <mesh
            key={`paper-${i}`}
            position={[0, paper.y + 0.3, 0]}
            rotation={[0, paper.rotation, 0]}
            userData={{ isPaper: true, paperIndex: i }}
          >
            <boxGeometry args={[0.5, 0.02, 0.35]} />
            <meshStandardMaterial color={paper.color} roughness={0.9} />
          </mesh>
        ))}
      </group>

      {/* Label */}
      <Html position={[0, 0.9, 0]} center>
        <div className={`px-2 py-1 rounded text-xs font-medium ${highlight ? 'bg-orange-100 text-orange-800 border border-orange-400' : 'bg-stone-100 text-stone-600'}`}>
          Memory Crate
        </div>
      </Html>

      {/* Highlight glow */}
      {highlight && (
        <pointLight position={[0, 0.6, 0.5]} color="#f97316" intensity={3} distance={3} />
      )}
    </group>
  )
}

// ============================================================================
// TREES - Background decoration
// ============================================================================

function Trees() {
  const trees = useMemo(() => [
    { pos: [-8, 0, -5] as [number, number, number], scale: 1 },
    { pos: [-6, 0, -8] as [number, number, number], scale: 0.8 },
    { pos: [8, 0, -6] as [number, number, number], scale: 1.1 },
    { pos: [7, 0, -9] as [number, number, number], scale: 0.9 },
    { pos: [-9, 0, 3] as [number, number, number], scale: 0.85 },
    { pos: [9, 0, 4] as [number, number, number], scale: 1 },
  ], [])

  return (
    <>
      {trees.map((tree, i) => (
        <group key={i} position={tree.pos} scale={tree.scale}>
          {/* Trunk */}
          <mesh position={[0, 1, 0]}>
            <cylinderGeometry args={[0.15, 0.2, 2, 8]} />
            <meshStandardMaterial color="#78350f" roughness={0.9} />
          </mesh>
          {/* Foliage */}
          <mesh position={[0, 2.5, 0]}>
            <coneGeometry args={[1, 2, 8]} />
            <meshStandardMaterial color="#15803d" roughness={0.9} />
          </mesh>
          <mesh position={[0, 3.3, 0]}>
            <coneGeometry args={[0.7, 1.5, 8]} />
            <meshStandardMaterial color="#16a34a" roughness={0.9} />
          </mesh>
        </group>
      ))}
    </>
  )
}

// ============================================================================
// FENCE - Workshop boundary
// ============================================================================

function Fence() {
  const posts = useMemo(() => {
    const arr: [number, number, number][] = []
    // Back fence
    for (let x = -6; x <= 6; x += 1.5) {
      arr.push([x, 0, -6])
    }
    // Side fences
    for (let z = -6; z <= 4; z += 1.5) {
      arr.push([-6, 0, z])
      arr.push([6, 0, z])
    }
    return arr
  }, [])

  return (
    <>
      {posts.map((pos, i) => (
        <group key={i} position={pos}>
          {/* Post */}
          <mesh position={[0, 0.4, 0]}>
            <boxGeometry args={[0.08, 0.8, 0.08]} />
            <meshStandardMaterial color="#a3a3a3" roughness={0.7} />
          </mesh>
          {/* Post top */}
          <mesh position={[0, 0.85, 0]}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.6} roughness={0.4} />
          </mesh>
        </group>
      ))}
    </>
  )
}

export default WorkshopScene
