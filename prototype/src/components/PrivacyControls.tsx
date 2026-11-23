/**
 * TASK-041 — Privacy and consent controls (interactive surface).
 *
 * The consent model, the data-minimization rule ("off means gone"), the complete
 * export, and the total deletion all live in the pure, fully-tested engine
 * (`src/lib/privacy.ts`, with deterministic cases in `privacy.test.ts`). This
 * surface makes them observable and lets a reviewer walk the acceptance criterion
 * by hand (tasks.json TASK-041):
 *
 *   - Consent can be withdrawn → each OPTIONAL purpose has a real on/off switch,
 *     off by default. Turning one off calls `setConsentLive(id, false)`, which flips
 *     the grant and ERASES that purpose's data in the same step; the live status line
 *     names exactly what was removed.
 *   - Export and deletion flows → "Export a copy of everything" assembles the full
 *     on-device bundle and downloads it as JSON; "Delete all of my data" runs a calm
 *     two-step confirm, then wipes every key and restores the private default.
 *   - No optional health data collected by default → the optional section renders
 *     every optional purpose OFF on a fresh install, with "Connected health data"
 *     visibly off, and the "what we hold right now" summary shows only essentials.
 *
 * Standards: Zero-Guilt (§1) — warm paper + calm-green, no red/penalty chrome; even
 * deletion is framed as a calm, reversible, user-owned choice, and every surfaced
 * string clears the shared `isGuiltFree` guard. Integrity (§3) — the export is the
 * real on-device data and deletion really removes it; nothing is faked. A11y —
 * `role="switch"` toggles with `aria-checked`, an `aria-live` status region, visible
 * focus rings and a dedicated `prefers-reduced-motion` block.
 */

import { useEffect, useMemo, useState } from 'react'
import { useReducedMotion } from '../flows/flowData'
import {
  ESSENTIAL_PURPOSES,
  OPTIONAL_PURPOSES,
  PRIVACY_PROMISES,
  collectedPurposes,
  deleteAllData,
  exportAllData,
  getConsent,
  isCollectingHealthData,
  isGranted,
  serializeExport,
  setConsentLive,
  subscribeConsent,
  type ConsentPurpose,
  type ConsentState,
} from '../lib/privacy'
import './PrivacyControls.css'

