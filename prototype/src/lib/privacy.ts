/**
 * TASK-041 — Privacy and consent controls.
 *
 * "Implement consent and data minimization for habit and optional health data."
 *
 * Acceptance criterion (tasks.json TASK-041):
 *   "Consent can be withdrawn; export and deletion flows tested; no optional
 *    health data collected by default."
 *
 *   - Consent can be withdrawn → every OPTIONAL purpose carries a real on/off
 *     grant. `withdrawConsent` flips it back off AND, in the same step, erases the
 *     data that purpose owns (data minimization: when a reason to hold data ends,
 *     the data goes). Withdrawal is total and immediate, never a soft "paused"
 *     flag that keeps the data around.
 *   - Export and deletion flows → `buildExport` assembles a complete, structured,
 *     human- and machine-readable copy of everything the app holds (the raw store
 *     for every known key, plus the live consent record), and `eraseAll` /
 *     `erasePurpose` remove exactly the keys the registry accounts for. Both run
 *     on an injected storage port, so `privacy.test.ts` drives them against an
 *     in-memory store and proves they are complete and lossless.
 *   - No optional health data collected by default → enforced structurally, not by
 *     convention. The purpose registry guarantees (and the test asserts) that (a)
 *     health data is NEVER essential, (b) every optional purpose — health included
 *     — starts not-granted, and therefore (c) a brand-new install collects zero
 *     optional health data until the user explicitly opts in. `mayCollect`
 *     gates collection on exactly this, so nothing is written for a purpose whose
 *     consent has not been granted.
 *
 * Two kinds of data, deliberately separated (CLAUDE.md §3 — this is the honest
 * data map of the prototype, not a vague promise):
 *   - Essential HABIT data powers the daily loop (your completed little wins, the
 *     cues you set, your preferences). It is minimal, non-health, and intrinsic to
 *     using the app — there is no on/off switch because the switch is "use the app
 *     or delete it". It is still fully exportable and deletable.
 *   - OPTIONAL data is opt-in and off until chosen: anonymous insights, reflection
 *     surveys, and — the sensitive one — connected health information. None of it
 *     is collected by default.
 *
 * Zero-Guilt (CLAUDE.md §1): withdrawing consent or deleting data is framed as a
 * calm, reversible, user-owned choice — never a loss, warning or penalty. Every
 * surfaced string clears the shared `isGuiltFree` guard.
 *
 * Framework-agnostic: the pure core imports no React (only the React-free
 * `isGuiltFree` guard with a `.ts` specifier), so the deterministic suite in
 * `privacy.test.ts` runs it directly under Node's TS stripping, exactly like
 * `ledger.ts` / `entitlement.ts` / `activation.ts`. The clock and storage are
 * injected into the pure core; the live store reads them only at the edge.
 */

import { isGuiltFree } from './restart.ts'

export { isGuiltFree }

/** Schema version stamped on the stored consent record (lets a later migration read old rows). */
export const PRIVACY_SCHEMA_VERSION = 1

/* ========================================================= purposes ======== */

/** The reasons the app may hold data. One grant toggle per OPTIONAL purpose. */
export type ConsentPurposeId =
  // essential habit data — intrinsic to the daily loop, non-health, no toggle
  | 'habit_actions'
  | 'habit_cues'
  | 'app_preferences'
  // optional data — opt-in, off by default
  | 'anonymous_insights'
  | 'reflection_surveys'
  | 'connected_health'

/**
 * One purpose for holding data: what it is, whether it is essential to the loop,
 * whether it is health information, what a fresh install starts it at, and the
 * exact durable storage keys it owns (the unit of export and deletion).
 */
export interface ConsentPurpose {
  id: ConsentPurposeId
  title: string
  description: string
  /**
   * Essential purposes power the core daily loop and are non-health by
   * construction. They have no on/off switch (the only way to stop them is to
   * delete the data / stop using the app), but are always exportable and deletable.
   */
  essential: boolean
  /** True if the purpose can hold health information. Health is never essential. */
  containsHealthData: boolean
  /** What a brand-new install starts this purpose at. Every optional purpose is false. */
  defaultGranted: boolean
  /** The durable localStorage keys this purpose owns — the unit of export/erase. */
  storageKeys: readonly string[]
}

/**
 * The purpose registry — the single source of truth for what data exists, why,
 * and where. Every durable store in the prototype is accounted for here, so
 * export and deletion can be provably complete (`privacy.test.ts` asserts the
 * registry's key union equals `ALL_STORAGE_KEYS`).
 */
