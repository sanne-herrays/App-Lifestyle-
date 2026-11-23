/**
 * TASK-037 — Premium entitlement gate.
 *
 * "Separate free one-habit experience from premium multi-habit features."
 *
 * Acceptance criterion (tasks.json TASK-037):
 *   "Free user completes core loop; premium access requires valid entitlement;
 *    expired entitlement restores free access."
 *
 *   - Free user completes core loop → the daily loop (pick a little win → complete
 *     it → feel the reward → return / gentle restart → basic progress) is made of
 *     `coreLoop` features that are ALWAYS `free`. `isCoreLoopAvailable` is proven to
 *     return true for a user with NO entitlement at all, so a free user can run the
 *     whole loop forever without ever meeting a paywall (PRD §7 free tier: "one
 *     active habit, basic progress and essential accessibility").
 *   - Premium access requires valid entitlement → every premium feature
 *     (multiple journeys, adaptive personalization, advanced insights, richer
 *     progression — PRD §7) is gated by `canUse`, which unlocks a premium feature
 *     ONLY when `resolveEntitlement` returns an `active` entitlement: a real grant,
 *     for a known product, whose term has not elapsed at `now`.
 *   - Expired entitlement restores free access → `entitlementStatus` returns
 *     `expired` the instant `now >= expiresAt`, `resolveEntitlement` then falls the
 *     user back to the `free` tier, every premium feature re-locks, and — crucially
 *     — the core loop stays fully available (an expiry is never a lock-out and never
 *     deletes a habit; `enforceActiveLimit` *parks* extra habits, it never removes
 *     them). A downgrade is a gentle, reversible resting state, not a punishment
 *     (CLAUDE.md §1).
 *
 * Pricing (PRD §7, "test annual prices … to validate rather than assume"): three
 * annual hypothesis price points — $29.99 / $39.99 / $59.99 — are modelled as
 * products so the gate can be exercised against each, never asserted as a decision.
 *
 * Framework-agnostic: imports no React (only the React-free `isGuiltFree` guard with
 * a `.ts` specifier), so the deterministic suite in `entitlement.test.ts` runs it
 * directly under Node's TS stripping, exactly like `ledger.ts` / `activation.ts`.
 * The clock is injected into the pure core; the one `Date.now()` the live store
 * needs is read at the edge, in the store mutators, never in the decision logic.
 */

import { isGuiltFree } from './restart.ts'

export { isGuiltFree }

/** Schema version stamped on a stored entitlement (lets a later migration read old rows). */
export const ENTITLEMENT_SCHEMA_VERSION = 1

/** Milliseconds in a day — used to turn a term in days into an expiry instant. */
export const DAY_MS = 86_400_000

/** A standard annual term in days (the hypothesis offer is an annual subscription). */
export const DEFAULT_TERM_DAYS = 365

/** The two access tiers. Free is a complete product on its own, never a trial-with-a-wall. */
export type Tier = 'free' | 'premium'

/**
 * Free tier allows exactly ONE active habit at a time (PRD §7). This is not a
 * penalty — one tiny habit is the whole free promise; extra habits are the premium
 * value, not a crippling of the free loop.
 */
export const FREE_ACTIVE_HABIT_LIMIT = 1

/** Premium unlocks several concurrent journeys. A concrete, non-infinite "multiple". */
export const PREMIUM_ACTIVE_HABIT_LIMIT = 5

/* ======================================================= premium products === */

/** The annual hypothesis SKUs. These are price points to VALIDATE, never a decision. */
export type PremiumProductId = 'annual_2999' | 'annual_3999' | 'annual_5999'

/** One sellable premium product (an annual subscription at a hypothesis price). */
export interface PremiumProduct {
  id: PremiumProductId
  label: string
  /** Price in USD. Labelled a hypothesis price everywhere it surfaces. */
  priceUsd: number
  /** Billing period. All three hypothesis SKUs are annual (PRD §7). */
  period: 'year'
  /** Term length granted by one purchase, in days. */
  termDays: number
}

