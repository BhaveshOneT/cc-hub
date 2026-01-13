import { memo, type ReactNode, type ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

// ============================================================================
// ICON BUTTON - Reusable toggle/action button with consistent styling
// ============================================================================

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button content (typically an icon) */
  children: ReactNode
  /** Whether the button is in active/toggled state */
  active?: boolean
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
}

/**
 * Styled icon button with active state support
 *
 * Extracted from App.tsx where this pattern was repeated for:
 * - Cinematic mode toggle
 * - Effects visibility toggle
 *
 * @example
 * ```tsx
 * <IconButton
 *   active={cinematicMode}
 *   onClick={() => setCinematicMode(!cinematicMode)}
 *   title="Toggle cinematic camera"
 * >
 *   <Zap className="w-4 h-4" />
 * </IconButton>
 * ```
 */
export const IconButton = memo(function IconButton({
  children,
  active = false,
  size = 'md',
  className,
  ...props
}: IconButtonProps) {
  const sizeClasses = {
    sm: 'p-2',
    md: 'p-2.5',
    lg: 'p-3',
  }

  return (
    <button
      className={cn(
        'rounded-xl backdrop-blur-md transition-all border',
        sizeClasses[size],
        active
          ? 'bg-purple-500/30 text-purple-200 border-purple-400/30'
          : 'bg-stone-800/50 text-stone-400 border-stone-600/30 hover:bg-stone-700/50',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
})

export default IconButton
