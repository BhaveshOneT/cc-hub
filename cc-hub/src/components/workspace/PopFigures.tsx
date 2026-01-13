// ============================================================================
// POP FIGURES - Cute anime-style collectible figures for the desk
// ============================================================================

// Figure color palettes
const FIGURE_COLORS = {
  // Figure 1 - Blue haired anime character
  figure1: {
    hair: '#4a90d9',
    hairHighlight: '#6ab0f5',
    skin: '#fce4d4',
    eyes: '#2d5a8a',
    outfit: '#2d3748',
    outfitAccent: '#4a5568',
    blush: '#f5a0a0',
  },
  // Figure 2 - Pink haired character
  figure2: {
    hair: '#e891b0',
    hairHighlight: '#f5b8cf',
    skin: '#fce4d4',
    eyes: '#8b4a6b',
    outfit: '#f5f5f5',
    outfitAccent: '#e891b0',
    blush: '#f5a0a0',
  },
  // Figure 3 - Dark/mysterious character
  figure3: {
    hair: '#1a1a2e',
    hairHighlight: '#2d2d4a',
    skin: '#f0dcc8',
    eyes: '#c44',
    outfit: '#1a1a1a',
    outfitAccent: '#8b0000',
    blush: '#d4a0a0',
  },
  // Base/stand colors
  base: '#2a2a2a',
  baseRim: '#4a4a4a',
}

export function PopFigures() {
  return (
    <group>
      {/* Figure 1 - Blue hair, on left side of desk */}
      <group position={[-1.1, 0.04, 0.5]}>
        <PopFigure colors={FIGURE_COLORS.figure1} variant="spiky" />
      </group>

      {/* Figure 2 - Pink hair, center-right */}
      <group position={[0.85, 0.04, 0.65]} rotation={[0, -0.3, 0]}>
        <PopFigure colors={FIGURE_COLORS.figure2} variant="long" />
      </group>

      {/* Figure 3 - Dark mysterious, far right */}
      <group position={[1.4, 0.04, 0.35]} rotation={[0, -0.5, 0]}>
        <PopFigure colors={FIGURE_COLORS.figure3} variant="swept" />
      </group>
    </group>
  )
}

// ============================================================================
// INDIVIDUAL POP FIGURE
// ============================================================================

interface PopFigureProps {
  colors: {
    hair: string
    hairHighlight: string
    skin: string
    eyes: string
    outfit: string
    outfitAccent: string
    blush: string
  }
  variant: 'spiky' | 'long' | 'swept'
}

