/**
 * TASK-033 — Activation-event instrumentation (interactive surface).
 *
 * The event schema, the anonymous-key minting, the one-time funnel semantics and
 * the structural "no raw health detail" guarantee all live in the pure, fully-tested
 * engine (`src/lib/activation.ts`, with deterministic cases in `activation.test.ts`).
 * This surface makes the instrumentation observable:
 *
 *   - It binds the funnel to the REAL systems: onboarding start/complete are emitted
 *     by two controls, and first action / first reward are folded in automatically
 *     from the live TASK-026 completion ledger — so finishing a real "little win" on
 *     the card tab lights up the funnel here.
 *   - It shows the raw emitted events verbatim, each with a live "no health detail"
 *     check from the very guard the tests exercise, so a reviewer can see that an
 *     event carries only an anonymous key, a milestone token, a timestamp, a schema
 *     version and (at most) a coarse bucket — never an action title or any free text.
 *   - It renders the documented schema (`ACTIVATION_EVENT_SCHEMA`) as a table.
 *
 * Standards: Zero-Guilt (§1) — warm paper + calm-green, no red/penalty/streak chrome;
 * every surfaced string clears the shared `isGuiltFree` guard. Integrity (§3) — the
 * events shown are the real ones the store emits, not a mock. A11y — the funnel is a
 * labelled ordered list, status changes are announced in an `aria-live` region,
 * controls have visible focus rings and a dedicated `prefers-reduced-motion` block.
 */

import { useEffect, useState } from 'react'
import { useReducedMotion } from '../flows/flowData'
import { useLedgerEvents } from './useLedgerEvents'
import {
  ACTIVATION_EVENT_SCHEMA,
  EVENT_DESCRIPTION,
  carriesRawHealthDetail,
  emitMilestone,
  funnelView,
  getActivation,
  hasReached,
  resetActivation,
  subscribeActivation,
  syncActivationFromLedger,
  type ActivationState,
} from '../lib/activation'
import './ActivationEvents.css'

/** Subscribe a component to the live activation store. */
function useActivation(): ActivationState {
  const [state, setState] = useState<ActivationState>(getActivation)
  useEffect(() => subscribeActivation(setState), [])
  return state
}

/** A warm, non-pressuring time label. */
function timeLabel(ms: number): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(ms))
  } catch {
    return 'recorded'
  }
}

export default function ActivationEvents() {
  const reducedMotion = useReducedMotion()
  const activation = useActivation()
  const ledger = useLedgerEvents()

  // Fold the real completion ledger into the funnel: the first real win emits
  // first_action_completed + first_reward_shown exactly once (both one-time in the
  // engine, so this effect is safe to run on every ledger change).
  useEffect(() => {
    syncActivationFromLedger(ledger)
  }, [ledger])

  const rows = funnelView(activation)
  const reachedCount = rows.filter((row) => row.reached).length
  const onboardingDone = hasReached(activation, 'onboarding_completed')

  return (
    <div className={`ae${reducedMotion ? ' reduce' : ''}`}>
      <div className="ae-glow" aria-hidden="true" />

      <header className="ae-head">
        <p className="ae-eyebrow">Activation instrumentation</p>
        <h2 className="ae-title">The four moments we measure</h2>
        <p className="ae-sub">
          Onboarding, first action and first reward — all anonymous, none tied to who you are, and never carrying a
          single health detail. Showing up once is the whole milestone.
        </p>
      </header>

      {/* ---- the funnel ------------------------------------------------- */}
      <ol className="ae-funnel" aria-label="Activation funnel">
        {rows.map((row, index) => (
          <li key={row.eventType} className={`ae-step${row.reached ? ' reached' : ''}`}>
            <span className="ae-step-dot" aria-hidden="true">
              {row.reached ? '✓' : index + 1}
            </span>
            <span className="ae-step-body">
              <span className="ae-step-label">{row.label}</span>
              <span className="ae-step-desc">{EVENT_DESCRIPTION[row.eventType]}</span>
              <code className="ae-step-type">{row.eventType}</code>
            </span>
            <span className="ae-step-when">
              {row.reached && row.occurredAt !== null ? timeLabel(row.occurredAt) : 'not yet'}
            </span>
          </li>
        ))}
      </ol>

      <p className="ae-status" role="status" aria-live="polite">
        {reachedCount} of {rows.length} activation {reachedCount === 1 ? 'moment' : 'moments'} reached.
      </p>

      {/* ---- emit controls --------------------------------------------- */}
      <div className="ae-controls">
        <button
          type="button"
          className="ae-btn"
          onClick={() => emitMilestone('onboarding_started')}
          disabled={hasReached(activation, 'onboarding_started')}
        >
          {hasReached(activation, 'onboarding_started') ? 'Onboarding started ✓' : 'Start onboarding'}
        </button>
        <button
          type="button"
          className="ae-btn"
          onClick={() => emitMilestone('onboarding_completed')}
          disabled={onboardingDone}
        >
          {onboardingDone ? 'Onboarding complete ✓' : 'Finish onboarding'}
        </button>
      </div>
      <p className="ae-hint">
        First action and first reward light up on their own when you finish a real little win on the{' '}
        <strong>Little Win card</strong> tab — this reads the same ledger, nothing is simulated here.
      </p>

      {/* ---- the raw events, with a live no-health-detail check -------- */}
      <section className="ae-raw" aria-label="Recorded activation events">
        <h3 className="ae-h3">What actually gets recorded</h3>
        <p className="ae-key">
          Anonymous key: <code>{activation.userKey}</code>
          <span className="ae-key-note"> — random, not an account, email, name or device id.</span>
        </p>
        {activation.events.length === 0 ? (
          <p className="ae-empty">No events yet. Nothing is recorded until a milestone is actually reached.</p>
        ) : (
          <ul className="ae-events">
            {activation.events.map((event) => {
              const clean = !carriesRawHealthDetail(event)
              return (
                <li key={event.eventType} className="ae-event">
                  <pre className="ae-event-json">{JSON.stringify(event, null, 2)}</pre>
                  <span className={`ae-event-badge${clean ? ' ok' : ' bad'}`}>
                    {clean ? 'No health detail ✓' : 'Contains raw detail ✗'}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
        <button type="button" className="ae-reset" onClick={resetActivation}>
          Reset &amp; rotate to a new anonymous key
        </button>
      </section>

      {/* ---- documented schema ----------------------------------------- */}
      <section className="ae-schema" aria-label="Activation event schema">
        <h3 className="ae-h3">Documented event schema</h3>
        <table className="ae-table">
          <thead>
            <tr>
              <th scope="col">Field</th>
              <th scope="col">Type</th>
              <th scope="col">Required</th>
              <th scope="col">PII</th>
              <th scope="col">Description</th>
            </tr>
          </thead>
          <tbody>
            {ACTIVATION_EVENT_SCHEMA.map((field) => (
              <tr key={field.field}>
                <th scope="row">
                  <code>{field.field}</code>
                </th>
                <td>{field.type}</td>
                <td>{field.required ? 'yes' : 'optional'}</td>
                <td>{field.pii ? 'yes' : 'none'}</td>
                <td>{field.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}