/** Subscribe a component to the live consent record. */
function useConsent(): ConsentState {
  const [consent, setConsent] = useState<ConsentState>(getConsent)
  useEffect(() => subscribeConsent(setConsent), [])
  return consent
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} bytes`
  return `${(n / 1024).toFixed(1)} KB`
}

export default function PrivacyControls() {
  const reducedMotion = useReducedMotion()
  const consent = useConsent()

  const [status, setStatus] = useState<string>('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [lastExport, setLastExport] = useState<{ bytes: number } | null>(null)

  const collecting = useMemo(() => collectedPurposes(consent), [consent])
  const healthOn = isCollectingHealthData(consent)

  function handleToggle(purpose: ConsentPurpose, next: boolean): void {
    const erased = setConsentLive(purpose.id, next)
    if (next) {
      setStatus(`${purpose.title} is on. You can turn it off any time, and anything it holds goes with it.`)
    } else {
      setStatus(
        erased.length > 0
          ? `${purpose.title} is off, and everything it held has been erased from this device.`
          : `${purpose.title} is off.`,
      )
    }
  }

  function handleExport(): void {
    const bundle = exportAllData()
    const text = serializeExport(bundle)
    const bytes = new TextEncoder().encode(text).length
    setLastExport({ bytes })
    setStatus(`A full copy of your data is ready — ${formatBytes(bytes)}, yours to keep.`)
    // Trigger a real download where a DOM is available; the bundle is still built
    // (and the status still accurate) in a headless/test environment.
    if (typeof document === 'undefined' || typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') {
      return
    }
    try {
      const blob = new Blob([text], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'herrays-my-data.json'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch {
      /* the in-app copy above is still accurate even if the browser blocked the download */
    }
  }

  function handleDelete(): void {
    const erased = deleteAllData()
    setConfirmDelete(false)
    setLastExport(null)
    setStatus(`Done — ${erased.length} stored items were removed from this device. Everything starts fresh whenever you like.`)
  }

  return (
    <div className={`pc${reducedMotion ? ' reduce' : ''}`}>
      <div className="pc-glow" aria-hidden="true" />

      <header className="pc-head">
        <p className="pc-eyebrow">Privacy &amp; consent</p>
        <h2 className="pc-title">Your data stays yours — and mostly stays put</h2>
        <p className="pc-sub">
          Only the few essentials that run your daily little win are kept by default. Everything else — insights,
          reflections, any health data — is off until you choose it, and leaving with a full copy is one tap away.
        </p>
      </header>

      {/* ---- the two promises ---------------------------------------------- */}
      <ul className="pc-promises" aria-label="Our privacy promises">
        {PRIVACY_PROMISES.map((line) => (
          <li key={line} className="pc-promise">
            <span className="pc-promise-mark" aria-hidden="true">
              ✓
            </span>
            <span>{line}</span>
          </li>
        ))}
      </ul>

      {/* ---- live status --------------------------------------------------- */}
      <p className="pc-status" role="status" aria-live="polite">
        {status || `Right now we hold ${collecting.length} kinds of data${healthOn ? '' : ' — none of it health data'}.`}
      </p>

      {/* ---- essential (no toggle) ----------------------------------------- */}
      <section className="pc-panel" aria-label="Essential data">
        <div className="pc-panel-head">
          <h3 className="pc-panel-title">Essential to your daily loop</h3>
          <span className="pc-chip pc-chip-essential">Always minimal</span>
        </div>
        <p className="pc-panel-note">
          These power your little win itself, so they have no on/off switch — the switch is “use the app, or delete it
          below.” They are never health data, and they are always in your export.
        </p>
        <ul className="pc-list">
          {ESSENTIAL_PURPOSES.map((purpose) => (
            <li key={purpose.id} className="pc-item pc-item-on">
              <span className="pc-item-mark" aria-hidden="true">
                ✓
              </span>
              <span className="pc-item-body">
                <span className="pc-item-name">{purpose.title}</span>
                <span className="pc-item-desc">{purpose.description}</span>
              </span>
              <span className="pc-item-tag">kept</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ---- optional (real toggles, off by default) ----------------------- */}
      <section className="pc-panel" aria-label="Optional data">
        <div className="pc-panel-head">
          <h3 className="pc-panel-title">Optional · off by default</h3>
          <span className="pc-chip pc-chip-optional">Opt-in</span>
        </div>
        <p className="pc-panel-note">
          Nothing here is collected until you turn it on. Turn it back off and whatever it held is erased — off means gone.
        </p>
        <ul className="pc-list">
          {OPTIONAL_PURPOSES.map((purpose) => {
            const on = isGranted(consent, purpose.id)
            return (
              <li key={purpose.id} className={`pc-item${on ? ' pc-item-on' : ''}`}>
                <span className="pc-item-body">
                  <span className="pc-item-name">
                    {purpose.title}
                    {purpose.containsHealthData && <span className="pc-health-tag">health data</span>}
                  </span>
                  <span className="pc-item-desc">{purpose.description}</span>
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={on}
                  className={`pc-switch${on ? ' on' : ''}`}
                  onClick={() => handleToggle(purpose, !on)}
                >
                  <span className="pc-switch-track" aria-hidden="true">
                    <span className="pc-switch-thumb" />
                  </span>
                  <span className="pc-switch-label">{on ? 'On' : 'Off'}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      {/* ---- export + delete ----------------------------------------------- */}
      <section className="pc-panel pc-ownership" aria-label="Take your data with you">
        <h3 className="pc-panel-title">Take it with you, or clear it out</h3>
        <p className="pc-panel-note">
          Your data lives on this device. Download a complete copy any time, or remove all of it in one calm step.
        </p>
        <div className="pc-actions">
          <button type="button" className="pc-btn pc-btn-export" onClick={handleExport}>
            Export a copy of everything
          </button>
          {!confirmDelete ? (
            <button type="button" className="pc-btn pc-btn-delete" onClick={() => setConfirmDelete(true)}>
              Delete all of my data
            </button>
          ) : (
            <div className="pc-confirm" role="group" aria-label="Confirm deletion">
              <p className="pc-confirm-text">
                This removes everything HerRays holds on this device. There is nothing to rebuild — you can start fresh
                whenever you like.
              </p>
              <div className="pc-confirm-actions">
                <button type="button" className="pc-btn pc-btn-delete" onClick={handleDelete}>
                  Yes, delete it all
                </button>
                <button type="button" className="pc-btn pc-btn-cancel" onClick={() => setConfirmDelete(false)}>
                  Keep my data
                </button>
              </div>
            </div>
          )}
        </div>
        {lastExport !== null && (
          <p className="pc-export-note">
            Copy ready · {formatBytes(lastExport.bytes)}. It is a plain JSON file, readable by you and any tool you trust.
          </p>
        )}
      </section>
    </div>
  )
}
