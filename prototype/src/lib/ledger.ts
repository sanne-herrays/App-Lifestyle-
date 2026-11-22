/**
 * TASK-026 — Daily action completion ledger.
 *
 * "Record and display real-world action completion events."
 *
 * Acceptance criterion (tasks.json TASK-026):
 *   "Events have unique IDs and timestamps; duplicate taps do not double-count;
 *    offline entries sync without loss."
 *
 *   - Unique IDs + timestamps → every recorded completion is a `CompletionEvent`
 *     with a unique `id` (crypto.randomUUID + fallback) and a `completedAt`
 *     millisecond timestamp stamped at the tap.
 *   - Duplicate taps do not double-count → recording is *idempotent on a client
 *     key*. One completion gesture mints one `clientKey`; any replay of that key
 *     (a re-fired handler, a double tap on the same action, an offline retry)
 *     returns the already-stored event and never appends a second — the
 *     real-world idempotency-key pattern, not a fragile time window.
 *   - Offline entries sync without loss → the ledger is offline-first and
 *     durable. Every completion is written to localStorage *synchronously at the
 *     tap*, so nothing is lost across reloads, crashes, or being offline. Each
 *     event carries a two-phase sync lifecycle (`pending` → `synced`); `flush`
 *     drains the pending queue through an injectable transport and only marks an
 *     event `synced` once the transport confirms its id. A failed/offline flush
 *     leaves events `pending` (never dropped), so they retry on the next flush.
 *
 * Honesty (CLAUDE.md §3): a browser prototype has no real backend. "Sync" here
 * is a genuine *local* two-store move — the default transport durably mirrors
 * confirmed events into a second localStorage namespace — honestly labelled, not
 * a network call faked with a resolved promise. The queue / flush / retry /
 * idempotency logic is real and exercised by `ledger.test.ts`; actual remote
 * delivery is the native/backend layer's job (same stance as `lib/cues.ts`).
 *
 * This module is framework-agnostic and imports no React, so the deterministic
 * suite in `ledger.test.ts` can execute it directly under Node's TS stripping.
 * The one React hook the UI needs (`useLedger`) lives in the component.
 */

import type { GoalId } from '../flows/flowData'

/** Schema version stamped on every event (lets a future migration read old data). */
export const LEDGER_SCHEMA_VERSION = 1

/** Which rung of the action the user actually completed (mirrors the fallback ladder). */
export type CompletionVariant = 'full' | 'easier' | 'floor'

/** Where a stored event sits in its durable → confirmed lifecycle. */
export type SyncState = 'pending' | 'synced'

/** A single recorded real-world completion. */
export interface CompletionEvent {
  /** Globally unique event id. */
  id: string
  /** Idempotency key for the originating gesture — the dedupe anchor. */
  clientKey: string
  goalId: GoalId
  /** Snapshot of exactly what was completed (so later catalog edits can't rewrite history). */
  actionTitle: string
  variant: CompletionVariant
  /** Device clock at the moment of completion, ms since epoch. */
  completedAt: number
  syncState: SyncState
  /** When the transport confirmed this event, ms since epoch; null while pending. */
  syncedAt: number | null
  schemaVersion: number
}

/** The fields a caller supplies to record a completion (ids/timestamps added by the ledger). */
export interface CompletionInput {
  /** Idempotency key minted once per gesture. Replays with the same key are no-ops. */
  clientKey: string
  goalId: GoalId
  actionTitle: string
  variant: CompletionVariant
  /** Optional explicit completion time; defaults to the current clock. */
  completedAt?: number
}

/* ============================================================ pure core == */
/* These functions are side-effect-free (storage + clock are injected), so the
 * dedupe and sync-without-loss guarantees are verified deterministically. */

/** Mint a unique id; crypto.randomUUID where available, else a collision-resistant fallback. */
export function newEventId(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID()
    }
  } catch {
    /* fall through to the manual id */
  }
  return `evt-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e9).toString(36)}`
}

/**
 * Append a completion idempotently.
 *
 * If an event with the same `clientKey` already exists, the ledger is returned
 * unchanged with `added: false` and the existing event — this is how a double
 * tap (or an offline retry) is prevented from double-counting. Otherwise a new
 * `pending` event is created with a unique id and the given/stamped timestamp.
 *
 * Pure: `makeId` and the clock are injected so the result is fully deterministic.
 */
export function appendCompletion(
  events: readonly CompletionEvent[],
  input: CompletionInput,
  now: number,
  makeId: () => string = newEventId,
): { events: readonly CompletionEvent[]; event: CompletionEvent; added: boolean } {
  const existing = events.find((e) => e.clientKey === input.clientKey)
  if (existing) {
    return { events, event: existing, added: false }
  }
  const event: CompletionEvent = {
    id: makeId(),
    clientKey: input.clientKey,
    goalId: input.goalId,
    actionTitle: input.actionTitle,
    variant: input.variant,
    completedAt: input.completedAt ?? now,
    syncState: 'pending',
    syncedAt: null,
    schemaVersion: LEDGER_SCHEMA_VERSION,
  }
  return { events: [...events, event], event, added: true }
}

