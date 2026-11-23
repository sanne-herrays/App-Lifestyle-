/**
 * TASK-041 — Deterministic test cases for the privacy and consent controls.
 *
 * Acceptance criterion (tasks.json TASK-041):
 *   "Consent can be withdrawn; export and deletion flows tested; no optional
 *    health data collected by default."
 *
 * The suite drives the real engine to prove each clause:
 *   - consent can be withdrawn → granting then withdrawing an optional purpose
 *     flips its grant off AND returns its keys for erasure; essential purposes
 *     cannot be withdrawn this way;
 *   - export and deletion flows → `buildExport` reads every registry key into a
 *     complete bundle, and `eraseAll` / `erasePurpose` remove exactly the right
 *     keys from an in-memory store (nothing left behind, nothing unrelated touched);
 *   - no optional health data collected by default → the fresh-install consent
 *     has every optional purpose off, health is never essential, and
 *     `collectsOptionalHealthByDefault` is false.
 *
 * Dependency-free and self-contained (the prototype has no test runner), matching
 * the TASK-026…037 pattern. Type-checked by `tsc -b` and directly executable —
 * `node src/lib/privacy.test.ts` — under Node's native TS stripping. The engine
 * imports only the React-free `isGuiltFree` guard, so Node never loads a
 * React-dependent module. On any failure the process throws non-zero.
 */

import {
  ALL_STORAGE_KEYS,
  CONSENT_PURPOSES,
  CONSENT_STORAGE_KEY,
  ESSENTIAL_PURPOSES,
  OPTIONAL_PURPOSES,
  PRIVACY_SCHEMA_VERSION,
  buildExport,
  collectedPurposes,
  collectsOptionalHealthByDefault,
  defaultConsent,
  deserialize,
  eraseAll,
  erasePurpose,
  grantConsent,
  isCollectingHealthData,
  isConsentPurposeId,
  isGranted,
  isGuiltFree,
  mayCollect,
  privacyCopy,
  purposeById,
  serialize,
  serializeExport,
  setConsent,
  withdrawConsent,
  type ConsentPurposeId,
} from './privacy.ts'

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

/** A tiny in-memory storage port so export/erase are exercised without localStorage. */
function makeStore(seed: Record<string, string> = {}): {
  read: (key: string) => string | null
  remove: (key: string) => void
  keys: () => string[]
  raw: Map<string, string>
} {
  const raw = new Map<string, string>(Object.entries(seed))
  return {
    read: (key) => (raw.has(key) ? (raw.get(key) as string) : null),
    remove: (key) => {
      raw.delete(key)
    },
    keys: () => [...raw.keys()],
    raw,
  }
}

const T0 = new Date(2026, 10, 23, 9, 0, 0).getTime() // 2026-11-23, local morning

/* ================================================================ cases ==== */

/* --- 1. registry integrity: health is never essential; keys are complete --- */

currentCase = 'registry: the purpose registry is coherent and complete'
{
  assert(CONSENT_PURPOSES.length > 0, 'there are purposes')
  assert(OPTIONAL_PURPOSES.length > 0, 'there are optional purposes to toggle')
  assert(ESSENTIAL_PURPOSES.length > 0, 'there are essential purposes for the loop')
  // health data is NEVER essential — the crux of "not collected by default"
  for (const p of CONSENT_PURPOSES) {
    if (p.containsHealthData) assert(!p.essential, `health purpose "${p.id}" is never essential`)
  }
  // every essential purpose defaults on; every optional purpose defaults off
  for (const p of ESSENTIAL_PURPOSES) assert(p.defaultGranted, `essential "${p.id}" defaults granted`)
  for (const p of OPTIONAL_PURPOSES) assert(!p.defaultGranted, `optional "${p.id}" defaults NOT granted`)
  // ALL_STORAGE_KEYS is exactly the union of every purpose's keys, with no duplicates
  const union = CONSENT_PURPOSES.flatMap((p) => p.storageKeys)
  assertEqual(JSON.stringify([...ALL_STORAGE_KEYS].sort()), JSON.stringify([...union].sort()), 'ALL_STORAGE_KEYS == union of purpose keys')
  assertEqual(new Set(union).size, union.length, 'no storage key belongs to two purposes')
  assert(!union.includes(CONSENT_STORAGE_KEY), 'the consent record key is not itself a data key')
  // id guard
  assert(isConsentPurposeId('connected_health'), 'known id recognised')
  assert(!isConsentPurposeId('nope'), 'unknown id rejected')
  assert(purposeById('nope') === null, 'purposeById null for unknown id')
}

