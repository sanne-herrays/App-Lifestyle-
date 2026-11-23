/**
 * TASK-038 — Subscription economics model (interactive surface).
 *
 * All of the arithmetic — the per-install breakdown, the first-year contribution, the
 * conversion × price sensitivity grid, the renewal projection and the input clamping —
 * lives in the pure, fully-tested engine (`src/lib/subscriptionEconomics.ts`, with
 * deterministic cases in `subscriptionEconomics.test.ts`). This surface makes the model
 * editable and lets a reviewer walk the acceptance criterion by hand:
 *
 *   - Inputs editable → each lever is a labelled slider; every change runs through
 *     `sanitizeInputs` and recomputes the whole view.
 *   - First-year contribution + sensitivity table recompute → the headline figure and
 *     the grid are derived from the live inputs on every render; nothing is cached.
 *   - Assumptions visibly labeled → an integrity banner states up front that every
 *     number is an editable hypothesis, and the full `ASSUMPTIONS` artifact is rendered
 *     as a table (CLAUDE.md §3 — no figure presented as observed data).
 *
 * Standards: Zero-Guilt (§1) — warm paper + calm-green, no red/penalty/streak chrome;
 * a cell below break-even is a calm muted tone, never an alarming red, and every
 * surfaced string clears the shared `isGuiltFree` guard. A11y — labelled slider inputs,
 * an `aria-live` headline, a real sensitivity/renewal/assumptions table with scoped
 * headers, visible focus rings and a dedicated `prefers-reduced-motion` block.
 * Pure: no clock, no storage — the model is a function of its inputs.
 */

import { useState } from 'react'
import { useReducedMotion } from '../flows/flowData'
import {
  ASSUMPTIONS,
  DEFAULT_INPUTS,
  blendedCacPerInstall,
  breakEvenConversion,
  formatPercent,
  formatUsd,
  perInstallEconomics,
  renewalScenarios,
  sanitizeInputs,
  sensitivityTable,
  type EconomicsInputs,
} from '../lib/subscriptionEconomics'
import './SubscriptionEconomics.css'

/** One editable lever's slider configuration. */
interface Lever {
  key: keyof EconomicsInputs
  label: string
  min: number
  max: number
  step: number
  /** How the live value is rendered next to the label. */
  kind: 'usd' | 'percent'
}

const LEVERS: readonly Lever[] = [
  { key: 'priceUsd', label: 'Annual price', min: 0, max: 80, step: 1, kind: 'usd' },
  { key: 'conversionRate', label: 'Install → paid conversion', min: 0, max: 0.2, step: 0.005, kind: 'percent' },
  { key: 'commissionRate', label: 'Store fee', min: 0, max: 0.5, step: 0.01, kind: 'percent' },
  { key: 'refundRate', label: 'Refund rate', min: 0, max: 0.3, step: 0.01, kind: 'percent' },
  { key: 'supportCostPerPaidUserUsd', label: 'Support cost / paying user', min: 0, max: 12, step: 0.5, kind: 'usd' },
  { key: 'cacPerPaidInstallUsd', label: 'Acquisition cost / paid install', min: 0, max: 6, step: 0.25, kind: 'usd' },
  { key: 'paidShare', label: 'Paid-channel share', min: 0, max: 1, step: 0.05, kind: 'percent' },
]

const RENEWAL_HORIZON_YEARS = 3

function leverValue(kind: Lever['kind'], value: number): string {
  return kind === 'usd' ? formatUsd(value) : formatPercent(value, value < 0.1 ? 1 : 0)
}

