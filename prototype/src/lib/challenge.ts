/**
 * TASK-029 — Progressive challenge selector.
 *
 * "Offer a slightly harder action only when the user signals readiness."
 *
 * Acceptance criterion (tasks.json TASK-029):
 *   "Users can accept, decline or revert; no automatic escalation after missed
 *    actions; choices persist."
 *
 *   - Accept / decline / revert → `applyDecision(state, decision, ladderLength)`.
 *     `accept` steps up exactly one rung; `decline` dismisses the offer and
 *     leaves the rung untouched; `revert` steps one rung back down toward the
 *     baseline. All three are explicit user choices.
 *   - No automatic escalation after missed actions → the rung is NEVER raised
 *     except by an explicit `accept`. The offer itself is suppressed whenever the
 *     user has had a recent quiet day (`recentlyMissed`), and `signalReadiness`
 *     is the only thing that opens an offer — the engine never sets it for the
 *     user. So a missed day can only ever make the app *quieter*, never pushier
 *     (CLAUDE.md §1).
 *   - Choices persist → a framework-agnostic localStorage store (same
 *     subscribe/broadcast shape as `lib/cues.ts`) keyed per goal; `serialize` /
 *     `deserialize` round-trip the chosen rung and readiness flag.
 *
 * The ladder *content* lives in `flowData.challengeLadder` (so rung 0 reuses the
 * shared `ACTION_BY_GOAL` catalog, single source of truth). This engine works on
 * rung indices + an injected `ladderLength`, so it imports no React (only
 * `import type` for `GoalId`, plus the React-free `isGuiltFree` guard) and the
 * deterministic suite in `challenge.test.ts` can execute it directly under Node's
 * TS stripping, exactly like `restart.ts` / `ledger.ts` / `habitGraduation.ts`.
 */

import type { GoalId } from '../flows/flowData'
import { isGuiltFree } from './restart.ts'

/* ------------------------------------------------------------- decisions --- */

/** The three choices the acceptance criterion names. */
export type ChallengeDecision = 'accept' | 'decline' | 'revert'

export const CHALLENGE_DECISIONS: readonly ChallengeDecision[] = ['accept', 'decline', 'revert']

/* ----------------------------------------------------------------- state --- */

/**
 * The per-goal choice that persists. `rung` is the level the user currently sits
 * on (0 = the baseline little win); `readyForMore` is the user's own readiness
 * signal, which opens exactly one offer and is consumed by any decision.
 */
export interface ChallengeState {
  goalId: GoalId
  /** Current chosen level, 0 = baseline. Only `accept`/`revert` ever change it. */
  rung: number
  /** The user's explicit "I'd like a little more" signal. The engine never sets it. */
  readyForMore: boolean
}

/** A fresh state for a goal: on the baseline rung, no pending readiness. */
export function initialChallengeState(goalId: GoalId): ChallengeState {
  return { goalId, rung: 0, readyForMore: false }
}

/** True when a harder rung exists above the current one. */
export function hasHarderRung(rung: number, ladderLength: number): boolean {
  return rung + 1 < ladderLength
}

/** True when the user is above the baseline and can step back down. */
export function canRevert(state: ChallengeState): boolean {
  return state.rung > 0
}

/* ----------------------------------------------------------- the offer ----- */

/** The signals from the wider app the offer gate reads (never stored). */
export interface ChallengeSignals {
  /**
   * A recent quiet day, read from the completion ledger (e.g. `missedDays >= 1`).
   * Suppresses the offer entirely: the app never nudges toward *more* right after
   * a day off (CLAUDE.md §1). It can only ever make things gentler, never pushier,
   * and it NEVER changes the rung on its own.
   */
  recentlyMissed: boolean
}

/** A live invitation to step up one rung — only ever surfaced by the user's own readiness. */
export interface ChallengeOffer {
  fromRung: number
  toRung: number
  eyebrow: string
  headline: string
  body: string
  acceptLabel: string
  declineLabel: string
}

