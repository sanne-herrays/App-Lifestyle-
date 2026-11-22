/**
 * TASK-028 — Habit graduation state machine (interactive surface).
 *
 * The transition table, the total `transition()` function (which accepts the 5
 * documented edges and rejects the other 15 pairs), and the forward-only
 * behavioural evaluator all live in the pure, fully-tested engine
 * (`src/lib/habitGraduation.ts`, with 34 deterministic cases in
 * `habitGraduation.test.ts`). This surface binds that engine so the lifecycle is
 * visible and drivable:
 *
 *   - A state rail renders new → practicing → stable → graduated and the current
 *     stage's shrinking `prompting` promise (PRD §7: reduce prompting as a habit
 *     matures).
 *   - An "evidence" panel feeds the evaluator (distinct active days, automaticity
 *     confirmed). The forward move unlocks only when the evidence earns it; the
 *     machine never advances on a tap alone.
 *   - Every move is `transition(state, event)`. Advance moves are evidence-gated;
 *     the two backward moves (ease / revisit) are always-available *user choices*
 *     framed as support — never an automatic demotion (CLAUDE.md §1).
 *   - The moves the current stage does NOT allow are shown as disabled, with the
 *     engine's own guilt-free rejection reason — so the rejected half of the
 *     table is visible on the surface too, not just in the tests.
 *
 * Standards: Zero-Guilt (§1) — warm paper + calm-green/sage palette, no
 * red/penalty/streak chrome; a habit never resets to zero (both returns land in
 * `practicing`, and past progress is explicitly preserved). Health-claim
 * integrity (§3) — all copy is general-benefit/experiential. A11y — the rail is
 * an `aria-live` status, moves are labelled buttons with visible focus rings, and
 * a dedicated `prefers-reduced-motion` block disables transitions.
 */

import { useMemo, useState } from 'react'
import { GOALS, type GoalId, useReducedMotion } from '../flows/flowData'
import {
  DEFAULT_GRADUATION_CONFIG,
  EVENT_DIRECTION,
  EVENT_LABEL,
  GRADUATION_EVENTS,
  HABIT_STATES,
  STATE_COPY,
  availableEvents,
  evaluateReadiness,
  transition,
  type GraduationEvent,
  type HabitState,
} from '../lib/habitGraduation'
import './HabitGraduation.css'

const CONFIG = DEFAULT_GRADUATION_CONFIG

