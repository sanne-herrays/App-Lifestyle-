/**
 * TASK-028 — Habit graduation state machine.
 *
 * "Transition habits through new, practicing, stable and graduated states."
 *
 * Acceptance criterion (tasks.json TASK-028):
 *   "Transition table is documented; unit tests cover every valid transition
 *    and rejected invalid transitions."
 *
 * The transition table (`TRANSITIONS`) below is the single, documented source of
 * truth. `transition(state, event)` is a total function: a listed (state, event)
 * pair advances to its target state; every unlisted pair is *rejected* with a
 * warm, guilt-free reason rather than throwing. `canTransition` and
 * `availableEvents` are derived from the same table, so the machine can never
 * drift from its documentation.
 *
 * Product grounding (PRD §7 "Retention and economics" — habit graduation):
 *   once a behaviour is automatic, reduce prompting, celebrate success, and keep
 *   the user in control. Each state therefore carries an explicit `prompting`
 *   promise that tapers from "a gentle nudge each day" (new) to "no reminders —
 *   it's yours" (graduated).
 *
 * Zero-Guilt (CLAUDE.md §1): the two backward edges (`ease`, `revisit`) only ever
 * fire from an explicit *user choice* — the behavioural evaluator
 * (`evaluateReadiness`) will NEVER suggest them, so a habit is never silently
 * demoted as a penalty, and past progress is never erased. A longer path back is
 * always framed as support, not failure. All user-facing copy this module can
 * surface is scanned against the shared `SHAME_LEXICON`.
 *
 * This module is framework-agnostic and imports no React (only `import type` for
 * the catalog types, plus the React-free `restart` helpers), so the deterministic
 * suite in `habitGraduation.test.ts` can execute it directly under Node's TS
 * stripping, exactly like `restart.ts` / `ledger.ts` / `recommendation.ts`.
 */

import { localDayNumber, isGuiltFree } from './restart.ts'

/* ----------------------------------------------------------------- states -- */

/** The four lifecycle states a habit moves through (PRD §7). */
export type HabitState = 'new' | 'practicing' | 'stable' | 'graduated'

/** Canonical order, least to most automatic — the rail the UI renders. */
export const HABIT_STATES: readonly HabitState[] = ['new', 'practicing', 'stable', 'graduated']

/* ----------------------------------------------------------------- events -- */

/**
 * The events that drive a transition.
 *   - `begin`   : the first real-world win starts active practice.
 *   - `sustain` : consistency gate reached — the habit is becoming steady.
 *   - `graduate`: automaticity confirmed — the habit is self-sustaining.
 *   - `ease`    : user *chooses* more day-to-day support again (not a penalty).
 *   - `revisit` : user *chooses* to bring an automatic habit back into practice.
 */
export type GraduationEvent = 'begin' | 'sustain' | 'graduate' | 'ease' | 'revisit'

/** Canonical event order — advance events first, then the user-choice returns. */
export const GRADUATION_EVENTS: readonly GraduationEvent[] = [
  'begin',
  'sustain',
  'graduate',
  'ease',
  'revisit',
]

/**
 * `advance` moves a habit toward graduation; `return` is a user-chosen step back
 * toward more support. The evaluator only ever suggests `advance` events, so a
 * `return` is always a deliberate choice, never an automatic demotion (§1).
 */
export type TransitionDirection = 'advance' | 'return'

export const EVENT_DIRECTION: Record<GraduationEvent, TransitionDirection> = {
  begin: 'advance',
  sustain: 'advance',
  graduate: 'advance',
  ease: 'return',
  revisit: 'return',
}

/* ------------------------------------------------------- transition table -- */

/**
 * THE DOCUMENTED TRANSITION TABLE — the single source of truth.
 *
 *   from \ event   begin        sustain    graduate     ease          revisit
 *   ───────────────────────────────────────────────────────────────────────────
 *   new            practicing   —          —            —             —
 *   practicing     —            stable     —            —             —
 *   stable         —            —          graduated    practicing    —
 *   graduated      —            —          —            —             practicing
 *
 * Any (state, event) pair NOT listed here is an invalid transition and is
 * rejected by `transition()`. Forward edges: new→practicing→stable→graduated.
 * Backward (user-choice only) edges: stable→practicing (ease),
 * graduated→practicing (revisit) — both land in `practicing`, never `new`, so a
 * habit's history is never wiped back to zero.
 */
export const TRANSITIONS: Readonly<
  Record<HabitState, Readonly<Partial<Record<GraduationEvent, HabitState>>>>
> = {
  new: { begin: 'practicing' },
  practicing: { sustain: 'stable' },
  stable: { graduate: 'graduated', ease: 'practicing' },
  graduated: { revisit: 'practicing' },
}

