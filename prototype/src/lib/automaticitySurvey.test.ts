/**
 * TASK-035 — Deterministic test cases for the habit automaticity survey.
 *
 * Acceptance criterion (tasks.json TASK-035):
 *   "Survey version and attribution stored; optional completion; baseline and
 *    follow-up results can be compared."
 *
 * The suite drives the real engine to prove each clause:
 *   - survey version and attribution stored → every built response carries the
 *     instrument id + version, a verbatim attribution snapshot and the schema version;
 *     the instrument's attribution is complete and names the validated SRBAI source;
 *   - optional completion → the survey is opt-in, an incomplete draft is a valid
 *     (unscored) state rather than an error, and a partial response scores null;
 *   - baseline and follow-up compared → a baseline and follow-up of the same instrument
 *     version yield an honest delta, and a comparison across versions or with an
 *     incomplete side is marked not-comparable with a plain reason.
 *
 * Dependency-free and self-contained (the prototype has no test runner), matching the
 * TASK-026…034 pattern. Type-checked by `tsc -b` and directly executable —
 * `node src/lib/automaticitySurvey.test.ts` — under Node's native TS stripping. The
 * engine imports only the React-free `isGuiltFree` guard, so Node never loads a
 * React-dependent module. On any failure the process throws non-zero.
 */

import {
  AUTOMATICITY_SCHEMA_VERSION,
  BAND_COPY,
  BEHAVIOUR_PHRASE,
  DEFAULT_INSTRUMENT,
  SRBAI,
  SURVEY_IS_OPTIONAL,
  answeredCount,
  attributionComplete,
  automaticityBand,
  buildResponse,
  compareBaselineToLatest,
  compareResponses,
  deserialize,
  earliestBaseline,
  isComplete,
  isGuiltFree,
  isPlainResponse,
  isValidAnswer,
  itemSentence,
  latestFollowUp,
  scoreResponse,
  serialize,
  stemFor,
  surveyCopy,
  type AutomaticityState,
  type SurveyInstrument,
  type SurveyResponse,
} from './automaticitySurvey.ts'

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

function assertClose(actual: number | null, expected: number | null, label: string): void {
  if (expected === null || actual === null) {
    assertEqual(actual, expected, label)
    return
  }
  if (Math.abs(actual - expected) > 1e-9) {
    failures.push(`[${currentCase}] ${label}: expected ${expected}, got ${actual}`)
  }
}

/* --------------------------------------------------------------- helpers ---- */

const T0 = 1_700_000_000_000 // a fixed instant; the engine never reads a real clock

/** Answer all four SRBAI items with one value. */
function allItems(value: number): Record<string, number> {
  return { srbai_1: value, srbai_2: value, srbai_3: value, srbai_4: value }
}

/** A complete response built deterministically. */
function response(
  id: string,
  phase: 'baseline' | 'follow_up',
  answers: Record<string, number>,
  at: number,
  instrument: SurveyInstrument = DEFAULT_INSTRUMENT,
): SurveyResponse {
  return buildResponse({ responseId: id, phase, answers, completedAt: at, goalCategory: 'move', instrument })
}

/* ================================================================ cases ==== */

/* --- 1. instrument is the validated SRBAI, well-formed --------------------- */

currentCase = 'instrument: SRBAI, 4 items, 1–7 scale, verbatim stem'
{
  assertEqual(SRBAI.id, 'SRBAI', 'instrument id')
  assert(SRBAI.version.trim().length > 0, 'instrument has a version')
  assertEqual(SRBAI.items.length, 4, 'exactly four items (the SRBAI subscale)')
  assert(
    SRBAI.items.every((i) => i.validated && !i.reverseScored),
    'every SRBAI item is validated and positively keyed',
  )
  assertEqual(SRBAI.scale.min, 1, 'scale min is 1')
  assertEqual(SRBAI.scale.max, 7, 'scale max is 7')
  assert(SRBAI.scale.anchors.length >= 2, 'scale has anchors')
  assertEqual(stemFor('move'), 'Moving a little each day is something I…', 'stem interpolates the behaviour phrase')
  assert(
    itemSentence('move', SRBAI.items[0]!).includes('do automatically.'),
    'full item sentence joins stem + item',
  )
  assert(new Set(SRBAI.items.map((i) => i.id)).size === 4, 'item ids are unique')
}

/* --- 2. attribution is stored and complete (validated instrument) ---------- */

