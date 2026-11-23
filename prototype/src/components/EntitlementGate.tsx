/**
 * TASK-037 — Premium entitlement gate (interactive surface).
 *
 * The tier logic, the time-based validity of an entitlement, the feature gate and
 * the gentle-downgrade ("park, never delete") rule all live in the pure, fully-tested
 * engine (`src/lib/entitlement.ts`, with deterministic cases in `entitlement.test.ts`).
 * This surface makes the gate observable and lets a reviewer walk the acceptance
 * criterion by hand:
 *
 *   - Free user completes the core loop → the "Always free" panel shows every
 *     core-loop feature unlocked for a free account, with no entitlement at all.
 *   - Premium access requires a valid entitlement → starting one of the three PRD §7
 *     annual hypothesis plans unlocks the premium panel; without it, those features
 *     are softly locked (never an alarming red).
 *   - Expired entitlement restores free access → a "Demo clock" moves time forward so
 *     a reviewer can watch an annual grant lapse: at a year + a day the tier falls back
 *     to free, premium re-locks, the core loop stays intact, and the lapsed plan is
 *     shown "resting" (kept) with a one-tap reopen. "Simulate a lapsed renewal" does
 *     the same without waiting.
 *
 * Standards: Zero-Guilt (§1) — warm paper + calm-green, no red/penalty/streak chrome;
 * a downgrade is a soft "resting" state, never a loss-frame, and every surfaced string
 * clears the shared `isGuiltFree` guard. Integrity (§3) — the prices are labelled
 * hypotheses to test, and the "demo clock" is honestly a display-only clock shift, not
 * fabricated data. A11y — labelled radiogroups, an `aria-live` status, visible focus
 * rings and a dedicated `prefers-reduced-motion` block.
 */

import { useEffect, useState } from 'react'
import { useReducedMotion } from '../flows/flowData'
import {
  DAY_MS,
  PREMIUM_PRODUCTS,
  TIER_LABEL,
  STATUS_COPY,
  clearEntitlement,
  featureAccess,
  getEntitlement,
  grantPremium,
  isCoreLoopAvailable,
  lapseNow,
  resolveEntitlement,
  subscribeEntitlement,
  type Entitlement,
  type PremiumProductId,
} from '../lib/entitlement'
import './EntitlementGate.css'

/** Subscribe a component to the live raw entitlement. */
function useEntitlement(): Entitlement | null {
  const [entitlement, setEntitlement] = useState<Entitlement | null>(getEntitlement)
  useEffect(() => subscribeEntitlement(setEntitlement), [])
  return entitlement
}

/** The demo-clock presets — display-only shifts so a year can be "watched" passing. */
const CLOCK_STEPS: readonly { id: string; label: string; offsetDays: number }[] = [
  { id: 'now', label: 'Today', offsetDays: 0 },
  { id: 'mid', label: '+6 months', offsetDays: 182 },
  { id: 'past', label: '+1 year + 1 day', offsetDays: 366 },
]

function formatPrice(usd: number): string {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(usd)
  } catch {
    return `$${usd.toFixed(2)}`
  }
}

function formatDate(ms: number): string {
  try {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(ms))
  } catch {
    return 'later'
  }
}

