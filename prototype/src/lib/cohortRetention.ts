/**
 * TASK-034 — Cohort retention dashboard.
 *
 * "Calculate D1, D7, D30 and D90 app and behavior retention separately."
 *
 * Acceptance criterion (tasks.json TASK-034):
 *   "Cohort definitions documented; test dataset yields expected rates;
 *    incomplete cohorts marked immature."
 *
 *   - Cohort definitions documented → the exact meaning of a cohort, its day 0,
 *     the two retention metrics, the classic day-N measure, the denominator and
 *     maturity are specified both in the prose header below and as a
 *     machine-readable `COHORT_DEFINITIONS` artifact that `cohortRetention.test.ts`
 *     asserts is non-empty and well-formed — so the documentation cannot silently
 *     rot away from the code.
 *   - Test dataset yields expected rates → the pure `buildRetention` engine is
 *     exercised by a shared, documented `SAMPLE_RETENTION_DATASET` whose every
 *     per-cohort and pooled rate is hand-computed and asserted in the suite. The
 *     dashboard surface renders that *same* verified dataset, so the UI shows real,
 *     checked arithmetic, honestly labelled illustrative (CLAUDE.md §3 — never
 *     fabricated numbers passed off as a live population).
 *   - Incomplete cohorts marked immature → a cohort's day-N rate is only reported
 *     once the observation window for day N has closed for that cohort
 *     (`asOfDay - cohortDay >= N`). Until then the rate is `null` and `mature` is
 *     false — never a misleadingly-low number from an unfinished window.
 *
 * ── The two retention outcomes (PRD §7) ───────────────────────────────────────
 * PRD §7 asks for three *separately* measured outcomes: app retention, real-world
 * behavior retention and commercial retention. This engine computes the first two
 * side by side so they are directly comparable (commercial/renewal retention is
 * the subscription-economics model's job — TASK-038):
 *
 *   - APP retention      — did the anonymous user *open the app* on day N?
 *   - BEHAVIOR retention — did they complete a real-world *little win* on day N?
 *
 * Both are anchored to the **same** cohort day (the user's first-seen day), so the
 * gap between "still opening the app" and "still doing the action" is visible — the
 * product's whole thesis is that behavior retention, not app engagement, is what
 * matters (PRD principle 3 / §7 "do not optimise compulsive app use").
 *
 * ── Definitions used here ──────────────────────────────────────────────────────
 *   - Cohort              — the set of users whose first-seen day is the same local
 *                           calendar day. That shared day is the cohort's **day 0**.
 *   - First-seen day      — the earliest local day on which we saw the user at all
 *                           (app open or completion), i.e. min of their active days.
 *   - Day-N retention     — classic / bracket retention: the fraction of the cohort
 *                           that was active **on the calendar day exactly N days
 *                           after day 0** (not "on or after"). Crisp and verifiable.
 *   - Denominator         — the full cohort size (everyone who joined that day),
 *                           never only the users who happened to return.
 *   - Mature / immature   — a cohort can report DN only once at least N days have
 *                           elapsed since day 0 (`asOfDay - cohortDay >= N`).
 *                           Otherwise the DN window is still open → immature.
 *
 * Framework-agnostic: imports no React (only the React-free `isGuiltFree` guard with
 * a `.ts` specifier), so the deterministic suite in `cohortRetention.test.ts` runs it
 * directly under Node's TS stripping, exactly like `ledger.ts` / `activation.ts`.
 * The one React hook the UI needs lives in the component; the clock is read there.
 */

import { isGuiltFree } from './restart.ts'

export { isGuiltFree }

/** The four retention horizons the task names, in ascending order. */
export const RETENTION_HORIZONS = [1, 7, 30, 90] as const
export type RetentionHorizon = (typeof RETENTION_HORIZONS)[number]

/** The two outcomes measured separately (PRD §7). */
export type RetentionMetric = 'app' | 'behavior'
export const RETENTION_METRICS: readonly RetentionMetric[] = ['app', 'behavior']

/**
 * One anonymous user's activity, as local day numbers (see `localDayNumber` in
 * `restart.ts`). `appActiveDays` are days the app was opened; `behaviorDays` are
 * days a real-world little win was completed. No identity, no raw health detail —
 * just the coarse day indices a retention calculation needs.
 */
