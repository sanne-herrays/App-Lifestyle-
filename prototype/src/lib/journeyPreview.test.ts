/**
 * TASK-031 — Deterministic test cases for the seven-day journey preview.
 *
 * Acceptance criterion (tasks.json TASK-031):
 *   "Preview renders seven days, explains gradual progression and makes no
 *    unsupported health-outcome promises."
 *
 * The suite drives the real engine to prove each clause:
 *   - renders seven days → the journey is always exactly 7 days, numbered 1…7;
 *   - explains gradual progression → the rung is non-decreasing, never climbs by
 *     more than one step, settles before it grows, is clamped to the ladder
 *     ceiling (a short ladder plateaus, never inventing content), and each day's
 *     title matches the expected rung;
 *   - makes no unsupported health-outcome promises → every string the journey can
 *     surface clears both the promise guard AND the shared guilt-free guard, and
 *     both guards are proven non-trivial.
 *
 * Dependency-free and self-contained (the prototype has no test runner), matching
 * the TASK-027/028/029 pattern. Type-checked by `tsc -b` and directly executable
 * — `node src/lib/journeyPreview.test.ts` — under Node's native TS stripping. The
 * engine injects its ladder (bound here to a fixture) and imports only the
 * React-free `isGuiltFree` guard plus a type-only `GoalId`, so Node never loads a
 * React-dependent module. On any failure the process throws and exits non-zero.
 */

import {
  JOURNEY_DAYS,
  PHASE_LABEL,
  PHASE_NOTE,
  RUNG_SCHEDULE,
  buildJourney,
  isGuiltFree,
  isPromiseSafe,
  journeyCopy,
  type JourneyPhase,
  type JourneyRung,
  type LadderResolver,
} from './journeyPreview.ts'
import type { GoalId } from '../flows/flowData'

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

/* ------------------------------------------------------- fixture ladders ---- */
/* Mirrors the real `flowData.challengeLadder` shape (baseline + two stretches),
 * so the engine is exercised exactly as the component binds it — without pulling
 * in React. `short`/`solo` probe the ceiling-clamp behaviour. */

const THREE: readonly JourneyRung[] = [
  { title: 'Two minutes of easy movement', effort: '2 min' },
  { title: 'Five minutes of easy movement', effort: '5 min' },
  { title: 'A ten-minute walk', effort: '10 min' },
]
const TWO: readonly JourneyRung[] = [
  { title: 'A glass of water', effort: '1 min' },
  { title: 'Two glasses of water', effort: '2 min' },
]
const ONE: readonly JourneyRung[] = [{ title: 'One minute of slow breathing', effort: '1 min' }]

const LADDERS: Record<GoalId, readonly JourneyRung[]> = {
  move: THREE,
  water: TWO,
  calm: ONE,
  outside: THREE,
}

const resolve: LadderResolver = (goal) => LADDERS[goal]

/** The rung `buildJourney` should land on for a given ladder length and day index. */
function expectedRung(ladderLen: number, dayIndex: number): number {
  const ceiling = Math.max(0, ladderLen - 1)
  return Math.min(RUNG_SCHEDULE[dayIndex] ?? ceiling, ceiling)
}

interface Case {
  group:
    | 'renders seven days'
    | 'gradual progression'
    | 'phases explained'
    | 'no health-outcome promises'
  name: string
  run: () => void
}

/* ------------------------------------------------------------- cases ------- */

