/**
 * TASK-028 — Deterministic test cases for the habit graduation state machine.
 *
 * Acceptance criterion (tasks.json TASK-028):
 *   "Transition table is documented; unit tests cover every valid transition
 *    and rejected invalid transitions."
 *
 * The suite exhaustively drives the real engine over the FULL (state × event)
 * space — all 4 states × 5 events = 20 pairs — asserting that each of the 5
 * listed transitions advances to its documented target and that every one of the
 * 15 unlisted pairs is rejected (never throws, never mutates). It then covers the
 * behavioural evaluator's forward-only suggestions and the §1 guilt-free guard.
 *
 * Dependency-free and self-contained (the prototype has no test runner), matching
 * the TASK-025/026/027 pattern. It is type-checked by the build (`tsc -b`) and
 * directly executable — `node src/lib/habitGraduation.test.ts` — under Node's
 * native TS stripping. The engine imports only the React-free `restart` helpers
 * and type-only catalog types, so Node never loads a React-dependent module. On
 * any failure the process throws and exits non-zero.
 */

import {
  DEFAULT_GRADUATION_CONFIG,
  EVENT_DIRECTION,
  GRADUATION_EVENTS,
  HABIT_STATES,
  TRANSITIONS,
  activeDaysInWindow,
  allGraduationCopy,
  availableEvents,
  canTransition,
  evaluateReadiness,
  isGuiltFree,
  transition,
  type GraduationEvent,
  type HabitState,
  type ReadinessInput,
} from './habitGraduation.ts'
import { DAY_MS } from './restart.ts'

/* ------------------------------------------------------- expected table ---- */

/**
 * An INDEPENDENT restatement of the documented transition table (see
 * `TRANSITIONS` / its header comment). The suite asserts the engine matches this
 * hand-written map exactly, so a silent edit to the table is caught here.
 */