export const CONSENT_PURPOSES: readonly ConsentPurpose[] = [
  {
    id: 'habit_actions',
    title: 'Your little wins',
    description:
      'The real-world actions you complete, kept on your device so your progress is here when you return.',
    essential: true,
    containsHealthData: false,
    defaultGranted: true,
    storageKeys: ['herrays.ledger.v1', 'herrays.ledger.synced.v1'],
  },
  {
    id: 'habit_cues',
    title: 'Your gentle cues',
    description: 'The times or routines you choose to pair an action with. Reminders are always opt-in.',
    essential: true,
    containsHealthData: false,
    defaultGranted: true,
    storageKeys: ['herrays.cues.v1'],
  },
  {
    id: 'app_preferences',
    title: 'Your preferences',
    description:
      'Small settings that make the app yours — haptics, your plan, and where you are on a gentle challenge.',
    essential: true,
    containsHealthData: false,
    defaultGranted: true,
    storageKeys: ['herrays.haptics.enabled', 'herrays.entitlement.v1', 'herrays.challenge.v1'],
  },
  {
    id: 'anonymous_insights',
    title: 'Anonymous insights',
    description:
      'Four anonymous activation moments, never tied to who you are, that help us learn whether the first days feel easy. Off until you choose it.',
    essential: false,
    containsHealthData: false,
    defaultGranted: false,
    storageKeys: ['herrays.activation.v1'],
  },
  {
    id: 'reflection_surveys',
    title: 'Reflection check-ins',
    description:
      'Optional short self-reflections on how automatic an action feels. Yours to skip, and only saved if you opt in.',
    essential: false,
    containsHealthData: false,
    defaultGranted: false,
    storageKeys: ['herrays.automaticity.v1'],
  },
  {
    id: 'connected_health',
    title: 'Connected health data',
    description:
      'Optional health information you might one day choose to connect. It is never collected by default, and stays off until you turn it on.',
    essential: false,
    containsHealthData: true,
    defaultGranted: false,
    storageKeys: ['herrays.health.v1'],
  },
]

/** The optional purposes — the ones that carry a real consent toggle. */
export const OPTIONAL_PURPOSES: readonly ConsentPurpose[] = CONSENT_PURPOSES.filter((p) => !p.essential)

/** The essential purposes — minimal, non-health, intrinsic to the daily loop. */
export const ESSENTIAL_PURPOSES: readonly ConsentPurpose[] = CONSENT_PURPOSES.filter((p) => p.essential)

/** Every durable storage key the app uses — the complete surface export/erase must cover. */
export const ALL_STORAGE_KEYS: readonly string[] = CONSENT_PURPOSES.flatMap((p) => p.storageKeys)

/** The storage key holding the consent record itself. */
export const CONSENT_STORAGE_KEY = 'herrays.consent.v1'

/** Look up a purpose by id, or null for an unknown id. */
export function purposeById(id: unknown): ConsentPurpose | null {
  return CONSENT_PURPOSES.find((p) => p.id === id) ?? null
}

export function isConsentPurposeId(value: unknown): value is ConsentPurposeId {
  return purposeById(value) !== null
}

/* ========================================================= consent state === */

/** The grant map plus bookkeeping — which purposes the user has agreed to, and when. */
export interface ConsentState {
  grants: Record<ConsentPurposeId, boolean>
  /** When the record was last changed, ms since epoch. */
  updatedAt: number
  schemaVersion: number
}

/** Build the grant map from each purpose's default (essential on, every optional off). */
function defaultGrants(): Record<ConsentPurposeId, boolean> {
  const grants = {} as Record<ConsentPurposeId, boolean>
  for (const purpose of CONSENT_PURPOSES) grants[purpose.id] = purpose.defaultGranted
  return grants
}

/**
 * The consent a brand-new install starts with: essential habit data on (the app
 * works out of the box), every optional purpose — anonymous insights, reflection
 * surveys and all health data — OFF. This is the executable form of "no optional
 * health data collected by default".
 */
export function defaultConsent(now: number): ConsentState {
  return { grants: defaultGrants(), updatedAt: now, schemaVersion: PRIVACY_SCHEMA_VERSION }
}

/** Whether a purpose's consent is currently granted. Unknown ids read as not granted. */
export function isGranted(state: ConsentState, id: ConsentPurposeId): boolean {
  return state.grants[id] === true
}

