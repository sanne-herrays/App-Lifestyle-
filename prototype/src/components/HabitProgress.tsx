/**
 * TASK-032 — Habit progress visualization (interactive surface).
 *
 * The windowing, completed-opportunity / recovery flags, the never-erase totals
 * and the guilt-free copy all live in the pure, fully-tested engine
 * (`src/lib/progressViz.ts`, with deterministic cases in `progressViz.test.ts`).
 * This surface binds that engine to the real TASK-026 completion ledger so the
 * picture is visible and explorable:
 *
 *   - Filter by little win (reusing the shared `GOALS` chips, plus "All") and the
 *     grid rebuilds from exactly the matching ledger events.
 *   - Fourteen calm day cells render oldest → today. Completed days glow; a return
 *     after a gap carries a warm "welcome back" accent; open days are simply open —
 *     never red, never a broken streak.
 *   - The headline totals celebrate all-time progress, which can only grow.
 *   - An honest summary is rendered both visibly and into a visually-hidden live
 *     region, so the whole picture is legible to a screen reader.
 *
 * Because a fresh prototype ledger is empty, a clearly-labelled "sample history"
 * toggle feeds a *display-only* set of events into the pure engine so a reviewer
 * can see completed + recovery states. It is never written to the real ledger (the
 * same honest-preview stance the approved TASK-027 restart surface uses).
 *
 * Standards: Zero-Guilt (§1) — warm paper + calm-green palette with a soft-gold
 * recovery accent, no red/penalty/streak chrome anywhere. A11y — the filter is a
 * native `radiogroup`, the grid is a labelled list whose cells carry guilt-free
 * labels, the summary lives in an `aria-live` region, and a dedicated
 * `prefers-reduced-motion` block disables motion.
 */

import { useMemo, useState } from 'react'
import { GOALS, type GoalId, useReducedMotion } from '../flows/flowData'
import { LEDGER_SCHEMA_VERSION, type CompletionEvent } from '../lib/ledger'
import { DAY_MS } from '../lib/restart'
import { buildProgress, type DayState } from '../lib/progressViz'
import { useLedgerEvents } from './useLedgerEvents'
import './HabitProgress.css'

type Filter = 'all' | GoalId

/** Human label for each day state, for the visible legend / tooltip (guilt-free). */
const STATE_CAPTION: Record<DayState, string> = {
  completed: 'Little win',
  recovery: 'Gentle return',
  today: 'Today — open',
  open: 'Open day',
  'before-start': 'Before you began',
}

/**
 * A display-only sample history, anchored to `now`, so the states are visible on a
 * fresh ledger. Never written to the real ledger — honestly labelled in the UI.
 * The shape spans twelve days with two gaps and two returns, across goals.
 */
function sampleEvents(now: number): readonly CompletionEvent[] {
  const plan: ReadonlyArray<{ offset: number; goalId: GoalId; title: string }> = [
    { offset: 12, goalId: 'move', title: 'Two minutes of easy movement' },
    { offset: 11, goalId: 'calm', title: 'One minute of slow breathing' },
    { offset: 10, goalId: 'move', title: 'Two minutes of easy movement' },
    // a two-day gap …
    { offset: 7, goalId: 'outside', title: 'Two minutes outside' }, // → a gentle return
    // a three-day gap …
    { offset: 3, goalId: 'water', title: 'A glass of water' }, // → a gentle return
    { offset: 2, goalId: 'calm', title: 'One minute of slow breathing' },
    { offset: 1, goalId: 'move', title: 'Two minutes of easy movement' },
  ]
  return plan.map((entry, index) => ({
    id: `sample-${index}`,
    clientKey: `sample-${index}`,
    goalId: entry.goalId,
    actionTitle: entry.title,
    variant: 'full',
    completedAt: now - entry.offset * DAY_MS + 12 * 60 * 60 * 1000, // local-noon-ish
    syncState: 'synced',
    syncedAt: now,
    schemaVersion: LEDGER_SCHEMA_VERSION,
  }))
}

