/**
 * TASK-034 — Deterministic test cases for the cohort retention dashboard.
 *
 * Acceptance criterion (tasks.json TASK-034):
 *   "Cohort definitions documented; test dataset yields expected rates;
 *    incomplete cohorts marked immature."
 *
 * The suite drives the real `buildRetention` engine to prove each clause:
 *   - cohort definitions documented → `COHORT_DEFINITIONS` is non-empty, every entry
 *     is well-formed, and it covers both named metrics and the maturity rule;
 *   - test dataset yields expected rates → every per-cohort and pooled app/behavior
 *     rate on the shared `SAMPLE_RETENTION_DATASET` is hand-computed and asserted;
 *   - incomplete cohorts marked immature → the young cohort reports D1 but marks
 *     D7/D30/D90 immature (rate null, mature false), and the pooled overall only
 *     counts cohorts that are mature for each horizon.
 *
 * Dependency-free and self-contained (the prototype has no test runner), matching the
 * TASK-026…033 pattern. Type-checked by `tsc -b` and directly executable —
 * `node src/lib/cohortRetention.test.ts` — under Node's native TS stripping. The
 * engine imports only the React-free `isGuiltFree` guard, so Node never loads a
 * React-dependent module. On any failure the process throws non-zero.
 */

import {
  COHORT_DEFINITIONS,
  HYPOTHESIS_TARGETS,
  RETENTION_HORIZONS,
  SAMPLE_AS_OF_DAY,
  SAMPLE_RETENTION_DATASET,
  buildRetention,
  firstSeenDay,
  formatRate,
  hypothesisTarget,
  isGuiltFree,
  retentionCopy,
  type CohortRow,
  type RetentionMetric,
} from './cohortRetention.ts'

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

/** Compare rates (or null) with a small epsilon for float division. */
function assertRate(actual: number | null, expected: number | null, label: string): void {
  if (expected === null || actual === null) {
    assertEqual(actual, expected, label)
    return
  }
  if (Math.abs(actual - expected) > 1e-9) {
    failures.push(`[${currentCase}] ${label}: expected ${expected}, got ${actual}`)
  }
}

/* --------------------------------------------------------------- helpers ---- */

const HORIZON_INDEX: Record<number, number> = { 1: 0, 7: 1, 30: 2, 90: 3 }

function cell(cohort: CohortRow, metric: RetentionMetric, horizon: number) {
  const idx = HORIZON_INDEX[horizon] ?? -1
  return (metric === 'app' ? cohort.app : cohort.behavior)[idx]
}

/* ================================================================ cases ==== */

/* --- 1. cohort definitions are documented ---------------------------------- */

currentCase = 'definitions: documented, well-formed, covering both metrics + maturity'
{
  assert(COHORT_DEFINITIONS.length >= 5, 'at least five cohort terms documented')
  assert(
    COHORT_DEFINITIONS.every((d) => d.term.trim().length > 0 && d.definition.trim().length > 0),
    'every definition has a non-empty term and body',
  )
  const blob = COHORT_DEFINITIONS.map((d) => `${d.term} ${d.definition}`.toLowerCase()).join(' ')
  assert(blob.includes('app retention'), 'app retention is defined')
  assert(blob.includes('behavior retention'), 'behavior retention is defined')
  assert(blob.includes('day 0'), 'the cohort day-0 anchor is defined')
  assert(blob.includes('immature') || blob.includes('mature'), 'the maturity rule is defined')
  assert(blob.includes('denominator'), 'the denominator is defined')
}

/* --- 2. horizons are exactly D1/D7/D30/D90 in order ------------------------ */

currentCase = 'horizons: exactly D1, D7, D30, D90 ascending'
{
  assertEqual(JSON.stringify([...RETENTION_HORIZONS]), JSON.stringify([1, 7, 30, 90]), 'horizons list')
}

/* --- 3. first-seen day derivation ------------------------------------------ */

currentCase = 'first-seen: earliest of app ∪ behavior; null when never seen'
{
  assertEqual(firstSeenDay({ userKey: 'u', appActiveDays: [10, 12], behaviorDays: [11] }), 10, 'app earliest')
  assertEqual(firstSeenDay({ userKey: 'u', appActiveDays: [12], behaviorDays: [9, 20] }), 9, 'behavior earliest')
  assertEqual(firstSeenDay({ userKey: 'u', appActiveDays: [], behaviorDays: [5] }), 5, 'behavior-only falls back')
  assertEqual(firstSeenDay({ userKey: 'u', appActiveDays: [], behaviorDays: [] }), null, 'never seen → null')
}

/* --- 4. sample dataset: cohort grouping + sizes ---------------------------- */

const report = buildRetention(SAMPLE_RETENTION_DATASET, SAMPLE_AS_OF_DAY)

currentCase = 'grouping: two cohorts, newest first, correct sizes'
{
  assertEqual(report.userCount, 6, 'all six users included')
  assertEqual(report.cohorts.length, 2, 'two distinct cohort days')
  // newest cohort (B, started 5 days ago) first
  assertEqual(report.cohorts[0]?.daysElapsed, 5, 'first row is the young cohort (5 days elapsed)')
  assertEqual(report.cohorts[0]?.size, 2, 'young cohort has two users')
  assertEqual(report.cohorts[1]?.daysElapsed, 100, 'second row is the mature cohort (100 days elapsed)')
  assertEqual(report.cohorts[1]?.size, 4, 'mature cohort has four users')
}

