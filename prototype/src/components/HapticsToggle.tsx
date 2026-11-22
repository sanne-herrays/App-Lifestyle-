/**
 * TASK-021 — Completion haptics setting control.
 *
 * The user-facing half of the acceptance criterion ("setting disables
 * haptics"). A warm, Zero-Guilt switch (CLAUDE.md §1): turning the buzz off is
 * framed as a neutral preference, never a penalty. When the device has no
 * reachable haptic channel we say so plainly instead of showing a dead switch —
 * the silent-degrade path made honest rather than hidden.
 */

import { useId } from 'react'
import { useHapticsSetting } from '../lib/haptics'
import './HapticsToggle.css'

export default function HapticsToggle() {
  const { enabled, setEnabled, supported } = useHapticsSetting()
  const labelId = useId()

  if (!supported) {
    return (
      <p className="haptics-row haptics-unavailable">
        A gentle buzz isn’t available on this device — everything else works just the same.
      </p>
    )
  }

  return (
    <div className="haptics-row">
      <span id={labelId} className="haptics-label">
        Gentle buzz when you finish
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-labelledby={labelId}
        className={`haptics-switch${enabled ? ' on' : ''}`}
        onClick={() => setEnabled(!enabled)}
      >
        <span className="haptics-knob" aria-hidden="true" />
      </button>
    </div>
  )
}
