/**
 * TASK-038 — Subscription economics model.
 *
 * "Model install-to-paid conversion, platform fees, refunds, CAC and renewal
 *  scenarios."
 *
 * Acceptance criterion (tasks.json TASK-038):
 *   "Inputs editable; first-year contribution and sensitivity table recompute;
 *    assumptions visibly labeled."
 *
 *   - Inputs editable → every lever (price, install→paid conversion, store
 *     commission, refund rate, support cost, CAC, paid share) is a plain field on
 *     `EconomicsInputs`. `sanitizeInputs` clamps a user-entered value into a sane
 *     range (rates to [0,1], money to ≥ 0) so an edit can never produce a nonsense
 *     model, and the pure functions recompute from whatever inputs they are handed.
 *   - First-year contribution + sensitivity table recompute → both are pure
 *     functions of the inputs: `perInstallEconomics` / `firstYearContributionPerInstall`
 *     derive the headline per-install contribution, and `sensitivityTable` recomputes
 *     a conversion × price grid of that same contribution. Change any input and both
 *     fall out again — nothing is cached or hard-coded.
 *   - Assumptions visibly labeled → `ASSUMPTIONS` documents every input and every
 *     modeling choice (commission charged on net-of-refund billing; support only on
 *     retained payers; renewal geometric; CAC only on the paid share; no
 *     time-discounting; excludes taxes / infrastructure / fixed costs) as a
 *     verifiable artifact the suite asserts covers each input — so the numbers are
 *     never presented as fact, only as clearly-flagged, editable hypotheses
 *     (CLAUDE.md §3).
 *
 * ── Grounding in PRD §7 ────────────────────────────────────────────────────────
 * The default inputs reproduce the PRD's own worked example exactly, so the headline
 * figures are traceable rather than invented:
 *   "At $39.99/year, 5% install-to-paid conversion and assumed 15% store commission,
 *    first-year proceeds per install are approximately $1.70, before refunds and
 *    operating costs. At $1.50 acquisition cost per install, contribution after
 *    acquisition is roughly $0.20 per install."
 * With refunds and support at 0 (as the PRD figure is "before refunds and operating
 * costs"), `perInstallEconomics(PRD_EXAMPLE_INPUTS)` yields proceeds ≈ $1.70 and a
 * first-year contribution ≈ $0.20 — asserted to the cent in the test. PRD §7 also
 * flags that "Commission assumptions and eligibility require verification", which the
 * `ASSUMPTIONS` artifact repeats, and asks to "Model cohorts, renewal, refunds, paid
 * CAC, organic acquisition and support costs before scaling" — the levers modelled here.
 *
 * ── Commercial retention (PRD §7) ──────────────────────────────────────────────
 * PRD §7 asks for three separately-measured outcomes; app + behavior retention live in
 * the TASK-034 cohort dashboard, and this model is the third — commercial retention —
 * via `projectRenewal` / `renewalScenarios`, which carry a paying cohort forward under
 * a geometric annual renewal rate.
 *
 * Framework-agnostic: imports no React (only the React-free `isGuiltFree` guard with a
 * `.ts` specifier), so the deterministic suite in `subscriptionEconomics.test.ts` runs
 * it directly under Node's TS stripping, exactly like `ledger.ts` / `entitlement.ts`.
 * There is no clock and no storage here — the model is a pure function of its inputs.
 */

import { isGuiltFree } from './restart.ts'

export { isGuiltFree }

/* ============================================================== inputs ====== */

/**
 * Every editable lever of the model. Each is an assumption to validate, never an
 * observed figure (see `ASSUMPTIONS`). Rates are fractions in [0,1]; money is USD.
 */
export interface EconomicsInputs {
  /** Annual subscription price in USD (PRD §7 hypothesis prices: 29.99 / 39.99 / 59.99). */
  priceUsd: number
  /** Install → paid conversion: the fraction of installs that buy in year one. */
  conversionRate: number
  /** Store commission as a fraction of developer billing (PRD §7 assumes 0.15 — verify). */
  commissionRate: number
  /** Fraction of year-one paid subscriptions that are refunded. */
  refundRate: number
  /** Support / service cost per retained paying user per year, in USD. */
  supportCostPerPaidUserUsd: number
  /** Customer acquisition cost per *paid-channel* install, in USD (PRD §7 example: 1.50). */
  cacPerPaidInstallUsd: number
  /** Fraction of installs acquired through paid channels (the rest are organic, CAC 0). */
  paidShare: number
}

