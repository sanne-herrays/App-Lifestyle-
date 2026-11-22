/**
 * TASK-031 — Seven-day journey preview.
 *
 * "Show users how tiny actions could evolve across a week."
 *
 * Acceptance criterion (tasks.json TASK-031):
 *   "Preview renders seven days, explains gradual progression and makes no
 *    unsupported health-outcome promises."
 *
 *   - Renders seven days → `buildJourney` always returns exactly `JOURNEY_DAYS`
 *     (7) days, numbered 1…7 in order.
 *   - Explains gradual progression → the week follows a fixed, strictly
 *     NON-DECREASING rung schedule (`RUNG_SCHEDULE`) that never climbs by more
 *     than one rung at a time and settles before it grows. The step is clamped to
 *     the ladder's own ceiling, so the preview never invents content beyond the
 *     reviewed catalog. Each day carries a plain `note` that says *why* this day
 *     repeats or grows.
 *   - Makes no unsupported health-outcome promises → every user-facing string the
 *     journey can surface is scanned against `HEALTH_PROMISE_LEXICON` (disease-risk
 *     reduction, cures/treatment, quantified/metabolic outcomes, timeline
 *     promises). The copy stays experiential and about *showing up*, never about a
 *     clinical result (CLAUDE.md §3 / the catalog's §5.2 forbidden framings).
 *
 * Zero-Guilt (CLAUDE.md §1): the week is explicitly "one way it could unfold",
 * optional and entirely the user's — some days simply repeat, and growing a step
 * is only ever suggested once the smaller one already feels easy. All copy also
 * passes the shared `isGuiltFree` guard.
 *
 * The ladder *content* lives in `flowData.challengeLadder` (so day 1 reuses the
 * shared `ACTION_BY_GOAL` catalog, the single source of truth). This engine works
 * on rung indices via an injected resolver, so it imports no React (only
 * `import type` for `GoalId`, plus the React-free `isGuiltFree` guard) and the
 * deterministic suite in `journeyPreview.test.ts` can execute it directly under
 * Node's TS stripping, exactly like `restart.ts` / `challenge.ts`.
 */

import type { GoalId } from '../flows/flowData'
import { isGuiltFree } from './restart.ts'

/** The acceptance criterion's fixed horizon: the preview renders seven days. */
export const JOURNEY_DAYS = 7

/** One level of a goal's progression — structurally the shared ladder rung shape. */
export interface JourneyRung {
  title: string
  effort: string
}

/**
 * Supplies a goal's ascending ladder (gentlest rung first). Injected — not
 * imported — so this engine carries no runtime dependency on the React-bound
 * `flowData`. The component binds the real `challengeLadder`; the test binds a
 * fixture, so `buildJourney` stays deterministically node-runnable (the same
 * dependency-injection stance as `restart.ts`).
 */
export type LadderResolver = (goal: GoalId) => readonly JourneyRung[]

/**
 * The gentle, strictly NON-DECREASING rung schedule across the week. Settle on
 * the smallest version for three days to let the cue take root, ease up one rung,
 * settle again, then offer one more optional step on day seven. It never climbs by
 * more than a single rung, and it is clamped to each goal's ladder ceiling in
 * `buildJourney`, so a shorter ladder simply plateaus rather than inventing a step
 * past the reviewed content.
 */
export const RUNG_SCHEDULE: readonly number[] = [0, 0, 0, 1, 1, 1, 2]

/** What a given day is doing in the arc. */
export type JourneyPhase = 'plant' | 'settle' | 'grow'

/** A short badge label for each phase (used by the surface). */
export const PHASE_LABEL: Record<JourneyPhase, string> = {
  plant: 'Plant it',
  settle: 'Let it settle',
  grow: 'A little more',
}

/**
 * The gentle, general-benefit "why this day" line for each phase. Nothing here
 * promises a health outcome; the note is about showing up and letting the step
 * settle, with any growth framed as fully optional (CLAUDE.md §1 / §3).
 */
export const PHASE_NOTE: Record<JourneyPhase, string> = {
  plant: 'Start with the smallest version. Turning up is the whole win today.',
  settle: 'The same small step. Letting it settle into your day is the point — not doing more.',
  grow: 'A touch bigger today — try it only if the smaller step already feels easy, and ease back anytime.',
}

/** One day in the illustrative week. */
export interface JourneyDay {
  /** 1…7, in order. */
  day: number
  phase: JourneyPhase
  title: string
  effort: string
  /** The gentle, health-promise-free reason this day repeats or grows. */
  note: string
}