function PopFigure({ colors, variant }: PopFigureProps) {
  const scale = 0.08

  return (
    <group scale={scale}>
      {/* === BASE/STAND === */}
      <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.8, 0.9, 0.2, 24]} />
        <meshStandardMaterial color={FIGURE_COLORS.base} roughness={0.3} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.75, 0.8, 0.04, 24]} />
        <meshStandardMaterial color={FIGURE_COLORS.baseRim} roughness={0.4} metalness={0.2} />
      </mesh>

      {/* === BODY === */}
      <group position={[0, 0.9, 0]}>
        {/* Torso */}
        <mesh castShadow>
          <capsuleGeometry args={[0.35, 0.5, 8, 16]} />
          <meshStandardMaterial color={colors.outfit} roughness={0.8} />
        </mesh>

        {/* Outfit details - collar/trim */}
        <mesh position={[0, 0.35, 0.2]}>
          <boxGeometry args={[0.4, 0.15, 0.15]} />
          <meshStandardMaterial color={colors.outfitAccent} roughness={0.7} />
        </mesh>

        {/* Arms */}
        <mesh position={[-0.4, 0.1, 0]} rotation={[0, 0, 0.3]} castShadow>
          <capsuleGeometry args={[0.12, 0.35, 6, 10]} />
          <meshStandardMaterial color={colors.outfit} roughness={0.8} />
        </mesh>
        <mesh position={[0.4, 0.1, 0]} rotation={[0, 0, -0.3]} castShadow>
          <capsuleGeometry args={[0.12, 0.35, 6, 10]} />
          <meshStandardMaterial color={colors.outfit} roughness={0.8} />
        </mesh>

        {/* Hands */}
        <mesh position={[-0.55, -0.1, 0]}>
          <sphereGeometry args={[0.1, 10, 10]} />
          <meshStandardMaterial color={colors.skin} roughness={0.9} />
        </mesh>
        <mesh position={[0.55, -0.1, 0]}>
          <sphereGeometry args={[0.1, 10, 10]} />
          <meshStandardMaterial color={colors.skin} roughness={0.9} />
        </mesh>
      </group>

      {/* === LEGS === */}
      <group position={[0, 0.35, 0]}>
        <mesh position={[-0.15, 0, 0]} castShadow>
          <capsuleGeometry args={[0.12, 0.25, 6, 10]} />
          <meshStandardMaterial color={colors.outfit} roughness={0.8} />
        </mesh>
        <mesh position={[0.15, 0, 0]} castShadow>
          <capsuleGeometry args={[0.12, 0.25, 6, 10]} />
          <meshStandardMaterial color={colors.outfit} roughness={0.8} />
        </mesh>

        {/* Feet/shoes */}
        <mesh position={[-0.15, -0.2, 0.05]}>
          <boxGeometry args={[0.15, 0.1, 0.25]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.6} />
        </mesh>
        <mesh position={[0.15, -0.2, 0.05]}>
          <boxGeometry args={[0.15, 0.1, 0.25]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.6} />
        </mesh>
      </group>

      {/* === HEAD (BIG - Pop figure style) === */}
      <group position={[0, 1.9, 0]}>
        {/* Main head - oversized */}
        <mesh castShadow>
          <sphereGeometry args={[0.65, 20, 20]} />
          <meshStandardMaterial color={colors.skin} roughness={0.9} />
        </mesh>

        {/* Face flat area */}
        <mesh position={[0, -0.05, 0.45]} scale={[1, 0.9, 0.4]}>
          <sphereGeometry args={[0.45, 16, 16]} />
          <meshStandardMaterial color={colors.skin} roughness={0.9} />
        </mesh>

        {/* === HAIR === */}
        <HairStyle variant={variant} color={colors.hair} highlight={colors.hairHighlight} />

        {/* === EYES (Big anime style) === */}
        <group position={[0, 0, 0.5]}>
          {/* Left eye */}
          <group position={[-0.2, 0, 0]}>
            {/* Eye white */}
            <mesh>
              <sphereGeometry args={[0.18, 14, 14]} />
              <meshStandardMaterial color="#ffffff" />
            </mesh>
            {/* Iris */}
            <mesh position={[0, 0, 0.1]}>
              <sphereGeometry args={[0.14, 12, 12]} />
              <meshStandardMaterial color={colors.eyes} />
            </mesh>
            {/* Pupil */}
            <mesh position={[0, 0, 0.14]}>
              <sphereGeometry args={[0.07, 10, 10]} />
              <meshStandardMaterial color="#111111" />
            </mesh>
            {/* Eye shine (large) */}
            <mesh position={[-0.05, 0.06, 0.16]}>
              <sphereGeometry args={[0.04, 8, 8]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            {/* Eye shine (small) */}
            <mesh position={[0.04, -0.03, 0.16]}>
              <sphereGeometry args={[0.02, 6, 6]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          </group>

          {/* Right eye */}
          <group position={[0.2, 0, 0]}>
            <mesh>
              <sphereGeometry args={[0.18, 14, 14]} />
              <meshStandardMaterial color="#ffffff" />
            </mesh>
            <mesh position={[0, 0, 0.1]}>
              <sphereGeometry args={[0.14, 12, 12]} />
              <meshStandardMaterial color={colors.eyes} />
            </mesh>
            <mesh position={[0, 0, 0.14]}>
              <sphereGeometry args={[0.07, 10, 10]} />
              <meshStandardMaterial color="#111111" />
            </mesh>
            <mesh position={[0.05, 0.06, 0.16]}>
              <sphereGeometry args={[0.04, 8, 8]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            <mesh position={[-0.04, -0.03, 0.16]}>
              <sphereGeometry args={[0.02, 6, 6]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          </group>
        </group>

        {/* Blush marks */}
        <mesh position={[-0.35, -0.1, 0.4]} rotation={[0, 0.3, 0]}>
          <sphereGeometry args={[0.08, 10, 10]} />
          <meshStandardMaterial color={colors.blush} roughness={1} transparent opacity={0.5} />
        </mesh>
        <mesh position={[0.35, -0.1, 0.4]} rotation={[0, -0.3, 0]}>
          <sphereGeometry args={[0.08, 10, 10]} />
          <meshStandardMaterial color={colors.blush} roughness={1} transparent opacity={0.5} />
        </mesh>

        {/* Small nose */}
        <mesh position={[0, -0.12, 0.6]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color={colors.skin} roughness={0.9} />
        </mesh>

        {/* Small mouth */}
        <mesh position={[0, -0.25, 0.55]} rotation={[0.2, 0, 0]}>
          <capsuleGeometry args={[0.02, 0.08, 4, 8]} />
          <meshStandardMaterial color="#d4a0a0" roughness={0.8} />
        </mesh>
      </group>
    </group>
  )
}

// ============================================================================
// HAIR STYLES
// ============================================================================

interface HairStyleProps {
  variant: 'spiky' | 'long' | 'swept'
  color: string
  highlight: string
}

function HairStyle({ variant, color, highlight }: HairStyleProps) {
  switch (variant) {
    case 'spiky':
      return <SpikyHair color={color} highlight={highlight} />
    case 'long':
      return <LongHair color={color} highlight={highlight} />
    case 'swept':
      return <SweptHair color={color} highlight={highlight} />
    default:
      return null
  }
}

function SpikyHair({ color, highlight }: { color: string; highlight: string }) {
  return (
    <group>
      {/* Base hair mass */}
      <mesh position={[0, 0.15, -0.1]} castShadow>
        <sphereGeometry args={[0.6, 16, 16]} />
        <meshStandardMaterial color={color} roughness={0.85} />
      </mesh>

      {/* Spiky parts */}
      {[
        { pos: [0, 0.7, -0.1], rot: [0.3, 0, 0], scale: 0.9 },
        { pos: [-0.3, 0.6, 0], rot: [0.2, 0, 0.4], scale: 0.7 },
        { pos: [0.3, 0.6, 0], rot: [0.2, 0, -0.4], scale: 0.7 },
        { pos: [-0.2, 0.65, -0.2], rot: [0.4, 0.2, 0.2], scale: 0.6 },
        { pos: [0.2, 0.65, -0.2], rot: [0.4, -0.2, -0.2], scale: 0.6 },
        { pos: [0, 0.55, -0.35], rot: [0.8, 0, 0], scale: 0.5 },
      ].map((spike, i) => (
        <mesh
          key={i}
          position={spike.pos as [number, number, number]}
          rotation={spike.rot as [number, number, number]}
          scale={spike.scale}
          castShadow
        >
          <coneGeometry args={[0.15, 0.4, 6]} />
          <meshStandardMaterial color={i % 2 === 0 ? color : highlight} roughness={0.85} />
        </mesh>
      ))}

      {/* Front bangs */}
      <mesh position={[0, 0.2, 0.45]} rotation={[-0.5, 0, 0]} castShadow>
        <boxGeometry args={[0.6, 0.25, 0.15]} />
        <meshStandardMaterial color={color} roughness={0.85} />
      </mesh>
      {[-0.2, 0, 0.2].map((x, i) => (
        <mesh key={i} position={[x, 0.05, 0.52]} rotation={[-0.3, 0, (i - 1) * 0.1]} castShadow>
          <coneGeometry args={[0.08, 0.2, 4]} />
          <meshStandardMaterial color={i === 1 ? highlight : color} roughness={0.85} />
        </mesh>
      ))}
    </group>
  )
}

function LongHair({ color, highlight }: { color: string; highlight: string }) {
  return (
    <group>
      {/* Base hair mass (top) */}
      <mesh position={[0, 0.2, 0]} castShadow>
        <sphereGeometry args={[0.62, 16, 16]} />
        <meshStandardMaterial color={color} roughness={0.85} />
      </mesh>

      {/* Long flowing sides */}
      <mesh position={[-0.4, -0.3, 0]} castShadow>
        <capsuleGeometry args={[0.2, 0.8, 8, 12]} />
        <meshStandardMaterial color={color} roughness={0.85} />
      </mesh>
      <mesh position={[0.4, -0.3, 0]} castShadow>
        <capsuleGeometry args={[0.2, 0.8, 8, 12]} />
        <meshStandardMaterial color={color} roughness={0.85} />
      </mesh>

      {/* Back long hair */}
      <mesh position={[0, -0.4, -0.2]} castShadow>
        <capsuleGeometry args={[0.35, 1, 8, 12]} />
        <meshStandardMaterial color={color} roughness={0.85} />
      </mesh>

      {/* Hair tips */}
      <mesh position={[-0.4, -0.85, 0]} castShadow>
        <sphereGeometry args={[0.15, 10, 10]} />
        <meshStandardMaterial color={highlight} roughness={0.85} />
      </mesh>
      <mesh position={[0.4, -0.85, 0]} castShadow>
        <sphereGeometry args={[0.15, 10, 10]} />
        <meshStandardMaterial color={highlight} roughness={0.85} />
      </mesh>

      {/* Cute front bangs - straight cut */}
      <mesh position={[0, 0.15, 0.48]} rotation={[-0.2, 0, 0]} castShadow>
        <boxGeometry args={[0.7, 0.2, 0.12]} />
        <meshStandardMaterial color={color} roughness={0.85} />
      </mesh>

      {/* Side bangs framing face */}
      <mesh position={[-0.35, 0, 0.35]} rotation={[0, 0.3, 0]} castShadow>
        <capsuleGeometry args={[0.08, 0.25, 6, 8]} />
        <meshStandardMaterial color={highlight} roughness={0.85} />
      </mesh>
      <mesh position={[0.35, 0, 0.35]} rotation={[0, -0.3, 0]} castShadow>
        <capsuleGeometry args={[0.08, 0.25, 6, 8]} />
        <meshStandardMaterial color={highlight} roughness={0.85} />
      </mesh>

      {/* Hair accessory - ribbon/bow */}
      <mesh position={[0.35, 0.35, 0.1]} rotation={[0, -0.5, 0.3]}>
        <boxGeometry args={[0.2, 0.08, 0.15]} />
        <meshStandardMaterial color="#ff6b8a" roughness={0.6} />
      </mesh>
      <mesh position={[0.45, 0.35, 0.15]} rotation={[0, -0.3, 0.5]}>
        <boxGeometry args={[0.12, 0.06, 0.1]} />
        <meshStandardMaterial color="#ff6b8a" roughness={0.6} />
      </mesh>
    </group>
  )
}

function SweptHair({ color, highlight }: { color: string; highlight: string }) {
  return (
    <group>
      {/* Base hair mass */}
      <mesh position={[0, 0.15, -0.05]} castShadow>
        <sphereGeometry args={[0.6, 16, 16]} />
        <meshStandardMaterial color={color} roughness={0.85} />
      </mesh>

      {/* Swept to one side */}
      <mesh position={[-0.35, 0.3, 0.1]} rotation={[0, 0, 0.5]} castShadow>
        <capsuleGeometry args={[0.25, 0.4, 8, 12]} />
        <meshStandardMaterial color={color} roughness={0.85} />
      </mesh>

      {/* Dramatic sweep peaks */}
      <mesh position={[-0.5, 0.4, 0]} rotation={[0.2, 0, 0.8]} castShadow>
        <coneGeometry args={[0.12, 0.35, 5]} />
        <meshStandardMaterial color={highlight} roughness={0.85} />
      </mesh>
      <mesh position={[-0.3, 0.55, -0.1]} rotation={[0.3, 0, 0.4]} castShadow>
        <coneGeometry args={[0.1, 0.3, 5]} />
        <meshStandardMaterial color={color} roughness={0.85} />
      </mesh>

      {/* Back hair - shorter, edgy */}
      <mesh position={[0, 0, -0.4]} castShadow>
        <sphereGeometry args={[0.45, 14, 14]} />
        <meshStandardMaterial color={color} roughness={0.85} />
      </mesh>

      {/* Asymmetric bangs covering one eye */}
      <mesh position={[-0.15, 0.1, 0.52]} rotation={[-0.3, 0.2, 0.1]} castShadow>
        <boxGeometry args={[0.5, 0.3, 0.1]} />
        <meshStandardMaterial color={color} roughness={0.85} />
      </mesh>
      <mesh position={[-0.35, -0.05, 0.5]} rotation={[-0.2, 0.3, 0.2]} castShadow>
        <coneGeometry args={[0.1, 0.25, 4]} />
        <meshStandardMaterial color={highlight} roughness={0.85} />
      </mesh>

      {/* Few strands on other side */}
      <mesh position={[0.3, 0.1, 0.45]} rotation={[-0.4, -0.2, -0.1]} castShadow>
        <coneGeometry args={[0.06, 0.2, 4]} />
        <meshStandardMaterial color={color} roughness={0.85} />
      </mesh>
    </group>
  )
}

export default PopFigures
