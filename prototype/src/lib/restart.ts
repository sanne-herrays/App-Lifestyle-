/**
 * TASK-027 — Gentle restart experience.
 *
 * "Offer a non-punitive path after missed days."
 *
 * Acceptance criterion (tasks.json TASK-027):
 *   "After 1, 3 or 7 missed days, restart requires at most two taps and no
 *    guilt/shame copy appears."
 *
 *   - After 1, 3 or 7 missed days → `restartOffer` reads the real completion
 *     ledger (TASK-026 `CompletionEvent[]`), measures the gap in *local calendar
 *     days* between the last recorded win and today, and classifies it into a
 *     warm welcome-back tier whose thresholds are exactly 1, 3 and 7 days.
 *   - Restart requires at most two taps → every tier returns a `steps` plan with
 *     **at most two** steps (resume → complete), and the completing step reuses
 *     the one-gesture `HoldToComplete`. A `MAX_RESTART_TAPS` invariant guards it.
 *   - No guilt/shame copy appears → every user-facing string a tier can produce
 *     is drawn from this module and is verified against a `SHAME_LEXICON` so a
 *     broken streak, a scolding, or a loss-frame can never ship (CLAUDE.md §1).
 *
 * Zero-Guilt restart (CLAUDE.md §1): a longer gap makes the suggested action
 * *smaller and easier*, never harder — the path back is always the most
 * effortless rung (the easier variant, or the tiny floor for a long gap). Nothing
 * is reset as a penalty; past wins are never erased.
 *
 * This module is framework-agnostic and imports no React (only `import type`),
 * so the deterministic suite in `restart.test.ts` can execute it directly under
 * Node's TS stripping, exactly like `ledger.ts` / `recommendation.ts`.
 */

import type { GoalId } from '../flows/flowData'
import type { CompletionEvent, CompletionVariant } from './ledger'

/** Milliseconds in a day — used only to turn a local midnight into a day number. */
export const DAY_MS = 86_400_000

/** The hard ceiling the acceptance criterion names: a restart is at most two taps. */
export const MAX_RESTART_TAPS = 2

/** How far the user has drifted from their last win, bucketed at the 1 / 3 / 7 boundaries. */
export type RestartTier = 'active' | 'short' | 'medium' | 'long'

/**
 * The local-calendar-day number for an instant (days since epoch at *local*
 * midnight). Two instants on the same civil day share a number regardless of the
 * time of day, so day gaps are counted in calendar days, not raw 24h blocks — a
 * win last night and one this morning read as "yesterday", the humane reading.
 */
export function localDayNumber(ms: number): number {
  const d = new Date(ms)
  // new Date(y, m, d) is local midnight of that civil day; flooring its epoch ms
  // by DAY_MS yields a stable, comparable integer day index.
  return Math.floor(new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() / DAY_MS)
}

/** The most recent completion's local day number, or null when there is no history. */
export function lastWinDay(events: readonly CompletionEvent[]): number | null {
  let latest: number | null = null
  for (const e of events) {
    const day = localDayNumber(e.completedAt)
    if (latest === null || day > latest) latest = day
  }
  return latest
}

/**
 * Whole local calendar days between the last recorded win and `now`.
 * 0 = a win already today; 1 = last win yesterday; and so on. Returns null when
 * there is no history at all (a first run is not a "missed day" — it is a start).
 */
export function missedDays(events: readonly CompletionEvent[], now: number): number | null {
  const last = lastWinDay(events)
  if (last === null) return null
  const gap = localDayNumber(now) - last
  return gap > 0 ? gap : 0
}

/**
 * Classify a day gap into a welcome-back tier. Boundaries are exactly the
 * acceptance criterion's 1 / 3 / 7:
 *   gap 0            → active  (a win already today — no restart needed)
 *   gap 1–2          → short   (a day or two away)
 *   gap 3–6          → medium  (a few days away)
 *   gap ≥ 7          → long    (a week or more away)
 */
export function restartTier(gap: number): RestartTier {
  if (gap <= 0) return 'active'
  if (gap < 3) return 'short'
  if (gap < 7) return 'medium'
  return 'long'
}

/** One tap in the restart path. `resume` is a single tap; `complete` is the hold gesture. */
export interface RestartStep {
  kind: 'resume' | 'complete'
  label: string
}

/** The suggested way back in — always the *easiest* feasible rung for the gap. */
export interface RestartAction {
  goalId: GoalId
  title: string
  effort: string
  /** Which ledger variant a completion here records (`easier` or the tiny `floor`). */
  variant: CompletionVariant
}

/** A complete, warm, non-punitive restart offer for the current gap. */
export interface RestartOffer {
  tier: RestartTier
  /** Whole calendar days since the last win (0 when active; see `missedDays`). */
  missedDays: number
  /** True once there is at least one past win — a first run shows a start, not a restart. */
  hasHistory: boolean
  eyebrow: string
  headline: string
  /** The reassurance that removes guilt — the heart of the Zero-Guilt restart. */
  body: string
  /** The always-feasible way back in. */
  action: RestartAction
  /** The ≤ 2-tap path: resume, then complete. */
  steps: readonly RestartStep[]
  /** The warm line shown the moment the restart completes. */
  welcomeBack: string
}

