/**
 * TASK-038 — Deterministic test cases for the subscription economics model.
 *
 * Acceptance criterion (tasks.json TASK-038):
 *   "Inputs editable; first-year contribution and sensitivity table recompute;
 *    assumptions visibly labeled."
 *
 * The suite drives the real engine to prove each clause:
 *   - inputs editable → `sanitizeInputs` clamps rates to [0,1] and money to ≥ 0, and
 *     the pure functions recompute from whatever inputs they are handed;
 *   - first-year contribution + sensitivity table recompute → the PRD §7 worked
 *     example reproduces to the cent, and both the headline contribution and the full
 *     sensitivity grid change when an input changes;
 *   - assumptions visibly labeled → `ASSUMPTIONS` documents every input field and the
 *     key modeling choices.
 *
 * Dependency-free and self-contained (the prototype has no test runner), matching the
 * TASK-026…037 pattern. Type-checked by `tsc -b` and directly executable —
 * `node src/lib/subscriptionEconomics.test.ts` — under Node's native TS stripping.
 * On any failure the process throws non-zero.
 */

import {
  ASSUMPTIONS,
  DEFAULT_INPUTS,
  DEFAULT_RENEWAL_SCENARIOS,
  DEFAULT_SENSITIVITY_CONVERSIONS,
  DEFAULT_SENSITIVITY_PRICES,
  INPUT_KEYS,
  PRD_EXAMPLE_INPUTS,
  blendedCacPerInstall,
  breakEvenConversion,
  economicsCopy,
  firstYearContributionPerInstall,
  isGuiltFree,
  perInstallEconomics,
  projectRenewal,
  renewalScenarios,
  sanitizeInputs,
  sensitivityTable,
  type EconomicsInputs,
} from './subscriptionEconomics.ts'

/* ------------------------------------------------------- assert harness ---- */

const failures: string[] = []
let currentCase = ''

function assert(condition: boolean, message: string): void {
  if (!condition) failures.push(`[${currentCase}] ${message}`)
}

function assertEqual<T>(actual: T, expected: T, label: string): void {
  if (actual !== expected) {
    failures.push(`[${currentCase}] ${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`)
  }
}

/** Floating-point comparison to a cent (1e-6 tolerance is far tighter than a cent). */
function assertClose(actual: number, expected: number, label: string, epsilon = 1e-6): void {
  if (Math.abs(actual - expected) > epsilon) {
    failures.push(`[${currentCase}] ${label}: expected ≈ ${expected}, got ${actual}`)
  }
}

/* ================================================================ cases ==== */

/* --- 1. PRD §7 worked example reproduces to the cent ----------------------- */

currentCase = 'PRD example: $1.70 proceeds / $0.20 contribution per install'
{
  const b = perInstallEconomics(PRD_EXAMPLE_INPUTS)
  // gross = 39.99 × 0.05 = 1.9995
  assertClose(b.grossBillingPerInstall, 1.9995, 'gross billing per install')
  // no refunds in the PRD figure
  assertClose(b.refundedPerInstall, 0, 'no refunds in the PRD example')
  assertClose(b.netBillingPerInstall, 1.9995, 'net billing equals gross with no refunds')
  // proceeds = 1.9995 × (1 − 0.15) = 1.699575 ≈ $1.70
  assertClose(b.proceedsPerInstall, 1.699575, 'proceeds per install ≈ $1.70')
  assertEqual(Math.round(b.proceedsPerInstall * 100) / 100, 1.7, 'proceeds round to $1.70')
  // contribution = 1.699575 − 1.50 = 0.199575 ≈ $0.20
  assertClose(b.firstYearContributionPerInstall, 0.199575, 'first-year contribution ≈ $0.20')
  assertEqual(Math.round(b.firstYearContributionPerInstall * 100) / 100, 0.2, 'contribution rounds to $0.20')
  // the DEFAULT inputs are the PRD example, so the UI opens on these exact numbers
  assertClose(firstYearContributionPerInstall(DEFAULT_INPUTS), 0.199575, 'default inputs reproduce the PRD contribution')
}

/* --- 2. the breakdown is internally consistent ----------------------------- */

