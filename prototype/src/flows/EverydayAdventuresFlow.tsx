/**
 * TASK-015 — Everyday Adventures · first-session flow.
 *
 * Mirrors everyday-adventures-concept-brief.md §4: Welcome → Goal whisper →
 * **anchor set (the stable part)** → declared, private context → one fitted
 * mission (with a quiet "suggest a different one" that rotates a *bounded*
 * pool, §5.4 M4) → first adventure now (one gesture) → gentle close.
 *
 * The anchor is invariant (M2): only the mission content varies. No location
 * permission is ever requested (M1); context is declared, not sensed.
 */

import { useState } from 'react'
import { PhoneFrame, GoalChips, HoldToComplete } from './flowKit'
import {
  ACCENT,
  type GoalId,
  type Mission,
  GOALS,
  ANCHORS,
  CONTEXT_CHIPS,
  eaPoolForGoal,
  useReducedMotion,
} from './flowData'

type Step = 'welcome' | 'goal' | 'anchor' | 'context' | 'mission' | 'adventure' | 'done'
const ORDER: readonly Step[] = ['welcome', 'goal', 'anchor', 'context', 'mission', 'adventure', 'done']

const FALLBACK_MISSION: Mission = { title: 'A glass of water', effort: '1 min', easier: 'A few sips of water' }

interface FlowProps {
  onExit: () => void
}

export default function EverydayAdventuresFlow({ onExit }: FlowProps) {
  const reducedMotion = useReducedMotion()
  const [step, setStep] = useState<Step>('welcome')
  const [goal, setGoal] = useState<GoalId | null>(null)
  const [anchor, setAnchor] = useState<string | null>(null)
  const [contexts, setContexts] = useState<string[]>([])
  const [missionIndex, setMissionIndex] = useState(0)
  const [easier, setEasier] = useState(false)
  const [done, setDone] = useState(false)

  const pool = eaPoolForGoal(goal)
  // Deterministic selection from the bounded pool (M4/M5); always defined.
  const mission = pool.length > 0 ? pool[missionIndex % pool.length] ?? FALLBACK_MISSION : FALLBACK_MISSION
  const title = easier ? mission.easier : mission.title
  const effort = easier ? '20 sec' : mission.effort

  const reset = () => {
    setStep('welcome')
    setGoal(null)
    setAnchor(null)
    setContexts([])
    setMissionIndex(0)
    setEasier(false)
    setDone(false)
  }

  const toggleContext = (c: string) => {
    setContexts((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]))
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
      accent={ACCENT['everyday-adventures']}
      concept="Everyday Adventures"
      stepKey={step}
      stepIndex={stepIndex}
      stepCount={ORDER.length}
      onBack={step === 'done' ? null : back}
    >
      {step === 'welcome' && (
        <div className="step-body step-center">
          <span className="eyebrow">Today</span>
          <h2 className="step-h">Each day, one little adventure that fits your day.</h2>
          <p className="step-p">No sign-up, no setup. Let’s find today’s — and set where it’ll live.</p>
          <div className="step-actions">
            <button type="button" className="btn btn-primary" onClick={() => setStep('goal')}>
              Find today’s adventure
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
            <button type="button" className="btn btn-primary" onClick={() => { setMissionIndex(0); setStep('anchor') }}>
              Continue
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => { setGoal(null); setMissionIndex(0); setStep('anchor') }}>
              Skip for now
            </button>
          </div>
        </div>
      )}

      {step === 'anchor' && (
        <div className="step-body">
          <h2 className="step-h">When in your day shall these little adventures live?</h2>
          <p className="step-p">This part <strong>won’t change</strong> — only the missions will.</p>
          <div className="chips chips-stack" role="radiogroup" aria-label="Pick the stable daily anchor">
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
          <div className="step-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setStep('context')}
              disabled={!anchor}
            >
              {anchor ? 'Set this anchor' : 'Pick an anchor'}
            </button>
          </div>
        </div>
      )}

      {step === 'context' && (
        <div className="step-body">
          <h2 className="step-h">Anything about your days we should fit around?</h2>
          <p className="step-p">You choose what to share. <strong>No location needed</strong> — ever.</p>
          <div className="chips" role="group" aria-label="Declared context (optional)">
            {CONTEXT_CHIPS.map((c) => (
              <button
                key={c}
                type="button"
                aria-pressed={contexts.includes(c)}
                className={`chip${contexts.includes(c) ? ' sel' : ''}`}
                onClick={() => toggleContext(c)}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="step-actions">
            <button type="button" className="btn btn-primary" onClick={() => setStep('mission')}>
              Continue
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => { setContexts([]); setStep('mission') }}>
              Skip
            </button>
          </div>
        </div>
      )}

      {step === 'mission' && (
        <div className="step-body">
          <span className="eyebrow">Today’s adventure{anchor ? ` · ${anchor}` : ''}</span>
          <h2 className="step-h">{mission.title}</h2>
          <p className="step-p">That’s the whole thing. On a hard day, <strong>{mission.easier.toLowerCase()}</strong> counts just as much.</p>
          <div className="pill-row">
            <span className="pill">{mission.effort}</span>
            <span className="pill pill-soft">{contexts.length ? 'fitted to your day' : 'picked for today'}</span>
          </div>
          <div className="step-actions">
            <button type="button" className="btn btn-primary" onClick={() => setStep('adventure')}>
              Do it right now
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setMissionIndex((i) => i + 1)}>
              Suggest a different one
            </button>
          </div>
        </div>
      )}

      {step === 'adventure' && (
        <div className="step-body step-center">
          <span className="eyebrow">Today’s adventure</span>
          <h2 className="step-h step-h-sm">{title}</h2>
          <span className="pill">{effort}</span>
          <HoldToComplete
            actionLabel={title}
            done={done}
            onComplete={() => setDone(true)}
            reducedMotion={reducedMotion}
          />
          <div aria-live="polite" className="reward">
            {done ? <p className="reward-line">That was a good one.</p> : null}
          </div>
          {!done && !easier && (
            <button type="button" className="btn btn-link" onClick={() => setEasier(true)}>
              Switch to the 20-second version — it counts fully
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
          <h2 className="step-h">That’s today’s adventure.</h2>
          <p className="step-p">
            Tomorrow’s will fit your day too{anchor ? `, right ${anchor}` : ''} — and it’s no problem if you skip one.
          </p>
          <p className="progress-note">1 adventure · same anchor, fresh mission</p>
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