/**
 * Default inputs — the PRD §7 worked example, so the UI opens on the project's own
 * traceable numbers. Refund and support are 0 here because the PRD's $1.70 / $0.20
 * figures are explicitly stated "before refunds and operating costs"; the surface lets
 * a reviewer raise them and watch contribution fall.
 */
export const DEFAULT_INPUTS: EconomicsInputs = {
  priceUsd: 39.99,
  conversionRate: 0.05,
  commissionRate: 0.15,
  refundRate: 0,
  supportCostPerPaidUserUsd: 0,
  cacPerPaidInstallUsd: 1.5,
  paidShare: 1,
}

/**
 * The PRD §7 example pinned as a named constant so the test can assert the model
 * reproduces the published $1.70 proceeds / $0.20 contribution to the cent.
 */
export const PRD_EXAMPLE_INPUTS: EconomicsInputs = { ...DEFAULT_INPUTS }

/** Clamp a value into [min, max]; non-finite falls back to `fallback`. */
function clamp(value: number, min: number, max: number, fallback: number): number {
  if (!Number.isFinite(value)) return fallback
  return Math.min(max, Math.max(min, value))
}

/**
 * Sanitize user-entered inputs so an edit can never produce a nonsense model:
 * rates are held in [0,1], money is held ≥ 0, and non-finite entries fall back to the
 * default for that field. Pure — returns a fresh object.
 */
export function sanitizeInputs(raw: Partial<EconomicsInputs>): EconomicsInputs {
  return {
    priceUsd: clamp(raw.priceUsd ?? DEFAULT_INPUTS.priceUsd, 0, 1000, DEFAULT_INPUTS.priceUsd),
    conversionRate: clamp(raw.conversionRate ?? DEFAULT_INPUTS.conversionRate, 0, 1, DEFAULT_INPUTS.conversionRate),
    commissionRate: clamp(raw.commissionRate ?? DEFAULT_INPUTS.commissionRate, 0, 1, DEFAULT_INPUTS.commissionRate),
    refundRate: clamp(raw.refundRate ?? DEFAULT_INPUTS.refundRate, 0, 1, DEFAULT_INPUTS.refundRate),
    supportCostPerPaidUserUsd: clamp(
      raw.supportCostPerPaidUserUsd ?? DEFAULT_INPUTS.supportCostPerPaidUserUsd,
      0,
      1000,
      DEFAULT_INPUTS.supportCostPerPaidUserUsd,
    ),
    cacPerPaidInstallUsd: clamp(raw.cacPerPaidInstallUsd ?? DEFAULT_INPUTS.cacPerPaidInstallUsd, 0, 1000, DEFAULT_INPUTS.cacPerPaidInstallUsd),
    paidShare: clamp(raw.paidShare ?? DEFAULT_INPUTS.paidShare, 0, 1, DEFAULT_INPUTS.paidShare),
  }
}

/* ===================================================== per-install model ==== */

/**
 * The year-one economics of a single install, decomposed step by step so every figure
 * is auditable. All values are USD *per install* (the natural denominator, since
 * conversion is defined install → paid).
 */
export interface FirstYearBreakdown {
  /** Gross billing before refunds: price × conversion. */
  grossBillingPerInstall: number
  /** Billing clawed back by refunds: gross × refundRate. */
  refundedPerInstall: number
  /** Billing kept after refunds: gross − refunded. */
  netBillingPerInstall: number
  /** Store commission on net billing: net × commissionRate. */
  commissionPerInstall: number
  /** Developer proceeds after commission & refunds — the PRD's "first-year proceeds per install". */
  proceedsPerInstall: number
  /** Expected retained paying users per install: conversion × (1 − refundRate). */
  retainedPayersPerInstall: number
  /** Support cost on those retained payers. */
  supportPerInstall: number
  /** Proceeds net of support, before acquisition. */
  contributionBeforeAcquisitionPerInstall: number
  /** Blended acquisition cost per install: paidShare × CAC. */
  acquisitionPerInstall: number
  /** The headline: contribution after acquisition, per install. */
  firstYearContributionPerInstall: number
}

