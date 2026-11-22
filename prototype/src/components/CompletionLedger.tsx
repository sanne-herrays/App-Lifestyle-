/**
 * TASK-026 — Daily action completion ledger (interactive surface).
 *
 * The record/dedupe/sync logic lives in the pure, fully-tested engine
 * (`src/lib/ledger.ts`, with deterministic cases in `ledger.test.ts`). This
 * surface wires that engine to the real shared action catalog so the three
 * acceptance behaviours are visible and tappable:
 *
 *   - unique IDs + timestamps → completing a win records a `CompletionEvent`
 *     with a unique id and a stamped time; the list shows the time, and each
 *     row exposes its id (title attribute + screen-reader text).
 *   - duplicate taps do not double-count → "Count this same win again" replays
 *     the *same* idempotency key; the list never grows and a calm note confirms
 *     "Already counted — one win."
 *   - offline entries sync without loss → a connectivity switch flips the ledger
 *     offline; wins still record (saved on device, pending). "Sync now" drains
 *     the queue only when online, moving events to the durable synced store.
 *     While offline the copy stays reassuring — nothing is ever at risk.
 *
 * Standards (CLAUDE.md): Zero-Guilt (§1) — warm paper + calm-green only; no red,
 * no penalty chrome; "saved on your device" framing, never a loss warning.
 * <2s / tactile (§2) — reuses the shared `HoldToComplete` one-gesture primitive.
 * Health-claim integrity (§3 / TASK-006) — every action label is the catalog's
 * plain, general-benefit copy; nothing composes a health outcome.
 */

import { useEffect, useRef, useState } from 'react'
import { HoldToComplete } from '../flows/flowKit'
import { actionForGoal, GOALS, type GoalId, useReducedMotion } from '../flows/flowData'
import {
  clearLedger,
  isOnline,
  listEvents,
  newClientKey,
  pendingEvents,
  recordCompletion,
  setOnline,
  subscribeLedger,
  syncLedger,
  syncedEvents,
  type CompletionEvent,
} from '../lib/ledger'
import '../flows/flows.css'
import './CompletionLedger.css'

/** Live, synced view of the durable ledger + connectivity (store lives in lib/ledger). */
function useLedger(): { events: readonly CompletionEvent[]; online: boolean } {
  const [events, setEvents] = useState<readonly CompletionEvent[]>(listEvents)
  const [online, setOnlineState] = useState<boolean>(isOnline)

  useEffect(
    () =>
      subscribeLedger((next) => {
        setEvents(next)
        setOnlineState(isOnline())
      }),
    [],
  )

  return { events, online }
}

/** Deterministic, locale-aware time label for a stored timestamp. */
function timeLabel(ms: number): string {
  try {
    return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date(ms))
  } catch {
    return ''
  }
}

type SyncNote = { kind: 'synced'; count: number } | { kind: 'offline' } | { kind: 'nothing' } | null

