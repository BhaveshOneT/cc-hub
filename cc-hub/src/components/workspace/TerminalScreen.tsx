import { useState, useEffect, useRef, memo, useMemo } from 'react'
import { Html } from '@react-three/drei'
import {
  TERMINAL_COLORS,
  getTerminalContentForBeat,
  type TerminalMode,
} from '../../lib/terminalTheme'

// ============================================================================
// TERMINAL SCREEN - CLI display using Html overlay
// ============================================================================

interface TerminalScreenProps {
  position: [number, number, number]
  width: number
  height: number
  mode: TerminalMode
  contextLevel?: number
  showTool?: string
  highlight?: string
  beatId?: string  // Beat ID for beat-specific terminal content
}

export const TerminalScreen = memo(function TerminalScreen({
  position,
  width: _width,
  height: _height,
  mode: _mode,  // Kept for backwards compatibility
  contextLevel = 0,
  highlight,
  beatId,
}: TerminalScreenProps) {
  const [displayedLines, setDisplayedLines] = useState<string[]>([])
  const [cursorVisible, setCursorVisible] = useState(true)
  const animationRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const isFirstMount = useRef(true)

  // Handle wheel events to prevent 3D camera zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation()
  }

  // Memoize target lines - prioritize beat-specific content, fall back to mode-based
  const targetLines = useMemo(
    () => getTerminalContentForBeat(beatId, highlight),
    [beatId, highlight]
  )

  // Animate lines appearing when content changes
  useEffect(() => {
    // Clear any existing animation
    if (animationRef.current) {
      clearInterval(animationRef.current)
      animationRef.current = null
    }

    // Handle empty content
    if (targetLines.length === 0) {
      setDisplayedLines([])
      return
    }

    // On first mount, show all lines immediately (no animation)
    if (isFirstMount.current) {
      isFirstMount.current = false
      setDisplayedLines(targetLines)
      return
    }

    // KEY FIX: Show first line immediately so screen is never blank!
    setDisplayedLines([targetLines[0]])

    // If only one line, nothing more to animate
    if (targetLines.length === 1) {
      return
    }

    // Animate remaining lines appearing one by one
    let lineIndex = 1
    animationRef.current = setInterval(() => {
      lineIndex++
      if (lineIndex <= targetLines.length) {
        // Use slice to show lines 0 through lineIndex
        setDisplayedLines(targetLines.slice(0, lineIndex))
      }
      // Clear interval when done
      if (lineIndex >= targetLines.length && animationRef.current) {
        clearInterval(animationRef.current)
        animationRef.current = null
      }
    }, 50) // 50ms for snappy animation

    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current)
        animationRef.current = null
      }
    }
  }, [targetLines])

  // Cursor blink effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCursorVisible((v) => !v)
    }, 530)
    return () => clearInterval(interval)
  }, [])

  // distanceFactor={1.5} with 400x250 showed at HALF the monitor size
  // Double the pixel dimensions to 800x500 to fill the monitor
  // Double font sizes proportionally
  const pixelWidth = 800
  const pixelHeight = 500

  return (
    <Html
      transform
      distanceFactor={1.5}
      position={position}
      center
      style={{
        pointerEvents: 'auto',  // Enable for scroll buttons
        width: `${pixelWidth}px`,
        height: `${pixelHeight}px`,
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: TERMINAL_COLORS.screenBg,
          borderRadius: '8px',
          overflow: 'hidden',
          fontFamily: '"SF Mono", "Monaco", "Inconsolata", "Consolas", monospace',
          fontSize: '26px',
          lineHeight: '1.4',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
        }}
      >
        {/* Terminal header bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 20px',
            backgroundColor: TERMINAL_COLORS.surface,
            borderBottom: `2px solid ${TERMINAL_COLORS.border}`,
            flexShrink: 0,
          }}
        >
          {/* Traffic lights */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <div
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: '#ff5f56',
              }}
            />
            <div
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: '#ffbd2e',
              }}
            />
            <div
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: '#27ca3f',
              }}
            />
          </div>
          <span
            style={{
              color: TERMINAL_COLORS.textMuted,
              fontSize: '22px',
              marginLeft: '12px',
              fontWeight: 500,
            }}
          >
            claude-code
          </span>
        </div>

        {/* Terminal content - scrollable with mouse wheel */}
        <div
          onWheel={handleWheel}
          className="terminal-scroll-area"
          style={{
            flex: 1,
            padding: '20px',
            overflowY: 'auto',
            overflowX: 'hidden',
            scrollbarWidth: 'thin',
            scrollbarColor: `${TERMINAL_COLORS.border} transparent`,
          }}
        >
          {/* Custom scrollbar for WebKit (Chrome, Safari, Edge) */}
          <style>{`
            .terminal-scroll-area::-webkit-scrollbar {
              width: 8px;
            }
            .terminal-scroll-area::-webkit-scrollbar-track {
              background: transparent;
            }
            .terminal-scroll-area::-webkit-scrollbar-thumb {
              background: ${TERMINAL_COLORS.border};
              border-radius: 4px;
            }
            .terminal-scroll-area::-webkit-scrollbar-thumb:hover {
              background: ${TERMINAL_COLORS.borderLight};
            }
          `}</style>
          {displayedLines.map((line, i) => (
            <TerminalLine key={i} line={line} isLast={i === displayedLines.length - 1} />
          ))}

          {/* Blinking cursor */}
          {displayedLines.length > 0 && (
            <span
              style={{
                color: TERMINAL_COLORS.cursor,
                opacity: cursorVisible ? 1 : 0,
                transition: 'opacity 0.1s',
              }}
            >
              {displayedLines[displayedLines.length - 1]?.endsWith('_') ? '' : ''}
            </span>
          )}
        </div>

        {/* Context meter (bottom bar) */}
        {contextLevel > 0 && (
          <div
            style={{
              padding: '10px 20px',
              backgroundColor: TERMINAL_COLORS.surface,
              borderTop: `2px solid ${TERMINAL_COLORS.border}`,
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              flexShrink: 0,
            }}
          >
            <span
              style={{
                color: TERMINAL_COLORS.textMuted,
                fontSize: '18px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              Context
            </span>
            <div
              style={{
                flex: 1,
                height: '8px',
                backgroundColor: TERMINAL_COLORS.border,
                borderRadius: '4px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${contextLevel}%`,
                  height: '100%',
                  backgroundColor:
                    contextLevel > 70
                      ? TERMINAL_COLORS.error
                      : contextLevel > 50
                        ? TERMINAL_COLORS.warning
                        : TERMINAL_COLORS.accent,
                  borderRadius: '4px',
                  transition: 'width 0.5s ease-out',
                }}
              />
            </div>
            <span
              style={{
                color:
                  contextLevel > 70
                    ? TERMINAL_COLORS.error
                    : contextLevel > 50
                      ? TERMINAL_COLORS.warning
                      : TERMINAL_COLORS.textMuted,
                fontSize: '18px',
              }}
            >
              {contextLevel}%
            </span>
          </div>
        )}
      </div>
    </Html>
  )
})

