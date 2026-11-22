/**
 * TASK-032 — Habit progress visualization.
 *
 * "Show action consistency without punishing broken streaks."
 *
 * Acceptance criterion (tasks.json TASK-032):
 *   "Displays completed opportunities and recovery; missing days never erase past
 *    progress; screen reader summary exists."
 *
 *   - Displays completed opportunities and recovery → `buildProgress` turns the
 *     real completion ledger (TASK-026 `CompletionEvent[]`) into an ordered window
 *     of calendar-day cells. Each day the user showed up is a *completed
 *     opportunity*; a completed day that follows one or more open days (with
 *     earlier history behind it) is flagged as a *recovery* — a gentle return,
 *     celebrated, never scolded.
 *   - Missing days never erase past progress → the all-time totals (`totalWins`,
 *     `totalCompletedDays`) are pure counts over the whole event history, so an
 *     open day can only add nothing — it can never subtract. Advancing the clock
 *     across idle days, or dropping events from the window, leaves every past
 *     completed day completed and every all-time total unchanged or larger. The
 *     `progressViz.test.ts` suite proves this monotonicity directly.
 *   - Screen reader summary exists → `buildProgress` returns a plain-language,
 *     guilt-free `summary` sentence (plus a per-cell `label`) that the surface
 *     renders into a visually-hidden live region, so the whole picture is legible
 *     without seeing the grid.
 *
 * Zero-Guilt (CLAUDE.md §1): there is NO streak counter and NO broken-streak
 * state. An open day is just open — rendered calm and neutral, framed as "nothing
 * here is erased", never red, never a penalty. Every user-facing string this engine
 * can surface is scanned against the shared `isGuiltFree` guard (re-exported from
 * `restart.ts`), so shame, loss, or streak language can never ship.
 *
 * This module is framework-agnostic and imports no React (only `import type`, plus
 * the React-free `localDayNumber` / `isGuiltFree` helpers from `restart.ts`), so
 * the deterministic suite in `progressViz.test.ts` can execute it directly under
 * Node's TS stripping, exactly like `restart.ts` / `journeyPreview.ts`.
 */

import type { CompletionEvent } from './ledger'
import { localDayNumber, isGuiltFree } from './restart.ts'

/** The default window the visualization renders: a calm two weeks of opportunities. */
export const DEFAULT_WINDOW_DAYS = 14

/** The minimum gap (in calendar days) between completed days that reads as a "recovery". */
export const RECOVERY_GAP_DAYS = 2

/** What a single day cell is showing. A completed day is `completed` or `recovery`. */
export type DayState = 'completed' | 'recovery' | 'open' | 'today' | 'before-start'

/** One calendar day in the window. */
export interface ProgressDay {
  /** Local-calendar-day index (see `localDayNumber`). */
  dayNumber: number
  /** Whole days before today: 0 = today, 1 = yesterday, … (always ≥ 0). */
  offset: number
  isToday: boolean
  /** How many wins were logged that day (a day can hold more than one). */
  count: number
  completed: boolean
  /** A completed day that follows a gap, with earlier history behind it — a gentle return. */
  recovery: boolean
  state: DayState
  /** A guilt-free, plain-language accessible label for this cell. */
  label: string
}

/** A complete, honest progress picture for the given ledger + clock. */
export interface ProgressView {
  windowDays: number
  /** Oldest → newest; the last entry is always today. */
  days: readonly ProgressDay[]
  /** Distinct days *in the window* the user showed up — "completed opportunities". */
  completedOpportunities: number
  /** Open days *in the window* after the first win and before today (never "missed"). */
  openDays: number
  /** Gentle returns *in the window*. */
  recoveries: number
  /** All-time wins logged — a pure count over the whole history; never erased. */
  totalWins: number
  /** All-time distinct days with a win; never erased. */
  totalCompletedDays: number
  /** True once there is at least one win anywhere in history. */
  hasHistory: boolean
  headline: string
  /** The honest, guilt-free sentence rendered into the screen-reader live region. */
  summary: string
  encouragement: string
}

/* ------------------------------------------------------------- pure core -- */

/** How many wins fell on each local calendar day, across the whole history. */
function countsByDay(events: readonly CompletionEvent[]): Map<number, number> {
  const counts = new Map<number, number>()
  for (const event of events) {
    const day = localDayNumber(event.completedAt)
    counts.set(day, (counts.get(day) ?? 0) + 1)
  }
  return counts
}

/** The nearest completed day strictly before `day`, or null if there is none. */
function previousCompletedDay(sortedCompletedDays: readonly number[], day: number): number | null {
  let previous: number | null = null
  for (const candidate of sortedCompletedDays) {
    if (candidate >= day) break
    previous = candidate
  }
  return previous
}

/** "Today" / "Yesterday" / "N days ago" — a timezone-safe relative label. */
function relativeLabel(offset: number): string {
  if (offset === 0) return 'Today'
  if (offset === 1) return 'Yesterday'
  return `${offset} days ago`
}

