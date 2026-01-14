import { memo, useMemo } from 'react'
import Joyride, { STATUS } from 'react-joyride'
import type { CallBackProps, Styles } from 'react-joyride'
import { tourSteps } from './tourSteps'
import { TourTooltip } from './TourTooltip'

// ============================================================================
// ONBOARDING TOUR - Main tour component wrapping react-joyride
// ============================================================================

interface OnboardingTourProps {
  /** Whether the tour should be running */
  run: boolean
  /** Callback when tour completes or is skipped */
  onComplete: () => void
  /** Optional callback to pause playback during tour */
  onPausePlayback?: () => void
  /** Optional callback to resume playback after tour */
  onResumePlayback?: () => void
}

/**
 * Custom styles for react-joyride
 * - Darker overlay for better contrast against 3D scene
 * - Purple spotlight glow matching theme
 * - High z-index to appear above Three.js canvas
 */
const joyrideStyles: Styles = {
  options: {
    arrowColor: '#1a1a2e',
    backgroundColor: '#1a1a2e',
    overlayColor: 'rgba(0, 0, 0, 0.8)',
    primaryColor: '#a855f7',
    spotlightShadow: '0 0 25px 8px rgba(168, 85, 247, 0.7), 0 0 50px 15px rgba(168, 85, 247, 0.4), inset 0 0 0 2px rgba(168, 85, 247, 0.8)',
    textColor: '#e4e4e7',
    zIndex: 10000,
  },
  spotlight: {
    borderRadius: 12,
    boxShadow: '0 0 25px 8px rgba(168, 85, 247, 0.7), 0 0 50px 15px rgba(168, 85, 247, 0.4)',
  },
  overlay: {
    mixBlendMode: 'normal',
  },
  beacon: {
    display: 'none',
  },
  beaconInner: {
    display: 'none',
  },
  beaconOuter: {
    display: 'none',
  },
}

/**
 * Onboarding tour component that guides users through the interface
 *
 * Features:
 * - Filters out steps for elements that don't exist (e.g., context indicator)
 * - Pauses playback during tour to let users focus on learning
 * - Dark overlay and purple accents for prominence
 * - Disabled spotlight clicks to prevent accidental interactions
 */
export const OnboardingTour = memo(function OnboardingTour({
  run,
  onComplete,
  onPausePlayback,
  onResumePlayback,
}: OnboardingTourProps) {
  // Filter steps for elements that actually exist in the DOM
  // The context indicator is conditionally rendered based on contextLevel
  const visibleSteps = useMemo(() => {
    if (typeof document === 'undefined') return tourSteps

    return tourSteps.filter((step) => {
      const target = document.querySelector(step.target as string)
      return target !== null
    })
  }, [run]) // Re-evaluate when tour starts

  const handleCallback = (data: CallBackProps) => {
    const { status, type } = data

    // Pause playback when tour starts
    if (type === 'tour:start') {
      onPausePlayback?.()
    }

    // Mark complete and resume when tour finishes or is skipped
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      onComplete()
      onResumePlayback?.()
    }
  }

  return (
    <Joyride
      steps={visibleSteps}
      run={run}
      continuous
      showProgress
      showSkipButton
      scrollToFirstStep
      disableOverlayClose
      disableCloseOnEsc={false}
      spotlightClicks={false}
      callback={handleCallback}
      tooltipComponent={TourTooltip}
      styles={joyrideStyles}
      floaterProps={{
        disableAnimation: false,
        offset: 15,
        wrapperOptions: {
          offset: -10,
          position: true,
        },
      }}
      locale={{
        back: 'Back',
        close: 'Close',
        last: 'Finish',
        next: 'Next',
        skip: 'Skip Tour',
      }}
    />
  )
})

export default OnboardingTour
