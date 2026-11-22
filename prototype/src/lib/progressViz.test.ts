/**
 * TASK-032 — Deterministic test cases for the habit progress visualization.
 *
 * Acceptance criterion (tasks.json TASK-032):
 *   "Displays completed opportunities and recovery; missing days never erase past
 *    progress; screen reader summary exists."
 *
 * The suite drives the real engine to prove each clause:
 *   - displays completed opportunities and recovery → the window reports the right
 *     completed-day count, and a completed day after a gap (with earlier history) is
 *     flagged `recovery` while the very first win is not;
 *   - missing days never erase past progress → advancing the clock across idle days
 *     and dropping events from the window leave every all-time total unchanged-or-
 *     larger and every past completed day still completed (monotonicity, proven
 *     directly);
 *   - screen reader summary exists → every view carries a non-empty, honest summary
 *     sentence, and every string the engine can surface clears the shared guilt-free
 *     guard — which is itself proven non-trivial.
 *
 * Dependency-free and self-contained (the prototype has no test runner), matching
 * the TASK-027…031 pattern. Type-checked by `tsc -b` and directly executable —
 * `node src/lib/progressViz.test.ts` — under Node's native TS stripping. The engine
 * imports only the React-free `localDayNumber` / `isGuiltFree` helpers plus a
 * type-only `CompletionEvent`, so Node never loads a React-dependent module. On any
 * failure the process throws and exits non-zero.
 */

import {
  DEFAULT_WINDOW_DAYS,
  RECOVERY_GAP_DAYS,
  buildProgress,
  isGuiltFree,
  progressCopy,
} from './progressViz.ts'
import { DAY_MS } from './restart.ts'
import type { CompletionEvent } from './ledger'

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

/* ------------------------------------------------------------- fixtures ---- */

/** A fixed, timezone-stable anchor: local noon so day-boundary maths never wobbles. */
const NOW = new Date(2026, 10, 23, 12, 0, 0).getTime() // 2026-11-23, local noon

let keySeed = 0

/** A minimal, fully-typed completion event `offset` whole days before NOW (at local noon). */
function winDaysAgo(offset: number, extra: Partial<CompletionEvent> = {}): CompletionEvent {
  keySeed += 1
  return {
    id: `evt-${keySeed}`,
    clientKey: `key-${keySeed}`,
    goalId: 'move',
    actionTitle: 'Two minutes of easy movement',
    variant: 'full',
    completedAt: NOW - offset * DAY_MS,
    syncState: 'synced',
    syncedAt: NOW,
    schemaVersion: 1,
    ...extra,
  }
}

/* ===================================================== 1. window shape ==== */

currentCase = 'window renders exactly windowDays cells, oldest → today'
{
  const view = buildProgress([], NOW)
  assertEqual(view.windowDays, DEFAULT_WINDOW_DAYS, 'windowDays')
  assertEqual(view.days.length, DEFAULT_WINDOW_DAYS, 'day count')
  const last = view.days[view.days.length - 1]
  const first = view.days[0]
  assert(!!last && last.isToday, 'last cell is today')
  assertEqual(last?.offset ?? -1, 0, 'last offset is 0')
  assertEqual(first?.offset ?? -1, DEFAULT_WINDOW_DAYS - 1, 'first offset is windowDays-1')
  // offsets strictly descend windowDays-1 … 0, numbered in order
  let ok = true
  view.days.forEach((d, i) => {
    if (d.offset !== DEFAULT_WINDOW_DAYS - 1 - i) ok = false
  })
  assert(ok, 'offsets descend oldest → newest with no gaps')
}

currentCase = 'custom window length is honoured and clamped to ≥ 1'
{
  assertEqual(buildProgress([], NOW, 7).days.length, 7, '7-day window')
  assertEqual(buildProgress([], NOW, 1).days.length, 1, '1-day window')
  assertEqual(buildProgress([], NOW, 0).days.length, 1, '0 clamps to 1')
  assertEqual(buildProgress([], NOW, -5).days.length, 1, 'negative clamps to 1')
}

/* ======================================= 2. completed opportunities ======= */

currentCase = 'completed opportunities count the distinct days the user showed up'
{
  // wins today, 1 day ago, 2 days ago → three completed opportunities
  const view = buildProgress([winDaysAgo(0), winDaysAgo(1), winDaysAgo(2)], NOW)
  assertEqual(view.completedOpportunities, 3, 'three completed days')
  const today = view.days[view.days.length - 1]
  assert(!!today && today.completed && today.state === 'completed', 'today is completed')
}

