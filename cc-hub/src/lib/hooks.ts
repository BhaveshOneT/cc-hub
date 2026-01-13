import { useRef, useCallback } from 'react'
import { useFrame, type RootState } from '@react-three/fiber'

// ============================================================================
// CUSTOM HOOKS - Reusable Three.js/React patterns
// ============================================================================

/**
 * Performance hook that skips frames for non-critical animations
 *
 * This pattern was repeated across 5+ components. Now centralized.
 *
 * @param callback - The animation function to call on allowed frames
 * @param frameSkip - How many frames to skip (default 2 = run every 2nd frame)
 *
 * @example
 * ```tsx
 * useFrameSkip((state) => {
 *   meshRef.current.rotation.y = state.clock.elapsedTime * 0.5
 * }, 2)
 * ```
 */
export function useFrameSkip(
  callback: (state: RootState, delta: number) => void,
  frameSkip: number = 2
) {
  const frameCount = useRef(0)

  useFrame((state, delta) => {
    frameCount.current++
    if (frameCount.current % frameSkip !== 0) return
    callback(state, delta)
  })
}

/**
 * Animation hook that manages a simple oscillating value
 * Useful for breathing, pulsing, or bobbing effects
 *
 * @param speed - Animation speed multiplier
 * @param amplitude - Maximum displacement from center
 * @param frameSkip - Performance optimization (skip frames)
 * @returns Current animated value between -amplitude and +amplitude
 *
 * @example
 * ```tsx
 * const breathe = useOscillate(1.5, 0.015)
 * // Use breathe value for scale or position offset
 * ```
 */
export function useOscillate(
  speed: number = 1,
  amplitude: number = 1,
  frameSkip: number = 2
): React.MutableRefObject<number> {
  const value = useRef(0)
  const frameCount = useRef(0)

  useFrame((state) => {
    frameCount.current++
    if (frameCount.current % frameSkip !== 0) return
    value.current = Math.sin(state.clock.elapsedTime * speed) * amplitude
  })

  return value
}

/**
 * Hook to get a frame-skip-aware animation callback
 * Returns a function that checks if this frame should animate
 *
 * @param frameSkip - How many frames to skip between animations
 * @returns shouldAnimate function that returns true on allowed frames
 *
 * @example
 * ```tsx
 * const shouldAnimate = useFrameSkipCheck(2)
 *
 * useFrame((state) => {
 *   if (!shouldAnimate()) return
 *   // Animation logic here
 * })
 * ```
 */
export function useFrameSkipCheck(frameSkip: number = 2) {
  const frameCount = useRef(0)

  const shouldAnimate = useCallback(() => {
    frameCount.current++
    return frameCount.current % frameSkip === 0
  }, [frameSkip])

  return shouldAnimate
}