/** The three annual price points from PRD §7, modelled so the gate can exercise each. */
export const PREMIUM_PRODUCTS: readonly PremiumProduct[] = [
  { id: 'annual_2999', label: 'Annual · $29.99', priceUsd: 29.99, period: 'year', termDays: DEFAULT_TERM_DAYS },
  { id: 'annual_3999', label: 'Annual · $39.99', priceUsd: 39.99, period: 'year', termDays: DEFAULT_TERM_DAYS },
  { id: 'annual_5999', label: 'Annual · $59.99', priceUsd: 59.99, period: 'year', termDays: DEFAULT_TERM_DAYS },
]

export function isPremiumProductId(value: unknown): value is PremiumProductId {
  return value === 'annual_2999' || value === 'annual_3999' || value === 'annual_5999'
}

/** Look up a product by id, or null when the id is unknown (a stale/forged grant). */
export function productById(id: unknown): PremiumProduct | null {
  return PREMIUM_PRODUCTS.find((p) => p.id === id) ?? null
}

/* ============================================================== features ==== */

export type FeatureId =
  // free core-loop features — the complete daily experience a free user owns
  | 'daily_little_win'
  | 'tiny_action_fallback'
  | 'completion_reward'
  | 'gentle_restart'
  | 'basic_progress'
  | 'essential_accessibility'
  // premium features — the added value a valid entitlement unlocks (PRD §7)
  | 'multiple_habits'
  | 'adaptive_personalization'
  | 'advanced_insights'
  | 'richer_progression'

/** One catalog feature, tagged by the tier it belongs to and whether it is part of the daily loop. */
export interface Feature {
  id: FeatureId
  name: string
  description: string
  tier: Tier
  /**
   * True if the feature is part of the core daily loop (pick → complete → reward →
   * return → basic progress). Every core-loop feature is `free`, by construction, so
   * the loop can never sit behind the paywall.
   */
  coreLoop: boolean
}

/**
 * The full feature catalog. The free entries are the complete core loop plus the
 * always-on essentials (PRD §7: "one active habit, basic progress and essential
 * accessibility"); the premium entries are PRD §7's premium value.
 */
export const FEATURE_CATALOG: readonly Feature[] = [
  {
    id: 'daily_little_win',
    name: 'Your little win today',
    description: 'One tiny real-world action a day, completed in a single gesture.',
    tier: 'free',
    coreLoop: true,
  },
  {
    id: 'tiny_action_fallback',
    name: 'Easier-day fallback',
    description: 'Swap any action for its gentler variant on a hard day, and keep every past win.',
    tier: 'free',
    coreLoop: true,
  },
  {
    id: 'completion_reward',
    name: 'Completion & reward',
    description: 'Record a real action and feel the warm, immediate moment of delight.',
    tier: 'free',
    coreLoop: true,
  },
  {
    id: 'gentle_restart',
    name: 'Gentle restart',
    description: 'A warm, two-tap way back in after any time away — nothing to rebuild.',
    tier: 'free',
    coreLoop: true,
  },
  {
    id: 'basic_progress',
    name: 'Basic progress',
    description: 'See your completed opportunities and recoveries, held gently over time.',
    tier: 'free',
    coreLoop: true,
  },
  {
    id: 'essential_accessibility',
    name: 'Essential accessibility',
    description: 'Reduced-motion, screen-reader support and full keyboard control — always on.',
    tier: 'free',
    coreLoop: false,
  },
  {
    id: 'multiple_habits',
    name: 'Multiple journeys',
    description: 'Grow several tiny habits at once, each with its own cue and pace.',
    tier: 'premium',
    coreLoop: false,
  },
  {
    id: 'adaptive_personalization',
    name: 'Adaptive personalization',
    description: 'Suggestions that adapt to your goals, constraints and the moment.',
    tier: 'premium',
    coreLoop: false,
  },
  {
    id: 'advanced_insights',
    name: 'Advanced insights',
    description: 'Deeper reflections on consistency and automaticity across journeys.',
    tier: 'premium',
    coreLoop: false,
  },
  {
    id: 'richer_progression',
    name: 'Richer progression',
    description: 'A fuller seven-day journey and progressive challenges across habits.',
    tier: 'premium',
    coreLoop: false,
  },
]