export default function CompletionLedger() {
  const reducedMotion = useReducedMotion()
  const { events, online } = useLedger()

  const [goal, setGoal] = useState<GoalId>('move')
  const [done, setDone] = useState(false)
  const [lastKey, setLastKey] = useState<string | null>(null)
  const [dupeNote, setDupeNote] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [syncNote, setSyncNote] = useState<SyncNote>(null)

  // Guards the completion callback so one hold records exactly one event even if
  // onComplete is ever re-invoked (belt-and-braces with the engine's dedupe).
  const recordedThisHold = useRef(false)

  const action = actionForGoal(goal)
  const pending = pendingEvents(events)
  const synced = syncedEvents(events)

  const pickGoal = (id: GoalId) => {
    setGoal(id)
    setDone(false)
    setLastKey(null)
    setDupeNote(false)
    recordedThisHold.current = false
  }

  const onComplete = () => {
    if (recordedThisHold.current) return
    recordedThisHold.current = true
    const key = newClientKey()
    recordCompletion({
      clientKey: key,
      goalId: goal,
      actionTitle: action.title,
      variant: 'full',
    })
    setLastKey(key)
    setDupeNote(false)
    setDone(true)
  }

  // Replays the SAME idempotency key — proves a duplicate tap does not double-count.
  const countSameAgain = () => {
    if (!lastKey) return
    const { added } = recordCompletion({
      clientKey: lastKey,
      goalId: goal,
      actionTitle: action.title,
      variant: 'full',
    })
    setDupeNote(!added) // added is false on a genuine duplicate
  }

  const another = () => {
    setDone(false)
    setLastKey(null)
    setDupeNote(false)
    recordedThisHold.current = false
  }

  const onSync = async () => {
    if (syncing) return
    setSyncing(true)
    const { syncedCount, failed } = await syncLedger()
    setSyncing(false)
    if (failed) setSyncNote({ kind: 'offline' })
    else if (syncedCount > 0) setSyncNote({ kind: 'synced', count: syncedCount })
    else setSyncNote({ kind: 'nothing' })
  }

  const toggleOnline = () => {
    setOnline(!online)
    setSyncNote(null)
  }

  const onClear = () => {
    clearLedger()
    another()
    setSyncNote(null)
  }

  return (
    <div className="ledger">
      <div className="ledger-glow" aria-hidden="true" />

      <header className="ledger-head">
        <p className="ledger-eyebrow">Your wins</p>
        <h2 className="ledger-title">Everything you’ve done — kept safe</h2>
        <p className="ledger-sub">
          Each win is saved the moment you finish it. Nothing to lose, nothing to keep up.
        </p>
      </header>

      {/* ---- record a win ------------------------------------------------- */}
      <section className="ledger-record" aria-label="Record a win">
        <div className="ledger-goals" role="radiogroup" aria-label="Which little win?">
          {GOALS.map((g) => {
            const on = g.id === goal
            return (
              <button
                key={g.id}
                type="button"
                role="radio"
                aria-checked={on}
                className={`ledger-goal${on ? ' on' : ''}`}
                onClick={() => pickGoal(g.id)}
              >
                {g.label}
              </button>
            )
          })}
        </div>

        <p className="ledger-action" aria-live="polite">
          {action.title}
        </p>

        <HoldToComplete actionLabel={action.title} done={done} onComplete={onComplete} reducedMotion={reducedMotion} />

        <div className="ledger-after" aria-live="polite">
          {done ? (
            <>
              <p className="ledger-after-note">Recorded — {action.reward}</p>
              <div className="ledger-after-actions">
                <button type="button" className="ledger-btn ghost" onClick={countSameAgain}>
                  Count this same win again
                </button>
                <button type="button" className="ledger-btn" onClick={another}>
                  Record another
                </button>
              </div>
              {dupeNote ? (
                <p className="ledger-dupe" role="status">
                  Already counted — one win, however many times you tap.
                </p>
              ) : null}
            </>
          ) : null}
        </div>
      </section>

      {/* ---- sync state --------------------------------------------------- */}
      <section className="ledger-sync" aria-label="Saving and sync">
        <div className="ledger-counts">
          <span className="ledger-count">
            <strong>{synced.length}</strong> synced
          </span>
          <span className="ledger-count">
            <strong>{pending.length}</strong> saved on this device
          </span>
        </div>

        <div className="ledger-sync-controls">
          <button
            type="button"
            role="switch"
            aria-checked={online}
            className={`ledger-switch${online ? ' on' : ''}`}
            onClick={toggleOnline}
          >
            <span className="ledger-switch-track" aria-hidden="true">
              <span className="ledger-switch-thumb" />
            </span>
            <span className="ledger-switch-label">{online ? 'Online' : 'Offline'}</span>
          </button>

          <button
            type="button"
            className="ledger-btn"
            onClick={onSync}
            disabled={syncing || !online || pending.length === 0}
          >
            {syncing ? 'Syncing…' : 'Sync now'}
          </button>
        </div>

        <p className="ledger-sync-note" aria-live="polite">
          {!online
            ? 'Offline — your wins are safe on this device and will sync when you’re back.'
            : syncNote?.kind === 'synced'
              ? `Synced ${syncNote.count} ${syncNote.count === 1 ? 'win' : 'wins'}.`
              : syncNote?.kind === 'nothing'
                ? 'All caught up — nothing waiting to sync.'
                : syncNote?.kind === 'offline'
                  ? 'Still offline — kept safe here for now.'
                  : pending.length > 0
                    ? `${pending.length} ${pending.length === 1 ? 'win' : 'wins'} ready to sync.`
                    : 'All caught up.'}
        </p>
      </section>

      {/* ---- the ledger --------------------------------------------------- */}
      <section className="ledger-list-wrap" aria-label="Completed wins">
        {events.length === 0 ? (
          <p className="ledger-empty">No wins yet today — your first one will appear right here.</p>
        ) : (
          <ol className="ledger-list">
            {events.map((e) => (
              <li key={e.id} className="ledger-row" title={`id ${e.id}`}>
                <span className="ledger-row-dot" aria-hidden="true" data-synced={e.syncState === 'synced'} />
                <span className="ledger-row-main">
                  <span className="ledger-row-title">{e.actionTitle}</span>
                  <span className="ledger-row-meta">
                    <time dateTime={new Date(e.completedAt).toISOString()}>{timeLabel(e.completedAt)}</time>
                    {' · '}
                    <span className={`ledger-badge${e.syncState === 'synced' ? ' synced' : ''}`}>
                      {e.syncState === 'synced' ? 'Synced' : 'Saved on device'}
                    </span>
                  </span>
                  <span className="ledger-sr">Event id {e.id}</span>
                </span>
              </li>
            ))}
          </ol>
        )}

        {events.length > 0 ? (
          <button type="button" className="ledger-clear" onClick={onClear}>
            Clear history
          </button>
        ) : null}
      </section>
    </div>
  )
}
