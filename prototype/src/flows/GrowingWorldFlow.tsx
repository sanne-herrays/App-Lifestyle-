/**
 * TASK-015 — The Growing World · first-session flow.
 *
 * Mirrors growing-world-concept-brief.md §4: Welcome → Goal whisper → proposed
 * action (+ easier variant) → optional when-then plan → first *growth* now
 * (one gesture plants the first seed) → gentle close that states the no-decay
 * promise (R3 monotonic accrual) out loud.
 *
 * The world only ever accrues (R3): nothing here can wilt, dim, or reset it.
 */

import { useState } from 'react'
import { PhoneFrame, GoalChips, HoldToComplete, WorldCanvas } from './flowKit'
import {
  ACCENT,
  type GoalId,
  GOALS,
  ANCHORS,
  actionForGoal,
  useReducedMotion,
} from './flowData'

type Step = 'welcome' | 'goal' | 'suggestion' | 'plan' | 'grow' | 'done'
const ORDER: readonly Step[] = ['welcome', 'goal', 'suggestion', 'plan', 'grow', 'done']

interface FlowProps {
  onExit: () => void
}

export default function GrowingWorldFlow({ onExit }: FlowProps) {
  const reducedMotion = useReducedMotion()
  const [step, setStep] = useState<Step>('welcome')
  const [goal, setGoal] = useState<GoalId | null>(null)
  const [anchor, setAnchor] = useState<string | null>(null)
  const [easier, setEasier] = useState(false)
  const [grown, setGrown] = useState(false)

  const action = actionForGoal(goal)
  const title = easier ? action.easierTitle : action.title
  const effort = easier ? action.easierEffort : action.effort
  const count = grown ? 1 : 0

  const reset = () => {
    setStep('welcome')
    setGoal(null)
    setAnchor(null)
    setEasier(false)
    setGrown(false)
  }

  const back = () => {
    const i = ORDER.indexOf(step)
    if (i <= 0) {
      onExit()
      return
    }
    const prev = ORDER[i - 1]
    if (prev) setStep(prev)
  }

  const stepIndex = ORDER.indexOf(step)

  return (
    <PhoneFrame
      accent={ACCENT['growing-world']}
      concept="The Growing World"
      stepKey={step}
      stepIndex={stepIndex}
      stepCount={ORDER.length}
      onBack={step === 'done' ? null : back}
    >
      {step === 'welcome' && (
        <div className="step-body step-center">
          <span className="eyebrow">Today</span>
          <h2 className="step-h">Let’s grow a little world — starting with one real thing today.</h2>
          <p className="step-p">No sign-up, no setup. Your world begins with your first action.</p>
          <div className="step-actions">
            <button type="button" className="btn btn-primary" onClick={() => setStep('goal')}>
              Plant the first thing
            </button>
          </div>
        </div>
      )}

      {step === 'goal' && (
        <div className="step-body">
          <h2 className="step-h">What would you like your world to grow from?</h2>
          <p className="step-p">Pick one, or skip — there’s no wrong answer.</p>
          <GoalChips goals={GOALS} value={goal} onPick={setGoal} />
          <div className="step-actions">
            <button type="button" className="btn btn-primary" onClick={() => setStep('suggestion')}>
              Continue
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => { setGoal(null); setStep('suggestion') }}>
              Skip for now
            </button>
          </div>
        </div>
      )}

      {step === 'suggestion' && (
        <div className="step-body">
          <span className="eyebrow">Here’s one idea</span>
          <h2 className="step-h">{action.title}</h2>
          <p className="step-p">On a hard day, <strong>{action.easierTitle.toLowerCase()}</strong> — and your world still grows.</p>
          <div className="pill-row">
            <span className="pill">{action.effort}</span>
            <span className="pill pill-soft">grows your world</span>
          </div>
          <div className="step-actions">
            <button type="button" className="btn btn-primary" onClick={() => setStep('plan')}>
              Make it stick (optional)
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setStep('grow')}>
              Grow it right now
            </button>
          </div>
        </div>
      )}

      {step === 'plan' && (
        <div className="step-body">
          <h2 className="step-h">When do you already do something every day?</h2>
          <p className="step-p">Attach your action to it. You can skip this.</p>
          <div className="chips chips-stack" role="radiogroup" aria-label="Pick a daily routine to attach to">
            {ANCHORS.map((a) => (
              <button
                key={a}
                type="button"
                role="radio"
                aria-checked={anchor === a}
                className={`chip chip-wide${anchor === a ? ' sel' : ''}`}
                onClick={() => setAnchor(a)}
              >
                {a}
              </button>
            ))}
          </div>
          {anchor && (
            <p className="plan-sentence" aria-live="polite">
              “{anchor.charAt(0).toUpperCase() + anchor.slice(1)}, I’ll grow my world a little.”
            </p>
          )}
          <div className="step-actions">
            <button type="button" className="btn btn-primary" onClick={() => setStep('grow')}>
              {anchor ? 'That’s my plan' : 'Continue'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setStep('grow')}>
              Skip
            </button>
          </div>
        </div>
      )}

      {step === 'grow' && (
        <div className="step-body step-center">
          <span className="eyebrow">Your little win today</span>
          <h2 className="step-h step-h-sm">{title}</h2>
          <span className="pill">{effort}</span>
          <WorldCanvas count={count} sprouting={grown} reducedMotion={reducedMotion} />
          <HoldToComplete
            actionLabel={title}
            done={grown}
            onComplete={() => setGrown(true)}
            reducedMotion={reducedMotion}
          />
          <div aria-live="polite" className="reward">
            {grown ? <p className="reward-line">That’s yours. It’s part of your world now.</p> : null}
          </div>
          {!grown && !easier && (
            <button type="button" className="btn btn-link" onClick={() => setEasier(true)}>
              Switch to the {action.easierEffort} version — your world still grows
            </button>
          )}
          {grown && (
            <div className="step-actions">
              <button type="button" className="btn btn-primary" onClick={() => setStep('done')}>
                Continue
              </button>
            </div>
          )}
        </div>
      )}

      {step === 'done' && (
        <div className="step-body step-center">
          <h2 className="step-h">That’s the first piece of your world.</h2>
          <WorldCanvas count={1} sprouting={false} reducedMotion={reducedMotion} />
          <p className="step-p">
            It’ll be right here tomorrow — and <strong>it won’t go anywhere if life gets busy.</strong> Nothing ever wilts.
          </p>
          <p className="progress-note">1 real action · your world, kept{anchor ? ` · ${anchor}` : ''}</p>
          <div className="step-actions">
            <button type="button" className="btn btn-primary" onClick={reset}>
              Start over
            </button>
            <button type="button" className="btn btn-ghost" onClick={onExit}>
              Try another concept
            </button>
          </div>
        </div>
      )}
    </PhoneFrame>
  )
}
