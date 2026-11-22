/**
 * TASK-023 — Habit cue scheduler: data & logic layer.
 *
 * "Allow a user to associate an action with a time or existing routine."
 *
 * Acceptance criterion (tasks.json TASK-023):
 *   "Create, edit and disable cues; timezone changes handled; notifications
 *    require opt-in."
 *
 *   - Create / edit / disable → `createCue` / `updateCue` / `setCueEnabled`
 *     (+ `removeCue`), persisted to localStorage with a subscribe/broadcast
 *     store so every surface stays in sync (same pattern as `lib/haptics.ts`).
 *     Disabling is a neutral *pause*, never a penalty (CLAUDE.md §1).
 *   - Timezone changes handled → each time-of-day cue records the IANA zone it
 *     was authored in. `cueNeedsTzReview` detects when the device has since
 *     moved zones, and the user resolves it with one tap: keep the same
 *     wall-clock time here (`resolveKeepLocal`) or preserve the original
 *     absolute moment (`resolveShiftAbsolute`, via `absoluteShiftedTime`).
 *     Nothing silently drifts.
 *   - Notifications require opt-in → a cue's `notify` flag can only become true
 *     once the real Notification permission is `granted`. `setCueNotify` and
 *     `createCue` both clamp against `notificationsAllowed()`, so no cue can
 *     ever arm a reminder the user has not explicitly permitted.
 *
 * This layer is framework-agnostic; the React hooks for the UI live at the foot
 * of the file (nothing here renders), so it never crosses a react-refresh
 * component boundary.
 *
 * Scheduling honesty (CLAUDE.md §3): the web prototype cannot reliably deliver
 * background OS notifications, so this layer does NOT pretend to. It owns the
 * real opt-in gate and an honest, user-triggered `showCuePreview` that fires one
 * genuine `Notification` so the permission wiring is demonstrably real — not a
 * mock. Actual scheduled delivery is the native layer's job.
 */

import { useCallback, useEffect, useState } from 'react'
import { actionForGoal, ANCHORS, type GoalId } from '../flows/flowData'

export type CueKind = 'time' | 'routine'

export interface Cue {
  id: string
  /** The micro-action this cue is attached to (reuses the shared goal catalog). */
  goalId: GoalId
  kind: CueKind
  /** kind==='time': wall-clock "HH:MM" (24h). Ignored for routine cues. */
  time: string
  /** kind==='routine': one of the shared `ANCHORS`. Ignored for time cues. */
  anchor: string
  /** IANA zone the time cue was authored in — the anchor for tz-change handling. */
  tz: string
  /** Active or paused. Pausing is neutral (Zero-Guilt), never a broken-streak. */
  enabled: boolean
  /** Whether a reminder is armed. Only ever true when notifications are granted. */
  notify: boolean
  createdAt: number
}

/** The editable fields a create/edit form collects. */
export interface CueDraft {
  goalId: GoalId
  kind: CueKind
  time: string
  anchor: string
  notify: boolean
}

const FALLBACK_ANCHOR: string = ANCHORS[0] ?? 'after my morning coffee'

export const DEFAULT_DRAFT: CueDraft = {
  goalId: 'move',
  kind: 'time',
  time: '08:00',
  anchor: FALLBACK_ANCHOR,
  notify: false,
}

/* ---------------------------------------------------------- timezone -- */

/** The device's current IANA time zone (best-effort; '' if unavailable). */
export function getCurrentTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || ''
  } catch {
    return ''
  }
}

function partValue(parts: readonly Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes): number {
  const found = parts.find((p) => p.type === type)
  return found ? Number(found.value) : 0
}

/** UTC offset in minutes (east of UTC positive) for `tz` at the given instant. */
function zoneOffsetMinutes(tz: string, date: Date): number {
  try {
    const dtf = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
    const parts = dtf.formatToParts(date)
    const hour = partValue(parts, 'hour') % 24 // guard the occasional '24' for midnight
    const asUTC = Date.UTC(
      partValue(parts, 'year'),
      partValue(parts, 'month') - 1,
      partValue(parts, 'day'),
      hour,
      partValue(parts, 'minute'),
      partValue(parts, 'second'),
    )
    return Math.round((asUTC - date.getTime()) / 60000)
  } catch {
    return 0
  }
}

