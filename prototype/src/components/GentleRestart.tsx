/**
 * TASK-027 — Gentle restart experience (interactive surface).
 *
 * The missed-day measurement, tier thresholds, two-tap plan and guilt-free copy
 * live in the pure, fully-tested engine (`src/lib/restart.ts`, with deterministic
 * cases in `restart.test.ts`). This surface binds that engine to the real shared
 * action catalog and the real completion ledger (TASK-026) so the three
 * acceptance behaviours are visible and tappable:
 *
 *   - After 1, 3 or 7 missed days → the offer's tier/copy is computed from the
 *     real ledger gap. A "preview how it feels after…" control (honestly
 *     labelled) lets a reviewer see the 1 / 3 / 7-day welcome-back states even
 *     when the prototype ledger is fresh — it overrides only the *displayed*
 *     clock, never fabricates ledger events.
 *   - Restart requires at most two taps → tap 1 is "resume" (choose the gentle
 *     way back in); tap 2 is the shared `HoldToComplete` gesture, which records
 *     a real completion into the ledger. The step count is driven by the
 *     engine's `steps` (guarded at ≤ MAX_RESTART_TAPS) — nothing in between.
 *   - No guilt/shame copy appears → all welcome-back copy comes from the engine,
 *     which the test suite scans against `SHAME_LEXICON`.
 *
 * Standards (CLAUDE.md): Zero-Guilt (§1) — warm paper + calm-green only; a longer
 * absence offers a *smaller* step, never a scolding; past wins are never erased;
 * no red/penalty/streak chrome. <2s / tactile (§2) — reuses the shared
 * `HoldToComplete` one-gesture primitive. Health-claim integrity (§3 / TASK-006)
 * — every action label is plain, general-benefit copy; nothing composes a
 * health outcome.
 */

import { useMemo, useRef, useState } from 'react'
import { HoldToComplete } from '../flows/flowKit'
import { ACTION_BY_GOAL, GOALS, TINY_FLOOR, type GoalId, useReducedMotion } from '../flows/flowData'
import { newClientKey, recordCompletion } from '../lib/ledger'
import { restartOffer, type RungResolver } from '../lib/restart'
import { previewClock } from '../lib/restartPreview'
import { useLedgerEvents } from './useLedgerEvents'
import '../flows/flows.css'
import './GentleRestart.css'

/** The real catalog-backed resolver: the easier variant, or the tiny floor for a long gap. */
const resolveAction: RungResolver = (goalId, rung) =>
  rung === 'floor'
    ? { title: TINY_FLOOR[goalId].title, effort: TINY_FLOOR[goalId].effort }
    : { title: ACTION_BY_GOAL[goalId].easierTitle, effort: ACTION_BY_GOAL[goalId].easierEffort }

/** The honest preview presets — each maps to one of the acceptance thresholds. */
const PREVIEWS: readonly { days: number; label: string }[] = [
  { days: 0, label: 'Today' },
  { days: 1, label: '1 day away' },
  { days: 3, label: '3 days away' },
  { days: 7, label: '7 days away' },
]

