/**
 * TASK-037 — Deterministic test cases for the premium entitlement gate.
 *
 * Acceptance criterion (tasks.json TASK-037):
 *   "Free user completes core loop; premium access requires valid entitlement;
 *    expired entitlement restores free access."
 *
 * The suite drives the real engine to prove each clause:
 *   - free user completes core loop → with NO entitlement, every core-loop feature
 *     is usable and `isCoreLoopAvailable` is true (the loop never meets a paywall);
 *   - premium access requires valid entitlement → a premium feature is locked for a
 *     free user, unlocks only under an `active` grant, and a grant for an unknown
 *     product never unlocks anything;
 *   - expired entitlement restores free access → at/after `expiresAt` the status is
 *     `expired`, the tier falls back to `free`, every premium feature re-locks, the
 *     core loop stays available, and parked habits are kept (never deleted).
 *
 * Dependency-free and self-contained (the prototype has no test runner), matching the
 * TASK-026…036 pattern. Type-checked by `tsc -b` and directly executable —
 * `node src/lib/entitlement.test.ts` — under Node's native TS stripping. The engine
 * imports only the React-free `isGuiltFree` guard, so Node never loads a
 * React-dependent module. On any failure the process throws non-zero.
 */

import {
  CORE_LOOP_FEATURES,
  DAY_MS,
  ENTITLEMENT_SCHEMA_VERSION,
  FEATURE_CATALOG,
  FREE_ACTIVE_HABIT_LIMIT,
  PREMIUM_ACTIVE_HABIT_LIMIT,
  PREMIUM_FEATURES,
  PREMIUM_PRODUCTS,
  activeHabitLimit,
  canActivateHabit,
  canUse,
  deserialize,
  enforceActiveLimit,
  entitlementCopy,
  entitlementStatus,
  featureAccess,
  isCoreLoopAvailable,
  isEntitlement,
  isGuiltFree,
  makeEntitlement,
  productById,
  resolveEntitlement,
  serialize,
  type Entitlement,
} from './entitlement.ts'

/* ------------------------------------------------------- assert harness ---- */

const failures: string[] = []
let currentCase = ''

function assert(condition: boolean, message: string): void {
  if (!condition) failures.push(`[${currentCase}] ${message}`)
}

function assertEqual<T>(actual: T, expected: T, label: string): void {
  if (actual !== expected) {
    failures.push(`[${currentCase}] ${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`)
  }
}

/* ------------------------------------------------------------- fixtures ---- */

const T0 = new Date(2026, 10, 23, 9, 0, 0).getTime() // 2026-11-23, local morning
const ONE_YEAR = 365 * DAY_MS

/* ================================================================ cases ==== */

/* --- 1. catalog integrity: core loop is entirely free ---------------------- */

currentCase = 'catalog: every core-loop feature is free (the loop can never be paywalled)'
{
  assert(FEATURE_CATALOG.length > 0, 'the catalog is non-empty')
  assert(CORE_LOOP_FEATURES.length > 0, 'there is a core loop to protect')
  for (const id of CORE_LOOP_FEATURES) {
    const feature = FEATURE_CATALOG.find((f) => f.id === id)
    assert(feature?.tier === 'free', `core-loop feature "${id}" is on the free tier`)
  }
  // and there really are premium features to gate (otherwise the gate is vacuous)
  assert(PREMIUM_FEATURES.length > 0, 'there are premium features to gate')
  for (const id of PREMIUM_FEATURES) {
    const feature = FEATURE_CATALOG.find((f) => f.id === id)
    assert(feature?.tier === 'premium', `premium feature "${id}" is on the premium tier`)
    assert(feature?.coreLoop === false, `premium feature "${id}" is not part of the core loop`)
  }
}

/* --- 2. FREE USER COMPLETES THE CORE LOOP (no entitlement at all) ----------- */

currentCase = 'free: a user with NO entitlement can complete the whole core loop'
{
  const state = resolveEntitlement(null, T0)
  assertEqual(state.tier, 'free', 'no entitlement → free tier')
  assertEqual(state.status, 'none', 'no entitlement → status none')
  assertEqual(state.isPremium, false, 'no entitlement → not premium')
  assert(isCoreLoopAvailable(state), 'the entire core loop is available to a free user')
  for (const id of CORE_LOOP_FEATURES) {
    assert(canUse(id, state), `free user can use core-loop feature "${id}"`)
  }
  // free tier owns exactly one active habit, and can activate the first one
  assertEqual(state.activeHabitLimit, FREE_ACTIVE_HABIT_LIMIT, 'free active-habit limit is 1')
  assert(canActivateHabit(state, 0), 'free user can activate their one habit')
  assert(!canActivateHabit(state, 1), 'free user cannot activate a second concurrent habit')
}