currentCase = 'multiple wins on one day are one opportunity but aggregate the count'
{
  const view = buildProgress([winDaysAgo(1), winDaysAgo(1), winDaysAgo(1)], NOW)
  assertEqual(view.completedOpportunities, 1, 'one completed day')
  assertEqual(view.totalWins, 3, 'three wins total')
  assertEqual(view.totalCompletedDays, 1, 'one distinct day all-time')
  const yesterday = view.days[view.days.length - 2]
  assertEqual(yesterday?.count ?? -1, 3, 'count aggregates on the day')
}

currentCase = 'days before the first win are before-start, never open/missed'
{
  // only win is 3 days ago; the window has many empty days before it
  const view = buildProgress([winDaysAgo(3)], NOW)
  const beforeStart = view.days.filter((d) => d.state === 'before-start')
  assert(beforeStart.length > 0, 'some cells precede the first win')
  // every before-start cell is older than the first (only) win, and none counts as open
  assert(
    beforeStart.every((d) => d.offset > 3),
    'before-start cells are all older than the first win',
  )
  assert(
    view.days.every((d) => d.state !== 'open' || d.offset < 3),
    'no open cell sits before the first win',
  )
}

/* ================================================ 3. recovery display ===== */

currentCase = 'a completed day after a gap (with earlier history) is a recovery'
{
  // win 5 days ago, then a 4-day gap, then a win today → today is a recovery
  const view = buildProgress([winDaysAgo(5), winDaysAgo(0)], NOW)
  const today = view.days[view.days.length - 1]
  assert(!!today && today.completed, 'today completed')
  assert(!!today && today.recovery, 'today flagged as recovery')
  assertEqual(today?.state ?? '', 'recovery', 'state is recovery')
  assertEqual(view.recoveries, 1, 'one recovery in window')
}

currentCase = 'the very first win is never a recovery (no earlier history to return to)'
{
  const view = buildProgress([winDaysAgo(2)], NOW)
  const firstWin = view.days.find((d) => d.completed)
  assert(!!firstWin, 'the win is in the window')
  assert(!!firstWin && !firstWin.recovery, 'first-ever win is not a recovery')
  assertEqual(view.recoveries, 0, 'no recoveries')
}

currentCase = 'consecutive days are completed, not recoveries (gap < RECOVERY_GAP_DAYS)'
{
  const view = buildProgress([winDaysAgo(2), winDaysAgo(1), winDaysAgo(0)], NOW)
  assertEqual(view.recoveries, 0, 'back-to-back days are not recoveries')
  assert(
    view.days.filter((d) => d.completed).every((d) => d.state === 'completed'),
    'every completed day is plain completed',
  )
  assert(RECOVERY_GAP_DAYS === 2, 'recovery gap threshold is two calendar days')
}

currentCase = 'a recovery can follow history that sits outside the window'
{
  // first win 20 days ago (outside a 14-day window), return 1 day ago
  const view = buildProgress([winDaysAgo(20), winDaysAgo(1)], NOW, 14)
  const ret = view.days.find((d) => d.offset === 1)
  assert(!!ret && ret.completed && ret.recovery, 'the in-window return is a recovery vs out-of-window history')
  assertEqual(view.totalCompletedDays, 2, 'both wins count all-time')
}

/* ====================== 4. missing days never erase past progress ========= */

currentCase = 'advancing the clock across idle days erases nothing'
{
  const events = [winDaysAgo(6), winDaysAgo(5), winDaysAgo(4)]
  const before = buildProgress(events, NOW)
  // same events, but "now" is 5 days later — five brand-new idle days, no new wins
  const later = buildProgress(events, NOW + 5 * DAY_MS)
  assertEqual(later.totalWins, before.totalWins, 'all-time wins unchanged by idle days')
  assertEqual(later.totalCompletedDays, before.totalCompletedDays, 'all-time completed days unchanged')
  // every originally-completed calendar day is still completed after time passes
  const completedBefore = before.days.filter((d) => d.completed).map((d) => d.dayNumber)
  const completedLaterDays = new Set(later.days.filter((d) => d.completed).map((d) => d.dayNumber))
  assert(
    completedBefore.every((dayNumber) => completedLaterDays.has(dayNumber)),
    'no past completed day becomes un-completed as idle days accrue',
  )
}

