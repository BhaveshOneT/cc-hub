import { memo } from 'react'
import type { TooltipRenderProps } from 'react-joyride'
import { X } from 'lucide-react'

// ============================================================================
// TOUR TOOLTIP - Custom tooltip component with prominent styling
// ============================================================================

/**
 * Custom tooltip for react-joyride with solid backgrounds and high contrast
 *
 * Design choices:
 * - Solid dark background (#1a1a2e) instead of glassmorphism
 * - Bright purple border and accents for visibility
 * - High contrast text for readability
 * - Step counter with monospace font
 */
export const TourTooltip = memo(function TourTooltip({
  index,
  step,
  size,
  backProps,
  closeProps,
  primaryProps,
  skipProps,
  tooltipProps,
  isLastStep,
}: TooltipRenderProps) {
  return (
    <div
      {...tooltipProps}
      style={{
        backgroundColor: '#1a1a2e',
        border: '2px solid #a855f7',
        borderRadius: '12px',
        boxShadow:
          '0 8px 32px rgba(168, 85, 247, 0.4), 0 0 0 1px rgba(168, 85, 247, 0.2)',
        padding: '24px',
        maxWidth: 'min(400px, calc(100vw - 48px))',
        minWidth: 'min(300px, calc(100vw - 48px))',
        position: 'relative',
        margin: '0 auto',
      }}
    >
      {/* Close button */}
      <button
        {...closeProps}
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: 'transparent',
          border: 'none',
          color: '#a1a1aa',
          cursor: 'pointer',
          padding: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '4px',
          transition: 'color 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#e4e4e7')}
        onMouseLeave={(e) => (e.currentTarget.style.color = '#a1a1aa')}
      >
        <X size={18} />
      </button>

      {/* Title */}
      {step.title && (
        <h3
          style={{
            margin: '0 0 12px',
            fontSize: '18px',
            fontWeight: '700',
            color: '#ffffff',
            fontFamily: 'Space Grotesk, system-ui, sans-serif',
            paddingRight: '24px',
          }}
        >
          {step.title as string}
        </h3>
      )}

      {/* Content */}
      <div
        style={{
          fontSize: '14px',
          lineHeight: '1.6',
          color: '#e4e4e7',
          marginBottom: '20px',
        }}
      >
        {step.content}
      </div>

      {/* Progress indicator */}
      <div
        style={{
          fontSize: '12px',
          color: '#a855f7',
          marginBottom: '16px',
          fontFamily: 'JetBrains Mono, monospace',
        }}
      >
        Step {index + 1} of {size}
      </div>

      {/* Navigation buttons */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <button
          {...skipProps}
          style={{
            background: 'transparent',
            border: '1px solid #52525b',
            borderRadius: '8px',
            color: '#a1a1aa',
            padding: '10px 16px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#71717a'
            e.currentTarget.style.color = '#e4e4e7'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#52525b'
            e.currentTarget.style.color = '#a1a1aa'
          }}
        >
          Skip Tour
        </button>

        <div style={{ display: 'flex', gap: '8px' }}>
          {index > 0 && (
            <button
              {...backProps}
              style={{
                background: '#27272a',
                border: '1px solid #3f3f46',
                borderRadius: '8px',
                color: '#e4e4e7',
                padding: '10px 20px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#3f3f46'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#27272a'
              }}
            >
              Back
            </button>
          )}
          <button
            {...primaryProps}
            style={{
              background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
              border: 'none',
              borderRadius: '8px',
              color: '#ffffff',
              padding: '10px 24px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              boxShadow: '0 4px 12px rgba(168, 85, 247, 0.4)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow =
                '0 6px 16px rgba(168, 85, 247, 0.6)'
              e.currentTarget.style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow =
                '0 4px 12px rgba(168, 85, 247, 0.4)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            {isLastStep ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
})

export default TourTooltip