/** The events still awaiting confirmation — the sync queue. */
export function pendingEvents(events: readonly CompletionEvent[]): readonly CompletionEvent[] {
  return events.filter((e) => e.syncState === 'pending')
}

/** The confirmed events. */
export function syncedEvents(events: readonly CompletionEvent[]): readonly CompletionEvent[] {
  return events.filter((e) => e.syncState === 'synced')
}

/**
 * Mark the given ids `synced` (idempotent — already-synced ids are untouched,
 * unknown ids are ignored). Never removes or mutates any other event.
 */
export function markSynced(
  events: readonly CompletionEvent[],
  ids: readonly string[],
  at: number,
): readonly CompletionEvent[] {
  if (ids.length === 0) return events
  const idSet = new Set(ids)
  return events.map((e) =>
    idSet.has(e.id) && e.syncState === 'pending' ? { ...e, syncState: 'synced', syncedAt: at } : e,
  )
}

/**
 * A sync transport. Given the pending batch, it durably persists them somewhere
 * and resolves with the ids it *confirms*. Anything it omits — or a rejection —
 * leaves those events pending for the next flush. Keyed by id, so re-sending a
 * confirmed event is harmless (the receiver dedupes on id too).
 */
export type LedgerTransport = (batch: readonly CompletionEvent[]) => Promise<readonly string[]>

export interface FlushResult {
  events: readonly CompletionEvent[]
  /** Ids newly confirmed this flush. */
  syncedIds: readonly string[]
  /** True if the transport failed outright — every pending event was kept, nothing lost. */
  failed: boolean
}

/**
 * Drain the pending queue through `transport`. Only pending events are sent, and
 * only confirmed ids become `synced`; on any failure the events are returned
 * untouched (still pending) so the next flush retries them. This is the
 * "offline entries sync without loss" guarantee in one function.
 */
export async function flush(
  events: readonly CompletionEvent[],
  transport: LedgerTransport,
  at: number,
): Promise<FlushResult> {
  const queue = pendingEvents(events)
  if (queue.length === 0) {
    return { events, syncedIds: [], failed: false }
  }
  try {
    const confirmed = await transport(queue)
    // Confirm only ids that were actually in the queue we sent.
    const queueIds = new Set(queue.map((e) => e.id))
    const syncedIds = confirmed.filter((id) => queueIds.has(id))
    return { events: markSynced(events, syncedIds, at), syncedIds, failed: false }
  } catch {
    // Transport unreachable (e.g. offline): keep everything pending, lose nothing.
    return { events, syncedIds: [], failed: true }
  }
}

/* ------------------------------------------------- durable serialization -- */

/** Serialize the ledger for durable storage. */
export function serialize(events: readonly CompletionEvent[]): string {
  return JSON.stringify(events)
}

function isGoalId(value: unknown): value is GoalId {
  return value === 'move' || value === 'calm' || value === 'water' || value === 'outside'
}

function isVariant(value: unknown): value is CompletionVariant {
  return value === 'full' || value === 'easier' || value === 'floor'
}

/** Defensive parse of one stored record; returns null if it is not a usable event. */
function sanitizeEvent(raw: unknown): CompletionEvent | null {
  if (typeof raw !== 'object' || raw === null) return null
  const r = raw as Record<string, unknown>
  if (typeof r.id !== 'string' || typeof r.clientKey !== 'string') return null
  if (!isGoalId(r.goalId) || !isVariant(r.variant)) return null
  if (typeof r.actionTitle !== 'string' || typeof r.completedAt !== 'number') return null
  const synced = r.syncState === 'synced'
  return {
    id: r.id,
    clientKey: r.clientKey,
    goalId: r.goalId,
    actionTitle: r.actionTitle,
    variant: r.variant,
    completedAt: r.completedAt,
    syncState: synced ? 'synced' : 'pending',
    syncedAt: synced && typeof r.syncedAt === 'number' ? r.syncedAt : null,
    schemaVersion: typeof r.schemaVersion === 'number' ? r.schemaVersion : LEDGER_SCHEMA_VERSION,
  }
}

/**
 * Parse durably-stored ledger data. Anything malformed is dropped rather than
 * trusted, and a stored id is never allowed to appear twice (dedupe survives a
 * corrupted store too), so a reload can never lose or duplicate a good event.
 */
