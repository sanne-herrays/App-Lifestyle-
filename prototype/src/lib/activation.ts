/**
 * TASK-033 — Instrument activation events.
 *
 * "Define and emit events for onboarding, first action and first reward."
 *
 * Acceptance criterion (tasks.json TASK-033):
 *   "Event schema documented; each event has anonymous user key, timestamp and
 *    schema version; no raw health details."
 *
 *   - Event schema documented → the `ActivationEvent` shape is specified both in
 *     the prose table below and as a machine-readable `ACTIVATION_EVENT_SCHEMA`
 *     (one row per field: type, required, pii flag, description). The test asserts
 *     the documented schema matches the emitted events field-for-field, so the
 *     documentation cannot silently drift from the code.
 *   - Anonymous user key → every event carries a `userKey` minted by `newUserKey()`:
 *     a random, non-identifying install key (never an account id, email, name or
 *     device id). `isAnonymousKey` rejects anything that looks like identity.
 *   - Timestamp → every event carries `occurredAt`, device-clock ms since epoch,
 *     stamped the first time the milestone is reached.
 *   - Schema version → every event carries `schemaVersion` (ACTIVATION_SCHEMA_VERSION),
 *     so a later migration can read older rows.
 *   - No raw health details → this is enforced structurally, not by convention.
 *     An activation event may only carry the five allow-listed fields, every value
 *     is a single token or a number, and the only descriptive field is a *coarse*
 *     `goalCategory` enum bucket (move/calm/water/outside) — never the action text,
 *     effort, reward copy, duration, contraindication or any free-text health
 *     content. `carriesRawHealthDetail` rejects any unknown field or any
 *     whitespace-bearing (i.e. human-readable) value, so a leaked action title
 *     such as "Two minutes of easy movement" can never be recorded.
 *
 * Activation milestones (PRD §6 moments / §7 "first real action within 24h" metric):
 *
 *   | eventType                | moment (PRD §6)            | emitted                     |
 *   |--------------------------|----------------------------|-----------------------------|
 *   | onboarding_started       | onboarding "I can do this" | first time onboarding opens |
 *   | onboarding_completed     | onboarding "I can do this" | onboarding finished once    |
 *   | first_action_completed   | first action "That was easy"| first real ledger completion|
 *   | first_reward_shown       | completion "That felt good"| reward surfaced that 1st time|
 *
 * Each milestone is a *first* — recorded at most once per anonymous user. Repeating
 * a completion never emits a second `first_action_completed`; the funnel measures
 * activation, not volume (that is the TASK-026 ledger's job).
 *
 * Framework-agnostic: imports no React (only the React-free `isGuiltFree` guard
 * with a `.ts` specifier and a type-only `GoalId`), so the deterministic suite in
 * `activation.test.ts` runs it directly under Node's TS stripping, exactly like
 * `ledger.ts` / `restart.ts` / `progressViz.ts`. The one React hook the UI needs
 * lives in the component.
 */

import type { GoalId } from '../flows/flowData'
import { isGuiltFree } from './restart.ts'

export { isGuiltFree }

/** Schema version stamped on every activation event (lets a later migration read old rows). */
export const ACTIVATION_SCHEMA_VERSION = 1

/** The four activation milestones, in canonical funnel order. */
export type ActivationEventType =
  | 'onboarding_started'
  | 'onboarding_completed'
  | 'first_action_completed'
  | 'first_reward_shown'

/** Canonical ordered funnel — the order milestones are expected to be reached in. */
export const ACTIVATION_FUNNEL: readonly ActivationEventType[] = [
  'onboarding_started',
  'onboarding_completed',
  'first_action_completed',
  'first_reward_shown',
]

/**
 * A coarse, non-identifying category bucket. This is the ONLY descriptive field an
 * event may carry, and it is deliberately a closed enum — never free text, never
 * the action title, effort, reward, duration or any raw health detail.
 */
export type GoalCategory = GoalId

/** A single activation milestone event. No PII and no raw health detail by construction. */
export interface ActivationEvent {
  /** Anonymous, random install key — not an account id, email, name or device id. */
  userKey: string
  eventType: ActivationEventType
  /** Device clock when the milestone was first reached, ms since epoch. */
  occurredAt: number
  /** Schema version stamped on every event. */
  schemaVersion: number
  /** Optional coarse goal bucket. Never the action text or any free-text health content. */
  goalCategory?: GoalCategory
}

/** The exact set of keys an activation event may carry — the privacy allow-list. */
export const ALLOWED_EVENT_KEYS: readonly (keyof ActivationEvent)[] = [
  'userKey',
  'eventType',
  'occurredAt',
  'schemaVersion',
  'goalCategory',
]

