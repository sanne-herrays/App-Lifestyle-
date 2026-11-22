/**
 * TASK-025 — Deterministic test cases for the action recommendation rules.
 *
 * Acceptance criterion (tasks.json TASK-025):
 *   "Deterministic test cases cover goal fit, time availability,
 *    contraindication exclusions and no-match fallback."
 *
 * This is a dependency-free, self-contained test module (the prototype has no
 * test runner). It is:
 *   • type-checked by the build — `tsc -b` includes all of `src`, so every case
 *     is compiled under the project's strict settings; and
 *   • directly executable — `node src/lib/recommendation.test.ts` runs it under
 *     Node's native TypeScript stripping. The engine is imported with a `.ts`
 *     specifier (runtime-resolvable); all catalog/`flowData` imports here are
 *     `import type` (erased at runtime), so Node never loads the React-dependent
 *     modules. On any failure the process throws and exits non-zero.
 *
 * Every case supplies its own small fixture catalog, so the outcomes are fully
 * deterministic and independent of catalog churn.
 */

import { parseDurationSeconds, recommend, UNIVERSAL_FALLBACK } from './recommendation.ts'
import type { ActionRecord, CatalogCategory, Contraindication } from './actionCatalog'

/* ------------------------------------------------------- fixture builder -- */

/** Fill the verbose evidence/review fields so a fixture reads as just the bits a case cares about. */
function makeRecord(
  over: Pick<ActionRecord, 'id' | 'category' | 'goal' | 'title' | 'duration' | 'easierVariant' | 'evidenceGrade'> &
    Partial<ActionRecord>,
): ActionRecord {
  return {
    safetyTier: 'S1',
    contraindications: [],
    claim: { permitted: `${over.title} — a small, broadly sensible thing to do.`, forbidden: [] },
    mechanisms: [],
    review: {
      owner: 'Preventive-health specialist',
      lastReviewed: '2026-11-22',
      nextReviewDue: '2027-11-22',
      triggers: [],
    },
    status: 'approved',
    ...over,
  }
}

function contra(context: string, disposition: Contraindication['disposition'], resolution: string): Contraindication {
  return { context, disposition, resolution }
}

/* Reusable fixtures ---------------------------------------------------------- */

const moveFull = makeRecord({
  id: 'fx-move-full',
  category: 'movement',
  goal: 'move',
  title: 'Two minutes of easy movement',
  duration: '2 min',
  easierVariant: { title: 'Twenty seconds of stretching', duration: '20 sec' },
  evidenceGrade: 'A',
})

const moveShort = makeRecord({
  id: 'fx-move-short',
  category: 'movement',
  goal: 'move',
  title: 'March in place for one minute',
  duration: '1 min',
  easierVariant: { title: 'Lift each knee once', duration: '15 sec' },
  evidenceGrade: 'A',
})

const waterFull = makeRecord({
  id: 'fx-water-full',
  category: 'hydration',
  goal: 'water',
  title: 'A glass of water',
  duration: '1 min',
  easierVariant: { title: 'A few sips of water', duration: '15 sec' },
  evidenceGrade: 'B',
})

const calmAdvise = makeRecord({
  id: 'fx-calm-advise',
  category: 'calm',
  goal: 'calm',
  title: 'One minute of slow breathing',
  duration: '1 min',
  easierVariant: { title: 'Three slow breaths', duration: '20 sec' },
  evidenceGrade: 'C',
  contraindications: [contra('Breath discomfort', 'advise-check', 'Fully optional — stop anytime.')],
})

const postureNoGoal = makeRecord({
  id: 'fx-posture',
  category: 'posture',
  goal: null,
  title: 'Roll your shoulders back',
  duration: '20 sec',
  easierVariant: { title: 'Sit tall and lengthen', duration: '10 sec' },
  evidenceGrade: 'B',
})

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
  /** The acceptance dimension this case exercises. */
  group: 'goal fit' | 'time availability' | 'contraindication exclusions' | 'no-match fallback' | 'unit'
  name: string
  run: () => void
}

/* ------------------------------------------------------------- cases ------- */

