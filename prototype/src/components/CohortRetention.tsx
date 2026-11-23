/**
 * TASK-034 — Cohort retention dashboard (interactive surface).
 *
 * The cohort grouping, the D1/D7/D30/D90 app-vs-behavior arithmetic, the maturity
 * rule and the documented definitions all live in the pure, fully-tested engine
 * (`src/lib/cohortRetention.ts`, with deterministic cases in `cohortRetention.test.ts`).
 * This surface makes the dashboard observable:
 *
 *   - It renders the SAME `SAMPLE_RETENTION_DATASET` the test suite verifies, through
 *     the same `buildRetention` engine and the same fixed `SAMPLE_AS_OF_DAY`, so the
 *     numbers on screen are real, checked arithmetic — honestly labelled an
 *     illustrative dataset, never passed off as a live population (CLAUDE.md §3; a
 *     real cohort needs a real audience observed over real calendar time, which — like
 *     the blocked research tasks — an overnight build does not have).
 *   - It shows app and behavior retention side by side (PRD §7), marks every immature
 *     horizon as "maturing" rather than a low score, and compares the mature rates to
 *     the PRD §7 hypothesis targets (labelled hypotheses to validate, not guarantees).
 *   - It renders the documented `COHORT_DEFINITIONS` as a table.
 *
 * Standards: Zero-Guilt (§1) — warm paper + calm-green, no red/penalty/streak chrome;
 * an open window is a soft "maturing" tone, never a failure; every surfaced engine
 * string clears the shared `isGuiltFree` guard. A11y — the breakdown is real
 * `<table>`s with scoped headers, the headline is announced in an `aria-live` region,
 * the metric filter is a labelled radiogroup with visible focus rings, and a dedicated
 * `prefers-reduced-motion` block (+ `.reduce` class) disables motion. Fully
 * deterministic: no clock read, so nothing to hoist out of render.
 */

import { useState } from 'react'
import { useReducedMotion } from '../flows/flowData'
import {
  COHORT_DEFINITIONS,
  METRIC_LABEL,
  RETENTION_HORIZONS,
  SAMPLE_AS_OF_DAY,
  SAMPLE_RETENTION_DATASET,
  buildRetention,
  formatRate,
  hypothesisTarget,
  type CohortRow,
  type OverallCell,
  type RetentionHorizon,
  type RetentionMetric,
} from '../lib/cohortRetention'
import './CohortRetention.css'

/** Which metric(s) the breakdown tables show. */
type MetricFilter = 'both' | RetentionMetric

const METRIC_FILTERS: readonly { id: MetricFilter; label: string }[] = [
  { id: 'both', label: 'Both' },
  { id: 'app', label: 'App only' },
  { id: 'behavior', label: 'Behavior only' },
]

/** The day-N heading label. */
function horizonLabel(h: RetentionHorizon): string {
  return `Day ${h}`
}

/** A single overall KPI card for one metric + horizon. */
function OverallCard({ cell }: { cell: OverallCell }) {
  const target = hypothesisTarget(cell.metric, cell.horizon)
  const onTrack = cell.rate !== null && target !== null && cell.rate >= target.target
  return (
    <div className={`cr-kpi${cell.rate === null ? ' maturing' : ''}${onTrack ? ' on-track' : ''}`}>
      <span className="cr-kpi-h">{horizonLabel(cell.horizon)}</span>
      <span className="cr-kpi-rate">{formatRate(cell.rate)}</span>
      {cell.rate === null ? (
        <span className="cr-kpi-note">maturing · no cohort has reached day {cell.horizon} yet</span>
      ) : (
        <span className="cr-kpi-note">
          {cell.retained}/{cell.usersIncluded} users ·{' '}
          {cell.matureCohorts} mature {cell.matureCohorts === 1 ? 'cohort' : 'cohorts'}
        </span>
      )}
      {target !== null && (
        <span className={`cr-kpi-target${onTrack ? ' met' : ''}`}>
          {onTrack ? '✓ ' : ''}hypothesis {formatRate(target.target)}
        </span>
      )}
    </div>
  )
}

