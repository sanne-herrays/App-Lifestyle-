/**
 * TASK-035 — Habit automaticity survey.
 *
 * "Capture periodic validated or clearly labeled exploratory automaticity measures."
 *
 * Acceptance criterion (tasks.json TASK-035):
 *   "Survey version and attribution stored; optional completion; baseline and
 *    follow-up results can be compared."
 *
 *   - Survey version and attribution stored → every `SurveyResponse` snapshots the
 *     instrument `instrumentId` + `instrumentVersion` AND a verbatim `attribution`
 *     citation at the moment it was taken, plus the storage `schemaVersion`. The
 *     record is therefore self-describing: a later reader knows exactly which
 *     instrument (and which version of it) produced the numbers, even if the
 *     instrument definition is revised afterwards.
 *   - Optional completion → taking the survey is strictly opt-in (`SURVEY_IS_OPTIONAL`),
 *     nothing is ever auto-recorded, a draft can be abandoned at any point, and an
 *     incomplete draft is a first-class state (`isComplete` false → `scoreResponse`
 *     null) rather than an error. Missing a reflection is never a failure.
 *   - Baseline and follow-up compared → responses are tagged `phase` ('baseline' |
 *     'follow_up') and time-stamped; `compareResponses` / `compareBaselineToLatest`
 *     return the honest delta between a baseline and a follow-up — but ONLY when they
 *     share the same instrument version and are both complete, so a comparison can
 *     never silently mix instruments or score a half-finished reflection.
 *
 * The instrument is the **validated** Self-Report Behavioural Automaticity Index
 * (SRBAI) — the four-item automaticity subscale of the SRHI — exactly as the project's
 * own evidence register names it (docs/research/behavior-change-evidence-register.md
 * §3.6: "Measure automaticity with the SRBAI (4 items), labeled by instrument +
 * version"). Grade A, validated. Items are reproduced verbatim with full attribution
 * (the paper is open-access, CC BY), honouring the §3.6 note that SRHI/SRBAI wording
 * and scoring "must be reproduced exactly and attributed".
 *
 * Integrity (CLAUDE.md §3): automaticity is a behavioural construct, not a health
 * outcome — this measures *how automatic a behaviour feels*, and the comparison copy
 * is careful never to imply disease prevention or any clinical result. Zero-Guilt
 * (CLAUDE.md §1): there is no pass/fail, a lower score is never shamed, and skipping
 * is always fine; every surfaced string is scanned by the shared `isGuiltFree` guard.
 *
 * Framework-agnostic: imports no React (only the React-free `isGuiltFree` with a `.ts`
 * specifier and a type-only `GoalId`), so the deterministic suite in
 * `automaticitySurvey.test.ts` runs it directly under Node's TS stripping, exactly
 * like `ledger.ts` / `restart.ts` / `activation.ts`.
 */

import type { GoalId } from '../flows/flowData'
import { isGuiltFree } from './restart.ts'

export { isGuiltFree }

/** Storage schema version stamped on every stored response (lets a later migration read old rows). */
export const AUTOMATICITY_SCHEMA_VERSION = 1

/** Taking the survey is always opt-in — the product never forces a reflection (CLAUDE.md §1). */
export const SURVEY_IS_OPTIONAL = true

/** When a response was captured relative to the behaviour-building journey. */
export type SurveyPhase = 'baseline' | 'follow_up'

export const SURVEY_PHASES: readonly SurveyPhase[] = ['baseline', 'follow_up']

export function isSurveyPhase(value: unknown): value is SurveyPhase {
  return value === 'baseline' || value === 'follow_up'
}

/* ============================================================ instrument ==== */

/** One anchored point on the Likert response scale. */
export interface LikertAnchor {
  value: number
  label: string
}