/** Blended CAC across all installs: only the paid share carries a cost. */
export function blendedCacPerInstall(inputs: EconomicsInputs): number {
  return inputs.paidShare * inputs.cacPerPaidInstallUsd
}

/**
 * Compute the full year-one per-install breakdown. Pure; the ordering mirrors how the
 * money actually flows: bill → refund → commission → support → acquisition.
 */
export function perInstallEconomics(inputs: EconomicsInputs): FirstYearBreakdown {
  const grossBillingPerInstall = inputs.priceUsd * inputs.conversionRate
  const refundedPerInstall = grossBillingPerInstall * inputs.refundRate
  const netBillingPerInstall = grossBillingPerInstall - refundedPerInstall
  const commissionPerInstall = netBillingPerInstall * inputs.commissionRate
  const proceedsPerInstall = netBillingPerInstall - commissionPerInstall
  const retainedPayersPerInstall = inputs.conversionRate * (1 - inputs.refundRate)
  const supportPerInstall = retainedPayersPerInstall * inputs.supportCostPerPaidUserUsd
  const contributionBeforeAcquisitionPerInstall = proceedsPerInstall - supportPerInstall
  const acquisitionPerInstall = blendedCacPerInstall(inputs)
  const firstYearContributionPerInstall = contributionBeforeAcquisitionPerInstall - acquisitionPerInstall
  return {
    grossBillingPerInstall,
    refundedPerInstall,
    netBillingPerInstall,
    commissionPerInstall,
    proceedsPerInstall,
    retainedPayersPerInstall,
    supportPerInstall,
    contributionBeforeAcquisitionPerInstall,
    acquisitionPerInstall,
    firstYearContributionPerInstall,
  }
}

/** Convenience: just the headline first-year contribution per install. */
export function firstYearContributionPerInstall(inputs: EconomicsInputs): number {
  return perInstallEconomics(inputs).firstYearContributionPerInstall
}

/**
 * The break-even install→paid conversion: the conversion at which first-year
 * contribution per install is exactly zero, holding every other input fixed. Returns
 * null when it is undefined (e.g. a free price, where no conversion ever recovers CAC).
 * Useful as an honest "what would it take?" readout, never a target.
 */
export function breakEvenConversion(inputs: EconomicsInputs): number | null {
  // firstYear(conv) = conv · price · (1−refund) · [(1−commission) − supportShareTerm] − acquisition
  // The per-unit-conversion contribution margin:
  const marginPerConversion =
    inputs.priceUsd * (1 - inputs.refundRate) * (1 - inputs.commissionRate) -
    (1 - inputs.refundRate) * inputs.supportCostPerPaidUserUsd
  if (marginPerConversion <= 0) return null
  const conv = blendedCacPerInstall(inputs) / marginPerConversion
  if (!Number.isFinite(conv) || conv > 1) return null
  return conv
}

/* ========================================================= renewal model ==== */

/** One modelled subscription year within a renewal projection (per install). */
export interface RenewalYear {
  /** 1-based year index (year 1 is the acquisition year). */
  year: number
  /** Expected paying users still subscribed this year, per install. */
  payingUsersPerInstall: number
  /** Developer proceeds this year (after commission), per install. */
  proceedsPerInstall: number
  /** Support cost this year, per install. */
  supportPerInstall: number
  /** Acquisition cost booked this year (only year 1), per install. */
  acquisitionPerInstall: number
  /** Net contribution this year, per install. */
  contributionPerInstall: number
  /** Running sum of contribution through this year, per install. */
  cumulativeContributionPerInstall: number
}

/** A full multi-year projection at one renewal rate. */
export interface RenewalProjection {
  renewalRate: number
  horizonYears: number
  years: readonly RenewalYear[]
  /** Contribution per install summed across the whole horizon. */
  cumulativeContributionPerInstall: number
}

/**
 * Carry a paying cohort forward under a geometric annual renewal rate. Year 1 pays as
 * in `perInstallEconomics`; each later year the paying base is multiplied by the
 * renewal rate. Commission and support recur every paid year; acquisition is booked
 * once, in year 1. Pure. `horizonYears` ≥ 1; a renewal rate outside [0,1] is clamped.
 */