/* ------------------------------------------------------- documented schema -- */

/** One documented field of `ActivationEvent`. */
export interface SchemaField {
  field: keyof ActivationEvent
  type: string
  required: boolean
  /** Always false — the schema is designed to carry no personal or health data. */
  pii: boolean
  description: string
}

/**
 * Machine-readable schema documentation. Kept in lockstep with `ActivationEvent`
 * by `activation.test.ts`, which asserts it documents exactly the event's keys and
 * flags none as PII — so "event schema documented" is a verifiable artifact, not a
 * comment that can rot.
 */
export const ACTIVATION_EVENT_SCHEMA: readonly SchemaField[] = [
  {
    field: 'userKey',
    type: 'string',
    required: true,
    pii: false,
    description:
      'Anonymous, random install key. Never an account id, email, name, phone or device id.',
  },
  {
    field: 'eventType',
    type: 'ActivationEventType (enum)',
    required: true,
    pii: false,
    description:
      'One of the four activation milestones: onboarding_started, onboarding_completed, first_action_completed, first_reward_shown.',
  },
  {
    field: 'occurredAt',
    type: 'number (ms since epoch)',
    required: true,
    pii: false,
    description: 'Device clock when the milestone was first reached.',
  },
  {
    field: 'schemaVersion',
    type: 'number',
    required: true,
    pii: false,
    description: 'Schema version stamped on every event so a later migration can read old rows.',
  },
  {
    field: 'goalCategory',
    type: 'GoalCategory (enum: move | calm | water | outside)',
    required: false,
    pii: false,
    description:
      'Coarse, non-identifying bucket only. Never the action text, effort, reward copy, duration, contraindication or any free-text health detail.',
  },
]

/* ------------------------------------------------------- anonymous user key -- */

/**
 * Mint a fresh anonymous install key. Random and non-identifying: `crypto.randomUUID`
 * where available, else a collision-resistant fallback. Prefixed `anon-` so it reads
 * unmistakably as an anonymous key, never an account identifier.
 */
export function newUserKey(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return `anon-${crypto.randomUUID()}`
    }
  } catch {
    /* fall through to the manual key */
  }
  return `anon-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e9).toString(36)}`
}

/**
 * True only for a value that is a plausible anonymous key and carries no identity
 * markers. Rejects emails, whitespace (a human-readable value) and the empty string.
 * Used to guarantee the `userKey` we store is never an account handle.
 */
export function isAnonymousKey(value: unknown): value is string {
  if (typeof value !== 'string' || value.length === 0) return false
  if (/\s/.test(value)) return false // a single token, never a phrase
  if (value.includes('@')) return false // not an email / handle
  return true
}

/* ------------------------------------------------------------ type guards --- */

export function isActivationEventType(value: unknown): value is ActivationEventType {
  return (
    value === 'onboarding_started' ||
    value === 'onboarding_completed' ||
    value === 'first_action_completed' ||
    value === 'first_reward_shown'
  )
}

export function isGoalCategory(value: unknown): value is GoalCategory {
  return value === 'move' || value === 'calm' || value === 'water' || value === 'outside'
}

/* --------------------------------------------------- the no-health guarantee -- */

/**
 * The privacy guarantee behind "no raw health details", enforced structurally.
 *
 * A value carries a raw health detail if it is anything other than an allow-listed
 * field holding a single-token string or a number. Concretely it returns `true` when:
 *   - the value is not a plain object, OR
 *   - it has any key outside `ALLOWED_EVENT_KEYS` (an unknown field could smuggle
 *     an action title, note, free-text goal, measurement, etc.), OR
 *   - any string value contains whitespace (i.e. is a human-readable phrase — the
 *     shape every real action title / reward line / health sentence takes), OR
 *   - any value is neither a string token nor a number.
 *
 * Because every legitimate activation value is a closed-enum token, an anonymous
 * key or a number, this makes it structurally impossible to record a sentence like
 * "Two minutes of easy movement" or "Drink a glass of water".
 */
export function carriesRawHealthDetail(raw: unknown): boolean {
  if (typeof raw !== 'object' || raw === null) return true
  const record = raw as Record<string, unknown>
  for (const key of Object.keys(record)) {
    if (!(ALLOWED_EVENT_KEYS as readonly string[]).includes(key)) return true
    const value = record[key]
    if (typeof value === 'string') {
      if (/\s/.test(value)) return true // a phrase, not a token
    } else if (typeof value !== 'number') {
      return true // only tokens and numbers belong in an event
    }
  }
  return false
}

