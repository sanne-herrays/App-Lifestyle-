/**
 * TASK-031 — Seven-day journey preview (interactive surface).
 *
 * The seven-day arc, the gradual non-decreasing progression and the
 * no-health-promise guard all live in the pure, fully-tested engine
 * (`src/lib/journeyPreview.ts`, with deterministic cases in
 * `journeyPreview.test.ts`). This surface binds that engine so the preview is
 * visible and switchable:
 *
 *   - Pick a little win (reusing the shared `GOALS` chips) and the week rebuilds
 *     from that goal's real `challengeLadder` — day 1 is the baseline action from
 *     the shared catalog, later days are its optional stretches.
 *   - Seven day cards render in order, each tagged with its phase (plant / let it
 *     settle / a little more) and a plain, general-benefit note.
 *   - The progression is explained up front; the closing line keeps it honest —
 *     a picture of what's possible, not a plan the user owes anyone.
 *
 * Standards: Zero-Guilt (§1) — warm paper + calm-green palette, no
 * red/penalty/streak chrome; growth is always optional and reversible. Health-claim
 * integrity (§3) — every surfaced string comes from the guard-scanned engine, so no
 * unsupported health-outcome promise can ship. A11y — the week is a semantic
 * ordered list with an accessible label, controls are labelled buttons with visible
 * focus rings, and a dedicated `prefers-reduced-motion` block disables transitions.
 */

import { useMemo, useState } from 'react'
import { GOALS, type GoalId, challengeLadder, useReducedMotion } from '../flows/flowData'
import { PHASE_LABEL, buildJourney, type JourneyRung } from '../lib/journeyPreview'
import './SevenDayJourney.css'

/** Bind the real shared ladder; its {title, effort} rungs match `JourneyRung`. */
const resolveLadder = (goal: GoalId): readonly JourneyRung[] => challengeLadder(goal)

export default function SevenDayJourney() {
  const reducedMotion = useReducedMotion()
  const [goal, setGoal] = useState<GoalId>('move')

  const goalLabel = useMemo(() => GOALS.find((g) => g.id === goal)?.label ?? 'your little win', [goal])
  const journey = useMemo(() => buildJourney(goal, resolveLadder), [goal])

  return (
    <div className={`sdj${reducedMotion ? ' reduce' : ''}`}>
      <div className="sdj-glow" aria-hidden="true" />

      <header className="sdj-head">
        <p className="sdj-eyebrow">Seven-day journey</p>
        <h2 className="sdj-title">How one little win could grow in a week</h2>
        <p className="sdj-sub">{journey.progressionNote}</p>
      </header>

      {/* ---- which little win ------------------------------------------- */}
      <div className="sdj-goals" role="radiogroup" aria-label="Which little win?">
        {GOALS.map((g) => {
          const on = g.id === goal
          return (
            <button
              key={g.id}
              type="button"
              role="radio"
              aria-checked={on}
              className={`sdj-goal${on ? ' on' : ''}`}
              onClick={() => setGoal(g.id)}
            >
              {g.label}
            </button>
          )
        })}
      </div>

      {/* ---- the illustrative week -------------------------------------- */}
      <ol className="sdj-week" aria-label={`A possible week for ${goalLabel}`}>
        {journey.days.map((d) => (
          <li key={d.day} className={`sdj-day phase-${d.phase}`}>
            <div className="sdj-day-rail" aria-hidden="true">
              <span className="sdj-day-dot" />
            </div>
            <div className="sdj-day-card">
              <div className="sdj-day-top">
                <span className="sdj-day-num">Day {d.day}</span>
                <span className="sdj-day-phase">{PHASE_LABEL[d.phase]}</span>
              </div>
              <p className="sdj-day-title">{d.title}</p>
              <p className="sdj-day-effort">{d.effort}</p>
              <p className="sdj-day-note">{d.note}</p>
            </div>
          </li>
        ))}
      </ol>

      <p className="sdj-closing">{journey.closing}</p>

      {/* A hidden summary so assistive tooling hears the honest framing plainly. */}
      <span className="sdj-sr">
        This is an optional, illustrative week for {goalLabel}. Some days simply repeat; the step only grows a little,
        and only once the smaller one feels easy. It makes no health-outcome promises.
      </span>
    </div>
  )
}
