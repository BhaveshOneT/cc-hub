// ============================================================================
// LIB - Barrel exports for centralized modules
// ============================================================================

// Utilities
export { cn } from './utils'

// Theme and colors
export {
  MAGIC_COLORS,
  STONE_COLORS,
  WIZARD_COLORS,
  SANCTUM_COLORS,
  HIGHLIGHT_COLORS,
  WIZARD_AURA_COLORS,
  TOOL_ARTIFACTS,
  getContextVisuals,
  getContextColor,
} from './theme'

// Camera configuration
export {
  TARGET_POSITIONS,
  OBJECT_HEIGHTS,
  CAMERA_PRESETS,
  CAMERA_PRESET_KEYS,
  getCameraPreset,
  getTargetPosition,
  getHighlightPosition,
  type CameraPreset,
} from './camera'

// Performance configuration
export {
  PERF,
  QUALITY_PRESETS,
  getQualityConfig,
  getParticleCount,
} from './performance'

// Custom hooks
export {
  useFrameSkip,
  useOscillate,
  useFrameSkipCheck,
} from './hooks'