/**
 * A fully-valid, clean activation event: the required fields are present and well
 * typed, `goalCategory` (if present) is a known bucket, and it carries no raw health
 * detail. The stricter sibling of `carriesRawHealthDetail` used by deserialization.
 */
export function isPlainActivationEvent(raw: unknown): raw is ActivationEvent {
  if (carriesRawHealthDetail(raw)) return false
  const record = raw as Record<string, unknown>
  if (!isAnonymousKey(record.userKey)) return false
  if (!isActivationEventType(record.eventType)) return false
  if (typeof record.occurredAt !== 'number' || !Number.isFinite(record.occurredAt)) return false
  if (typeof record.schemaVersion !== 'number') return false
  if (record.goalCategory !== undefined && !isGoalCategory(record.goalCategory)) return false
  return true
}

/* ============================================================ pure core ===== */
/* Side-effect-free (the clock is injected), so the funnel and one-time semantics
 * are verified deterministically. */

/** The accumulated activation record for one anonymous user. */
export interface ActivationState {
  userKey: string
  events: readonly ActivationEvent[]
}

/** A fresh, empty activation record for the given anonymous user key. */
export function emptyActivation(userKey: string): ActivationState {
  return { userKey, events: [] }
}

/**
 * Record a milestone, at most once. If this `type` was already reached, the state is
 * returned unchanged with `added: false` and the existing event — so a repeated
 * completion never mints a second `first_action_completed`. Otherwise a new event is
 * appended, stamped with the user key, the given time, the schema version and (only
 * if supplied) a coarse `goalCategory`. Pure: the clock is injected by the caller.
 */
export function recordMilestone(
  state: ActivationState,
  type: ActivationEventType,
  occurredAt: number,
  goalCategory?: GoalCategory,
): { state: ActivationState; event: ActivationEvent; added: boolean } {
  const existing = state.events.find((e) => e.eventType === type)
  if (existing) {
    return { state, event: existing, added: false }
  }
  const event: ActivationEvent = {
    userKey: state.userKey,
    eventType: type,
    occurredAt,
    schemaVersion: ACTIVATION_SCHEMA_VERSION,
    ...(goalCategory ? { goalCategory } : {}),
  }
  return { state: { ...state, events: [...state.events, event] }, event, added: true }
}

/** Whether a milestone has been reached. */
export function hasReached(state: ActivationState, type: ActivationEventType): boolean {
  return state.events.some((e) => e.eventType === type)
}

/** The furthest milestone reached in canonical funnel order, or `null` if none. */
export function activationStage(state: ActivationState): ActivationEventType | null {
  let furthest: ActivationEventType | null = null
  for (const type of ACTIVATION_FUNNEL) {
    if (hasReached(state, type)) furthest = type
  }
  return furthest
}

/** One row of the ordered funnel view for the UI. */
export interface FunnelRow {
  eventType: ActivationEventType
  label: string
  reached: boolean
  /** When the milestone was reached, ms since epoch; null if not yet reached. */
  occurredAt: number | null
}

/** The ordered funnel for display: every milestone, whether reached, and when. */
export function funnelView(state: ActivationState): readonly FunnelRow[] {
  return ACTIVATION_FUNNEL.map((type) => {
    const event = state.events.find((e) => e.eventType === type)
    return {
      eventType: type,
      label: EVENT_LABEL[type],
      reached: event !== undefined,
      occurredAt: event ? event.occurredAt : null,
    }
  })
}

/* ---------------------------------------------- derive activation from ledger -- */

/**
 * Given the real completion ledger (TASK-026), emit the activation milestones a
 * first completion implies — `first_action_completed` and, because the card shows
 * the reward on that same completion, `first_reward_shown` — both at the *earliest*
 * completion's time and coarse goal bucket. Both are one-time via `recordMilestone`,
 * so later completions change nothing. Returns the updated state and whether anything
 * was added. Carries only the coarse `goalCategory`; the action title never crosses
 * this boundary.
 */
export function deriveFromLedger(
  state: ActivationState,
  ledger: readonly { completedAt: number; goalId: GoalId }[],
): { state: ActivationState; added: boolean } {
  if (ledger.length === 0) return { state, added: false }
  const earliest = ledger.reduce((a, b) => (b.completedAt < a.completedAt ? b : a))
  let next = state
  let added = false
  const action = recordMilestone(next, 'first_action_completed', earliest.completedAt, earliest.goalId)
  next = action.state
  added = added || action.added
  const reward = recordMilestone(next, 'first_reward_shown', earliest.completedAt, earliest.goalId)
  next = reward.state
  added = added || reward.added
  return { state: next, added }
}

