/**
 * TASK-027 — Deterministic test cases for the gentle restart experience.
 *
 * Acceptance criterion (tasks.json TASK-027):
 *   "After 1, 3 or 7 missed days, restart requires at most two taps and no
 *    guilt/shame copy appears."
 *
 * Dependency-free, self-contained module (the prototype has no test runner),
 * matching the TASK-025/026 pattern. It is:
 *   • type-checked by the build — `tsc -b` compiles all of `src` strictly; and
 *   • directly executable — `node src/lib/restart.test.ts` runs it under Node's
 *     native TypeScript stripping. The engine is imported with a `.ts` specifier
 *     and imports no React (all `flowData`/`ledger` references are `import type`,
 *     erased at runtime), so Node never loads a React-dependent module. On any
 *     failure the process throws and exits non-zero.
 *
 * Every case drives the real engine (`missedDays` / `restartTier` /
 * `restartOffer` / `isGuiltFree`) with injected clock + a fixture action
 * resolver — the dedupe/threshold/two-tap/guilt-free guarantees are verified
 * deterministically, with no fake logic and no synthetic data standing in for
 * the behaviour under test.
 */

import {
  DAY_MS,
  MAX_RESTART_TAPS,
  SHAME_LEXICON,
  isGuiltFree,
  lastWinDay,
  localDayNumber,
  missedDays,
  offerCopy,
  restartOffer,
  restartTier,
  type RestartTier,
  type RungResolver,
} from './restart.ts'
import { previewClock } from './restartPreview.ts'
import type { GoalId } from '../flows/flowData'
import type { CompletionEvent } from './ledger'

/* ------------------------------------------------------- fixture helpers -- */

/**
 * A fixture action resolver — stands in for the real flowData-backed catalog so
 * the engine stays node-runnable. `easier` returns a short variant, `floor` the
 * tiniest version; both are guilt-free, general-benefit copy.
 */
const resolve: RungResolver = (goalId, rung) =>
  rung === 'floor'
    ? { title: `One tiny ${goalId} step`, effort: '5 sec' }
    : { title: `A short ${goalId} moment`, effort: '20 sec' }

/** Local noon of a fixed civil day — a stable anchor that never lands on a day boundary. */
const ANCHOR_NOON = new Date(2026, 10, 22, 12, 0, 0).getTime()

/** A timestamp at (about) local noon, `n` calendar days before the anchor. */
function noonDaysAgo(n: number): number {
  return ANCHOR_NOON - n * DAY_MS
}

let seq = 0
/** Build a minimal, valid CompletionEvent at a given completion time. */
function evt(completedAt: number, over: Partial<CompletionEvent> = {}): CompletionEvent {
  seq++
  return {
    id: `id-${seq}`,
    clientKey: `k-${seq}`,
    goalId: 'move' as GoalId,
    actionTitle: 'Two minutes of easy movement',
    variant: 'full',
    completedAt,
    syncState: 'synced',
    syncedAt: completedAt,
    schemaVersion: 1,
    ...over,
  }
}

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

interface Case {
  group:
    | 'missed-day measurement'
    | 'tier thresholds (1/3/7)'
    | 'two-tap restart'
    | 'no guilt/shame copy'
    | 'edge cases'
    | 'preview clock parity (surface)'
  name: string
  run: () => void
}

const ALL_TIERS: readonly RestartTier[] = ['active', 'short', 'medium', 'long']
const GOALS: readonly GoalId[] = ['move', 'calm', 'water', 'outside']

/* ------------------------------------------------------------- cases ------- */