/**
 * Whether the app may collect data for a purpose right now:
 *   - an essential purpose is always collectible (it is the daily loop), while
 *   - an optional purpose is collectible ONLY when its consent is granted.
 * Nothing should be persisted for a purpose this returns false for.
 */
export function mayCollect(state: ConsentState, id: ConsentPurposeId): boolean {
  const purpose = purposeById(id)
  if (purpose === null) return false
  if (purpose.essential) return true
  return isGranted(state, id)
}

/** Grant consent for an optional purpose (idempotent). Essential purposes are already on. */
export function grantConsent(state: ConsentState, id: ConsentPurposeId, now: number): ConsentState {
  const purpose = purposeById(id)
  if (purpose === null || purpose.essential) return state
  if (isGranted(state, id)) return state
  return { ...state, grants: { ...state.grants, [id]: true }, updatedAt: now }
}

/** The result of withdrawing consent: the new state and the keys erased as part of it. */
export interface WithdrawResult {
  state: ConsentState
  /** The storage keys that were (or must be) erased because the purpose was withdrawn. */
  erasedKeys: readonly string[]
  /** True if withdrawal was applied; false if the purpose is essential / unknown / already off. */
  withdrawn: boolean
}

/**
 * Withdraw consent for an OPTIONAL purpose. The grant flips off and the purpose's
 * storage keys come back as `erasedKeys` so the caller erases them in the same
 * step — withdrawing a reason to hold data erases that data (data minimization).
 * Essential purposes cannot be withdrawn this way (their path is full deletion);
 * this returns `withdrawn: false` and changes nothing.
 */
export function withdrawConsent(state: ConsentState, id: ConsentPurposeId, now: number): WithdrawResult {
  const purpose = purposeById(id)
  if (purpose === null || purpose.essential || !isGranted(state, id)) {
    return { state, erasedKeys: [], withdrawn: false }
  }
  return {
    state: { ...state, grants: { ...state.grants, [id]: false }, updatedAt: now },
    erasedKeys: purpose.storageKeys,
    withdrawn: true,
  }
}

/** Set an optional purpose's consent to an explicit value (grant / withdraw in one call). */
export function setConsent(
  state: ConsentState,
  id: ConsentPurposeId,
  granted: boolean,
  now: number,
): WithdrawResult {
  if (granted) return { state: grantConsent(state, id, now), erasedKeys: [], withdrawn: false }
  return withdrawConsent(state, id, now)
}

/* --------------------------------------------- default-collection guarantees -- */

/**
 * Whether a fresh install would collect ANY optional health data by default.
 * Computed straight from the registry defaults, this is the single predicate the
 * acceptance criterion turns on — the test asserts it is false.
 */
export function collectsOptionalHealthByDefault(): boolean {
  const fresh = defaultConsent(0)
  return CONSENT_PURPOSES.some((p) => p.containsHealthData && !p.essential && isGranted(fresh, p.id))
}

/** The purposes currently being collected under a consent state (for the "what we hold" view). */
export function collectedPurposes(state: ConsentState): readonly ConsentPurpose[] {
  return CONSENT_PURPOSES.filter((p) => mayCollect(state, p.id))
}

/** True if any health-bearing purpose is currently granted (i.e. health collection is on). */
export function isCollectingHealthData(state: ConsentState): boolean {
  return CONSENT_PURPOSES.some((p) => p.containsHealthData && mayCollect(state, p.id))
}

/* ========================================================= export flow ===== */

/** One category in an export bundle: the purpose, whether data was present, and the data. */
export interface ExportCategory {
  id: ConsentPurposeId
  title: string
  essential: boolean
  containsHealthData: boolean
  granted: boolean
  /** True if any of the purpose's keys held stored data at export time. */
  present: boolean
  /** The parsed stored data per key (null where a key was empty). */
  data: Record<string, unknown>
}

/** A complete, portable copy of everything the app holds for a user. */
export interface DataExport {
  app: 'HerRays'
  schemaVersion: number
  generatedAt: number
  consent: ConsentState
  categories: readonly ExportCategory[]
  note: string
}

/** Reads a raw stored value for a key (the injected storage port). */
export type StorageReader = (key: string) => string | null

/** Removes a stored value for a key (the injected storage port). */
export type StorageRemover = (key: string) => void

/** Parse a stored JSON string, falling back to the raw string (then null) if it is not JSON. */
function parseStored(raw: string | null): unknown {
  if (raw === null) return null
  try {
    return JSON.parse(raw)
  } catch {
    return raw
  }
}