export default function SubscriptionEconomics() {
  const reducedMotion = useReducedMotion()
  const [inputs, setInputs] = useState<EconomicsInputs>(DEFAULT_INPUTS)
  /** Display scale: per single install, or per 1,000 installs (the tiny figures legibly). */
  const [perThousand, setPerThousand] = useState(false)

  const breakdown = perInstallEconomics(inputs)
  const grid = sensitivityTable(inputs)
  const renewals = renewalScenarios(inputs, RENEWAL_HORIZON_YEARS)
  const breakEven = breakEvenConversion(inputs)
  const cacPerInstall = blendedCacPerInstall(inputs)

  const scale = perThousand ? 1000 : 1
  const money = (v: number): string => formatUsd(v * scale)

  function setLever(key: keyof EconomicsInputs, raw: number): void {
    setInputs((prev) => sanitizeInputs({ ...prev, [key]: raw }))
  }

  const headline = breakdown.firstYearContributionPerInstall
  const headlinePositive = headline >= 0

  // The step-by-step waterfall of the first-year per-install economics.
  const waterfall: { label: string; value: number; kind: 'add' | 'sub' | 'total' }[] = [
    { label: 'Gross billing', value: breakdown.grossBillingPerInstall, kind: 'add' },
    { label: 'Refunds', value: -breakdown.refundedPerInstall, kind: 'sub' },
    { label: 'Net billing', value: breakdown.netBillingPerInstall, kind: 'total' },
    { label: 'Store fee', value: -breakdown.commissionPerInstall, kind: 'sub' },
    { label: 'Proceeds (after fee & refunds)', value: breakdown.proceedsPerInstall, kind: 'total' },
    { label: 'Support cost', value: -breakdown.supportPerInstall, kind: 'sub' },
    { label: 'Acquisition (CAC)', value: -breakdown.acquisitionPerInstall, kind: 'sub' },
  ]

  return (
    <div className={`se${reducedMotion ? ' reduce' : ''}`}>
      <div className="se-glow" aria-hidden="true" />

      <header className="se-head">
        <p className="se-eyebrow">Subscription economics model</p>
        <h2 className="se-title">What one install is worth — and what it costs to earn</h2>
        <p className="se-sub">
          Move any lever to see first-year contribution per install recompute, with a conversion × price sensitivity
          grid and multi-year renewal scenarios. It opens on the PRD §7 worked example.
        </p>
      </header>

      <p className="se-honest">
        Every number here is an editable assumption to validate — not observed data. The defaults reproduce the PRD §7
        example to the cent; the store fee and store eligibility still need verification before any plan rests on them.
      </p>

      {/* ---- editable inputs ---------------------------------------------- */}
      <section className="se-inputs" aria-label="Model inputs">
        <div className="se-inputs-head">
          <h3 className="se-h3">Inputs</h3>
          <button
            type="button"
            className="se-reset"
            onClick={() => setInputs(DEFAULT_INPUTS)}
            disabled={LEVERS.every((l) => inputs[l.key] === DEFAULT_INPUTS[l.key])}
          >
            Reset to PRD example
          </button>
        </div>
        <div className="se-levers">
          {LEVERS.map((lever) => {
            const value = inputs[lever.key]
            return (
              <label key={lever.key} className="se-lever">
                <span className="se-lever-top">
                  <span className="se-lever-label">{lever.label}</span>
                  <span className="se-lever-value">{leverValue(lever.kind, value)}</span>
                </span>
                <input
                  type="range"
                  className="se-slider"
                  min={lever.min}
                  max={lever.max}
                  step={lever.step}
                  value={value}
                  onChange={(e) => setLever(lever.key, Number(e.target.value))}
                />
              </label>
            )
          })}
        </div>
      </section>

      {/* ---- headline + breakdown ----------------------------------------- */}
      <section className="se-result" aria-label="First-year contribution">
        <div className={`se-headline${headlinePositive ? ' positive' : ' resting'}`}>
          <span className="se-headline-label">First-year contribution / install</span>
          <span className="se-headline-value" role="status" aria-live="polite">
            {money(headline)}
          </span>
          <span className="se-headline-note">
            {perThousand ? 'per 1,000 installs' : 'per install'} · proceeds {money(breakdown.proceedsPerInstall)} − support{' '}
            {money(breakdown.supportPerInstall)} − CAC {money(cacPerInstall)}
          </span>
        </div>

        <div className="se-scale">
          <span className="se-scale-label">Show figures</span>
          <div className="se-scale-toggle" role="radiogroup" aria-label="Display scale">
            <button type="button" role="radio" aria-checked={!perThousand} className={`se-scale-btn${!perThousand ? ' on' : ''}`} onClick={() => setPerThousand(false)}>
              per install
            </button>
            <button type="button" role="radio" aria-checked={perThousand} className={`se-scale-btn${perThousand ? ' on' : ''}`} onClick={() => setPerThousand(true)}>
              per 1,000
            </button>
          </div>
        </div>

        <table className="se-table se-waterfall">
          <caption className="se-caption">First-year per-install breakdown</caption>
          <tbody>
            {waterfall.map((row) => (
              <tr key={row.label} className={`se-wf-row se-wf-${row.kind}`}>
                <th scope="row">{row.label}</th>
                <td className="se-num">{row.value < 0 ? `− ${money(-row.value)}` : money(row.value)}</td>
              </tr>
            ))}
            <tr className="se-wf-row se-wf-headline">
              <th scope="row">First-year contribution</th>
              <td className="se-num">{money(headline)}</td>
            </tr>
          </tbody>
        </table>

        <p className="se-breakeven">
          {breakEven === null
            ? 'At these inputs, no install → paid conversion recovers the acquisition cost — raise price or lower CAC to open a break-even.'
            : `Break-even conversion is ${formatPercent(breakEven, 1)} — above it, each install contributes; at it, contribution is zero.`}
        </p>
      </section>

      {/* ---- sensitivity grid --------------------------------------------- */}
      <section className="se-sensitivity" aria-label="Sensitivity table">
        <h3 className="se-h3">Sensitivity — first-year contribution / install</h3>
        <p className="se-note">
          Conversion down the side, annual price across the top (PRD §7 price points). Every other input is held at the
          values above. A calm, muted cell is below break-even — a signal to tune the model, never a verdict.
        </p>
        <div className="se-grid-wrap">
          <table className="se-table se-grid">
            <caption className="se-caption">Contribution per install by conversion × price</caption>
            <thead>
              <tr>
                <th scope="col">Conversion</th>
                {grid.prices.map((price) => (
                  <th key={price} scope="col" className="se-num">
                    {formatUsd(price)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {grid.cells.map((rowCells, r) => {
                const conv = grid.conversions[r]
                return (
                  <tr key={conv ?? r}>
                    <th scope="row" className="se-num">
                      {conv !== undefined ? formatPercent(conv, 1) : '—'}
                    </th>
                    {rowCells.map((cell, c) => (
                      <td
                        key={`${r}-${c}`}
                        className={`se-num se-cell${cell.viable ? ' viable' : ' resting'}`}
                      >
                        {money(cell.contributionPerInstall)}
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* ---- renewal scenarios -------------------------------------------- */}
      <section className="se-renewal" aria-label="Renewal scenarios">
        <h3 className="se-h3">Renewal — {RENEWAL_HORIZON_YEARS}-year contribution / install</h3>
        <p className="se-note">
          Commercial retention (PRD §7): a paying cohort carried forward at a single annual renewal rate. Acquisition is
          booked once, in year one; the store fee and support recur each paid year.
        </p>
        <table className="se-table se-renew-table">
          <caption className="se-caption">Cumulative contribution per install over {RENEWAL_HORIZON_YEARS} years</caption>
          <thead>
            <tr>
              <th scope="col">Scenario</th>
              <th scope="col" className="se-num">Renewal</th>
              {Array.from({ length: RENEWAL_HORIZON_YEARS }, (_, i) => (
                <th key={i} scope="col" className="se-num">Y{i + 1} cumulative</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {renewals.map(({ scenario, projection }) => (
              <tr key={scenario.id}>
                <th scope="row">{scenario.label}</th>
                <td className="se-num">{formatPercent(scenario.renewalRate)}</td>
                {projection.years.map((year) => (
                  <td key={year.year} className="se-num">
                    {money(year.cumulativeContributionPerInstall)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* ---- assumptions -------------------------------------------------- */}
      <section className="se-assumptions" aria-label="Assumptions">
        <h3 className="se-h3">Assumptions — every one editable, none observed</h3>
        <table className="se-table se-assume-table">
          <caption className="se-caption">What each number means, and what it rests on</caption>
          <tbody>
            {ASSUMPTIONS.map((a) => (
              <tr key={a.key}>
                <th scope="row">{a.label}</th>
                <td>{a.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}