/** The core-loop feature ids — the loop a free user must be able to complete end to end. */
export const CORE_LOOP_FEATURES: readonly FeatureId[] = FEATURE_CATALOG.filter((f) => f.coreLoop).map((f) => f.id)

/** The free feature ids (the whole free product). */
export const FREE_FEATURES: readonly FeatureId[] = FEATURE_CATALOG.filter((f) => f.tier === 'free').map((f) => f.id)

/** The premium feature ids (gated behind a valid entitlement). */
export const PREMIUM_FEATURES: readonly FeatureId[] = FEATURE_CATALOG.filter((f) => f.tier === 'premium').map((f) => f.id)

/** The tier a feature belongs to, or null for an unknown id. */
export function featureTier(id: FeatureId): Tier | null {
  return FEATURE_CATALOG.find((f) => f.id === id)?.tier ?? null
}

/* ========================================================= entitlement ===== */

/** The status a (possibly absent) entitlement resolves to at a given instant. */
export type EntitlementStatus = 'none' | 'active' | 'expired'

/**
 * A stored entitlement: a grant of premium for a known product, with an explicit
 * term. `expiresAt` is the period end — the instant premium lapses back to free.
 */
export interface Entitlement {
  productId: PremiumProductId
  /** When premium was granted (device clock, ms since epoch). */
  grantedAt: number
  /** When premium lapses — at or after this instant the tier falls back to free. */
  expiresAt: number
  schemaVersion: number
}

/** Structural guard: a well-formed entitlement for a known product with a sane term. */
export function isEntitlement(raw: unknown): raw is Entitlement {
  if (typeof raw !== 'object' || raw === null) return false
  const record = raw as Record<string, unknown>
  if (!isPremiumProductId(record.productId)) return false
  if (typeof record.grantedAt !== 'number' || !Number.isFinite(record.grantedAt)) return false
  if (typeof record.expiresAt !== 'number' || !Number.isFinite(record.expiresAt)) return false
  if (typeof record.schemaVersion !== 'number') return false
  // A term that ends before it starts is incoherent — reject rather than trust it.
  if (record.expiresAt < record.grantedAt) return false
  return true
}

/**
 * Build an entitlement for a product, granted at `grantedAt`, running for the
 * product's term (or an explicit `termDays` override — used by the demo to grant a
 * short, observable term). Pure: the clock is injected by the caller.
 */
export function makeEntitlement(
  productId: PremiumProductId,
  grantedAt: number,
  termDays?: number,
): Entitlement {
  const product = productById(productId)
  const days = termDays ?? product?.termDays ?? DEFAULT_TERM_DAYS
  return {
    productId,
    grantedAt,
    expiresAt: grantedAt + days * DAY_MS,
    schemaVersion: ENTITLEMENT_SCHEMA_VERSION,
  }
}

/**
 * Resolve the status of a (possibly absent) entitlement at `now`:
 *   - no entitlement, or one for an unknown product → `none`
 *   - a valid entitlement whose term has not elapsed  → `active`
 *   - a valid entitlement at or past its expiry       → `expired`
 * The `now >= expiresAt` boundary is the heart of "expired restores free access":
 * the instant the term ends, premium stops — no renewal signal is faked.
 */
export function entitlementStatus(entitlement: Entitlement | null, now: number): EntitlementStatus {
  if (!entitlement || !isEntitlement(entitlement)) return 'none'
  if (productById(entitlement.productId) === null) return 'none'
  return now >= entitlement.expiresAt ? 'expired' : 'active'
}

/** The fully-resolved access state the UI and gating read from. */
export interface EntitlementState {
  tier: Tier
  status: EntitlementStatus
  /** True only when a valid entitlement is currently active. */
  isPremium: boolean
  /** The product behind the grant, when there is one (active or expired). */
  product: PremiumProduct | null
  /** The expiry instant, when there is a grant; null when there has never been one. */
  expiresAt: number | null
  /** How many habits may be active concurrently at this tier. */
  activeHabitLimit: number
}