currentCase = 'attribution: complete, validated, names the SRBAI source'
{
  const a = SRBAI.attribution
  assert(attributionComplete(a), 'attribution is fully populated')
  assertEqual(a.validated, true, 'the instrument is marked validated')
  assertEqual(a.evidenceGrade, 'A', 'grade A, matching the evidence register §3.6')
  assertEqual(a.year, 2012, 'correct publication year')
  assert(a.authors.includes('Gardner'), 'attribution names the author')
  assert(a.citation.includes('SRBAI') || a.citation.includes('Self-Report Habit Index'), 'citation names the instrument')
  assert(a.source.toLowerCase().includes('nutrition'), 'source names the journal (IJBNPA)')
  assert(a.licenseNote.trim().length > 0, 'a reproduction/license note is stored')
  // guard is non-trivial: an empty-provenance attribution is rejected
  assert(
    !attributionComplete({ ...a, citation: '  ' }),
    'attributionComplete rejects a blank citation',
  )
}

/* --- 3. every response stores version + attribution snapshot + schema ------ */

currentCase = 'response: stamps instrument id/version, attribution snapshot, schema, phase, time'
{
  const r = response('r1', 'baseline', allItems(5), T0)
  assertEqual(r.instrumentId, 'SRBAI', 'instrument id stored on the response')
  assertEqual(r.instrumentVersion, SRBAI.version, 'instrument version stored on the response')
  assertEqual(r.attributionCitation, SRBAI.attribution.citation, 'verbatim attribution snapshot stored')
  assertEqual(r.schemaVersion, AUTOMATICITY_SCHEMA_VERSION, 'schema version stamped')
  assertEqual(r.phase, 'baseline', 'phase stored')
  assertEqual(r.completedAt, T0, 'timestamp stored')
  assertEqual(r.goalCategory, 'move', 'coarse goal bucket stored')
}

/* --- 4. out-of-range and unknown answers can never be stored --------------- */

currentCase = 'response: out-of-range + unknown item answers are dropped at build time'
{
  const r = buildResponse({
    responseId: 'r2',
    phase: 'baseline',
    answers: { srbai_1: 5, srbai_2: 9, srbai_3: 0, srbai_4: 4, not_an_item: 6 },
    completedAt: T0,
  })
  assertEqual(r.answers.srbai_1, 5, 'in-range answer kept')
  assertEqual(r.answers.srbai_4, 4, 'in-range answer kept')
  assertEqual(r.answers.srbai_2, undefined, 'above-scale answer dropped')
  assertEqual(r.answers.srbai_3, undefined, 'below-scale answer dropped')
  assertEqual((r.answers as Record<string, number>).not_an_item, undefined, 'unknown item id dropped')
  assert(isValidAnswer(1) && isValidAnswer(7), 'scale bounds are valid answers')
  assert(!isValidAnswer(0) && !isValidAnswer(8) && !isValidAnswer(Number.NaN), 'out-of-range / NaN are invalid')
}

/* --- 5. optional completion: incomplete is a valid, unscored state --------- */

currentCase = 'optional: survey is opt-in; a partial reflection is valid and scores null'
{
  assertEqual(SURVEY_IS_OPTIONAL, true, 'the survey is declared optional')
  const partial = buildResponse({
    responseId: 'r3',
    phase: 'baseline',
    answers: { srbai_1: 6, srbai_2: 6 }, // only two of four answered
    completedAt: T0,
  })
  assertEqual(answeredCount(partial.answers), 2, 'answeredCount reflects the partial draft')
  assert(!isComplete(partial), 'a partial response is not complete')
  assertEqual(scoreResponse(partial), null, 'an incomplete response has no score')
  const empty = buildResponse({ responseId: 'r3b', phase: 'baseline', answers: {}, completedAt: T0 })
  assertEqual(answeredCount(empty.answers), 0, 'an empty draft has zero answers')
  assertEqual(scoreResponse(empty), null, 'an empty draft scores null — not an error')
}

/* --- 6. scoring: mean of the four items ------------------------------------ */

currentCase = 'scoring: score is the mean of the four item answers (1–7)'
{
  assert(isComplete(response('s1', 'baseline', allItems(7), T0)), 'all-answered is complete')
  assertClose(scoreResponse(response('s1', 'baseline', allItems(7), T0)), 7, 'all 7 → 7.0')
  assertClose(scoreResponse(response('s2', 'baseline', allItems(1), T0)), 1, 'all 1 → 1.0')
  assertClose(
    scoreResponse(response('s3', 'baseline', { srbai_1: 6, srbai_2: 6, srbai_3: 7, srbai_4: 5 }, T0)),
    6,
    'mean of 6,6,7,5 → 6.0',
  )
  assertClose(
    scoreResponse(response('s4', 'baseline', { srbai_1: 2, srbai_2: 3, srbai_3: 4, srbai_4: 5 }, T0)),
    3.5,
    'mean of 2,3,4,5 → 3.5',
  )
}