currentCase = 'dropping events from the window never reduces all-time totals for the rest'
{
  // superset ⊇ subset; the extra events only add
  const subset = [winDaysAgo(3), winDaysAgo(2)]
  const superset = [...subset, winDaysAgo(8), winDaysAgo(1)]
  const sub = buildProgress(subset, NOW)
  const sup = buildProgress(superset, NOW)
  assert(sup.totalWins >= sub.totalWins, 'superset has ≥ wins')
  assert(sup.totalCompletedDays >= sub.totalCompletedDays, 'superset has ≥ completed days')
  // every day completed in the subset is still completed in the superset
  const subCompleted = sub.days.filter((d) => d.completed).map((d) => d.dayNumber)
  const supCompleted = new Set(sup.days.filter((d) => d.completed).map((d) => d.dayNumber))
  assert(
    subCompleted.every((dayNumber) => supCompleted.has(dayNumber)),
    'adding events never un-completes an existing day',
  )
}

currentCase = 'a long gap then a return keeps all pre-gap wins'
{
  // three early wins, a long silence, then a return today
  const view = buildProgress([winDaysAgo(12), winDaysAgo(11), winDaysAgo(10), winDaysAgo(0)], NOW, 14)
  assertEqual(view.totalWins, 4, 'all four wins retained through the gap')
  assertEqual(view.totalCompletedDays, 4, 'all four distinct days retained')
  const preGap = view.days.filter((d) => d.offset >= 10 && d.offset <= 12 && d.completed)
  assertEqual(preGap.length, 3, 'the three pre-gap days are still completed')
  const today = view.days[view.days.length - 1]
  assert(!!today && today.recovery, 'the return is celebrated as a recovery, not a reset')
}

currentCase = 'open days are counted as open, not as a punishment, and sit between wins'
{
  // win 4 days ago and today; days 1–3 ago are open (after first win, before today)
  const view = buildProgress([winDaysAgo(4), winDaysAgo(0)], NOW)
  assertEqual(view.openDays, 3, 'three open days between the two wins')
  const open = view.days.filter((d) => d.state === 'open')
  assert(
    open.every((d) => d.offset >= 1 && d.offset <= 3),
    'open days are the ones after the first win and before today',
  )
  assert(!view.days.some((d) => d.state === 'today' && d.completed), 'today, being completed, is not an open "today" cell')
}

/* ============================= 5. screen-reader summary exists ============= */

currentCase = 'a non-empty honest summary is always produced'
{
  const empty = buildProgress([], NOW)
  assert(empty.summary.trim().length > 0, 'empty-state summary is present')
  assert(empty.headline.trim().length > 0, 'empty-state headline is present')
  assert(/open/i.test(empty.summary), 'empty-state summary frames today as open')

  const active = buildProgress([winDaysAgo(5), winDaysAgo(0)], NOW)
  assert(active.summary.trim().length > 0, 'active summary is present')
  assert(/\b2\b/.test(active.summary), 'summary states the all-time win count (2)')
  assert(/gentle return/i.test(active.summary), 'summary names the recovery')
}

currentCase = 'summary pluralization is correct for a single win'
{
  const one = buildProgress([winDaysAgo(0)], NOW)
  assert(/1 little win\b/.test(one.summary), 'singular "win"')
  assert(!/1 little wins/.test(one.summary), 'no singular/plural mismatch')
}

/* ================================= 6. guilt-free copy guard =============== */

currentCase = 'every surfaced string is guilt-free across many scenarios'
{
  const scenarios: CompletionEvent[][] = [
    [],
    [winDaysAgo(0)],
    [winDaysAgo(1)],
    [winDaysAgo(7), winDaysAgo(0)],
    [winDaysAgo(12), winDaysAgo(11), winDaysAgo(10), winDaysAgo(0)],
    [winDaysAgo(20), winDaysAgo(3)],
    [winDaysAgo(4), winDaysAgo(4), winDaysAgo(4)],
  ]
  for (const events of scenarios) {
    const view = buildProgress(events, NOW)
    for (const line of progressCopy(view)) {
      assert(isGuiltFree(line), `guilt-free string: ${JSON.stringify(line)}`)
    }
  }
}

currentCase = 'the guilt-free guard is non-trivial (rejects real streak/shame copy)'
{
  assert(!isGuiltFree('You broke your streak — try not to fail again.'), 'rejects broken-streak copy')
  assert(!isGuiltFree('You missed 3 days. Don’t fall behind!'), 'rejects shaming copy')
  assert(isGuiltFree('An open day — nothing here is erased.'), 'passes warm, honest copy')
  assert(isGuiltFree('A gentle return — your earlier wins still stand.'), 'passes recovery copy')
}

/* ------------------------------------------------------------- report ----- */

if (failures.length > 0) {
  console.error(`\n✗ progressViz.test.ts — ${failures.length} failure(s):`)
  for (const failure of failures) console.error(`  - ${failure}`)
  throw new Error(`${failures.length} assertion(s) failed`)
}

console.log('✓ progressViz.test.ts — all cases passed')