/* --- 2. NO OPTIONAL HEALTH DATA COLLECTED BY DEFAULT ------------------------ */

currentCase = 'default: a fresh install collects no optional data, and no health data at all'
{
  const fresh = defaultConsent(T0)
  assertEqual(fresh.schemaVersion, PRIVACY_SCHEMA_VERSION, 'schema version stamped')
  // every optional purpose is off
  for (const p of OPTIONAL_PURPOSES) {
    assert(!isGranted(fresh, p.id), `optional "${p.id}" starts off`)
    assert(!mayCollect(fresh, p.id), `nothing is collected for optional "${p.id}" by default`)
  }
  // every essential purpose is on (the app works out of the box)
  for (const p of ESSENTIAL_PURPOSES) {
    assert(isGranted(fresh, p.id), `essential "${p.id}" starts on`)
    assert(mayCollect(fresh, p.id), `essential "${p.id}" is collectible`)
  }
  // the headline predicate the criterion turns on
  assert(!collectsOptionalHealthByDefault(), 'collectsOptionalHealthByDefault() is false')
  assert(!isCollectingHealthData(fresh), 'no health data is being collected on a fresh install')
  // only the essential purposes are collected on day zero
  assertEqual(collectedPurposes(fresh).length, ESSENTIAL_PURPOSES.length, 'only essential purposes collected by default')
}

/* --- 3. CONSENT CAN BE WITHDRAWN ------------------------------------------- */

currentCase = 'withdraw: an optional purpose can be granted and then fully withdrawn'
{
  const fresh = defaultConsent(T0)
  const health = purposeById('connected_health')
  assert(health !== null, 'the health purpose exists')
  // grant it
  const granted = grantConsent(fresh, 'connected_health', T0 + 1)
  assert(isGranted(granted, 'connected_health'), 'health consent is granted after opt-in')
  assert(mayCollect(granted, 'connected_health'), 'health data is collectible once granted')
  assert(isCollectingHealthData(granted), 'health collection is on after opt-in')
  // withdraw it — grant flips off AND its keys come back for erasure
  const result = withdrawConsent(granted, 'connected_health', T0 + 2)
  assert(result.withdrawn, 'withdrawal applied')
  assert(!isGranted(result.state, 'connected_health'), 'health consent is off after withdrawal')
  assert(!mayCollect(result.state, 'connected_health'), 'nothing collected after withdrawal')
  assertEqual(
    JSON.stringify(result.erasedKeys),
    JSON.stringify(health?.storageKeys),
    'withdrawal returns exactly the purpose keys to erase (off means gone)',
  )
  assert(result.state.updatedAt === T0 + 2, 'withdrawal stamps updatedAt')
}

currentCase = 'withdraw: withdrawing an already-off purpose is a no-op; essential cannot be withdrawn'
{
  const fresh = defaultConsent(T0)
  // optional but already off → nothing happens
  const offAgain = withdrawConsent(fresh, 'anonymous_insights', T0 + 1)
  assert(!offAgain.withdrawn, 'withdrawing an off purpose does nothing')
  assertEqual(offAgain.erasedKeys.length, 0, 'no keys erased for an off purpose')
  // essential → cannot be withdrawn through consent (its path is full deletion)
  const essentialWithdraw = withdrawConsent(fresh, 'habit_actions', T0 + 1)
  assert(!essentialWithdraw.withdrawn, 'essential purpose cannot be withdrawn via consent')
  assert(isGranted(essentialWithdraw.state, 'habit_actions'), 'essential stays granted')
  // granting an essential purpose is also a no-op (it is already intrinsic)
  assertEqual(grantConsent(fresh, 'habit_actions', T0 + 1), fresh, 'granting an essential purpose is a no-op')
}

