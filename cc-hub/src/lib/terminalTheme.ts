// ============================================================================
// TERMINAL THEME - Anthropic branded colors for Claude Code simulator
// ============================================================================

import { getBeatTerminalContent, getBeatExampleContent } from './terminalContent'

export const TERMINAL_COLORS = {
  // Backgrounds
  background: '#1a1a2e',      // Deep dark blue-gray
  surface: '#16213e',         // Slightly lighter for panels
  screenBg: '#0d1117',        // Terminal screen background (GitHub dark)

  // Text
  text: '#e6edf3',            // Light gray text
  textMuted: '#8b949e',       // Muted text
  textDim: '#484f58',         // Very dim text

  // Anthropic accent
  accent: '#da7756',          // Anthropic coral/orange
  accentLight: '#e89b7b',     // Lighter coral for highlights
  accentGlow: 'rgba(218, 119, 86, 0.4)', // Glow effect

  // Status colors
  success: '#3fb950',         // Green for success states
  warning: '#d29922',         // Amber for warnings
  error: '#f85149',           // Red for errors
  info: '#58a6ff',            // Blue for info

  // Terminal specific
  prompt: '#da7756',          // Prompt color (coral)
  command: '#e6edf3',         // Command text
  output: '#8b949e',          // Output text (muted)
  cursor: '#da7756',          // Cursor color
  selection: 'rgba(218, 119, 86, 0.3)', // Selection highlight

  // Borders and lines
  border: '#30363d',          // Subtle borders
  borderLight: '#484f58',     // Lighter borders

  // 3D scene
  deskSurface: '#1c1c28',     // Dark desk
  monitorFrame: '#2d2d3d',    // Monitor bezel
  monitorGlow: '#da7756',     // Monitor edge glow
}

// Map existing highlight values to terminal display modes
export type TerminalMode =
  | 'idle'
  | 'reading'
  | 'tools'
  | 'context'
  | 'claudemd'
  | 'mcp'
  | 'subagent'
  | 'compact'

export const HIGHLIGHT_TO_TERMINAL_MODE: Record<string, TerminalMode> = {
  // Map fantasy highlights to terminal modes
  hourglass: 'idle',
  reservoir: 'context',
  artifacts: 'tools',
  grimoire: 'claudemd',
  portal: 'mcp',
  wands: 'tools',
  summoning: 'subagent',
  condenser: 'compact',
  circle: 'idle',
  triad: 'tools',

  // Default
  default: 'idle',
}

// Terminal output templates for 800px container
export const TERMINAL_OUTPUTS: Record<TerminalMode, string[]> = {
  idle: [
    '$ claude',
    '',
    '> Claude Code - The Agentic Loop',
    '',
    'while True:',
    '  response = model(messages, tools)',
    '  if response.stop_reason != "tool_use":',
    '    return response.text',
    '  result = execute(response.tool_calls)',
    '  messages.append(result)',
    '',
    '> Ready for your request...',
  ],
  reading: [
    '$ claude "explain the auth flow"',
    '',
    '> Starting agentic loop...',
    '> Analyzing your request...',
    '',
    '> Using Read tool...',
    '  Reading: src/auth/login.ts',
    '  Reading: src/auth/session.ts',
    '',
    '> Model reasoning about auth...',
    '',
    'Authentication uses JWT tokens...',
  ],
  tools: [
    '$ claude "find the bug in payments"',
    '',
    '> Grep: searching "payment"',
    '  Found 8 matches in 3 files',
    '',
    '> Read: src/payments/process.ts',
    '  Lines 45-89 loaded',
    '',
    '> Edit: fixing decimal handling',
    '  Applied change successfully!',
  ],
  context: [
    '> Context Window Status',
    '',
    'System Prompt    ~4,000 tokens',
    'CLAUDE.md        ~2,500 tokens',
    'Conversation    ~38,000 tokens',
    'Tool Results    ~12,000 tokens',
    '─────────────────────────────',
    'Total:          ~56,500 tokens',
    '',
    '[████████████░░░░░░░] 28% of 200K',
    '',
    '> Tip: Use /compact to free up space',
  ],
  claudemd: [
    '$ cat CLAUDE.md',
    '',
    '# Claude Code Configuration',
    '',
    '## Project Context',
    'This is the CC-Hub knowledge base.',
    'Stack: React + Three.js + TypeScript',
    '',
    '## Conventions',
    '- Use functional components',
    '- Prefer composition over inheritance',
    '- Run tests before committing',
  ],
  mcp: [
    '> MCP Servers Connected',
    '',
    '● github     8 tools available',
    '● postgres   5 tools available',
    '● slack      4 tools available',
    '',
    '> Extends Claude\'s capabilities',
    '> Each server provides tools',
    '> Config: .mcp/servers.json',
  ],
  subagent: [
    '$ claude "run security audit"',
    '',
    '> Spawning subagent...',
    '',
    'Model: claude-haiku (fast)',
    'Task: Scan for vulnerabilities',
    '',
    '[██████████████░░░░] 75%',
    '',
    'Found: 2 issues',
    '- SQL injection in query.ts:42',
    '- XSS vulnerability in render.tsx:89',
  ],
  compact: [
    '$ /compact',
    '',
    '> Analyzing conversation history...',
    '',
    'Before: 156,231 tokens',
    'After:   23,450 tokens',
    'Saved:  132,781 tokens (85%)',
    '',
    'Summary preserved:',
    '- Key decisions made',
    '- File changes tracked',
    '- Error resolutions logged',
  ],
}

export function getTerminalMode(highlight?: string): TerminalMode {
  if (!highlight) return 'idle'
  return HIGHLIGHT_TO_TERMINAL_MODE[highlight] || 'idle'
}

export function getTerminalOutput(mode: TerminalMode): string[] {
  return TERMINAL_OUTPUTS[mode] || TERMINAL_OUTPUTS.idle
}

// Re-export beat content getters for convenience
export { getBeatTerminalContent, getBeatExampleContent }

/**
 * Get terminal content for a beat, with fallback to mode-based content.
 * This is the primary function to use for getting terminal output.
 */
export function getTerminalContentForBeat(
  beatId?: string,
  highlight?: string
): string[] {
  // First try beat-specific content
  if (beatId) {
    const beatContent = getBeatTerminalContent(beatId)
    if (beatContent) {
      return beatContent
    }
  }

  // Fall back to mode-based content
  const mode = getTerminalMode(highlight)
  return getTerminalOutput(mode)
}

/**
 * Get example content for a beat if it exists.
 * Returns null if no example content is available for this beat.
 */
export function getExampleContentForBeat(beatId?: string): string[] | null {
  if (beatId) {
    const exampleContent = getBeatExampleContent(beatId)
    if (exampleContent && exampleContent.length > 0) {
      return exampleContent
    }
  }
  return null
}
