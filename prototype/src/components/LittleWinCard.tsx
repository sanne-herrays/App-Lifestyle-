/**
 * TASK-020 — "Your Little Win Today" card.
 *
 * The PRD §6 *return* moment ("What's today's little win?") as a single,
 * standalone surface. One card, one real action, one gesture to finish it.
 *
 * Acceptance criterion (tasks.json TASK-020):
 *   "Card displays title, effort, alternative and completion; touch and
 *    keyboard controls work; reduced-motion mode exists."
 *
 *   - title        → the day's micro-action, plain general-benefit framing.
 *   - effort       → the honest "ridiculously small" estimate (PRD Principle 1).
 *   - alternative  → the always-ready easier variant; one swipe OR one tap OR
 *                    ArrowLeft/ArrowRight switches to it. Switching never
 *                    penalises progress (Zero-Guilt, CLAUDE.md §1 / TASK-022).
 *   - completion   → the shared one-gesture `HoldToComplete` (<2s, CLAUDE.md §2),
 *                    which already supports pointer *and* keyboard (hold
 *                    Space/Enter) and fires a success-only haptic once.
 *
 * Touch: press-and-hold to complete; horizontal swipe to switch variant.
 * Keyboard: Tab to the "easier/full" button and the hold control; ArrowLeft/
 * ArrowRight on the card also switch variant. Reduced motion drops the swipe
 * follow + spring and the gesture shortens (handled here and in flows.css).
 *
 * No red/danger/penalty semantics, no streak, no shaming copy (Zero-Guilt).
 */

import { useRef, useState } from 'react'
import { HoldToComplete } from '../flows/flowKit'
import {
  ACCENT,
  actionForGoal,
  GOALS,
  type GoalId,
  useReducedMotion,
} from '../flows/flowData'
import '../flows/flows.css'
import './LittleWinCard.css'

type Variant = 'full' | 'easier'

/** Past this many px of horizontal travel, a release counts as a swipe. */
const SWIPE_THRESHOLD = 56