/**
 * Resolve the complete access state. Premium ONLY when the entitlement is `active`;
 * both `none` and `expired` land on the free tier with the free (1) habit limit —
 * so an expiry restores exactly the free experience, nothing less and nothing more.
 */
export function resolveEntitlement(entitlement: Entitlement | null, now: number): EntitlementState {
  const status = entitlementStatus(entitlement, now)
  const isPremium = status === 'active'
  const tier: Tier = isPremium ? 'premium' : 'free'
  const product = entitlement && status !== 'none' ? productById(entitlement.productId) : null
  return {
    tier,
    status,
    isPremium,
    product,
    expiresAt: entitlement && status !== 'none' ? entitlement.expiresAt : null,
    activeHabitLimit: activeHabitLimit(tier),
  }
}

/* ============================================================ the gate ====== */

/**
 * The gate itself: may this feature be used in this access state?
 *   - a free feature is always usable (the free product is complete), and
 *   - a premium feature is usable ONLY when the state is premium (an active grant).
 * An unknown feature id is denied (fail closed).
 */
export function canUse(featureId: FeatureId, state: EntitlementState): boolean {
  const tier = featureTier(featureId)
  if (tier === null) return false
  if (tier === 'free') return true
  return state.isPremium
}

/** One row for a feature-access view: the feature and whether it is unlocked right now. */
export interface FeatureAccess {
  feature: Feature
  unlocked: boolean
}

/** The whole catalog with each feature's current unlocked/locked state. */
export function featureAccess(state: EntitlementState): readonly FeatureAccess[] {
  return FEATURE_CATALOG.map((feature) => ({ feature, unlocked: canUse(feature.id, state) }))
}

/**
 * The acceptance invariant made executable: can a user in this state complete the
 * entire core loop? True iff every core-loop feature is usable — which, because every
 * core-loop feature is free, holds for a free user with NO entitlement at all.
 */
export function isCoreLoopAvailable(state: EntitlementState): boolean {
  return CORE_LOOP_FEATURES.every((id) => canUse(id, state))
}

/** The concurrent active-habit limit for a tier. */
export function activeHabitLimit(tier: Tier): number {
  return tier === 'premium' ? PREMIUM_ACTIVE_HABIT_LIMIT : FREE_ACTIVE_HABIT_LIMIT
}

/** Whether another habit may be activated given how many are already active. */
export function canActivateHabit(state: EntitlementState, activeCount: number): boolean {
  return activeCount < state.activeHabitLimit
}

/**
 * Apply a tier's active-habit limit to a list of habit ids WITHOUT losing any data.
 * The first `limit` stay active; the rest are *parked* — kept, not deleted — so a
 * downgrade (an expiry) is a gentle, fully reversible resting state. Re-upgrading
 * simply un-parks them. This is the Zero-Guilt shape of a downgrade (CLAUDE.md §1):
 * nothing is taken away, it is only set aside until the user wants it back.
 */
export function enforceActiveLimit(
  habitIds: readonly string[],
  limit: number,
): { active: readonly string[]; parked: readonly string[] } {
  const safeLimit = Math.max(0, Math.floor(limit))
  return {
    active: habitIds.slice(0, safeLimit),
    parked: habitIds.slice(safeLimit),
  }
}

/* ============================================================== copy ======== */

export const TIER_LABEL: Record<Tier, string> = {
  free: 'Free',
  premium: 'Premium',
}

/** Warm, guilt-free one-liners describing each resolved status (never a loss-frame). */
export const STATUS_COPY: Record<EntitlementStatus, { headline: string; body: string }> = {
  none: {
    headline: 'Your free little win is always here',
    body: 'One tiny habit, basic progress and full accessibility — the whole daily loop, free for as long as you like.',
  },
  active: {
    headline: 'Premium journeys are open',
    body: 'Several habits, adaptive suggestions and richer progression are unlocked. Your free loop is still here too.',
  },
  expired: {
    headline: 'Your premium journeys are resting',
    body: 'Your renewal lapsed, so the extra journeys are set aside — kept, never deleted. Your free daily little win is open exactly as before, and you can reopen premium anytime.',
  },
}