export interface RetentionUser {
  userKey: string
  appActiveDays: readonly number[]
  behaviorDays: readonly number[]
}

/** The furthest-back day we've observed the user at all — their cohort day (day 0). */
export function firstSeenDay(user: RetentionUser): number | null {
  let earliest: number | null = null
  for (const day of [...user.appActiveDays, ...user.behaviorDays]) {
    if (earliest === null || day < earliest) earliest = day
  }
  return earliest
}

/** The day-number set for a metric (which days "count" as active for that outcome). */
function activeDaysFor(user: RetentionUser, metric: RetentionMetric): readonly number[] {
  return metric === 'app' ? user.appActiveDays : user.behaviorDays
}

/* ============================================================ pure core ===== */

/** One horizon's result for one cohort + metric. */
export interface RetentionCell {
  horizon: RetentionHorizon
  /** True once the day-N window has closed for this cohort (`asOfDay - cohortDay >= N`). */
  mature: boolean
  /** How many cohort members were active on day N. 0 while immature (window still open). */
  retained: number
  /** Cohort size — the denominator for this rate (constant across horizons). */
  size: number
  /** retained / size in [0,1], or `null` while the cohort is immature for this horizon. */
  rate: number | null
}

/** One cohort row: its day-0, size, and the app + behavior cells per horizon. */
export interface CohortRow {
  /** The shared first-seen day number — this cohort's day 0. */
  cohortDay: number
  /** Whole days elapsed since day 0 as of the report (`asOfDay - cohortDay`). */
  daysElapsed: number
  /** Number of users in the cohort — the denominator. */
  size: number
  /** App-retention cells, aligned to `RETENTION_HORIZONS`. */
  app: readonly RetentionCell[]
  /** Behavior-retention cells, aligned to `RETENTION_HORIZONS`. */
  behavior: readonly RetentionCell[]
}

/** A pooled summary across all cohorts that are mature for one metric + horizon. */
export interface OverallCell {
  metric: RetentionMetric
  horizon: RetentionHorizon
  /** How many cohorts were mature enough to contribute to this pooled rate. */
  matureCohorts: number
  /** Pooled denominator — total users across the contributing (mature) cohorts. */
  usersIncluded: number
  /** Pooled numerator — total retained users across those cohorts. */
  retained: number
  /** Pooled rate in [0,1], or `null` when no cohort is yet mature for this horizon. */
  rate: number | null
}

/** The full retention report for a dataset as of a given day. */
export interface RetentionReport {
  /** The local day number the report was computed as of. */
  asOfDay: number
  /** How many users were included (had at least one observed day). */
  userCount: number
  /** Per-cohort rows, newest cohort first. */
  cohorts: readonly CohortRow[]
  /** Pooled-across-mature-cohorts summaries, aligned to `RETENTION_HORIZONS`. */
  overall: { app: readonly OverallCell[]; behavior: readonly OverallCell[] }
}

/** Build the per-cohort cells for one metric. */
function cellsForCohort(
  members: readonly RetentionUser[],
  cohortDay: number,
  asOfDay: number,
  metric: RetentionMetric,
): RetentionCell[] {
  const size = members.length
  // Pre-hash each member's active days for O(1) day-N lookups.
  const sets = members.map((u) => new Set(activeDaysFor(u, metric)))
  return RETENTION_HORIZONS.map((horizon) => {
    const mature = asOfDay - cohortDay >= horizon
    if (!mature) {
      return { horizon, mature: false, retained: 0, size, rate: null }
    }
    const targetDay = cohortDay + horizon
    let retained = 0
    for (const set of sets) if (set.has(targetDay)) retained += 1
    return { horizon, mature: true, retained, size, rate: size === 0 ? null : retained / size }
  })
}

/** Pool one metric + horizon across the cohorts that are mature for it. */
function overallFor(
  cohorts: readonly CohortRow[],
  metric: RetentionMetric,
  horizonIndex: number,
  horizon: RetentionHorizon,
): OverallCell {
  let matureCohorts = 0
  let usersIncluded = 0
  let retained = 0
  for (const cohort of cohorts) {
    const cell = (metric === 'app' ? cohort.app : cohort.behavior)[horizonIndex]
    if (!cell || !cell.mature) continue
    matureCohorts += 1
    usersIncluded += cell.size
    retained += cell.retained
  }
  return {
    metric,
    horizon,
    matureCohorts,
    usersIncluded,
    retained,
    rate: usersIncluded === 0 ? null : retained / usersIncluded,
  }
}