export default function LittleWinCard() {
  const reducedMotion = useReducedMotion()
  const [goal, setGoal] = useState<GoalId>('outside')
  const [variant, setVariant] = useState<Variant>('full')
  const [done, setDone] = useState(false)
  const [drag, setDrag] = useState(0) // live swipe offset in px (visual only)
  const [dragging, setDragging] = useState(false)

  const action = actionForGoal(goal)
  const easier = variant === 'easier'
  const title = easier ? action.easierTitle : action.title
  const effort = easier ? action.easierEffort : action.effort
  const altTitle = easier ? action.title : action.easierTitle
  const altEffort = easier ? action.effort : action.easierEffort

  // Pointer-swipe bookkeeping kept in a ref so moves never re-subscribe.
  const swipe = useRef({ active: false, startX: 0, moved: false })

  const toggleVariant = () => {
    if (done) return
    setVariant((v) => (v === 'full' ? 'easier' : 'full'))
  }

  const pickGoal = (id: GoalId) => {
    setGoal(id)
    setVariant('full')
    setDone(false)
    setDrag(0)
  }

  const restart = () => {
    setDone(false)
    setVariant('full')
    setDrag(0)
  }

  /* ----------------------------------------------------------- swipe -- */

  const onSwipeStart: React.PointerEventHandler = (e) => {
    if (done) return
    swipe.current = { active: true, startX: e.clientX, moved: false }
    setDragging(true)
  }

  const onSwipeMove: React.PointerEventHandler = (e) => {
    const s = swipe.current
    if (!s.active) return
    const dx = e.clientX - s.startX
    if (Math.abs(dx) > 4) s.moved = true
    // Resist past the threshold so the card feels anchored, not flung away.
    const resisted = Math.sign(dx) * Math.min(Math.abs(dx), SWIPE_THRESHOLD + 28)
    if (!reducedMotion) setDrag(resisted)
  }

  const onSwipeEnd: React.PointerEventHandler = (e) => {
    const s = swipe.current
    if (!s.active) return
    swipe.current = { active: false, startX: 0, moved: s.moved }
    const dx = e.clientX - s.startX
    setDrag(0)
    setDragging(false)
    if (Math.abs(dx) >= SWIPE_THRESHOLD) toggleVariant()
  }

  const onCardKeyDown: React.KeyboardEventHandler = (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault()
      toggleVariant()
    }
  }

  const accent = ACCENT['tiny-win']

  return (
    <div className="lwc" style={{ ['--accent']: accent } as React.CSSProperties}>
      <div className="lwc-glow" aria-hidden="true" />

      <header className="lwc-head">
        <p className="lwc-eyebrow">Your little win today</p>
        <p className="lwc-date">{todayLabel()}</p>
      </header>

      {/* Optional: change what today is about. Demonstrates the card across the
          reviewed catalog; each goal re-renders title/effort/alternative. */}
      <div className="lwc-goals" role="radiogroup" aria-label="What's today about?">
        {GOALS.map((g) => {
          const on = g.id === goal
          return (
            <button
              key={g.id}
              type="button"
              role="radio"
              aria-checked={on}
              className={`lwc-goal${on ? ' on' : ''}`}
              onClick={() => pickGoal(g.id)}
            >
              {g.label}
            </button>
          )
        })}
      </div>

      {/* The card surface. Swipe-switchable; also keyboard-switchable via arrows. */}
      <div
        className={`lwc-card${done ? ' is-done' : ''}${dragging ? ' is-dragging' : ''}`}
        style={{ transform: drag ? `translateX(${drag}px)` : undefined }}
        role="group"
        aria-label={`Today's little win: ${title}, ${effort}`}
        tabIndex={0}
        onKeyDown={onCardKeyDown}
        onPointerDown={onSwipeStart}
        onPointerMove={onSwipeMove}
        onPointerUp={onSwipeEnd}
        onPointerLeave={onSwipeEnd}
        onPointerCancel={onSwipeEnd}
      >
        <div className="lwc-card-top">
          <span className={`lwc-variant-tag${easier ? ' easier' : ''}`}>
            {easier ? 'Easier version' : 'Today’s action'}
          </span>
          <span className="lwc-effort" aria-label={`Takes about ${effort}`}>
            {effort}
          </span>
        </div>

        {/* aria-live so switching variant is announced to screen readers. */}
        <h2 className="lwc-title" aria-live="polite">
          {title}
        </h2>
        <p className="lwc-sub">That’s the whole thing.</p>

        <div className="lwc-complete">
          <HoldToComplete
            actionLabel={title}
            done={done}
            onComplete={() => setDone(true)}
            reducedMotion={reducedMotion}
          />
        </div>

        <div className="lwc-reward" aria-live="polite">
          {done ? <p className="lwc-reward-line">{action.reward}</p> : null}
        </div>
      </div>

      {/* The alternative is always visible and always one action away. */}
      {!done ? (
        <div className="lwc-alt">
          <p className="lwc-alt-line">
            {easier ? 'Prefer the full version?' : 'Not today?'}{' '}
            <span className="lwc-alt-name">
              {altTitle} · {altEffort}
            </span>
          </p>
          <button type="button" className="lwc-alt-btn" onClick={toggleVariant}>
            {easier ? 'Back to the full version' : 'Switch to the easier version'}
          </button>
          <p className="lwc-swipe-hint" aria-hidden="true">
            or swipe the card ←→
          </p>
        </div>
      ) : (
        <div className="lwc-after">
          <p className="lwc-after-note">
            That’s your little win today — we’ll be here tomorrow. No streak to keep.
          </p>
          <button type="button" className="lwc-restart" onClick={restart}>
            Do another, just for today
          </button>
        </div>
      )}
    </div>
  )
}

/** A warm, non-pressuring date label for the card header. */
function todayLabel(): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    }).format(new Date())
  } catch {
    return 'Today'
  }
}
