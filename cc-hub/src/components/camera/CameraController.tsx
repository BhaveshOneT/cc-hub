import { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import * as THREE from 'three'
import { getCameraPreset } from '../../lib/camera'

// ============================================================================
// CAMERA CONTROLLER - Unified camera control with dynamic OrbitControls target
// Fixes the conflict between CinematicCamera and OrbitControls by making
// OrbitControls the sole controller of the camera, while smoothly lerping
// its target when story beats change.
// ============================================================================

interface CameraControllerProps {
  /** Key from CAMERA_PRESETS (e.g., 'reservoir', 'artifacts', 'default') */
  target?: string
  /** Current wizard position - camera will frame both wizard and target */
  wizardPosition?: [number, number, number]
  /** Lerp speed for target transitions (0-1, lower = slower) */
  transitionSpeed?: number
  /** Enable/disable user zoom and rotation */
  enabled?: boolean
  /** Called when transition to new target completes */
  onTransitionComplete?: () => void
}

export function CameraController({
  target = 'default',
  wizardPosition,
  transitionSpeed = 0.025,
  enabled = true,
  onTransitionComplete,
}: CameraControllerProps) {
  const { camera } = useThree()

  // Ref to OrbitControls instance for programmatic target updates
  const controlsRef = useRef<OrbitControlsImpl>(null)

  // Current and desired look-at positions (for smooth transitions)
  const currentTarget = useRef(new THREE.Vector3(0, 1, 0))
  const desiredTarget = useRef(new THREE.Vector3(0, 1, 0))

  // Track wizard position for framing
  const currentWizardPos = useRef(new THREE.Vector3(0, 0, 0))

  // Track transition state
  const isTransitioning = useRef(false)
  const prevTargetKey = useRef(target)
  const hasInitialized = useRef(false)

  // When target preset changes, start transition to new target
  useEffect(() => {
    if (target !== prevTargetKey.current) {
      const preset = getCameraPreset(target)
      desiredTarget.current.set(...preset.target)
      isTransitioning.current = true
      prevTargetKey.current = target
    }
  }, [target])

  // Update wizard position tracking
  useEffect(() => {
    if (wizardPosition) {
      currentWizardPos.current.set(...wizardPosition)
    }
  }, [wizardPosition])

  // Initialize camera and controls on mount
  useEffect(() => {
    if (!hasInitialized.current) {
      const preset = getCameraPreset(target)

      // Set initial camera position from preset
      camera.position.set(...preset.position)

      // Set initial target
      currentTarget.current.set(...preset.target)
      desiredTarget.current.set(...preset.target)

      // Update OrbitControls target if available
      if (controlsRef.current) {
        controlsRef.current.target.copy(currentTarget.current)
        controlsRef.current.update()
      }

      hasInitialized.current = true
    }
  }, [target, camera])

  // Smooth lerp of OrbitControls target each frame
  useFrame(() => {
    if (!controlsRef.current) return

    // Calculate framing target: midpoint between wizard and highlight object
    // This ensures both wizard and target stay in frame during transitions
    let framingTarget = desiredTarget.current.clone()

    if (wizardPosition) {
      // Smoothly update wizard position tracking
      const wizardVec = new THREE.Vector3(...wizardPosition)
      currentWizardPos.current.lerp(wizardVec, transitionSpeed * 2)

      // Calculate midpoint between wizard and target object
      // Bias slightly toward the target object (60% target, 40% wizard)
      framingTarget = new THREE.Vector3().lerpVectors(
        currentWizardPos.current,
        desiredTarget.current,
        0.6
      )
      // Raise the target slightly for better framing (wizard is on ground)
      framingTarget.y = Math.max(framingTarget.y, 0.8)
    }

    // Lerp current target toward framing target
    const lerpSpeed = isTransitioning.current ? transitionSpeed : transitionSpeed * 0.3
    currentTarget.current.lerp(framingTarget, lerpSpeed)

    // Update OrbitControls target (this is the key fix!)
    // OrbitControls handles all camera positioning - we only control WHERE it looks
    controlsRef.current.target.copy(currentTarget.current)

    // Must call update() after programmatically changing target
    controlsRef.current.update()

    // Check if transition is complete
    if (isTransitioning.current) {
      const distance = currentTarget.current.distanceTo(framingTarget)
      if (distance < 0.1) {
        isTransitioning.current = false
        onTransitionComplete?.()
      }
    }
  })

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableZoom={enabled}
      enablePan={false}
      enableRotate={enabled}
      minDistance={4}
      maxDistance={35}
      maxPolarAngle={Math.PI / 2.1}
      minPolarAngle={0.2}
      zoomSpeed={0.8}
      rotateSpeed={0.5}
      enableDamping={true}
      dampingFactor={0.05}
      // Note: We don't use the target prop - we control it via ref for smooth transitions
    />
  )
}

export default CameraController