function toMinutes(hhmm: string): number {
  const parts = hhmm.split(':')
  const h = Number(parts[0] ?? '0')
  const m = Number(parts[1] ?? '0')
  return ((h * 60 + m) % 1440 + 1440) % 1440
}

function fromMinutes(total: number): string {
  const wrapped = ((total % 1440) + 1440) % 1440
  const h = Math.floor(wrapped / 60)
  const m = wrapped % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/**
 * True when a time cue was authored in a zone the device has since left — the
 * one moment a stored wall-clock time becomes ambiguous and needs a human call.
 */
export function cueNeedsTzReview(cue: Cue, currentTz: string = getCurrentTimeZone()): boolean {
  return cue.kind === 'time' && cue.tz !== '' && currentTz !== '' && cue.tz !== currentTz
}

/**
 * The wall-clock time that preserves the cue's *original absolute moment* in the
 * current zone (e.g. a 9:00 London cue becomes 4:00 after moving to New York).
 */
export function absoluteShiftedTime(cue: Cue, currentTz: string = getCurrentTimeZone(), now: Date = new Date()): string {
  const shift = zoneOffsetMinutes(currentTz, now) - zoneOffsetMinutes(cue.tz, now)
  return fromMinutes(toMinutes(cue.time) + shift)
}

/** Friendly short zone label, e.g. "America/New_York" → "New York". */
export function shortZone(tz: string): string {
  const tail = tz.split('/').pop() ?? tz
  return tail.replace(/_/g, ' ')
}

/** "08:00" → "8:00 AM" (deterministic, locale-independent). */
export function formatTime(hhmm: string): string {
  const parts = hhmm.split(':')
  const hh = Number(parts[0] ?? '0')
  const mm = parts[1] ?? '00'
  const period = hh < 12 ? 'AM' : 'PM'
  const h12 = hh % 12 === 0 ? 12 : hh % 12
  return `${h12}:${mm} ${period}`
}

/** A plain-language description of when a cue fires. */
export function describeCue(cue: Cue): string {
  const action = actionForGoal(cue.goalId).title
  return cue.kind === 'time'
    ? `${action} at ${formatTime(cue.time)}`
    : `${action} ${cue.anchor}`
}

/* ------------------------------------------------------ notifications -- */

export type NotifyPermission = 'default' | 'granted' | 'denied' | 'unsupported'

/** The current browser notification permission, or 'unsupported' where absent. */
export function getNotifyPermission(): NotifyPermission {
  if (typeof Notification === 'undefined') return 'unsupported'
  return Notification.permission
}

/** Whether a cue is allowed to arm a reminder right now. */
export function notificationsAllowed(): boolean {
  return getNotifyPermission() === 'granted'
}

/**
 * Explicit opt-in. Resolves to the resulting permission. Never throws — a
 * blocked or unsupported prompt degrades to the current/unsupported state.
 */
export async function requestNotifyOptIn(): Promise<NotifyPermission> {
  if (typeof Notification === 'undefined') return 'unsupported'
  try {
    const result = await Notification.requestPermission()
    return result
  } catch {
    return getNotifyPermission()
  }
}

/**
 * Fire ONE genuine preview notification, user-triggered, so the opt-in wiring is
 * demonstrably real. No-ops unless permission is granted (opt-in gate) and never
 * throws. This is not background scheduling — delivery of scheduled reminders is
 * the native layer's responsibility.
 */
export function showCuePreview(cue: Cue): boolean {
  if (!notificationsAllowed()) return false
  try {
    const when = cue.kind === 'time' ? `at ${formatTime(cue.time)}` : cue.anchor
    new Notification('A gentle little win', {
      body: `${actionForGoal(cue.goalId).title} — ${when}. Whenever you’re ready.`,
      tag: `herrays-cue-${cue.id}`,
    })
    return true
  } catch {
    return false
  }
}

/* ------------------------------------------------------------ store -- */

const STORAGE_KEY = 'herrays.cues.v1'

function isGoalId(value: unknown): value is GoalId {
  return value === 'move' || value === 'calm' || value === 'water' || value === 'outside'
}

/** Defensive parse: anything malformed in storage is dropped, never trusted. */
function sanitizeCue(raw: unknown): Cue | null {
  if (typeof raw !== 'object' || raw === null) return null
  const r = raw as Record<string, unknown>
  if (typeof r.id !== 'string' || !isGoalId(r.goalId)) return null
  const kind: CueKind = r.kind === 'routine' ? 'routine' : 'time'
  return {
    id: r.id,
    goalId: r.goalId,
    kind,
    time: typeof r.time === 'string' ? r.time : DEFAULT_DRAFT.time,
    anchor: typeof r.anchor === 'string' ? r.anchor : FALLBACK_ANCHOR,
    tz: typeof r.tz === 'string' ? r.tz : '',
    enabled: r.enabled !== false, // default active
    notify: r.notify === true && notificationsAllowed(), // never trust a stale grant
    createdAt: typeof r.createdAt === 'number' ? r.createdAt : 0,
  }
}

function readStored(): Cue[] {
  if (typeof localStorage === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.map(sanitizeCue).filter((c): c is Cue => c !== null)
  } catch {
    return []
  }
}

let cues: Cue[] = readStored()
const listeners = new Set<(cues: readonly Cue[]) => void>()

function persist(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cues))
  } catch {
    /* no-op: an unpersistable store still works for the session */
  }
}

