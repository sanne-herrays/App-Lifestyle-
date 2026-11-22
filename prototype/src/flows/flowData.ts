/**
 * TASK-015 — First-session flows: shared data & hooks (no React components here,
 * so this file never crosses a react-refresh component boundary).
 *
 * Every micro-action below is drawn from the reviewed-catalog examples that the
 * three concept briefs and `prevention-action-evidence-rubric.md` §6 actually
 * name ("Two minutes outside", "a glass of water", "one minute of slow breathing").
 * Nothing here implies individual disease-risk reduction (CLAUDE.md §3 / TASK-006):
 * copy stays at plain general-benefit, experiential framing.
 */

import { useEffect, useState } from 'react'

export type ConceptId = 'tiny-win' | 'growing-world' | 'everyday-adventures'

/** Per-concept accent colours, matching the approved TASK-014 scorecard. */
export const ACCENT: Record<ConceptId, string> = {
  'tiny-win': '#E09A38',
  'growing-world': '#5F9E7E',
  'everyday-adventures': '#DE6A80',
}

export type GoalId = 'move' | 'calm' | 'water' | 'outside'

export interface Goal {
  id: GoalId
  label: string
}

/** The four "goal whisper" chips shared by all three briefs (§4 step 2). */
export const GOALS: readonly Goal[] = [
  { id: 'move', label: 'Move a little' },
  { id: 'calm', label: 'Feel calmer' },
  { id: 'water', label: 'Drink water' },
  { id: 'outside', label: 'Step outside' },
]

export interface MicroAction {
  /** The tiny action, framed as a plain general-benefit invitation. */
  title: string
  /** Honest effort estimate — the "ridiculously small" promise (PRD Principle 1). */
  effort: string
  /** The always-one-tap-away easier variant (TASK-022 flavour). */
  easierTitle: string
  easierEffort: string
  /** An optional, user-ownable felt reward (EVIDENCE §3.8 C*, never a health claim). */
  reward: string
  /** An optional identity whisper the user may claim (EVIDENCE §3.12 C*, test-gated). */
  identity: string
}

export const ACTION_BY_GOAL: Record<GoalId, MicroAction> = {
  move: {
    title: 'Two minutes of easy movement',
    effort: '2 min',
    easierTitle: 'Twenty seconds of stretching',
    easierEffort: '20 sec',
    reward: 'That felt good.',
    identity: 'someone who moves a little each day',
  },
  calm: {
    title: 'One minute of slow breathing',
    effort: '1 min',
    easierTitle: 'Three slow breaths',
    easierEffort: '20 sec',
    reward: 'I feel a little calmer.',
    identity: 'someone who takes a quiet moment',
  },
  water: {
    title: 'A glass of water',
    effort: '1 min',
    easierTitle: 'A few sips of water',
    easierEffort: '20 sec',
    reward: 'That’s looked after.',
    identity: 'someone who looks after the basics',
  },
  outside: {
    title: 'Two minutes outside',
    effort: '2 min',
    easierTitle: 'Twenty seconds by an open door',
    easierEffort: '20 sec',
    reward: 'That felt good.',
    identity: 'someone who steps outside',
  },
}

/** When a user skips the goal whisper we offer the signature action (briefs §4). */
export const DEFAULT_ACTION: MicroAction = ACTION_BY_GOAL.outside

export function actionForGoal(goal: GoalId | null): MicroAction {
  return goal ? ACTION_BY_GOAL[goal] : DEFAULT_ACTION
}

/** Existing routines a when-then plan / stable anchor can attach to (§4). */
export const ANCHORS: readonly string[] = [
  'after my morning coffee',
  'after I brush my teeth',
  'when I close my laptop',
  'after lunch',
]

/** Declared, private context chips for Everyday Adventures (§4 step 4). */
export const CONTEXT_CHIPS: readonly string[] = [
  'mostly indoors',
  'often on the go',
  'little time',
]

export interface Mission {
  title: string
  effort: string
  easier: string
}

/**
 * The bounded, convergent mission pool for Everyday Adventures (§5.4 M4:
 * ~3–6 live missions per anchor — a small relevant pool, not a firehose).
 * The stable anchor never varies; only the mission content rotates within this pool.
 */
export const EA_POOL: Record<GoalId, readonly Mission[]> = {
  move: [
    { title: 'Two minutes of easy movement', effort: '2 min', easier: 'Twenty seconds of stretching' },
    { title: 'Stand and stretch for one minute', effort: '1 min', easier: 'Ten slow shoulder rolls' },
    { title: 'Walk to the end of the street and back', effort: '2 min', easier: 'Walk to the front door and back' },
  ],
  calm: [
    { title: 'One minute of slow breathing', effort: '1 min', easier: 'Three slow breaths' },
    { title: 'Unclench your jaw and drop your shoulders', effort: '20 sec', easier: 'One slow breath out' },
    { title: 'A quiet minute by a window', effort: '1 min', easier: 'Look out of a window for twenty seconds' },
  ],
  water: [
    { title: 'A glass of water', effort: '1 min', easier: 'A few sips of water' },
    { title: 'Fill your bottle and take three sips', effort: '1 min', easier: 'Take three sips of water' },
    { title: 'A glass of water with your next sit-down', effort: '1 min', easier: 'A few sips when you sit down' },
  ],
  outside: [
    { title: 'Two minutes outside', effort: '2 min', easier: 'Twenty seconds by an open door' },
    { title: 'Stand by an open window for a minute', effort: '1 min', easier: 'Open a window and breathe once' },
    { title: 'Step onto the doorstep and look up', effort: '1 min', easier: 'Open the door and look out' },
  ],
}

export function eaPoolForGoal(goal: GoalId | null): readonly Mission[] {
  return goal ? EA_POOL[goal] : EA_POOL.outside
}

/** Live `prefers-reduced-motion` state; motion-heavy beats degrade to instant. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return reduced
}

/**
 * Success-only haptic. Now backed by the TASK-021 platform adapter
 * (`src/lib/haptics.ts`): channel-detected (Vibration API on Android/Chromium,
 * the native switch tick on iOS), honours the user setting, and silently
 * degrades where unsupported. Re-exported here so the existing first-session
 * flow call sites keep their import path unchanged. Fires only on a real
 * completion, exactly once.
 */
export { fireSuccessHaptic } from '../lib/haptics'
