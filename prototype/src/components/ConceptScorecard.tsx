import { useMemo, useRef, useState } from 'react'
import './ConceptScorecard.css'

/**
 * TASK-014 — Interactive concept evaluation scorecard.
 *
 * A standalone, weighted scoring tool for the three independent concepts from
 * strategy.md §3 (Tiny Win / Growing World / Everyday Adventures), scored 1–5 on
 * the seven weighted criteria from the strategy.md "Concept selection scorecard".
 * Weights sum to 100; each concept's total recomputes live onto a 0–100 scale
 * (percentage of the maximum achievable weighted score).
 *
 * The three non-negotiable gates from the same section (credible behaviour-change
 * evidence, meaningful desirability, safe/trustworthy health guidance) are modelled
 * as overrides: a concept failing any gate is held regardless of its weighted total.
 */

type ConceptId = 'tiny-win' | 'growing-world' | 'everyday-adventures'

interface Concept {
  id: ConceptId
  name: string
  tagline: string
  /** Hypothesis under test, verbatim-in-spirit from strategy.md §3. */
  hypothesis: string
  accent: string
}

interface Criterion {
  id: string
  label: string
  weight: number
  blurb: string
}

type GateId = 'evidence' | 'desirability' | 'safety'

interface Gate {
  id: GateId
  label: string
  blurb: string
}

const CONCEPTS: readonly Concept[] = [
  {
    id: 'tiny-win',
    name: 'The Tiny Win',
    tagline: 'One absurdly easy action a day.',
    hypothesis: 'Reduced choice and effort increase consistency.',
    accent: '#E09A38',
  },
  {
    id: 'growing-world',
    name: 'The Growing World',
    tagline: 'Actions grow a beautiful, living world.',
    hypothesis: 'Attachment and visual progress improve repetition.',
    accent: '#5F9E7E',
  },
  {
    id: 'everyday-adventures',
    name: 'Everyday Adventures',
    tagline: 'Tiny missions woven into ordinary life.',
    hypothesis: 'Novelty and situational relevance lower resistance.',
    accent: '#DE6A80',
  },
]

// Weights are the strategy.md scorecard, in percentage points. They sum to 100.
const CRITERIA: readonly Criterion[] = [
  { id: 'desirability', label: 'Desirability', weight: 20, blurb: '"I want this." Pull before persuasion.' },
  { id: 'behavioral', label: 'Behavioral effectiveness', weight: 20, blurb: 'Drives real action, not app opens.' },
  { id: 'differentiation', label: 'Differentiation', weight: 15, blurb: 'Unmistakably not another tracker.' },
  { id: 'ux', label: 'User experience', weight: 15, blurb: 'Effortless, under two seconds, delightful.' },
  { id: 'retention', label: 'Retention potential', weight: 10, blurb: 'Comes back without nagging.' },
  { id: 'economics', label: 'Economics', weight: 10, blurb: 'A business that can sustain the craft.' },
  { id: 'craft', label: 'Apple-level craft', weight: 10, blurb: 'Feature-worthy polish and originality.' },
]

const GATES: readonly Gate[] = [
  { id: 'evidence', label: 'Credible evidence', blurb: 'Real behaviour-change grounding.' },
  { id: 'desirability', label: 'Meaningful desire', blurb: 'People genuinely want it.' },
  { id: 'safety', label: 'Safe guidance', blurb: 'Trustworthy, non-clinical health framing.' },
]

const WEIGHT_TOTAL = CRITERIA.reduce((sum, c) => sum + c.weight, 0)
const NEUTRAL = 3

type ScoreMap = Record<ConceptId, Record<string, number>>
type GateMap = Record<ConceptId, Record<GateId, boolean>>

function buildInitialScores(): ScoreMap {
  const map = {} as ScoreMap
  for (const concept of CONCEPTS) {
    const row: Record<string, number> = {}
    for (const criterion of CRITERIA) row[criterion.id] = NEUTRAL
    map[concept.id] = row
  }
  return map
}

function buildInitialGates(): GateMap {
  const map = {} as GateMap
  for (const concept of CONCEPTS) {
    map[concept.id] = { evidence: true, desirability: true, safety: true }
  }
  return map
}

/** Weighted total on a 0–100 scale: share of the maximum achievable score. */
function computeTotal(row: Record<string, number> | undefined): number {
  if (!row) return 0
  let acc = 0
  for (const criterion of CRITERIA) {
    const score = row[criterion.id] ?? 0
    acc += (score / 5) * criterion.weight
  }
  return acc // 0..WEIGHT_TOTAL, and WEIGHT_TOTAL === 100
}