/** Human-readable verb for each event — used by the surface and rejection copy. */
export const EVENT_LABEL: Record<GraduationEvent, string> = {
  begin: 'Start practicing',
  sustain: 'Mark it steady',
  graduate: 'Graduate this habit',
  ease: 'Add gentle support',
  revisit: 'Practice it again',
}

/** Per-state copy. `prompting` encodes PRD §7's taper from daily nudge → none. */
export interface StateCopy {
  label: string
  summary: string
  /** How much the app prompts in this state — reduces as the habit matures. */
  prompting: string
}

export const STATE_COPY: Record<HabitState, StateCopy> = {
  new: {
    label: 'Just planted',
    summary: 'A brand-new little win, waiting for its first easy day.',
    prompting: 'We’ll offer one gentle nudge a day.',
  },
  practicing: {
    label: 'Practicing',
    summary: 'You’re building it, one easy day at a time.',
    prompting: 'A daily reminder, for as long as it helps.',
  },
  stable: {
    label: 'Steady',
    summary: 'This has become a comfortable part of most days.',
    prompting: 'We’ll start easing off the reminders.',
  },
  graduated: {
    label: 'Graduated',
    summary: 'It runs on its own now — no app required.',
    prompting: 'No reminders. It’s yours to keep.',
  },
}

/**
 * The warm line shown the moment a valid transition lands. Keyed by the same
 * table shape as `TRANSITIONS`, so every valid edge has exactly one message.
 */
export const TRANSITION_MESSAGE: Readonly<
  Record<HabitState, Readonly<Partial<Record<GraduationEvent, string>>>>
> = {
  new: {
    begin: 'You’ve begun. That’s the whole first step.',
  },
  practicing: {
    sustain: 'Lovely — this is becoming steady, so we’ll ease off the nudges a little.',
  },
  stable: {
    graduate: 'Graduated. This one is yours now — we’ll step back and let it run.',
    ease: 'Happy to stay close. We’ll keep the gentle daily nudge going for you.',
  },
  graduated: {
    revisit: 'Back to practising it together — your progress stays exactly as it was.',
  },
}

/* ----------------------------------------------------- transition function -- */

/** A single transition attempt's outcome. Rejections are values, never throws. */
export type TransitionResult =
  | {
      ok: true
      from: HabitState
      event: GraduationEvent
      to: HabitState
      direction: TransitionDirection
      message: string
    }
  | {
      ok: false
      from: HabitState
      event: GraduationEvent
      reason: string
    }

/** Warm, non-scolding explanation for a rejected (invalid) transition (§1). */
function rejectionReason(state: HabitState, event: GraduationEvent): string {
  return `“${EVENT_LABEL[event]}” isn’t available from the ${STATE_COPY[state].label} stage.`
}

/** True iff `event` is a listed (valid) transition from `state`. */
export function canTransition(state: HabitState, event: GraduationEvent): boolean {
  return TRANSITIONS[state][event] !== undefined
}

/**
 * Apply `event` to `state`. A listed pair returns `{ ok: true, to, ... }`; every
 * unlisted pair returns `{ ok: false, reason }`. Total and side-effect-free, so
 * the full table is exhaustively testable.
 */
export function transition(state: HabitState, event: GraduationEvent): TransitionResult {
  const to = TRANSITIONS[state][event]
  if (to === undefined) {
    return { ok: false, from: state, event, reason: rejectionReason(state, event) }
  }
  const message = TRANSITION_MESSAGE[state][event] ?? ''
  return { ok: true, from: state, event, to, direction: EVENT_DIRECTION[event], message }
}

/** The events that are valid from `state`, in canonical order. */
export function availableEvents(state: HabitState): readonly GraduationEvent[] {
  return GRADUATION_EVENTS.filter((event) => canTransition(state, event))
}

/* ------------------------------------------------- behavioural evaluator --- */

/**
 * Thresholds that decide when a *forward* step is earned. Defaults reflect PRD §7
 * / §5: judge consistency over a rolling two-week window, and treat a habit as
 * "steady" once it has been performed on a clear majority of days in that window.
 */
export interface GraduationConfig {
  /** Rolling window (calendar days, ending today) used to judge consistency. */
  windowDays: number
  /** Distinct active days within the window needed to move practicing → stable. */
  sustainActiveDays: number
}

export const DEFAULT_GRADUATION_CONFIG: GraduationConfig = {
  windowDays: 14,
  sustainActiveDays: 7,
}

