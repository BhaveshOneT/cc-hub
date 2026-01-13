import { useRef, useEffect, useMemo } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Centralized camera configuration (DRY)
import { CAMERA_PRESETS } from '../../lib/camera'

// ============================================================================
// CINEMATIC CAMERA - Auto-transitions to focus on story elements
// Smooth lerp-based movement with dramatic angles
// ============================================================================

interface CinematicCameraProps {
  target?: string  // Key from CAMERA_PRESETS or highlight from story
  transitionSpeed?: number
  enableManualControl?: boolean
  onTransitionComplete?: () => void
}

export function CinematicCamera({
  target = 'default',
  transitionSpeed = 0.02,
  enableManualControl = false,
  onTransitionComplete,
}: CinematicCameraProps) {
  const { camera } = useThree()

  // Current and target look-at points
  const targetLookAt = useRef(new THREE.Vector3(0, 1, 0))
  const currentLookAt = useRef(new THREE.Vector3(0, 1, 0))

  // Track transition state
  const isTransitioning = useRef(false)
  const prevTarget = useRef(target)
  const transitionSettleTime = useRef(0)

  // Store user's camera offset relative to look-at point
  // This preserves zoom distance AND rotation angle
  const userOffset = useRef(new THREE.Vector3(10, 6, 10))
  const hasInitialized = useRef(false)

  // Get preset based on target
  const preset = useMemo(() => {
    if (CAMERA_PRESETS[target]) {
      return CAMERA_PRESETS[target]
    }
    return CAMERA_PRESETS.default
  }, [target])

  // Update targets when preset changes - PRESERVE user's zoom and angle
  useEffect(() => {
    if (target !== prevTarget.current) {
      // Capture current user offset (camera position relative to current look-at)
      // This preserves both zoom (distance) AND rotation (angle)
      if (hasInitialized.current) {
        userOffset.current.copy(camera.position).sub(currentLookAt.current)
      }

      // Update look-at target to new preset's target
      targetLookAt.current.set(...preset.target)

      // Start transition (only for look-at, camera position follows via offset)
      isTransitioning.current = true
      transitionSettleTime.current = 0
      prevTarget.current = target
    }
  }, [target, preset, camera])

  // Initialize camera position on first mount only
  useEffect(() => {
    if (!hasInitialized.current) {
      const presetPos = new THREE.Vector3(...preset.position)
      const presetTarget = new THREE.Vector3(...preset.target)

      // Set initial offset from preset
      userOffset.current.copy(presetPos).sub(presetTarget)

      targetLookAt.current.copy(presetTarget)
      currentLookAt.current.copy(presetTarget)
      camera.position.copy(presetPos)

      hasInitialized.current = true
    }
  }, [preset, camera])

  useFrame((_, delta) => {
    if (!hasInitialized.current) return

    // Always smoothly update the look-at point toward target
    const lookAtLerpSpeed = isTransitioning.current ? transitionSpeed : transitionSpeed * 0.5
    currentLookAt.current.lerp(targetLookAt.current, lookAtLerpSpeed)

    // Only reposition camera during active transitions
    // After transition settles, OrbitControls has FULL control
    if (isTransitioning.current) {
      // Calculate where camera should be: currentLookAt + userOffset
      const desiredPosition = currentLookAt.current.clone().add(userOffset.current)
      camera.position.lerp(desiredPosition, transitionSpeed)
      camera.lookAt(currentLookAt.current)

      // Check if transition is complete
      const lookDistance = currentLookAt.current.distanceTo(targetLookAt.current)

      if (lookDistance < 0.1) {
        transitionSettleTime.current += delta
        if (transitionSettleTime.current > 0.3) {
          isTransitioning.current = false
          // Capture final user offset after transition completes
          userOffset.current.copy(camera.position).sub(currentLookAt.current)
          onTransitionComplete?.()
        }
      }
    } else if (enableManualControl) {
      // Only apply lookAt if manual control mode (not used with OrbitControls)
      camera.lookAt(currentLookAt.current)
    }
    // When not transitioning and not in manual control mode:
    // OrbitControls handles everything - camera is free to zoom/rotate
  })

  return null
}

// ============================================================================
// CAMERA SHAKE - For dramatic moments
// ============================================================================

interface CameraShakeProps {
  intensity?: number
  active?: boolean
  decay?: boolean
}

export function CameraShake({ intensity = 0.1, active = false, decay = true }: CameraShakeProps) {
  const { camera } = useThree()
  const originalPosition = useRef(new THREE.Vector3())
  const shakeIntensity = useRef(intensity)

  useEffect(() => {
    if (active) {
      originalPosition.current.copy(camera.position)
      shakeIntensity.current = intensity
    }
  }, [active, intensity, camera])

  useFrame(() => {
    if (!active) return

    if (decay) {
      shakeIntensity.current *= 0.95
      if (shakeIntensity.current < 0.001) {
        camera.position.copy(originalPosition.current)
        return
      }
    }

    camera.position.x = originalPosition.current.x + (Math.random() - 0.5) * shakeIntensity.current
    camera.position.y = originalPosition.current.y + (Math.random() - 0.5) * shakeIntensity.current
    camera.position.z = originalPosition.current.z + (Math.random() - 0.5) * shakeIntensity.current
  })

  return null
}

// ============================================================================
// ORBIT CAMERA - Automatic slow orbit around scene
// ============================================================================

interface OrbitCameraProps {
  speed?: number
  radius?: number
  height?: number
  enabled?: boolean
}

export function AutoOrbitCamera({ speed = 0.1, radius = 12, height = 8, enabled = true }: OrbitCameraProps) {
  const { camera } = useThree()
  const angle = useRef(Math.PI / 4)

  useFrame((_, delta) => {
    if (!enabled) return

    angle.current += delta * speed

    camera.position.x = Math.cos(angle.current) * radius
    camera.position.z = Math.sin(angle.current) * radius
    camera.position.y = height
    camera.lookAt(0, 1, 0)
  })

  return null
}

// ============================================================================
// FOLLOW CAMERA - Follows the wizard character
// ============================================================================

interface FollowCameraProps {
  targetPosition: [number, number, number]
  offset?: [number, number, number]
  smoothing?: number
  enabled?: boolean
}

export function FollowCamera({
  targetPosition,
  offset = [5, 4, 5],
  smoothing = 0.02,
  enabled = true,
}: FollowCameraProps) {
  const { camera } = useThree()
  const desiredPosition = useRef(new THREE.Vector3())
  const lookTarget = useRef(new THREE.Vector3())

  useFrame(() => {
    if (!enabled) return

    // Calculate desired camera position (offset from target)
    desiredPosition.current.set(
      targetPosition[0] + offset[0],
      targetPosition[1] + offset[1],
      targetPosition[2] + offset[2]
    )

    // Look at target
    lookTarget.current.set(...targetPosition)
    lookTarget.current.y += 1 // Look slightly above target

    // Smooth interpolation
    camera.position.lerp(desiredPosition.current, smoothing)

    // Create a temporary vector for look-at interpolation
    const currentLookAt = new THREE.Vector3()
    camera.getWorldDirection(currentLookAt)
    currentLookAt.multiplyScalar(5).add(camera.position)
    currentLookAt.lerp(lookTarget.current, smoothing * 2)
    camera.lookAt(currentLookAt)
  })

  return null
}

// Re-export for backwards compatibility
export { CAMERA_PRESET_KEYS } from '../../lib/camera'

export default CinematicCamera