const OFFER_COPY = {
  eyebrow: 'Feeling ready for a little more?',
  headline: 'A slightly bigger step',
  body: 'Totally optional. Keep today exactly as it is, or try a little more — you can switch back anytime.',
  acceptLabel: 'Try the bigger step',
  declineLabel: 'Keep it as it is',
} as const

/**
 * Decide whether to show the step-up offer. It appears ONLY when all three hold:
 *   1. a harder rung exists,
 *   2. the user has signalled readiness (`state.readyForMore`), and
 *   3. there has been no recent quiet day (`!signals.recentlyMissed`).
 * Otherwise it returns `null`. This is the single gate; there is no other path
 * that raises the rung, so escalation is never automatic.
 */
export function evaluateChallenge(
  state: ChallengeState,
  ladderLength: number,
  signals: ChallengeSignals,
): ChallengeOffer | null {
  if (!hasHarderRung(state.rung, ladderLength)) return null
  if (signals.recentlyMissed) return null
  if (!state.readyForMore) return null
  return {
    fromRung: state.rung,
    toRung: state.rung + 1,
    ...OFFER_COPY,
  }
}

/* -------------------------------------------------------- readiness / copy -- */

/** The user's explicit readiness signal — the ONLY thing that opens an offer. */
export function signalReadiness(state: ChallengeState): ChallengeState {
  return { ...state, readyForMore: true }
}

/** Why there is no offer right now — always warm, never a scolding (§1). */
export function readinessRationale(
  state: ChallengeState,
  ladderLength: number,
  signals: ChallengeSignals,
): string {
  if (!hasHarderRung(state.rung, ladderLength)) {
    return 'You’re on the biggest step for this one. Stay here as long as you like.'
  }
  if (signals.recentlyMissed) {
    return 'Had a quiet day? We’ll keep things easy — no bigger steps right now.'
  }
  if (!state.readyForMore) {
    return 'Whenever you fancy a little more, tell us. There’s never any rush.'
  }
  return 'Here’s a slightly bigger step, only if you’d like it.'
}

/** The warm line shown the moment a decision lands. */
export const DECISION_MESSAGE: Record<ChallengeDecision, string> = {
  accept: 'Nice — a little more today. You can switch back whenever you like.',
  decline: 'Kept just as it is. That’s a perfectly good choice.',
  revert: 'Back to your usual step — and it still counts, fully.',
}

/* ----------------------------------------------------------- the reducer --- */

/**
 * Apply an explicit user decision. Pure and total:
 *   - `accept`  → step up exactly ONE rung (never more → no over-escalation) and
 *                 consume the readiness signal, so the next step needs a fresh
 *                 "I'm ready". At the top rung it is a no-op beyond clearing the
 *                 signal.
 *   - `decline` → dismiss the offer (clear readiness); the rung is untouched.
 *   - `revert`  → step one rung back toward the baseline (never below 0); allowed
 *                 any time, independent of readiness — the user can always ease off.
 */
export function applyDecision(
  state: ChallengeState,
  decision: ChallengeDecision,
  ladderLength: number,
): ChallengeState {
  switch (decision) {
    case 'accept':
      return hasHarderRung(state.rung, ladderLength)
        ? { ...state, rung: state.rung + 1, readyForMore: false }
        : { ...state, readyForMore: false }
    case 'decline':
      return { ...state, readyForMore: false }
    case 'revert':
      return canRevert(state) ? { ...state, rung: state.rung - 1, readyForMore: false } : state
  }
}

/* -------------------------------------------------------- guilt-free guard -- */

/** Every user-facing string this engine can surface — the set the §1 guard scans. */
export function allChallengeCopy(): readonly string[] {
  const offer = Object.values(OFFER_COPY)
  const messages = CHALLENGE_DECISIONS.map((d) => DECISION_MESSAGE[d])
  // Fold in every rationale branch across a representative grid.
  const rationales: string[] = []
  const probe = initialChallengeState('move')
  for (const rung of [0, 1, 2]) {
    for (const readyForMore of [false, true]) {
      for (const recentlyMissed of [false, true]) {
        rationales.push(readinessRationale({ ...probe, rung, readyForMore }, 3, { recentlyMissed }))
      }
    }
  }
  return [...offer, ...messages, ...rationales]
}