/** Copy bank, per tier. Each longer gap is warmer and lighter, never heavier. */
interface TierCopy {
  eyebrow: string
  headline: string
  body: string
  welcomeBack: string
  /** Which rung to offer back: the easier variant, or the tiniest floor for a long gap. */
  rung: 'easier' | 'floor'
  /** The verb on the single resume tap. */
  resumeLabel: string
}

const START_COPY: TierCopy = {
  eyebrow: 'A fresh start',
  headline: 'Here whenever you are',
  body: 'Pick one tiny thing and we’ll begin together. No history to catch up on — just today.',
  welcomeBack: 'You’ve begun. That’s the whole thing.',
  rung: 'easier',
  resumeLabel: 'Begin with one tiny thing',
}

const TIER_COPY: Record<Exclude<RestartTier, 'active'>, TierCopy> = {
  short: {
    eyebrow: 'Welcome back',
    headline: 'Good to see you',
    body: 'A day or two slips by for everyone. Your wins are all still here — just pick up one tiny thing.',
    welcomeBack: 'And you’re back. Nothing was lost.',
    rung: 'easier',
    resumeLabel: 'Pick up where you left off',
  },
  medium: {
    eyebrow: 'Welcome back',
    headline: 'Right where you left it',
    body: 'A few days away is completely normal. Everything you’ve done is still here. Let’s ease in with something small.',
    welcomeBack: 'Eased back in. That counts, fully.',
    rung: 'easier',
    resumeLabel: 'Ease back in',
  },
  long: {
    eyebrow: 'Welcome back',
    headline: 'So glad you’re here again',
    body: 'However long it’s been, you’re welcome back exactly as you are. We’ll start with the tiniest possible step — nothing to rebuild.',
    welcomeBack: 'You’re here again. That’s everything.',
    rung: 'floor',
    resumeLabel: 'Start gently',
  },
}

/**
 * Resolves a goal + rung to its concrete action copy. Injected (not imported)
 * so the engine carries no runtime dependency on the React-bound `flowData`
 * catalog — the same dependency-injection stance as `recommendation.ts`. The
 * component binds the real `ACTION_BY_GOAL` / `TINY_FLOOR`; the test binds a
 * fixture, so `restartOffer` stays deterministically node-runnable.
 */
export type RungResolver = (goalId: GoalId, rung: 'easier' | 'floor') => { title: string; effort: string }

/** Resolve the easiest feasible rung for a goal at a given tier via the injected catalog. */
function actionForTier(goalId: GoalId, rung: 'easier' | 'floor', resolve: RungResolver): RestartAction {
  const { title, effort } = resolve(goalId, rung)
  return { goalId, title, effort, variant: rung === 'floor' ? 'floor' : 'easier' }
}

/**
 * Build the complete restart offer for the current ledger + clock.
 *
 * `goalId` is the little win the user wants back; it defaults to `move`.
 * `resolveAction` supplies the concrete action copy for a goal + rung. The
 * returned offer is pure (no storage, no clock read, no catalog import) so the
 * whole decision is deterministically testable.
 */
export function restartOffer(
  events: readonly CompletionEvent[],
  now: number,
  goalId: GoalId,
  resolveAction: RungResolver,
): RestartOffer {
  const gapRaw = missedDays(events, now)
  const hasHistory = gapRaw !== null
  const gap = gapRaw ?? 0
  const tier = restartTier(gap)

  // A first run (no history) and an already-active day both show a warm start
  // rather than a restart — never a penalty for having no streak yet.
  const copy: TierCopy = tier === 'active' ? START_COPY : TIER_COPY[tier]
  const action = actionForTier(goalId, copy.rung, resolveAction)

  const steps: readonly RestartStep[] = [
    { kind: 'resume', label: copy.resumeLabel },
    { kind: 'complete', label: `Complete: ${action.title}` },
  ]

  return {
    tier,
    missedDays: gap,
    hasHistory,
    eyebrow: copy.eyebrow,
    headline: copy.headline,
    body: copy.body,
    action,
    steps,
    welcomeBack: copy.welcomeBack,
  }
}

/* ------------------------------------------------- guilt-free copy guard --- */

/**
 * Words and fragments that encode guilt, shame, penalty, or a broken streak.
 * No user-facing restart string may contain any of these (CLAUDE.md §1). The
 * test suite scans every string this module can surface against this lexicon.
 */
export const SHAME_LEXICON: readonly string[] = [
  'fail',
  'failed',
  'failure',
  'missed',
  'miss',
  'streak',
  'broke',
  'broken',
  'penalt',
  'sorry',
  'guilt',
  'shame',
  'lazy',
  'behind',
  'slacked',
  'disappoint',
  'lost your',
  'start over',
  'back to zero',
  'don’t give up',
  "don't give up",
  'excuse',
]

/** True if `text` is free of every shame fragment (case-insensitive). */
export function isGuiltFree(text: string): boolean {
  const lower = text.toLowerCase()
  return !SHAME_LEXICON.some((word) => lower.includes(word))
}

/** Every user-facing string an offer surfaces — the exact set the guard must scan. */
export function offerCopy(offer: RestartOffer): readonly string[] {
  return [
    offer.eyebrow,
    offer.headline,
    offer.body,
    offer.welcomeBack,
    offer.action.title,
    offer.action.effort,
    ...offer.steps.map((s) => s.label),
  ]
}