currentCase = 'breakdown: each step reconciles with the next'
{
  const inputs: EconomicsInputs = {
    priceUsd: 39.99,
    conversionRate: 0.05,
    commissionRate: 0.3,
    refundRate: 0.1,
    supportCostPerPaidUserUsd: 2,
    cacPerPaidInstallUsd: 1.5,
    paidShare: 0.8,
  }
  const b = perInstallEconomics(inputs)
  assertClose(b.grossBillingPerInstall, 39.99 * 0.05, 'gross')
  assertClose(b.refundedPerInstall, b.grossBillingPerInstall * 0.1, 'refunded = gross × refundRate')
  assertClose(b.netBillingPerInstall, b.grossBillingPerInstall - b.refundedPerInstall, 'net = gross − refunded')
  assertClose(b.commissionPerInstall, b.netBillingPerInstall * 0.3, 'commission = net × rate')
  assertClose(b.proceedsPerInstall, b.netBillingPerInstall - b.commissionPerInstall, 'proceeds = net − commission')
  assertClose(b.retainedPayersPerInstall, 0.05 * 0.9, 'retained payers = conversion × (1 − refund)')
  assertClose(b.supportPerInstall, b.retainedPayersPerInstall * 2, 'support = retained payers × cost')
  assertClose(
    b.contributionBeforeAcquisitionPerInstall,
    b.proceedsPerInstall - b.supportPerInstall,
    'contribution before acq = proceeds − support',
  )
  assertClose(b.acquisitionPerInstall, 0.8 * 1.5, 'acq = paidShare × CAC')
  assertClose(
    b.firstYearContributionPerInstall,
    b.contributionBeforeAcquisitionPerInstall - b.acquisitionPerInstall,
    'first-year contribution = contribution before acq − acq',
  )
}

/* --- 3. blended CAC only charges the paid share ---------------------------- */

currentCase = 'CAC: only the paid-channel share carries an acquisition cost'
{
  assertClose(blendedCacPerInstall({ ...DEFAULT_INPUTS, paidShare: 1, cacPerPaidInstallUsd: 1.5 }), 1.5, 'fully paid → full CAC')
  assertClose(blendedCacPerInstall({ ...DEFAULT_INPUTS, paidShare: 0.5, cacPerPaidInstallUsd: 1.5 }), 0.75, 'half paid → half CAC')
  assertClose(blendedCacPerInstall({ ...DEFAULT_INPUTS, paidShare: 0, cacPerPaidInstallUsd: 1.5 }), 0, 'all organic → no CAC')
  // all-organic lifts contribution by the full CAC
  const paid = firstYearContributionPerInstall({ ...DEFAULT_INPUTS, paidShare: 1 })
  const organic = firstYearContributionPerInstall({ ...DEFAULT_INPUTS, paidShare: 0 })
  assertClose(organic - paid, 1.5, 'removing CAC lifts contribution by $1.50')
}

/* --- 4. first-year contribution RECOMPUTES when an input changes ------------ */

currentCase = 'recompute: the headline contribution responds to every lever'
{
  const base = firstYearContributionPerInstall(DEFAULT_INPUTS)
  assert(firstYearContributionPerInstall({ ...DEFAULT_INPUTS, priceUsd: 59.99 }) > base, 'a higher price raises contribution')
  assert(firstYearContributionPerInstall({ ...DEFAULT_INPUTS, conversionRate: 0.08 }) > base, 'higher conversion raises contribution')
  assert(firstYearContributionPerInstall({ ...DEFAULT_INPUTS, commissionRate: 0.3 }) < base, 'higher commission lowers contribution')
  assert(firstYearContributionPerInstall({ ...DEFAULT_INPUTS, refundRate: 0.2 }) < base, 'higher refunds lower contribution')
  assert(firstYearContributionPerInstall({ ...DEFAULT_INPUTS, cacPerPaidInstallUsd: 3 }) < base, 'higher CAC lowers contribution')
  assert(
    firstYearContributionPerInstall({ ...DEFAULT_INPUTS, supportCostPerPaidUserUsd: 5 }) < base,
    'higher support cost lowers contribution',
  )
}

/* --- 5. sensitivity table shape + RECOMPUTE -------------------------------- */

currentCase = 'sensitivity: grid is well-shaped and each cell matches a direct recompute'
{
  const table = sensitivityTable(DEFAULT_INPUTS)
  assertEqual(table.conversions.length, DEFAULT_SENSITIVITY_CONVERSIONS.length, 'row count = conversions')
  assertEqual(table.prices.length, DEFAULT_SENSITIVITY_PRICES.length, 'col count = prices')
  assertEqual(table.cells.length, DEFAULT_SENSITIVITY_CONVERSIONS.length, 'cells has one row per conversion')
  for (let r = 0; r < table.cells.length; r += 1) {
    const row = table.cells[r]
    const conversionRate = table.conversions[r]
    assert(row !== undefined && conversionRate !== undefined, `row ${r} present`)
    if (!row || conversionRate === undefined) continue
    assertEqual(row.length, DEFAULT_SENSITIVITY_PRICES.length, `row ${r} has one cell per price`)
    for (let c = 0; c < row.length; c += 1) {
      const cell = row[c]
      const priceUsd = table.prices[c]
      assert(cell !== undefined && priceUsd !== undefined, `cell ${r},${c} present`)
      if (!cell || priceUsd === undefined) continue
      // every cell equals a direct recompute at that (conversion, price)
      const expected = firstYearContributionPerInstall({ ...DEFAULT_INPUTS, conversionRate, priceUsd })
      assertClose(cell.contributionPerInstall, expected, `cell ${r},${c} recomputes correctly`)
      assertEqual(cell.viable, expected >= 0, `cell ${r},${c} viability flag matches sign`)
    }
  }
  // the PRD cell (5% conversion, $39.99) sits in the grid and matches the headline
  const prdRow = table.cells[DEFAULT_SENSITIVITY_CONVERSIONS.indexOf(0.05)]
  const prdCell = prdRow?.[DEFAULT_SENSITIVITY_PRICES.indexOf(39.99)]
  assert(prdCell !== undefined, 'the PRD (5%, $39.99) cell exists')
  if (prdCell) assertClose(prdCell.contributionPerInstall, 0.199575, 'the PRD cell is $0.20')
}

