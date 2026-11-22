/**
 * TASK-023 — Habit cue scheduler.
 *
 * "Allow a user to associate an action with a time or existing routine."
 *
 * Acceptance criterion (tasks.json TASK-023):
 *   "Create, edit and disable cues; timezone changes handled; notifications
 *    require opt-in."
 *
 *   - Create / edit / disable → the "Add a cue" editor creates cues; each row
 *     has Edit (reopens the same editor pre-filled) and a Pause/Resume switch
 *     that disables it without deleting it. Remove is also offered.
 *   - Timezone changes handled → when a time cue was authored in a zone the
 *     device has since left, a calm banner appears offering two one-tap
 *     resolutions: keep the same clock time here, or shift to the original
 *     moment. Nothing drifts silently.
 *   - Notifications require opt-in → the "Remind me" switch can only be turned
 *     on after the real Notification opt-in is granted; attempting it requests
 *     permission first, and a denied/unsupported device degrades to a plain
 *     explanation, never a dead or misleading control.
 *
 * Standards: Zero-Guilt (§1) — warm palette, pausing/removing framed neutrally,
 * no red/penalty/streak chrome. Craft/a11y — native time + radio inputs, ARIA
 * switches, labelled controls, visible focus rings, reduced-motion handled in
 * CSS. No disease-risk claims (§3/TASK-006): copy stays general-benefit.
 */

import { useId, useState } from 'react'
import { ACCENT, ANCHORS, actionForGoal, GOALS } from '../flows/flowData'
import {
  type Cue,
  type CueDraft,
  type CueKind,
  cueNeedsTzReview,
  createCue,
  DEFAULT_DRAFT,
  describeCue,
  formatTime,
  getCurrentTimeZone,
  absoluteShiftedTime,
  removeCue,
  resolveKeepLocal,
  resolveShiftAbsolute,
  setCueEnabled,
  setCueNotify,
  shortZone,
  showCuePreview,
  updateCue,
  useCues,
  useNotifyPermission,
} from '../lib/cues'
import '../flows/flows.css'
import './HabitCueScheduler.css'

/** The editor state: either a fresh draft, or editing an existing cue by id. */
type Editing = { mode: 'new'; draft: CueDraft } | { mode: 'edit'; id: string; draft: CueDraft }

function draftFromCue(cue: Cue): CueDraft {
  return {
    goalId: cue.goalId,
    kind: cue.kind,
    time: cue.time,
    anchor: cue.anchor,
    notify: cue.notify,
  }
}

