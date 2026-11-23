/**
 * TASK-035 — Habit automaticity survey (interactive surface).
 *
 * The instrument, its versioned attribution, the scoring, the optional/partial-draft
 * semantics and the baseline↔follow-up comparison all live in the pure, fully-tested
 * engine (`src/lib/automaticitySurvey.ts`, with deterministic cases in
 * `automaticitySurvey.test.ts`). This surface makes the reflection takeable:
 *
 *   - It renders the validated SRBAI (Gardner et al., 2012) with its four items, the
 *     1–7 agreement scale, and a visible instrument + version + attribution footer — so
 *     a reviewer can see the provenance that gets stored with every response.
 *   - Completion is strictly optional: a "Skip for now" control is always present, a
 *     score only appears once all four items are answered, and a partial reflection is
 *     never treated as a failure.
 *   - After a baseline and a follow-up have been saved, it shows the honest delta from
 *     `compareBaselineToLatest`, framed as a behavioural reflection — never a health
 *     result (CLAUDE.md §3).
 *
 * Standards: Zero-Guilt (§1) — warm paper + calm-green, no red/penalty/streak chrome;
 * every surfaced string clears the shared `isGuiltFree` guard. A11y — each item is a
 * labelled radiogroup, status changes are announced in an `aria-live` region, controls
 * have visible focus rings, and a dedicated `prefers-reduced-motion` block disables motion.
 */

import { useEffect, useState } from 'react'
import { GOALS, useReducedMotion, type GoalId } from '../flows/flowData'
import {
  BAND_COPY,
  SRBAI,
  SURVEY_PHASES,
  answeredCount,
  automaticityBand,
  buildResponse,
  compareBaselineToLatest,
  getAutomaticity,
  clearResponses,
  isComplete,
  itemSentence,
  recordResponse,
  scoreResponse,
  stemFor,
  subscribeAutomaticity,
  type AutomaticityState,
  type SurveyPhase,
} from '../lib/automaticitySurvey'
import './AutomaticitySurvey.css'

/** Subscribe a component to the live survey store. */
function useAutomaticity(): AutomaticityState {
  const [state, setState] = useState<AutomaticityState>(getAutomaticity)
  useEffect(() => subscribeAutomaticity(setState), [])
  return state
}

/** A warm, non-pressuring date label. */
function dateLabel(ms: number): string {
  try {
    return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(
      new Date(ms),
    )
  } catch {
    return 'saved'
  }
}

const PHASE_LABEL: Record<SurveyPhase, string> = {
  baseline: 'Baseline',
  follow_up: 'Follow-up',
}

/** A number formatted to one decimal place for display. */
function oneDp(value: number): string {
  return (Math.round(value * 10) / 10).toFixed(1)
}