/**
 * Assemble a complete export of everything the app holds, reading each registry
 * key through `read`. Pure: the clock and storage are injected, so the bundle is
 * fully deterministic and testable. Empty categories are still listed (with
 * `present: false`) so the export is an honest, total picture — including the fact
 * that an un-opted-in category holds nothing.
 */
export function buildExport(state: ConsentState, read: StorageReader, now: number): DataExport {
  const categories = CONSENT_PURPOSES.map((purpose): ExportCategory => {
    const data: Record<string, unknown> = {}
    let present = false
    for (const key of purpose.storageKeys) {
      const value = parseStored(read(key))
      data[key] = value
      if (value !== null) present = true
    }
    return {
      id: purpose.id,
      title: purpose.title,
      essential: purpose.essential,
      containsHealthData: purpose.containsHealthData,
      granted: isGranted(state, purpose.id),
      present,
      data,
    }
  })
  return {
    app: 'HerRays',
    schemaVersion: PRIVACY_SCHEMA_VERSION,
    generatedAt: now,
    consent: state,
    categories,
    note: 'This is a complete copy of everything HerRays holds for you. It lives on your device and is yours to keep.',
  }
}

/** Serialize an export bundle to pretty JSON for download. */
export function serializeExport(bundle: DataExport): string {
  return JSON.stringify(bundle, null, 2)
}

/* ========================================================= deletion flow === */

/** Erase a set of keys through `remove`, returning exactly the keys erased. */
function eraseKeys(remove: StorageRemover, keys: readonly string[]): readonly string[] {
  for (const key of keys) remove(key)
  return keys
}

/**
 * Erase everything a single purpose owns (used when consent is withdrawn, or to
 * delete one category). Returns the keys erased, or `[]` for an unknown id.
 */
export function erasePurpose(remove: StorageRemover, id: ConsentPurposeId): readonly string[] {
  const purpose = purposeById(id)
  if (purpose === null) return []
  return eraseKeys(remove, purpose.storageKeys)
}

/**
 * Erase ALL of the user's data — every registry key plus the consent record
 * itself. Returns every key erased, so a test can assert the deletion is total
 * and the live store can confirm nothing durable survives.
 */
export function eraseAll(remove: StorageRemover): readonly string[] {
  const erased = eraseKeys(remove, [...ALL_STORAGE_KEYS, CONSENT_STORAGE_KEY])
  return erased
}

/* ========================================================= durable I/O ===== */

/** Sanitize a raw grant map: only known purpose ids, only booleans, defaults fill the rest. */
function sanitizeGrants(raw: unknown): Record<ConsentPurposeId, boolean> {
  const grants = defaultGrants()
  if (typeof raw !== 'object' || raw === null) return grants
  const record = raw as Record<string, unknown>
  for (const purpose of CONSENT_PURPOSES) {
    const value = record[purpose.id]
    if (typeof value === 'boolean') grants[purpose.id] = value
  }
  // An essential purpose is always on — a corrupted store can never turn the loop off,
  // and an optional purpose absent from the store stays at its (off) default.
  for (const purpose of ESSENTIAL_PURPOSES) grants[purpose.id] = true
  return grants
}

/** Serialize the consent record for durable storage. */
export function serialize(state: ConsentState): string {
  return JSON.stringify(state)
}

/**
 * Parse a durably-stored consent record. Anything malformed falls back to the
 * privacy-preserving default (optional purposes off), and essential purposes are
 * always forced on, so a corrupted store can neither silently enable optional
 * collection nor disable the core loop.
 */
export function deserialize(raw: string | null, now: number): ConsentState {
  if (!raw) return defaultConsent(now)
  try {
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return defaultConsent(now)
    const record = parsed as Record<string, unknown>
    return {
      grants: sanitizeGrants(record.grants),
      updatedAt: typeof record.updatedAt === 'number' ? record.updatedAt : now,
      schemaVersion: typeof record.schemaVersion === 'number' ? record.schemaVersion : PRIVACY_SCHEMA_VERSION,
    }
  } catch {
    return defaultConsent(now)
  }
}

/* ============================================================== copy ======== */

/** Warm, guilt-free one-liners for the two headline guarantees. */
export const PRIVACY_PROMISES: readonly string[] = [
  'Nothing optional is on until you choose it — health data included.',
  'Your data lives on your device, and leaving with all of it is one tap away.',
  'Turning something off also erases what it collected. Off means gone.',
  'Deleting is calm and complete — no alarms, and nothing is kept once it is gone.',
]