// ============================================================================
// TERMINAL LINE - Single line with syntax highlighting
// ============================================================================

// Indicator patterns for semantic coloring (DRY)
const INDICATOR_COLORS: Record<string, string> = {
  '✓': TERMINAL_COLORS.success,
  '●': TERMINAL_COLORS.success,
  '✗': TERMINAL_COLORS.error,
  '✖': TERMINAL_COLORS.error,
  '▲': TERMINAL_COLORS.warning,
  '⚠': TERMINAL_COLORS.warning,
}

// Get color for content based on indicators
const getIndicatorColor = (content: string): string | null => {
  for (const [indicator, color] of Object.entries(INDICATOR_COLORS)) {
    if (content.includes(indicator)) return color
  }
  return null
}

interface TerminalLineProps {
  line: string
  isLast: boolean
}

function TerminalLine({ line }: TerminalLineProps) {
  // Enhanced syntax highlighting for educational terminal content
  const renderLine = () => {
    // Empty line
    if (!line.trim()) {
      return <br />
    }

    // Command prompt ($ ...)
    if (line.startsWith('$')) {
      const parts = line.split(' ')
      return (
        <>
          <span style={{ color: TERMINAL_COLORS.prompt }}>{parts[0]}</span>
          <span style={{ color: TERMINAL_COLORS.command }}> {parts.slice(1).join(' ')}</span>
        </>
      )
    }

    // Tool usage (> Using ... tool) or general > prefixed lines
    if (line.startsWith('>')) {
      const toolMatch = line.match(/Using (\w+) tool/)
      if (toolMatch) {
        const beforeTool = line.substring(0, line.indexOf(toolMatch[1]))
        const toolName = toolMatch[1]
        const afterTool = line.substring(line.indexOf(toolMatch[1]) + toolMatch[1].length)
        return (
          <>
            <span style={{ color: TERMINAL_COLORS.accent }}>{beforeTool}</span>
            <span style={{ color: TERMINAL_COLORS.info, fontWeight: 'bold' }}>{toolName}</span>
            <span style={{ color: TERMINAL_COLORS.accent }}>{afterTool}</span>
          </>
        )
      }
      return <span style={{ color: TERMINAL_COLORS.accent }}>{line}</span>
    }

    // Box top with title (╭─ Title ─╮ or ┌─ Title ─┐)
    if (/^[╭┌]─.*─[╮┐]$/.test(line)) {
      const titleMatch = line.match(/^([╭┌]─\s*)(.+?)(\s*─[╮┐])$/)
      if (titleMatch) {
        return (
          <>
            <span style={{ color: TERMINAL_COLORS.border }}>{titleMatch[1]}</span>
            <span style={{ color: TERMINAL_COLORS.info, fontWeight: 'bold' }}>{titleMatch[2]}</span>
            <span style={{ color: TERMINAL_COLORS.border }}>{titleMatch[3]}</span>
          </>
        )
      }
    }

    // Box drawing characters (╭╮╯╰│─) - for panels and borders
    if (/^[╭╮╯╰│─┌┐└┘├┤┬┴┼┣┫━╋]/.test(line.trim()) || /^[│┃]/.test(line)) {
      // Content inside boxes with semantic highlighting
      if (/^│.*│$/.test(line) || /^┃.*┃$/.test(line)) {
        const content = line.slice(1, -1)
        const indicatorColor = getIndicatorColor(content)
        return (
          <span>
            <span style={{ color: TERMINAL_COLORS.border }}>│</span>
            <span style={{ color: indicatorColor || TERMINAL_COLORS.textMuted }}>{content}</span>
            <span style={{ color: TERMINAL_COLORS.border }}>│</span>
          </span>
        )
      }
      return <span style={{ color: TERMINAL_COLORS.border }}>{line}</span>
    }

    // Progress bar with blocks (█░▓)
    if (line.includes('█') || line.includes('░') || line.includes('▓')) {
      return <span style={{ color: TERMINAL_COLORS.accent }}>{line}</span>
    }

    // Progress bar with brackets
    if (line.includes('[') && line.includes(']') && (line.includes('#') || line.includes('='))) {
      return <span style={{ color: TERMINAL_COLORS.success }}>{line}</span>
    }

    // Arrows and flow indicators (→ ← ↓ ↑)
    if (/[→←↓↑]/.test(line)) {
      // Highlight arrows specially
      const parts = line.split(/([→←↓↑]+)/)
      return (
        <span>
          {parts.map((part, i) => {
            if (/[→←↓↑]/.test(part)) {
              return <span key={i} style={{ color: TERMINAL_COLORS.accent, fontWeight: 'bold' }}>{part}</span>
            }
            return <span key={i} style={{ color: TERMINAL_COLORS.textMuted }}>{part}</span>
          })}
        </span>
      )
    }

    // Standalone indicator lines (✓, ✗, etc.) - reuse the indicator map
    const standaloneIndicatorColor = getIndicatorColor(line)
    if (standaloneIndicatorColor && !line.startsWith('  ')) {
      return <span style={{ color: standaloneIndicatorColor }}>{line}</span>
    }

    // Bullet points or list items (● ○ • - *)
    if (/^\s*[●○•\-\*]/.test(line)) {
      return <span style={{ color: TERMINAL_COLORS.info }}>{line}</span>
    }

    // File paths (src/..., ~/.claude/, .claude/)
    if (/src\/[\w\/\-\.]+\.(ts|tsx|js|jsx|md|json)/.test(line) ||
        /~?\.claude\//.test(line) ||
        /[\w\/]+\.(ts|tsx|js|md)/.test(line)) {
      // Highlight file paths
      const pathPattern = /((?:src\/|~?\.claude\/|[\w\/]+\.)[\w\/\-\.]+\.(ts|tsx|js|jsx|md|json))/g
      const parts = line.split(pathPattern)
      return (
        <span>
          {parts.map((part, i) => {
            if (pathPattern.test(part) || /\.(ts|tsx|js|jsx|md|json)$/.test(part)) {
              return <span key={i} style={{ color: TERMINAL_COLORS.info }}>{part}</span>
            }
            return <span key={i} style={{ color: TERMINAL_COLORS.textMuted }}>{part}</span>
          })}
        </span>
      )
    }

    // Percentage values
    if (/\d+%/.test(line)) {
      const parts = line.split(/(\d+%)/g)
      return (
        <span>
          {parts.map((part, i) => {
            if (/\d+%/.test(part)) {
              const num = parseInt(part)
              const color = num > 70 ? TERMINAL_COLORS.error :
                           num > 50 ? TERMINAL_COLORS.warning :
                           TERMINAL_COLORS.success
              return <span key={i} style={{ color, fontWeight: 'bold' }}>{part}</span>
            }
            return <span key={i} style={{ color: TERMINAL_COLORS.textMuted }}>{part}</span>
          })}
        </span>
      )
    }

    // YAML frontmatter markers (---)
    if (line === '---') {
      return <span style={{ color: TERMINAL_COLORS.border }}>{line}</span>
    }

    // YAML keys (name:, description:, tools:)
    if (/^[\w\-]+:\s/.test(line)) {
      const colonIndex = line.indexOf(':')
      const key = line.slice(0, colonIndex + 1)
      const value = line.slice(colonIndex + 1)
      return (
        <>
          <span style={{ color: TERMINAL_COLORS.accent }}>{key}</span>
          <span style={{ color: TERMINAL_COLORS.text }}>{value}</span>
        </>
      )
    }

    // Indented output (starts with spaces but not special)
    if (line.startsWith('  ')) {
      return <span style={{ color: TERMINAL_COLORS.textMuted }}>{line}</span>
    }

    // Header/title (# ...)
    if (line.startsWith('#')) {
      return <span style={{ color: TERMINAL_COLORS.info, fontWeight: 'bold' }}>{line}</span>
    }

    // Code keywords (while, if, return, etc.)
    if (/^\s*(while|if|for|return|def|function|const|let|var)\b/.test(line)) {
      return <span style={{ color: TERMINAL_COLORS.info }}>{line}</span>
    }

    // Keyword-based semantic highlighting
    const lowerLine = line.toLowerCase()
    if (/success|connected|complete|pass/.test(lowerLine)) {
      return <span style={{ color: TERMINAL_COLORS.success }}>{line}</span>
    }
    if (/error|issue|found:|danger|warning|consider|tip:|note:/.test(lowerLine)) {
      return <span style={{ color: TERMINAL_COLORS.warning }}>{line}</span>
    }

    // Horizontal rules (───)
    if (/^[─━═]+$/.test(line)) {
      return <span style={{ color: TERMINAL_COLORS.border }}>{line}</span>
    }

    // Step indicators (Step 1:, > Step 1:)
    if (/^>?\s*Step \d+:/i.test(line)) {
      return <span style={{ color: TERMINAL_COLORS.accent, fontWeight: 'bold' }}>{line}</span>
    }

    // Numbered items in parentheses ((1), (2))
    if (/^\s*\(\d+\)/.test(line)) {
      const match = line.match(/^(\s*\(\d+\))(.*)$/)
      if (match) {
        return (
          <>
            <span style={{ color: TERMINAL_COLORS.accent, fontWeight: 'bold' }}>{match[1]}</span>
            <span style={{ color: TERMINAL_COLORS.textMuted }}>{match[2]}</span>
          </>
        )
      }
    }

    // Default output
    return <span style={{ color: TERMINAL_COLORS.output }}>{line}</span>
  }

  return (
    <div
      style={{
        whiteSpace: 'pre',
        minHeight: '1.3em',
        fontSize: '22px',
        lineHeight: '1.35',
      }}
    >
      {renderLine()}
    </div>
  )
}

export default TerminalScreen