const CASES: readonly Case[] = [
  /* ---- renders seven days ------------------------------------------------ */
  {
    group: 'renders seven days',
    name: 'the journey is exactly seven days, numbered 1…7 in order',
    run: () => {
      const journey = buildJourney('move', resolve)
      assertEqual(journey.days.length, JOURNEY_DAYS, 'day count')
      assertEqual(JOURNEY_DAYS, 7, 'the horizon is seven')
      journey.days.forEach((d, i) => assertEqual(d.day, i + 1, `day[${i}] number`))
    },
  },
  {
    group: 'renders seven days',
    name: 'every day carries a title, an effort and a note',
    run: () => {
      for (const goal of ['move', 'water', 'calm', 'outside'] as const) {
        for (const d of buildJourney(goal, resolve).days) {
          assert(d.title.length > 0, `${goal} day ${d.day} has a title`)
          assert(d.effort.length > 0, `${goal} day ${d.day} has an effort`)
          assert(d.note.length > 0, `${goal} day ${d.day} has a note`)
        }
      }
    },
  },

  /* ---- gradual progression ---------------------------------------------- */
  {
    group: 'gradual progression',
    name: 'the rung schedule is non-decreasing and never climbs more than one step',
    run: () => {
      assertEqual(RUNG_SCHEDULE.length, JOURNEY_DAYS, 'a scheduled rung for each day')
      for (let i = 1; i < RUNG_SCHEDULE.length; i++) {
        const prev = RUNG_SCHEDULE[i - 1] ?? 0
        const cur = RUNG_SCHEDULE[i] ?? 0
        assert(cur >= prev, `day ${i + 1} never steps down (${cur} >= ${prev})`)
        assert(cur - prev <= 1, `day ${i + 1} climbs at most one rung (${cur} - ${prev})`)
      }
    },
  },
  {
    group: 'gradual progression',
    name: 'each day lands on the expected rung, clamped to the ladder ceiling',
    run: () => {
      // Three-rung ladder: the schedule is fully realised and never exceeds rung 2.
      const three = buildJourney('move', resolve)
      three.days.forEach((d, i) => {
        const rung = expectedRung(THREE.length, i)
        assertEqual(d.title, THREE[rung]?.title ?? '', `move day ${d.day} title at rung ${rung}`)
        assert(rung <= THREE.length - 1, `move day ${d.day} within ceiling`)
      })
    },
  },
  {
    group: 'gradual progression',
    name: 'a shorter ladder plateaus at its ceiling — the preview never invents a step',
    run: () => {
      // Two-rung ladder: day 7's scheduled rung 2 clamps to 1.
      const two = buildJourney('water', resolve)
      two.days.forEach((d, i) => {
        const rung = expectedRung(TWO.length, i)
        assert(rung <= TWO.length - 1, `water day ${d.day} within ceiling`)
        assertEqual(d.title, TWO[rung]?.title ?? '', `water day ${d.day} title at clamped rung ${rung}`)
      })
      // Single-rung ladder: every day is the one baseline step; nothing beyond it.
      const one = buildJourney('calm', resolve)
      for (const d of one.days) {
        assertEqual(d.title, ONE[0]?.title ?? '', `calm day ${d.day} stays on the only rung`)
      }
    },
  },
  {
    group: 'gradual progression',
    name: 'the realised titles are non-decreasing in rung across the week (no regressions)',
    run: () => {
      for (const goal of ['move', 'water', 'calm', 'outside'] as const) {
        const ladder = LADDERS[goal]
        const indexOf = (title: string) => ladder.findIndex((r) => r.title === title)
        let prev = -1
        for (const d of buildJourney(goal, resolve).days) {
          const rung = indexOf(d.title)
          assert(rung >= prev, `${goal} day ${d.day} never eases below the previous day`)
          assert(rung - prev <= 1, `${goal} day ${d.day} grows by at most one rung`)
          prev = rung
        }
      }
    },
  },

  /* ---- phases explained -------------------------------------------------- */
  {
    group: 'phases explained',
    name: 'day one plants, the week settles before it grows, and growth is a rung step',
    run: () => {
      const days = buildJourney('move', resolve).days
      assertEqual(days[0]?.phase, 'plant', 'day 1 plants the habit')
      // A "grow" day must sit on a higher rung than the day before it; a "settle"
      // day must match it. Reconstruct rung from the fixture to prove the mapping.
      const indexOf = (title: string) => THREE.findIndex((r) => r.title === title)
      let prev = indexOf(days[0]?.title ?? '')
      let sawSettleBeforeGrow = false
      let sawGrow = false
      for (let i = 1; i < days.length; i++) {
        const d = days[i]
        if (!d) continue
        const rung = indexOf(d.title)
        if (d.phase === 'grow') {
          assert(rung > prev, `day ${d.day} grow sits one rung higher`)
          if (!sawGrow) assert(sawSettleBeforeGrow, 'the week settles at least once before the first grow')
          sawGrow = true
        } else if (d.phase === 'settle') {
          assertEqual(rung, prev, `day ${d.day} settle holds the same rung`)
          if (!sawGrow) sawSettleBeforeGrow = true
        }
        prev = rung
      }
      assert(sawGrow, 'the three-rung week includes at least one optional growth day')
    },
  },
  {
    group: 'phases explained',
    name: "each day's note matches its phase, and every phase has a label",
    run: () => {
      for (const d of buildJourney('outside', resolve).days) {
        assertEqual(d.note, PHASE_NOTE[d.phase], `day ${d.day} note matches its phase`)
        assert((PHASE_LABEL[d.phase] ?? '').length > 0, `phase ${d.phase} has a badge label`)
      }
      const phases: readonly JourneyPhase[] = ['plant', 'settle', 'grow']
      for (const p of phases) {
        assert(PHASE_NOTE[p].length > 0, `phase ${p} has a note`)
        assert(PHASE_LABEL[p].length > 0, `phase ${p} has a label`)
      }
    },
  },

  /* ---- no unsupported health-outcome promises (CLAUDE.md §3) ------------- */
  {
    group: 'no health-outcome promises',
    name: 'every journey string is free of health-outcome promises and guilt',
    run: () => {
      for (const goal of ['move', 'water', 'calm', 'outside'] as const) {
        const strings = journeyCopy(buildJourney(goal, resolve))
        assert(strings.length > 0, `${goal} surfaces copy to scan`)
        for (const text of strings) {
          assert(isPromiseSafe(text), `${goal}: promise-safe — ${JSON.stringify(text)}`)
          assert(isGuiltFree(text), `${goal}: guilt-free — ${JSON.stringify(text)}`)
        }
      }
    },
  },
  {
    group: 'no health-outcome promises',
    name: 'the promise guard is non-trivial (it rejects known outcome claims)',
    run: () => {
      assert(
        !isPromiseSafe('This week will reduce your risk of disease and boost your immunity.'),
        'must reject a disease-risk / immunity claim',
      )
      assert(
        !isPromiseSafe('In 21 days this cures stress and lowers your blood pressure.'),
        'must reject a timeline / cure / blood-pressure claim',
      )
      assert(!isPromiseSafe('Clinically proven to help you lose weight.'), 'must reject a proof / weight-loss claim')
      assert(
        isPromiseSafe('Here’s one gentle way a week could unfold — turning up is the whole win.'),
        'must pass honest, experiential copy',
      )
    },
  },
  {
    group: 'no health-outcome promises',
    name: 'the guilt-free guard is non-trivial (it rejects a shaming line)',
    run: () => {
      assert(!isGuiltFree('Don’t fall behind — you already missed a day this week.'), 'must reject a shaming line')
      assert(isGuiltFree('Some days simply repeat; that’s the point.'), 'must pass a warm line')
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

export function runJourneyTests(): TestSummary {
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

/* Execute when run directly (e.g. `node src/lib/journeyPreview.test.ts`). Not
 * imported by the app, so Vite never bundles it; tsc still type-checks it. */
const summary = runJourneyTests()
const byGroup = new Map<string, { pass: number; total: number }>()
for (const testCase of CASES) {
  const entry = byGroup.get(testCase.group) ?? { pass: 0, total: 0 }
  entry.total++
  const failed = summary.failures.some((f) => f.startsWith(`[${testCase.group} › ${testCase.name}]`))
  if (!failed) entry.pass++
  byGroup.set(testCase.group, entry)
}
console.log('TASK-031 seven-day journey preview — deterministic test cases')
for (const [group, entry] of byGroup) {
  console.log(`  ${entry.pass === entry.total ? '✓' : '✗'} ${group}: ${entry.pass}/${entry.total}`)
}
console.log(`\n${summary.passed}/${summary.total} passed, ${summary.failed} failed`)
if (failures.length > 0) {
  for (const failure of failures) console.log(`  • ${failure}`)
  throw new Error(`${failures.length} journey test check(s) failed`)
}