currentCase = 'sensitivity: the grid recomputes wholesale when inputs change'
{
  const cheapCac = sensitivityTable({ ...DEFAULT_INPUTS, cacPerPaidInstallUsd: 0.5 })
  const dearCac = sensitivityTable({ ...DEFAULT_INPUTS, cacPerPaidInstallUsd: 3 })
  // every corresponding cell is $2.50 higher when CAC falls from 3.00 to 0.50 (paidShare 1)
  for (let r = 0; r < cheapCac.cells.length; r += 1) {
    const cheapRow = cheapCac.cells[r]
    const dearRow = dearCac.cells[r]
    if (!cheapRow || !dearRow) continue
    for (let c = 0; c < cheapRow.length; c += 1) {
      const cheap = cheapRow[c]
      const dear = dearRow[c]
      if (!cheap || !dear) continue
      assertClose(cheap.contributionPerInstall - dear.contributionPerInstall, 2.5, `cell ${r},${c} shifts with CAC`)
    }
  }
}

/* --- 6. break-even conversion ---------------------------------------------- */

currentCase = 'break-even: the conversion where contribution is exactly zero'
{
  const be = breakEvenConversion(DEFAULT_INPUTS)
  assert(be !== null, 'a break-even conversion exists for the default inputs')
  if (be !== null) {
    assert(be > 0 && be < 1, 'break-even conversion is a sensible fraction')
    // at exactly break-even, first-year contribution is ~0
    assertClose(firstYearContributionPerInstall({ ...DEFAULT_INPUTS, conversionRate: be }), 0, 'contribution is zero at break-even')
  }
  // a free price can never recover CAC → no break-even
  assertEqual(breakEvenConversion({ ...DEFAULT_INPUTS, priceUsd: 0 }), null, 'free price → no break-even')
}

/* --- 7. renewal projection carries a cohort forward ------------------------ */

currentCase = 'renewal: a paying cohort decays geometrically, acq booked once'
{
  const proj = projectRenewal(DEFAULT_INPUTS, 3, 0.5)
  assertEqual(proj.years.length, 3, 'three modelled years')
  const y1 = proj.years[0]
  const y2 = proj.years[1]
  const y3 = proj.years[2]
  assert(y1 !== undefined && y2 !== undefined && y3 !== undefined, 'all three years present')
  if (y1 && y2 && y3) {
    // year-1 payers = conversion × (1 − refund) = 0.05
    assertClose(y1.payingUsersPerInstall, 0.05, 'year-1 payers per install')
    // each later year the base halves (renewal 0.5)
    assertClose(y2.payingUsersPerInstall, 0.025, 'year-2 payers = year-1 × 0.5')
    assertClose(y3.payingUsersPerInstall, 0.0125, 'year-3 payers = year-2 × 0.5')
    // acquisition is booked in year 1 only
    assertClose(y1.acquisitionPerInstall, 1.5, 'acq booked in year 1')
    assertClose(y2.acquisitionPerInstall, 0, 'no acq in year 2')
    assertClose(y3.acquisitionPerInstall, 0, 'no acq in year 3')
    // year-1 contribution equals the standalone first-year model
    assertClose(y1.contributionPerInstall, firstYearContributionPerInstall(DEFAULT_INPUTS), 'year-1 contribution matches first-year model')
    // cumulative is the running sum
    assertClose(
      proj.cumulativeContributionPerInstall,
      y1.contributionPerInstall + y2.contributionPerInstall + y3.contributionPerInstall,
      'cumulative = sum of yearly contributions',
    )
    assertClose(y3.cumulativeContributionPerInstall, proj.cumulativeContributionPerInstall, 'last year carries the full cumulative')
  }
}

