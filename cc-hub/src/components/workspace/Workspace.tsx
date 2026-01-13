import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { TERMINAL_COLORS, getTerminalMode, type TerminalMode } from '../../lib/terminalTheme'
import { TerminalScreen } from './TerminalScreen'
import { Office } from './Office'
import { PopFigures } from './PopFigures'

// ============================================================================
// WORKSPACE - Minimal desk + monitor setup for Claude Code simulator
// ============================================================================

interface WorkspaceProps {
  highlight?: string
  contextLevel?: number
  showTool?: string
  beatId?: string  // Beat ID for beat-specific terminal content
}

export function Workspace({ highlight, contextLevel = 0, showTool, beatId }: WorkspaceProps) {
  const terminalMode = getTerminalMode(highlight)

  return (
    <group>
      {/* Office environment (walls, floor, window, decor) */}
      <Office />

      {/* Desk surface - simple plane */}
      <Desk />

      {/* Monitor */}
      <Monitor
        terminalMode={terminalMode}
        contextLevel={contextLevel}
        showTool={showTool}
        highlight={highlight}
        beatId={beatId}
      />

      {/* Anime pop figures decoration */}
      <PopFigures />

      {/* Ambient lighting for the workspace */}
      <WorkspaceLighting highlight={highlight} />
    </group>
  )
}

// ============================================================================
// DESK - Wooden desk with thickness
// ============================================================================

// Desk colors - warm wood tones
const DESK_COLORS = {
  top: '#8b7355',      // Warm wood
  edge: '#7a6348',     // Slightly darker edge
  legs: '#5c4a3a',     // Dark wood legs
}

function Desk() {
  return (
    <group>
      {/* Desk top surface */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.5, 0.08, 2]} />
        <meshStandardMaterial
          color={DESK_COLORS.top}
          roughness={0.6}
          metalness={0.05}
        />
      </mesh>

      {/* Desk front edge (rounded look) */}
      <mesh position={[0, -0.02, 1]} castShadow>
        <boxGeometry args={[3.5, 0.04, 0.05]} />
        <meshStandardMaterial
          color={DESK_COLORS.edge}
          roughness={0.5}
          metalness={0.1}
        />
      </mesh>

      {/* Desk legs */}
      {[
        [-1.6, -0.4, 0.8],
        [1.6, -0.4, 0.8],
        [-1.6, -0.4, -0.8],
        [1.6, -0.4, -0.8],
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} castShadow>
          <boxGeometry args={[0.08, 0.8, 0.08]} />
          <meshStandardMaterial
            color={DESK_COLORS.legs}
            roughness={0.7}
            metalness={0.05}
          />
        </mesh>
      ))}

      {/* Desk side panels (connecting legs) */}
      <mesh position={[-1.6, -0.4, 0]} castShadow>
        <boxGeometry args={[0.04, 0.3, 1.5]} />
        <meshStandardMaterial color={DESK_COLORS.legs} roughness={0.7} />
      </mesh>
      <mesh position={[1.6, -0.4, 0]} castShadow>
        <boxGeometry args={[0.04, 0.3, 1.5]} />
        <meshStandardMaterial color={DESK_COLORS.legs} roughness={0.7} />
      </mesh>

      {/* Small drawer unit on right side */}
      <mesh position={[1.2, -0.25, 0.5]} castShadow>
        <boxGeometry args={[0.6, 0.4, 0.5]} />
        <meshStandardMaterial color={DESK_COLORS.edge} roughness={0.6} />
      </mesh>
      {/* Drawer handle */}
      <mesh position={[1.2, -0.2, 0.76]} castShadow>
        <boxGeometry args={[0.15, 0.03, 0.02]} />
        <meshStandardMaterial color="#a0a0a0" roughness={0.3} metalness={0.6} />
      </mesh>
    </group>
  )
}

// ============================================================================
// MONITOR - Frame + Screen
// ============================================================================

