import { useState, useEffect, Suspense, useCallback, useMemo, memo } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerspectiveCamera, Stars } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import {
  Play, Pause, RotateCcw, SkipForward, SkipBack, ChevronRight,
  BookOpen, Lightbulb, Code, AlertTriangle, Zap, Eye, EyeOff, HelpCircle
} from 'lucide-react'

// Components
import { CameraController } from './components/camera/CameraController'
import { Workspace } from './components/workspace'
import { IconButton, ControlButton } from './components/ui'
import { OnboardingTour } from './components/tour'

// Story
import { ALL_CHAPTERS, type Chapter, type StoryBeat } from './content/story'

// Centralized configuration
import { TERMINAL_COLORS } from './lib/terminalTheme'
import { useTourState } from './lib'

// ============================================================================
// MAIN APP
// ============================================================================

export default function App() {
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0)
  const [currentBeatIndex, setCurrentBeatIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [progress, setProgress] = useState(0)
  const [cinematicMode, setCinematicMode] = useState(true)
  const [showEffects, setShowEffects] = useState(true)

  // Onboarding tour state
  const { runTour, startTour, markTourCompleted } = useTourState()

  const currentChapter = ALL_CHAPTERS[currentChapterIndex]
  const currentBeat = currentChapter.beats[currentBeatIndex]

  // Total beats count
  const totalBeats = useMemo(() =>
    ALL_CHAPTERS.reduce((sum, ch) => sum + ch.beats.length, 0),
  [])

  // Current global beat index
  const globalBeatIndex = useMemo(() => {
    let count = 0
    for (let i = 0; i < currentChapterIndex; i++) {
      count += ALL_CHAPTERS[i].beats.length
    }
    return count + currentBeatIndex
  }, [currentChapterIndex, currentBeatIndex])

  // Auto-advance with progress
  useEffect(() => {
    if (!isPlaying) return

    const duration = currentBeat.duration
    const interval = 50
    const increment = (interval / duration) * 100

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // Move to next beat
          if (currentBeatIndex < currentChapter.beats.length - 1) {
            setCurrentBeatIndex((i) => i + 1)
          } else if (currentChapterIndex < ALL_CHAPTERS.length - 1) {
            // Move to next chapter
            setCurrentChapterIndex((i) => i + 1)
            setCurrentBeatIndex(0)
          } else {
            // Loop back to start
            setCurrentChapterIndex(0)
            setCurrentBeatIndex(0)
          }
          return 0
        }
        return prev + increment
      })
    }, interval)

    return () => clearInterval(timer)
  }, [isPlaying, currentBeatIndex, currentChapterIndex, currentBeat.duration, currentChapter.beats.length])

  // Reset progress when beat changes
  useEffect(() => {
    setProgress(0)
  }, [currentBeatIndex, currentChapterIndex])

  const goNext = useCallback(() => {
    if (currentBeatIndex < currentChapter.beats.length - 1) {
      setCurrentBeatIndex((i) => i + 1)
    } else if (currentChapterIndex < ALL_CHAPTERS.length - 1) {
      setCurrentChapterIndex((i) => i + 1)
      setCurrentBeatIndex(0)
    }
    setProgress(0)
  }, [currentBeatIndex, currentChapterIndex, currentChapter.beats.length])

  const goPrev = useCallback(() => {
    if (currentBeatIndex > 0) {
      setCurrentBeatIndex((i) => i - 1)
    } else if (currentChapterIndex > 0) {
      setCurrentChapterIndex((i) => i - 1)
      setCurrentBeatIndex(ALL_CHAPTERS[currentChapterIndex - 1].beats.length - 1)
    }
    setProgress(0)
  }, [currentBeatIndex, currentChapterIndex])

  const restart = useCallback(() => {
    setCurrentChapterIndex(0)
    setCurrentBeatIndex(0)
    setProgress(0)
    setIsPlaying(true)
  }, [])

  const togglePlay = useCallback(() => {
    setIsPlaying((p) => !p)
  }, [])

  const goToChapter = useCallback((chapterIndex: number) => {
    setCurrentChapterIndex(chapterIndex)
    setCurrentBeatIndex(0)
    setProgress(0)
  }, [])

  return (
    <div className="h-screen w-screen bg-[#0a0a1a] overflow-hidden relative">
      {/* Main content area - uses CSS Grid, leaves room for fixed bottom bar */}
      <div
        className="absolute top-0 left-0 right-0"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 440px',
          height: 'calc(100vh - 96px)', // Explicit height minus ChapterTimeline
        }}
      >
        {/* 3D Scene - Grid column 1 */}
        <div className="relative overflow-hidden">
          {/* Canvas container - receives direct pointer events for OrbitControls */}
          <div className="absolute inset-0 z-0" data-tour="canvas">
            <Suspense fallback={<SceneLoader />}>
              <Canvas
                gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
                dpr={[1, 2]}
                shadows
              >
                <SimulationScene
                  beat={currentBeat}
                  cinematicMode={cinematicMode}
                  showEffects={showEffects}
                />
              </Canvas>
            </Suspense>
          </div>

          {/* UI Overlay layer - for title and view controls */}
          <div className="absolute inset-0 z-10 pointer-events-none">
            {/* Title overlay - magical dark theme */}
            <div className="absolute top-6 left-6 max-w-md">
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-4 h-4 rounded-full animate-pulse shadow-lg"
                  style={{
                    backgroundColor: currentChapter.color,
                    boxShadow: `0 0 20px ${currentChapter.color}`,
                  }}
                />
                <span className="text-sm text-purple-300/80 uppercase tracking-[0.2em] font-medium">
                  {currentChapter.title}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-white drop-shadow-lg mb-2"
                style={{ textShadow: `0 0 30px ${currentChapter.color}40` }}>
                {currentBeat.title}
              </h1>
              <p className="text-sm text-purple-200/60 leading-relaxed line-clamp-2">
                {currentBeat.narration.substring(0, 100)}...
              </p>
            </div>

            {/* View controls - using reusable IconButton component */}
            <div
              className="absolute top-6 right-6 flex gap-2 pointer-events-auto"
              data-tour="view-controls"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            >
              <IconButton
                onClick={startTour}
                title="Take a tour"
              >
                <HelpCircle className="w-4 h-4" />
              </IconButton>
              <IconButton
                active={cinematicMode}
                onClick={() => setCinematicMode(!cinematicMode)}
                title={cinematicMode ? 'Disable cinematic camera' : 'Enable cinematic camera'}
              >
                <Zap className="w-4 h-4" />
              </IconButton>
              <IconButton
                active={showEffects}
                onClick={() => setShowEffects(!showEffects)}
                title={showEffects ? 'Hide effects' : 'Show effects'}
              >
                {showEffects ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </IconButton>
            </div>

            {/* Context indicator */}
            {currentBeat.contextLevel && currentBeat.contextLevel > 30 && (
              <div className="absolute bottom-24 left-6" data-tour="context-indicator">
                <div className="bg-stone-900/80 backdrop-blur-md rounded-xl px-4 py-3 border border-purple-500/20">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-xs text-purple-300/80 uppercase tracking-wider">
                      Arcane Reservoir
                    </div>
                    <span className={`text-xs font-mono ${
                      currentBeat.contextLevel > 60 ? 'text-red-400' :
                      currentBeat.contextLevel > 45 ? 'text-amber-400' : 'text-blue-400'
                    }`}>
                      {currentBeat.contextLevel}%
                    </span>
                  </div>
                  <div className="w-40 h-2 bg-stone-800 rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all duration-500 rounded-full"
                      style={{
                        width: `${currentBeat.contextLevel}%`,
                        backgroundColor:
                          currentBeat.contextLevel > 60 ? '#ef4444' :
                          currentBeat.contextLevel > 45 ? '#f59e0b' : '#3b82f6',
                        boxShadow:
                          currentBeat.contextLevel > 60 ? '0 0 10px #ef4444' :
                          currentBeat.contextLevel > 45 ? '0 0 10px #f59e0b' : '0 0 10px #3b82f6',
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

          </div>
          {/* End UI Overlay layer */}
      </div>

        {/* Story Panel - Grid column 2 */}
        <div
          data-tour="story-panel"
          className="overflow-hidden"
          style={{ height: 'calc(100vh - 96px)' }}
        >
          <StoryPanel
            chapter={currentChapter}
            beat={currentBeat}
            beatIndex={currentBeatIndex}
            progress={progress}
            onBeatSelect={(i) => {
              setCurrentBeatIndex(i)
              setProgress(0)
            }}
          />
        </div>
      </div>

      {/* Fixed Playback Controls - Always visible above ChapterTimeline */}
      <div
        className="fixed z-50 pointer-events-auto"
        data-tour="playback-controls"
        style={{
          bottom: '120px', // 96px timeline + 24px padding
          left: '24px',
          right: '464px', // 440px StoryPanel + 24px padding
        }}
      >
        <PlaybackControls
          isPlaying={isPlaying}
          onTogglePlay={togglePlay}
          onPrev={goPrev}
          onNext={goNext}
          onRestart={restart}
          canPrev={globalBeatIndex > 0}
          canNext={globalBeatIndex < totalBeats - 1}
          chapterColor={currentChapter.color}
        />
      </div>

      {/* Fixed Chapter Timeline - Always visible at bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-50 h-24" data-tour="chapter-timeline">
        <ChapterTimeline
          chapters={ALL_CHAPTERS}
          currentChapterIndex={currentChapterIndex}
          currentBeatIndex={currentBeatIndex}
          progress={progress}
          onSelectChapter={goToChapter}
          onSelectBeat={(chapterIndex, beatIndex) => {
            setCurrentChapterIndex(chapterIndex)
            setCurrentBeatIndex(beatIndex)
            setProgress(0)
          }}
        />
      </div>

      {/* Onboarding Tour */}
      <OnboardingTour
        run={runTour}
        onComplete={markTourCompleted}
        onPausePlayback={() => setIsPlaying(false)}
        onResumePlayback={() => setIsPlaying(true)}
      />
    </div>
  )
}

// ============================================================================
// POST-PROCESSING EFFECTS - Enhanced visual polish
// ============================================================================

function PostProcessingEffects() {
  // Simplified post-processing for better performance
  return (
    <EffectComposer multisampling={0}>
      <Bloom
        luminanceThreshold={0.5}
        luminanceSmoothing={0.8}
        intensity={0.4}
        mipmapBlur
      />
      <Vignette eskil={false} offset={0.15} darkness={0.4} />
    </EffectComposer>
  )
}

// ============================================================================
// 3D SIMULATION SCENE - Terminal/Monitor workspace
// ============================================================================

interface SimulationSceneProps {
  beat: StoryBeat
  cinematicMode: boolean
  showEffects: boolean
}

function SimulationScene({
  beat,
  cinematicMode,
  showEffects,
}: SimulationSceneProps) {
  return (
    <>
      {/* Camera setup - front-focused for monitor viewing */}
      <PerspectiveCamera makeDefault position={[0, 1.3, 2.5]} fov={45} />

      {/* Camera controller - handles transitions between presets */}
      <CameraController
        target={cinematicMode ? (beat.highlight || 'default') : 'default'}
        transitionSpeed={0.025}
        enabled={true}
      />

      {/* Dark workspace background */}
      <color attach="background" args={[TERMINAL_COLORS.background]} />

      {/* Subtle starfield for depth */}
      {showEffects && (
        <Stars radius={100} depth={50} count={1000} factor={3} fade speed={0.2} />
      )}

      {/* Subtle fog for atmosphere */}
      <fog attach="fog" args={[TERMINAL_COLORS.background, 8, 25]} />

      {/* The Workspace - desk + monitor */}
      <Workspace
        highlight={beat.highlight}
        contextLevel={beat.contextLevel || 0}
        showTool={beat.showTool}
        beatId={beat.id}
      />

      {/* Post-processing effects */}
      <PostProcessingEffects />
    </>
  )
}

// ============================================================================
// STORY PANEL - Dark magical theme
// ============================================================================

interface StoryPanelProps {
  chapter: Chapter
  beat: StoryBeat
  beatIndex: number
  progress: number
  onBeatSelect: (index: number) => void
}

// Helper to format technical detail text into structured paragraphs
function formatDetailText(text: string): React.ReactNode {
  // Split on sentence boundaries that indicate new concepts (numbered lists, colons followed by explanations)
  const parts = text.split(/(?<=\.\s)(?=\(\d\)|The |Each |This |That |When |If |Unlike |Like |For )/g)

  if (parts.length <= 1) {
    // Check if it contains a numbered list pattern like (1), (2), etc.
    const numberedMatch = text.match(/\(\d\)[^(]+/g)
    if (numberedMatch && numberedMatch.length > 1) {
      const intro = text.split(/\(\d\)/)[0]
      return (
        <>
          {intro && <p className="text-[14px] text-purple-50/90 leading-[1.75] mb-3">{intro.trim()}</p>}
          <ol className="space-y-2 ml-1">
            {numberedMatch.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-[14px] text-purple-50/90 leading-[1.65]">
                <span className="flex-shrink-0 w-5 h-5 rounded bg-purple-500/15 text-purple-300 text-[11px] font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <span>{item.replace(/^\(\d\)\s*/, '').trim()}</span>
              </li>
            ))}
          </ol>
        </>
      )
    }
    return <p className="text-[14px] text-purple-50/90 leading-[1.75]">{text}</p>
  }

  return (
    <div className="space-y-3">
      {parts.map((part, i) => (
        <p key={i} className="text-[14px] text-purple-50/90 leading-[1.75]">
          {part.trim()}
        </p>
      ))}
    </div>
  )
}

const StoryPanel = memo(function StoryPanel({ chapter, beat, beatIndex, progress, onBeatSelect }: StoryPanelProps) {
  return (
    <div className="h-full bg-gradient-to-b from-[#0d0d1a] via-[#0a0a15] to-[#080812] border-l border-purple-900/20 flex flex-col overflow-hidden">
      {/* Header Section - Fixed height */}
      <div className="flex-shrink-0 relative overflow-hidden">
        {/* Gradient background accent */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: `linear-gradient(135deg, ${chapter.color}40 0%, transparent 60%)`,
          }}
        />

        <div className="relative px-5 py-4">
          {/* Chapter badge and counter */}
          <div className="flex items-center justify-between mb-3">
            <div
              className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider"
              style={{
                backgroundColor: `${chapter.color}20`,
                color: chapter.color,
                border: `1px solid ${chapter.color}30`,
              }}
            >
              <div
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ backgroundColor: chapter.color }}
              />
              {chapter.subtitle}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-purple-400/60 font-mono">
              <span style={{ color: chapter.color }}>{beatIndex + 1}</span>
              <span>/</span>
              <span>{chapter.beats.length}</span>
            </div>
          </div>

          {/* Beat title */}
          <h2 className="text-xl font-bold text-white leading-tight">
            {beat.title}
          </h2>

          {/* Progress bar */}
          <div className="mt-3 h-1 bg-purple-950/60 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-150 ease-out"
              style={{
                width: `${progress}%`,
                backgroundColor: chapter.color,
                boxShadow: `0 0 12px ${chapter.color}80`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Content Section - Scrollable with proper height */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-900/40 scrollbar-track-transparent">
        {/* Narration Quote */}
        <div className="px-5 py-4 border-b border-purple-900/15">
          <div className="relative pl-3 border-l-2" style={{ borderColor: `${chapter.color}50` }}>
            <p className="text-[13px] text-purple-100/70 leading-[1.7] italic">
              "{beat.narration}"
            </p>
          </div>
        </div>

        {/* Technical Detail - Main content with structured text */}
        <div className="px-5 py-4 border-b border-purple-900/15">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1 rounded-md bg-purple-500/10">
              <BookOpen className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <span className="text-[11px] text-purple-300 uppercase tracking-[0.12em] font-semibold">
              How It Works
            </span>
          </div>
          {formatDetailText(beat.detail)}
        </div>

        {/* Code Example */}
        {beat.codeExample && (
          <div className="px-5 py-4 border-b border-purple-900/15">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-md bg-emerald-500/10">
                  <Code className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <span className="text-[11px] text-emerald-300 uppercase tracking-[0.12em] font-semibold">
                  Example
                </span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500/50" />
                <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                <div className="w-2 h-2 rounded-full bg-green-500/50" />
              </div>
            </div>
            <pre className="bg-[#0c0c14] text-emerald-100/90 p-3 rounded-lg text-[12px] overflow-x-auto font-mono leading-[1.5] border border-emerald-900/20">
              {beat.codeExample}
            </pre>
          </div>
        )}

        {/* Anti-Pattern Warning */}
        {beat.antiPattern && (
          <div className="px-5 py-4 border-b border-purple-900/15">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1 rounded-md bg-red-500/10">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              </div>
              <span className="text-[11px] text-red-300 uppercase tracking-[0.12em] font-semibold">
                Avoid This
              </span>
            </div>
            <div className="relative">
              <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-full bg-red-500/40" />
              <p className="text-[13px] text-red-100/85 leading-[1.6] pl-3 py-2 bg-red-950/15 rounded-r-md">
                {beat.antiPattern}
              </p>
            </div>
          </div>
        )}

        {/* Tips Section */}
        {beat.tips && beat.tips.length > 0 && (
          <div className="px-5 py-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1 rounded-md bg-amber-500/10">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <span className="text-[11px] text-amber-300 uppercase tracking-[0.12em] font-semibold">
                Pro Tips
              </span>
            </div>
            <ul className="space-y-2">
              {beat.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span
                    className="flex-shrink-0 w-4 h-4 rounded text-[10px] font-bold flex items-center justify-center mt-0.5"
                    style={{
                      backgroundColor: `${chapter.color}15`,
                      color: chapter.color,
                    }}
                  >
                    {i + 1}
                  </span>
                  <span className="text-[13px] text-purple-100/75 leading-[1.55]">
                    {tip}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Footer Navigation - Fixed height */}
      <div className="flex-shrink-0 px-5 py-3 border-t border-purple-900/20 bg-[#080810]/90">
        <div className="flex items-center justify-center gap-1.5">
          {chapter.beats.map((b, i) => (
            <button
              key={i}
              onClick={() => onBeatSelect(i)}
              className={`relative transition-all duration-200 ${
                i === beatIndex
                  ? 'w-6 h-1.5 rounded-full'
                  : 'w-1.5 h-1.5 rounded-full hover:scale-125'
              }`}
              style={{
                backgroundColor: i === beatIndex
                  ? chapter.color
                  : i < beatIndex
                    ? `${chapter.color}70`
                    : `${chapter.color}25`,
                boxShadow: i === beatIndex ? `0 0 6px ${chapter.color}50` : 'none',
              }}
              title={b.title}
            />
          ))}
        </div>
      </div>
    </div>
  )
})

// ============================================================================
// PLAYBACK CONTROLS - Dark theme
// ============================================================================

interface PlaybackControlsProps {
  isPlaying: boolean
  onTogglePlay: () => void
  onPrev: () => void
  onNext: () => void
  onRestart: () => void
  canPrev: boolean
  canNext: boolean
  chapterColor: string
}

const PlaybackControls = memo(function PlaybackControls({
  isPlaying,
  onTogglePlay,
  onPrev,
  onNext,
  onRestart,
  canPrev,
  canNext,
  chapterColor,
}: PlaybackControlsProps) {
  // Prevent pointer events from propagating to Canvas/OrbitControls below
  const stopPropagation = (e: React.PointerEvent | React.MouseEvent) => {
    e.stopPropagation()
  }

  return (
    <div
      className="flex items-center justify-center gap-3"
      onPointerDown={stopPropagation}
      onPointerUp={stopPropagation}
      onPointerMove={stopPropagation}
      onClick={stopPropagation}
    >
      <ControlButton onClick={onRestart} title="Restart">
        <RotateCcw className="w-4 h-4" />
      </ControlButton>

      <ControlButton onClick={onPrev} disabled={!canPrev}>
        <SkipBack className="w-4 h-4" />
      </ControlButton>

      <ControlButton primary primaryColor={chapterColor} onClick={onTogglePlay}>
        {isPlaying ? (
          <Pause className="w-6 h-6" />
        ) : (
          <Play className="w-6 h-6 ml-0.5" />
        )}
      </ControlButton>

      <ControlButton onClick={onNext} disabled={!canNext}>
        <SkipForward className="w-4 h-4" />
      </ControlButton>
    </div>
  )
})

// ============================================================================
// CHAPTER TIMELINE - Dark theme
// ============================================================================

interface ChapterTimelineProps {
  chapters: Chapter[]
  currentChapterIndex: number
  currentBeatIndex: number
  progress: number
  onSelectChapter: (index: number) => void
  onSelectBeat: (chapterIndex: number, beatIndex: number) => void
}

const ChapterTimeline = memo(function ChapterTimeline({
  chapters,
  currentChapterIndex,
  currentBeatIndex,
  progress,
  onSelectChapter,
  onSelectBeat,
}: ChapterTimelineProps) {
  return (
    <div className="h-full bg-gradient-to-t from-[#050510] to-[#0a0a15] border-t border-purple-900/30 px-6 flex items-center gap-3 overflow-x-auto scrollbar-thin scrollbar-thumb-purple-900/50">
      {chapters.map((chapter, chapterIdx) => {
        const isActiveChapter = chapterIdx === currentChapterIndex
        const isPastChapter = chapterIdx < currentChapterIndex

        return (
          <div key={chapter.id} className="flex items-center">
            {/* Chapter button */}
            <button
              onClick={() => onSelectChapter(chapterIdx)}
              className={`flex flex-col items-center px-4 py-3 rounded-xl transition-all min-w-[120px] ${
                isActiveChapter
                  ? 'bg-purple-900/30 border border-purple-500/30'
                  : 'hover:bg-purple-900/20 border border-transparent'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full mb-2 transition-all ${
                  isPastChapter ? 'opacity-50' : ''
                } ${isActiveChapter ? 'ring-2 ring-offset-2 ring-offset-[#0a0a15]' : ''}`}
                style={{
                  backgroundColor: chapter.color,
                  boxShadow: isActiveChapter ? `0 0 15px ${chapter.color}` : 'none',
                }}
              />
              <span className={`text-xs font-medium ${
                isActiveChapter ? 'text-purple-100' : 'text-purple-400/70'
              }`}>
                {chapter.title}
              </span>

              {/* Beat dots for active chapter */}
              {isActiveChapter && (
                <div className="flex gap-1.5 mt-2">
                  {chapter.beats.map((_, beatIdx) => {
                    const isActiveBeat = beatIdx === currentBeatIndex
                    const isPastBeat = beatIdx < currentBeatIndex

                    return (
                      <button
                        key={beatIdx}
                        onClick={(e) => {
                          e.stopPropagation()
                          onSelectBeat(chapterIdx, beatIdx)
                        }}
                        className="relative w-2 h-2 rounded-full transition-all hover:scale-125"
                        style={{
                          backgroundColor: isActiveBeat || isPastBeat
                            ? chapter.color
                            : '#3f3f5a',
                          boxShadow: isActiveBeat ? `0 0 8px ${chapter.color}` : 'none',
                        }}
                      >
                        {/* Progress indicator on active beat */}
                        {isActiveBeat && (
                          <div
                            className="absolute inset-[-2px] rounded-full opacity-50"
                            style={{
                              background: `conic-gradient(${chapter.color} ${progress}%, transparent ${progress}%)`,
                            }}
                          />
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </button>

            {/* Chapter separator */}
            {chapterIdx < chapters.length - 1 && (
              <ChevronRight className="w-4 h-4 text-purple-700/50 mx-1" />
            )}
          </div>
        )
      })}
    </div>
  )
})

// ============================================================================
// LOADING
// ============================================================================

const SceneLoader = memo(function SceneLoader() {
  return (
    <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: TERMINAL_COLORS.background }}>
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: TERMINAL_COLORS.accent }} />
        <p className="text-sm" style={{ color: TERMINAL_COLORS.textMuted }}>Initializing workspace...</p>
      </div>
    </div>
  )
})