/** One metric's breakdown table: a row per cohort, a column per horizon. */
function CohortTable({
  metric,
  cohorts,
}: {
  metric: RetentionMetric
  cohorts: readonly CohortRow[]
}) {
  return (
    <table className="cr-table">
      <caption className="cr-caption">{METRIC_LABEL[metric]} by cohort</caption>
      <thead>
        <tr>
          <th scope="col">Cohort</th>
          {RETENTION_HORIZONS.map((h) => (
            <th scope="col" key={h}>
              {horizonLabel(h)}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {cohorts.map((cohort) => {
          const cells = metric === 'app' ? cohort.app : cohort.behavior
          return (
            <tr key={cohort.cohortDay}>
              <th scope="row" className="cr-cohort-cell">
                <span className="cr-cohort-when">started {cohort.daysElapsed} days ago</span>
                <span className="cr-cohort-n">n = {cohort.size}</span>
              </th>
              {cells.map((cell) => (
                <td key={cell.horizon} className={cell.mature ? 'cr-cell' : 'cr-cell maturing'}>
                  {cell.mature ? (
                    <span className="cr-cell-rate">{formatRate(cell.rate)}</span>
                  ) : (
                    <span className="cr-cell-maturing">maturing</span>
                  )}
                  {cell.mature && (
                    <span className="cr-cell-frac">
                      {cell.retained}/{cell.size}
                    </span>
                  )}
                </td>
              ))}
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

export default function CohortRetention() {
  const reducedMotion = useReducedMotion()
  const [filter, setFilter] = useState<MetricFilter>('both')

  // The exact dataset + as-of day the test suite verifies — real, checked arithmetic.
  const report = buildRetention(SAMPLE_RETENTION_DATASET, SAMPLE_AS_OF_DAY)

  const showApp = filter === 'both' || filter === 'app'
  const showBehavior = filter === 'both' || filter === 'behavior'

  // A concise, honest spoken summary of the outcome that matters most (behavior).
  const behaviorD1 = report.overall.behavior[0]
  const behaviorD7 = report.overall.behavior[1]
  const summary =
    `Across ${report.userCount} illustrative users in ${report.cohorts.length} cohorts, ` +
    `behavior retention is ${formatRate(behaviorD1?.rate ?? null)} at day 1` +
    (behaviorD7 && behaviorD7.rate !== null
      ? ` and ${formatRate(behaviorD7.rate)} at day 7`
      : ` and still maturing at day 7`) +
    `. Open windows are shown as maturing, never as a low score.`

  return (
    <div className={`cr${reducedMotion ? ' reduce' : ''}`}>
      <div className="cr-glow" aria-hidden="true" />

      <header className="cr-head">
        <p className="cr-eyebrow">Retention instrumentation</p>
        <h2 className="cr-title">Cohort retention</h2>
        <p className="cr-sub">
          App opens and real-world little wins, measured separately and side by side. Behavior retention — people still
          doing the action — is the one that matters.
        </p>
      </header>

      <p className="cr-honest">
        Illustrative dataset — the exact figures the test suite verifies, rendered through the real engine so the
        arithmetic on screen is checked. A live cohort needs a real audience observed over real calendar days; these
        are sample users, clearly labelled, never a live population.
      </p>

      {/* ---- overall KPIs, per metric ----------------------------------- */}
      <section className="cr-overall" aria-label="Overall retention">
        {showApp && (
          <div className="cr-metric-block">
            <h3 className="cr-h3">{METRIC_LABEL.app}</h3>
            <div className="cr-kpis">
              {report.overall.app.map((cell) => (
                <OverallCard key={cell.horizon} cell={cell} />
              ))}
            </div>
          </div>
        )}
        {showBehavior && (
          <div className="cr-metric-block">
            <h3 className="cr-h3">{METRIC_LABEL.behavior}</h3>
            <div className="cr-kpis">
              {report.overall.behavior.map((cell) => (
                <OverallCard key={cell.horizon} cell={cell} />
              ))}
            </div>
          </div>
        )}
      </section>

      <p className="cr-status" role="status" aria-live="polite">
        {summary}
      </p>

      {/* ---- metric filter ---------------------------------------------- */}
      <div className="cr-filter" role="radiogroup" aria-label="Which metric to break down">
        {METRIC_FILTERS.map((option) => (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={filter === option.id}
            className={`cr-chip${filter === option.id ? ' on' : ''}`}
            onClick={() => setFilter(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* ---- per-cohort breakdown --------------------------------------- */}
      <section className="cr-breakdown" aria-label="Retention by cohort">
        {showApp && <CohortTable metric="app" cohorts={report.cohorts} />}
        {showBehavior && <CohortTable metric="behavior" cohorts={report.cohorts} />}
      </section>

      {/* ---- documented definitions ------------------------------------- */}
      <section className="cr-defs" aria-label="Cohort definitions">
        <h3 className="cr-h3">Cohort definitions</h3>
        <table className="cr-table cr-def-table">
          <thead>
            <tr>
              <th scope="col">Term</th>
              <th scope="col">Definition</th>
            </tr>
          </thead>
          <tbody>
            {COHORT_DEFINITIONS.map((def) => (
              <tr key={def.term}>
                <th scope="row">{def.term}</th>
                <td>{def.definition}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}
