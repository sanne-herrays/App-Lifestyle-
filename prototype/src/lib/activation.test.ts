/**
 * TASK-033 — Deterministic test cases for activation-event instrumentation.
 *
 * Acceptance criterion (tasks.json TASK-033):
 *   "Event schema documented; each event has anonymous user key, timestamp and
 *    schema version; no raw health details."
 *
 * The suite drives the real engine to prove each clause:
 *   - event schema documented → `ACTIVATION_EVENT_SCHEMA` documents exactly the
 *     keys an emitted event carries, flags none as PII, and stays in lockstep with
 *     real events (a drift would fail the build);
 *   - anonymous user key / timestamp / schema version → every emitted milestone
 *     carries a well-formed anonymous `userKey`, a numeric `occurredAt`, and the
 *     current `schemaVersion`;
 *   - no raw health details → the structural guard rejects any unknown field or any
 *     human-readable (whitespace-bearing) value — proven non-trivial against real
 *     action/reward phrasings — while passing every legitimate event;
 *   - and the funnel is one-time: a repeated completion never mints a second
 *     `first_action_completed`.
 *
 * Dependency-free and self-contained (the prototype has no test runner), matching
 * the TASK-026…032 pattern. Type-checked by `tsc -b` and directly executable —
 * `node src/lib/activation.test.ts` — under Node's native TS stripping. The engine
 * imports only the React-free `isGuiltFree` guard plus a type-only `GoalId`, so Node
 * never loads a React-dependent module. On any failure the process throws non-zero.
 */

import {
  ACTIVATION_EVENT_SCHEMA,
  ACTIVATION_FUNNEL,
  ACTIVATION_SCHEMA_VERSION,
  ALLOWED_EVENT_KEYS,
  activationCopy,
  activationStage,
  carriesRawHealthDetail,
  deriveFromLedger,
  emptyActivation,
  funnelView,
  hasReached,
  isAnonymousKey,
  isGuiltFree,
  isPlainActivationEvent,
  newUserKey,
  recordMilestone,
  serialize,
  deserialize,
  type ActivationEvent,
} from './activation.ts'

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

const USER = 'anon-test-0001'
const T0 = new Date(2026, 10, 23, 9, 0, 0).getTime() // 2026-11-23, local morning

/** Real-world health phrasings that must NEVER be allowed into an event. */
const REAL_HEALTH_PHRASES: readonly string[] = [
  'Two minutes of easy movement',
  'Drink a glass of water',
  'Step outside for twenty seconds',
  'Take three slow breaths',
  'Avoid if you have a knee injury',
]

/* ================================================================ cases ==== */

/* --- 1. event schema is documented, and matches the emitted events --------- */

currentCase = 'schema: documents exactly the event keys, none PII'
{
  const documented = ACTIVATION_EVENT_SCHEMA.map((f) => f.field).sort()
  const allowed = [...ALLOWED_EVENT_KEYS].sort()
  assertEqual(JSON.stringify(documented), JSON.stringify(allowed), 'schema fields match the allow-list')
  assert(
    ACTIVATION_EVENT_SCHEMA.every((f) => f.pii === false),
    'no documented field is flagged PII',
  )
  assert(
    ACTIVATION_EVENT_SCHEMA.every((f) => f.description.trim().length > 0),
    'every documented field has a description',
  )
  // required flags: userKey/eventType/occurredAt/schemaVersion required, goalCategory optional
  const byField = new Map(ACTIVATION_EVENT_SCHEMA.map((f) => [f.field, f]))
  assert(byField.get('userKey')?.required === true, 'userKey documented required')
  assert(byField.get('occurredAt')?.required === true, 'occurredAt documented required')
  assert(byField.get('schemaVersion')?.required === true, 'schemaVersion documented required')
  assert(byField.get('goalCategory')?.required === false, 'goalCategory documented optional')
}

currentCase = 'schema: documentation stays in lockstep with a real emitted event'
{
  const { event } = recordMilestone(emptyActivation(USER), 'first_action_completed', T0, 'move')
  const eventKeys = Object.keys(event).sort()
  const documentedRequired = ACTIVATION_EVENT_SCHEMA.filter((f) => f.required).map((f) => f.field)
  // every required documented field is present on a real event
  for (const field of documentedRequired) {
    assert(eventKeys.includes(field), `real event carries documented required field "${field}"`)
  }
  // every key a real event carries is documented (no undocumented field leaks)
  for (const key of eventKeys) {
    assert(
      ACTIVATION_EVENT_SCHEMA.some((f) => f.field === key),
      `real event key "${key}" is documented`,
    )
  }
}

/* --- 2. every event carries anon key + timestamp + schema version ---------- */

