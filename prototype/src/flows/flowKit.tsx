/**
 * TASK-015 — First-session flows: shared UI primitives.
 *
 * This file exports *only* components so it stays on the right side of the
 * react-refresh boundary. Data/hooks live in `flowData.ts`.
 *
 * Craft / standards baked into these primitives:
 *  - <2s one-gesture completion (CLAUDE.md §2): `HoldToComplete` finishes a press
 *    in ~0.6s and supports pointer *and* keyboard (press-and-hold Space/Enter).
 *  - Zero-Guilt (§1): nothing here renders a failure, red badge, or penalty.
 *  - Accessibility: reduced-motion honoured, focus-visible rings, ARIA labels,
 *    screen-reader summary for the Growing World canvas.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import type { GoalId } from './flowData'
import { fireSuccessHaptic } from './flowData'

/* ---------------------------------------------------------------- icons -- */

export function GoalIcon({ id }: { id: GoalId }) {
  switch (id) {
    case 'move':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="goal-ico">
          <circle cx="15" cy="5.5" r="2.1" />
          <path d="M14 9c-2 0-3.2 1.1-4.3 2.6L7 15m7-6 2.3 2.4L19 12m-5-3-1 5 3 2.6.8 3.4M9 16l-2.4 3.2" />
        </svg>
      )
    case 'calm':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="goal-ico">
          <circle cx="12" cy="12" r="3.4" />
          <circle cx="12" cy="12" r="7.3" opacity="0.55" />
          <circle cx="12" cy="12" r="10.6" opacity="0.28" />
        </svg>
      )
    case 'water':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="goal-ico">
          <path d="M12 3.2c3.6 4.3 6 7.3 6 10.2a6 6 0 0 1-12 0c0-2.9 2.4-5.9 6-10.2Z" />
        </svg>
      )
    case 'outside':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="goal-ico">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2.6v3m0 12.8v3M2.6 12h3m12.8 0h3M5.3 5.3l2.1 2.1m9.2 9.2 2.1 2.1m0-13.4-2.1 2.1M7.4 16.6l-2.1 2.1" />
        </svg>
      )
  }
}

/* ----------------------------------------------------------- goal chips -- */

interface GoalChipsProps {
  goals: readonly { id: GoalId; label: string }[]
  value: GoalId | null
  onPick: (id: GoalId) => void
}

/** A single-select set of warm chips (ARIA radiogroup). */
export function GoalChips({ goals, value, onPick }: GoalChipsProps) {
  return (
    <div className="chips" role="radiogroup" aria-label="What's pulling at you lately?">
      {goals.map((goal) => {
        const selected = value === goal.id
        return (
          <button
            key={goal.id}
            type="button"
            role="radio"
            aria-checked={selected}
            className={`chip${selected ? ' sel' : ''}`}
            onClick={() => onPick(goal.id)}
          >
            <span className="chip-ico">
              <GoalIcon id={goal.id} />
            </span>
            {goal.label}
          </button>
        )
      })}
    </div>
  )
}

/* -------------------------------------------------- hold-to-complete -- */

interface HoldToCompleteProps {
  /** Accessible description of the real-world action being completed. */
  actionLabel: string
  done: boolean
  onComplete: () => void
  reducedMotion: boolean
}

/**
 * The single completion gesture. Press and hold (pointer) or hold Space/Enter
 * (keyboard) for ~0.6s; releasing early cancels with no penalty and no scolding.
 * Reduced motion shortens the hold and drops the spring. Fires a success-only
 * haptic exactly once, on genuine completion.
 */
export function HoldToComplete({ actionLabel, done, onComplete, reducedMotion }: HoldToCompleteProps) {
  const [progress, setProgress] = useState(0) // 0..1
  const [holding, setHolding] = useState(false)

  const rafRef = useRef<number | null>(null)
  const startRef = useRef(0)
  const activeRef = useRef(false)

  // Latest values captured in refs so the rAF loop never needs re-subscribing.
  // Synced in an effect (never written during render).
  const onCompleteRef = useRef(onComplete)
  const doneRef = useRef(done)
  const holdMsRef = useRef(reducedMotion ? 240 : 620)
  useEffect(() => {
    onCompleteRef.current = onComplete
    doneRef.current = done
    holdMsRef.current = reducedMotion ? 240 : 620
  })

  const stopRaf = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [])

  const cancel = useCallback(() => {
    if (!activeRef.current || doneRef.current) return
    activeRef.current = false
    stopRaf()
    setHolding(false)
    setProgress(0)
  }, [stopRaf])

  const begin = useCallback(() => {
    if (activeRef.current || doneRef.current) return
    activeRef.current = true
    setHolding(true)
    startRef.current = performance.now()

    const tick = (now: number) => {
      const p = Math.min(1, (now - startRef.current) / holdMsRef.current)
      setProgress(p)
      if (p >= 1) {
        activeRef.current = false
        stopRaf()
        setHolding(false)
        fireSuccessHaptic()
        onCompleteRef.current()
      } else {
        rafRef.current = requestAnimationFrame(tick)
      }
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [stopRaf])

  useEffect(() => stopRaf, [stopRaf])

  const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.repeat) return
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault()
      begin()
    }
  }

  const onKeyUp = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault()
      cancel()
    }
  }

  const shown = done ? 1 : progress
  const r = 52
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - shown)

  return (
    <div className={`hold${done ? ' is-done' : ''}${holding ? ' is-holding' : ''}`}>
      <button
        type="button"
        className="hold-btn"
        aria-label={done ? `Completed: ${actionLabel}` : `Press and hold to complete: ${actionLabel}`}
        aria-pressed={done}
        onPointerDown={begin}
        onPointerUp={cancel}
        onPointerLeave={cancel}
        onPointerCancel={cancel}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
      >
        <svg viewBox="0 0 120 120" width="120" height="120" aria-hidden="true">
          <circle className="hold-track" cx="60" cy="60" r={r} />
          <circle
            className="hold-fill"
            cx="60"
            cy="60"
            r={r}
            style={{ strokeDasharray: circ, strokeDashoffset: offset }}
          />
        </svg>
        <span className="hold-face" aria-hidden="true">
          {done ? (
            <svg viewBox="0 0 24 24" className="hold-check">
              <path d="M5 12.5 10 17.5 19.5 7" />
            </svg>
          ) : (
            <span className="hold-glyph" />
          )}
        </span>
      </button>
      <p className="hold-hint" aria-hidden="true">
        {done ? 'Done' : holding ? 'Keep holding…' : 'Press & hold'}
      </p>
    </div>
  )
}