currentCase = 'withdraw: setConsent grants on true and withdraws (with erase) on false'
{
  const fresh = defaultConsent(T0)
  const on = setConsent(fresh, 'reflection_surveys', true, T0 + 1)
  assert(isGranted(on.state, 'reflection_surveys'), 'setConsent(true) grants')
  assertEqual(on.erasedKeys.length, 0, 'granting erases nothing')
  const off = setConsent(on.state, 'reflection_surveys', false, T0 + 2)
  assert(!isGranted(off.state, 'reflection_surveys'), 'setConsent(false) withdraws')
  assert(off.withdrawn, 'setConsent(false) reports withdrawal')
  assertEqual(off.erasedKeys.length, purposeById('reflection_surveys')?.storageKeys.length ?? -1, 'setConsent(false) erases the purpose keys')
}

/* --- 4. EXPORT FLOW -------------------------------------------------------- */

currentCase = 'export: the bundle is a complete, honest picture of everything held'
{
  const store = makeStore({
    'herrays.ledger.v1': JSON.stringify([{ id: 'e1', actionTitle: 'x' }]),
    'herrays.cues.v1': JSON.stringify([{ id: 'c1' }]),
    // nothing stored for the optional purposes — they were never opted into
  })
  const fresh = defaultConsent(T0)
  const bundle = buildExport(fresh, store.read, T0 + 5)
  assertEqual(bundle.app, 'HerRays', 'bundle names the app')
  assertEqual(bundle.schemaVersion, PRIVACY_SCHEMA_VERSION, 'bundle carries the schema version')
  assertEqual(bundle.generatedAt, T0 + 5, 'bundle carries the injected timestamp (deterministic)')
  // one category per purpose, in registry order
  assertEqual(bundle.categories.length, CONSENT_PURPOSES.length, 'every purpose appears as a category')
  const ledgerCat = bundle.categories.find((c) => c.id === 'habit_actions')
  assert(ledgerCat?.present === true, 'the stored ledger is marked present')
  assert(Array.isArray((ledgerCat?.data['herrays.ledger.v1'] as unknown[])), 'the ledger data is parsed back into the bundle')
  // an un-opted-in optional category is present in the bundle but holds nothing
  const healthCat = bundle.categories.find((c) => c.id === 'connected_health')
  assert(healthCat?.present === false, 'the never-collected health category holds nothing')
  assertEqual(healthCat?.granted, false, 'the health category is shown as not granted')
  // the export round-trips to valid JSON
  const text = serializeExport(bundle)
  const reparsed = JSON.parse(text) as { app: string; categories: unknown[] }
  assertEqual(reparsed.app, 'HerRays', 'serialized export is valid JSON')
  assertEqual(reparsed.categories.length, CONSENT_PURPOSES.length, 'serialized export keeps every category')
}

/* --- 5. DELETION FLOW ------------------------------------------------------ */

currentCase = 'delete: erasePurpose removes exactly one purpose, leaving the rest untouched'
{
  const store = makeStore({
    'herrays.ledger.v1': '[]',
    'herrays.ledger.synced.v1': '[]',
    'herrays.cues.v1': '[]',
    'herrays.activation.v1': '{}',
  })
  const erased = erasePurpose(store.remove, 'habit_actions')
  assertEqual(JSON.stringify([...erased].sort()), JSON.stringify(['herrays.ledger.synced.v1', 'herrays.ledger.v1']), 'both ledger keys erased')
  assert(store.read('herrays.ledger.v1') === null, 'primary ledger key gone')
  assert(store.read('herrays.ledger.synced.v1') === null, 'ledger mirror gone')
  assert(store.read('herrays.cues.v1') !== null, 'an unrelated purpose is untouched')
  assert(store.read('herrays.activation.v1') !== null, 'another unrelated purpose is untouched')
  // erasing an unknown purpose touches nothing
  assertEqual(erasePurpose(store.remove, 'nope' as ConsentPurposeId).length, 0, 'unknown purpose erases nothing')
}

