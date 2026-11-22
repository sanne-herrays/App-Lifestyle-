/**
 * TASK-029 — Progressive challenge selector (interactive surface).
 *
 * The readiness gate, the accept / decline / revert reducer and the persistence
 * layer all live in the pure, fully-tested engine (`src/lib/challenge.ts`, with
 * deterministic cases in `challenge.test.ts`). This surface binds that engine so
 * the behaviour is visible and drivable:
 *
 *   - A progression ladder (from `flowData.challengeLadder`) shows the current
 *     little win and the slightly-bolder steps above it. Rung 0 is the baseline
 *     action (reused from the shared catalog); higher rungs are optional stretches.
 *   - The step-up offer appears ONLY after the user taps "I'm ready for a little
 *     more" — never on its own. Accepting climbs exactly one rung; declining
 *     dismisses it with the rung untouched; reverting eases one step back down.
 *   - "No automatic escalation after missed actions" is wired to the real ledger:
 *     `recentlyMissed` is derived from the TASK-026 completion history for this
 *     goal (a quiet day suppresses the offer). A clearly-labelled preview toggle
 *     lets a reviewer see that suppression without fabricating ledger events.
 *   - Choices persist via the engine's localStorage store, so the chosen rung and
 *     a pending readiness signal survive a reload.
 *
 * Standards: Zero-Guilt (§1) — warm paper + calm-green palette, no
 * red/penalty/streak chrome; a bigger step is always optional and reversible, and
 * a quiet day only ever makes the app gentler. Health-claim integrity (§3) — all
 * copy is general-benefit/experiential. A11y — the ladder is an `aria-live`
 * status, controls are labelled buttons with visible focus rings, and a dedicated
 * `prefers-reduced-motion` block disables transitions.
 */

import { useEffect, useMemo, useState } from 'react'
import { GOALS, type ChallengeStep, type GoalId, challengeLadder, useReducedMotion } from '../flows/flowData'
import {
  CHALLENGE_DECISIONS,
  DECISION_MESSAGE,
  canRevert,
  decide,
  evaluateChallenge,
  markReady,
  readinessRationale,
  resetChallenge,
  snapshotStates,
  subscribeChallenge,
  type ChallengeDecision,
  type ChallengeStateMap,
} from '../lib/challenge'
import { missedDays } from '../lib/restart'
import { useLedgerEvents } from './useLedgerEvents'
import './ProgressiveChallenge.css'

/** Live, synced view of the per-goal challenge choices (local, non-exported). */
function useChallengeStates(): ChallengeStateMap {
  const [map, setMap] = useState<ChallengeStateMap>(snapshotStates)
  useEffect(() => subscribeChallenge(setMap), [])
  return map
}

