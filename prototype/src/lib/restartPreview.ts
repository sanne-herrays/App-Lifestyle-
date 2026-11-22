/**
 * TASK-027 — Gentle restart preview clock (pure, node-runnable helper).
 *
 * The gentle-restart surface (`GentleRestart.tsx`) lets a reviewer preview the
 * 1 / 3 / 7-day welcome-back states even when the prototype ledger is fresh. That
 * preview overrides only the *displayed* clock — it never fabricates real ledger
 * events. This helper owns that clock math as a single pure function so the exact
 * value the surface renders can be asserted deterministically in `restart.test.ts`
 * (it previously lived inline in the component, where a doubled-gap regression
 * could — and did — slip past the engine tests).
 *
 * The contract, in both paths, is simple and guarded by tests: the gap the engine
 * reads MUST equal `previewDays`.
 *
 *   - Real history → anchor the preview `now` exactly `previewDays` after the most
 *     recent real win, and pass the real events straight through. Gap =
 *     `previewDays`, measured from the genuine last win; a real absence wider than
 *     the preview is honoured because `now` moves forward from the real latest.
 *   - No history → there is nothing to measure a gap against, so seed a single
 *     display-only "anchor" win at `mountClock` and advance `now` to
 *     `mountClock + previewDays` days. Gap = `previewDays`. The anchor is clearly a
 *     preview fixture (`id: 'preview-anchor'`) and is never written to the ledger.
 *   - `previewDays <= 0` ("Today") → no gap to preview; pass the real events
 *     through unchanged (a fresh ledger then reads as a warm first-run start).
 *
 * Framework-agnostic: imports no React and only `import type` from `ledger` /
 * `flowData` (erased at runtime), so it runs under Node's TS stripping exactly
 * like the engine it feeds.
 */

import type { GoalId } from '../flows/flowData'
import type { CompletionEvent } from './ledger'
import { DAY_MS } from './restart.ts'

/** The display-only clock the restart surface feeds into `restartOffer`. */
export interface PreviewClock {
  /** The "now" the engine should measure the gap against. */
  now: number
  /** The events the engine should read — the real ledger, or a single preview anchor. */
  events: readonly CompletionEvent[]
}

/**
 * Compute the preview clock for the gentle-restart surface.
 *
 * `realEvents` is the live ledger; `previewDays` is the selected chip (0/1/3/7);
 * `goalId` + `anchorTitle` describe the display-only anchor win used only on a
 * fresh ledger; `mountClock` is the wall clock captured once at mount.
 *
 * Invariant (asserted in `restart.test.ts`): for `previewDays > 0`, the gap the
 * engine reads from the returned `{ events, now }` equals `previewDays` in BOTH
 * the real-history and the no-history paths.
 */
export function previewClock(
  realEvents: readonly CompletionEvent[],
  previewDays: number,
  goalId: GoalId,
  anchorTitle: string,
  mountClock: number,
): PreviewClock {
  const latest = realEvents.reduce((max, e) => (e.completedAt > max ? e.completedAt : max), 0)
  const base = latest > 0 ? latest : mountClock
  const now = base + previewDays * DAY_MS

  // Real history, or the "Today" preset: measure against the real ledger as-is.
  if (realEvents.length > 0 || previewDays <= 0) {
    return { now, events: realEvents }
  }

  // No real history: seed one display-only anchor win at `mountClock` so the gap
  // the engine reads is exactly `previewDays` (now = mountClock + previewDays·DAY).
  const anchorAt = mountClock
  const anchor: CompletionEvent = {
    id: 'preview-anchor',
    clientKey: 'preview-anchor',
    goalId,
    actionTitle: anchorTitle,
    variant: 'full',
    completedAt: anchorAt,
    syncState: 'synced',
    syncedAt: anchorAt,
    schemaVersion: 1,
  }
  return { now, events: [anchor] }
}