export { isGuiltFree }

/* ----------------------------------------------------- persistence (pure) -- */

const STORAGE_KEY = 'herrays.challenge.v1'

const GOAL_IDS: readonly GoalId[] = ['move', 'calm', 'water', 'outside']

function isGoalId(value: unknown): value is GoalId {
  return value === 'move' || value === 'calm' || value === 'water' || value === 'outside'
}

/** Defensive parse of a single stored state; anything malformed is dropped. */
export function sanitizeState(raw: unknown): ChallengeState | null {
  if (typeof raw !== 'object' || raw === null) return null
  const r = raw as Record<string, unknown>
  if (!isGoalId(r.goalId)) return null
  const rawRung = typeof r.rung === 'number' && Number.isFinite(r.rung) ? Math.floor(r.rung) : 0
  return {
    goalId: r.goalId,
    rung: rawRung < 0 ? 0 : rawRung, // never below the baseline; upper bound clamped on use
    readyForMore: r.readyForMore === true,
  }
}

/** The persisted shape: one state per goal. */
export type ChallengeStateMap = Record<GoalId, ChallengeState>

/** A full, defaulted map — every goal present, so lookups are total. */
export function defaultStateMap(): ChallengeStateMap {
  return {
    move: initialChallengeState('move'),
    calm: initialChallengeState('calm'),
    water: initialChallengeState('water'),
    outside: initialChallengeState('outside'),
  }
}

/** Serialize a map to a stable JSON string. */
export function serialize(map: ChallengeStateMap): string {
  return JSON.stringify(GOAL_IDS.map((id) => map[id]))
}

/**
 * Parse a stored string back into a complete map. Unknown/garbage entries are
 * dropped and any missing goal falls back to its initial state, so the result is
 * always total and safe to index.
 */
export function deserialize(raw: string | null): ChallengeStateMap {
  const map = defaultStateMap()
  if (!raw) return map
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return map
    for (const entry of parsed) {
      const state = sanitizeState(entry)
      if (state) map[state.goalId] = state
    }
  } catch {
    /* fall back to defaults */
  }
  return map
}

/* --------------------------------------------------------- store (runtime) -- */

function readStored(): ChallengeStateMap {
  if (typeof localStorage === 'undefined') return defaultStateMap()
  try {
    return deserialize(localStorage.getItem(STORAGE_KEY))
  } catch {
    return defaultStateMap()
  }
}

let states: ChallengeStateMap = readStored()
const listeners = new Set<(map: ChallengeStateMap) => void>()

function persist(): void {
  try {
    localStorage.setItem(STORAGE_KEY, serialize(states))
  } catch {
    /* no-op: an unpersistable store still works for the session */
  }
}

function emit(): void {
  persist()
  const snapshot = snapshotStates()
  for (const listener of listeners) listener(snapshot)
}

/** A stable, cloned snapshot of the current per-goal states. */
export function snapshotStates(): ChallengeStateMap {
  return {
    move: { ...states.move },
    calm: { ...states.calm },
    water: { ...states.water },
    outside: { ...states.outside },
  }
}

/** The live state for one goal. */
export function getChallengeState(goalId: GoalId): ChallengeState {
  return { ...states[goalId] }
}

/** Record the user's readiness signal for a goal and broadcast. */
export function markReady(goalId: GoalId): void {
  states = { ...states, [goalId]: signalReadiness(states[goalId]) }
  emit()
}

/** Apply an explicit decision for a goal (clamped by the real ladder length) and broadcast. */
export function decide(goalId: GoalId, decision: ChallengeDecision, ladderLength: number): void {
  states = { ...states, [goalId]: applyDecision(states[goalId], decision, ladderLength) }
  emit()
}

/** Reset a goal back to its baseline (an honest fresh start, not a penalty). */
export function resetChallenge(goalId: GoalId): void {
  states = { ...states, [goalId]: initialChallengeState(goalId) }
  emit()
}

export function subscribeChallenge(listener: (map: ChallengeStateMap) => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