export default function HabitCueScheduler() {
  const cues = useCues()
  const { permission, request } = useNotifyPermission()
  const [editing, setEditing] = useState<Editing | null>(null)
  const currentTz = getCurrentTimeZone()

  const accent = ACCENT['growing-world'] // calm green — a plan, not a demand

  const openNew = () => setEditing({ mode: 'new', draft: { ...DEFAULT_DRAFT } })
  const openEdit = (cue: Cue) => setEditing({ mode: 'edit', id: cue.id, draft: draftFromCue(cue) })
  const closeEditor = () => setEditing(null)

  const saveEditor = async () => {
    if (!editing) return
    // Notifications require opt-in: if the draft wants a reminder but permission
    // isn't granted yet, request it before saving. The logic layer clamps too.
    let draft = editing.draft
    if (draft.notify && permission !== 'granted') {
      const result = await request()
      if (result !== 'granted') draft = { ...draft, notify: false }
    }
    if (editing.mode === 'new') createCue(draft)
    else updateCue(editing.id, draft)
    setEditing(null)
  }

  const patchDraft = (patch: Partial<CueDraft>) => {
    setEditing((e) => (e ? { ...e, draft: { ...e.draft, ...patch } } : e))
  }

  // Turning a row's reminder on: opt-in first if needed.
  const toggleNotify = async (cue: Cue) => {
    if (cue.notify) {
      setCueNotify(cue.id, false)
      return
    }
    if (permission !== 'granted') {
      const result = await request()
      if (result !== 'granted') return // stays off; the status line explains why
    }
    setCueNotify(cue.id, true)
  }

  return (
    <div className="hcs" style={{ ['--accent']: accent } as React.CSSProperties}>
      <div className="hcs-glow" aria-hidden="true" />

      <header className="hcs-head">
        <p className="hcs-eyebrow">Gentle cues</p>
        <h2 className="hcs-headline">Give today’s little win a moment</h2>
        <p className="hcs-intro">
          Tie an action to a time or something you already do. It’s a soft
          invitation — pause or change it anytime, nothing to lose.
        </p>
      </header>

      {cues.length === 0 && !editing ? (
        <div className="hcs-empty">
          <p className="hcs-empty-note">No cues yet — and that’s completely fine.</p>
          <button type="button" className="hcs-add" onClick={openNew}>
            Add a cue
          </button>
        </div>
      ) : null}

      {cues.length > 0 ? (
        <ul className="hcs-list">
          {cues.map((cue) => {
            const needsReview = cueNeedsTzReview(cue, currentTz)
            return (
              <li key={cue.id} className={`hcs-cue${cue.enabled ? '' : ' is-paused'}`}>
                <div className="hcs-cue-main">
                  <div className="hcs-cue-text">
                    <p className="hcs-cue-when">
                      {cue.kind === 'time' ? formatTime(cue.time) : cue.anchor}
                    </p>
                    <p className="hcs-cue-action">{actionForGoal(cue.goalId).title}</p>
                    {!cue.enabled ? <p className="hcs-cue-status">Paused</p> : null}
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={cue.enabled}
                    aria-label={`${cue.enabled ? 'Pause' : 'Resume'} this cue (${describeCue(cue)})`}
                    className={`hcs-switch${cue.enabled ? ' on' : ''}`}
                    onClick={() => setCueEnabled(cue.id, !cue.enabled)}
                  >
                    <span className="hcs-knob" aria-hidden="true" />
                  </button>
                </div>

                {needsReview ? (
                  <div className="hcs-tz" role="group" aria-label="Time zone changed">
                    <p className="hcs-tz-note">
                      You set this in {shortZone(cue.tz)}; you’re now in{' '}
                      {shortZone(currentTz)}. Keep it at{' '}
                      <strong>{formatTime(cue.time)}</strong> here, or shift to{' '}
                      <strong>{formatTime(absoluteShiftedTime(cue, currentTz))}</strong>{' '}
                      to match the original moment?
                    </p>
                    <div className="hcs-tz-actions">
                      <button
                        type="button"
                        className="hcs-tz-btn primary"
                        onClick={() => resolveKeepLocal(cue.id)}
                      >
                        Keep {formatTime(cue.time)} here
                      </button>
                      <button
                        type="button"
                        className="hcs-tz-btn"
                        onClick={() => resolveShiftAbsolute(cue.id)}
                      >
                        Shift to {formatTime(absoluteShiftedTime(cue, currentTz))}
                      </button>
                    </div>
                  </div>
                ) : null}

                <div className="hcs-cue-row">
                  <label className="hcs-remind">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={cue.notify}
                      className={`hcs-mini-switch${cue.notify ? ' on' : ''}`}
                      onClick={() => void toggleNotify(cue)}
                      disabled={permission === 'unsupported' || permission === 'denied'}
                    >
                      <span className="hcs-knob" aria-hidden="true" />
                    </button>
                    <span className="hcs-remind-label">Remind me</span>
                  </label>

                  <div className="hcs-cue-tools">
                    {cue.notify ? (
                      <button
                        type="button"
                        className="hcs-link"
                        onClick={() => showCuePreview(cue)}
                      >
                        Preview
                      </button>
                    ) : null}
                    <button type="button" className="hcs-link" onClick={() => openEdit(cue)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className="hcs-link subtle"
                      onClick={() => removeCue(cue.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      ) : null}

      {cues.length > 0 && !editing ? (
        <button type="button" className="hcs-add ghost" onClick={openNew}>
          Add another cue
        </button>
      ) : null}

      {editing ? (
        <CueEditor
          editing={editing}
          permission={permission}
          onChange={patchDraft}
          onSave={() => void saveEditor()}
          onCancel={closeEditor}
        />
      ) : null}

      <NotifyStatus permission={permission} />
    </div>
  )
}

/* --------------------------------------------------------- editor -- */

interface EditorProps {
  editing: Editing
  permission: ReturnType<typeof useNotifyPermission>['permission']
  onChange: (patch: Partial<CueDraft>) => void
  onSave: () => void
  onCancel: () => void
}

function CueEditor({ editing, permission, onChange, onSave, onCancel }: EditorProps) {
  const timeId = useId()
  const { draft } = editing
  const notifyBlocked = permission === 'unsupported' || permission === 'denied'

  return (
    <section className="hcs-editor" aria-label={editing.mode === 'new' ? 'New cue' : 'Edit cue'}>
      <h3 className="hcs-editor-title">
        {editing.mode === 'new' ? 'A new gentle cue' : 'Adjust this cue'}
      </h3>

      {/* The action (reuses the shared goal catalog — single source of truth). */}
      <fieldset className="hcs-field">
        <legend className="hcs-legend">The little win</legend>
        <div className="hcs-chips" role="radiogroup" aria-label="Which action?">
          {GOALS.map((g) => {
            const on = g.id === draft.goalId
            return (
              <button
                key={g.id}
                type="button"
                role="radio"
                aria-checked={on}
                className={`hcs-chip${on ? ' on' : ''}`}
                onClick={() => onChange({ goalId: g.id })}
              >
                {actionForGoal(g.id).title}
              </button>
            )
          })}
        </div>
      </fieldset>

      {/* Time vs. existing routine. */}
      <fieldset className="hcs-field">
        <legend className="hcs-legend">When</legend>
        <div className="hcs-seg" role="radiogroup" aria-label="Cue type">
          {(['time', 'routine'] as CueKind[]).map((k) => (
            <button
              key={k}
              type="button"
              role="radio"
              aria-checked={draft.kind === k}
              className={`hcs-seg-btn${draft.kind === k ? ' on' : ''}`}
              onClick={() => onChange({ kind: k })}
            >
              {k === 'time' ? 'At a time' : 'After a routine'}
            </button>
          ))}
        </div>

        {draft.kind === 'time' ? (
          <div className="hcs-time-wrap">
            <label htmlFor={timeId} className="hcs-time-label">
              Time of day
            </label>
            <input
              id={timeId}
              type="time"
              className="hcs-time-input"
              value={draft.time}
              onChange={(e) => onChange({ time: e.target.value })}
            />
          </div>
        ) : (
          <div className="hcs-chips hcs-anchors" role="radiogroup" aria-label="Existing routine">
            {ANCHORS.map((a) => {
              const on = a === draft.anchor
              return (
                <button
                  key={a}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  className={`hcs-chip${on ? ' on' : ''}`}
                  onClick={() => onChange({ anchor: a })}
                >
                  {a}
                </button>
              )
            })}
          </div>
        )}
      </fieldset>

      {/* Reminder opt-in. */}
      <div className="hcs-field hcs-notify-field">
        <button
          type="button"
          role="switch"
          aria-checked={draft.notify && !notifyBlocked}
          className={`hcs-mini-switch${draft.notify && !notifyBlocked ? ' on' : ''}`}
          onClick={() => onChange({ notify: !draft.notify })}
          disabled={notifyBlocked}
        >
          <span className="hcs-knob" aria-hidden="true" />
        </button>
        <span className="hcs-remind-label">
          {notifyBlocked
            ? 'Reminders need notification permission on this device'
            : 'Send a gentle reminder (asks permission first)'}
        </span>
      </div>

      <div className="hcs-editor-actions">
        <button type="button" className="hcs-save" onClick={onSave}>
          {editing.mode === 'new' ? 'Add this cue' : 'Save changes'}
        </button>
        <button type="button" className="hcs-cancel" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </section>
  )
}

/* ---------------------------------------------------- notify status -- */

function NotifyStatus({ permission }: { permission: ReturnType<typeof useNotifyPermission>['permission'] }) {
  const message =
    permission === 'granted'
      ? 'Reminders are allowed. You can arm one per cue — or leave them off.'
      : permission === 'denied'
        ? 'Reminders are blocked in your browser settings. Every cue still works here as a gentle plan.'
        : permission === 'unsupported'
          ? 'This device can’t show notifications — cues still work as gentle plans.'
          : 'Reminders are off until you choose them. We’ll ask before sending anything.'

  return (
    <p className="hcs-notify-status" aria-live="polite">
      {message}
    </p>
  )
}
