/**
 * TASK-025 — Action recommendation rules.
 *
 * Acceptance criterion (tasks.json TASK-025):
 *   "Deterministic test cases cover goal fit, time availability,
 *    contraindication exclusions and no-match fallback."
 *
 * This is the pure selection engine that reads the TASK-024 evidence-reviewed
 * catalog (`actionCatalog.ts`) and picks ONE suitable micro-action from the
 * user's *explicit* preferences (goal, time available) and *explicit* exclusions
 * (declared contraindication contexts, opted-out categories).
 *
 * Design decisions that keep it honest and testable:
 *  - **Pure & deterministic.** The catalog is passed in (`input.catalog`), never
 *    read from module scope, so every output is a pure function of its input and
 *    the deterministic tests in `recommendation.test.ts` fully control the pool.
 *    Ranking and tie-breaks are total (grade, then catalog order) — the same
 *    input always yields the same action.
 *  - **Type-only imports.** The engine imports *types* only (erased at runtime),
 *    so the test file can execute under Node's native TypeScript stripping
 *    without pulling the React-dependent catalog/`flowData` modules.
 *  - **Contraindications are matched by exact context string** (normalized),
 *    never fuzzy-guessed — the catalog's own `Contraindication.context` values
 *    are what a real UI would present as opt-out toggles (rubric §3.3 / §7).
 *  - **Never a dead end (Zero-Guilt, CLAUDE.md §1).** When nothing fits, the
 *    engine returns a warm, always-feasible fallback — the smallest surviving
 *    catalog action, or a universal gentle pause — never "no result".
 *  - **Health-claim integrity (CLAUDE.md §3 / TASK-006).** The engine only
 *    *passes through* each record's pre-approved `claim.permitted`; it never
 *    composes a new health statement.
 */

import type {
  ActionRecord,
  CatalogCategory,
  EvidenceGrade,
} from './actionCatalog'
import type { GoalId } from '../flows/flowData'

/* ----------------------------------------------------------------- types -- */

export interface RecommendationInput {
  /** The user's explicit goal preference, or `null`/omitted for "no preference". */
  goal?: GoalId | null
  /**
   * Seconds the user says they have right now. Omitted ⇒ unlimited. A full
   * action that doesn't fit is offered as its easier variant when *that* fits;
   * if nothing fits, the no-match fallback takes over.
   */
  timeAvailableSeconds?: number
  /**
   * Contraindication contexts the user has explicitly declared — exact strings
   * drawn from the catalog's own `Contraindication.context` values, so matching
   * is deterministic and never a fuzzy guess.
   */
  declaredContexts?: readonly string[]
  /** Categories the user has explicitly opted out of. */
  excludeCategories?: readonly CatalogCategory[]
  /** The pool to choose from — required, so the engine stays pure and testable. */
  catalog: readonly ActionRecord[]
}

export type RecommendationReason = 'goal-fit' | 'open-no-goal' | 'fallback-no-match'

/** Which version of the action the engine is offering. */
export type ActionForm =
  | 'full' // the full action fits as-is
  | 'easier' // the easier variant (time- or contraindication-driven)
  | 'floor' // the universal gentle pause (last-resort fallback)

export interface RecommendedAction {
  /** The originating catalog record id, or `null` for the universal fallback. */
  sourceId: string | null
  title: string
  duration: string
  durationSeconds: number
  category: CatalogCategory | null
  goal: GoalId | null
  evidenceGrade: EvidenceGrade | null
  form: ActionForm
  /** True when a full action was stepped down to its easier variant for time. */
  downgradedForTime: boolean
  /** Buildable resolutions from any matched `modify`/`advise-check`/`offer-easier`. */
  adaptations: readonly string[]
  /** The record's pre-approved general-benefit statement (never composed here). */
  claimPermitted: string | null
  isFallback: boolean
  /** A warm, non-punitive framing line (Zero-Guilt, CLAUDE.md §1). */
  note: string
}

export interface RecommendationStats {
  /** Approved, category-allowed, goal-fitting records considered. */
  considered: number
  /** Dropped because a declared context had a `skip-for-now` disposition. */
  excludedByContraindication: number
  /** Dropped because neither the full nor the easier version fit the time budget. */
  excludedByTime: number
  /** Records that survived to the ranking stage. */
  feasible: number
}

export interface Recommendation {
  action: RecommendedAction
  reason: RecommendationReason
  stats: RecommendationStats
}

/* ------------------------------------------------------- duration parsing -- */

const DURATION_RE = /^(\d+)\s*(sec|secs|second|seconds|min|mins|minute|minutes)$/i

/**
 * Parse a catalog duration string ("2 min", "40 sec") to seconds. An
 * unrecognised format returns `+Infinity` so it can never silently satisfy a
 * finite time budget. All catalog durations are well-formed against this regex.
 */