/* ------------------------------------------------------------------ copy ---- */

/** Warm, guilt-free display labels for each milestone (UI only — never stored in an event). */
export const EVENT_LABEL: Record<ActivationEventType, string> = {
  onboarding_started: 'Said hello',
  onboarding_completed: 'Ready to begin',
  first_action_completed: 'First little win',
  first_reward_shown: 'First moment of delight',
}

/** Short, plain, guilt-free description of each milestone for the surface. */
export const EVENT_DESCRIPTION: Record<ActivationEventType, string> = {
  onboarding_started: 'Someone opened the welcome for the first time.',
  onboarding_completed: 'They finished setting up and are ready for day one.',
  first_action_completed: 'They finished their very first real-world little win.',
  first_reward_shown: 'We celebrated that first win with them.',
}

/** Every piece of copy the activation surface can show, for the guilt-free scan. */
export function activationCopy(): readonly string[] {
  const lines: string[] = []
  for (const type of ACTIVATION_FUNNEL) {
    lines.push(EVENT_LABEL[type], EVENT_DESCRIPTION[type])
  }
  lines.push(
    'These are the only four moments we measure — all anonymous, none tied to who you are.',
    'No health details ever leave the device inside an activation event.',
    'Showing up once is the whole milestone.',
  )
  return lines
}

/* ------------------------------------------------- durable serialization ---- */

/** Serialize an activation state for durable storage. */
export function serialize(state: ActivationState): string {
  return JSON.stringify(state)
}

/**
 * Parse durably-stored activation data. Anything malformed — or any event that
 * fails the clean-event guard — is dropped rather than trusted, and each milestone
 * type is kept at most once (the earliest), so a reload can never duplicate a
 * milestone or resurrect a leaked field.
 */
export function deserialize(raw: string | null): ActivationState | null {
  if (!raw) return null
  try {
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return null
    const record = parsed as Record<string, unknown>
    if (!isAnonymousKey(record.userKey)) return null
    const rawEvents = Array.isArray(record.events) ? record.events : []
    const seen = new Set<ActivationEventType>()
    const events: ActivationEvent[] = []
    for (const item of rawEvents) {
      if (!isPlainActivationEvent(item)) continue
      if (item.userKey !== record.userKey) continue // event must belong to this user
      if (seen.has(item.eventType)) continue // one-time milestone
      seen.add(item.eventType)
      events.push(item)
    }
    return { userKey: record.userKey, events }
  } catch {
    return null
  }
}

/* ============================================================ live store ==== */
/* A singleton, localStorage-backed store with a subscribe/broadcast fan-out — the
 * same shape as lib/ledger.ts and lib/cues.ts. Built on the pure core above, so it
 * inherits the tested one-time and no-health-detail guarantees. */

const STORAGE_KEY = 'herrays.activation.v1'

function readStore(): ActivationState {
  if (typeof localStorage === 'undefined') return emptyActivation(newUserKey())
  try {
    const stored = deserialize(localStorage.getItem(STORAGE_KEY))
    if (stored) return stored
  } catch {
    /* fall through to a fresh anonymous record */
  }
  return emptyActivation(newUserKey())
}

let state: ActivationState = readStore()
const listeners = new Set<(state: ActivationState) => void>()

function persist(): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, serialize(state))
  } catch {
    /* no-op: an unpersistable store still works for the session */
  }
}

function emit(): void {
  persist()
  for (const listener of listeners) listener(state)
}

/** The current activation record (immutable snapshot). */
export function getActivation(): ActivationState {
  return state
}

export function subscribeActivation(listener: (state: ActivationState) => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/**
 * Emit a milestone to the live store (idempotent per milestone type). Returns whether
 * a new event was recorded. The clock is read here, at the edge — the pure core stays
 * deterministic.
 */
export function emitMilestone(type: ActivationEventType, goalCategory?: GoalCategory): boolean {
  const result = recordMilestone(state, type, Date.now(), goalCategory)
  if (result.added) {
    state = result.state
    emit()
  }
  return result.added
}

/** Fold the real ledger into the activation funnel (emits first action / reward once). */
export function syncActivationFromLedger(
  ledger: readonly { completedAt: number; goalId: GoalId }[],
): boolean {
  const result = deriveFromLedger(state, ledger)
  if (result.added) {
    state = result.state
    emit()
  }
  return result.added
}

/**
 * Reset the activation record and rotate to a *new* anonymous key — the honest shape
 * of "forget me": the prior anonymous key is discarded, not reused. Used by the
 * demo's reset control.
 */
export function resetActivation(): void {
  state = emptyActivation(newUserKey())
  emit()
}