const EXPECTED: Record<HabitState, Partial<Record<GraduationEvent, HabitState>>> = {
  new: { begin: 'practicing' },
  practicing: { sustain: 'stable' },
  stable: { graduate: 'graduated', ease: 'practicing' },
  graduated: { revisit: 'practicing' },
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

/** Local noon of a fixed civil day — a stable anchor that never lands on a boundary. */
const ANCHOR_NOON = new Date(2026, 10, 22, 12, 0, 0).getTime()
function noonDaysAgo(n: number): number {
  return ANCHOR_NOON - n * DAY_MS
}

interface Case {
  group:
    | 'transition table (documented)'
    | 'valid transitions'
    | 'rejected invalid transitions'
    | 'derived helpers'
    | 'behavioural evaluator'
    | 'zero-guilt copy'
  name: string
  run: () => void
}

/* ------------------------------------------------------------- cases ------- */

const CASES: readonly Case[] = [
  /* ---- the engine table matches its documentation ----------------------- */
  {
    group: 'transition table (documented)',
    name: 'engine TRANSITIONS exactly matches the independently-restated table',
    run: () => {
      for (const state of HABIT_STATES) {
        const got = TRANSITIONS[state]
        const want = EXPECTED[state]
        for (const event of GRADUATION_EVENTS) {
          assertEqual(got[event], want[event], `${state} × ${event}`)
        }
      }
    },
  },
  {
    group: 'transition table (documented)',
    name: 'every state is reachable and the forward path new→practicing→stable→graduated holds',
    run: () => {
      const a = transition('new', 'begin')
      assert(a.ok && a.to === 'practicing', 'new→practicing')
      const b = transition('practicing', 'sustain')
      assert(b.ok && b.to === 'stable', 'practicing→stable')
      const c = transition('stable', 'graduate')
      assert(c.ok && c.to === 'graduated', 'stable→graduated')
    },
  },

  /* ---- every VALID transition (the 5 listed edges) ---------------------- */
  ...HABIT_STATES.flatMap((state) =>
    GRADUATION_EVENTS.filter((event) => EXPECTED[state][event] !== undefined).map(
      (event): Case => ({
        group: 'valid transitions',
        name: `${state} --${event}--> ${EXPECTED[state][event]}`,
        run: () => {
          const result = transition(state, event)
          assert(result.ok, 'should be accepted')
          if (result.ok) {
            assertEqual(result.to, EXPECTED[state][event], 'lands on the documented target')
            assertEqual(result.from, state, 'preserves the from-state')
            assertEqual(result.event, event, 'preserves the event')
            assertEqual(result.direction, EVENT_DIRECTION[event], 'carries the right direction')
            assert(result.message.length > 0, 'carries a non-empty landing message')
          }
          assert(canTransition(state, event), 'canTransition agrees it is valid')
        },
      }),
    ),
  ),

  /* ---- every REJECTED invalid transition (the 15 unlisted pairs) -------- */
  ...HABIT_STATES.flatMap((state) =>
    GRADUATION_EVENTS.filter((event) => EXPECTED[state][event] === undefined).map(
      (event): Case => ({
        group: 'rejected invalid transitions',
        name: `${state} --${event}--> ✗ rejected`,
        run: () => {
          const result = transition(state, event)
          assert(!result.ok, 'should be rejected')
          if (!result.ok) {
            assertEqual(result.from, state, 'preserves the from-state (no mutation)')
            assertEqual(result.event, event, 'preserves the attempted event')
            assert(result.reason.length > 0, 'gives a non-empty reason')
            assert(isGuiltFree(result.reason), 'rejection reason is guilt-free')
          }
          assert(!canTransition(state, event), 'canTransition agrees it is invalid')
        },
      }),
    ),
  ),
  {
    group: 'rejected invalid transitions',
    name: 'the full 4×5 space splits into exactly 5 valid and 15 rejected pairs',
    run: () => {
      let valid = 0
      let rejected = 0
      for (const state of HABIT_STATES) {
        for (const event of GRADUATION_EVENTS) {
          if (transition(state, event).ok) valid++
          else rejected++
        }
      }
      assertEqual(valid, 5, 'valid transitions')
      assertEqual(rejected, 15, 'rejected transitions')
      assertEqual(valid + rejected, HABIT_STATES.length * GRADUATION_EVENTS.length, 'covers the whole space')
    },
  },
  {
    group: 'rejected invalid transitions',
    name: 'a habit never steps back to `new`, and backward edges are user-choice only',
    run: () => {
      // No event from any state targets `new` — history is never wiped to zero (§1).
      for (const state of HABIT_STATES) {
        for (const event of GRADUATION_EVENTS) {
          const r = transition(state, event)
          if (r.ok) assert(r.to !== 'new', `${state}×${event} must not return to new`)
        }
      }
      // Both `return` edges land in `practicing`, not `new`.
      const ease = transition('stable', 'ease')
      assert(ease.ok && ease.to === 'practicing', 'ease→practicing')
      const revisit = transition('graduated', 'revisit')
      assert(revisit.ok && revisit.to === 'practicing', 'revisit→practicing')
    },
  },

  /* ---- derived helpers stay in lockstep with the table ------------------ */
  {
    group: 'derived helpers',
    name: 'availableEvents returns exactly the table keys, in canonical order',
    run: () => {
      assertEqual(availableEvents('new').join(','), 'begin', 'new')
      assertEqual(availableEvents('practicing').join(','), 'sustain', 'practicing')
      assertEqual(availableEvents('stable').join(','), 'graduate,ease', 'stable (advance before return)')
      assertEqual(availableEvents('graduated').join(','), 'revisit', 'graduated')
    },
  },
  {
    group: 'derived helpers',
    name: 'canTransition matches transition().ok across the whole space',
    run: () => {
      for (const state of HABIT_STATES) {
        for (const event of GRADUATION_EVENTS) {
          assertEqual(canTransition(state, event), transition(state, event).ok, `${state}×${event} parity`)
        }
      }
    },
  },

  /* ---- behavioural evaluator (forward-only readiness) ------------------- */
  {
    group: 'behavioural evaluator',
    name: 'activeDaysInWindow counts distinct civil days inside the window only',
    run: () => {
      const twoWinsOneDay = [noonDaysAgo(1), noonDaysAgo(1) + 3 * 60 * 60 * 1000] // same civil day
      assertEqual(activeDaysInWindow(twoWinsOneDay, ANCHOR_NOON, 14), 1, 'two wins, one day → 1')
      const spread = [noonDaysAgo(0), noonDaysAgo(2), noonDaysAgo(13), noonDaysAgo(20)]
      assertEqual(activeDaysInWindow(spread, ANCHOR_NOON, 14), 3, 'day 20 falls outside a 14-day window')
      assertEqual(activeDaysInWindow([], ANCHOR_NOON, 14), 0, 'no wins → 0')
    },
  },
  {
    group: 'behavioural evaluator',
    name: 'new suggests `begin` once there is a first win, not before',
    run: () => {
      const base: ReadinessInput = { state: 'new', hasAnyWin: false, activeDaysInWindow: 0, automaticityConfirmed: false }
      assertEqual(evaluateReadiness(base).suggestedEvent, null, 'no win yet → no suggestion')
      assertEqual(evaluateReadiness({ ...base, hasAnyWin: true }).suggestedEvent, 'begin', 'first win → begin')
    },
  },
  {
    group: 'behavioural evaluator',
    name: 'practicing suggests `sustain` only at the consistency gate',
    run: () => {
      const need = DEFAULT_GRADUATION_CONFIG.sustainActiveDays
      const mk = (active: number): ReadinessInput => ({
        state: 'practicing',
        hasAnyWin: true,
        activeDaysInWindow: active,
        automaticityConfirmed: false,
      })
      assertEqual(evaluateReadiness(mk(need - 1)).suggestedEvent, null, 'below gate → no suggestion')
      assertEqual(evaluateReadiness(mk(need)).suggestedEvent, 'sustain', 'at gate → sustain')
      assertEqual(evaluateReadiness(mk(need + 3)).suggestedEvent, 'sustain', 'above gate → sustain')
    },
  },
  {
    group: 'behavioural evaluator',
    name: 'stable suggests `graduate` only once automaticity is user-confirmed (not counts alone)',
    run: () => {
      const base: ReadinessInput = { state: 'stable', hasAnyWin: true, activeDaysInWindow: 14, automaticityConfirmed: false }
      assertEqual(evaluateReadiness(base).suggestedEvent, null, 'high counts but unconfirmed → no graduate')
      assertEqual(
        evaluateReadiness({ ...base, automaticityConfirmed: true }).suggestedEvent,
        'graduate',
        'confirmed → graduate',
      )
    },
  },
  {
    group: 'behavioural evaluator',
    name: 'the evaluator NEVER suggests a backward (return) event in any state (§1)',
    run: () => {
      const bools = [false, true]
      for (const state of HABIT_STATES) {
        for (const hasAnyWin of bools) {
          for (const automaticityConfirmed of bools) {
            for (const active of [0, 5, 7, 14, 30]) {
              const report = evaluateReadiness({ state, hasAnyWin, activeDaysInWindow: active, automaticityConfirmed })
              if (report.suggestedEvent !== null) {
                assertEqual(EVENT_DIRECTION[report.suggestedEvent], 'advance', `${state} suggestion must advance`)
                // And a suggested forward event must itself be a valid transition.
                assert(canTransition(state, report.suggestedEvent), `${state} suggestion must be a valid edge`)
              }
            }
          }
        }
      }
    },
  },
  {
    group: 'behavioural evaluator',
    name: 'graduated is terminal for the evaluator — no forward suggestion',
    run: () => {
      assertEqual(
        evaluateReadiness({ state: 'graduated', hasAnyWin: true, activeDaysInWindow: 14, automaticityConfirmed: true })
          .suggestedEvent,
        null,
        'graduated → nothing to suggest',
      )
    },
  },

  /* ---- Zero-Guilt copy (CLAUDE.md §1) ----------------------------------- */
  {
    group: 'zero-guilt copy',
    name: 'all state/event/transition/rejection copy is free of guilt & shame fragments',
    run: () => {
      // Fold in every rationale the evaluator can produce across representative evidence.
      const rationales: string[] = []
      const bools = [false, true]
      for (const state of HABIT_STATES) {
        for (const hasAnyWin of bools) {
          for (const automaticityConfirmed of bools) {
            for (const active of [0, 6, 7, 14]) {
              rationales.push(
                evaluateReadiness({ state, hasAnyWin, activeDaysInWindow: active, automaticityConfirmed }).rationale,
              )
            }
          }
        }
      }
      const all = allGraduationCopy(rationales)
      assert(all.length > 0, 'there is copy to scan')
      for (const text of all) {
        assert(isGuiltFree(text), `guilt-free: ${JSON.stringify(text)}`)
      }
    },
  },
  {
    group: 'zero-guilt copy',
    name: 'the guilt-free guard is non-trivial (it rejects a known shaming line)',
    run: () => {
      assert(!isGuiltFree('You failed and broke your streak — back to zero.'), 'must reject a shaming line')
      assert(isGuiltFree('Welcome back — your progress is exactly where it was.'), 'must pass warm copy')
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

export function runGraduationTests(): TestSummary {
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

/* Execute when run directly (e.g. `node src/lib/habitGraduation.test.ts`). Not
 * imported by the app, so Vite never bundles it; tsc still type-checks it. */
const summary = runGraduationTests()
const byGroup = new Map<string, { pass: number; total: number }>()
for (const testCase of CASES) {
  const entry = byGroup.get(testCase.group) ?? { pass: 0, total: 0 }
  entry.total++
  const failed = summary.failures.some((f) => f.startsWith(`[${testCase.group} › ${testCase.name}]`))
  if (!failed) entry.pass++
  byGroup.set(testCase.group, entry)
}
console.log('TASK-028 habit graduation — deterministic test cases')
for (const [group, entry] of byGroup) {
  console.log(`  ${entry.pass === entry.total ? '✓' : '✗'} ${group}: ${entry.pass}/${entry.total}`)
}
console.log(`\n${summary.passed}/${summary.total} passed, ${summary.failed} failed`)
if (summary.failed > 0) {
  for (const failure of summary.failures) console.log(`  • ${failure}`)
  throw new Error(`${summary.failed} graduation test case(s) failed`)
}
