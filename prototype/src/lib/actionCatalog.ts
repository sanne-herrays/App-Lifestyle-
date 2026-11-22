/**
 * TASK-024 — Evidence-reviewed action catalog.
 *
 * Each record below is a completed **Action Evidence & Safety Record (AESR)** as
 * defined by `docs/research/prevention-action-evidence-rubric.md` §3. The rubric
 * is explicit (§7) that this catalog *is* the set of AESRs and the single source
 * of truth that TASK-025 (recommendation rules) reads its hard exclusion filters
 * from — so contraindications are **structured** (context + disposition +
 * buildable resolution), never free text alone (rubric §3.3).
 *
 * Every record carries the six TASK-024 acceptance fields — category, duration,
 * evidence grade, contraindications, easier variant and review date — plus the
 * rubric's traceability fields (safety tier, claim limit, review owner,
 * behavioral linkage).
 *
 * Honesty rules baked in (CLAUDE.md §3 / rubric §5):
 *  - Grade gates language: an action's permitted statement never exceeds its
 *    evidence grade, and NO record asserts individual disease-risk reduction,
 *    a quantified outcome, a cure, or a timeline promise (rubric §5.2).
 *  - Every contraindication resolves to a gentler variant or a clean exclusion,
 *    never a scary warning (rubric §3.3 design rule / Zero-Guilt §1).
 *  - Only `S1–S3` / grade `A–C` actions live here; `S4`/grade-`D` candidates are
 *    rejected at intake (rubric §2.2) and have no record.
 *
 * The four goal-signature actions reuse `ACTION_BY_GOAL` from `flowData.ts` as
 * the single source of their title/duration/easier-variant text — no duplication
 * of action copy that already exists in the first-session kit.
 */

import { ACTION_BY_GOAL, type GoalId } from '../flows/flowData'

/* -------------------------------------------------------------- the schema -- */

/**
 * Shippable evidence grades only. Grade `D` (insufficient/contested) is never a
 * benefit claim and so never enters the catalog (rubric §3.1 / §4 Gate 3).
 */
export type EvidenceGrade = 'A' | 'B' | 'C'

/**
 * Shippable safety tiers only. `S4` ("cannot be made general-safe") is rejected
 * at intake and has no record here (rubric §3.2 / §4 Gate 2).
 */
export type SafetyTier = 'S1' | 'S2' | 'S3'

/** General-benefit action families — the user-facing `category` field. */
export type CatalogCategory =
  | 'movement'
  | 'outdoors'
  | 'hydration'
  | 'calm'
  | 'posture'
  | 'connection'
  | 'nourishment'
  | 'rest'

/** How the recommendation engine (TASK-025) must handle a matched contraindication. */
export type Disposition =
  | 'offer-easier' // surface the easier variant instead of the full action
  | 'modify' // keep the action but adapt it (e.g. seated)
  | 'skip-for-now' // exclude this action for this user/context
  | 'advise-check' // gentle, non-diagnostic "you know your body" note (never blocks)

/** A structured contraindication TASK-025 can evaluate deterministically. */
export interface Contraindication {
  /** The condition or context that triggers this rule. */
  context: string
  /** What the engine should do when it matches. */
  disposition: Disposition
  /** The buildable gentler variant or exclusion — never a red warning (§3.3). */
  resolution: string
}

/** The only permitted health language for this action, bounded by its grade (§5). */
export interface ClaimLimit {
  /** The permitted general-benefit statement, at or below the evidence grade. */
  permitted: string
  /** Framings that must never appear for this action (a subset of §5.2). */
  forbidden: readonly string[]
}

/** The smaller, always-feasible version — the ≤20s fallback (TASK-022 linkage). */
export interface EasierVariant {
  title: string
  duration: string
}

/** Named accountability + non-evergreen review dates (rubric §3.4 / §3.5). */
export interface ReviewRecord {
  /** A named accountable role — never "the team" (rubric §3.4). */
  owner: string
  /** ISO date the current grade/claim was last confirmed. */
  lastReviewed: string
  /** ISO date the next review is due, by the grade's cadence (§3.5). */
  nextReviewDue: string
  /** Events that force an immediate re-review regardless of date. */
  triggers: readonly string[]
}