/** Every user-facing string the gate can surface — the exact set the guilt guard scans. */
export function entitlementCopy(): readonly string[] {
  const lines: string[] = []
  for (const tier of ['free', 'premium'] as Tier[]) lines.push(TIER_LABEL[tier])
  for (const status of ['none', 'active', 'expired'] as EntitlementStatus[]) {
    lines.push(STATUS_COPY[status].headline, STATUS_COPY[status].body)
  }
  for (const feature of FEATURE_CATALOG) lines.push(feature.name, feature.description)
  lines.push(
    'The daily loop is free forever — premium only ever adds more, it never takes the loop away.',
    'A lapsed subscription simply rests your extra journeys; it never erases a habit.',
    'These annual prices are hypotheses to test, not a final decision.',
  )
  return lines
}

/* ------------------------------------------------- durable serialization ---- */

/** Serialize the raw entitlement (or its absence) for durable storage. */
export function serialize(entitlement: Entitlement | null): string {
  return JSON.stringify(entitlement)
}

/**
 * Parse a durably-stored entitlement. Anything malformed — or a grant for an
 * unknown product — is dropped to `null` (free) rather than trusted, so a corrupted
 * or forged store can never silently unlock premium.
 */
export function deserialize(raw: string | null): Entitlement | null {
  if (!raw) return null
  try {
    const parsed: unknown = JSON.parse(raw)
    if (parsed === null) return null
    if (!isEntitlement(parsed)) return null
    if (productById(parsed.productId) === null) return null
    return parsed
  } catch {
    return null
  }
}

/* ============================================================ live store ==== */
/* A singleton, localStorage-backed store with a subscribe/broadcast fan-out — the
 * same shape as lib/ledger.ts / lib/activation.ts. It holds only the RAW entitlement;
 * the time-dependent resolution is done by `resolveEntitlement` at the read edge with
 * an injected clock, so the pure decision stays deterministic and testable. */

const STORAGE_KEY = 'herrays.entitlement.v1'

function readStore(): Entitlement | null {
  if (typeof localStorage === 'undefined') return null
  try {
    return deserialize(localStorage.getItem(STORAGE_KEY))
  } catch {
    return null
  }
}

let entitlement: Entitlement | null = readStore()
const listeners = new Set<(entitlement: Entitlement | null) => void>()

function persist(): void {
  if (typeof localStorage === 'undefined') return
  try {
    if (entitlement === null) localStorage.removeItem(STORAGE_KEY)
    else localStorage.setItem(STORAGE_KEY, serialize(entitlement))
  } catch {
    /* no-op: an unpersistable store still works for the session */
  }
}

function emit(): void {
  persist()
  for (const listener of listeners) listener(entitlement)
}

/** The current raw entitlement (immutable snapshot; may be null for a free user). */
export function getEntitlement(): Entitlement | null {
  return entitlement
}

export function subscribeEntitlement(listener: (entitlement: Entitlement | null) => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/**
 * Grant premium for a product. The clock is read here, at the edge; an optional
 * `termDays` lets the demo grant a short, observable term. Returns the new grant.
 */
export function grantPremium(productId: PremiumProductId, termDays?: number): Entitlement {
  entitlement = makeEntitlement(productId, Date.now(), termDays)
  emit()
  return entitlement
}

/**
 * Expire the current grant immediately (set its end to now), modelling a renewal
 * that lapsed. The grant is kept (so its product is still visible as "resting"),
 * only its term is closed — which falls the user back to free on the next resolve.
 */
export function lapseNow(): void {
  if (entitlement === null) return
  const now = Date.now()
  entitlement = { ...entitlement, expiresAt: Math.min(entitlement.expiresAt, now) }
  emit()
}

/** Clear the entitlement entirely (back to a never-subscribed free user). */
export function clearEntitlement(): void {
  entitlement = null
  emit()
}