/** One survey item. `validated` distinguishes a published-instrument item from an exploratory one. */
export interface SurveyItem {
  id: string
  /** The item completion, read after the behaviour stem ("… is something I do automatically."). */
  text: string
  /** True for an item from a validated instrument; false would mark a clearly-labeled exploratory item. */
  validated: boolean
  /** Whether a higher raw answer means *less* automaticity (none of the SRBAI items are reversed). */
  reverseScored: boolean
}

/** Full, citable provenance for a survey instrument. Stored (as a snapshot) on every response. */
export interface InstrumentAttribution {
  instrumentName: string
  authors: string
  year: number
  /** A single-line, reproducible academic citation. */
  citation: string
  /** Journal / DOI the instrument was published in. */
  source: string
  /** Evidence grade from the project register (A = validated instrument). */
  evidenceGrade: 'A' | 'B' | 'C'
  /** True only for a psychometrically validated instrument. */
  validated: boolean
  /** How the wording may be reproduced (licensing / terms). */
  licenseNote: string
}

/** A versioned, attributed survey instrument. */
export interface SurveyInstrument {
  id: string
  version: string
  /** Rendered as "{behaviour} is something I …" — the SRHI/SRBAI stem. */
  stemTemplate: string
  scale: {
    min: number
    max: number
    anchors: readonly LikertAnchor[]
  }
  items: readonly SurveyItem[]
  scoringNote: string
  attribution: InstrumentAttribution
}

/**
 * The validated SRBAI instrument (v1.0). Four items, 1–7 agreement scale, scored as the
 * mean of the items (range 1–7, higher = more automatic). Items reproduced verbatim from
 * the open-access source with attribution.
 */
export const SRBAI: SurveyInstrument = {
  id: 'SRBAI',
  version: '1.0',
  stemTemplate: '{behaviour} is something I…',
  scale: {
    min: 1,
    max: 7,
    anchors: [
      { value: 1, label: 'Strongly disagree' },
      { value: 4, label: 'Neither agree nor disagree' },
      { value: 7, label: 'Strongly agree' },
    ],
  },
  items: [
    { id: 'srbai_1', text: 'do automatically.', validated: true, reverseScored: false },
    { id: 'srbai_2', text: 'do without having to consciously remember.', validated: true, reverseScored: false },
    { id: 'srbai_3', text: 'do without thinking.', validated: true, reverseScored: false },
    { id: 'srbai_4', text: 'start doing before I realise I’m doing it.', validated: true, reverseScored: false },
  ],
  scoringNote:
    'Score = the mean of the four item answers (range 1–7). A higher mean reflects a behaviour that feels more automatic. There is no threshold to “pass”.',
  attribution: {
    instrumentName: 'Self-Report Behavioural Automaticity Index (SRBAI)',
    authors: 'Gardner, B., Abraham, C., Lally, P., & de Bruijn, G-J.',
    year: 2012,
    citation:
      'Gardner, B., Abraham, C., Lally, P., & de Bruijn, G-J. (2012). Towards parsimony in habit measurement: Testing the convergent and predictive validity of an automaticity subscale of the Self-Report Habit Index. International Journal of Behavioral Nutrition and Physical Activity, 9:102.',
    source: 'Int. J. Behavioral Nutrition and Physical Activity, 9:102. doi:10.1186/1479-5868-9-102',
    evidenceGrade: 'A',
    validated: true,
    licenseNote:
      'Published open-access (BioMed Central, CC BY 2.0). The four items are reproduced verbatim with attribution, as recommended for the instrument.',
  },
}

/** Default instrument used when a caller does not supply one. */
export const DEFAULT_INSTRUMENT: SurveyInstrument = SRBAI

/** The behaviour phrase inserted into the stem for each goal (kept general-benefit, never a health claim). */
export const BEHAVIOUR_PHRASE: Record<GoalId, string> = {
  move: 'Moving a little each day',
  calm: 'Taking a quiet moment each day',
  water: 'Drinking a glass of water each day',
  outside: 'Stepping outside each day',
}