currentCase = 'renewal: a higher renewal rate never lowers lifetime contribution'
{
  const low = projectRenewal(DEFAULT_INPUTS, 5, 0.4).cumulativeContributionPerInstall
  const high = projectRenewal(DEFAULT_INPUTS, 5, 0.7).cumulativeContributionPerInstall
  assert(high > low, 'stronger renewal → more lifetime contribution')
  // zero renewal collapses to exactly the first-year model
  const noRenewal = projectRenewal(DEFAULT_INPUTS, 5, 0).cumulativeContributionPerInstall
  assertClose(noRenewal, firstYearContributionPerInstall(DEFAULT_INPUTS), 'no renewal → lifetime = year 1')
}

currentCase = 'renewal scenarios: three labelled projections over the horizon'
{
  const rows = renewalScenarios(DEFAULT_INPUTS, 3)
  assertEqual(rows.length, DEFAULT_RENEWAL_SCENARIOS.length, 'one projection per scenario')
  for (const { scenario, projection } of rows) {
    assertEqual(projection.renewalRate, scenario.renewalRate, `${scenario.id}: projection uses the scenario rate`)
    assertEqual(projection.horizonYears, 3, `${scenario.id}: horizon honored`)
  }
}

/* --- 8. inputs are editable but clamped ------------------------------------ */

currentCase = 'sanitize: edits are clamped into a sane range, never a nonsense model'
{
  const wild = sanitizeInputs({
    priceUsd: -10,
    conversionRate: 1.5,
    commissionRate: -0.2,
    refundRate: 2,
    supportCostPerPaidUserUsd: -5,
    cacPerPaidInstallUsd: -1,
    paidShare: 9,
  })
  assertEqual(wild.priceUsd, 0, 'negative price clamps to 0')
  assertEqual(wild.conversionRate, 1, 'conversion over 1 clamps to 1')
  assertEqual(wild.commissionRate, 0, 'negative commission clamps to 0')
  assertEqual(wild.refundRate, 1, 'refund over 1 clamps to 1')
  assertEqual(wild.supportCostPerPaidUserUsd, 0, 'negative support clamps to 0')
  assertEqual(wild.cacPerPaidInstallUsd, 0, 'negative CAC clamps to 0')
  assertEqual(wild.paidShare, 1, 'paid share over 1 clamps to 1')
  // a non-finite entry falls back to the default for that field
  assertEqual(sanitizeInputs({ priceUsd: Number.NaN }).priceUsd, DEFAULT_INPUTS.priceUsd, 'NaN price falls back to default')
  // a partial edit keeps the untouched fields at their defaults
  const partial = sanitizeInputs({ conversionRate: 0.07 })
  assertEqual(partial.conversionRate, 0.07, 'the edited field takes the new value')
  assertEqual(partial.priceUsd, DEFAULT_INPUTS.priceUsd, 'untouched fields keep their default')
}

/* --- 9. assumptions document every input (visibly labeled) ----------------- */

currentCase = 'assumptions: every input field is documented, plus modeling choices'
{
  assert(ASSUMPTIONS.length > 0, 'there are documented assumptions')
  for (const a of ASSUMPTIONS) {
    assert(a.key.length > 0, 'assumption has a key')
    assert(a.label.length > 0, `assumption "${a.key}" has a label`)
    assert(a.detail.length > 0, `assumption "${a.key}" has a detail`)
  }
  // every editable input is covered by name
  for (const key of INPUT_KEYS) {
    assert(ASSUMPTIONS.some((a) => a.key === key), `input "${key}" is documented in the assumptions`)
  }
  // the key modeling choices are documented too
  for (const key of ['model.commissionOnNet', 'model.renewalGeometric', 'model.noDiscounting', 'model.excludesFixedCosts']) {
    assert(ASSUMPTIONS.some((a) => a.key === key), `modeling choice "${key}" is documented`)
  }
}

/* --- 10. zero-guilt copy (CLAUDE.md §1) ------------------------------------ */

currentCase = 'zero-guilt: every surfaced string is guilt-free'
{
  const lines = economicsCopy()
  assert(lines.length > 0, 'there is copy to check')
  for (const line of lines) {
    assert(isGuiltFree(line), `copy is guilt-free: "${line}"`)
  }
  // guard is non-trivial: a shaming line is rejected
  assert(!isGuiltFree('You failed to hit your conversion target and fell behind.'), 'guard rejects shame copy')
}

/* =============================================================== report ==== */

const TOTAL_GROUPS = 12
if (failures.length > 0) {
  console.error(`\n✗ subscriptionEconomics.test.ts — ${failures.length} assertion(s) failed:\n`)
  for (const f of failures) console.error('  • ' + f)
  console.error('')
  throw new Error(`subscriptionEconomics.test.ts failed with ${failures.length} failing assertion(s).`)
}
console.log(`✓ subscriptionEconomics.test.ts — all ${TOTAL_GROUPS} case groups passed.`)