/** A single evidence-reviewed micro-action. */
export interface ActionRecord {
  id: string
  category: CatalogCategory
  /** Links to the four shared goal chips where one applies; `null` otherwise. */
  goal: GoalId | null
  /** The action, framed as a plain general-benefit invitation. */
  title: string
  /** Honest effort estimate — the PRD §1 ~20s–2min floor. */
  duration: string
  /** The always-one-tap-away easier variant (acceptance field). */
  easierVariant: EasierVariant
  evidenceGrade: EvidenceGrade
  safetyTier: SafetyTier
  /** Structured safety filter the engine reads (acceptance field). */
  contraindications: readonly Contraindication[]
  /** Permitted + forbidden health language for this action (rubric §5). */
  claim: ClaimLimit
  /** Which TASK-005 behavior-change mechanism(s) this action rides on. */
  mechanisms: readonly string[]
  /** Review owner + dates + triggers (acceptance field: review date). */
  review: ReviewRecord
  /** Only `approved` records may be surfaced to a user (rubric §3.4). */
  status: 'approved'
}

/* ------------------------------------------------------- shared constants -- */

/** Default review cadence by grade, in months (rubric §3.5). */
export const REVIEW_CADENCE_MONTHS: Record<EvidenceGrade, number> = {
  A: 24,
  B: 18,
  C: 12,
}

/** All records in this catalog were last reviewed on this date (rubric §6 worked examples). */
const LAST_REVIEWED = '2026-11-22'

/** Next-review-due dates, pre-computed from `LAST_REVIEWED` + the §3.5 cadence. */
const NEXT_DUE: Record<EvidenceGrade, string> = {
  A: '2028-11-22', // +24 months
  B: '2028-05-22', // +18 months
  C: '2027-11-22', // +12 months
}

/** The single accountable sign-off role for every evidence/claim field (rubric §3.4). */
const OWNER = 'Preventive-health specialist'

/** The §3.5 re-review triggers that override the cadence for every record. */
const REVIEW_TRIGGERS: readonly string[] = [
  'new major public-health guidance touching this action',
  'any reported adverse event or user-safety report',
  'a claims or app-store regulatory challenge',
  'a contraindication surfaced in testing (TASK-039/040)',
  'any change to the benefit wording',
]

/** Build a review record for a grade so dates/cadence stay consistent across the catalog. */
function review(grade: EvidenceGrade): ReviewRecord {
  return {
    owner: OWNER,
    lastReviewed: LAST_REVIEWED,
    nextReviewDue: NEXT_DUE[grade],
    triggers: REVIEW_TRIGGERS,
  }
}

/** Forbidden framings that apply to *every* record (rubric §5.2), so records only list their extras. */
const UNIVERSAL_FORBIDDEN: readonly string[] = [
  'any individual disease-risk reduction ("reduces your risk of…", "prevents", "protects you from")',
  'any quantified outcome ("cuts risk 30%", "burns N calories", "adds years")',
  'any cure/treatment claim ("treats", "heals", "boosts immunity")',
  'any timeline promise ("in 21 days you’ll be healthier")',
]

function forbidden(...extra: readonly string[]): readonly string[] {
  return [...UNIVERSAL_FORBIDDEN, ...extra]
}

/* ------------------------------------------------- reused goal-signature -- */
/* These four reuse `ACTION_BY_GOAL` so their copy has one source of truth.    */

const MOVE = ACTION_BY_GOAL.move
const CALM = ACTION_BY_GOAL.calm
const WATER = ACTION_BY_GOAL.water
const OUTSIDE = ACTION_BY_GOAL.outside

/* --------------------------------------------------------- the catalog ----- */