/** The full stem for a goal: "{behaviour} is something I…". */
export function stemFor(goal: GoalId, instrument: SurveyInstrument = DEFAULT_INSTRUMENT): string {
  return instrument.stemTemplate.replace('{behaviour}', BEHAVIOUR_PHRASE[goal])
}

/** The full sentence for one item under a goal (stem + item completion), for display and screen readers. */
export function itemSentence(goal: GoalId, item: SurveyItem, instrument: SurveyInstrument = DEFAULT_INSTRUMENT): string {
  return `${stemFor(goal, instrument)} ${item.text}`
}

/* ------------------------------------------------- attribution integrity ---- */

/** True when an attribution is fully populated — no empty provenance may be stored. */
export function attributionComplete(a: InstrumentAttribution): boolean {
  return (
    a.instrumentName.trim().length > 0 &&
    a.authors.trim().length > 0 &&
    Number.isFinite(a.year) &&
    a.citation.trim().length > 0 &&
    a.source.trim().length > 0 &&
    a.licenseNote.trim().length > 0
  )
}

/* ============================================================ responses ===== */

/** A completed-or-partial survey response, carrying its own version + attribution snapshot. */
export interface SurveyResponse {
  responseId: string
  /** Which instrument produced this response. */
  instrumentId: string
  /** The exact instrument version at capture time. */
  instrumentVersion: string
  /** Verbatim attribution snapshot, so the stored record is self-describing. */
  attributionCitation: string
  /** Storage schema version. */
  schemaVersion: number
  phase: SurveyPhase
  /** Item id → raw answer (within the instrument scale). May omit items on a partial draft. */
  answers: Readonly<Record<string, number>>
  /** Optional coarse behaviour bucket (never free-text health content). */
  goalCategory?: GoalId
  /** Device clock when the response was captured, ms since epoch. */
  completedAt: number
}

/** Everything the caller supplies to build a response; version/attribution/schema are stamped for them. */
export interface ResponseInput {
  responseId: string
  phase: SurveyPhase
  answers: Readonly<Record<string, number>>
  completedAt: number
  goalCategory?: GoalId
  instrument?: SurveyInstrument
}

/**
 * Build a `SurveyResponse`, stamping the instrument id + version, a verbatim attribution
 * snapshot and the storage schema version onto it. Pure: the id and clock are injected by
 * the caller, so the stamping is deterministically testable. Only answers that are finite
 * and within the instrument scale are retained — a stored response can never carry an
 * out-of-range value.
 */
export function buildResponse(input: ResponseInput): SurveyResponse {
  const instrument = input.instrument ?? DEFAULT_INSTRUMENT
  // Only pull answers for the instrument's own items, each validated against the scale, so an
  // unknown item id or an out-of-range value can never enter the stored record.
  const clean: Record<string, number> = {}
  for (const item of instrument.items) {
    const value = input.answers[item.id]
    if (value !== undefined && isValidAnswer(value, instrument)) clean[item.id] = value
  }
  return {
    responseId: input.responseId,
    instrumentId: instrument.id,
    instrumentVersion: instrument.version,
    attributionCitation: instrument.attribution.citation,
    schemaVersion: AUTOMATICITY_SCHEMA_VERSION,
    phase: input.phase,
    answers: clean,
    ...(input.goalCategory ? { goalCategory: input.goalCategory } : {}),
    completedAt: input.completedAt,
  }
}

/** True when a raw answer is a finite number within the instrument's scale. */
export function isValidAnswer(value: unknown, instrument: SurveyInstrument = DEFAULT_INSTRUMENT): value is number {
  return (
    typeof value === 'number' &&
    Number.isFinite(value) &&
    value >= instrument.scale.min &&
    value <= instrument.scale.max
  )
}

/** True when every instrument item has a valid answer — the survey is fully completed. */
export function isComplete(response: SurveyResponse, instrument: SurveyInstrument = DEFAULT_INSTRUMENT): boolean {
  return instrument.items.every((item) => isValidAnswer(response.answers[item.id], instrument))
}