const cohortA = report.cohorts.find((c) => c.daysElapsed === 100) as CohortRow
const cohortB = report.cohorts.find((c) => c.daysElapsed === 5) as CohortRow

/* --- 5. mature cohort A: every app rate is the hand-computed value ---------- */

currentCase = 'cohort A app retention: D1 .75, D7 .5, D30 .75, D90 .75'
{
  assertRate(cell(cohortA, 'app', 1)?.rate ?? null, 3 / 4, 'app D1')
  assertRate(cell(cohortA, 'app', 7)?.rate ?? null, 2 / 4, 'app D7')
  assertRate(cell(cohortA, 'app', 30)?.rate ?? null, 3 / 4, 'app D30')
  assertRate(cell(cohortA, 'app', 90)?.rate ?? null, 3 / 4, 'app D90')
  // all mature, denominator is the full cohort size
  for (const h of RETENTION_HORIZONS) {
    assert(cell(cohortA, 'app', h)?.mature === true, `app D${h} mature`)
    assertEqual(cell(cohortA, 'app', h)?.size, 4, `app D${h} denominator is full cohort`)
  }
}

/* --- 6. mature cohort A: every behavior rate is the hand-computed value ----- */

currentCase = 'cohort A behavior retention: D1 .25, D7 .5, D30 .25, D90 0'
{
  assertRate(cell(cohortA, 'behavior', 1)?.rate ?? null, 1 / 4, 'behavior D1')
  assertRate(cell(cohortA, 'behavior', 7)?.rate ?? null, 2 / 4, 'behavior D7')
  assertRate(cell(cohortA, 'behavior', 30)?.rate ?? null, 1 / 4, 'behavior D30')
  assertRate(cell(cohortA, 'behavior', 90)?.rate ?? null, 0, 'behavior D90 (nobody) is 0, not null')
  assertEqual(cell(cohortA, 'behavior', 90)?.mature, true, 'behavior D90 is mature (0% is observed, not immature)')
  assertEqual(cell(cohortA, 'behavior', 90)?.retained, 0, 'behavior D90 retained count is 0')
}

/* --- 7. INCOMPLETE COHORTS MARKED IMMATURE (the distinguishing clause) ------ */

currentCase = 'cohort B: D1 mature & measured; D7/D30/D90 immature (null, mature false)'
{
  // D1 window has closed (5 days elapsed ≥ 1) → measured
  assertEqual(cell(cohortB, 'app', 1)?.mature, true, 'app D1 mature for the young cohort')
  assertRate(cell(cohortB, 'app', 1)?.rate ?? null, 1 / 2, 'app D1 = 1/2')
  assertEqual(cell(cohortB, 'behavior', 1)?.mature, true, 'behavior D1 mature')
  assertRate(cell(cohortB, 'behavior', 1)?.rate ?? null, 1 / 2, 'behavior D1 = 1/2')
  // D7/D30/D90 windows are still open (5 days elapsed < 7) → immature
  for (const h of [7, 30, 90] as const) {
    for (const m of ['app', 'behavior'] as const) {
      assertEqual(cell(cohortB, m, h)?.mature, false, `${m} D${h} immature`)
      assertEqual(cell(cohortB, m, h)?.rate ?? null, null, `${m} D${h} has no rate`)
      assertEqual(cell(cohortB, m, h)?.retained, 0, `${m} D${h} reports no numerator while immature`)
    }
  }
}

/* --- 8. maturity boundary: asOfDay - cohortDay == N is mature -------------- */

currentCase = 'maturity boundary: elapsed == horizon counts as mature'
{
  // a lone cohort exactly 7 days old → D1 and D7 mature, D30/D90 immature
  const boundary = buildRetention(
    [{ userKey: 'anon-x', appActiveDays: [0, 7], behaviorDays: [0] }],
    7, // asOfDay = 7, cohortDay = 0 → elapsed exactly 7
  )
  const row = boundary.cohorts[0] as CohortRow
  assertEqual(cell(row, 'app', 7)?.mature, true, 'elapsed == 7 → D7 mature (>=, not >)')
  assertRate(cell(row, 'app', 7)?.rate ?? null, 1, 'that user was active on day 7 → 100%')
  assertEqual(cell(row, 'app', 30)?.mature, false, 'elapsed 7 → D30 still immature')
}

/* --- 9. pooled overall: only mature cohorts contribute --------------------- */

