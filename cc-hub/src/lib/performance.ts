// ============================================================================
// PERFORMANCE CONFIGURATION - Centralized performance tuning
// ============================================================================

/**
 * Global performance configuration
 * Adjust these values for different device capabilities
 *
 * Previously these were scattered across:
 * - ArcaneSanctum.tsx (PERF object)
 * - MagicalEffects.tsx (PERF object)
 * - Various components with inline values
 */
export const PERF = {
  // Geometry complexity
  geoSegments: 16,        // Standard detail level (reduced from 32)
  geoSegmentsLow: 8,      // For less important objects
  geoSegmentsHigh: 24,    // For hero objects when needed

  // Frame skipping for animations
  frameSkip: 2,           // Skip every other frame for animations
  frameSkipSlow: 3,       // For very slow animations (aurora, ambient)

  // Particle counts
  particleMultiplier: 0.6,     // Global multiplier for all particle counts
  maxSparkles: 30,             // Default sparkle count
  maxSparklesHighlight: 50,    // When object is highlighted
  maxSparklesAmbient: 60,      // For ambient effects

  // Lighting
  maxLights: 1,           // Max lights per effect (helps with mobile)

  // Animation
  transitionDuration: 600,     // ms for effect fade-in
  defaultBeatDuration: 5000,   // ms for story beat (fallback)
} as const

/**
 * Quality presets for different device capabilities
 * Can be used to implement a quality selector
 */
export const QUALITY_PRESETS = {
  low: {
    geoSegments: 8,
    geoSegmentsLow: 6,
    frameSkip: 3,
    particleMultiplier: 0.3,
    maxSparkles: 15,
    maxSparklesHighlight: 25,
  },
  medium: {
    geoSegments: 16,
    geoSegmentsLow: 8,
    frameSkip: 2,
    particleMultiplier: 0.6,
    maxSparkles: 30,
    maxSparklesHighlight: 50,
  },
  high: {
    geoSegments: 24,
    geoSegmentsLow: 12,
    frameSkip: 1,
    particleMultiplier: 1.0,
    maxSparkles: 50,
    maxSparklesHighlight: 80,
  },
} as const

/**
 * Apply a quality preset and get merged config
 */
export function getQualityConfig(preset: keyof typeof QUALITY_PRESETS) {
  return { ...PERF, ...QUALITY_PRESETS[preset] }
}

/**
 * Calculate particle count with performance multiplier applied
 */
export function getParticleCount(baseCount: number): number {
  return Math.floor(baseCount * PERF.particleMultiplier)
}
