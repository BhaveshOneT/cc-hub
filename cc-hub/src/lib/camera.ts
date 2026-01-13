// ============================================================================
// CAMERA CONFIGURATION - Front-focused presets for terminal simulator
// ============================================================================

/**
 * Camera preset type for cinematic transitions
 */
export interface CameraPreset {
  position: [number, number, number]
  target: [number, number, number]
  fov?: number
}

// Monitor center position (Y=1.1 is the screen center)
const MONITOR_CENTER: [number, number, number] = [0, 1.1, -0.5]

/**
 * Target positions - all point to monitor center in terminal mode
 * Kept for compatibility with existing story beats
 */
export const TARGET_POSITIONS: Record<string, [number, number, number]> = {
  center: [0, 0, 0],           // In front of monitor
  reservoir: [0, 0, 0],        // Context - monitor focus
  artifacts: [0, 0, 0],        // Tools - monitor focus
  grimoire: [0, 0, 0],         // CLAUDE.md - monitor focus
  portal: [0, 0, 0],           // MCP - monitor focus
  wands: [0, 0, 0],            // Skills - monitor focus
  summoning: [0, 0, 0],        // Subagents - monitor focus
  condenser: [0, 0, 0],        // /compact - monitor focus
  circle: [0, 0, 0],           // /clear - monitor focus
  triad: [0, 0, 0],            // Compound - monitor focus
}

/**
 * Object heights for energy beam targeting
 * Used to calculate the vertical position when connecting wizard to objects
 */
export const OBJECT_HEIGHTS: Record<string, number> = {
  center: 1.0,
  hourglass: 1.0,
  reservoir: 0.9,
  artifacts: 1.4,
  grimoire: 1.0,
  portal: 1.5,
  wands: 1.3,
  summoning: 0.6,
  condenser: 0.9,
  circle: 0.3,
  triad: 0.3,
}

/**
 * Camera presets for terminal simulator
 * Front-focused views with subtle angle variations for dramatic moments
 */
export const CAMERA_PRESETS: Record<string, CameraPreset> = {
  // Default front view - looking straight at monitor
  default: {
    position: [0, 1.3, 2.5],
    target: MONITOR_CENTER,
    fov: 45,
  },
  // Center/hourglass - main overview
  center: {
    position: [0, 1.3, 2.5],
    target: MONITOR_CENTER,
    fov: 45,
  },
  hourglass: {
    position: [0, 1.3, 2.5],
    target: MONITOR_CENTER,
    fov: 45,
  },
  // Context - slightly closer to emphasize context meter
  reservoir: {
    position: [0, 1.2, 2.0],
    target: MONITOR_CENTER,
    fov: 45,
  },
  // CLAUDE.md - close up on screen content
  grimoire: {
    position: [0, 1.2, 1.8],
    target: MONITOR_CENTER,
    fov: 45,
  },
  // Tools - slight angle from right
  artifacts: {
    position: [1.2, 1.3, 2.3],
    target: MONITOR_CENTER,
    fov: 45,
  },
  // MCP - slight angle from left
  portal: {
    position: [-1.2, 1.3, 2.3],
    target: MONITOR_CENTER,
    fov: 45,
  },
  // Skills - similar to tools
  wands: {
    position: [0.8, 1.2, 2.2],
    target: MONITOR_CENTER,
    fov: 45,
  },
  // Subagents - dramatic angle
  summoning: {
    position: [1.5, 1.5, 2.5],
    target: MONITOR_CENTER,
    fov: 48,
  },
  // /compact - pull back slightly
  condenser: {
    position: [0, 1.4, 2.8],
    target: MONITOR_CENTER,
    fov: 45,
  },
  // /clear - reset to default
  circle: {
    position: [0, 1.3, 2.5],
    target: MONITOR_CENTER,
    fov: 45,
  },
  // Compound effect - wide to show full context
  triad: {
    position: [0, 1.5, 3.0],
    target: MONITOR_CENTER,
    fov: 45,
  },
  // Wide shot - pulled back
  wide: {
    position: [0, 2, 4],
    target: [0, 0.8, 0],
    fov: 40,
  },
  // Dramatic angle - from corner
  dramatic: {
    position: [2, 1.8, 2.5],
    target: MONITOR_CENTER,
    fov: 50,
  },
  // Aerial view - looking down at desk
  aerial: {
    position: [0, 4, 2],
    target: [0, 0.5, 0],
    fov: 45,
  },
  // Close up on screen
  closeup: {
    position: [0, 1.2, 1.5],
    target: [0, 1.15, -0.5],
    fov: 45,
  },
}

/**
 * Get camera preset by name with fallback to default
 */
export function getCameraPreset(target: string): CameraPreset {
  return CAMERA_PRESETS[target] || CAMERA_PRESETS.default
}

/**
 * Get wizard target position by name with fallback to center
 */
export function getTargetPosition(target: string): [number, number, number] {
  return TARGET_POSITIONS[target] || TARGET_POSITIONS.center
}

/**
 * Calculate highlight position with object height
 * Returns the 3D position for energy beam targeting
 */
export function getHighlightPosition(highlight: string | undefined): [number, number, number] | null {
  if (!highlight) return null
  const target = highlight === 'hourglass' ? 'center' : highlight
  const pos = TARGET_POSITIONS[target]
  if (!pos) return null
  const height = OBJECT_HEIGHTS[target] || 1.0
  return [pos[0], height, pos[2]]
}

/**
 * Export preset keys for type safety
 */
export const CAMERA_PRESET_KEYS = Object.keys(CAMERA_PRESETS)
