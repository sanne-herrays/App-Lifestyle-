/**
 * TASK-022 — Tiny-action fallback flow.
 *
 * "Allow a user to reduce an action to a feasible alternative."
 *
 * Acceptance criterion (tasks.json TASK-022):
 *   "Every sample action has an easier variant; switch takes at most two taps;
 *    progress is not penalized."
 *
 *   - Every sample action has an easier variant → each of the four reviewed
 *     sample actions (GOALS) is a `fallbackLadder`: full → easier → an
 *     always-feasible floor. Every goal is reachable here, each with ≥1 easier
 *     rung drawn from the real catalog (flowData.ACTION_BY_GOAL + TINY_FLOOR).
 *   - Switch takes at most two taps → "Make it easier" steps down exactly one
 *     rung per tap (one tap), and "Step back up" climbs one rung per tap. From
 *     the full action, the tiniest version is two taps away; any single switch
 *     is one tap. Arrow keys mirror this for keyboard users.
 *   - Progress is not penalized → reducing never resets or docks anything;
 *     completing *any* rung is the same full win, with explicit Zero-Guilt
 *     copy ("This still counts, fully"). No streak, no red, no penalty chrome.
 *
 * Distinct from the TASK-020 card's binary full/easier toggle: this is the
 * dedicated multi-rung *reduction* surface — a feasibility ladder with an
 * always-feasible floor and an explicit, persistent non-penalty guarantee.
 */

import { useState } from 'react'
import { HoldToComplete } from '../flows/flowKit'
import {
  ACCENT,
  fallbackLadder,
  GOALS,
  type GoalId,
  useReducedMotion,
} from '../flows/flowData'
import '../flows/flows.css'
import './TinyActionFallback.css'

/** Human label for each rung position — non-numeric, never shaming. */
const RUNG_TAG = ['Full action', 'Easier', 'Tiniest version'] as const

export default function TinyActionFallback() {
  const reducedMotion = useReducedMotion()
  const [goal, setGoal] = useState<GoalId>('move')
  const [rung, setRung] = useState(0) // 0 = full action, higher = smaller
  const [done, setDone] = useState(false)

  const ladder = fallbackLadder(goal)
  const current = ladder[rung] ?? ladder[0]!
  const atFloor = rung >= ladder.length - 1
  const atTop = rung <= 0

  const pickGoal = (id: GoalId) => {
    setGoal(id)
    setRung(0)
    setDone(false)
  }

  // Reduce / climb never touch `done`-state progress — switching is free.
  const makeEasier = () => {
    if (done) return
    setRung((r) => Math.min(r + 1, ladder.length - 1))
  }
  const stepBackUp = () => {
    if (done) return
    setRung((r) => Math.max(r - 1, 0))
  }

  const restart = () => {
    setRung(0)
    setDone(false)
  }

  const onCardKeyDown: React.KeyboardEventHandler = (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault()
      makeEasier()
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault()
      stepBackUp()
    }
  }

  const accent = ACCENT['growing-world'] // calm green — "this is easy to do"
  const tag = RUNG_TAG[rung] ?? RUNG_TAG[0]

  return (
    <div
      className="taf"
      style={{ ['--accent']: accent } as React.CSSProperties}
    >
      <div className="taf-glow" aria-hidden="true" />

      <header className="taf-head">
        <p className="taf-eyebrow">When today is a lot</p>
        <h2 className="taf-headline">Shrink it to something you can do</h2>
        <p className="taf-intro">
          Some days the full action is too much. Make it smaller until it feels
          easy — it still counts, fully.
        </p>
      </header>

      {/* Every sample action is reachable here; each has its own easier ladder. */}
      <div className="taf-goals" role="radiogroup" aria-label="Which action?">
        {GOALS.map((g) => {
          const on = g.id === goal
          return (
            <button
              key={g.id}
              type="button"
              role="radio"
              aria-checked={on}
              className={`taf-goal${on ? ' on' : ''}`}
              onClick={() => pickGoal(g.id)}
            >
              {g.label}
            </button>
          )
        })}
      </div>

      {/* The ladder card. Arrow keys reduce (down/right) or climb (up/left). */}
      <div
        className={`taf-card${done ? ' is-done' : ''}`}
        role="group"
        aria-label={`${tag}: ${current.title}, ${current.effort}`}
        tabIndex={0}
        onKeyDown={onCardKeyDown}
      >
        <div className="taf-card-top">
          <span className={`taf-tag rung-${rung}`}>{tag}</span>
          <span className="taf-effort" aria-label={`Takes about ${current.effort}`}>
            {current.effort}
          </span>
        </div>

        {/* Non-numeric ladder gauge: fuller on the left, tiniest on the right. */}
        <div className="taf-gauge" aria-hidden="true">
          {ladder.map((_, i) => (
            <span
              key={i}
              className={`taf-rung${i === rung ? ' on' : ''}${i < rung ? ' past' : ''}`}
            />
          ))}
        </div>

        <p className="taf-title" aria-live="polite">
          {current.title}
        </p>
        <p className="taf-still-counts">This still counts, fully.</p>

        <div className="taf-complete">
          <HoldToComplete
            actionLabel={current.title}
            done={done}
            onComplete={() => setDone(true)}
            reducedMotion={reducedMotion}
          />
        </div>

        <div className="taf-reward" aria-live="polite">
          {done ? (
            <p className="taf-reward-line">Done — and it counts the same.</p>
          ) : null}
        </div>
      </div>

      {/* Reduce / climb controls (each one tap) + the persistent no-penalty
          guarantee. Hidden once complete; replaced by a warm restart. */}
      {!done ? (
        <div className="taf-controls">
          <div className="taf-switch">
            <button
              type="button"
              className="taf-reduce"
              onClick={makeEasier}
              disabled={atFloor}
            >
              {atFloor ? 'This is as small as it gets' : 'Make it easier'}
            </button>
            {!atTop ? (
              <button type="button" className="taf-up" onClick={stepBackUp}>
                Step back up
              </button>
            ) : null}
          </div>
          <p className="taf-guarantee">
            {atFloor
              ? 'The tiniest version is perfect for right now.'
              : 'Switching is free — no streak to lose, nothing to undo.'}
          </p>
        </div>
      ) : (
        <div className="taf-after">
          <p className="taf-after-note">
            That’s your win. Making it smaller changed nothing about that — we’ll
            be here tomorrow.
          </p>
          <button type="button" className="taf-restart" onClick={restart}>
            Do another, just for today
          </button>
        </div>
      )}
    </div>
  )
}