/** How many of the instrument's items have been answered so far (for a gentle progress hint). */
export function answeredCount(
  answers: Readonly<Record<string, number>>,
  instrument: SurveyInstrument = DEFAULT_INSTRUMENT,
): number {
  return instrument.items.reduce((n, item) => (isValidAnswer(answers[item.id], instrument) ? n + 1 : n), 0)
}

/**
 * The automaticity score: the mean of the (direction-corrected) item answers, in the
 * instrument's scale units. Returns null for an incomplete response — completion is
 * optional, so a half-finished reflection has no score rather than a misleading one.
 */
export function scoreResponse(response: SurveyResponse, instrument: SurveyInstrument = DEFAULT_INSTRUMENT): number | null {
  if (!isComplete(response, instrument)) return null
  const { min, max } = instrument.scale
  let sum = 0
  for (const item of instrument.items) {
    const raw = response.answers[item.id]
    if (raw === undefined) return null // unreachable after isComplete, but keeps the type honest
    sum += item.reverseScored ? min + max - raw : raw
  }
  return sum / instrument.items.length
}

/** A warm, non-judgemental band for a score. Describes feel, never a pass/fail (CLAUDE.md §1). */
export type AutomaticityBand = 'emerging' | 'developing' | 'strong'

export function automaticityBand(score: number | null): AutomaticityBand | null {
  if (score === null) return null
  if (score < 3) return 'emerging'
  if (score < 5) return 'developing'
  return 'strong'
}

/** Warm label + description for each band (no "low/poor", no shame). */
export const BAND_COPY: Record<AutomaticityBand, { label: string; note: string }> = {
  emerging: {
    label: 'Just taking root',
    note: 'This still takes a little intention — completely normal early on. Repetition is doing its quiet work.',
  },
  developing: {
    label: 'Settling in',
    note: 'The behaviour is starting to run on its own some of the time. A lovely place to be.',
  },
  strong: {
    label: 'Feels automatic',
    note: 'This largely happens without thinking now — a sign it may be ready to need less prompting.',
  },
}

/* ---------------------------------------------- baseline vs follow-up compare -- */

/** The result of comparing a baseline reflection with a later follow-up. */
export interface SurveyComparison {
  comparable: boolean
  /** Empty when comparable; otherwise a plain reason it isn't. */
  reason: string
  baselineScore: number | null
  followUpScore: number | null
  /** followUp − baseline, in scale units; null when not comparable. */
  delta: number | null
  direction: 'up' | 'down' | 'same' | null
  /** Honest framing shown with any comparison — behavioural, never a health-outcome claim. */
  note: string
}

const COMPARISON_NOTE =
  'This compares two self-reflections taken with the same instrument version. It describes how automatic the behaviour felt — not a health result, and not a target to hit.'

/**
 * Compare a baseline response against a follow-up. A comparison is only valid when both
 * responses use the SAME instrument id + version and are BOTH complete — otherwise it is
 * marked not-comparable with a plain reason, so two different instruments (or a
 * half-finished reflection) can never be silently differenced.
 */
export function compareResponses(
  baseline: SurveyResponse,
  followUp: SurveyResponse,
  instrument: SurveyInstrument = DEFAULT_INSTRUMENT,
): SurveyComparison {
  const baselineScore = scoreResponse(baseline, instrument)
  const followUpScore = scoreResponse(followUp, instrument)

  if (baseline.instrumentId !== followUp.instrumentId || baseline.instrumentVersion !== followUp.instrumentVersion) {
    return {
      comparable: false,
      reason: 'The two reflections used different instrument versions, so their scores are not directly comparable.',
      baselineScore,
      followUpScore,
      delta: null,
      direction: null,
      note: COMPARISON_NOTE,
    }
  }
  if (baselineScore === null || followUpScore === null) {
    return {
      comparable: false,
      reason: 'One of the reflections is not complete yet — a score appears once all four items are answered.',
      baselineScore,
      followUpScore,
      delta: null,
      direction: null,
      note: COMPARISON_NOTE,
    }
  }

  const delta = followUpScore - baselineScore
  const direction: 'up' | 'down' | 'same' = delta > 1e-9 ? 'up' : delta < -1e-9 ? 'down' : 'same'
  return {
    comparable: true,
    reason: '',
    baselineScore,
    followUpScore,
    delta,
    direction,
    note: COMPARISON_NOTE,
  }
}