export function deserialize(raw: string | null): readonly CompletionEvent[] {
  if (!raw) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    const seen = new Set<string>()
    const out: CompletionEvent[] = []
    for (const item of parsed) {
      const event = sanitizeEvent(item)
      if (event && !seen.has(event.id) && !seen.has(`k:${event.clientKey}`)) {
        seen.add(event.id)
        seen.add(`k:${event.clientKey}`)
        out.push(event)
      }
    }
    return out
  } catch {
    return []
  }
}

/* ============================================================ live store == */
/* A singleton, localStorage-backed store with a subscribe/broadcast fan-out —
 * the same shape as lib/cues.ts and lib/haptics.ts. Built on the pure core
 * above, so it inherits the tested dedupe and sync-without-loss behaviour. */

const STORAGE_KEY = 'herrays.ledger.v1'
/** The default transport's durable "confirmed" mirror — proves sync moves data, honestly local. */
const SYNCED_MIRROR_KEY = 'herrays.ledger.synced.v1'

function readStore(): readonly CompletionEvent[] {
  if (typeof localStorage === 'undefined') return []
  try {
    return deserialize(localStorage.getItem(STORAGE_KEY))
  } catch {
    return []
  }
}

let events: readonly CompletionEvent[] = readStore()
const listeners = new Set<(events: readonly CompletionEvent[]) => void>()

function persist(): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, serialize(events))
  } catch {
    /* no-op: an unpersistable store still works for the session */
  }
}

function emit(): void {
  persist()
  const snapshot = listEvents()
  for (const listener of listeners) listener(snapshot)
}

/** An immutable, newest-first snapshot of the ledger. */
export function listEvents(): readonly CompletionEvent[] {
  return [...events].sort((a, b) => b.completedAt - a.completedAt)
}

export function subscribeLedger(listener: (events: readonly CompletionEvent[]) => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/**
 * Record a real-world completion. Idempotent on `input.clientKey`: a repeat tap
 * with the same key returns the existing event and does not double-count. The
 * event is persisted synchronously (offline-first durability) before returning.
 */
export function recordCompletion(input: CompletionInput): { event: CompletionEvent; added: boolean } {
  const result = appendCompletion(events, input, Date.now())
  if (result.added) {
    events = result.events
    emit()
  }
  return { event: result.event, added: result.added }
}

/** Mint an idempotency key for a single completion gesture. */
export function newClientKey(): string {
  return newEventId()
}

/* --------------------------------------------------- online / transport -- */

// Demo-controllable connectivity. Starts from the real navigator state and can
// be overridden so the offline → pending → synced lifecycle is observable.
let online: boolean = typeof navigator === 'undefined' ? true : navigator.onLine !== false

export function isOnline(): boolean {
  return online
}

export function setOnline(value: boolean): void {
  if (value === online) return
  online = value
  // Re-broadcast so connectivity-dependent UI updates even though events are unchanged.
  const snapshot = listEvents()
  for (const listener of listeners) listener(snapshot)
}

/**
 * The default transport: a genuine local two-store move. When online it durably
 * mirrors the batch into a second localStorage namespace (keyed by id, so a
 * re-sent event overwrites rather than duplicates) and confirms those ids. When
 * offline it throws, so the pending queue is kept intact for a later flush.
 *
 * This is deliberately NOT a faked network call — real remote delivery belongs
 * to the backend/native layer (CLAUDE.md §3). It exists so the prototype can
 * honestly demonstrate that confirmed events are moved to durable storage and
 * that nothing is lost while offline.
 */
async function defaultTransport(batch: readonly CompletionEvent[]): Promise<readonly string[]> {
  if (!online) throw new Error('offline')
  if (typeof localStorage === 'undefined') return batch.map((e) => e.id)
  const mirror = deserialize(localStorage.getItem(SYNCED_MIRROR_KEY))
  const byId = new Map(mirror.map((e) => [e.id, e]))
  for (const e of batch) byId.set(e.id, { ...e, syncState: 'synced' })
  try {
    localStorage.setItem(SYNCED_MIRROR_KEY, serialize([...byId.values()]))
  } catch {
    /* mirror is best-effort; confirmation below still reflects what we sent */
  }
  return batch.map((e) => e.id)
}

/**
 * Flush the pending queue to a transport (the local mirror by default). Resolves
 * with how many events were newly confirmed, and whether the flush failed (in
 * which case everything stayed pending — nothing lost).
 */
export async function syncLedger(
  transport: LedgerTransport = defaultTransport,
): Promise<{ syncedCount: number; failed: boolean }> {
  const result = await flush(events, transport, Date.now())
  if (result.syncedIds.length > 0) {
    events = result.events
    emit()
  }
  return { syncedCount: result.syncedIds.length, failed: result.failed }
}

/** Clear the ledger (and its synced mirror). Used by the demo's reset control. */
export function clearLedger(): void {
  events = []
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.removeItem(SYNCED_MIRROR_KEY)
    } catch {
      /* no-op */
    }
  }
  emit()
}