function emit(): void {
  persist()
  const snapshot = listCues()
  for (const listener of listeners) listener(snapshot)
}

/** A stable, immutable snapshot of the current cues. */
export function listCues(): readonly Cue[] {
  return cues.slice()
}

function newId(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID()
    }
  } catch {
    /* fall through */
  }
  return `cue-${Date.now()}-${Math.floor(Math.random() * 1e9)}`
}

export function createCue(draft: CueDraft): Cue {
  const cue: Cue = {
    id: newId(),
    goalId: draft.goalId,
    kind: draft.kind,
    time: draft.time,
    anchor: draft.anchor,
    tz: draft.kind === 'time' ? getCurrentTimeZone() : '',
    enabled: true,
    notify: draft.notify && notificationsAllowed(), // opt-in gate
    createdAt: Date.now(),
  }
  cues = [...cues, cue]
  emit()
  return cue
}

/** Patch an existing cue. Changing a time cue re-anchors it to the current zone. */
export function updateCue(id: string, draft: CueDraft): void {
  cues = cues.map((c) => {
    if (c.id !== id) return c
    return {
      ...c,
      goalId: draft.goalId,
      kind: draft.kind,
      time: draft.time,
      anchor: draft.anchor,
      tz: draft.kind === 'time' ? getCurrentTimeZone() : '',
      notify: draft.notify && notificationsAllowed(),
    }
  })
  emit()
}

/** Pause or resume a cue. Pausing is a neutral preference, never a penalty. */
export function setCueEnabled(id: string, enabled: boolean): void {
  cues = cues.map((c) => (c.id === id ? { ...c, enabled } : c))
  emit()
}

/** Arm/disarm the reminder. Arming is clamped to the opt-in gate. */
export function setCueNotify(id: string, notify: boolean): void {
  const allowed = notify ? notificationsAllowed() : false
  cues = cues.map((c) => (c.id === id ? { ...c, notify: allowed } : c))
  emit()
}

export function removeCue(id: string): void {
  cues = cues.filter((c) => c.id !== id)
  emit()
}

/** Timezone resolution — keep the same wall-clock time in the new zone. */
export function resolveKeepLocal(id: string): void {
  const tz = getCurrentTimeZone()
  cues = cues.map((c) => (c.id === id ? { ...c, tz } : c))
  emit()
}

/** Timezone resolution — preserve the original absolute moment. */
export function resolveShiftAbsolute(id: string): void {
  const tz = getCurrentTimeZone()
  cues = cues.map((c) => (c.id === id ? { ...c, time: absoluteShiftedTime(c, tz), tz } : c))
  emit()
}

export function subscribeCues(listener: (cues: readonly Cue[]) => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/* ------------------------------------------------------- react hooks -- */

/** Live, synced view of the stored cues. */
export function useCues(): readonly Cue[] {
  const [value, setValue] = useState<readonly Cue[]>(listCues)
  useEffect(() => subscribeCues(setValue), [])
  return value
}

export interface NotifyState {
  permission: NotifyPermission
  /** Trigger the explicit opt-in; resolves to the resulting permission. */
  request: () => Promise<NotifyPermission>
}

/** Bind a control to the real notification permission + opt-in request. */
export function useNotifyPermission(): NotifyState {
  const [permission, setPermission] = useState<NotifyPermission>(getNotifyPermission)

  const request = useCallback(async () => {
    const result = await requestNotifyOptIn()
    setPermission(result)
    return result
  }, [])

  return { permission, request }
}
