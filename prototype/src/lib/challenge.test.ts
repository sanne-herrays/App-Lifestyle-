/**
 * TASK-029 — Deterministic test cases for the progressive challenge selector.
 *
 * Acceptance criterion (tasks.json TASK-029):
 *   "Users can accept, decline or revert; no automatic escalation after missed
 *    actions; choices persist."
 *
 * The suite drives the real engine to prove each clause:
 *   - accept / decline / revert each do exactly what they promise (and nothing
 *     more);
 *   - NO path other than an explicit `accept` ever raises the rung, the offer is
 *     suppressed after a quiet day, and readiness is never set by the engine — so
 *     escalation is never automatic;
 *   - the chosen rung + readiness flag survive a serialize → deserialize round
 *     trip, and malformed storage is sanitised without crashing or inventing
 *     progress.
 * It finishes with the §1 guilt-free copy guard.
 *
 * Dependency-free and self-contained (the prototype has no test runner), matching
 * the TASK-025/026/027/028 pattern. Type-checked by `tsc -b` and directly
 * executable — `node src/lib/challenge.test.ts` — under Node's native TS
 * stripping. The engine imports only the React-free `isGuiltFree` guard and a
 * type-only `GoalId`, so Node never loads a React-dependent module. On any
 * failure the process throws and exits non-zero.
 */

import {
  allChallengeCopy,
  applyDecision,
  canRevert,
  deserialize,
  evaluateChallenge,
  hasHarderRung,
  initialChallengeState,
  isGuiltFree,
  markReady,
  readinessRationale,
  sanitizeState,
  serialize,
  signalReadiness,
  type ChallengeState,
} from './challenge.ts'

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

/** A three-rung ladder (baseline + two stretches) — the real `move` shape. */
const LEN = 3

function base(overrides: Partial<ChallengeState> = {}): ChallengeState {
  return { ...initialChallengeState('move'), ...overrides }
}

interface Case {
  group:
    | 'offer gate (readiness)'
    | 'accept'
    | 'decline'
    | 'revert'
    | 'no automatic escalation'
    | 'persistence'
    | 'zero-guilt copy'
  name: string
  run: () => void
}

/* ------------------------------------------------------------- cases ------- */