currentCase = 'event shape: anon key, timestamp, schema version on every milestone'
{
  let state = emptyActivation(USER)
  const stamped: ActivationEvent[] = []
  let t = T0
  for (const type of ACTIVATION_FUNNEL) {
    const result = recordMilestone(state, type, t, 'calm')
    assert(result.added, `${type} recorded`)
    stamped.push(result.event)
    state = result.state
    t += 1000
  }
  assertEqual(stamped.length, 4, 'all four milestones recorded')
  for (const event of stamped) {
    assert(isAnonymousKey(event.userKey), `${event.eventType}: userKey is anonymous`)
    assertEqual(event.userKey, USER, `${event.eventType}: userKey is the state's key`)
    assert(typeof event.occurredAt === 'number' && Number.isFinite(event.occurredAt), `${event.eventType}: numeric timestamp`)
    assertEqual(event.schemaVersion, ACTIVATION_SCHEMA_VERSION, `${event.eventType}: schema version stamped`)
  }
}

currentCase = 'anon key: random, non-identifying; rejects identity-looking values'
{
  const a = newUserKey()
  const b = newUserKey()
  assert(a !== b, 'two minted keys differ')
  assert(isAnonymousKey(a), 'minted key is anonymous')
  assert(a.startsWith('anon-'), 'minted key reads as anonymous')
  // rejects things that look like identity / free text
  assert(!isAnonymousKey('alex@example.com'), 'rejects an email')
  assert(!isAnonymousKey('Alex Rivera'), 'rejects a name with whitespace')
  assert(!isAnonymousKey(''), 'rejects the empty string')
  assert(!isAnonymousKey(42), 'rejects a non-string')
}

/* --- 3. NO RAW HEALTH DETAILS (the distinguishing clause) ------------------- */

currentCase = 'no-health: every legitimate event passes the guard'
{
  let state = emptyActivation(USER)
  for (const type of ACTIVATION_FUNNEL) {
    const withCat = recordMilestone(state, type, T0, 'water')
    assert(!carriesRawHealthDetail(withCat.event), `${type} (with category) carries no raw health detail`)
    state = withCat.state
  }
  // and with no category at all
  const { event } = recordMilestone(emptyActivation(USER), 'onboarding_started', T0)
  assert(!carriesRawHealthDetail(event), 'category-less event carries no raw health detail')
  assert(event.goalCategory === undefined, 'omitting the category leaves it absent (not null/empty)')
}

currentCase = 'no-health: guard is non-trivial — catches real action/reward phrasings'
{
  // A clean event with a leaked action title under an extra field → rejected (unknown key).
  const base = recordMilestone(emptyActivation(USER), 'first_action_completed', T0, 'move').event
  for (const phrase of REAL_HEALTH_PHRASES) {
    const leaked = { ...base, actionTitle: phrase }
    assert(carriesRawHealthDetail(leaked), `leaked actionTitle "${phrase}" is rejected`)
    assert(!isPlainActivationEvent(leaked), `leaked actionTitle "${phrase}" is not a plain event`)
  }
  // A leaked phrase smuggled into an *allowed* field (a free-text goalCategory) → rejected (whitespace).
  const smuggled = { ...base, goalCategory: 'drink a glass of water' }
  assert(carriesRawHealthDetail(smuggled), 'whitespace value in an allowed field is rejected')
  assert(!isPlainActivationEvent(smuggled), 'free-text goalCategory is not a valid bucket')
  // A non-token, non-number value → rejected.
  assert(carriesRawHealthDetail({ ...base, occurredAt: { nested: 1 } }), 'nested object value is rejected')
}

currentCase = 'no-health: the coarse bucket enum tokens are NOT raw detail'
{
  // The four buckets are single tokens → legitimately pass (a bucket is not raw detail).
  for (const cat of ['move', 'calm', 'water', 'outside'] as const) {
    const { event } = recordMilestone(emptyActivation(USER), 'first_action_completed', T0, cat)
    assert(!carriesRawHealthDetail(event), `bucket "${cat}" is a token, not raw detail`)
    assert(isPlainActivationEvent(event), `bucket "${cat}" yields a plain event`)
  }
}

/* --- 4. funnel is one-time; ordering + derived stage ----------------------- */

currentCase = 'funnel: a milestone is recorded at most once (first-action is a FIRST)'
{
  let state = emptyActivation(USER)
  const first = recordMilestone(state, 'first_action_completed', T0, 'move')
  assert(first.added, 'first completion emits first_action_completed')
  state = first.state
  const again = recordMilestone(state, 'first_action_completed', T0 + 60_000, 'calm')
  assert(!again.added, 'a later completion does NOT emit a second first_action_completed')
  assertEqual(again.event.occurredAt, T0, 'the original timestamp is preserved')
  assertEqual(again.event.goalCategory, 'move', 'the original category is preserved')
  assertEqual(state.events.length, 1, 'still exactly one activation event')
}

currentCase = 'funnel: derived stage is the furthest reached, in order'
{
  let state = emptyActivation(USER)
  assertEqual(activationStage(state), null, 'no milestones → null stage')
  state = recordMilestone(state, 'onboarding_started', T0).state
  assertEqual(activationStage(state), 'onboarding_started', 'stage after start')
  state = recordMilestone(state, 'first_reward_shown', T0 + 2000).state
  // even recording a later milestone out of sequence, stage reports the furthest-in-order reached
  assertEqual(activationStage(state), 'first_reward_shown', 'furthest-in-order stage')
  assert(hasReached(state, 'onboarding_started'), 'start still reached')
  assert(!hasReached(state, 'onboarding_completed'), 'skipped milestone not falsely reached')
  const rows = funnelView(state)
  assertEqual(rows.length, 4, 'funnel view has one row per milestone')
  assertEqual(rows[0]?.reached, true, 'row 0 reached')
  assertEqual(rows[1]?.reached, false, 'row 1 not reached')
  assertEqual(rows[0]?.occurredAt, T0, 'reached row carries its timestamp')
  assertEqual(rows[1]?.occurredAt, null, 'unreached row has null timestamp')
}