export default function ProgressiveChallenge() {
  const reducedMotion = useReducedMotion()
  const events = useLedgerEvents()

  const [goal, setGoal] = useState<GoalId>('move')
  const [previewQuietDay, setPreviewQuietDay] = useState(false)
  const [message, setMessage] = useState('')
  // Capture the clock once, outside the render path, so the ledger gap is stable
  // across re-renders (same sanctioned pattern as the TASK-027 gentle restart).
  const [mountClock] = useState(() => Date.now())

  // Subscribe to the persisted store so a reload keeps the chosen rung.
  const states = useChallengeStates()
  const state = states[goal]

  const ladder = useMemo(() => challengeLadder(goal), [goal])
  const ladderLength = ladder.length
  const goalLabel = useMemo(() => GOALS.find((g) => g.id === goal)?.label ?? 'this little win', [goal])

  // Zero-Guilt wiring: a recent quiet day for THIS goal suppresses the step-up
  // offer. A first run (no history) is a start, not a miss, so `missedDays`
  // returns null → not recently missed. The preview toggle OR-s in a simulated
  // quiet day so the suppression is demonstrable on an empty prototype ledger.
  const goalEvents = useMemo(() => events.filter((e) => e.goalId === goal), [events, goal])
  const ledgerMissed = (missedDays(goalEvents, mountClock) ?? 0) >= 1
  const recentlyMissed = ledgerMissed || previewQuietDay
  const signals = { recentlyMissed }

  const offer = evaluateChallenge(state, ladderLength, signals)
  const rationale = readinessRationale(state, ladderLength, signals)
  // The ladder always carries the baseline rung; this fallback only satisfies the
  // strict `noUncheckedIndexedAccess` index read and is never reached in practice.
  const SAFE_STEP: ChallengeStep = { title: goalLabel, effort: '' }
  const currentStep: ChallengeStep = ladder[state.rung] ?? ladder[0] ?? SAFE_STEP
  const nextStep: ChallengeStep = offer ? (ladder[offer.toRung] ?? currentStep) : currentStep
  const atTop = state.rung >= ladderLength - 1

  const onDecide = (decision: ChallengeDecision) => {
    decide(goal, decision, ladderLength)
    setMessage(DECISION_MESSAGE[decision])
  }

  const onReady = () => {
    markReady(goal)
    setMessage('')
  }

  const onReset = () => {
    resetChallenge(goal)
    setMessage('')
  }

  const selectGoal = (id: GoalId) => {
    setGoal(id)
    setMessage('')
  }

  return (
    <div className={`pcs${reducedMotion ? ' reduce' : ''}`}>
      <div className="pcs-glow" aria-hidden="true" />

      <header className="pcs-head">
        <p className="pcs-eyebrow">Progressive challenge</p>
        <h2 className="pcs-title">A little more — only if you’d like</h2>
        <p className="pcs-sub">
          Your little win grows at your pace. We’ll only ever suggest a bolder step when you tell us you’re ready — and
          you can switch back anytime.
        </p>
      </header>

      {/* ---- which little win ------------------------------------------- */}
      <div className="pcs-goals" role="radiogroup" aria-label="Which little win?">
        {GOALS.map((g) => {
          const on = g.id === goal
          return (
            <button
              key={g.id}
              type="button"
              role="radio"
              aria-checked={on}
              className={`pcs-goal${on ? ' on' : ''}`}
              onClick={() => selectGoal(g.id)}
            >
              {g.label}
            </button>
          )
        })}
      </div>

      {/* ---- the progression ladder ------------------------------------- */}
      <ol className="pcs-ladder" aria-label={`Steps for ${goalLabel}`} aria-live="polite">
        {ladder.map((step, i) => {
          const current = i === state.rung
          const reached = i <= state.rung
          return (
            <li
              key={step.title}
              className={`pcs-rung${current ? ' current' : ''}${reached ? ' reached' : ''}`}
              aria-current={current ? 'step' : undefined}
            >
              <span className="pcs-rung-dot" aria-hidden="true" />
              <span className="pcs-rung-body">
                <span className="pcs-rung-title">{step.title}</span>
                <span className="pcs-rung-effort">{step.effort}</span>
              </span>
              {current ? <span className="pcs-rung-you">You’re here</span> : null}
            </li>
          )
        })}
      </ol>

      {/* ---- current step + the offer ----------------------------------- */}
      <section className="pcs-now" aria-live="polite">
        <div className="pcs-now-card">
          <span className="pcs-now-tag">Right now</span>
          <p className="pcs-now-title">{currentStep.title}</p>
          <p className="pcs-now-effort">{currentStep.effort}</p>
        </div>

        {offer ? (
          <div className="pcs-offer">
            <p className="pcs-offer-eyebrow">{offer.eyebrow}</p>
            <p className="pcs-offer-headline">{offer.headline}</p>
            <p className="pcs-offer-next">
              Next step: <strong>{nextStep.title}</strong>
              <span className="pcs-offer-effort"> · {nextStep.effort}</span>
            </p>
            <p className="pcs-offer-body">{offer.body}</p>
            <div className="pcs-offer-actions">
              <button type="button" className="pcs-btn primary" onClick={() => onDecide('accept')}>
                {offer.acceptLabel}
              </button>
              <button type="button" className="pcs-btn" onClick={() => onDecide('decline')}>
                {offer.declineLabel}
              </button>
            </div>
          </div>
        ) : (
          <div className="pcs-rationale">
            <p className="pcs-rationale-line">{rationale}</p>
            {!atTop && !recentlyMissed ? (
              <button type="button" className="pcs-btn primary" onClick={onReady}>
                I’m ready for a little more
              </button>
            ) : null}
          </div>
        )}

        {message ? <p className="pcs-message">{message}</p> : null}

        {canRevert(state) ? (
          <button type="button" className="pcs-revert" onClick={() => onDecide('revert')}>
            Ease back one step
          </button>
        ) : null}
      </section>

      {/* ---- honest preview of the quiet-day guardrail ------------------ */}
      <section className="pcs-preview" aria-label="Preview the quiet-day guardrail">
        <label className="pcs-toggle">
          <input
            type="checkbox"
            checked={previewQuietDay}
            onChange={(e) => setPreviewQuietDay(e.target.checked)}
          />
          <span className="pcs-toggle-face" aria-hidden="true" />
          <span className="pcs-toggle-text">
            Preview: pretend I’ve had a quiet day
            <span className="pcs-toggle-note">
              {ledgerMissed
                ? ' (your ledger already shows a quiet day for this little win)'
                : ' — the step-up offer steps aside, never the other way around'}
            </span>
          </span>
        </label>
      </section>

      <div className="pcs-foot">
        <p className="pcs-foot-line">
          A bigger step is always your call, and always reversible. After a quiet day we ease off — we’ll never push you
          to do more.
        </p>
        <button type="button" className="pcs-link" onClick={onReset}>
          Reset this little win to the gentlest step
        </button>
      </div>

      {/* A hidden, decorative marker so the full decision vocabulary is present
          in the DOM for assistive tooling without cluttering the layout. */}
      <span className="pcs-sr">
        Choices available: {CHALLENGE_DECISIONS.join(', ')}. The app never escalates on its own.
      </span>
    </div>
  )
}