export function projectRenewal(
  inputs: EconomicsInputs,
  horizonYears: number,
  renewalRate: number,
): RenewalProjection {
  const horizon = Math.max(1, Math.floor(horizonYears))
  const rate = clamp(renewalRate, 0, 1, 0)
  const base = perInstallEconomics(inputs)
  const acquisitionPerInstall = base.acquisitionPerInstall
  const perPayerProceeds = inputs.priceUsd * (1 - inputs.commissionRate)
  const perPayerSupport = inputs.supportCostPerPaidUserUsd

  const years: RenewalYear[] = []
  let cumulative = 0
  let payers = base.retainedPayersPerInstall // year-1 retained paying users per install
  for (let year = 1; year <= horizon; year += 1) {
    if (year > 1) payers *= rate
    const proceedsPerInstall = payers * perPayerProceeds
    const supportPerInstall = payers * perPayerSupport
    const acq = year === 1 ? acquisitionPerInstall : 0
    const contributionPerInstall = proceedsPerInstall - supportPerInstall - acq
    cumulative += contributionPerInstall
    years.push({
      year,
      payingUsersPerInstall: payers,
      proceedsPerInstall,
      supportPerInstall,
      acquisitionPerInstall: acq,
      contributionPerInstall,
      cumulativeContributionPerInstall: cumulative,
    })
  }
  return { renewalRate: rate, horizonYears: horizon, years, cumulativeContributionPerInstall: cumulative }
}

/** A labelled renewal scenario (e.g. conservative / base / strong). */
export interface RenewalScenario {
  id: string
  label: string
  renewalRate: number
}

/** Three illustrative renewal scenarios — all hypotheses to validate, never forecasts. */
export const DEFAULT_RENEWAL_SCENARIOS: readonly RenewalScenario[] = [
  { id: 'conservative', label: 'Conservative', renewalRate: 0.4 },
  { id: 'base', label: 'Base', renewalRate: 0.55 },
  { id: 'strong', label: 'Strong', renewalRate: 0.7 },
]

/** Project every scenario over the horizon, returning one projection per scenario. */
export function renewalScenarios(
  inputs: EconomicsInputs,
  horizonYears: number,
  scenarios: readonly RenewalScenario[] = DEFAULT_RENEWAL_SCENARIOS,
): readonly { scenario: RenewalScenario; projection: RenewalProjection }[] {
  return scenarios.map((scenario) => ({
    scenario,
    projection: projectRenewal(inputs, horizonYears, scenario.renewalRate),
  }))
}

/* ====================================================== sensitivity table === */

/** The default conversion rates down the sensitivity rows. */
export const DEFAULT_SENSITIVITY_CONVERSIONS: readonly number[] = [0.03, 0.04, 0.05, 0.06, 0.08]
/** The default prices across the sensitivity columns (PRD §7 hypothesis prices). */
export const DEFAULT_SENSITIVITY_PRICES: readonly number[] = [29.99, 39.99, 59.99]

/** One cell of the sensitivity grid. */
export interface SensitivityCell {
  conversionRate: number
  priceUsd: number
  /** First-year contribution per install at this (conversion, price), other inputs held. */
  contributionPerInstall: number
  /** True when the cell is at or above break-even (contribution ≥ 0). */
  viable: boolean
}

/** A full sensitivity grid: contribution per install over conversion × price. */
export interface SensitivityTable {
  conversions: readonly number[]
  prices: readonly number[]
  /** Row-major grid: `cells[rowIndex][colIndex]`, rows = conversions, cols = prices. */
  cells: readonly (readonly SensitivityCell[])[]
}

/**
 * Recompute a conversion × price sensitivity grid of first-year contribution per
 * install, holding every other input fixed. Pure — this is the "sensitivity table
 * recomputes" deliverable: hand it fresh inputs and the whole grid falls out again.
 */
export function sensitivityTable(
  inputs: EconomicsInputs,
  conversions: readonly number[] = DEFAULT_SENSITIVITY_CONVERSIONS,
  prices: readonly number[] = DEFAULT_SENSITIVITY_PRICES,
): SensitivityTable {
  const cells = conversions.map((conversionRate) =>
    prices.map((priceUsd): SensitivityCell => {
      const contributionPerInstall = firstYearContributionPerInstall({
        ...inputs,
        conversionRate,
        priceUsd,
      })
      return { conversionRate, priceUsd, contributionPerInstall, viable: contributionPerInstall >= 0 }
    }),
  )
  return { conversions, prices, cells }
}