const CASES: readonly Case[] = [
  /* ---- missed-day measurement ------------------------------------------- */
  {
    group: 'missed-day measurement',
    name: 'local day numbers are stable within a civil day and differ by calendar days',
    run: () => {
      // 9am and 11pm on the same civil day share a day number.
      const morning = new Date(2026, 10, 22, 9, 0, 0).getTime()
      const night = new Date(2026, 10, 22, 23, 0, 0).getTime()
      assertEqual(localDayNumber(morning), localDayNumber(night), 'same civil day → same day number')
      // Consecutive noons are exactly one day apart.
      assertEqual(localDayNumber(ANCHOR_NOON) - localDayNumber(noonDaysAgo(1)), 1, 'noon yesterday is one day back')
      assertEqual(localDayNumber(ANCHOR_NOON) - localDayNumber(noonDaysAgo(7)), 7, 'noon a week ago is seven days back')
    },
  },
  {
    group: 'missed-day measurement',
    name: 'missedDays counts whole calendar days since the most recent win',
    run: () => {
      assertEqual(missedDays([evt(noonDaysAgo(0))], ANCHOR_NOON), 0, 'a win today → 0 days')
      assertEqual(missedDays([evt(noonDaysAgo(1))], ANCHOR_NOON), 1, 'last win yesterday → 1 day')
      assertEqual(missedDays([evt(noonDaysAgo(3))], ANCHOR_NOON), 3, 'last win three days ago → 3 days')
      assertEqual(missedDays([evt(noonDaysAgo(7))], ANCHOR_NOON), 7, 'last win a week ago → 7 days')
    },
  },
  {
    group: 'missed-day measurement',
    name: 'the MOST RECENT win sets the gap, regardless of event order',
    run: () => {
      const events = [evt(noonDaysAgo(9)), evt(noonDaysAgo(1)), evt(noonDaysAgo(30))]
      assertEqual(lastWinDay(events), localDayNumber(noonDaysAgo(1)), 'latest day wins')
      assertEqual(missedDays(events, ANCHOR_NOON), 1, 'gap measured from the most recent win, not the oldest')
    },
  },
  {
    group: 'missed-day measurement',
    name: 'no history is null (a first run is a start, not a missed day)',
    run: () => {
      assertEqual(missedDays([], ANCHOR_NOON), null, 'empty ledger → null, never a negative or a penalty')
      assertEqual(lastWinDay([]), null, 'no last win day')
    },
  },

  /* ---- tier thresholds (exactly 1 / 3 / 7) ------------------------------- */
  {
    group: 'tier thresholds (1/3/7)',
    name: 'the 1 / 3 / 7 boundaries bucket into active/short/medium/long',
    run: () => {
      assertEqual(restartTier(0), 'active', 'gap 0 → active (a win already today)')
      assertEqual(restartTier(1), 'short', 'gap 1 → short (the first missed-day threshold)')
      assertEqual(restartTier(2), 'short', 'gap 2 → still short')
      assertEqual(restartTier(3), 'medium', 'gap 3 → medium (the second threshold)')
      assertEqual(restartTier(6), 'medium', 'gap 6 → still medium')
      assertEqual(restartTier(7), 'long', 'gap 7 → long (the third threshold)')
      assertEqual(restartTier(40), 'long', 'a long absence stays long, never escalates')
    },
  },
  {
    group: 'tier thresholds (1/3/7)',
    name: 'the three named gaps (1, 3, 7) each produce a distinct welcome-back offer',
    run: () => {
      const one = restartOffer([evt(noonDaysAgo(1))], ANCHOR_NOON, 'move', resolve)
      const three = restartOffer([evt(noonDaysAgo(3))], ANCHOR_NOON, 'move', resolve)
      const seven = restartOffer([evt(noonDaysAgo(7))], ANCHOR_NOON, 'move', resolve)
      assertEqual(one.tier, 'short', '1 day → short')
      assertEqual(three.tier, 'medium', '3 days → medium')
      assertEqual(seven.tier, 'long', '7 days → long')
      assertEqual(one.missedDays, 1, '1 day reported')
      assertEqual(three.missedDays, 3, '3 days reported')
      assertEqual(seven.missedDays, 7, '7 days reported')
      // The path back gets EASIER with a longer gap (never harder) — Zero-Guilt.
      assertEqual(one.action.variant, 'easier', '1 day → easier variant')
      assertEqual(three.action.variant, 'easier', '3 days → easier variant')
      assertEqual(seven.action.variant, 'floor', '7 days → the tiniest floor, the lightest possible step')
    },
  },

  /* ---- two-tap restart --------------------------------------------------- */
  {
    group: 'two-tap restart',
    name: 'every tier × every goal returns a restart path of at most two taps',
    run: () => {
      assertEqual(MAX_RESTART_TAPS, 2, 'the invariant is exactly two')
      const gapForTier: Record<RestartTier, number> = { active: 0, short: 1, medium: 3, long: 7 }
      for (const tier of ALL_TIERS) {
        for (const goal of GOALS) {
          const offer = restartOffer([evt(noonDaysAgo(gapForTier[tier]))], ANCHOR_NOON, goal, resolve)
          assertEqual(offer.tier, tier, `${goal} @ gap ${gapForTier[tier]} → ${tier}`)
          assert(offer.steps.length <= MAX_RESTART_TAPS, `${tier}/${goal}: at most two steps`)
          assert(offer.steps.length >= 1, `${tier}/${goal}: at least one step`)
          // The path is exactly resume → complete; the completing step is the hold gesture.
          assertEqual(offer.steps[0]?.kind, 'resume', `${tier}/${goal}: first tap resumes`)
          assertEqual(offer.steps[offer.steps.length - 1]?.kind, 'complete', `${tier}/${goal}: last tap completes`)
        }
      }
    },
  },
  {
    group: 'two-tap restart',
    name: 'the completing step names the suggested feasible action',
    run: () => {
      const offer = restartOffer([evt(noonDaysAgo(7))], ANCHOR_NOON, 'calm', resolve)
      const complete = offer.steps.find((s) => s.kind === 'complete')
      assert(complete !== undefined, 'a complete step exists')
      assert(complete?.label.includes(offer.action.title) ?? false, 'complete label names the action')
      assertEqual(offer.action.title, 'One tiny calm step', 'long gap resolves the floor rung for the goal')
    },
  },

  /* ---- no guilt/shame copy ---------------------------------------------- */
  {
    group: 'no guilt/shame copy',
    name: 'the guilt guard actually rejects shaming language (it is not a no-op)',
    run: () => {
      assertEqual(isGuiltFree('You broke your streak — try not to fail again.'), false, 'shaming text is caught')
      assertEqual(isGuiltFree('You missed 3 days. Don’t give up!'), false, 'loss-frame + miss is caught')
      assertEqual(isGuiltFree('Good to see you. Pick up one tiny thing.'), true, 'warm text passes')
      assert(SHAME_LEXICON.length > 0, 'the lexicon is populated')
    },
  },
  {
    group: 'no guilt/shame copy',
    name: 'EVERY string EVERY tier × goal can surface is free of guilt/shame',
    run: () => {
      const gaps = [0, 1, 2, 3, 6, 7, 14, 90]
      for (const gap of gaps) {
        for (const goal of GOALS) {
          const offer = restartOffer([evt(noonDaysAgo(gap))], ANCHOR_NOON, goal, resolve)
          for (const line of offerCopy(offer)) {
            assert(isGuiltFree(line), `gap ${gap}/${goal}: guilt-free copy, offending="${line}"`)
          }
        }
      }
      // The no-history start path too.
      const start = restartOffer([], ANCHOR_NOON, 'water', resolve)
      for (const line of offerCopy(start)) {
        assert(isGuiltFree(line), `first run: guilt-free copy, offending="${line}"`)
      }
    },
  },

  /* ---- edge cases -------------------------------------------------------- */
  {
    group: 'edge cases',
    name: 'a first run (no history) shows a warm start, never a restart penalty',
    run: () => {
      const offer = restartOffer([], ANCHOR_NOON, 'outside', resolve)
      assertEqual(offer.tier, 'active', 'no history → active/start tier')
      assertEqual(offer.hasHistory, false, 'hasHistory is false on a first run')
      assertEqual(offer.missedDays, 0, 'no missed days to report')
      assert(offer.steps.length <= MAX_RESTART_TAPS, 'start path is still at most two taps')
    },
  },
  {
    group: 'edge cases',
    name: 'a win already today needs no restart and reports zero missed days',
    run: () => {
      const offer = restartOffer([evt(noonDaysAgo(0))], ANCHOR_NOON, 'move', resolve)
      assertEqual(offer.tier, 'active', 'gap 0 → active')
      assertEqual(offer.hasHistory, true, 'history exists')
      assertEqual(offer.missedDays, 0, 'zero missed days')
    },
  },
  {
    group: 'edge cases',
    name: 'a future-dated event never yields a negative gap',
    run: () => {
      // A clock skew / timezone hop could stamp a win "tomorrow"; clamp to 0.
      assertEqual(missedDays([evt(noonDaysAgo(-2))], ANCHOR_NOON), 0, 'a future win clamps to 0, never negative')
      const offer = restartOffer([evt(noonDaysAgo(-2))], ANCHOR_NOON, 'move', resolve)
      assertEqual(offer.tier, 'active', 'a future-dated win reads as active, not an error')
    },
  },

  /* ---- preview clock parity (the Reviewer's doubled-gap regression guard) -- */
  {
    group: 'preview clock parity (surface)',
    name: 'NO-HISTORY preview: the rendered gap equals the selected chip (not doubled)',
    run: () => {
      // The exact composition the surface renders: previewClock → restartOffer.
      // Regression under test: the old inline math shifted `now` forward AND the
      // anchor backward, so a 3-day chip rendered "6 days". Each chip must map to
      // its own number.
      for (const days of [1, 3, 7]) {
        const { events, now } = previewClock([], days, 'move', 'A tiny move', ANCHOR_NOON)
        const offer = restartOffer(events, now, 'move', resolve)
        assertEqual(offer.missedDays, days, `no-history chip ${days}d → ${days}d rendered`)
        assertEqual(offer.hasHistory, true, `no-history chip ${days}d seeds a display-only anchor`)
      }
    },
  },
  {
    group: 'preview clock parity (surface)',
    name: 'NO-HISTORY chips map to the tiers their labels promise (1→short, 3→medium, 7→long)',
    run: () => {
      const expected: Record<number, RestartTier> = { 1: 'short', 3: 'medium', 7: 'long' }
      for (const days of [1, 3, 7]) {
        const { events, now } = previewClock([], days, 'calm', 'A tiny calm moment', ANCHOR_NOON)
        const offer = restartOffer(events, now, 'calm', resolve)
        assertEqual(offer.tier, expected[days], `no-history chip ${days}d → ${expected[days]} tier`)
      }
    },
  },
  {
    group: 'preview clock parity (surface)',
    name: 'REAL-HISTORY preview: the gap equals the chip, measured from the latest real win',
    run: () => {
      // A real win two days ago; previewing a 3-day return must read 3 (measured
      // forward from the latest real win), never 3 + 2.
      const real = [evt(noonDaysAgo(2))]
      for (const days of [1, 3, 7]) {
        const { events, now } = previewClock(real, days, 'water', 'A sip of water', ANCHOR_NOON)
        const offer = restartOffer(events, now, 'water', resolve)
        assertEqual(offer.missedDays, days, `real-history chip ${days}d → ${days}d rendered`)
        assertEqual(events, real, `real-history path passes the real ledger through untouched`)
      }
    },
  },
  {
    group: 'preview clock parity (surface)',
    name: 'the "Today" (0) chip reads as a warm start on a fresh ledger — no fabricated anchor',
    run: () => {
      const { events, now } = previewClock([], 0, 'outside', 'Step outside', ANCHOR_NOON)
      assertEqual(events.length, 0, 'the 0-day chip seeds no anchor event')
      const offer = restartOffer(events, now, 'outside', resolve)
      assertEqual(offer.missedDays, 0, 'Today → 0 missed days')
      assertEqual(offer.hasHistory, false, 'Today on a fresh ledger is a first-run start, not a restart')
    },
  },
]