export default function HabitGraduation() {
  const reducedMotion = useReducedMotion()

  const [goal, setGoal] = useState<GoalId>('move')
  const [state, setState] = useState<HabitState>('new')
  const [hasAnyWin, setHasAnyWin] = useState(false)
  const [activeDays, setActiveDays] = useState(0)
  const [automatic, setAutomatic] = useState(false)
  const [message, setMessage] = useState<string>('A brand-new little win, ready whenever you are.')

  const goalLabel = useMemo(() => GOALS.find((g) => g.id === goal)?.label ?? 'this little win', [goal])

  const report = useMemo(
    () => evaluateReadiness({ state, hasAnyWin, activeDaysInWindow: activeDays, automaticityConfirmed: automatic }, CONFIG),
    [state, hasAnyWin, activeDays, automatic],
  )

  const available = availableEvents(state)
  const stateCopy = STATE_COPY[state]
  const stateIndex = HABIT_STATES.indexOf(state)

  const move = (event: GraduationEvent) => {
    const result = transition(state, event)
    if (result.ok) {
      setState(result.to)
      setMessage(result.message)
    } else {
      // Not reachable from the enabled buttons, but surfaced honestly if it ever is.
      setMessage(result.reason)
    }
  }

  // PRD §7 — on graduation, "optionally introduce another tiny action". Honestly
  // starts a fresh lifecycle for a different little win; nothing is erased.
  const plantAnother = () => {
    const next = GOALS.find((g) => g.id !== goal) ?? GOALS[0]
    if (next) setGoal(next.id)
    setState('new')
    setHasAnyWin(false)
    setActiveDays(0)
    setAutomatic(false)
    setMessage('A fresh little win, planted. First steps whenever you like.')
  }

  const stepDays = (delta: number) => {
    setActiveDays((d) => Math.max(0, Math.min(CONFIG.windowDays, d + delta)))
  }

  return (
    <div className={`grad stage-${state}${reducedMotion ? ' reduce' : ''}`}>
      <div className="grad-glow" aria-hidden="true" />

      <header className="grad-head">
        <p className="grad-eyebrow">Habit graduation</p>
        <h2 className="grad-title">How “{goalLabel}” grows up</h2>
        <p className="grad-sub">
          A habit moves gently from new to graduated. We ease off the reminders as it takes root — and you stay in
          charge the whole way.
        </p>
      </header>

      {/* ---- which little win ------------------------------------------- */}
      <div className="grad-goals" role="radiogroup" aria-label="Which little win?">
        {GOALS.map((g) => {
          const on = g.id === goal
          return (
            <button
              key={g.id}
              type="button"
              role="radio"
              aria-checked={on}
              className={`grad-goal${on ? ' on' : ''}`}
              onClick={() => setGoal(g.id)}
            >
              {g.label}
            </button>
          )
        })}
      </div>

      {/* ---- the lifecycle rail ----------------------------------------- */}
      <ol className="grad-rail" aria-label="Lifecycle stages">
        {HABIT_STATES.map((s, i) => {
          const done = i < stateIndex
          const current = i === stateIndex
          return (
            <li
              key={s}
              className={`grad-rung${current ? ' current' : ''}${done ? ' done' : ''}`}
              aria-current={current ? 'step' : undefined}
            >
              <span className="grad-dot" aria-hidden="true" />
              <span className="grad-rung-label">{STATE_COPY[s].label}</span>
            </li>
          )
        })}
      </ol>

      {/* ---- current stage ---------------------------------------------- */}
      <section className="grad-stage" aria-live="polite">
        <div className="grad-stage-card">
          <span className="grad-stage-name">{stateCopy.label}</span>
          <p className="grad-stage-summary">{stateCopy.summary}</p>
          <p className="grad-prompting">
            <span className="grad-prompting-tag">Reminders</span>
            {stateCopy.prompting}
          </p>
        </div>
        <p className="grad-message">{message}</p>
      </section>

      {/* ---- evidence feeds the evaluator ------------------------------- */}
      <section className="grad-evidence" aria-label="What we’ve noticed">
        <h3 className="grad-evidence-title">What we’ve gently noticed</h3>

        <label className="grad-toggle">
          <input type="checkbox" checked={hasAnyWin} onChange={(e) => setHasAnyWin(e.target.checked)} />
          <span className="grad-toggle-face" aria-hidden="true" />
          <span className="grad-toggle-text">Done at least once</span>
        </label>

        <div className="grad-stepper" role="group" aria-label="Days active in the last two weeks">
          <span className="grad-stepper-text">
            Active on <strong>{activeDays}</strong> of the last {CONFIG.windowDays} days
            <span className="grad-stepper-need"> · steady at {CONFIG.sustainActiveDays}</span>
          </span>
          <div className="grad-stepper-controls">
            <button type="button" className="grad-step" onClick={() => stepDays(-1)} aria-label="One fewer active day">
              –
            </button>
            <button type="button" className="grad-step" onClick={() => stepDays(1)} aria-label="One more active day">
              +
            </button>
          </div>
        </div>

        <label className="grad-toggle">
          <input type="checkbox" checked={automatic} onChange={(e) => setAutomatic(e.target.checked)} />
          <span className="grad-toggle-face" aria-hidden="true" />
          <span className="grad-toggle-text">It feels automatic to me</span>
        </label>

        <p className={`grad-readiness${report.ready ? ' ready' : ''}`} aria-live="polite">
          {report.rationale}
        </p>
      </section>

      {/* ---- the moves (valid edges enabled; invalid shown, explained) --- */}
      <section className="grad-moves" aria-label="Next moves">
        {GRADUATION_EVENTS.map((event) => {
          const isValid = available.includes(event)
          const direction = EVENT_DIRECTION[event]
          // Advance moves wait for earned evidence; user-choice returns are always open.
          const unlocked = isValid && (direction === 'return' || report.suggestedEvent === event)
          const rejected = transition(state, event)
          const hint = isValid
            ? direction === 'advance'
              ? unlocked
                ? 'Ready when you are'
                : 'A little more practice first'
              : 'Your choice, any time'
            : !rejected.ok
              ? rejected.reason
              : ''
          return (
            <button
              key={event}
              type="button"
              className={`grad-move dir-${direction}${unlocked ? ' unlocked' : ''}${!isValid ? ' na' : ''}`}
              disabled={!unlocked}
              aria-disabled={!unlocked}
              onClick={() => move(event)}
            >
              <span className="grad-move-label">{EVENT_LABEL[event]}</span>
              <span className="grad-move-hint">{hint}</span>
            </button>
          )
        })}
      </section>

      {state === 'graduated' ? (
        <div className="grad-coda">
          <p className="grad-coda-line">
            This one runs on its own now. Keep it, or plant another little win alongside it — entirely up to you.
          </p>
          <button type="button" className="grad-plant" onClick={plantAnother}>
            Plant another little win
          </button>
        </div>
      ) : null}

      <p className="grad-foot">
        You’re always in charge. Stepping back to more support is a choice, not a setback — and every day you’ve logged
        stays exactly where it is.
      </p>
    </div>
  )
}