/**
 * Compute the full cohort-retention report for a set of users as of `asOfDay`.
 *
 * Pure and deterministic — no clock read, no storage. Users with no observed day
 * at all are skipped (they were never "seen", so they belong to no cohort). The
 * result groups users into day-0 cohorts, computes app + behavior day-N retention
 * for each, marks immature horizons, and pools the mature cohorts into an overall.
 */
export function buildRetention(
  users: readonly RetentionUser[],
  asOfDay: number,
): RetentionReport {
  // Group users by their first-seen day (the cohort day). Skip the never-seen.
  const byCohort = new Map<number, RetentionUser[]>()
  let userCount = 0
  for (const user of users) {
    const day = firstSeenDay(user)
    if (day === null) continue
    userCount += 1
    const bucket = byCohort.get(day)
    if (bucket) bucket.push(user)
    else byCohort.set(day, [user])
  }

  const cohorts: CohortRow[] = [...byCohort.entries()]
    .sort((a, b) => b[0] - a[0]) // newest cohort first
    .map(([cohortDay, members]) => ({
      cohortDay,
      daysElapsed: asOfDay - cohortDay,
      size: members.length,
      app: cellsForCohort(members, cohortDay, asOfDay, 'app'),
      behavior: cellsForCohort(members, cohortDay, asOfDay, 'behavior'),
    }))

  const overall = {
    app: RETENTION_HORIZONS.map((h, i) => overallFor(cohorts, 'app', i, h)),
    behavior: RETENTION_HORIZONS.map((h, i) => overallFor(cohorts, 'behavior', i, h)),
  }

  return { asOfDay, userCount, cohorts, overall }
}

/* ----------------------------------------------- documented cohort definitions -- */

/** One documented term behind the dashboard — the "cohort definitions documented" artifact. */
export interface CohortDefinition {
  term: string
  definition: string
}

/**
 * The cohort definitions, documented as a verifiable artifact (not just a comment).
 * `cohortRetention.test.ts` asserts this is non-empty, that every entry has a term
 * and a definition, and that both named metrics and the maturity rule are covered —
 * so "cohort definitions documented" is enforced, not asserted in prose alone.
 */
export const COHORT_DEFINITIONS: readonly CohortDefinition[] = [
  {
    term: 'Cohort',
    definition:
      'The group of anonymous users whose first-seen day is the same local calendar day. That shared day is the cohort’s day 0.',
  },
  {
    term: 'First-seen day (day 0)',
    definition:
      'The earliest local day on which a user was observed at all — an app open or a completion, whichever came first.',
  },
  {
    term: 'App retention',
    definition:
      'The fraction of a cohort that opened the app on day N. Measures whether people keep coming back to the surface.',
  },
  {
    term: 'Behavior retention',
    definition:
      'The fraction of a cohort that completed a real-world little win on day N. This is the outcome that matters — repetition of the action, not app opens.',
  },
  {
    term: 'Day-N retention (classic)',
    definition:
      'Activity on the calendar day exactly N days after day 0 — bracket retention, measured here at D1, D7, D30 and D90. Not “on or after day N”.',
  },
  {
    term: 'Denominator',
    definition:
      'Always the full cohort size — everyone who joined that day — so a rate is never inflated by counting only the users who returned.',
  },
  {
    term: 'Mature vs immature',
    definition:
      'A cohort can report DN only once at least N days have elapsed since day 0 (asOfDay − cohortDay ≥ N). Until then the window is still open, so DN is marked immature and no rate is shown.',
  },
]

/* ---------------------------------------------------- PRD §7 hypothesis targets -- */

/**
 * The illustrative retention targets from PRD §7 — labelled *hypotheses to validate,
 * not guarantees*. Only the (metric, horizon) pairs the PRD actually states a number
 * for are present; everything else is intentionally left without a target.
 *   - behavior D1  → "first real action within 24 hours", 65%+
 *   - app D7/D30/D90 → the PRD retention table, 45% / 30% / 20%
 */
