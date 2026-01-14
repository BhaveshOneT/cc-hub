import type { Step, Placement } from 'react-joyride'

// ============================================================================
// TOUR STEPS - Onboarding tour step definitions
// ============================================================================

// Common step config to ensure tooltips stay in viewport
const baseStepConfig = {
  disableBeacon: true,
  disableScrolling: true,
}

export const tourSteps: Step[] = [
  {
    ...baseStepConfig,
    target: '[data-tour="canvas"]',
    title: '3D Interactive Workspace',
    content:
      'This is your interactive 3D workspace. Drag to orbit around the scene, scroll to zoom, and watch animated visualizations that accompany each story beat.',
    placement: 'right-start' as Placement,
    spotlightPadding: 10,
  },
  {
    ...baseStepConfig,
    target: '[data-tour="story-panel"]',
    title: 'Story Panel',
    content:
      'The story panel displays educational content for each beat: narration, technical details, code examples, anti-patterns to avoid, and pro tips. Scroll to explore all sections.',
    placement: 'left-start' as Placement,
    spotlightPadding: 10,
  },
  {
    ...baseStepConfig,
    target: '[data-tour="playback-controls"]',
    title: 'Playback Controls',
    content:
      'Control the experience: Play/Pause the auto-advance, skip forward or backward between beats, or restart from the beginning.',
    placement: 'top' as Placement,
    spotlightPadding: 15,
  },
  {
    ...baseStepConfig,
    target: '[data-tour="chapter-timeline"]',
    title: 'Chapter Timeline',
    content:
      'Navigate through chapters and individual beats. Click a chapter to jump to it, or click the dots within an active chapter to select specific beats.',
    placement: 'top' as Placement,
    spotlightPadding: 10,
  },
  {
    ...baseStepConfig,
    target: '[data-tour="view-controls"]',
    title: 'View Controls',
    content:
      'Toggle cinematic camera mode for dynamic camera movements, and show/hide visual effects like bloom and particle effects. Click the help icon anytime to replay this tour.',
    placement: 'bottom' as Placement,
    spotlightPadding: 12,
  },
  {
    ...baseStepConfig,
    target: '[data-tour="context-indicator"]',
    title: 'Context Level Indicator',
    content:
      'This meter shows the simulated "context window" usage - a key concept in the Claude Code story. Watch it change as the narrative progresses.',
    placement: 'top-end' as Placement,
    spotlightPadding: 10,
  },
]
