import { memo, type ReactNode, type ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

// ============================================================================
// CONTROL BUTTON - Playback control button with disabled state
// ============================================================================

interface ControlButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button content (typically an icon) */
  children: ReactNode
  /** Whether this is the primary/main action */
  primary?: boolean
  /** Color for primary button (hex) */
  primaryColor?: string
}

/**
 * Styled playback control button
 *
 * Extracted from PlaybackControls component where similar patterns
 * were repeated for prev, next, play/pause, and restart buttons.
 *
 * @example
 * ```tsx
 * <ControlButton onClick={onPrev} disabled={!canPrev}>
 *   <SkipBack className="w-4 h-4" />
 * </ControlButton>
 *
 * <ControlButton primary primaryColor="#ec4899" onClick={onTogglePlay}>
 *   {isPlaying ? <Pause /> : <Play />}
 * </ControlButton>
 * ```
 */
export const ControlButton = memo(function ControlButton({
  children,
  primary = false,
  primaryColor,
  disabled,
  className,
  style,
  ...props
}: ControlButtonProps) {
  if (primary) {
    return (
      <button
        className={cn(
          'p-5 rounded-2xl text-white transition-all shadow-lg',
          className
        )}
        style={{
          backgroundColor: primaryColor,
          boxShadow: primaryColor ? `0 0 30px ${primaryColor}50` : undefined,
          ...style,
        }}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    )
  }

  return (
    <button
      className={cn(
        'p-3 rounded-xl backdrop-blur-md transition-all border',
        disabled
          ? 'bg-stone-900/50 text-stone-600 cursor-not-allowed border-stone-800/30'
          : 'bg-stone-900/80 text-purple-300/80 hover:text-purple-200 hover:bg-stone-800/80 border-purple-900/30',
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
})

export default ControlButton