currentCase = 'free: premium features are locked for a free user'
{
  const state = resolveEntitlement(null, T0)
  for (const id of PREMIUM_FEATURES) {
    assert(!canUse(id, state), `free user cannot use premium feature "${id}"`)
  }
  const access = featureAccess(state)
  assertEqual(access.length, FEATURE_CATALOG.length, 'feature-access view covers the whole catalog')
  assert(
    access.filter((a) => a.feature.tier === 'free').every((a) => a.unlocked),
    'all free features show unlocked',
  )
  assert(
    access.filter((a) => a.feature.tier === 'premium').every((a) => !a.unlocked),
    'all premium features show locked',
  )
}

/* --- 3. PREMIUM ACCESS REQUIRES A VALID ENTITLEMENT ------------------------- */

currentCase = 'premium: a valid active grant unlocks every premium feature'
{
  for (const product of PREMIUM_PRODUCTS) {
    const ent = makeEntitlement(product.id, T0)
    assert(isEntitlement(ent), `${product.id}: constructed entitlement is well-formed`)
    assertEqual(ent.schemaVersion, ENTITLEMENT_SCHEMA_VERSION, `${product.id}: schema version stamped`)
    assertEqual(ent.expiresAt, T0 + ONE_YEAR, `${product.id}: annual term ends one year out`)
    const state = resolveEntitlement(ent, T0 + DAY_MS) // one day in — safely active
    assertEqual(state.status, 'active', `${product.id}: status active inside the term`)
    assertEqual(state.tier, 'premium', `${product.id}: active grant → premium tier`)
    assert(state.isPremium, `${product.id}: isPremium true`)
    for (const id of PREMIUM_FEATURES) {
      assert(canUse(id, state), `${product.id}: premium feature "${id}" unlocked`)
    }
    // premium unlocks several concurrent journeys, and keeps the core loop too
    assertEqual(state.activeHabitLimit, PREMIUM_ACTIVE_HABIT_LIMIT, `${product.id}: premium active-habit limit`)
    assert(canActivateHabit(state, 1), `${product.id}: premium user can run a second habit`)
    assert(isCoreLoopAvailable(state), `${product.id}: core loop still available to premium`)
  }
}

currentCase = 'premium: an absent / forged / unknown-product grant unlocks NOTHING'
{
  // absent
  assertEqual(entitlementStatus(null, T0), 'none', 'null entitlement → none')
  // unknown product id (forged or stale SKU) → treated as none, never unlocks premium
  const forged = { productId: 'annual_lifetime_free', grantedAt: T0, expiresAt: T0 + ONE_YEAR, schemaVersion: 1 }
  assert(!isEntitlement(forged), 'an unknown product id is not a valid entitlement')
  assertEqual(entitlementStatus(forged as unknown as Entitlement, T0), 'none', 'unknown-product grant → none')
  const forgedState = resolveEntitlement(forged as unknown as Entitlement, T0)
  assertEqual(forgedState.tier, 'free', 'forged grant resolves to free')
  for (const id of PREMIUM_FEATURES) {
    assert(!canUse(id, forgedState), `forged grant does not unlock "${id}"`)
  }
  // an incoherent term (ends before it starts) is rejected
  const backwards = { productId: 'annual_3999', grantedAt: T0, expiresAt: T0 - DAY_MS, schemaVersion: 1 }
  assert(!isEntitlement(backwards), 'a term ending before it starts is rejected')
}

/* --- 4. EXPIRED ENTITLEMENT RESTORES FREE ACCESS --------------------------- */

currentCase = 'expired: the moment the term ends, premium lapses to free'
{
  const ent = makeEntitlement('annual_3999', T0) // expires at T0 + 1 year
  // just before expiry → still active
  const before = resolveEntitlement(ent, ent.expiresAt - 1)
  assertEqual(before.status, 'active', 'one ms before expiry is still active')
  assert(before.isPremium, 'still premium one ms before expiry')
  // exactly at expiry → expired (the >= boundary)
  const atBoundary = resolveEntitlement(ent, ent.expiresAt)
  assertEqual(atBoundary.status, 'expired', 'at the expiry instant the grant is expired')
  // well after expiry → expired
  const after = resolveEntitlement(ent, ent.expiresAt + 30 * DAY_MS)
  assertEqual(after.status, 'expired', 'a month past expiry is expired')
  assertEqual(after.tier, 'free', 'expired grant → free tier')
  assertEqual(after.isPremium, false, 'expired grant → not premium')
}