const CASES: readonly Case[] = [
  /* ---- unit: duration parsing (the time-availability primitive) ---------- */
  {
    group: 'unit',
    name: 'parseDurationSeconds understands min/sec and rejects garbage',
    run: () => {
      assertEqual(parseDurationSeconds('2 min'), 120, '2 min')
      assertEqual(parseDurationSeconds('1 min'), 60, '1 min')
      assertEqual(parseDurationSeconds('20 sec'), 20, '20 sec')
      assertEqual(parseDurationSeconds('10 seconds'), 10, '10 seconds')
      assertEqual(parseDurationSeconds('  40 sec '), 40, 'whitespace tolerated')
      assertEqual(parseDurationSeconds('soon'), Number.POSITIVE_INFINITY, 'garbage ⇒ Infinity')
    },
  },

  /* ---- goal fit ---------------------------------------------------------- */
  {
    group: 'goal fit',
    name: 'picks an action matching the requested goal',
    run: () => {
      const r = recommend({ goal: 'water', catalog: [moveFull, waterFull, calmAdvise] })
      assertEqual(r.reason, 'goal-fit', 'reason')
      assertEqual(r.action.goal, 'water', 'action.goal')
      assertEqual(r.action.sourceId, 'fx-water-full', 'sourceId')
      assertEqual(r.action.form, 'full', 'form')
      assertEqual(r.stats.considered, 1, 'only the water record is goal-fitting')
    },
  },
  {
    group: 'goal fit',
    name: 'among equal-grade goal matches, catalog order is the stable tie-break',
    run: () => {
      // Both grade A, both fit; moveFull appears first ⇒ it wins deterministically.
      const r = recommend({ goal: 'move', catalog: [moveFull, moveShort] })
      assertEqual(r.action.sourceId, 'fx-move-full', 'first-in-catalog wins the tie')
      assertEqual(r.action.form, 'full', 'full action offered when it fits')
    },
  },
  {
    group: 'goal fit',
    name: 'open request (no goal) ranks by evidence grade then order',
    run: () => {
      // No goal ⇒ all considered; grade A (moveFull) beats grade B (waterFull) / C (calmAdvise).
      const r = recommend({ goal: null, catalog: [waterFull, calmAdvise, moveFull] })
      assertEqual(r.reason, 'open-no-goal', 'reason')
      assertEqual(r.action.sourceId, 'fx-move-full', 'grade A wins')
      assertEqual(r.stats.considered, 3, 'all considered when no goal')
    },
  },

  /* ---- time availability ------------------------------------------------- */
  {
    group: 'time availability',
    name: 'steps a full action down to its easier variant when time is tight',
    run: () => {
      // moveFull: full 120s, easier 20s. Budget 30s ⇒ easier only.
      const r = recommend({ goal: 'move', timeAvailableSeconds: 30, catalog: [moveFull] })
      assertEqual(r.reason, 'goal-fit', 'reason')
      assertEqual(r.action.form, 'easier', 'form downgraded')
      assertEqual(r.action.downgradedForTime, true, 'downgradedForTime flag')
      assertEqual(r.action.durationSeconds, 20, 'easier duration chosen')
      assertEqual(r.action.title, 'Twenty seconds of stretching', 'easier title surfaced')
    },
  },
  {
    group: 'time availability',
    name: 'keeps the full action when the budget comfortably allows it',
    run: () => {
      const r = recommend({ goal: 'move', timeAvailableSeconds: 300, catalog: [moveFull] })
      assertEqual(r.action.form, 'full', 'full kept')
      assertEqual(r.action.downgradedForTime, false, 'not downgraded')
      assertEqual(r.action.durationSeconds, 120, 'full duration')
    },
  },
  {
    group: 'time availability',
    name: 'prefers an action that fits in full over one shrunk for time',
    run: () => {
      // Budget 60s: waterFull full=60s fits in FULL; moveFull full=120s shrinks to easier.
      // A full fit must outrank a time-shrunk one regardless of grade.
      const r = recommend({ goal: null, timeAvailableSeconds: 60, catalog: [moveFull, waterFull] })
      assertEqual(r.action.sourceId, 'fx-water-full', 'full-fit beats shrunk-grade-A')
      assertEqual(r.action.form, 'full', 'chosen as full')
    },
  },

  /* ---- contraindication exclusions -------------------------------------- */
  {
    group: 'contraindication exclusions',
    name: 'skip-for-now removes the action and the next candidate is chosen',
    run: () => {
      const injuryMove = makeRecord({
        ...moveFull,
        id: 'fx-move-injury',
        contraindications: [contra('Injury', 'skip-for-now', 'Skip for now; try again when it eases.')],
      })
      const r = recommend({
        goal: 'move',
        declaredContexts: ['Injury'],
        catalog: [injuryMove, moveShort],
      })
      assertEqual(r.stats.excludedByContraindication, 1, 'one excluded')
      assertEqual(r.action.sourceId, 'fx-move-short', 'next candidate chosen')
      assert(r.action.sourceId !== 'fx-move-injury', 'excluded action not recommended')
    },
  },
  {
    group: 'contraindication exclusions',
    name: 'offer-easier forces the easier variant (not a time downgrade)',
    run: () => {
      const kneeMove = makeRecord({
        ...moveFull,
        id: 'fx-move-knee',
        contraindications: [contra('Sore knee', 'offer-easier', 'Use the gentle seated version.')],
      })
      const r = recommend({ goal: 'move', declaredContexts: ['Sore knee'], catalog: [kneeMove] })
      assertEqual(r.action.form, 'easier', 'easier form')
      assertEqual(r.action.downgradedForTime, false, 'not a time downgrade')
      assertEqual(r.action.adaptations.length, 1, 'resolution carried as adaptation')
      assertEqual(r.action.adaptations[0], 'Use the gentle seated version.', 'adaptation text')
    },
  },
  {
    group: 'contraindication exclusions',
    name: 'advise-check keeps the full action and notes the gentle resolution',
    run: () => {
      const r = recommend({ goal: 'calm', declaredContexts: ['Breath discomfort'], catalog: [calmAdvise] })
      assertEqual(r.action.form, 'full', 'full action kept')
      assertEqual(r.stats.excludedByContraindication, 0, 'nothing excluded')
      assertEqual(r.action.adaptations.length, 1, 'advise note carried')
    },
  },
  {
    group: 'contraindication exclusions',
    name: 'matching is case/whitespace-insensitive but exact in meaning',
    run: () => {
      const injuryMove = makeRecord({
        ...moveFull,
        id: 'fx-move-injury2',
        contraindications: [contra('Injury', 'skip-for-now', 'Skip for now.')],
      })
      const r = recommend({ goal: 'move', declaredContexts: ['  injury '], catalog: [injuryMove, moveShort] })
      assertEqual(r.stats.excludedByContraindication, 1, 'normalized match still excludes')
      assertEqual(r.action.sourceId, 'fx-move-short', 'next candidate chosen')
    },
  },
  {
    group: 'contraindication exclusions',
    name: 'an undeclared contraindication has no effect',
    run: () => {
      const injuryMove = makeRecord({
        ...moveFull,
        id: 'fx-move-injury3',
        contraindications: [contra('Injury', 'skip-for-now', 'Skip for now.')],
      })
      const r = recommend({ goal: 'move', catalog: [injuryMove] })
      assertEqual(r.stats.excludedByContraindication, 0, 'no declared context ⇒ no exclusion')
      assertEqual(r.action.sourceId, 'fx-move-injury3', 'action still offered')
    },
  },
  {
    group: 'contraindication exclusions',
    name: 'excludeCategories drops an opted-out family',
    run: () => {
      const r = recommend({
        goal: null,
        excludeCategories: ['movement' as CatalogCategory],
        catalog: [moveFull, waterFull],
      })
      assert(r.action.category !== 'movement', 'movement excluded')
      assertEqual(r.action.sourceId, 'fx-water-full', 'water chosen instead')
    },
  },

  /* ---- no-match fallback ------------------------------------------------- */
  {
    group: 'no-match fallback',
    name: 'when nothing fits the time budget, offers the smallest surviving action',
    run: () => {
      // Budget 5s: moveFull easier=20s doesn't even fit ⇒ no feasible ⇒ fallback.
      const r = recommend({ goal: 'move', timeAvailableSeconds: 5, catalog: [moveFull] })
      assertEqual(r.reason, 'fallback-no-match', 'reason')
      assertEqual(r.action.isFallback, true, 'isFallback')
      assertEqual(r.stats.excludedByTime, 1, 'one excluded by time')
      assertEqual(r.action.sourceId, 'fx-move-full', 'smallest surviving action offered')
      assertEqual(r.action.form, 'easier', 'offered as its easier version')
    },
  },
  {
    group: 'no-match fallback',
    name: 'when every goal action is skipped, relaxes the goal',
    run: () => {
      const injuryMove = makeRecord({
        ...moveFull,
        id: 'fx-move-only',
        contraindications: [contra('Injury', 'skip-for-now', 'Skip for now.')],
      })
      // Only a (skipped) move action matches the goal; a posture action survives.
      const r = recommend({
        goal: 'move',
        declaredContexts: ['Injury'],
        catalog: [injuryMove, postureNoGoal],
      })
      assertEqual(r.reason, 'fallback-no-match', 'reason')
      assertEqual(r.action.sourceId, 'fx-posture', 'goal relaxed to a surviving action')
      assertEqual(r.action.isFallback, true, 'isFallback')
    },
  },
  {
    group: 'no-match fallback',
    name: 'when the goal has no matching actions at all, relaxes the goal',
    run: () => {
      const r = recommend({ goal: 'water', catalog: [postureNoGoal] })
      assertEqual(r.reason, 'fallback-no-match', 'reason')
      assertEqual(r.stats.considered, 0, 'nothing goal-fitting')
      assertEqual(r.action.sourceId, 'fx-posture', 'relaxed pick')
    },
  },
  {
    group: 'no-match fallback',
    name: 'when literally everything is excluded, returns the universal gentle pause',
    run: () => {
      const injuryMove = makeRecord({
        ...moveFull,
        id: 'fx-move-blocked',
        contraindications: [contra('Injury', 'skip-for-now', 'Skip for now.')],
      })
      const r = recommend({ goal: 'move', declaredContexts: ['Injury'], catalog: [injuryMove] })
      assertEqual(r.reason, 'fallback-no-match', 'reason')
      assertEqual(r.action.sourceId, UNIVERSAL_FALLBACK.sourceId, 'universal fallback (null source)')
      assertEqual(r.action.form, 'floor', 'floor form')
      assertEqual(r.action.isFallback, true, 'isFallback')
    },
  },
  {
    group: 'no-match fallback',
    name: 'an empty catalog never dead-ends',
    run: () => {
      const r = recommend({ goal: 'move', catalog: [] })
      assertEqual(r.reason, 'fallback-no-match', 'reason')
      assertEqual(r.action.sourceId, UNIVERSAL_FALLBACK.sourceId, 'universal fallback')
      assert(r.action.title.length > 0, 'still has a warm, usable offer')
    },
  },
  {
    group: 'no-match fallback',
    name: 'the fallback is never punitive (Zero-Guilt copy)',
    run: () => {
      const r = recommend({ goal: 'move', catalog: [] })
      const note = r.action.note.toLowerCase()
      for (const banned of ['fail', 'missed', 'streak', 'broke', 'penalt', 'sorry']) {
        assert(!note.includes(banned), `fallback note avoids "${banned}"`)
      }
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

export function runRecommendationTests(): TestSummary {
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

/* Execute when run directly (e.g. `node src/lib/recommendation.test.ts`). Not
 * imported by the app, so Vite never bundles it; tsc still type-checks it. */
const summary = runRecommendationTests()
const byGroup = new Map<string, { pass: number; total: number }>()
for (const testCase of CASES) {
  const entry = byGroup.get(testCase.group) ?? { pass: 0, total: 0 }
  entry.total++
  const failed = summary.failures.some((f) => f.startsWith(`[${testCase.group} › ${testCase.name}]`))
  if (!failed) entry.pass++
  byGroup.set(testCase.group, entry)
}
console.log('TASK-025 recommendation rules — deterministic test cases')
for (const [group, entry] of byGroup) {
  console.log(`  ${entry.pass === entry.total ? '✓' : '✗'} ${group}: ${entry.pass}/${entry.total}`)
}
console.log(`\n${summary.passed}/${summary.total} passed, ${summary.failed} failed`)
if (summary.failed > 0) {
  for (const failure of summary.failures) console.log(`  • ${failure}`)
  throw new Error(`${summary.failed} recommendation test case(s) failed`)
}