export default function EntitlementGate() {
  const reducedMotion = useReducedMotion()
  const entitlement = useEntitlement()

  // Capture the base clock once, outside render, so the pure resolution stays
  // deterministic; the demo clock only shifts this forward for display.
  const [baseNow] = useState(() => Date.now())
  const [clockId, setClockId] = useState<string>('now')
  const step = CLOCK_STEPS.find((s) => s.id === clockId) ?? CLOCK_STEPS[0]
  const effectiveNow = baseNow + (step?.offsetDays ?? 0) * DAY_MS

  const state = resolveEntitlement(entitlement, effectiveNow)
  const access = featureAccess(state)
  const freeAccess = access.filter((a) => a.feature.tier === 'free')
  const premiumAccess = access.filter((a) => a.feature.tier === 'premium')
  const copy = STATUS_COPY[state.status]
  const loopOk = isCoreLoopAvailable(state)

  function handleStart(productId: PremiumProductId): void {
    grantPremium(productId)
    setClockId('now') // return to "today" so the fresh grant reads as active
  }

  return (
    <div className={`eg${reducedMotion ? ' reduce' : ''}`}>
      <div className="eg-glow" aria-hidden="true" />

      <header className="eg-head">
        <p className="eg-eyebrow">Premium entitlement gate</p>
        <h2 className="eg-title">One free habit, forever — more journeys when you want them</h2>
        <p className="eg-sub">
          The daily little win is free for as long as you like. Premium only ever adds more journeys — it never takes
          the loop away, and a lapsed plan rests your extras rather than removing them.
        </p>
      </header>

      {/* ---- current status ------------------------------------------------ */}
      <section className={`eg-status eg-status-${state.status}`} aria-label="Current access">
        <div className="eg-status-top">
          <span className={`eg-badge eg-badge-${state.tier}`}>{TIER_LABEL[state.tier]}</span>
          {state.product !== null && (
            <span className="eg-plan">
              {state.product.label}
              {state.expiresAt !== null && (
                <span className="eg-plan-when">
                  {state.status === 'active' ? ` · renews ${formatDate(state.expiresAt)}` : ` · lapsed ${formatDate(state.expiresAt)}`}
                </span>
              )}
            </span>
          )}
        </div>
        <h3 className="eg-status-headline">{copy.headline}</h3>
        <p className="eg-status-body">{copy.body}</p>
        <p className="eg-limit" role="status" aria-live="polite">
          {state.activeHabitLimit === 1
            ? 'One active habit at a time.'
            : `Up to ${state.activeHabitLimit} active journeys at once.`}
        </p>
      </section>

      {/* ---- always-free core loop ---------------------------------------- */}
      <section className="eg-panel eg-panel-free" aria-label="Always-free features">
        <div className="eg-panel-head">
          <h3 className="eg-panel-title">Always free — your core loop</h3>
          <span className={`eg-loop-chip${loopOk ? ' ok' : ''}`}>{loopOk ? 'Complete ✓' : 'unavailable'}</span>
        </div>
        <ul className="eg-features">
          {freeAccess.map(({ feature, unlocked }) => (
            <li key={feature.id} className={`eg-feature${unlocked ? ' on' : ''}`}>
              <span className="eg-feature-mark" aria-hidden="true">
                ✓
              </span>
              <span className="eg-feature-body">
                <span className="eg-feature-name">{feature.name}</span>
                <span className="eg-feature-desc">{feature.description}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* ---- premium features --------------------------------------------- */}
      <section className="eg-panel eg-panel-premium" aria-label="Premium features">
        <div className="eg-panel-head">
          <h3 className="eg-panel-title">Premium journeys</h3>
          <span className={`eg-loop-chip${state.isPremium ? ' ok' : ' resting'}`}>
            {state.isPremium ? 'Unlocked ✓' : 'resting'}
          </span>
        </div>
        <ul className="eg-features">
          {premiumAccess.map(({ feature, unlocked }) => (
            <li key={feature.id} className={`eg-feature${unlocked ? ' on' : ' locked'}`}>
              <span className="eg-feature-mark" aria-hidden="true">
                {unlocked ? '✓' : '✦'}
              </span>
              <span className="eg-feature-body">
                <span className="eg-feature-name">{feature.name}</span>
                <span className="eg-feature-desc">{feature.description}</span>
              </span>
              <span className="eg-feature-tag">{unlocked ? 'open' : 'premium'}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ---- plan controls ------------------------------------------------- */}
      <section className="eg-controls" aria-label="Manage plan">
        <h3 className="eg-h3">
          {state.isPremium ? 'Your premium plan' : 'Open premium'}
          <span className="eg-hyp"> · annual prices are hypotheses to test</span>
        </h3>
        <div className="eg-plans">
          {PREMIUM_PRODUCTS.map((product) => {
            const current = state.isPremium && state.product?.id === product.id
            return (
              <button
                key={product.id}
                type="button"
                className={`eg-plan-btn${current ? ' current' : ''}`}
                onClick={() => handleStart(product.id)}
                aria-pressed={current}
              >
                <span className="eg-plan-price">{formatPrice(product.priceUsd)}</span>
                <span className="eg-plan-period">per year</span>
                <span className="eg-plan-cta">{current ? 'Current plan ✓' : state.isPremium ? 'Switch to this' : 'Start premium'}</span>
              </button>
            )
          })}
        </div>
        <div className="eg-manage">
          <button
            type="button"
            className="eg-ghost"
            onClick={lapseNow}
            disabled={!state.isPremium}
          >
            Simulate a lapsed renewal
          </button>
          <button
            type="button"
            className="eg-ghost"
            onClick={clearEntitlement}
            disabled={entitlement === null}
          >
            Back to a free account
          </button>
        </div>
      </section>

      {/* ---- demo clock ---------------------------------------------------- */}
      <section className="eg-clock" aria-label="Demo clock">
        <h3 className="eg-h3">
          Demo clock
          <span className="eg-hyp"> · a display-only time shift, not real data</span>
        </h3>
        <p className="eg-clock-note">
          Start an annual plan, then move time forward to watch it lapse — at a year and a day the account falls back to
          free, premium rests, and the daily loop stays exactly as it was.
        </p>
        <div className="eg-clock-steps" role="radiogroup" aria-label="Move the demo clock forward">
          {CLOCK_STEPS.map((s) => {
            const on = s.id === clockId
            return (
              <button
                key={s.id}
                type="button"
                role="radio"
                aria-checked={on}
                className={`eg-step-btn${on ? ' on' : ''}`}
                onClick={() => setClockId(s.id)}
              >
                {s.label}
              </button>
            )
          })}
        </div>
        <p className="eg-clock-at">Viewing as of {formatDate(effectiveNow)}</p>
      </section>
    </div>
  )
}