/* --- 7. automaticity bands (warm, no pass/fail) ---------------------------- */

currentCase = 'bands: emerging / developing / strong, never a failure'
{
  assertEqual(automaticityBand(null), null, 'no band without a score')
  assertEqual(automaticityBand(1), 'emerging', 'score 1 → emerging')
  assertEqual(automaticityBand(2.9), 'emerging', 'score 2.9 → emerging')
  assertEqual(automaticityBand(3), 'developing', 'score 3 → developing')
  assertEqual(automaticityBand(4.9), 'developing', 'score 4.9 → developing')
  assertEqual(automaticityBand(5), 'strong', 'score 5 → strong')
  assertEqual(automaticityBand(7), 'strong', 'score 7 → strong')
  for (const band of ['emerging', 'developing', 'strong'] as const) {
    assert(BAND_COPY[band].label.trim().length > 0, `${band} has a label`)
  }
}

/* --- 8. baseline vs follow-up comparison (same version) -------------------- */

currentCase = 'compare: a baseline and follow-up of the same version yield an honest delta'
{
  const base = response('b', 'baseline', allItems(3), T0)
  const follow = response('f', 'follow_up', allItems(5), T0 + 1000)
  const cmp = compareResponses(base, follow)
  assert(cmp.comparable, 'same instrument version + both complete → comparable')
  assertClose(cmp.baselineScore, 3, 'baseline score')
  assertClose(cmp.followUpScore, 5, 'follow-up score')
  assertClose(cmp.delta, 2, 'delta = follow-up − baseline')
  assertEqual(cmp.direction, 'up', 'direction up')
  assert(cmp.note.length > 0, 'carries an honest framing note')

  const down = compareResponses(response('b2', 'baseline', allItems(6), T0), response('f2', 'follow_up', allItems(4), T0))
  assertEqual(down.direction, 'down', 'a decrease reads as down (never shamed)')
  const same = compareResponses(response('b3', 'baseline', allItems(5), T0), response('f3', 'follow_up', allItems(5), T0))
  assertEqual(same.direction, 'same', 'no change reads as same')
  assertClose(same.delta, 0, 'zero delta')
}

/* --- 9. not comparable across versions or with an incomplete side ---------- */

currentCase = 'compare: different versions / incomplete → not comparable, with a reason'
{
  const v2: SurveyInstrument = { ...SRBAI, version: '2.0' }
  const base = response('bv1', 'baseline', allItems(3), T0) // v1.0
  const followV2 = buildResponse({
    responseId: 'fv2',
    phase: 'follow_up',
    answers: allItems(5),
    completedAt: T0,
    instrument: v2,
  })
  const crossVersion = compareResponses(base, followV2)
  assert(!crossVersion.comparable, 'different instrument versions are not comparable')
  assert(crossVersion.delta === null, 'no delta is computed across versions')
  assert(crossVersion.reason.toLowerCase().includes('version'), 'reason explains the version mismatch')

  const incomplete = buildResponse({ responseId: 'inc', phase: 'follow_up', answers: { srbai_1: 5 }, completedAt: T0 })
  const withIncomplete = compareResponses(base, incomplete)
  assert(!withIncomplete.comparable, 'an incomplete side is not comparable')
  assert(withIncomplete.followUpScore === null, 'the incomplete side has no score')
  assert(withIncomplete.reason.toLowerCase().includes('complete'), 'reason explains the incompleteness')
}

/* --- 10. compareBaselineToLatest picks earliest baseline + latest follow-up - */