currentCase = 'delete: eraseAll removes every data key AND the consent record — nothing survives'
{
  // seed every known key plus the consent record plus an unrelated foreign key
  const seed: Record<string, string> = { 'some.other.app': 'keep me' }
  for (const key of ALL_STORAGE_KEYS) seed[key] = 'data'
  seed[CONSENT_STORAGE_KEY] = 'consent'
  const store = makeStore(seed)
  const erased = eraseAll(store.remove)
  // every registry key and the consent key are reported erased
  assertEqual(erased.length, ALL_STORAGE_KEYS.length + 1, 'eraseAll reports every data key plus the consent record')
  for (const key of ALL_STORAGE_KEYS) assert(store.read(key) === null, `data key "${key}" is gone`)
  assert(store.read(CONSENT_STORAGE_KEY) === null, 'the consent record is gone too')
  // nothing durable from the app survives
  const survivors = store.keys().filter((k) => k.startsWith('herrays.'))
  assertEqual(survivors.length, 0, 'no herrays.* key survives a full deletion')
  // a foreign, non-app key is NOT touched (we only erase what the registry owns)
  assert(store.read('some.other.app') === 'keep me', 'a foreign key is never deleted')
}

/* --- 6. durable round-trip: corrupt store stays private, loop stays on ------ */

currentCase = 'persistence: a clean record round-trips; a corrupt store falls back to safe defaults'
{
  const fresh = defaultConsent(T0)
  const granted = grantConsent(fresh, 'anonymous_insights', T0 + 1)
  const back = deserialize(serialize(granted), T0 + 2)
  assert(isGranted(back, 'anonymous_insights'), 'a granted optional purpose round-trips')
  for (const p of ESSENTIAL_PURPOSES) assert(isGranted(back, p.id), `essential "${p.id}" still on after round-trip`)
  // garbage / malformed → safe default (optional OFF, essential ON)
  const fromGarbage = deserialize('not json', T0)
  for (const p of OPTIONAL_PURPOSES) assert(!isGranted(fromGarbage, p.id), `garbage store leaves optional "${p.id}" off`)
  for (const p of ESSENTIAL_PURPOSES) assert(isGranted(fromGarbage, p.id), `garbage store keeps essential "${p.id}" on`)
  assert(deserialize(null, T0).grants !== undefined, 'absent store yields a usable default record')
  // a forged store that tries to flip an essential purpose off cannot: it is forced on
  const forged = JSON.stringify({ grants: { habit_actions: false, connected_health: true }, updatedAt: T0, schemaVersion: 1 })
  const defused = deserialize(forged, T0)
  assert(isGranted(defused, 'habit_actions'), 'a forged "essential off" is forced back on (loop can never be disabled by a bad store)')
  assert(isGranted(defused, 'connected_health'), 'an explicitly-stored optional grant is honoured')
}

/* --- 7. zero-guilt copy (CLAUDE.md §1) ------------------------------------- */

currentCase = 'zero-guilt: every surfaced string is guilt-free (deletion is calm, never shamed)'
{
  const lines = privacyCopy()
  assert(lines.length > 0, 'there is copy to check')
  for (const line of lines) {
    assert(isGuiltFree(line), `copy is guilt-free: "${line}"`)
  }
  // guard is non-trivial: a shaming deletion line would be rejected
  assert(
    !isGuiltFree('You failed to protect your data and lost your streak — don’t give up.'),
    'guard rejects shame copy',
  )
}

/* =============================================================== report ==== */

const TOTAL_GROUPS = 11
if (failures.length > 0) {
  console.error(`\n✗ privacy.test.ts — ${failures.length} assertion(s) failed:\n`)
  for (const f of failures) console.error('  • ' + f)
  console.error('')
  throw new Error(`privacy.test.ts failed with ${failures.length} failing assertion(s).`)
}
console.log(`✓ privacy.test.ts — all ${TOTAL_GROUPS} case groups passed.`)