/* ============================================================ assumptions ==== */

/** One documented assumption behind the model — the "assumptions visibly labeled" artifact. */
export interface Assumption {
  key: string
  label: string
  detail: string
}

/**
 * Every input and every modeling choice, documented as a verifiable artifact (not just
 * a comment). `subscriptionEconomics.test.ts` asserts this covers each `EconomicsInputs`
 * field, so the surface can label every number as a flagged, editable hypothesis and the
 * documentation cannot silently rot (CLAUDE.md §3 — no figure presented as fact).
 */
export const ASSUMPTIONS: readonly Assumption[] = [
  {
    key: 'priceUsd',
    label: 'Annual price (hypothesis)',
    detail: 'PRD §7 price points to validate — $29.99 / $39.99 / $59.99 — not a chosen price.',
  },
  {
    key: 'conversionRate',
    label: 'Install → paid conversion (hypothesis)',
    detail: 'The fraction of installs that subscribe in year one. PRD §7 illustrative value: 5%.',
  },
  {
    key: 'commissionRate',
    label: 'Store fee (requires verification)',
    detail: 'PRD §7 assumes a 15% platform fee and flags that store-fee assumptions and eligibility require verification; standard rates can be higher.',
  },
  {
    key: 'refundRate',
    label: 'Refund rate (hypothesis)',
    detail: 'Fraction of year-one subscriptions refunded. Removed before the store fee here.',
  },
  {
    key: 'supportCostPerPaidUserUsd',
    label: 'Support cost per paying user (hypothesis)',
    detail: 'Annual service cost applied only to retained paying users, not to every install.',
  },
  {
    key: 'cacPerPaidInstallUsd',
    label: 'Acquisition cost per paid install (hypothesis)',
    detail: 'PRD §7 illustrative value: $1.50. Applied only to paid-channel installs.',
  },
  {
    key: 'paidShare',
    label: 'Paid-channel share (hypothesis)',
    detail: 'Fraction of installs acquired through paid channels; the rest are organic and carry no CAC.',
  },
  {
    key: 'model.commissionOnNet',
    label: 'The store fee is charged on net-of-refund billing',
    detail: 'The platform fee applies after refunds are removed, not to gross billing.',
  },
  {
    key: 'model.renewalGeometric',
    label: 'Renewal is geometric',
    detail: 'Each year the paying base is multiplied by a single annual renewal rate; acquisition is booked once, in year one.',
  },
  {
    key: 'model.noDiscounting',
    label: 'No time-discounting',
    detail: 'Multi-year contribution is summed undiscounted; it excludes the time value of money.',
  },
  {
    key: 'model.excludesFixedCosts',
    label: 'Excludes taxes, infrastructure and fixed costs',
    detail: 'The model is a per-install contribution before taxes, platform infrastructure and fixed operating costs.',
  },
]

/** The input fields the assumptions artifact must document (enforced by the test). */
export const INPUT_KEYS: readonly (keyof EconomicsInputs)[] = [
  'priceUsd',
  'conversionRate',
  'commissionRate',
  'refundRate',
  'supportCostPerPaidUserUsd',
  'cacPerPaidInstallUsd',
  'paidShare',
]

/* ============================================================ formatting ==== */

/** Format a USD amount at cent precision (display only; the model keeps raw floats). */
export function formatUsd(value: number): string {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
  } catch {
    return `$${value.toFixed(2)}`
  }
}

/** Format a fraction in [0,1] as a percent string (e.g. 0.05 → "5%"). */
export function formatPercent(fraction: number, decimals = 0): string {
  return `${(fraction * 100).toFixed(decimals)}%`
}

/** Every piece of copy the model surfaces, for the guilt-free scan (CLAUDE.md §1). */
export function economicsCopy(): readonly string[] {
  return [
    'Subscription economics model',
    'Every number here is an editable assumption to validate, never observed data.',
    'First-year contribution per install recomputes as you change any input.',
    'The sensitivity grid shows contribution per install across conversion and price.',
    'Renewal scenarios carry a paying cohort forward at a single annual renewal rate.',
    'The store fee and store eligibility still need verification before any plan rests on them.',
    ...ASSUMPTIONS.flatMap((a) => [a.label, a.detail]),
  ]
}