/* ------------------------------------------------------------- shell -- */

interface PhoneFrameProps {
  accent: string
  concept: string
  /** Changing this key replays the step enter animation. */
  stepKey: string
  stepIndex: number
  stepCount: number
  onBack: (() => void) | null
  children: React.ReactNode
}

/** A lightweight device frame with a back control + progress dots. */
export function PhoneFrame({
  accent,
  concept,
  stepKey,
  stepIndex,
  stepCount,
  onBack,
  children,
}: PhoneFrameProps) {
  return (
    <div className="phone" style={{ ['--accent']: accent } as React.CSSProperties}>
      <div className="phone-glow" aria-hidden="true" />
      <div className="phone-notch" aria-hidden="true" />
      <div className="phone-top">
        <button
          type="button"
          className="phone-back"
          onClick={() => onBack?.()}
          disabled={!onBack}
          aria-label={onBack ? 'Go back one step' : 'Start of flow'}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M15 5 8 12l7 7" />
          </svg>
        </button>
        <span className="phone-concept">{concept}</span>
        <div className="phone-dots" role="presentation">
          {Array.from({ length: stepCount }, (_, i) => (
            <span key={i} className={`phone-dot${i === stepIndex ? ' on' : ''}${i < stepIndex ? ' past' : ''}`} />
          ))}
        </div>
      </div>
      <div className="phone-screen">
        <div key={stepKey} className="flow-step">
          {children}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------- growing-world canvas -- */

interface WorldCanvasProps {
  /** Number of real actions recorded so far (first session: 0 → 1). */
  count: number
  /** Whether the newest element just appeared (plays the grow beat). */
  sprouting: boolean
  reducedMotion: boolean
}

/**
 * The world *is* the self-monitoring surface (brief §5.4 R5): non-numeric,
 * non-shaming, and strictly monotonic — it only ever accrues. A screen-reader
 * summary narrates it. For a first session we render the first seed growing.
 */
export function WorldCanvas({ count, sprouting, reducedMotion }: WorldCanvasProps) {
  // Deterministic placements so the same count always renders the same world.
  const spots = [
    { x: 60, cls: 'p1' },
    { x: 96, cls: 'p2' },
    { x: 150, cls: 'p3' },
    { x: 196, cls: 'p1' },
    { x: 236, cls: 'p2' },
  ]
  const visible = spots.slice(0, Math.min(count, spots.length))

  return (
    <div className={`world${sprouting && !reducedMotion ? ' is-sprouting' : ''}`}>
      <svg viewBox="0 0 300 150" className="world-svg" role="img" aria-label={worldSummary(count)}>
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,236,210,0.9)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="300" height="150" fill="url(#sky)" />
        <circle className="world-sun" cx="246" cy="42" r="20" />
        <path className="world-ground" d="M0 118 Q150 100 300 118 V150 H0 Z" />
        {visible.map((spot, i) => {
          const newest = i === visible.length - 1 && sprouting
          // Outer group positions; inner group carries the (overriding) CSS
          // scale animation, so the SVG translate is never clobbered.
          return (
            <g key={i} transform={`translate(${spot.x} 118)`}>
              <g className={`sprout ${spot.cls}${newest ? ' newest' : ''}`}>
                <path className="stem" d="M0 0 C -1 -14 -1 -22 0 -30" />
                <path className="leaf leaf-l" d="M0 -18 C -9 -22 -12 -30 -10 -34 C -4 -33 0 -27 0 -20 Z" />
                <path className="leaf leaf-r" d="M0 -22 C 9 -26 12 -34 10 -38 C 4 -37 0 -31 0 -24 Z" />
                <circle className="bloom" cx="0" cy="-32" r="4.6" />
              </g>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

function worldSummary(count: number): string {
  if (count <= 0) return 'An open patch of ground, ready for its first plant.'
  if (count === 1) return 'A small world with one plant — your first, added today.'
  return `A small world with ${count} plants, the newest added today.`
}