interface ScoreSelectorProps {
  value: number
  label: string
  accent: string
  onChange: (value: number) => void
}

/** Accessible 1–5 selector: an ARIA radiogroup with roving tabindex + arrow keys. */
function ScoreSelector({ value, label, accent, onChange }: ScoreSelectorProps) {
  const groupRef = useRef<HTMLDivElement>(null)

  const move = (next: number) => {
    const clamped = Math.min(5, Math.max(1, next))
    onChange(clamped)
    const btn = groupRef.current?.querySelector<HTMLButtonElement>(
      `[data-score="${clamped}"]`,
    )
    btn?.focus()
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        event.preventDefault()
        move(value + 1)
        break
      case 'ArrowLeft':
      case 'ArrowDown':
        event.preventDefault()
        move(value - 1)
        break
      case 'Home':
        event.preventDefault()
        move(1)
        break
      case 'End':
        event.preventDefault()
        move(5)
        break
      default:
        break
    }
  }

  return (
    <div
      className="pips"
      role="radiogroup"
      aria-label={label}
      ref={groupRef}
      onKeyDown={onKeyDown}
      style={{ ['--c']: accent } as React.CSSProperties}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} out of 5`}
          data-score={n}
          tabIndex={value === n ? 0 : -1}
          className={`pip${n <= value ? ' on' : ''}${value === n ? ' cur' : ''}`}
          onClick={() => onChange(n)}
        >
          <span className="pip-dot" />
        </button>
      ))}
      <span className="pip-val" aria-hidden="true">
        {value}
      </span>
    </div>
  )
}

interface RingProps {
  total: number
  accent: string
  held: boolean
}

function Ring({ total, accent, held }: RingProps) {
  const r = 34
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - total / 100)
  return (
    <div className={`ring${held ? ' held' : ''}`} style={{ ['--c']: accent } as React.CSSProperties}>
      <svg viewBox="0 0 80 80" width="80" height="80" aria-hidden="true">
        <circle className="ring-track" cx="40" cy="40" r={r} />
        <circle
          className="ring-fill"
          cx="40"
          cy="40"
          r={r}
          style={{ strokeDasharray: circ, strokeDashoffset: offset }}
        />
      </svg>
      <span className="ring-num" key={Math.round(total)}>
        {Math.round(total)}
      </span>
    </div>
  )
}

export default function ConceptScorecard() {
  const [scores, setScores] = useState<ScoreMap>(buildInitialScores)
  const [gates, setGates] = useState<GateMap>(buildInitialGates)

  const setScore = (conceptId: ConceptId, criterionId: string, value: number) => {
    setScores((prev) => ({
      ...prev,
      [conceptId]: { ...prev[conceptId], [criterionId]: value },
    }))
  }

  const toggleGate = (conceptId: ConceptId, gateId: GateId) => {
    setGates((prev) => ({
      ...prev,
      [conceptId]: { ...prev[conceptId], [gateId]: !prev[conceptId][gateId] },
    }))
  }

  const reset = () => {
    setScores(buildInitialScores())
    setGates(buildInitialGates())
  }

  const results = useMemo(() => {
    return CONCEPTS.map((concept) => {
      const row = gates[concept.id]
      const held = GATES.some((gate) => !(row[gate.id] ?? true))
      return {
        id: concept.id,
        total: computeTotal(scores[concept.id]),
        held,
      }
    })
  }, [scores, gates])

  const eligible = results.filter((r) => !r.held)
  const topTotal = eligible.length
    ? Math.max(...eligible.map((r) => r.total))
    : -1
  const leaderIds = new Set(
    eligible.filter((r) => r.total === topTotal).map((r) => r.id),
  )
  const totalById = new Map(results.map((r) => [r.id, r]))

  return (
    <section className="scorecard" aria-labelledby="sc-title">
      <div className="sc-glow" aria-hidden="true" />

      <header className="sc-head">
        <p className="sc-eyebrow">HerRays · Concept Evaluation</p>
        <h1 id="sc-title">Which little win wins?</h1>
        <p className="sc-lede">
          Score each of the three directions 1–5 against the seven weighted
          criteria. Totals recompute live onto a 0–100 scale. Start from a
          neutral&nbsp;3 and move each score as your evidence lands.
        </p>
        <div className="sc-head-tools">
          <span className="sc-weightsum" title="Criterion weights must sum to 100">
            Weights balanced
            <strong>
              {WEIGHT_TOTAL}
              <span className="sc-weightsum-max"> / 100</span>
            </strong>
            {WEIGHT_TOTAL === 100 ? <span className="sc-check" aria-label="valid">✓</span> : null}
          </span>
          <button type="button" className="sc-reset" onClick={reset}>
            Reset to neutral
          </button>
        </div>
      </header>

      <div className="sc-grid" role="table" aria-label="Concept evaluation scorecard">
        {/* Concept header row */}
        <div className="sc-row sc-row--head" role="row">
          <div className="sc-cell sc-cell--crit sc-crit-head" role="columnheader">
            <span className="sc-crit-head-label">Criterion</span>
            <span className="sc-crit-head-weight">Weight</span>
          </div>
          {CONCEPTS.map((concept) => {
            const result = totalById.get(concept.id)
            const held = result?.held ?? false
            const leading = leaderIds.has(concept.id)
            return (
              <div
                key={concept.id}
                className={`sc-cell sc-concept${leading ? ' leading' : ''}${held ? ' held' : ''}`}
                role="columnheader"
                style={{ ['--c']: concept.accent } as React.CSSProperties}
              >
                {leading ? <span className="sc-rays" aria-hidden="true" /> : null}
                <div className="sc-concept-top">
                  <div className="sc-concept-id">
                    <h2>{concept.name}</h2>
                    <p className="sc-concept-tag">{concept.tagline}</p>
                  </div>
                  <Ring total={result?.total ?? 0} accent={concept.accent} held={held} />
                </div>
                <p className="sc-concept-hyp">
                  <span>Hypothesis</span> {concept.hypothesis}
                </p>
                {leading ? (
                  <p className="sc-badge sc-badge--lead">Leading on weighted score</p>
                ) : null}
                {held ? (
                  <p className="sc-badge sc-badge--held">Held — a gate is open</p>
                ) : null}
              </div>
            )
          })}
        </div>

        {/* Criteria rows */}
        {CRITERIA.map((criterion) => (
          <div className="sc-row" role="row" key={criterion.id}>
            <div className="sc-cell sc-cell--crit" role="rowheader">
              <div className="sc-crit-label">
                <span className="sc-crit-name">{criterion.label}</span>
                <span className="sc-crit-weight">{criterion.weight}%</span>
              </div>
              <p className="sc-crit-blurb">{criterion.blurb}</p>
            </div>
            {CONCEPTS.map((concept) => {
              const value = scores[concept.id][criterion.id] ?? NEUTRAL
              return (
                <div className="sc-cell sc-score" role="cell" key={concept.id}>
                  <ScoreSelector
                    value={value}
                    accent={concept.accent}
                    label={`${concept.name} — ${criterion.label}`}
                    onChange={(next) => setScore(concept.id, criterion.id, next)}
                  />
                </div>
              )
            })}
          </div>
        ))}

        {/* Gate row */}
        <div className="sc-row sc-row--gates" role="row">
          <div className="sc-cell sc-cell--crit sc-gate-head" role="rowheader">
            <div className="sc-crit-label">
              <span className="sc-crit-name">Non-negotiable gates</span>
            </div>
            <p className="sc-crit-blurb">
              Any open gate holds a concept regardless of its score.
            </p>
          </div>
          {CONCEPTS.map((concept) => (
            <div className="sc-cell sc-gatecell" role="cell" key={concept.id}>
              {GATES.map((gate) => {
                const on = gates[concept.id][gate.id] ?? true
                return (
                  <button
                    key={gate.id}
                    type="button"
                    role="switch"
                    aria-checked={on}
                    className={`sc-gate${on ? ' on' : ''}`}
                    style={{ ['--c']: concept.accent } as React.CSSProperties}
                    onClick={() => toggleGate(concept.id, gate.id)}
                    title={gate.blurb}
                  >
                    <span className="sc-gate-mark" aria-hidden="true">
                      {on ? '✓' : '○'}
                    </span>
                    {gate.label}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      <footer className="sc-foot">
        <p>
          <strong>How the total works.</strong> Each criterion score (1–5) is
          taken as a share of 5, weighted by its percentage, and summed — so a
          concept rated 5 everywhere reaches 100 and the neutral start sits at
          60. The three gates come from the strategy scorecard and{' '}
          <em>override</em> the weighted number: they decide whether a concept is
          allowed to win at all, not how high it scores.
        </p>
        <p className="sc-source">
          Criteria &amp; weights: <code>strategy.md</code> · Concepts:
          approved briefs in <code>docs/strategy/</code>
        </p>
      </footer>
    </section>
  )
}
