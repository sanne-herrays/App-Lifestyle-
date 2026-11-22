import { useMemo, useState } from 'react'
import './RecommendationDemo.css'
import { ACTION_CATALOG, GRADE_MEANING } from '../lib/actionCatalog'
import { recommend, type RecommendationReason } from '../lib/recommendation'
import { GOALS, type GoalId } from '../flows/flowData'

/**
 * TASK-025 — Action recommendation rules (interactive demo).
 *
 * The selection logic lives in the pure, fully-tested engine
 * (`src/lib/recommendation.ts`, with deterministic cases in
 * `recommendation.test.ts`). This surface just wires that engine to the real
 * TASK-024 evidence-reviewed catalog so the four acceptance behaviours — goal
 * fit, time availability, contraindication exclusions and the no-match
 * fallback — are visible and tappable.
 *
 * Standards: Zero-Guilt (CLAUDE.md §1) — warm paper + calm-green only; a
 * no-match never dead-ends, it offers a gentle fallback with reassuring copy;
 * nothing is a red warning. Health-claim integrity (§3 / TASK-006) — the only
 * health statement shown is the record's pre-approved `claim.permitted`,
 * surfaced as "We may say …" so the honesty is visible, never composed here.
 */

/** Goal choices, plus an explicit "no preference" (open) option. */
const GOAL_CHOICES: readonly { value: GoalId | 'none'; label: string }[] = [
  { value: 'none', label: 'No preference' },
  ...GOALS.map((goal) => ({ value: goal.id, label: goal.label })),
]

/** A few honest time budgets the user might have right now. */
const TIME_CHOICES: readonly { id: string; label: string; seconds: number | undefined }[] = [
  { id: 'tiny', label: '~20 sec', seconds: 20 },
  { id: 'short', label: '~1 min', seconds: 60 },
  { id: 'some', label: 'A few minutes', seconds: 300 },
  { id: 'any', label: 'Any', seconds: undefined },
]

/**
 * Three real opt-outs, each an EXACT `Contraindication.context` string from the
 * catalog, so the engine's deterministic match fires. The short label is just
 * for the UI; the exact `context` is what we pass to the engine.
 */
const CONTEXT_CHOICES: readonly { label: string; context: string }[] = [
  { label: 'Pain, injury, or limited mobility', context: 'Pain, injury, or limited mobility' },
  { label: 'Advised to limit fluids', context: 'Clinically advised to limit fluids' },
  {
    label: 'Prefer not to focus on breath',
    context: 'Panic, anxiety around breath focus, or a respiratory condition',
  },
]

const REASON_LABEL: Record<RecommendationReason, string> = {
  'goal-fit': 'Matched to your goal',
  'open-no-goal': 'A gentle place to start',
  'fallback-no-match': 'Nothing matched exactly — here’s a gentle option',
}

export default function RecommendationDemo() {
  const [goal, setGoal] = useState<GoalId | 'none'>('none')
  const [timeId, setTimeId] = useState<string>('any')
  const [contexts, setContexts] = useState<readonly string[]>([])

  const timeChoice = TIME_CHOICES.find((choice) => choice.id === timeId) ?? TIME_CHOICES[TIME_CHOICES.length - 1]

  const result = useMemo(
    () =>
      recommend({
        goal: goal === 'none' ? null : goal,
        timeAvailableSeconds: timeChoice?.seconds,
        declaredContexts: contexts,
        catalog: ACTION_CATALOG,
      }),
    [goal, timeChoice?.seconds, contexts],
  )

  const toggleContext = (context: string) => {
    setContexts((prev) =>
      prev.includes(context) ? prev.filter((entry) => entry !== context) : [...prev, context],
    )
  }

  const { action, reason, stats } = result

  return (
    <section className="rec" aria-labelledby="rec-heading">
      <div className="rec-glow" aria-hidden="true" />

      <header className="rec-head">
        <p className="rec-eyebrow">Today’s suggestion</p>
        <h2 id="rec-heading" className="rec-title">
          What feels doable right now?
        </h2>
        <p className="rec-sub">
          Tell us a little, and we’ll pick one small thing. There’s no wrong answer — you can always
          pick something else.
        </p>
      </header>

      <fieldset className="rec-field">
        <legend className="rec-legend">A little win for…</legend>
        <div className="rec-chips">
          {GOAL_CHOICES.map((choice) => (
            <label key={choice.value} className={`rec-chip${goal === choice.value ? ' on' : ''}`}>
              <input
                type="radio"
                name="rec-goal"
                value={choice.value}
                checked={goal === choice.value}
                onChange={() => setGoal(choice.value)}
              />
              {choice.label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="rec-field">
        <legend className="rec-legend">Time I have</legend>
        <div className="rec-chips">
          {TIME_CHOICES.map((choice) => (
            <label key={choice.id} className={`rec-chip${timeId === choice.id ? ' on' : ''}`}>
              <input
                type="radio"
                name="rec-time"
                value={choice.id}
                checked={timeId === choice.id}
                onChange={() => setTimeId(choice.id)}
              />
              {choice.label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="rec-field">
        <legend className="rec-legend">Good to know about me (optional)</legend>
        <div className="rec-chips">
          {CONTEXT_CHOICES.map((choice) => (
            <label
              key={choice.context}
              className={`rec-chip${contexts.includes(choice.context) ? ' on' : ''}`}
            >
              <input
                type="checkbox"
                checked={contexts.includes(choice.context)}
                onChange={() => toggleContext(choice.context)}
              />
              {choice.label}
            </label>
          ))}
        </div>
        <p className="rec-hint">
          We use these only to keep suggestions gentle for you — never to warn or judge.
        </p>
      </fieldset>

      <div className="rec-result" role="status" aria-live="polite">
        <p className="rec-reason">{REASON_LABEL[reason]}</p>
        <article className={`rec-card${action.isFallback ? ' fallback' : ''}`}>
          <div className="rec-card-top">
            <h3 className="rec-action">{action.title}</h3>
            <span className="rec-effort">{action.duration}</span>
          </div>

          <div className="rec-meta">
            {action.evidenceGrade ? (
              <span className="rec-grade" title={GRADE_MEANING[action.evidenceGrade]}>
                Evidence {action.evidenceGrade}
                <span className="rec-sr"> — {GRADE_MEANING[action.evidenceGrade]}</span>
              </span>
            ) : null}
            {action.downgradedForTime ? <span className="rec-tag">quick version</span> : null}
            {action.form === 'easier' && !action.downgradedForTime ? (
              <span className="rec-tag">gentler version</span>
            ) : null}
          </div>

          <p className="rec-note">{action.note}</p>

          {action.adaptations.length > 0 ? (
            <ul className="rec-adapt">
              {action.adaptations.map((adaptation) => (
                <li key={adaptation}>{adaptation}</li>
              ))}
            </ul>
          ) : null}

          {action.claimPermitted ? <p className="rec-claim">We may say: “{action.claimPermitted}”</p> : null}
        </article>

        <p className="rec-stats">
          {stats.considered} considered
          {stats.excludedByContraindication > 0
            ? ` · ${stats.excludedByContraindication} set aside to stay gentle`
            : ''}
          {stats.excludedByTime > 0 ? ` · ${stats.excludedByTime} needed more time` : ''}
        </p>
      </div>
    </section>
  )
}
