/**
 * TASK-015 — The Tiny Win · first-session flow.
 *
 * Mirrors the brief's onboarding (tiny-win-concept-brief.md §4): Welcome →
 * Goal whisper → the single proposed action (+ easier variant) → optional
 * when-then plan → first win *now* (one gesture) → gentle close.
 *
 * No dead ends: every step has a Back and a clear primary action; the close
 * offers "Start over" and "Try another concept". Missing / easing is never
 * penalised (Zero-Guilt, CLAUDE.md §1).
 */

import { useState } from 'react'
import { PhoneFrame, GoalChips, HoldToComplete } from './flowKit'
import {
  ACCENT,
  type GoalId,
  GOALS,
  ANCHORS,
  actionForGoal,
  useReducedMotion,
} from './flowData'

type Step = 'welcome' | 'goal' | 'suggestion' | 'plan' | 'win' | 'done'
const ORDER: readonly Step[] = ['welcome', 'goal', 'suggestion', 'plan', 'win', 'done']

interface FlowProps {
  onExit: () => void
}

export default function TinyWinFlow({ onExit }: FlowProps) {
  const reducedMotion = useReducedMotion()
  const [step, setStep] = useState<Step>('welcome')
  const [goal, setGoal] = useState<GoalId | null>(null)
  const [anchor, setAnchor] = useState<string | null>(null)
  const [easier, setEasier] = useState(false)
  const [done, setDone] = useState(false)
  const [claimedIdentity, setClaimedIdentity] = useState(false)

  const action = actionForGoal(goal)
  const title = easier ? action.easierTitle : action.title
  const effort = easier ? action.easierEffort : action.effort

  const reset = () => {
    setStep('welcome')
    setGoal(null)
    setAnchor(null)
    setEasier(false)
    setDone(false)
    setClaimedIdentity(false)
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
      accent={ACCENT['tiny-win']}
      concept="The Tiny Win"
      stepKey={step}
      stepIndex={stepIndex}
      stepCount={ORDER.length}
      onBack={step === 'done' ? null : back}
    >
      {step === 'welcome' && (
        <div className="step-body step-center">
          <span className="eyebrow">Today</span>
          <h2 className="step-h">Let’s find one little win for today.</h2>
          <p className="step-p">No sign-up, no setup. Just one small, real thing — and it’s yours.</p>
          <div className="step-actions">
            <button type="button" className="btn btn-primary" onClick={() => setStep('goal')}>
              Find today’s little win
            </button>
          </div>
        </div>
      )}

      {step === 'goal' && (
        <div className="step-body">
          <h2 className="step-h">What’s pulling at you lately?</h2>
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
          <p className="step-p">That’s the whole thing. On a hard day, <strong>{action.easierTitle.toLowerCase()}</strong> counts just as much.</p>
          <div className="pill-row">
            <span className="pill">{action.effort}</span>
            <span className="pill pill-soft">easier variant ready</span>
          </div>
          <div className="step-actions">
            <button type="button" className="btn btn-primary" onClick={() => setStep('plan')}>
              Make it stick (optional)
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setStep('win')}>
              Just do it right now
            </button>
          </div>
        </div>
      )}

      {step === 'plan' && (
        <div className="step-body">
          <h2 className="step-h">When do you already do something every day?</h2>
          <p className="step-p">Attach your little win to it. You can skip this.</p>
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
              “{anchor.charAt(0).toUpperCase() + anchor.slice(1)}, I’ll do my little win.”
            </p>
          )}
          <div className="step-actions">
            <button type="button" className="btn btn-primary" onClick={() => setStep('win')}>
              {anchor ? 'That’s my plan' : 'Continue'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setStep('win')}>
              Skip
            </button>
          </div>
        </div>
      )}

      {step === 'win' && (
        <div className="step-body step-center">
          <span className="eyebrow">Your little win today</span>
          <h2 className="step-h step-h-sm">{title}</h2>
          <span className="pill">{effort}</span>
          <HoldToComplete
            actionLabel={title}
            done={done}
            onComplete={() => setDone(true)}
            reducedMotion={reducedMotion}
          />
          <div aria-live="polite" className="reward">
            {done ? <p className="reward-line">{action.reward}</p> : null}
          </div>
          {!done && !easier && (
            <button type="button" className="btn btn-link" onClick={() => setEasier(true)}>
              Switch to the {action.easierEffort} version — it counts fully
            </button>
          )}
          {done && (
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
          <div className="done-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M5 12.5 10 17.5 19.5 7" /></svg>
          </div>
          <h2 className="step-h">That’s your little win today.</h2>
          <p className="step-p">We’ll be here tomorrow — no pressure, no streak to keep.</p>
          <p className="progress-note">Today ✓ · 1 little win{anchor ? ` · ${anchor}` : ''}</p>
          <button
            type="button"
            className={`identity${claimedIdentity ? ' claimed' : ''}`}
            aria-pressed={claimedIdentity}
            onClick={() => setClaimedIdentity((v) => !v)}
          >
            {claimedIdentity ? '✓ ' : ''}I’m {action.identity}
          </button>
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