/** The accumulated survey history for this device. */
export interface AutomaticityState {
  responses: readonly SurveyResponse[]
}

/** A fresh, empty history. */
export function emptyAutomaticity(): AutomaticityState {
  return { responses: [] }
}

/** The earliest baseline response, or null if none has been taken. */
export function earliestBaseline(state: AutomaticityState): SurveyResponse | null {
  let earliest: SurveyResponse | null = null
  for (const r of state.responses) {
    if (r.phase !== 'baseline') continue
    if (earliest === null || r.completedAt < earliest.completedAt) earliest = r
  }
  return earliest
}

/** The latest follow-up response, or null if none has been taken. */
export function latestFollowUp(state: AutomaticityState): SurveyResponse | null {
  let latest: SurveyResponse | null = null
  for (const r of state.responses) {
    if (r.phase !== 'follow_up') continue
    if (latest === null || r.completedAt > latest.completedAt) latest = r
  }
  return latest
}

/**
 * Compare the earliest baseline with the latest follow-up in the history. Returns null when
 * either side is missing (there is simply nothing to compare yet — not a failure state).
 */
export function compareBaselineToLatest(
  state: AutomaticityState,
  instrument: SurveyInstrument = DEFAULT_INSTRUMENT,
): SurveyComparison | null {
  const baseline = earliestBaseline(state)
  const followUp = latestFollowUp(state)
  if (!baseline || !followUp) return null
  return compareResponses(baseline, followUp, instrument)
}

/* ------------------------------------------------------------------ copy ---- */

/** Every static piece of copy the survey surface can show, for the guilt-free scan. */
export function surveyCopy(): readonly string[] {
  const lines: string[] = [
    'A gentle check-in',
    'How automatic does it feel?',
    'This is a reflection, not a test — there is no score to pass and nothing is ever shared.',
    'Taking it is completely optional. You can stop at any point and come back whenever you like.',
    SRBAI.scoringNote,
    COMPARISON_NOTE,
    'Baseline',
    'Follow-up',
    'Rate each line from “Strongly disagree” to “Strongly agree”.',
    'Save this reflection',
    'Skip for now',
    'A score appears once all four items are answered.',
    'Nothing here is a health result — it only describes how automatic the behaviour feels.',
  ]
  for (const item of SRBAI.items) {
    lines.push(item.text)
  }
  for (const anchor of SRBAI.scale.anchors) {
    lines.push(anchor.label)
  }
  for (const band of ['emerging', 'developing', 'strong'] as const) {
    lines.push(BAND_COPY[band].label, BAND_COPY[band].note)
  }
  for (const goal of ['move', 'calm', 'water', 'outside'] as const) {
    lines.push(BEHAVIOUR_PHRASE[goal])
  }
  return lines
}

/* ------------------------------------------------- durable serialization ---- */

export function serialize(state: AutomaticityState): string {
  return JSON.stringify(state)
}