/** The guilt-free per-cell label. Open days are framed as open, never as misses. */
function dayLabel(state: DayState, offset: number, count: number): string {
  const when = relativeLabel(offset)
  switch (state) {
    case 'completed':
      return `${when}: little win logged${count > 1 ? ` (${count})` : ''}.`
    case 'recovery':
      return `${when}: a gentle return — your earlier wins still stand.`
    case 'today':
      return 'Today: open and waiting, no pressure at all.'
    case 'before-start':
      return `${when}: before you began.`
    case 'open':
      return `${when}: an open day — nothing here is erased.`
  }
}

/** Simple pluralizer that never fabricates — just picks the right word. */
function plural(count: number, one: string, many: string): string {
  return count === 1 ? one : many
}

/**
 * Build the full progress view from the ledger and the current clock.
 *
 * Pure: storage and the clock are passed in (`events`, `now`), so the whole
 * picture — including the all-time totals and every per-day flag — is
 * deterministically testable. The window is always exactly `windowDays` cells,
 * oldest first, ending on today.
 */
export function buildProgress(
  events: readonly CompletionEvent[],
  now: number,
  windowDays: number = DEFAULT_WINDOW_DAYS,
): ProgressView {
  const span = Math.max(1, Math.floor(windowDays))
  const counts = countsByDay(events)
  const completedDaysAll = [...counts.keys()].sort((a, b) => a - b)
  const firstWinDay = completedDaysAll[0] ?? null
  const totalWins = events.length
  const totalCompletedDays = completedDaysAll.length
  const hasHistory = totalCompletedDays > 0
  const todayNumber = localDayNumber(now)

  const days: ProgressDay[] = []
  let completedOpportunities = 0
  let openDays = 0
  let recoveries = 0

  // Walk oldest → newest so `days[last]` is always today.
  for (let offset = span - 1; offset >= 0; offset--) {
    const dayNumber = todayNumber - offset
    const isToday = offset === 0
    const count = counts.get(dayNumber) ?? 0
    const completed = count > 0

    let recovery = false
    if (completed) {
      const previous = previousCompletedDay(completedDaysAll, dayNumber)
      recovery = previous !== null && dayNumber - previous >= RECOVERY_GAP_DAYS
    }

    const beforeStart = firstWinDay === null || dayNumber < firstWinDay

    let state: DayState
    if (completed) state = recovery ? 'recovery' : 'completed'
    else if (isToday) state = 'today'
    else if (beforeStart) state = 'before-start'
    else state = 'open'

    if (completed) {
      completedOpportunities++
      if (recovery) recoveries++
    } else if (state === 'open') {
      openDays++
    }

    days.push({
      dayNumber,
      offset,
      isToday,
      count,
      completed,
      recovery,
      state,
      label: dayLabel(state, offset, count),
    })
  }

  const headline = hasHistory ? 'Every little win still counts' : 'Your progress, whenever you start'
  const summary = buildSummary({
    hasHistory,
    span,
    completedOpportunities,
    recoveries,
    totalWins,
    totalCompletedDays,
  })
  const encouragement = buildEncouragement(hasHistory, completedOpportunities)

  return {
    windowDays: span,
    days,
    completedOpportunities,
    openDays,
    recoveries,
    totalWins,
    totalCompletedDays,
    hasHistory,
    headline,
    summary,
    encouragement,
  }
}

interface SummaryInput {
  hasHistory: boolean
  span: number
  completedOpportunities: number
  recoveries: number
  totalWins: number
  totalCompletedDays: number
}

/** The honest screen-reader sentence. Every branch stays guilt-free. */
function buildSummary(input: SummaryInput): string {
  if (!input.hasHistory) {
    return (
      'No little wins logged yet. Today is an open, pressure-free day — complete one tiny action ' +
      'and it’ll appear here and stay for good.'
    )
  }

  const { span, completedOpportunities, recoveries, totalWins, totalCompletedDays } = input
  const returns =
    recoveries > 0
      ? `, including ${recoveries} gentle ${plural(recoveries, 'return', 'returns')} after time away`
      : ''
  const showedUp =
    completedOpportunities > 0
      ? `you showed up on ${completedOpportunities} ${plural(completedOpportunities, 'day', 'days')}${returns}`
      : 'there are no wins logged, and that is completely fine'

  return (
    `In the last ${span} days ${showedUp}. All together you’ve logged ${totalWins} little ` +
    `${plural(totalWins, 'win', 'wins')} across ${totalCompletedDays} ${plural(totalCompletedDays, 'day', 'days')} — ` +
    'and none of them ever go away.'
  )
}

/** A warm closing line; guilt-free in every branch. */
function buildEncouragement(hasHistory: boolean, completedOpportunities: number): string {
  if (!hasHistory) return 'Nothing to catch up on. Just one small thing today, if you’d like.'
  if (completedOpportunities > 0) return 'Open days are simply open — they never erase what you’ve already done.'
  return 'It’s been a little while, and that’s okay. One tiny thing today picks right back up.'
}

/* ----------------------------------------------------- guilt-free guard --- */

/**
 * Every user-facing string a view surfaces — the exact set the shared guilt-free
 * guard must clear. The test scans this across many scenarios and proves the guard
 * is non-trivial (it rejects real streak/shame copy).
 */
export function progressCopy(view: ProgressView): readonly string[] {
  return [view.headline, view.summary, view.encouragement, ...view.days.map((day) => day.label)]
}

/** Re-exported so the component and test share one guilt-free guard (CLAUDE.md §1). */
export { isGuiltFree }
