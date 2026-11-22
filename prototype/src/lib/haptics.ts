/**
 * TASK-021 — Completion haptic feedback adapter.
 *
 * Acceptance criterion (tasks.json TASK-021):
 *   "Supported iOS devices vibrate once on completion; unsupported devices
 *    silently degrade; setting disables haptics."
 *
 * This is the real platform adapter that formalises the `fireSuccessHaptic`
 * progressive-enhancement stub the first-session flows and the Little Win card
 * already call. It is framework-agnostic (one React hook for the setting UI is
 * exported at the bottom; nothing here renders).
 *
 * Why two channels — honest platform truth:
 *   • Android / Chromium expose the W3C Vibration API (`navigator.vibrate`).
 *     iOS Safari does NOT — `navigator.vibrate` is absent there, so an adapter
 *     that only called it would never buzz on an iPhone.
 *   • iOS 17.4+ Safari emits a single light haptic "tick" when a native
 *     `<input type="checkbox" switch>` is toggled via a click. We keep one
 *     hidden switch and click it once per completion. That is the only
 *     web-reachable iOS haptic, and it is exactly one pulse.
 *
 * Everything is wrapped so an unsupported device, a blocked API, or a thrown
 * call degrades to a silent no-op — haptics are an enhancement, never required
 * (CLAUDE.md §1: a missed buzz must never become a failure state).
 */

import { useCallback, useEffect, useState } from 'react'

/** How this device can produce a completion haptic, if at all. */
export type HapticChannel = 'vibration' | 'ios-switch' | 'none'

/** A single short success tick, in milliseconds (Vibration API channel). */
const SUCCESS_PULSE_MS = 12

/* --------------------------------------------------------- capability -- */

function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent || ''
  if (/iPad|iPhone|iPod/.test(ua)) return true
  // iPadOS 13+ reports a desktop ("Macintosh") UA; disambiguate via touch.
  return ua.includes('Macintosh') && navigator.maxTouchPoints > 1
}

function detectChannel(): HapticChannel {
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    return 'vibration'
  }
  if (isIOS()) return 'ios-switch'
  return 'none'
}

// Resolved once; device capability does not change within a session.
let channel: HapticChannel | null = null
function getChannel(): HapticChannel {
  if (channel === null) channel = detectChannel()
  return channel
}

/** True when this device has any reachable completion-haptic channel. */
export function hapticsSupported(): boolean {
  return getChannel() !== 'none'
}

/* ---------------------------------------------------- ios switch tick -- */

// A single hidden, offscreen native switch. Toggling it via click() is the one
// web-reachable way to emit an iOS system haptic; reused so we never litter the
// DOM. Created lazily so non-iOS devices never touch the DOM at all.
let iosSwitch: HTMLLabelElement | null = null

function getIOSSwitch(): HTMLLabelElement | null {
  if (typeof document === 'undefined' || !document.body) return null
  if (iosSwitch) return iosSwitch

  const label = document.createElement('label')
  label.setAttribute('aria-hidden', 'true')
  // Fully removed from layout, focus order and the accessibility tree.
  label.style.cssText =
    'position:absolute;width:1px;height:1px;margin:-1px;padding:0;' +
    'border:0;overflow:hidden;clip:rect(0 0 0 0);pointer-events:none;'

  const input = document.createElement('input')
  input.type = 'checkbox'
  input.setAttribute('switch', '') // the native iOS switch that ticks on toggle
  input.tabIndex = -1
  input.setAttribute('aria-hidden', 'true')

  label.appendChild(input)
  document.body.appendChild(label)
  iosSwitch = label
  return label
}

/* ------------------------------------------------------ enabled state -- */

const STORAGE_KEY = 'herrays.haptics.enabled'

function readStoredEnabled(): boolean {
  if (typeof localStorage === 'undefined') return true
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw === null ? true : raw === '1' // default ON; '0' disables
  } catch {
    return true
  }
}

// Haptics are opt-out: on by default, the setting turns them off.
let enabled = readStoredEnabled()
const listeners = new Set<(value: boolean) => void>()

/** Whether completion haptics are currently allowed by the user setting. */
export function getHapticsEnabled(): boolean {
  return enabled
}

/** Persist and broadcast the setting. Setting it to `false` disables haptics. */
export function setHapticsEnabled(value: boolean): void {
  if (value === enabled) return
  enabled = value
  try {
    localStorage.setItem(STORAGE_KEY, value ? '1' : '0')
  } catch {
    /* no-op: a non-persistable setting still works for the session */
  }
  for (const listener of listeners) listener(value)
}

/** Subscribe to setting changes; returns an unsubscribe. */
export function subscribeHapticsEnabled(listener: (value: boolean) => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/* ------------------------------------------------------------- fire -- */

/**
 * Fire the single success haptic. Call this exactly once, on a genuine
 * completion. No-ops silently when the setting is off or no channel exists, and
 * never throws — haptics are a progressive enhancement.
 */
export function fireSuccessHaptic(): void {
  if (!enabled) return
  try {
    switch (getChannel()) {
      case 'vibration':
        navigator.vibrate(SUCCESS_PULSE_MS) // one short pulse
        break
      case 'ios-switch':
        getIOSSwitch()?.click() // one native switch tick
        break
      case 'none':
        break
    }
  } catch {
    /* no-op: never required, never allowed to break completion */
  }
}

/* ------------------------------------------------------- react hook -- */

export interface HapticsSetting {
  /** Current user setting (haptics allowed). */
  enabled: boolean
  /** Turn the completion haptic on or off; persists across sessions. */
  setEnabled: (value: boolean) => void
  /** Whether this device can produce a haptic at all (else the toggle is moot). */
  supported: boolean
}

/** Bind a settings control to the shared, persisted haptics setting. */
export function useHapticsSetting(): HapticsSetting {
  const [value, setValue] = useState<boolean>(getHapticsEnabled)

  useEffect(() => subscribeHapticsEnabled(setValue), [])

  const setEnabled = useCallback((next: boolean) => {
    setHapticsEnabled(next)
  }, [])

  return { enabled: value, setEnabled, supported: hapticsSupported() }
}