currentCase = 'overall: pooled across mature cohorts only'
{
  const appD1 = report.overall.app[HORIZON_INDEX[1] ?? 0]
  const appD7 = report.overall.app[HORIZON_INDEX[7] ?? 1]
  const behD1 = report.overall.behavior[HORIZON_INDEX[1] ?? 0]
  const behD90 = report.overall.behavior[HORIZON_INDEX[90] ?? 3]
  // D1: both cohorts mature → pooled over all 6 users
  assertEqual(appD1?.matureCohorts, 2, 'app D1 pooled over both cohorts')
  assertEqual(appD1?.usersIncluded, 6, 'app D1 denominator = 6')
  assertRate(appD1?.rate ?? null, (3 + 1) / 6, 'app D1 pooled = 4/6')
  assertRate(behD1?.rate ?? null, (1 + 1) / 6, 'behavior D1 pooled = 2/6')
  // D7: only cohort A mature → pooled over its 4 users only
  assertEqual(appD7?.matureCohorts, 1, 'app D7 pooled over the one mature cohort')
  assertEqual(appD7?.usersIncluded, 4, 'app D7 denominator = 4 (young cohort excluded)')
  assertRate(appD7?.rate ?? null, 2 / 4, 'app D7 pooled = 2/4')
  // D90 behavior: only A mature, nobody retained → 0 (observed), not null
  assertRate(behD90?.rate ?? null, 0, 'behavior D90 pooled = 0')
  assertEqual(behD90?.matureCohorts, 1, 'behavior D90 pooled over the one mature cohort')
}

/* --- 10. no mature cohort for a horizon → overall null (immature) ----------- */

currentCase = 'overall: a horizon with no mature cohort reports null, not 0'
{
  // everyone is 2 days old → D7/D30/D90 have no mature cohort at all
  const young = buildRetention(
    [
      { userKey: 'anon-y1', appActiveDays: [0, 1], behaviorDays: [0] },
      { userKey: 'anon-y2', appActiveDays: [0], behaviorDays: [] },
    ],
    2,
  )
  const appD30 = young.overall.app[HORIZON_INDEX[30] ?? 2]
  assertEqual(appD30?.rate ?? null, null, 'no mature cohort → null rate')
  assertEqual(appD30?.matureCohorts, 0, 'no mature cohort counted')
  assertEqual(appD30?.usersIncluded, 0, 'no users pooled')
  // D1 is mature
  const appD1 = young.overall.app[HORIZON_INDEX[1] ?? 0]
  assertRate(appD1?.rate ?? null, 1 / 2, 'app D1 still computed')
}

/* --- 11. empty dataset is a safe no-op ------------------------------------- */

currentCase = 'empty dataset: no cohorts, all overall null, no throw'
{
  const empty = buildRetention([], SAMPLE_AS_OF_DAY)
  assertEqual(empty.cohorts.length, 0, 'no cohorts')
  assertEqual(empty.userCount, 0, 'no users')
  assert(
    empty.overall.app.every((c) => c.rate === null) && empty.overall.behavior.every((c) => c.rate === null),
    'every overall cell is null',
  )
  // a user with no observed days at all is skipped, not crashed on
  const skipped = buildRetention([{ userKey: 'anon-ghost', appActiveDays: [], behaviorDays: [] }], 10)
  assertEqual(skipped.userCount, 0, 'never-seen user is skipped')
  assertEqual(skipped.cohorts.length, 0, 'never-seen user forms no cohort')
}

/* --- 12. PRD hypothesis targets + formatting ------------------------------- */

currentCase = 'targets + formatting'
{
  assert(hypothesisTarget('behavior', 1)?.target === 0.65, 'behavior D1 target is 65% (PRD §7)')
  assert(hypothesisTarget('app', 7)?.target === 0.45, 'app D7 target is 45%')
  assert(hypothesisTarget('app', 30)?.target === 0.3, 'app D30 target is 30%')
  assert(hypothesisTarget('app', 90)?.target === 0.2, 'app D90 target is 20%')
  assert(hypothesisTarget('app', 1) === null, 'no target where PRD states none')
  assert(HYPOTHESIS_TARGETS.every((t) => t.note.trim().length > 0), 'every target cites a rationale')
  assertEqual(formatRate(0.75), '75%', 'rate formats as whole percent')
  assertEqual(formatRate(0), '0%', 'zero formats as 0%, not a dash')
  assertEqual(formatRate(null), '—', 'immature formats as an em dash')
}

/* --- 13. zero-guilt copy (CLAUDE.md §1) ------------------------------------- */

currentCase = 'zero-guilt: every surfaced string is guilt-free'
{
  const lines = retentionCopy()
  assert(lines.length > 0, 'there is copy to check')
  for (const line of lines) {
    assert(isGuiltFree(line), `copy is guilt-free: "${line}"`)
  }
  // guard is non-trivial: a shaming retention line is rejected
  assert(!isGuiltFree('You broke your streak and fell behind — users like you fail to retain.'), 'guard rejects shame copy')
}

/* =============================================================== report ==== */

const TOTAL_GROUPS = 13
if (failures.length > 0) {
  console.error(`\n✗ cohortRetention.test.ts — ${failures.length} assertion(s) failed:\n`)
  for (const f of failures) console.error('  • ' + f)
  console.error('')
  throw new Error(`cohortRetention.test.ts failed with ${failures.length} failing assertion(s).`)
}
console.log(`✓ cohortRetention.test.ts — all ${TOTAL_GROUPS} case groups passed.`)