/** True when a parsed value is a well-formed, in-scale response for the given instrument. */
export function isPlainResponse(raw: unknown, instrument: SurveyInstrument = DEFAULT_INSTRUMENT): raw is SurveyResponse {
  if (typeof raw !== 'object' || raw === null) return false
  const r = raw as Record<string, unknown>
  if (typeof r.responseId !== 'string' || r.responseId.length === 0) return false
  if (typeof r.instrumentId !== 'string' || r.instrumentId.length === 0) return false
  if (typeof r.instrumentVersion !== 'string' || r.instrumentVersion.length === 0) return false
  if (typeof r.attributionCitation !== 'string' || r.attributionCitation.trim().length === 0) return false
  if (r.schemaVersion !== AUTOMATICITY_SCHEMA_VERSION) return false
  if (!isSurveyPhase(r.phase)) return false
  if (typeof r.completedAt !== 'number' || !Number.isFinite(r.completedAt)) return false
  if (r.goalCategory !== undefined && !isGoalCategory(r.goalCategory)) return false
  if (typeof r.answers !== 'object' || r.answers === null) return false
  const answers = r.answers as Record<string, unknown>
  for (const key of Object.keys(answers)) {
    if (!isValidAnswer(answers[key], instrument)) return false
  }
  return true
}

function isGoalCategory(value: unknown): value is GoalId {
  return value === 'move' || value === 'calm' || value === 'water' || value === 'outside'
}

/**
 * Parse durably-stored history. Anything malformed — a missing version/attribution, a wrong
 * schema version, or an out-of-scale answer — is dropped rather than trusted, so a reload can
 * never resurrect a response that lost its provenance or carries an impossible value.
 */
export function deserialize(raw: string | null, instrument: SurveyInstrument = DEFAULT_INSTRUMENT): AutomaticityState | null {
  if (!raw) return null
  try {
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return null
    const record = parsed as Record<string, unknown>
    const rawResponses = Array.isArray(record.responses) ? record.responses : []
    const responses: SurveyResponse[] = []
    const seen = new Set<string>()
    for (const item of rawResponses) {
      if (!isPlainResponse(item, instrument)) continue
      if (seen.has(item.responseId)) continue
      seen.add(item.responseId)
      responses.push(item)
    }
    return { responses }
  } catch {
    return null
  }
}

/* ============================================================ live store ==== */
/* A singleton, localStorage-backed store with subscribe/broadcast fan-out — the same
 * shape as lib/activation.ts and lib/ledger.ts. Built on the pure core above, so it
 * inherits the tested version/attribution and comparison guarantees. */

const STORAGE_KEY = 'herrays.automaticity.v1'

/** Mint a fresh, non-identifying response id. */
export function newResponseId(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return `resp-${crypto.randomUUID()}`
    }
  } catch {
    /* fall through to the manual id */
  }
  return `resp-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e9).toString(36)}`
}

function readStore(): AutomaticityState {
  if (typeof localStorage === 'undefined') return emptyAutomaticity()
  try {
    const stored = deserialize(localStorage.getItem(STORAGE_KEY))
    if (stored) return stored
  } catch {
    /* fall through to a fresh, empty history */
  }
  return emptyAutomaticity()
}

let state: AutomaticityState = readStore()
const listeners = new Set<(state: AutomaticityState) => void>()

function persist(): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, serialize(state))
  } catch {
    /* no-op: an unpersistable store still works for the session */
  }
}

function emit(): void {
  persist()
  for (const listener of listeners) listener(state)
}

export function getAutomaticity(): AutomaticityState {
  return state
}

export function subscribeAutomaticity(listener: (state: AutomaticityState) => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/**
 * Record a completed reflection to the live store. Opt-in only: the caller invokes this on an
 * explicit save, never automatically. The id and clock are read here, at the edge, so the pure
 * core stays deterministic. Returns the stored response.
 */
export function recordResponse(
  phase: SurveyPhase,
  answers: Readonly<Record<string, number>>,
  goalCategory?: GoalId,
  instrument: SurveyInstrument = DEFAULT_INSTRUMENT,
): SurveyResponse {
  const response = buildResponse({
    responseId: newResponseId(),
    phase,
    answers,
    completedAt: Date.now(),
    ...(goalCategory ? { goalCategory } : {}),
    instrument,
  })
  state = { responses: [...state.responses, response] }
  emit()
  return response
}

/** Clear the stored history (used by the demo's reset control). */
export function clearResponses(): void {
  state = emptyAutomaticity()
  emit()
}
