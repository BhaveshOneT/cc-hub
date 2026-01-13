// ============================================================================
// CENTRALIZED THEME - Single source of truth for all colors and styling
// ============================================================================

/**
 * Core magic colors used throughout the application
 * These are the primary palette for magical effects and highlights
 */
export const MAGIC_COLORS = {
  purple: '#8b5cf6',
  blue: '#3b82f6',
  green: '#22c55e',
  red: '#ef4444',
  gold: '#fbbf24',
  pink: '#ec4899',
  orange: '#f59e0b',
  cyan: '#06b6d4',
} as const

/**
 * Stone/UI colors for backgrounds and structural elements
 */
export const STONE_COLORS = {
  base: '#44403c',
  light: '#78716c',
  dark: '#292524',
  darkest: '#0f172a',
} as const

/**
 * Wizard character colors
 */
export const WIZARD_COLORS = {
  robes: '#4c1d95',
  robesInner: '#7c3aed',
  robesDark: '#2e1065',
  trim: '#fbbf24',
  trimDark: '#b45309',
  skin: '#fcd9b6',
  skinDark: '#d4a574',
  beard: '#e5e7eb',
  beardDark: '#9ca3af',
  staffWood: '#78350f',
  staffWoodLight: '#92400e',
  staffCrystal: '#8b5cf6',
  hat: '#312e81',
  hatDark: '#1e1b4b',
  eyeWhite: '#f8fafc',
  eyePupil: '#1e293b',
  eyeIris: '#3b82f6',
  mouth: '#be185d',
  nose: '#e5c9a8',
} as const

/**
 * Sanctum object colors (combines magic + stone for 3D environment)
 */
export const SANCTUM_COLORS = {
  stone: STONE_COLORS.base,
  stoneLight: STONE_COLORS.light,
  stoneDark: STONE_COLORS.dark,
  runeGold: MAGIC_COLORS.gold,
  runeInactive: '#57534e',
  magicPurple: MAGIC_COLORS.purple,
  magicBlue: MAGIC_COLORS.blue,
  magicGreen: MAGIC_COLORS.green,
  magicRed: MAGIC_COLORS.red,
  magicGold: MAGIC_COLORS.gold,
  skillsPurple: MAGIC_COLORS.purple,
  subagentsBlue: MAGIC_COLORS.blue,
  mcpGreen: MAGIC_COLORS.green,
} as const

/**
 * Colors for highlighting specific objects/features in the scene
 * Keys match the highlight targets in story beats
 */
export const HIGHLIGHT_COLORS: Record<string, string> = {
  center: MAGIC_COLORS.gold,
  hourglass: MAGIC_COLORS.gold,
  reservoir: MAGIC_COLORS.blue,
  artifacts: MAGIC_COLORS.green,
  grimoire: '#a78bfa', // Lighter purple variant
  portal: MAGIC_COLORS.green,
  wands: MAGIC_COLORS.purple,
  summoning: MAGIC_COLORS.blue,
  condenser: MAGIC_COLORS.purple,
  circle: '#ffffff',
  triad: MAGIC_COLORS.pink,
}

/**
 * Wizard state to aura color mapping
 */
export const WIZARD_AURA_COLORS: Record<string, string> = {
  idle: MAGIC_COLORS.purple,
  walking: MAGIC_COLORS.orange,
  thinking: '#0ea5e9', // Sky blue
  working: MAGIC_COLORS.green,
  reading: '#a78bfa', // Lighter purple
  celebrating: MAGIC_COLORS.pink,
  pointing: '#f97316', // Orange variant
  channeling: MAGIC_COLORS.blue,
  summoning: MAGIC_COLORS.purple,
}

/**
 * Tool artifact configuration - fantasy names mapped to technical tools
 */
export const TOOL_ARTIFACTS = {
  read: { fantasy: 'Scrying Mirror', tech: 'Read', color: MAGIC_COLORS.green },
  edit: { fantasy: 'Quill of Alteration', tech: 'Edit', color: MAGIC_COLORS.orange },
  write: { fantasy: 'Conjuration Scroll', tech: 'Write', color: MAGIC_COLORS.blue },
  bash: { fantasy: 'Staff of Command', tech: 'Bash', color: MAGIC_COLORS.red },
  grep: { fantasy: 'Seeking Orb', tech: 'Grep', color: MAGIC_COLORS.purple },
  glob: { fantasy: 'Pathfinder Compass', tech: 'Glob', color: MAGIC_COLORS.cyan },
  task: { fantasy: 'Summoning Rune', tech: 'Task', color: MAGIC_COLORS.pink },
  todo: { fantasy: 'Enchanted List', tech: 'TodoWrite', color: '#84cc16' }, // Lime
} as const

/**
 * Context level visual configuration
 * Returns styling based on current context usage percentage
 */
export function getContextVisuals(level: number) {
  if (level < 20) return { color: MAGIC_COLORS.blue, mistOpacity: 0, bloom: 1.0, ambient: 0.15 }
  if (level < 35) return { color: '#6366f1', mistOpacity: 0.03, bloom: 0.95, ambient: 0.13 }
  if (level < 45) return { color: MAGIC_COLORS.purple, mistOpacity: 0.08, bloom: 0.9, ambient: 0.11 }
  if (level < 60) return { color: MAGIC_COLORS.orange, mistOpacity: 0.18, bloom: 0.8, ambient: 0.09 }
  if (level < 80) return { color: MAGIC_COLORS.red, mistOpacity: 0.3, bloom: 0.7, ambient: 0.07 }
  return { color: '#991b1b', mistOpacity: 0.45, bloom: 0.5, ambient: 0.05 }
}

/**
 * Get the appropriate color for a context level indicator
 */
export function getContextColor(level: number): string {
  if (level > 60) return MAGIC_COLORS.red
  if (level > 45) return MAGIC_COLORS.orange
  return MAGIC_COLORS.blue
}