currentCase = 'history: compareBaselineToLatest uses earliest baseline and latest follow-up'
{
  const state: AutomaticityState = {
    responses: [
      response('b-late', 'baseline', allItems(4), T0 + 5000),
      response('b-early', 'baseline', allItems(2), T0 + 1000),
      response('f-early', 'follow_up', allItems(5), T0 + 2000),
      response('f-late', 'follow_up', allItems(6), T0 + 9000),
    ],
  }
  assertEqual(earliestBaseline(state)?.responseId, 'b-early', 'earliest baseline chosen')
  assertEqual(latestFollowUp(state)?.responseId, 'f-late', 'latest follow-up chosen')
  const cmp = compareBaselineToLatest(state)
  assert(cmp !== null, 'a comparison is produced')
  assertClose(cmp?.baselineScore ?? null, 2, 'baseline = earliest baseline score')
  assertClose(cmp?.followUpScore ?? null, 6, 'follow-up = latest follow-up score')
  assertClose(cmp?.delta ?? null, 4, 'delta computed from the right pair')

  assertEqual(compareBaselineToLatest({ responses: [] }), null, 'nothing to compare yet → null, not an error')
  assertEqual(
    compareBaselineToLatest({ responses: [response('only-base', 'baseline', allItems(3), T0)] }),
    null,
    'a baseline with no follow-up yet → null',
  )
}

/* --- 11. serialize / deserialize round-trip, keeping provenance ------------ */

currentCase = 'persistence: round-trips responses with version + attribution intact'
{
  const state: AutomaticityState = {
    responses: [response('p1', 'baseline', allItems(3), T0), response('p2', 'follow_up', allItems(5), T0 + 10)],
  }
  const restored = deserialize(serialize(state))
  assert(restored !== null, 'round-trips to a state')
  assertEqual(restored?.responses.length, 2, 'both responses survive')
  assertEqual(restored?.responses[0]?.instrumentVersion, SRBAI.version, 'version preserved through storage')
  assertEqual(
    restored?.responses[0]?.attributionCitation,
    SRBAI.attribution.citation,
    'attribution snapshot preserved through storage',
  )
}

/* --- 12. deserialize drops malformed / un-provenanced / out-of-scale rows --- */

currentCase = 'persistence: malformed, un-provenanced or out-of-scale responses are dropped'
{
  const good = response('ok', 'baseline', allItems(4), T0)
  const dirty = JSON.stringify({
    responses: [
      good,
      { ...good, responseId: 'no-attr', attributionCitation: '' }, // lost its attribution
      { ...good, responseId: 'bad-ver', schemaVersion: 999 }, // wrong schema version
      { ...good, responseId: 'bad-phase', phase: 'midway' }, // invalid phase
      { ...good, responseId: 'out-of-scale', answers: { srbai_1: 99 } }, // impossible answer
      { ...good, responseId: 'ok' }, // duplicate id
    ],
  })
  const parsed = deserialize(dirty)
  assert(parsed !== null, 'dirty store still parses to a record')
  assertEqual(parsed?.responses.length, 1, 'only the one clean, unique, well-provenanced response survives')
  assertEqual(parsed?.responses[0]?.responseId, 'ok', 'the surviving response is the clean one')
  assert(!isPlainResponse({ ...good, attributionCitation: '' }), 'guard rejects a response with no attribution')
  assert(!isPlainResponse({ ...good, instrumentVersion: '' }), 'guard rejects a response with no version')
  assertEqual(deserialize('not json at all'), null, 'garbage parses to null')
}

/* --- 13. zero-guilt + integrity copy (CLAUDE.md §1/§3) --------------------- */

currentCase = 'zero-guilt: every surfaced string is guilt-free and behaviour-framed'
{
  const lines = surveyCopy()
  assert(lines.length > 0, 'there is copy to check')
  for (const line of lines) {
    assert(isGuiltFree(line), `copy is guilt-free: "${line}"`)
  }
  // the copy explicitly frames this as a reflection, not a health result
  const blob = lines.join(' ').toLowerCase()
  assert(blob.includes('reflection'), 'copy frames the survey as a reflection')
  assert(blob.includes('optional'), 'copy states the survey is optional')
  assert(BEHAVIOUR_PHRASE.move.length > 0, 'behaviour phrases exist for the stem')
  // guard is non-trivial: a real shaming line is rejected
  assert(
    !isGuiltFree('You broke your streak and fell behind — your habit is a failure.'),
    'guard rejects shame copy',
  )
}

/* =============================================================== report ==== */

const TOTAL_GROUPS = 13
if (failures.length > 0) {
  console.error(`\n✗ automaticitySurvey.test.ts — ${failures.length} assertion(s) failed:\n`)
  for (const f of failures) console.error('  • ' + f)
  console.error('')
  throw new Error(`automaticitySurvey.test.ts failed with ${failures.length} failing assertion(s).`)
}
console.log(`✓ automaticitySurvey.test.ts — all ${TOTAL_GROUPS} case groups passed.`)