currentCase = 'expired: free access is fully RESTORED — loop intact, premium re-locked'
{
  const ent = makeEntitlement('annual_5999', T0)
  const expired = resolveEntitlement(ent, ent.expiresAt + DAY_MS)
  // the core loop is available again, exactly as a free user's
  assert(isCoreLoopAvailable(expired), 'core loop available after expiry')
  for (const id of CORE_LOOP_FEATURES) {
    assert(canUse(id, expired), `core-loop feature "${id}" usable after expiry`)
  }
  // every premium feature is re-locked
  for (const id of PREMIUM_FEATURES) {
    assert(!canUse(id, expired), `premium feature "${id}" re-locked after expiry`)
  }
  // free's single-habit limit is restored
  assertEqual(expired.activeHabitLimit, FREE_ACTIVE_HABIT_LIMIT, 'active-habit limit back to 1')
  assert(!canActivateHabit(expired, 1), 'cannot keep two habits active after downgrade')
  // the lapsed product is still visible as "resting" (kept, for a one-tap reopen)
  assert(expired.product !== null, 'the lapsed product is still known (resting, not forgotten)')
  assertEqual(expired.product?.id, 'annual_5999', 'the resting product is the one that lapsed')
}

currentCase = 'downgrade is gentle: extra habits are PARKED, never deleted'
{
  const habits = ['move', 'calm', 'water']
  // premium can hold all three active
  const premium = enforceActiveLimit(habits, activeHabitLimit('premium'))
  assertEqual(premium.active.length, 3, 'premium keeps all three active')
  assertEqual(premium.parked.length, 0, 'nothing parked under premium')
  // on downgrade to free, only one stays active — the other two are PARKED, not lost
  const free = enforceActiveLimit(habits, activeHabitLimit('free'))
  assertEqual(free.active.length, 1, 'free keeps exactly one active')
  assertEqual(free.parked.length, 2, 'the other two are parked')
  // no data is destroyed: active ∪ parked === the original set, in order
  assertEqual(
    JSON.stringify([...free.active, ...free.parked]),
    JSON.stringify(habits),
    'active + parked reconstructs every original habit (nothing deleted)',
  )
}

/* --- 5. durable round-trip drops forged / malformed grants ----------------- */

currentCase = 'persistence: a clean grant round-trips; a forged/garbage store drops to free'
{
  const ent = makeEntitlement('annual_2999', T0)
  const back = deserialize(serialize(ent))
  assert(back !== null, 'a clean grant round-trips')
  assertEqual(back?.productId, 'annual_2999', 'product id preserved')
  assertEqual(back?.expiresAt, ent.expiresAt, 'expiry preserved')
  // a stored grant for an unknown product is dropped (can't silently unlock premium)
  assertEqual(
    deserialize(JSON.stringify({ productId: 'annual_free_forever', grantedAt: T0, expiresAt: T0 + ONE_YEAR, schemaVersion: 1 })),
    null,
    'unknown-product grant drops to null',
  )
  assertEqual(deserialize('not json at all'), null, 'garbage parses to null')
  assertEqual(deserialize('null'), null, 'stored null parses to null (free)')
  assertEqual(deserialize(null), null, 'absent store parses to null (free)')
}

/* --- 6. product catalog models the three PRD §7 hypothesis prices ----------- */

currentCase = 'pricing: the three annual hypothesis price points are modelled'
{
  const prices = PREMIUM_PRODUCTS.map((p) => p.priceUsd).sort((a, b) => a - b)
  assertEqual(JSON.stringify(prices), JSON.stringify([29.99, 39.99, 59.99]), 'the three PRD §7 prices are present')
  assert(PREMIUM_PRODUCTS.every((p) => p.period === 'year'), 'all three are annual')
  assert(productById('annual_3999')?.priceUsd === 39.99, 'productById resolves a known SKU')
  assert(productById('nope') === null, 'productById returns null for an unknown SKU')
}

/* --- 7. zero-guilt copy (CLAUDE.md §1) ------------------------------------- */

currentCase = 'zero-guilt: every surfaced string is guilt-free (an expiry is never shamed)'
{
  const lines = entitlementCopy()
  assert(lines.length > 0, 'there is copy to check')
  for (const line of lines) {
    assert(isGuiltFree(line), `copy is guilt-free: "${line}"`)
  }
  // guard is non-trivial: a real shaming downgrade line is rejected
  assert(
    !isGuiltFree('Your subscription failed and you fell behind — you lost your streak and your progress.'),
    'guard rejects shame copy',
  )
}

/* =============================================================== report ==== */

const TOTAL_GROUPS = 12
if (failures.length > 0) {
  console.error(`\n✗ entitlement.test.ts — ${failures.length} assertion(s) failed:\n`)
  for (const f of failures) console.error('  • ' + f)
  console.error('')
  throw new Error(`entitlement.test.ts failed with ${failures.length} failing assertion(s).`)
}
console.log(`✓ entitlement.test.ts — all ${TOTAL_GROUPS} case groups passed.`)