export default function HabitProgress() {
  const reducedMotion = useReducedMotion()
  const realEvents = useLedgerEvents()
  const [filter, setFilter] = useState<Filter>('all')
  const [showSample, setShowSample] = useState(false)

  // Captured once, outside render, so the clock never changes between renders.
  const [now] = useState(() => Date.now())

  const sourceEvents = showSample ? sampleEvents(now) : realEvents
  const events = useMemo(
    () => (filter === 'all' ? sourceEvents : sourceEvents.filter((event) => event.goalId === filter)),
    [sourceEvents, filter],
  )

  const view = useMemo(() => buildProgress(events, now), [events, now])

  return (
    <div className={`hp${reducedMotion ? ' reduce' : ''}`}>
      <div className="hp-glow" aria-hidden="true" />

      <header className="hp-head">
        <p className="hp-eyebrow">Your progress</p>
        <h2 className="hp-title">{view.headline}</h2>
        <p className="hp-sub">
          A calm look at the last {view.windowDays} days. Showing up is the win — and nothing you’ve already done ever
          disappears.
        </p>
      </header>

      {/* ---- filter by little win -------------------------------------- */}
      <div className="hp-filter" role="radiogroup" aria-label="Show progress for">
        <button
          type="button"
          role="radio"
          aria-checked={filter === 'all'}
          className={`hp-chip${filter === 'all' ? ' on' : ''}`}
          onClick={() => setFilter('all')}
        >
          All wins
        </button>
        {GOALS.map((goal) => {
          const on = filter === goal.id
          return (
            <button
              key={goal.id}
              type="button"
              role="radio"
              aria-checked={on}
              className={`hp-chip${on ? ' on' : ''}`}
              onClick={() => setFilter(goal.id)}
            >
              {goal.label}
            </button>
          )
        })}
      </div>

      {/* ---- all-time totals (never erased) ---------------------------- */}
      <div className="hp-totals">
        <div className="hp-total">
          <span className="hp-total-num">{view.completedOpportunities}</span>
          <span className="hp-total-label">
            completed {view.completedOpportunities === 1 ? 'day' : 'days'} this fortnight
          </span>
        </div>
        <div className="hp-total">
          <span className="hp-total-num">{view.recoveries}</span>
          <span className="hp-total-label">gentle {view.recoveries === 1 ? 'return' : 'returns'}</span>
        </div>
        <div className="hp-total hp-total-lifetime">
          <span className="hp-total-num">{view.totalWins}</span>
          <span className="hp-total-label">little {view.totalWins === 1 ? 'win' : 'wins'}, all time</span>
        </div>
      </div>

      {/* ---- the grid -------------------------------------------------- */}
      <ul className="hp-grid" aria-label={`Daily progress for the last ${view.windowDays} days`}>
        {view.days.map((day) => (
          <li
            key={day.dayNumber}
            className={`hp-cell state-${day.state}${day.isToday ? ' is-today' : ''}`}
            title={day.label}
          >
            <span className="hp-cell-fill" aria-hidden="true">
              {day.count > 1 ? <span className="hp-cell-count">{day.count}</span> : null}
            </span>
            <span className="hp-sr">{day.label}</span>
          </li>
        ))}
      </ul>

      {/* ---- legend ---------------------------------------------------- */}
      <ul className="hp-legend" aria-hidden="true">
        {(['completed', 'recovery', 'today', 'open'] as const).map((state) => (
          <li key={state} className="hp-legend-item">
            <span className={`hp-swatch state-${state}`} />
            {STATE_CAPTION[state]}
          </li>
        ))}
      </ul>

      {/* ---- honest summary (visible + live region) -------------------- */}
      <p className="hp-summary" role="status" aria-live="polite">
        {view.summary}
      </p>
      <p className="hp-encourage">{view.encouragement}</p>

      {/* ---- display-only sample toggle -------------------------------- */}
      <label className="hp-sample">
        <input type="checkbox" checked={showSample} onChange={(event) => setShowSample(event.target.checked)} />
        <span>
          Preview with sample history
          <span className="hp-sample-note">Illustrative only — never saved to your ledger.</span>
        </span>
      </label>
    </div>
  )
}