currentCase = 'ledger: first action + reward derived once from the real ledger shape'
{
  const ledger = [
    { completedAt: T0 + 5000, goalId: 'calm' as const },
    { completedAt: T0, goalId: 'move' as const }, // the earliest
    { completedAt: T0 + 9000, goalId: 'water' as const },
  ]
  const first = deriveFromLedger(emptyActivation(USER), ledger)
  assert(first.added, 'first ledger fold adds milestones')
  assert(hasReached(first.state, 'first_action_completed'), 'first_action_completed derived')
  assert(hasReached(first.state, 'first_reward_shown'), 'first_reward_shown derived')
  const action = first.state.events.find((e) => e.eventType === 'first_action_completed')
  assertEqual(action?.occurredAt, T0, 'uses the EARLIEST completion time')
  assertEqual(action?.goalCategory, 'move', 'uses the earliest completion bucket')
  assert(!carriesRawHealthDetail(action as ActivationEvent), 'derived event carries no raw detail')
  // folding again changes nothing (one-time)
  const second = deriveFromLedger(first.state, [...ledger, { completedAt: T0 + 20_000, goalId: 'outside' as const }])
  assert(!second.added, 'a later ledger fold adds nothing new')
  assertEqual(second.state.events.length, 2, 'still exactly action + reward')
  // empty ledger is a no-op
  assert(!deriveFromLedger(emptyActivation(USER), []).added, 'empty ledger adds nothing')
}

/* --- 5. durable round-trip drops leaks and duplicates ---------------------- */

currentCase = 'persistence: serialize → deserialize round-trips a clean record'
{
  let state = emptyActivation(USER)
  state = recordMilestone(state, 'onboarding_started', T0).state
  state = recordMilestone(state, 'first_action_completed', T0 + 1000, 'move').state
  const back = deserialize(serialize(state))
  assert(back !== null, 'round-trip parses')
  assertEqual(back?.userKey, USER, 'user key preserved')
  assertEqual(back?.events.length, 2, 'both events preserved')
  assert((back?.events ?? []).every((e) => !carriesRawHealthDetail(e)), 'no event carries raw detail after reload')
}

currentCase = 'persistence: a corrupted store drops leaked/duplicate/foreign events'
{
  const dirty = JSON.stringify({
    userKey: USER,
    events: [
      { userKey: USER, eventType: 'onboarding_started', occurredAt: T0, schemaVersion: 1 },
      { userKey: USER, eventType: 'onboarding_started', occurredAt: T0 + 1, schemaVersion: 1 }, // dup type
      { userKey: USER, eventType: 'first_action_completed', occurredAt: T0, schemaVersion: 1, actionTitle: 'Two minutes outside' }, // leaked field
      { userKey: 'anon-someone-else', eventType: 'first_reward_shown', occurredAt: T0, schemaVersion: 1 }, // foreign user
      { eventType: 'not_a_real_event', occurredAt: T0, schemaVersion: 1, userKey: USER }, // bad type
    ],
  })
  const parsed = deserialize(dirty)
  assert(parsed !== null, 'dirty store still parses to a record')
  assertEqual(parsed?.events.length, 1, 'only the one clean, unique, owned event survives')
  assertEqual(parsed?.events[0]?.eventType, 'onboarding_started', 'the surviving event is the clean one')
  assertEqual(deserialize('not json at all'), null, 'garbage parses to null')
  assertEqual(deserialize(JSON.stringify({ events: [] })), null, 'missing anon user key → null')
}

/* --- 6. zero-guilt copy (CLAUDE.md §1) ------------------------------------- */

currentCase = 'zero-guilt: every surfaced string is guilt-free'
{
  const lines = activationCopy()
  assert(lines.length > 0, 'there is copy to check')
  for (const line of lines) {
    assert(isGuiltFree(line), `copy is guilt-free: "${line}"`)
  }
  // guard is non-trivial: a real shaming line is rejected
  assert(!isGuiltFree('You broke your streak — you failed to activate. Don’t fall behind!'), 'guard rejects shame copy')
}

/* =============================================================== report ==== */

const TOTAL_GROUPS = 13
if (failures.length > 0) {
  console.error(`\n✗ activation.test.ts — ${failures.length} assertion(s) failed:\n`)
  for (const f of failures) console.error('  • ' + f)
  console.error('')
  throw new Error(`activation.test.ts failed with ${failures.length} failing assertion(s).`)
}
console.log(`✓ activation.test.ts — all ${TOTAL_GROUPS} case groups passed.`)