export function parseDurationSeconds(text: string): number {
  const match = DURATION_RE.exec(text.trim())
  if (!match) return Number.POSITIVE_INFINITY
  const value = match[1]
  const unit = match[2]
  if (value === undefined || unit === undefined) return Number.POSITIVE_INFINITY
  const n = Number.parseInt(value, 10)
  return unit.toLowerCase().startsWith('min') ? n * 60 : n
}

/* -------------------------------------------------- contraindication eval -- */

function normalize(context: string): string {
  return context.trim().toLowerCase()
}

interface ContraOutcome {
  /** A declared `skip-for-now` context ⇒ exclude this action entirely. */
  excluded: boolean
  /** A declared `offer-easier` context ⇒ surface the easier variant. */
  forceEasier: boolean
  /** Buildable resolutions for every matched contraindication. */
  adaptations: string[]
}

/** Deterministically evaluate a record's contraindications against declared contexts. */
function evaluateContraindications(
  record: ActionRecord,
  declared: ReadonlySet<string>,
): ContraOutcome {
  const outcome: ContraOutcome = { excluded: false, forceEasier: false, adaptations: [] }
  for (const contra of record.contraindications) {
    if (!declared.has(normalize(contra.context))) continue
    outcome.adaptations.push(contra.resolution)
    switch (contra.disposition) {
      case 'skip-for-now':
        outcome.excluded = true
        break
      case 'offer-easier':
        outcome.forceEasier = true
        break
      case 'modify':
      case 'advise-check':
        // Keep the full action; the resolution note rides along as an adaptation.
        break
    }
  }
  return outcome
}

/* ----------------------------------------------------------- ranking ------ */

const GRADE_RANK: Record<EvidenceGrade, number> = { A: 0, B: 1, C: 2 }

interface Candidate {
  record: ActionRecord
  /** Position in the input catalog — the final, stable tie-break. */
  index: number
  form: 'full' | 'easier'
  durationSeconds: number
  downgradedForTime: boolean
  adaptations: string[]
}

/**
 * Total order over feasible candidates:
 *   1. a full action that fits beats one we had to shrink for time,
 *   2. then stronger evidence (A > B > C),
 *   3. then catalog order (stable, deterministic).
 */
function compareCandidates(a: Candidate, b: Candidate): number {
  const formA = a.form === 'full' ? 0 : 1
  const formB = b.form === 'full' ? 0 : 1
  if (formA !== formB) return formA - formB
  const gradeA = GRADE_RANK[a.record.evidenceGrade]
  const gradeB = GRADE_RANK[b.record.evidenceGrade]
  if (gradeA !== gradeB) return gradeA - gradeB
  return a.index - b.index
}

/* ------------------------------------------------------------- notes ------ */

function noteFor(candidate: Candidate): string {
  if (candidate.downgradedForTime) return 'Here’s the quick version — it counts just the same.'
  if (candidate.form === 'easier' && candidate.adaptations.length > 0) {
    return 'Gently tailored to suit you right now — this counts fully.'
  }
  if (candidate.form === 'easier') return 'The easier version — every bit counts.'
  return 'A good fit for right now.'
}

function toRecommendedAction(candidate: Candidate): RecommendedAction {
  const useEasier = candidate.form === 'easier'
  const { record } = candidate
  return {
    sourceId: record.id,
    title: useEasier ? record.easierVariant.title : record.title,
    duration: useEasier ? record.easierVariant.duration : record.duration,
    durationSeconds: candidate.durationSeconds,
    category: record.category,
    goal: record.goal,
    evidenceGrade: record.evidenceGrade,
    form: candidate.form,
    downgradedForTime: candidate.downgradedForTime,
    adaptations: candidate.adaptations,
    claimPermitted: record.claim.permitted,
    isFallback: false,
    note: noteFor(candidate),
  }
}

/* ----------------------------------------------------------- fallback ----- */

/**
 * The universal last-resort offer: a gentle pause that carries no plausible
 * contraindication and is always feasible. Reached only when every catalog
 * action is excluded — so the engine is never a dead end (Zero-Guilt §1).
 */
export const UNIVERSAL_FALLBACK: RecommendedAction = {
  sourceId: null,
  title: 'Rest your eyes and soften your shoulders for a moment',
  duration: '10 sec',
  durationSeconds: 10,
  category: null,
  goal: null,
  evidenceGrade: null,
  form: 'floor',
  downgradedForTime: false,
  adaptations: [],
  claimPermitted: null,
  isFallback: true,
  note: 'Nothing matched exactly, so here’s the gentlest possible option — and resting is completely fine too.',
}

interface Indexed {
  record: ActionRecord
  index: number
}