interface MonitorProps {
  terminalMode: TerminalMode
  contextLevel: number
  showTool?: string
  highlight?: string
  beatId?: string
}

function Monitor({ terminalMode, contextLevel, showTool, highlight, beatId }: MonitorProps) {
  const glowRef = useRef<THREE.Mesh>(null)
  const frameRef = useRef<THREE.Mesh>(null)

  // Subtle glow pulse animation
  useFrame((state) => {
    if (glowRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.1 + 0.9
      const material = glowRef.current.material as THREE.MeshBasicMaterial
      material.opacity = 0.15 * pulse
    }
  })

  const monitorWidth = 2.4
  const monitorHeight = 1.5
  const bezelWidth = 0.06
  const standHeight = 0.4
  const monitorY = 1.1 // Height of monitor center

  return (
    <group position={[0, 0, -0.5]}>
      {/* Monitor stand base */}
      <mesh position={[0, 0.05, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.35, 0.1, 32]} />
        <meshStandardMaterial
          color={TERMINAL_COLORS.monitorFrame}
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>

      {/* Monitor stand neck */}
      <mesh position={[0, standHeight / 2 + 0.1, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.05, standHeight, 16]} />
        <meshStandardMaterial
          color={TERMINAL_COLORS.monitorFrame}
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>

      {/* Monitor frame (bezel) */}
      <mesh ref={frameRef} position={[0, monitorY, 0]} castShadow>
        <boxGeometry args={[monitorWidth + bezelWidth * 2, monitorHeight + bezelWidth * 2, 0.08]} />
        <meshStandardMaterial
          color={TERMINAL_COLORS.monitorFrame}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Screen surface (dark, behind the HTML) - removed, Html will be the screen */}

      {/* Terminal screen content - HTML overlay - positioned further forward */}
      <TerminalScreen
        position={[0, monitorY, 0.06]}
        width={monitorWidth}
        height={monitorHeight}
        mode={terminalMode}
        contextLevel={contextLevel}
        showTool={showTool}
        highlight={highlight}
        beatId={beatId}
      />

      {/* Edge glow effect - behind terminal now */}
      <mesh ref={glowRef} position={[0, monitorY, 0.045]}>
        <planeGeometry args={[monitorWidth + 0.1, monitorHeight + 0.1]} />
        <meshBasicMaterial
          color={TERMINAL_COLORS.monitorGlow}
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  )
}

// ============================================================================
// WORKSPACE LIGHTING
// ============================================================================

interface WorkspaceLightingProps {
  highlight?: string
}

function WorkspaceLighting({ highlight: _highlight }: WorkspaceLightingProps) {
  const glowLightRef = useRef<THREE.PointLight>(null)

  // Animate the monitor glow light
  useFrame((state) => {
    if (glowLightRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 1.5) * 0.2 + 1
      glowLightRef.current.intensity = 0.4 * pulse
    }
  })

  return (
    <>
      {/* Main key light - warm daylight from window direction */}
      <directionalLight
        position={[4, 6, 2]}
        intensity={0.6}
        color="#fff8f0"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={20}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-bias={-0.0001}
      />

      {/* Fill light - soft ambient for office feel */}
      <ambientLight intensity={0.35} color="#e8e4e0" />

      {/* Window light - soft blue-white from the window */}
      <pointLight
        position={[2, 2.5, -2]}
        color="#d0e0f0"
        intensity={0.4}
        distance={8}
        decay={2}
      />

      {/* Monitor glow - Anthropic coral */}
      <pointLight
        ref={glowLightRef}
        position={[0, 1.1, 0.5]}
        color={TERMINAL_COLORS.accent}
        intensity={0.4}
        distance={4}
        decay={2}
      />

      {/* Subtle fill from below/front for desk item visibility */}
      <pointLight
        position={[0, 0.5, 2]}
        color="#f0e8e0"
        intensity={0.2}
        distance={5}
        decay={2}
      />
    </>
  )
}

export default Workspace