/** The evidence the evaluator reads — all plain counts, no raw health detail. */
export interface ReadinessInput {
  state: HabitState
  /** Has the habit ever been completed at least once? */
  hasAnyWin: boolean
  /** Distinct calendar days with ≥1 win inside the consistency window. */
  activeDaysInWindow: number
  /**
   * The user's own signal that the habit now feels automatic (e.g. the TASK-035
   * automaticity survey, or an explicit "this feels automatic" tap). Graduation
   * is never granted on counts alone — PRD §7 graduates "once a behaviour is
   * automatic", which only the user can confirm.
   */
  automaticityConfirmed: boolean
}

export interface ReadinessReport {
  /** The forward event the evidence supports, or null. NEVER a `return` event. */
  suggestedEvent: GraduationEvent | null
  /** True when `suggestedEvent` is non-null. */
  ready: boolean
  /** A warm, guilt-free explanation of where things stand. */
  rationale: string
}

/**
 * Count the distinct calendar days with a win inside a window of `windowDays`
 * calendar days ending on `now`'s local day (inclusive). Reuses `localDayNumber`
 * from `restart.ts` so "a win last night + one this morning" counts the humane
 * way — one civil day, not two 24h blocks. Pure; safe to run under Node.
 */
export function activeDaysInWindow(
  timestamps: readonly number[],
  now: number,
  windowDays: number,
): number {
  const today = localDayNumber(now)
  const earliest = today - (windowDays - 1)
  const days = new Set<number>()
  for (const ts of timestamps) {
    const day = localDayNumber(ts)
    if (day >= earliest && day <= today) days.add(day)
  }
  return days.size
}

/**
 * Decide which *forward* step (if any) the current evidence supports, and why.
 * This is the only place readiness is judged; it deliberately never suggests
 * `ease` or `revisit`, so the machine can advance automatically on earned
 * evidence but only ever steps *back* on a deliberate user choice (§1).
 */
export function evaluateReadiness(
  input: ReadinessInput,
  config: GraduationConfig = DEFAULT_GRADUATION_CONFIG,
): ReadinessReport {
  const { state, hasAnyWin, activeDaysInWindow: active, automaticityConfirmed } = input
  const need = config.sustainActiveDays

  switch (state) {
    case 'new':
      return hasAnyWin
        ? { suggestedEvent: 'begin', ready: true, rationale: 'You’ve done it once — practice has begun.' }
        : {
            suggestedEvent: null,
            ready: false,
            rationale: 'Whenever you’re ready, one tiny win starts things off. No rush.',
          }

    case 'practicing':
      return active >= need
        ? {
            suggestedEvent: 'sustain',
            ready: true,
            rationale: `Steady for ${active} of the last ${config.windowDays} days — this is becoming a habit.`,
          }
        : {
            suggestedEvent: null,
            ready: false,
            rationale: `You’ve shown up on ${active} of ${need} days — keep going gently, at your own pace.`,
          }

    case 'stable':
      return automaticityConfirmed
        ? {
            suggestedEvent: 'graduate',
            ready: true,
            rationale: 'It feels automatic now — ready to graduate whenever you are.',
          }
        : {
            suggestedEvent: null,
            ready: false,
            rationale: 'Settling in nicely. We’ll suggest graduating once it feels automatic to you.',
          }

    case 'graduated':
      return {
        suggestedEvent: null,
        ready: false,
        rationale: 'This habit runs on its own now. Nothing more to do — enjoy it.',
      }
  }
}

/* -------------------------------------------------------- guilt-free guard -- */

/**
 * Every user-facing string the machine can surface — the exact set the §1
 * guilt-free guard must scan. `inputs` lets callers (the test) fold in the
 * rationale strings the evaluator produces across representative evidence.
 */
export function allGraduationCopy(extra: readonly string[] = []): readonly string[] {
  const stateStrings = HABIT_STATES.flatMap((state) => {
    const copy = STATE_COPY[state]
    return [copy.label, copy.summary, copy.prompting]
  })
  const eventStrings = GRADUATION_EVENTS.map((event) => EVENT_LABEL[event])
  const transitionStrings = HABIT_STATES.flatMap((state) =>
    availableEvents(state).map((event) => {
      const result = transition(state, event)
      return result.ok ? result.message : result.reason
    }),
  )
  const rejectionStrings = HABIT_STATES.flatMap((state) =>
    GRADUATION_EVENTS.filter((event) => !canTransition(state, event)).map((event) => {
      const result = transition(state, event)
      return result.ok ? '' : result.reason
    }),
  )
  return [...stateStrings, ...eventStrings, ...transitionStrings, ...rejectionStrings, ...extra]
}

/** Re-export the shared guard so the surface and tests share one lexicon. */
export { isGuiltFree }