/** Every user-facing string the privacy surface can show — the exact set the guilt guard scans. */
export function privacyCopy(): readonly string[] {
  const lines: string[] = [...PRIVACY_PROMISES]
  for (const purpose of CONSENT_PURPOSES) lines.push(purpose.title, purpose.description)
  lines.push(
    'Export a copy of everything',
    'Turn this on',
    'Turn this off',
    'Delete all of my data',
    'Essential to your daily loop',
    'Optional · off by default',
  )
  return lines
}

/* ============================================================ live store ==== */
/* A singleton, localStorage-backed consent record with a subscribe/broadcast
 * fan-out — the same shape as lib/entitlement.ts / lib/activation.ts. The pure
 * core above holds the decisions; this edge layer binds them to real storage and
 * the real clock, and wires export / deletion to the actual durable data. */

function nowMs(): number {
  return Date.now()
}

function readLocal(key: string): string | null {
  if (typeof localStorage === 'undefined') return null
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function removeLocal(key: string): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.removeItem(key)
  } catch {
    /* no-op: an unremovable key still leaves a consistent in-memory view */
  }
}

function readConsentStore(): ConsentState {
  return deserialize(readLocal(CONSENT_STORAGE_KEY), nowMs())
}

let consent: ConsentState = readConsentStore()
const listeners = new Set<(state: ConsentState) => void>()

function persist(): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, serialize(consent))
  } catch {
    /* no-op: an unpersistable store still works for the session */
  }
}

function emit(): void {
  persist()
  for (const listener of listeners) listener(consent)
}

/** The current consent record (immutable snapshot). */
export function getConsent(): ConsentState {
  return consent
}

export function subscribeConsent(listener: (state: ConsentState) => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** Grant an optional purpose's consent and broadcast. */
export function grantConsentLive(id: ConsentPurposeId): void {
  const next = grantConsent(consent, id, nowMs())
  if (next === consent) return
  consent = next
  emit()
}

/**
 * Withdraw an optional purpose's consent and, in the same step, erase the data it
 * collected (data minimization). Returns the keys erased for the caller to report.
 */
export function withdrawConsentLive(id: ConsentPurposeId): readonly string[] {
  const result = withdrawConsent(consent, id, nowMs())
  if (!result.withdrawn) return []
  consent = result.state
  eraseKeys(removeLocal, result.erasedKeys)
  resetInMemory(result.erasedKeys)
  emit()
  return result.erasedKeys
}

/** Toggle an optional purpose to an explicit value (grant / withdraw), erasing on withdrawal. */
export function setConsentLive(id: ConsentPurposeId, granted: boolean): readonly string[] {
  if (granted) {
    grantConsentLive(id)
    return []
  }
  return withdrawConsentLive(id)
}

/** Build a full export of the live, on-device data. */
export function exportAllData(): DataExport {
  return buildExport(consent, readLocal, nowMs())
}

/**
 * Delete ALL of the user's data: every durable key and the consent record, then
 * reset the in-memory singletons of the other stores so no live view can re-persist
 * deleted data, and finally restore the privacy-preserving default consent. Returns
 * the keys erased so the surface can confirm the deletion was total.
 */
export function deleteAllData(): readonly string[] {
  const erased = eraseAll(removeLocal)
  resetInMemory(ALL_STORAGE_KEYS)
  consent = defaultConsent(nowMs())
  emit()
  return erased
}

/**
 * Reset the live in-memory singletons whose keys were just erased, so a later
 * broadcast from those stores cannot rewrite deleted data within the session.
 * Imported lazily inside the functions below to keep the pure core React- and
 * dependency-free for the Node test.
 */
function resetInMemory(keys: readonly string[]): void {
  const touched = new Set(keys)
  const touches = (k: string): boolean => touched.has(k)
  // Each reset is best-effort and independent; a missing store never blocks the rest.
  if (touches('herrays.ledger.v1') || touches('herrays.ledger.synced.v1')) {
    void import('./ledger.ts').then((m) => m.clearLedger()).catch(() => {})
  }
  if (touches('herrays.activation.v1')) {
    void import('./activation.ts').then((m) => m.resetActivation()).catch(() => {})
  }
  if (touches('herrays.automaticity.v1')) {
    void import('./automaticitySurvey.ts').then((m) => m.clearResponses()).catch(() => {})
  }
  if (touches('herrays.entitlement.v1')) {
    void import('./entitlement.ts').then((m) => m.clearEntitlement()).catch(() => {})
  }
}