/** A complete, honest seven-day preview for one goal. */
export interface Journey {
  goalId: GoalId
  days: readonly JourneyDay[]
  /** Explains the gradual progression up front (criterion clause 2). */
  progressionNote: string
  /** An experiential closing line — never an outcome promise. */
  closing: string
}

/** Explains the gradual, optional nature of the week before the days are read. */
export const PROGRESSION_NOTE =
  'Here’s one way a week could unfold — gentle, optional, and entirely yours. The step only grows once the ' +
  'small version already feels easy, and never by more than a little. Some days simply repeat; that’s the point.'

/** Honest, experiential sign-off — about possibility and showing up, not results. */
export const CLOSING =
  'However your week actually goes, every small turn-up counts the same. This is a picture of what’s possible, ' +
  'not a plan you owe anyone.'

/** The only value an index guard can fall back to; never reached for a non-empty ladder. */
const FALLBACK_RUNG: JourneyRung = { title: 'One tiny step', effort: 'a moment' }

/**
 * Build the seven-day preview for a goal from its injected ladder.
 *
 * The result is pure (no storage, no clock, no catalog import), so the whole
 * preview is deterministically testable. The returned days are always length
 * `JOURNEY_DAYS`, numbered 1…7, with a non-decreasing rung clamped to the ladder
 * ceiling and a phase derived from whether the rung grew since the day before.
 */
export function buildJourney(goal: GoalId, resolveLadder: LadderResolver): Journey {
  const ladder = resolveLadder(goal)
  const ceiling = Math.max(0, ladder.length - 1)
  const days: JourneyDay[] = []
  let prevRung = -1

  for (let i = 0; i < JOURNEY_DAYS; i++) {
    const scheduled = RUNG_SCHEDULE[i] ?? ceiling
    const rung = Math.min(scheduled, ceiling)
    const rungData = ladder[rung] ?? ladder[0] ?? FALLBACK_RUNG
    const phase: JourneyPhase = i === 0 ? 'plant' : rung > prevRung ? 'grow' : 'settle'
    days.push({
      day: i + 1,
      phase,
      title: rungData.title,
      effort: rungData.effort,
      note: PHASE_NOTE[phase],
    })
    prevRung = rung
  }

  return { goalId: goal, days, progressionNote: PROGRESSION_NOTE, closing: CLOSING }
}

/* ------------------------------------------- no-unsupported-promise guard --- */

/**
 * Fragments that encode an unsupported health-OUTCOME promise — individual
 * disease-risk reduction, a cure/treatment, a quantified or metabolic result, or
 * a timeline guarantee. No string this preview surfaces may contain any of these
 * (CLAUDE.md §3; mirrors the catalog's §5.2 universally-forbidden framings). The
 * test scans every journey string against this lexicon.
 *
 * Fragments are deliberately specific (e.g. `reduces your risk`, `boosts your
 * immun`) so the guard flags genuine outcome claims without tripping on benign,
 * general-benefit language.
 */
export const HEALTH_PROMISE_LEXICON: readonly string[] = [
  'prevent',
  'prevents',
  'prevention',
  'cure',
  'cures',
  'cured',
  'treats',
  'treat your',
  'treatment',
  'heals',
  'healed',
  'reduce your risk',
  'reduces your risk',
  'lower your risk',
  'lowers your risk',
  'risk of',
  'disease',
  'diagnos',
  'symptom',
  'boost your immun',
  'boosts your immun',
  'immunity',
  'detox',
  'burn fat',
  'burns fat',
  'burn calories',
  'weight loss',
  'lose weight',
  'blood pressure',
  'cholesterol',
  'cortisol',
  'blood sugar',
  'clinically proven',
  'proven to',
  'guarantee',
  'add years',
  'live longer',
  'reverses',
  'in 21 days',
]

/** True if `text` is free of every unsupported health-outcome fragment (case-insensitive). */
export function isPromiseSafe(text: string): boolean {
  const lower = text.toLowerCase()
  return !HEALTH_PROMISE_LEXICON.some((fragment) => lower.includes(fragment))
}

/**
 * Every user-facing string a journey surfaces — the exact set the promise guard
 * and the shared guilt-free guard must both clear.
 */
export function journeyCopy(journey: Journey): readonly string[] {
  return [
    journey.progressionNote,
    journey.closing,
    ...journey.days.flatMap((d) => [d.title, d.effort, d.note]),
  ]
}

/** Re-exported so the component and test share one guilt-free guard (CLAUDE.md §1). */
export { isGuiltFree }