export const ACTION_CATALOG: readonly ActionRecord[] = [
  /* ---- Movement (grade A: physical activity is a near-universal recommendation) */
  {
    id: 'move-easy',
    category: 'movement',
    goal: 'move',
    title: MOVE.title,
    duration: MOVE.effort,
    easierVariant: { title: MOVE.easierTitle, duration: MOVE.easierEffort },
    evidenceGrade: 'A',
    safetyTier: 'S2',
    contraindications: [
      { context: 'Pain, injury, or limited mobility', disposition: 'offer-easier', resolution: 'Offer the seated 20-second stretch instead.' },
      { context: 'Doing something that needs full attention (driving, on a call)', disposition: 'skip-for-now', resolution: 'Hold the suggestion until a safe moment.' },
    ],
    claim: {
      permitted: 'Moving your body a little is broadly good for health.',
      forbidden: forbidden('"this workout prevents heart disease"'),
    },
    mechanisms: ['§3.7 action simplicity', '§3.1 cues'],
    review: review('A'),
    status: 'approved',
  },
  {
    id: 'move-stairs',
    category: 'movement',
    goal: 'move',
    title: 'Walk up one flight of stairs',
    duration: '1 min',
    easierVariant: { title: 'Stand up and sit down slowly, three times', duration: '30 sec' },
    evidenceGrade: 'A',
    safetyTier: 'S2',
    contraindications: [
      { context: 'Balance, dizziness, or joint pain', disposition: 'offer-easier', resolution: 'Offer the sit-to-stand variant; suggest holding the rail.' },
      { context: 'No stairs available', disposition: 'modify', resolution: 'Swap for marching in place for the same minute.' },
    ],
    claim: {
      permitted: 'A little gentle activity like the stairs is broadly good for health.',
      forbidden: forbidden('"climbing stairs lowers your blood pressure"'),
    },
    mechanisms: ['§3.7 action simplicity', '§3.2 implementation intentions'],
    review: review('A'),
    status: 'approved',
  },
  {
    id: 'move-calf-raises',
    category: 'movement',
    goal: 'move',
    title: 'Ten slow calf raises at the counter',
    duration: '40 sec',
    easierVariant: { title: 'Rise onto your toes once, slowly', duration: '10 sec' },
    evidenceGrade: 'A',
    safetyTier: 'S3',
    contraindications: [
      { context: 'Unsteady balance', disposition: 'modify', resolution: 'Hold the counter for support, or do them seated.' },
      { context: 'Ankle or foot pain', disposition: 'offer-easier', resolution: 'Offer the single slow toe-rise instead.' },
    ],
    claim: {
      permitted: 'Small movements through the day are broadly good for health.',
      forbidden: forbidden('"tones and burns fat"'),
    },
    mechanisms: ['§3.7 action simplicity', '§3.1 cues'],
    review: review('A'),
    status: 'approved',
  },
  {
    id: 'move-march',
    category: 'movement',
    goal: 'move',
    title: 'March in place for one minute',
    duration: '1 min',
    easierVariant: { title: 'Lift each knee once, slowly', duration: '15 sec' },
    evidenceGrade: 'A',
    safetyTier: 'S2',
    contraindications: [
      { context: 'Balance or joint concerns', disposition: 'modify', resolution: 'March gently while holding a chair, or tap toes seated.' },
    ],
    claim: {
      permitted: 'Moving your body a little is broadly good for health.',
      forbidden: forbidden('"a one-minute cardio workout"'),
    },
    mechanisms: ['§3.7 action simplicity'],
    review: review('A'),
    status: 'approved',
  },

  /* ---- Outdoors & daylight (grade A: time outside/daylight is widely recommended) */
  {
    id: 'outside-two-min',
    category: 'outdoors',
    goal: 'outside',
    title: OUTSIDE.title,
    duration: OUTSIDE.effort,
    easierVariant: { title: OUTSIDE.easierTitle, duration: OUTSIDE.easierEffort },
    evidenceGrade: 'A',
    safetyTier: 'S2',
    contraindications: [
      { context: 'Bad weather or poor air quality', disposition: 'modify', resolution: 'Swap for standing by an open window indoors.' },
      { context: 'Feeling unsafe outside (e.g. at night)', disposition: 'offer-easier', resolution: 'Offer the open-door variant; never push going out.' },
      { context: 'Limited mobility', disposition: 'offer-easier', resolution: 'Offer the open-door-and-look-out variant.' },
    ],
    claim: {
      permitted: 'Stepping outside is widely recommended and a nice reset.',
      forbidden: forbidden('"sunlight prevents depression"', '"lowers your blood pressure"'),
    },
    mechanisms: ['§3.1 cues', '§3.7 action simplicity'],
    review: review('A'),
    status: 'approved',
  },
  {
    id: 'outside-daylight',
    category: 'outdoors',
    goal: 'outside',
    title: 'Stand in a patch of daylight for a minute',
    duration: '1 min',
    easierVariant: { title: 'Turn your face to the window light for twenty seconds', duration: '20 sec' },
    evidenceGrade: 'A',
    safetyTier: 'S1',
    contraindications: [
      { context: 'Light sensitivity (e.g. migraine)', disposition: 'advise-check', resolution: 'Keep it gentle; a soft indoor window works too.' },
    ],
    claim: {
      permitted: 'A little daylight is widely recommended for wellbeing.',
      forbidden: forbidden('"resets your circadian clock to cure insomnia"'),
    },
    mechanisms: ['§3.1 cues'],
    review: review('A'),
    status: 'approved',
  },
  {
    id: 'outside-fresh-air',
    category: 'outdoors',
    goal: 'outside',
    title: 'Step outside and take five slow breaths',
    duration: '2 min',
    easierVariant: { title: 'Open a door and breathe in once', duration: '15 sec' },
    evidenceGrade: 'A',
    safetyTier: 'S2',
    contraindications: [
      { context: 'Poor air quality or very cold air', disposition: 'modify', resolution: 'Do it by an open window instead of going out.' },
      { context: 'Anxiety around focused breathing', disposition: 'offer-easier', resolution: 'Just stepping out counts — breathing is optional.' },
    ],
    claim: {
      permitted: 'A moment of fresh air is a nice thing to do for yourself today.',
      forbidden: forbidden('"detoxes your lungs"'),
    },
    mechanisms: ['§3.1 cues', '§3.8 positive affect'],
    review: review('A'),
    status: 'approved',
  },

  /* ---- Hydration (grade B: broadly sensible; specific claims overstated in media) */
  {
    id: 'water-glass',
    category: 'hydration',
    goal: 'water',
    title: WATER.title,
    duration: WATER.effort,
    easierVariant: { title: WATER.easierTitle, duration: WATER.easierEffort },
    evidenceGrade: 'B',
    safetyTier: 'S2',
    contraindications: [
      { context: 'Clinically advised to limit fluids (some kidney/heart conditions)', disposition: 'skip-for-now', resolution: 'If your clinician has advised limiting fluids, skip this one — swap for another action.' },
    ],
    claim: {
      permitted: 'A glass of water — many people feel a little fresher.',
      forbidden: forbidden('"flushes toxins"', '"boosts metabolism"'),
    },
    mechanisms: ['§3.1 cues', '§3.4 reinforcement (immediate simple completion)'],
    review: review('B'),
    status: 'approved',
  },
  {
    id: 'water-bottle',
    category: 'hydration',
    goal: 'water',
    title: 'Fill your bottle and take three sips',
    duration: '1 min',
    easierVariant: { title: 'One sip to start', duration: '15 sec' },
    evidenceGrade: 'B',
    safetyTier: 'S2',
    contraindications: [
      { context: 'Clinically advised to limit fluids', disposition: 'skip-for-now', resolution: 'Skip and swap if fluids are restricted for you.' },
    ],
    claim: {
      permitted: 'Keeping water nearby helps many people remember to sip.',
      forbidden: forbidden('"you must drink 8 glasses a day"'),
    },
    mechanisms: ['§3.1 cues', '§3.2 implementation intentions'],
    review: review('B'),
    status: 'approved',
  },
  {
    id: 'water-reach',
    category: 'hydration',
    goal: 'water',
    title: 'Pour a glass of water and keep it within reach',
    duration: '1 min',
    easierVariant: { title: 'Move a glass you already have closer', duration: '10 sec' },
    evidenceGrade: 'B',
    safetyTier: 'S2',
    contraindications: [
      { context: 'Clinically advised to limit fluids', disposition: 'skip-for-now', resolution: 'Skip and swap if fluids are restricted for you.' },
    ],
    claim: {
      permitted: 'Having water in sight is a small, broadly sensible nudge.',
      forbidden: forbidden('"hydration cures fatigue"'),
    },
    mechanisms: ['§3.1 cues (environment design)'],
    review: review('B'),
    status: 'approved',
  },

  /* ---- Calm & grounding (grade C: calming effect is plausible/popular, evidence emerging) */
  {
    id: 'calm-breathing',
    category: 'calm',
    goal: 'calm',
    title: CALM.title,
    duration: CALM.effort,
    easierVariant: { title: CALM.easierTitle, duration: CALM.easierEffort },
    evidenceGrade: 'C',
    safetyTier: 'S3',
    contraindications: [
      { context: 'Panic, anxiety around breath focus, or a respiratory condition', disposition: 'advise-check', resolution: 'Fully optional — stop anytime; offer a non-breathing calm action instead.' },
    ],
    claim: {
      permitted: 'Lots of people find a minute of slow breathing helps them feel calmer.',
      forbidden: forbidden('"reduces anxiety"', '"treats stress"', '"lowers cortisol"'),
    },
    mechanisms: ['§3.8 positive affect (grade C — build & test)', '§3.9 autonomy (fully optional)'],
    review: review('C'),
    status: 'approved',
  },
  {
    id: 'calm-grounding',
    category: 'calm',
    goal: 'calm',
    title: 'Notice three things you can see, hear, and feel',
    duration: '1 min',
    easierVariant: { title: 'Name one thing you can see right now', duration: '15 sec' },
    evidenceGrade: 'C',
    safetyTier: 'S2',
    contraindications: [
      { context: 'Finds attention exercises distressing', disposition: 'advise-check', resolution: 'Optional with an easy opt-out — never forced.' },
    ],
    claim: {
      permitted: 'Many people find a short grounding pause settling.',
      forbidden: forbidden('"treats anxiety or PTSD"'),
    },
    mechanisms: ['§3.8 positive affect', '§3.9 autonomy'],
    review: review('C'),
    status: 'approved',
  },
  {
    id: 'calm-hand-heart',
    category: 'calm',
    goal: 'calm',
    title: 'Rest a hand on your chest and breathe out slowly',
    duration: '30 sec',
    easierVariant: { title: 'One long breath out', duration: '10 sec' },
    evidenceGrade: 'C',
    safetyTier: 'S3',
    contraindications: [
      { context: 'Discomfort with breath focus', disposition: 'offer-easier', resolution: 'Just the single breath out, or skip — your choice.' },
    ],
    claim: {
      permitted: 'A slow breath out is something many people find soothing.',
      forbidden: forbidden('"activates your vagus nerve to heal stress"'),
    },
    mechanisms: ['§3.8 positive affect', '§3.9 autonomy'],
    review: review('C'),
    status: 'approved',
  },

  /* ---- Posture & gentle stretch (grade B: ease/comfort for many; keep gentle) */
  {
    id: 'posture-neck',
    category: 'posture',
    goal: null,
    title: 'A gentle neck stretch, each side',
    duration: '40 sec',
    easierVariant: { title: 'Tilt your head gently to one side', duration: '10 sec' },
    evidenceGrade: 'B',
    safetyTier: 'S3',
    contraindications: [
      { context: 'Neck injury, pain, or recent surgery', disposition: 'skip-for-now', resolution: 'Skip if it causes any pain; offer a shoulder roll instead.' },
    ],
    claim: {
      permitted: 'A gentle stretch is associated with feeling a little looser for many people.',
      forbidden: forbidden('"fixes your neck pain"'),
    },
    mechanisms: ['§3.7 action simplicity'],
    review: review('B'),
    status: 'approved',
  },
  {
    id: 'posture-reset',
    category: 'posture',
    goal: null,
    title: 'Stand tall and roll your shoulders back',
    duration: '20 sec',
    easierVariant: { title: 'Sit tall and lengthen your spine', duration: '10 sec' },
    evidenceGrade: 'B',
    safetyTier: 'S1',
    contraindications: [
      { context: 'Shoulder pain', disposition: 'offer-easier', resolution: 'Keep the movement small, or just lengthen your spine.' },
    ],
    claim: {
      permitted: 'A quick posture reset helps many people feel a bit more comfortable.',
      forbidden: forbidden('"corrects your posture permanently"'),
    },
    mechanisms: ['§3.7 action simplicity', '§3.1 cues'],
    review: review('B'),
    status: 'approved',
  },
  {
    id: 'posture-reach',
    category: 'posture',
    goal: null,
    title: 'Reach both arms overhead and lengthen',
    duration: '20 sec',
    easierVariant: { title: 'Reach one arm up gently', duration: '10 sec' },
    evidenceGrade: 'B',
    safetyTier: 'S2',
    contraindications: [
      { context: 'Shoulder injury', disposition: 'offer-easier', resolution: 'One arm, small range — or skip.' },
    ],
    claim: {
      permitted: 'A gentle reach is associated with feeling a little more at ease for many people.',
      forbidden: forbidden('"realigns your spine"'),
    },
    mechanisms: ['§3.7 action simplicity'],
    review: review('B'),
    status: 'approved',
  },

  /* ---- Connection (grade B: staying connected is broadly good for wellbeing) */
  {
    id: 'connect-message',
    category: 'connection',
    goal: null,
    title: 'Send a warm message to someone you like',
    duration: '2 min',
    easierVariant: { title: 'Think of someone and smile', duration: '15 sec' },
    evidenceGrade: 'B',
    safetyTier: 'S1',
    contraindications: [
      { context: 'Prefers not to reach out right now', disposition: 'offer-easier', resolution: 'The thought alone counts — no need to send anything.' },
    ],
    claim: {
      permitted: 'Staying connected is broadly good for wellbeing.',
      forbidden: forbidden('"cures loneliness"'),
    },
    mechanisms: ['§3.8 positive affect', '§3.12 identity (optional)'],
    review: review('B'),
    status: 'approved',
  },
  {
    id: 'connect-thanks',
    category: 'connection',
    goal: null,
    title: 'Tell someone one thing you appreciate about them',
    duration: '1 min',
    easierVariant: { title: 'Note one person you’re grateful for', duration: '20 sec' },
    evidenceGrade: 'B',
    safetyTier: 'S1',
    contraindications: [
      { context: 'No one to reach right now', disposition: 'offer-easier', resolution: 'Just noting the person to yourself counts.' },
    ],
    claim: {
      permitted: 'Small moments of appreciation feel good for many people.',
      forbidden: forbidden('"rewires your brain for happiness"'),
    },
    mechanisms: ['§3.8 positive affect'],
    review: review('B'),
    status: 'approved',
  },
  {
    id: 'connect-hello',
    category: 'connection',
    goal: null,
    title: 'Say hello to someone nearby',
    duration: '1 min',
    easierVariant: { title: 'Make eye contact and smile at someone', duration: '10 sec' },
    evidenceGrade: 'B',
    safetyTier: 'S1',
    contraindications: [
      { context: 'Alone, or not comfortable right now', disposition: 'offer-easier', resolution: 'A friendly thought toward someone counts too.' },
    ],
    claim: {
      permitted: 'A small friendly exchange is broadly good for wellbeing.',
      forbidden: forbidden('"prevents social isolation disease"'),
    },
    mechanisms: ['§3.8 positive affect'],
    review: review('B'),
    status: 'approved',
  },

  /* ---- Nourishment (grade B: additive, non-restrictive only — never a diet rule, §2.2) */
  {
    id: 'nourish-fruit',
    category: 'nourishment',
    goal: null,
    title: 'Eat a piece of fruit',
    duration: '2 min',
    easierVariant: { title: 'A few bites of fruit', duration: '30 sec' },
    evidenceGrade: 'B',
    safetyTier: 'S2',
    contraindications: [
      { context: 'Fruit allergy or a clinically advised diet', disposition: 'skip-for-now', resolution: 'Skip and swap for a non-food action if fruit doesn’t suit you.' },
    ],
    claim: {
      permitted: 'Adding a little fruit is a nice, broadly sensible thing to do for yourself.',
      forbidden: forbidden('"detoxes your body"', '"cut carbs instead"'),
    },
    mechanisms: ['§3.7 action simplicity (additive, never restrictive)'],
    review: review('B'),
    status: 'approved',
  },

  /* ---- Rest for eyes & attention (grade C: sensible, evidence modest) */
  {
    id: 'rest-eyes-2020',
    category: 'rest',
    goal: null,
    title: 'Look at something far away for twenty seconds',
    duration: '20 sec',
    easierVariant: { title: 'Close your eyes and rest them for ten seconds', duration: '10 sec' },
    evidenceGrade: 'C',
    safetyTier: 'S1',
    contraindications: [],
    claim: {
      permitted: 'Many people find a short look into the distance restful for tired eyes.',
      forbidden: forbidden('"prevents myopia"', '"improves your eyesight"'),
    },
    mechanisms: ['§3.1 cues (screen breaks)'],
    review: review('C'),
    status: 'approved',
  },
  {
    id: 'rest-close-eyes',
    category: 'rest',
    goal: null,
    title: 'Close your eyes and take a slow breath',
    duration: '20 sec',
    easierVariant: { title: 'Soften your gaze for a moment', duration: '10 sec' },
    evidenceGrade: 'C',
    safetyTier: 'S1',
    contraindications: [
      { context: 'Doing something that needs your eyes (driving, cooking)', disposition: 'skip-for-now', resolution: 'Hold the suggestion until it’s safe to pause.' },
    ],
    claim: {
      permitted: 'A brief pause with your eyes closed is something many people find restful.',
      forbidden: forbidden('"treats burnout"'),
    },
    mechanisms: ['§3.8 positive affect', '§3.9 autonomy'],
    review: review('C'),
    status: 'approved',
  },

  /* ---- Reflection (grade C: gratitude/reflection is plausible/popular, evidence emerging) */
  {
    id: 'reflect-gratitude',
    category: 'rest',
    goal: null,
    title: 'Note one small thing that went well today',
    duration: '1 min',
    easierVariant: { title: 'Think of one good thing from today', duration: '15 sec' },
    evidenceGrade: 'C',
    safetyTier: 'S1',
    contraindications: [
      { context: 'A hard day when nothing feels good', disposition: 'advise-check', resolution: 'It’s fine to skip — some days there isn’t one, and that’s okay.' },
    ],
    claim: {
      permitted: 'Lots of people find noting a small good moment lifts the day a little.',
      forbidden: forbidden('"cures depression"', '"guarantees happiness"'),
    },
    mechanisms: ['§3.8 positive affect', '§3.12 identity (optional)'],
    review: review('C'),
    status: 'approved',
  },
  {
    id: 'reflect-one-good',
    category: 'rest',
    goal: null,
    title: 'Jot one word for how you want to feel next',
    duration: '30 sec',
    easierVariant: { title: 'Think of the word — no need to write it', duration: '10 sec' },
    evidenceGrade: 'C',
    safetyTier: 'S1',
    contraindications: [],
    claim: {
      permitted: 'A small intention is something many people find grounding.',
      forbidden: forbidden('"manifests your goals"'),
    },
    mechanisms: ['§3.3 goals (proximal, self-set)', '§3.9 autonomy'],
    review: review('C'),
    status: 'approved',
  },
]