/* ------------------------------------------------------------- runner ------ */

export interface TestSummary {
  total: number
  passed: number
  failed: number
  failures: readonly string[]
}

export function runRestartTests(): TestSummary {
  failures.length = 0
  let passed = 0
  for (const testCase of CASES) {
    currentCase = `${testCase.group} › ${testCase.name}`
    const before = failures.length
    try {
      testCase.run()
    } catch (error) {
      failures.push(`[${currentCase}] threw: ${String(error)}`)
    }
    if (failures.length === before) passed++
  }
  return { total: CASES.length, passed, failed: CASES.length - passed, failures: [...failures] }
}

/* Execute when run directly (e.g. `node src/lib/restart.test.ts`). Not imported
 * by the app, so Vite never bundles it; tsc still type-checks it. */
const summary = runRestartTests()
const byGroup = new Map<string, { pass: number; total: number }>()
for (const testCase of CASES) {
  const entry = byGroup.get(testCase.group) ?? { pass: 0, total: 0 }
  entry.total++
  const failed = summary.failures.some((f) => f.startsWith(`[${testCase.group} › ${testCase.name}]`))
  if (!failed) entry.pass++
  byGroup.set(testCase.group, entry)
}
console.log('TASK-027 gentle restart — deterministic test cases')
for (const [group, entry] of byGroup) {
  console.log(`  ${entry.pass === entry.total ? '✓' : '✗'} ${group}: ${entry.pass}/${entry.total}`)
}
console.log(`\n${summary.passed}/${summary.total} passed, ${summary.failed} failed`)
if (summary.failed > 0) {
  for (const failure of summary.failures) console.log(`  • ${failure}`)
  throw new Error(`${summary.failed} restart test case(s) failed`)
}