export default function AutomaticitySurvey() {
  const reducedMotion = useReducedMotion()
  const state = useAutomaticity()

  const [phase, setPhase] = useState<SurveyPhase>('baseline')
  const [goal, setGoal] = useState<GoalId>('move')
  const [answers, setAnswers] = useState<Record<string, number>>({})

  // A transient draft used only for live completeness/scoring — never stored.
  const draft = buildResponse({ responseId: 'draft', phase, answers, completedAt: 0, goalCategory: goal, instrument: SRBAI })
  const complete = isComplete(draft)
  const score = scoreResponse(draft)
  const band = automaticityBand(score)
  const answered = answeredCount(answers)

  const comparison = compareBaselineToLatest(state)
  const { min, max } = SRBAI.scale
  const scalePoints: number[] = []
  for (let v = min; v <= max; v += 1) scalePoints.push(v)
  const lowAnchor = SRBAI.scale.anchors[0]
  const highAnchor = SRBAI.scale.anchors[SRBAI.scale.anchors.length - 1]

  function save() {
    if (!complete) return
    recordResponse(phase, answers, goal, SRBAI)
    setAnswers({})
  }

  function skip() {
    setAnswers({})
  }

  return (
    <div className={`as${reducedMotion ? ' reduce' : ''}`}>
      <div className="as-glow" aria-hidden="true" />

      <header className="as-head">
        <p className="as-eyebrow">A gentle check-in</p>
        <h2 className="as-title">How automatic does it feel?</h2>
        <p className="as-sub">
          This is a reflection, not a test — there is no score to pass and nothing is ever shared. Taking it is completely
          optional. You can stop at any point and come back whenever you like.
        </p>
      </header>

      {/* ---- phase + behaviour pickers --------------------------------- */}
      <div className="as-pickers">
        <fieldset className="as-field">
          <legend className="as-legend">When is this?</legend>
          <div className="as-chips" role="radiogroup" aria-label="Survey phase">
            {SURVEY_PHASES.map((p) => (
              <button
                key={p}
                type="button"
                role="radio"
                aria-checked={phase === p}
                className={`as-chip${phase === p ? ' on' : ''}`}
                onClick={() => setPhase(p)}
              >
                {PHASE_LABEL[p]}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="as-field">
          <legend className="as-legend">Which little win?</legend>
          <div className="as-chips" role="radiogroup" aria-label="Behaviour">
            {GOALS.map((g) => (
              <button
                key={g.id}
                type="button"
                role="radio"
                aria-checked={goal === g.id}
                className={`as-chip${goal === g.id ? ' on' : ''}`}
                onClick={() => setGoal(g.id)}
              >
                {g.label}
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      <p className="as-stem">
        <span className="as-stem-lead">Thinking about:</span> <strong>{stemFor(goal, SRBAI)}</strong>
      </p>
      <p className="as-scale-hint">Rate each line from “{lowAnchor?.label}” to “{highAnchor?.label}”.</p>

      {/* ---- the four SRBAI items -------------------------------------- */}
      <ol className="as-items">
        {SRBAI.items.map((item) => {
          const current = answers[item.id]
          return (
            <li key={item.id} className="as-item">
              <fieldset className="as-item-field">
                <legend className="as-item-legend">
                  …{item.text}
                  <span className="as-sr">{itemSentence(goal, item, SRBAI)}</span>
                </legend>
                <div className="as-likert" role="radiogroup" aria-label={itemSentence(goal, item, SRBAI)}>
                  {scalePoints.map((value) => (
                    <button
                      key={value}
                      type="button"
                      role="radio"
                      aria-checked={current === value}
                      aria-label={
                        value === min ? `${value} — ${lowAnchor?.label}` : value === max ? `${value} — ${highAnchor?.label}` : `${value}`
                      }
                      className={`as-dot${current === value ? ' on' : ''}`}
                      onClick={() => setAnswers((prev) => ({ ...prev, [item.id]: value }))}
                    >
                      {value}
                    </button>
                  ))}
                </div>
                <div className="as-likert-anchors" aria-hidden="true">
                  <span>{lowAnchor?.label}</span>
                  <span>{highAnchor?.label}</span>
                </div>
              </fieldset>
            </li>
          )
        })}
      </ol>

      {/* ---- live score (only once complete) + status ------------------ */}
      <div className="as-score" role="status" aria-live="polite">
        {complete && score !== null && band ? (
          <>
            <span className="as-score-value">{oneDp(score)}<span className="as-score-max"> / {max}</span></span>
            <span className={`as-score-band band-${band}`}>{BAND_COPY[band].label}</span>
            <span className="as-score-note">{BAND_COPY[band].note}</span>
          </>
        ) : (
          <span className="as-score-pending">
            A score appears once all four items are answered. ({answered} of {SRBAI.items.length} so far)
          </span>
        )}
      </div>

      {/* ---- save / skip (completion is optional) ---------------------- */}
      <div className="as-actions">
        <button type="button" className="as-save" onClick={save} disabled={!complete}>
          Save this reflection
        </button>
        <button type="button" className="as-skip" onClick={skip}>
          Skip for now
        </button>
      </div>
      <p className="as-integrity">
        Nothing here is a health result — it only describes how automatic the behaviour feels.
      </p>

      {/* ---- baseline vs follow-up comparison -------------------------- */}
      <section className="as-history" aria-label="Your saved reflections">
        <h3 className="as-h3">Baseline &amp; follow-up</h3>
        {state.responses.length === 0 ? (
          <p className="as-empty">No reflections saved yet. Save a baseline now, then a follow-up later to see how it changes.</p>
        ) : (
          <>
            <ul className="as-saved">
              {[...state.responses]
                .sort((a, b) => a.completedAt - b.completedAt)
                .map((r) => {
                  const s = scoreResponse(r, SRBAI)
                  return (
                    <li key={r.responseId} className="as-saved-row">
                      <span className={`as-saved-phase phase-${r.phase}`}>{PHASE_LABEL[r.phase]}</span>
                      <span className="as-saved-score">{s !== null ? `${oneDp(s)} / ${max}` : 'in progress'}</span>
                      <span className="as-saved-when">{dateLabel(r.completedAt)}</span>
                    </li>
                  )
                })}
            </ul>
            {comparison && comparison.comparable && comparison.delta !== null ? (
              <div className="as-compare">
                <p className="as-compare-line">
                  <span className={`as-delta dir-${comparison.direction}`}>
                    {comparison.direction === 'up' ? '+' : comparison.direction === 'down' ? '−' : '±'}
                    {oneDp(Math.abs(comparison.delta))}
                  </span>
                  <span className="as-compare-text">
                    from your baseline ({oneDp(comparison.baselineScore ?? 0)}) to your latest follow-up (
                    {oneDp(comparison.followUpScore ?? 0)})
                  </span>
                </p>
                <p className="as-compare-note">{comparison.note}</p>
              </div>
            ) : comparison && !comparison.comparable ? (
              <p className="as-compare-note">{comparison.reason}</p>
            ) : (
              <p className="as-compare-note">Save a follow-up later to compare it with your baseline.</p>
            )}
            <button type="button" className="as-reset" onClick={clearResponses}>
              Clear saved reflections
            </button>
          </>
        )}
      </section>

      {/* ---- instrument provenance (version + attribution) ------------- */}
      <section className="as-attribution" aria-label="Instrument and attribution">
        <h3 className="as-h3">Instrument &amp; version</h3>
        <dl className="as-attr-grid">
          <div>
            <dt>Instrument</dt>
            <dd>
              {SRBAI.attribution.instrumentName} <code>{SRBAI.id}</code>
            </dd>
          </div>
          <div>
            <dt>Version</dt>
            <dd>
              <code>{SRBAI.version}</code> · evidence grade {SRBAI.attribution.evidenceGrade} ·{' '}
              {SRBAI.attribution.validated ? 'validated' : 'exploratory'}
            </dd>
          </div>
          <div>
            <dt>Scoring</dt>
            <dd>{SRBAI.scoringNote}</dd>
          </div>
          <div>
            <dt>Citation</dt>
            <dd className="as-cite">{SRBAI.attribution.citation}</dd>
          </div>
          <div>
            <dt>Reproduction</dt>
            <dd>{SRBAI.attribution.licenseNote}</dd>
          </div>
        </dl>
        <p className="as-attr-foot">
          Every saved reflection stores this instrument id, version and citation with it, so a later comparison always
          knows exactly which instrument produced the numbers.
        </p>
      </section>
    </div>
  )
}