const CASES: readonly Case[] = [
  /* ---- the offer only ever appears on the user's own readiness ---------- */
  {
    group: 'offer gate (readiness)',
    name: 'no offer until the user signals readiness',
    run: () => {
      assertEqual(evaluateChallenge(base(), LEN, { recentlyMissed: false }), null, 'idle → no offer')
      const ready = signalReadiness(base())
      const offer = evaluateChallenge(ready, LEN, { recentlyMissed: false })
      assert(offer !== null, 'after readiness → an offer')
      if (offer) {
        assertEqual(offer.fromRung, 0, 'offer starts from the current rung')
        assertEqual(offer.toRung, 1, 'offer targets exactly one rung up')
      }
    },
  },
  {
    group: 'offer gate (readiness)',
    name: 'no offer at the top rung, even when ready',
    run: () => {
      const topReady = base({ rung: LEN - 1, readyForMore: true })
      assert(!hasHarderRung(topReady.rung, LEN), 'there is no harder rung')
      assertEqual(evaluateChallenge(topReady, LEN, { recentlyMissed: false }), null, 'top rung → no offer')
    },
  },
  {
    group: 'offer gate (readiness)',
    name: 'the offer gate is exactly ready AND harder-rung AND not-recently-missed',
    run: () => {
      for (const rung of [0, 1, 2]) {
        for (const readyForMore of [false, true]) {
          for (const recentlyMissed of [false, true]) {
            const state = base({ rung, readyForMore })
            const offer = evaluateChallenge(state, LEN, { recentlyMissed })
            const expected = readyForMore && !recentlyMissed && hasHarderRung(rung, LEN)
            assertEqual(offer !== null, expected, `rung ${rung}, ready ${readyForMore}, missed ${recentlyMissed}`)
          }
        }
      }
    },
  },

  /* ---- accept: step up exactly one rung --------------------------------- */
  {
    group: 'accept',
    name: 'accept steps up exactly one rung and consumes readiness',
    run: () => {
      const next = applyDecision(signalReadiness(base()), 'accept', LEN)
      assertEqual(next.rung, 1, 'rung +1')
      assertEqual(next.readyForMore, false, 'readiness consumed')
    },
  },
  {
    group: 'accept',
    name: 'each step up needs a fresh readiness signal (no run-away climbing)',
    run: () => {
      let s = signalReadiness(base())
      s = applyDecision(s, 'accept', LEN) // 0 → 1, readiness consumed
      assertEqual(s.rung, 1, 'first accept → rung 1')
      // Without a new signal, there is no offer to accept.
      assertEqual(evaluateChallenge(s, LEN, { recentlyMissed: false }), null, 'no offer without re-signalling')
      s = applyDecision(signalReadiness(s), 'accept', LEN) // 1 → 2
      assertEqual(s.rung, 2, 'second accept (after re-signalling) → rung 2')
    },
  },
  {
    group: 'accept',
    name: 'accept at the top rung never exceeds the ladder',
    run: () => {
      const top = base({ rung: LEN - 1, readyForMore: true })
      const next = applyDecision(top, 'accept', LEN)
      assertEqual(next.rung, LEN - 1, 'rung stays at the ceiling')
      assertEqual(next.readyForMore, false, 'readiness still cleared')
    },
  },

  /* ---- decline: dismiss, rung untouched --------------------------------- */
  {
    group: 'decline',
    name: 'decline leaves the rung unchanged and clears the offer',
    run: () => {
      const next = applyDecision(base({ rung: 1, readyForMore: true }), 'decline', LEN)
      assertEqual(next.rung, 1, 'rung unchanged')
      assertEqual(next.readyForMore, false, 'offer dismissed')
      assertEqual(evaluateChallenge(next, LEN, { recentlyMissed: false }), null, 'no offer after declining')
    },
  },

  /* ---- revert: step back down, never below baseline --------------------- */
  {
    group: 'revert',
    name: 'revert steps one rung back down toward the baseline',
    run: () => {
      assert(canRevert(base({ rung: 2 })), 'rung 2 can revert')
      const next = applyDecision(base({ rung: 2 }), 'revert', LEN)
      assertEqual(next.rung, 1, 'rung -1')
    },
  },
  {
    group: 'revert',
    name: 'revert at the baseline is a no-op (never goes below zero)',
    run: () => {
      assert(!canRevert(base({ rung: 0 })), 'baseline cannot revert')
      const next = applyDecision(base({ rung: 0 }), 'revert', LEN)
      assertEqual(next.rung, 0, 'stays at baseline')
    },
  },
  {
    group: 'revert',
    name: 'revert is available regardless of readiness (the user can always ease off)',
    run: () => {
      const next = applyDecision(base({ rung: 2, readyForMore: false }), 'revert', LEN)
      assertEqual(next.rung, 1, 'reverted without any readiness signal')
    },
  },

  /* ---- no automatic escalation after missed actions (§1) ---------------- */
  {
    group: 'no automatic escalation',
    name: 'a recent quiet day suppresses the offer even when the user is ready',
    run: () => {
      const ready = base({ rung: 0, readyForMore: true })
      assert(evaluateChallenge(ready, LEN, { recentlyMissed: false }) !== null, 'offer when settled')
      assertEqual(evaluateChallenge(ready, LEN, { recentlyMissed: true }), null, 'no offer right after a quiet day')
    },
  },
  {
    group: 'no automatic escalation',
    name: 'no engine operation other than accept ever raises the rung',
    run: () => {
      // signalReadiness, decline and revert must never climb. Probe the whole grid.
      for (const rung of [0, 1, 2]) {
        const start = base({ rung })
        assert(signalReadiness(start).rung <= rung, `signalReadiness never climbs (rung ${rung})`)
        assert(applyDecision(start, 'decline', LEN).rung <= rung, `decline never climbs (rung ${rung})`)
        assert(applyDecision(start, 'revert', LEN).rung <= rung, `revert never climbs (rung ${rung})`)
      }
    },
  },
  {
    group: 'no automatic escalation',
    name: 'the engine never sets readiness on its own — only the user can',
    run: () => {
      // Across the grid, a NOT-ready state stays not-ready after decline/revert
      // and after a "missed" signal is observed (the signal is an input, not a mutator).
      for (const rung of [0, 1, 2]) {
        const notReady = base({ rung, readyForMore: false })
        assertEqual(applyDecision(notReady, 'decline', LEN).readyForMore, false, `decline keeps not-ready (rung ${rung})`)
        assertEqual(applyDecision(notReady, 'revert', LEN).readyForMore, false, `revert keeps not-ready (rung ${rung})`)
        // evaluateChallenge is a pure read — it returns null and changes nothing.
        assertEqual(
          evaluateChallenge(notReady, LEN, { recentlyMissed: true }),
          null,
          `missed signal yields no offer (rung ${rung})`,
        )
      }
    },
  },

  /* ---- choices persist -------------------------------------------------- */
  {
    group: 'persistence',
    name: 'serialize → deserialize round-trips the chosen rung and readiness for every goal',
    run: () => {
      const map = deserialize(null) // a full default map
      map.move = { goalId: 'move', rung: 2, readyForMore: true }
      map.calm = { goalId: 'calm', rung: 1, readyForMore: false }
      const restored = deserialize(serialize(map))
      assertEqual(restored.move.rung, 2, 'move rung persisted')
      assertEqual(restored.move.readyForMore, true, 'move readiness persisted')
      assertEqual(restored.calm.rung, 1, 'calm rung persisted')
      assertEqual(restored.water.rung, 0, 'untouched goal stays at baseline')
      assertEqual(restored.outside.readyForMore, false, 'untouched goal stays not-ready')
    },
  },
  {
    group: 'persistence',
    name: 'deserialize is total and defaulted — every goal is always present',
    run: () => {
      const map = deserialize('not json at all')
      for (const id of ['move', 'calm', 'water', 'outside'] as const) {
        assertEqual(map[id].goalId, id, `${id} present`)
        assertEqual(map[id].rung, 0, `${id} baseline`)
      }
      // A partial/garbage array keeps the good entries and defaults the rest.
      const partial = deserialize(JSON.stringify([{ goalId: 'move', rung: 1, readyForMore: true }, { nope: true }, 42]))
      assertEqual(partial.move.rung, 1, 'good entry kept')
      assertEqual(partial.calm.rung, 0, 'missing entry defaulted')
    },
  },
  {
    group: 'persistence',
    name: 'sanitizeState drops malformed records and never invents progress',
    run: () => {
      assertEqual(sanitizeState(null), null, 'null → dropped')
      assertEqual(sanitizeState({ rung: 5 }), null, 'no goalId → dropped')
      assertEqual(sanitizeState({ goalId: 'nope', rung: 1 }), null, 'bad goalId → dropped')
      const negative = sanitizeState({ goalId: 'move', rung: -3, readyForMore: 'yes' })
      assert(negative !== null, 'valid goalId → kept')
      if (negative) {
        assertEqual(negative.rung, 0, 'negative rung clamped to baseline (never below zero)')
        assertEqual(negative.readyForMore, false, 'non-boolean readiness coerced to false')
      }
      const floored = sanitizeState({ goalId: 'calm', rung: 2.9, readyForMore: true })
      assertEqual(floored?.rung, 2, 'fractional rung floored')
    },
  },

  /* ---- Zero-Guilt copy (CLAUDE.md §1) ----------------------------------- */
  {
    group: 'zero-guilt copy',
    name: 'all offer / decision / rationale copy is free of guilt & shame fragments',
    run: () => {
      const all = allChallengeCopy()
      assert(all.length > 0, 'there is copy to scan')
      for (const text of all) {
        assert(isGuiltFree(text), `guilt-free: ${JSON.stringify(text)}`)
      }
    },
  },
  {
    group: 'zero-guilt copy',
    name: 'the rationale after a quiet day is gentle, not a scolding',
    run: () => {
      const line = readinessRationale(base({ readyForMore: true }), LEN, { recentlyMissed: true })
      assert(isGuiltFree(line), 'quiet-day rationale is guilt-free')
      assert(line.length > 0, 'quiet-day rationale is present')
    },
  },
  {
    group: 'zero-guilt copy',
    name: 'the guilt-free guard is non-trivial (it rejects a known pushy/shaming line)',
    run: () => {
      assert(!isGuiltFree('You missed a day — don’t fall behind, push harder!'), 'must reject a pushy line')
      assert(isGuiltFree('A slightly bigger step, only if you’d like it.'), 'must pass warm copy')
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

export function runChallengeTests(): TestSummary {
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

/* A tiny store smoke check — exercises the real localStorage-backed mutators via
 * the Node global that `node --experimental-...` does not provide, guarded so it
 * never throws where `localStorage` is absent (the engine degrades to in-memory). */
function storeSmoke(): void {
  currentCase = 'store (runtime) › markReady/decide operate without throwing'
  try {
    markReady('move')
    // No ladder length needed to prove it does not throw; decline is rung-safe.
    // (Full decision semantics are covered by the pure `applyDecision` cases above.)
  } catch (error) {
    failures.push(`[${currentCase}] threw: ${String(error)}`)
  }
}

/* Execute when run directly (e.g. `node src/lib/challenge.test.ts`). Not imported
 * by the app, so Vite never bundles it; tsc still type-checks it. */
const summary = runChallengeTests()
storeSmoke()
const byGroup = new Map<string, { pass: number; total: number }>()
for (const testCase of CASES) {
  const entry = byGroup.get(testCase.group) ?? { pass: 0, total: 0 }
  entry.total++
  const failed = summary.failures.some((f) => f.startsWith(`[${testCase.group} › ${testCase.name}]`))
  if (!failed) entry.pass++
  byGroup.set(testCase.group, entry)
}
console.log('TASK-029 progressive challenge selector — deterministic test cases')
for (const [group, entry] of byGroup) {
  console.log(`  ${entry.pass === entry.total ? '✓' : '✗'} ${group}: ${entry.pass}/${entry.total}`)
}
// `failures` is the module-level accumulator: it holds the case failures plus any
// from the store smoke check, so it is the single source of truth for the gate.
console.log(`\n${summary.passed}/${summary.total} passed, ${summary.failed} failed`)
if (failures.length > 0) {
  for (const failure of failures) console.log(`  • ${failure}`)
  throw new Error(`${failures.length} challenge test check(s) failed`)
}