/** The smallest (by easier-variant duration) contraindication-surviving record. */
function smallestEasier(
  pool: readonly Indexed[],
  declared: ReadonlySet<string>,
): RecommendedAction | null {
  let best: { record: ActionRecord; index: number; seconds: number; adaptations: string[] } | null =
    null
  for (const { record, index } of pool) {
    const contra = evaluateContraindications(record, declared)
    if (contra.excluded) continue
    const seconds = parseDurationSeconds(record.easierVariant.duration)
    if (best === null || seconds < best.seconds || (seconds === best.seconds && index < best.index)) {
      best = { record, index, seconds, adaptations: contra.adaptations }
    }
  }
  if (best === null) return null
  return {
    sourceId: best.record.id,
    title: best.record.easierVariant.title,
    duration: best.record.easierVariant.duration,
    durationSeconds: best.seconds,
    category: best.record.category,
    goal: best.record.goal,
    evidenceGrade: best.record.evidenceGrade,
    form: 'easier',
    downgradedForTime: false,
    adaptations: best.adaptations,
    claimPermitted: best.record.claim.permitted,
    isFallback: true,
    note: 'Nothing fit exactly, so here’s the smallest version — it still counts, and resting is fine too.',
  }
}

function fallbackAction(
  catalog: readonly ActionRecord[],
  goal: GoalId | null,
  declared: ReadonlySet<string>,
  excludedCategories: ReadonlySet<CatalogCategory>,
): RecommendedAction {
  const approved: Indexed[] = catalog
    .map((record, index) => ({ record, index }))
    .filter(({ record }) => record.status === 'approved' && !excludedCategories.has(record.category))

  // 1) Prefer a gentle action that still matches the user's goal.
  if (goal !== null) {
    const goalPool = approved.filter(({ record }) => record.goal === goal)
    const pick = smallestEasier(goalPool, declared)
    if (pick) return pick
  }
  // 2) Relax the goal — any gentle, contraindication-surviving action.
  const relaxed = smallestEasier(approved, declared)
  if (relaxed) return relaxed
  // 3) Nothing survived at all — the universal gentle pause.
  return UNIVERSAL_FALLBACK
}

/* ------------------------------------------------------------- engine ----- */

/**
 * Recommend one suitable micro-action. Always returns an action (never a dead
 * end): a goal-fitting / open pick when something fits, otherwise a warm,
 * always-feasible fallback.
 */
export function recommend(input: RecommendationInput): Recommendation {
  const goal = input.goal ?? null
  const budget = input.timeAvailableSeconds ?? Number.POSITIVE_INFINITY
  const declared = new Set((input.declaredContexts ?? []).map(normalize))
  const excludedCategories = new Set(input.excludeCategories ?? [])

  // 1) Base pool: approved, category-allowed, and goal-fitting (if a goal is set).
  const base: Indexed[] = input.catalog
    .map((record, index) => ({ record, index }))
    .filter(
      ({ record }) =>
        record.status === 'approved' &&
        !excludedCategories.has(record.category) &&
        (goal === null || record.goal === goal),
    )

  // 2) Apply contraindications + the time budget to each base record.
  let excludedByContraindication = 0
  let excludedByTime = 0
  const feasible: Candidate[] = []

  for (const { record, index } of base) {
    const contra = evaluateContraindications(record, declared)
    if (contra.excluded) {
      excludedByContraindication++
      continue
    }

    const fullSeconds = parseDurationSeconds(record.duration)
    const easierSeconds = parseDurationSeconds(record.easierVariant.duration)

    if (contra.forceEasier) {
      // A declared `offer-easier` context: the easier variant is the only form.
      if (easierSeconds <= budget) {
        feasible.push({
          record,
          index,
          form: 'easier',
          durationSeconds: easierSeconds,
          downgradedForTime: false,
          adaptations: contra.adaptations,
        })
      } else {
        excludedByTime++
      }
      continue
    }

    if (fullSeconds <= budget) {
      feasible.push({
        record,
        index,
        form: 'full',
        durationSeconds: fullSeconds,
        downgradedForTime: false,
        adaptations: contra.adaptations,
      })
    } else if (easierSeconds <= budget) {
      feasible.push({
        record,
        index,
        form: 'easier',
        durationSeconds: easierSeconds,
        downgradedForTime: true,
        adaptations: contra.adaptations,
      })
    } else {
      excludedByTime++
    }
  }

  const stats: RecommendationStats = {
    considered: base.length,
    excludedByContraindication,
    excludedByTime,
    feasible: feasible.length,
  }

  // 3a) Something fits → rank and pick the best.
  if (feasible.length > 0) {
    feasible.sort(compareCandidates)
    const best = feasible[0]
    if (best) {
      return {
        action: toRecommendedAction(best),
        reason: goal === null ? 'open-no-goal' : 'goal-fit',
        stats,
      }
    }
  }

  // 3b) Nothing fit → warm, always-feasible fallback.
  return {
    action: fallbackAction(input.catalog, goal, declared, excludedCategories),
    reason: 'fallback-no-match',
    stats,
  }
}

/** Convenience: just the chosen action. */
export function recommendAction(input: RecommendationInput): RecommendedAction {
  return recommend(input).action
}