export interface HypothesisTarget {
  metric: RetentionMetric
  horizon: RetentionHorizon
  target: number
  note: string
}

export const HYPOTHESIS_TARGETS: readonly HypothesisTarget[] = [
  { metric: 'behavior', horizon: 1, target: 0.65, note: 'First real action within 24 hours (PRD §7).' },
  { metric: 'app', horizon: 7, target: 0.45, note: 'Day 7 retention hypothesis (PRD §7).' },
  { metric: 'app', horizon: 30, target: 0.3, note: 'Day 30 retention hypothesis (PRD §7).' },
  { metric: 'app', horizon: 90, target: 0.2, note: 'Day 90 retention hypothesis (PRD §7).' },
]

/** Look up a hypothesis target for a metric + horizon, or null if PRD states none. */
export function hypothesisTarget(
  metric: RetentionMetric,
  horizon: RetentionHorizon,
): HypothesisTarget | null {
  return HYPOTHESIS_TARGETS.find((t) => t.metric === metric && t.horizon === horizon) ?? null
}

/* ----------------------------------------------------------------- formatting -- */

/** Format a rate in [0,1] as a whole-percent string, or an em dash when immature. */
export function formatRate(rate: number | null): string {
  if (rate === null) return '—'
  return `${Math.round(rate * 100)}%`
}

/** The human label for a metric. */
export const METRIC_LABEL: Record<RetentionMetric, string> = {
  app: 'App retention',
  behavior: 'Behavior retention',
}

/** Every piece of copy the dashboard surfaces, for the guilt-free scan (CLAUDE.md §1). */
export function retentionCopy(): readonly string[] {
  return [
    'Cohort retention',
    'App opens and real-world little wins, measured separately and side by side.',
    'Behavior retention — people still doing the action — is the one that matters.',
    'Open windows are shown as maturing, never as a low score.',
    'A cohort only reports a day once that day has fully arrived for everyone in it.',
    ...COHORT_DEFINITIONS.flatMap((d) => [d.term, d.definition]),
    ...Object.values(METRIC_LABEL),
  ]
}

/* ========================================= shared, documented sample dataset === */
/* The acceptance criterion asks for a test dataset that yields expected rates. This
 * is that dataset — exported so the deterministic suite verifies its every rate AND
 * the dashboard renders the exact same verified numbers (honestly labelled
 * illustrative, never passed off as a live population; CLAUDE.md §3). */

/** The fixed "as of" day the sample is computed against (an abstract local day index). */
export const SAMPLE_AS_OF_DAY = 20000

const A = SAMPLE_AS_OF_DAY - 100 // a fully-mature cohort: 100 days elapsed (≥ 90)
const B = SAMPLE_AS_OF_DAY - 5 //   a young cohort: 5 days elapsed (D1 mature, D7+ immature)

/**
 * Two illustrative cohorts of anonymous users. Cohort A (started 100 days ago) is
 * mature for every horizon; cohort B (started 5 days ago) is mature only for D1, so
 * it demonstrates the "incomplete cohorts marked immature" requirement. Every rate
 * these produce is hand-computed in `cohortRetention.test.ts`.
 */
export const SAMPLE_RETENTION_DATASET: readonly RetentionUser[] = [
  // ── Cohort A — day 0 is A, fully mature ──
  { userKey: 'anon-a1', appActiveDays: [A, A + 1, A + 7, A + 30, A + 90], behaviorDays: [A, A + 1, A + 7] },
  { userKey: 'anon-a2', appActiveDays: [A, A + 1, A + 7, A + 30], behaviorDays: [A, A + 7, A + 30] },
  { userKey: 'anon-a3', appActiveDays: [A, A + 1, A + 30, A + 90], behaviorDays: [A] },
  { userKey: 'anon-a4', appActiveDays: [A, A + 90], behaviorDays: [] },
  // ── Cohort B — day 0 is B, young (immature past D1) ──
  { userKey: 'anon-b1', appActiveDays: [B, B + 1], behaviorDays: [B, B + 1] },
  { userKey: 'anon-b2', appActiveDays: [B], behaviorDays: [B] },
]