export default function GentleRestart() {
  const reducedMotion = useReducedMotion()
  const events = useLedgerEvents()

  // Capture the wall clock ONCE at mount (lazy initializer — read outside the
  // re-render path, so it never trips react-hooks/purity and the preview stays
  // stable across re-renders).
  const [mountClock] = useState<number>(() => Date.now())

  const [goal, setGoal] = useState<GoalId>('move')
  const [previewDays, setPreviewDays] = useState<number>(3)
  const [resumed, setResumed] = useState(false)
  const [done, setDone] = useState(false)
  const recordedThisHold = useRef(false)

  // The preview overrides only the *displayed* clock — never the real ledger.
  // `previewClock` (a pure, node-tested helper) returns the `{ events, now }` the
  // engine should read so that the gap it measures equals exactly `previewDays`
  // in both the real-history and the no-history paths. Keeping this math in one
  // tested place is what guarantees "1 day away" renders "1 day", not two.
  const { events: previewEvents, now } = useMemo(
    () => previewClock(events, previewDays, goal, ACTION_BY_GOAL[goal].title, mountClock),
    [events, previewDays, goal, mountClock],
  )

  const offer = useMemo(
    () => restartOffer(previewEvents, now, goal, resolveAction),
    [previewEvents, now, goal],
  )

  // Surface-level guard: the rendered day count MUST equal the selected preview
  // chip (for the 1/3/7 thresholds this preview exists to demonstrate). This is
  // the regression the Reviewer caught — a doubled gap that stayed build-green
  // because the engine tests never ran the preview's own clock math. It now
  // fails loudly in dev if the preview clock ever drifts from the chip again.
  if (import.meta.env.DEV && previewDays > 0 && offer.missedDays !== previewDays) {
    throw new Error(
      `GentleRestart preview drift: chip ${previewDays}d rendered ${offer.missedDays}d` +
        ` (hasHistory=${offer.hasHistory})`,
    )
  }

  const pickGoal = (id: GoalId) => {
    setGoal(id)
    setResumed(false)
    setDone(false)
    recordedThisHold.current = false
  }

  const pickPreview = (days: number) => {
    setPreviewDays(days)
    setResumed(false)
    setDone(false)
    recordedThisHold.current = false
  }

  // Tap 1 — accept the gentle way back in.
  const resume = () => {
    setResumed(true)
  }

  // Tap 2 — the hold gesture completes and records a real win into the ledger.
  const onComplete = () => {
    if (recordedThisHold.current) return
    recordedThisHold.current = true
    recordCompletion({
      clientKey: newClientKey(),
      goalId: offer.action.goalId,
      actionTitle: offer.action.title,
      variant: offer.action.variant,
    })
    setDone(true)
  }

  const again = () => {
    setResumed(false)
    setDone(false)
    recordedThisHold.current = false
  }

  return (
    <div className={`restart tier-${offer.tier}`}>
      <div className="restart-glow" aria-hidden="true" />

      {/* ---- preview controls (honestly labelled, display-only) ---------- */}
      <div className="restart-preview" role="group" aria-label="Preview how a return feels">
        <span className="restart-preview-label">Preview a return after…</span>
        <div className="restart-preview-chips" role="radiogroup" aria-label="Days away">
          {PREVIEWS.map((p) => {
            const on = p.days === previewDays
            return (
              <button
                key={p.days}
                type="button"
                role="radio"
                aria-checked={on}
                className={`restart-preview-chip${on ? ' on' : ''}`}
                onClick={() => pickPreview(p.days)}
              >
                {p.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* ---- the welcome-back offer -------------------------------------- */}
      <header className="restart-head">
        <p className="restart-eyebrow">{offer.eyebrow}</p>
        <h2 className="restart-title" aria-live="polite">
          {offer.headline}
        </h2>
        {offer.hasHistory && offer.missedDays > 0 ? (
          <p className="restart-gap" aria-live="polite">
            It’s been {offer.missedDays} {offer.missedDays === 1 ? 'day' : 'days'} — and that’s completely okay.
          </p>
        ) : null}
        <p className="restart-body">{offer.body}</p>
      </header>

      {/* ---- which little win ------------------------------------------- */}
      <div className="restart-goals" role="radiogroup" aria-label="Which little win to return with?">
        {GOALS.map((g) => {
          const on = g.id === goal
          return (
            <button
              key={g.id}
              type="button"
              role="radio"
              aria-checked={on}
              className={`restart-goal${on ? ' on' : ''}`}
              onClick={() => pickGoal(g.id)}
            >
              {g.label}
            </button>
          )
        })}
      </div>

      {/* ---- the two-tap path ------------------------------------------- */}
      <section className="restart-path" aria-label="Your gentle way back">
        <div className="restart-action-card">
          <span className="restart-action-tag">The lightest possible step</span>
          <p className="restart-action-title">{offer.action.title}</p>
          <span className="restart-action-effort">{offer.action.effort}</span>
        </div>

        {!resumed ? (
          <button type="button" className="restart-resume" onClick={resume}>
            {offer.steps[0]?.label ?? 'Pick up where you left off'}
          </button>
        ) : (
          <div className="restart-complete">
            <HoldToComplete
              actionLabel={offer.action.title}
              done={done}
              onComplete={onComplete}
              reducedMotion={reducedMotion}
            />
            <div className="restart-after" aria-live="polite">
              {done ? (
                <>
                  <p className="restart-welcome">{offer.welcomeBack}</p>
                  <button type="button" className="restart-again" onClick={again}>
                    Choose another
                  </button>
                </>
              ) : (
                <p className="restart-cue">That’s the whole restart — just this one.</p>
              )}
            </div>
          </div>
        )}
      </section>

      <p className="restart-foot">
        Nothing to rebuild. Every win you’ve ever logged is still exactly where you left it.
      </p>
    </div>
  )
}