/* ----------------------------------------------------------- lookups ------- */

/** Human-readable labels for each category (used by the viewer and TASK-025). */
export const CATEGORY_LABELS: Record<CatalogCategory, string> = {
  movement: 'Move a little',
  outdoors: 'Step outside',
  hydration: 'Water',
  calm: 'Feel calmer',
  posture: 'Posture & stretch',
  connection: 'Connection',
  nourishment: 'Nourishment',
  rest: 'Rest & reflect',
}

/** Plain-language gloss of each shippable evidence grade (rubric §3.1), for the UI legend. */
export const GRADE_MEANING: Record<EvidenceGrade, string> = {
  A: 'Established universal recommendation',
  B: 'Well-supported',
  C: 'Plausible / emerging',
}

/** Plain-language gloss of each shippable safety tier (rubric §3.2). */
export const SAFETY_MEANING: Record<SafetyTier, string> = {
  S1: 'Negligible risk for general adults',
  S2: 'Low risk with common-sense caveats',
  S3: 'Low risk with a gentle self-check',
}

/** The fixed display order for categories in the viewer. */
export const CATEGORY_ORDER: readonly CatalogCategory[] = [
  'movement',
  'outdoors',
  'hydration',
  'calm',
  'posture',
  'connection',
  'nourishment',
  'rest',
]

/** All approved records in a category, in catalog order. */
export function catalogByCategory(category: CatalogCategory): readonly ActionRecord[] {
  return ACTION_CATALOG.filter((record) => record.category === category)
}

/** All approved records mapped to a goal chip (the recommendation engine's first filter, TASK-025). */
export function catalogForGoal(goal: GoalId): readonly ActionRecord[] {
  return ACTION_CATALOG.filter((record) => record.goal === goal)
}

/** Look up a single record by id. */
export function findAction(id: string): ActionRecord | undefined {
  return ACTION_CATALOG.find((record) => record.id === id)
}

/** Total number of approved records (acceptance criterion requires ≥ 20). */
export const CATALOG_COUNT = ACTION_CATALOG.length
