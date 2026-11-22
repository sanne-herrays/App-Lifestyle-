/**
 * TASK-026 — Deterministic test cases for the daily action completion ledger.
 *
 * Acceptance criterion (tasks.json TASK-026):
 *   "Events have unique IDs and timestamps; duplicate taps do not double-count;
 *    offline entries sync without loss."
 *
 * Dependency-free, self-contained module (the prototype has no test runner),
 * matching the TASK-025 pattern. It is:
 *   • type-checked by the build — `tsc -b` compiles all of `src` under the
 *     project's strict settings; and
 *   • directly executable — `node src/lib/ledger.test.ts` runs it under Node's
 *     native TypeScript stripping. The ledger core is imported with a `.ts`
 *     specifier (runtime-resolvable) and imports no React; the only `flowData`
 *     reference is `import type`, erased at runtime, so Node never loads a
 *     React-dependent module. On any failure the process throws and exits non-zero.
 *
 * Every case drives the real pure core (`appendCompletion` / `flush` /
 * `markSynced` / `serialize` / `deserialize`) with injected ids + clock, so the
 * dedupe and sync-without-loss guarantees are verified deterministically — no
 * fake logic, no synthetic data standing in for the behaviour under test.
 */

import {
  appendCompletion,
  deserialize,
  flush,
  LEDGER_SCHEMA_VERSION,
  markSynced,
  pendingEvents,
  serialize,
  syncedEvents,
  type CompletionEvent,
  type CompletionInput,
  type LedgerTransport,
} from './ledger.ts'
import type { GoalId } from '../flows/flowData'

/* ------------------------------------------------------- fixture helpers -- */

/** A deterministic, monotonic id factory so appended events are predictable. */
function idFactory(prefix = 'id'): () => string {
  let n = 0
  return () => `${prefix}-${++n}`
}

function input(over: Partial<CompletionInput> & Pick<CompletionInput, 'clientKey'>): CompletionInput {
  return {
    goalId: 'move' as GoalId,
    actionTitle: 'Two minutes of easy movement',
    variant: 'full',
    ...over,
  }
}

/** Append a sequence of inputs starting from empty, with a shared id factory + fixed clock. */
function build(inputs: readonly CompletionInput[], makeId: () => string, now = 1_000): readonly CompletionEvent[] {
  let events: readonly CompletionEvent[] = []
  for (const i of inputs) {
    events = appendCompletion(events, i, now, makeId).events
  }
  return events
}

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

interface Case {
  group: 'unique ids & timestamps' | 'no double-count' | 'offline sync without loss' | 'durability'
  name: string
  run: () => void | Promise<void>
}

/* ------------------------------------------------------------- cases ------- */

const CASES: readonly Case[] = [
  /* ---- unique ids & timestamps ------------------------------------------- */
  {
    group: 'unique ids & timestamps',
    name: 'each distinct completion gets a unique id and a timestamp',
    run: () => {
      const events = build(
        [input({ clientKey: 'k1' }), input({ clientKey: 'k2' }), input({ clientKey: 'k3' })],
        idFactory(),
        4_200,
      )
      assertEqual(events.length, 3, 'three events recorded')
      const ids = new Set(events.map((e) => e.id))
      assertEqual(ids.size, 3, 'all ids unique')
      for (const e of events) {
        assert(e.id.length > 0, 'id is non-empty')
        assertEqual(e.completedAt, 4_200, 'timestamp stamped from the clock')
        assertEqual(e.syncState, 'pending', 'new events start pending (offline-first)')
        assertEqual(e.syncedAt, null, 'pending events have no synced time')
        assertEqual(e.schemaVersion, LEDGER_SCHEMA_VERSION, 'schema version stamped')
      }
    },
  },
  {
    group: 'unique ids & timestamps',
    name: 'an explicit completedAt is preserved over the default clock',
    run: () => {
      const events = build([input({ clientKey: 'k1', completedAt: 777 })], idFactory(), 9_999)
      assertEqual(events[0]?.completedAt, 777, 'explicit timestamp kept')
    },
  },

  /* ---- no double-count (duplicate taps) ---------------------------------- */
  {
    group: 'no double-count',
    name: 'replaying the same clientKey does not append a second event',
    run: () => {
      const makeId = idFactory()
      let events: readonly CompletionEvent[] = []
      const first = appendCompletion(events, input({ clientKey: 'dup' }), 1_000, makeId)
      events = first.events
      const second = appendCompletion(events, input({ clientKey: 'dup' }), 2_000, makeId)
      events = second.events
      const third = appendCompletion(events, input({ clientKey: 'dup' }), 3_000, makeId)
      events = third.events

      assertEqual(events.length, 1, 'still exactly one event after three taps')
      assertEqual(first.added, true, 'first tap added')
      assertEqual(second.added, false, 'duplicate tap not added')
      assertEqual(third.added, false, 'third duplicate not added')
      assertEqual(second.event.id, first.event.id, 'same event returned to the caller')
      assertEqual(events[0]?.completedAt, 1_000, 'original timestamp is authoritative, not overwritten')
    },
  },
  {
    group: 'no double-count',
    name: 'different gestures (distinct keys) each count once',
    run: () => {
      const events = build(
        [input({ clientKey: 'a' }), input({ clientKey: 'a' }), input({ clientKey: 'b' })],
        idFactory(),
      )
      assertEqual(events.length, 2, 'two distinct completions, duplicate of "a" suppressed')
    },
  },
  {
    group: 'no double-count',
    name: 'dedupe is independent of action content — the key is the identity',
    run: () => {
      // Same key but (hypothetically) different content still collapses to the first.
      const makeId = idFactory()
      let events: readonly CompletionEvent[] = []
      events = appendCompletion(events, input({ clientKey: 'x', actionTitle: 'A glass of water', goalId: 'water' as GoalId }), 1_000, makeId).events
      const replay = appendCompletion(events, input({ clientKey: 'x', actionTitle: 'Two minutes outside', goalId: 'outside' as GoalId }), 1_000, makeId)
      assertEqual(replay.added, false, 'replay suppressed by key')
      assertEqual(replay.event.actionTitle, 'A glass of water', 'first write wins')
      assertEqual(events.length, 1, 'no second event')
    },
  },

  /* ---- offline sync without loss ----------------------------------------- */
  {
    group: 'offline sync without loss',
    name: 'a failed (offline) flush keeps every event pending — nothing dropped',
    run: async () => {
      const events = build([input({ clientKey: 'k1' }), input({ clientKey: 'k2' })], idFactory())
      const offline: LedgerTransport = () => Promise.reject(new Error('offline'))
      const result = await flush(events, offline, 5_000)
      assertEqual(result.failed, true, 'flush reported failure')
      assertEqual(result.syncedIds.length, 0, 'nothing confirmed')
      assertEqual(pendingEvents(result.events).length, 2, 'both events still pending')
      assertEqual(result.events.length, 2, 'no event lost')
    },
  },
  {
    group: 'offline sync without loss',
    name: 'events recorded offline sync cleanly once a later flush succeeds',
    run: async () => {
      let events = build([input({ clientKey: 'k1' }), input({ clientKey: 'k2' })], idFactory('e'))
      // Offline attempt: kept pending.
      const offline: LedgerTransport = () => Promise.reject(new Error('offline'))
      events = (await flush(events, offline, 5_000)).events
      assertEqual(pendingEvents(events).length, 2, 'still queued after offline flush')
      // Back online: confirm all pending ids.
      const online: LedgerTransport = (batch) => Promise.resolve(batch.map((e) => e.id))
      const done = await flush(events, online, 6_000)
      assertEqual(done.failed, false, 'online flush succeeded')
      assertEqual(done.syncedIds.length, 2, 'both confirmed')
      assertEqual(pendingEvents(done.events).length, 0, 'queue drained')
      assertEqual(syncedEvents(done.events).length, 2, 'both now synced')
      for (const e of done.events) assertEqual(e.syncedAt, 6_000, 'synced timestamp recorded')
    },
  },
  {
    group: 'offline sync without loss',
    name: 'a partial transport confirmation syncs only confirmed ids; the rest stay queued',
    run: async () => {
      const events = build([input({ clientKey: 'k1' }), input({ clientKey: 'k2' }), input({ clientKey: 'k3' })], idFactory('e'))
      // Transport confirms only the first of the batch (e.g. connection dropped mid-flush).
      const partial: LedgerTransport = (batch) => Promise.resolve(batch.slice(0, 1).map((e) => e.id))
      const result = await flush(events, partial, 7_000)
      assertEqual(result.failed, false, 'not a total failure')
      assertEqual(result.syncedIds.length, 1, 'one confirmed')
      assertEqual(syncedEvents(result.events).length, 1, 'one synced')
      assertEqual(pendingEvents(result.events).length, 2, 'the unconfirmed two remain queued, not lost')
    },
  },
  {
    group: 'offline sync without loss',
    name: 're-flushing is idempotent — only pending events are sent, synced ones are never resent or duplicated',
    run: async () => {
      let events = build([input({ clientKey: 'k1' }), input({ clientKey: 'k2' })], idFactory('e'))
      const sent: string[][] = []
      const online: LedgerTransport = (batch) => {
        sent.push(batch.map((e) => e.id))
        return Promise.resolve(batch.map((e) => e.id))
      }
      events = (await flush(events, online, 6_000)).events
      // Record one more, then flush again: only the new one should be transmitted.
      events = appendCompletion(events, input({ clientKey: 'k3' }), 6_500, idFactory('x')).events
      const second = await flush(events, online, 7_000)
      assertEqual(sent.length, 2, 'two flush calls')
      assertEqual(sent[0]?.length, 2, 'first flush sent both pending')
      assertEqual(sent[1]?.length, 1, 'second flush sent only the new pending event')
      assertEqual(syncedEvents(second.events).length, 3, 'all three synced, none duplicated')
      assertEqual(second.events.length, 3, 'event count stable — no duplication')
    },
  },
  {
    group: 'offline sync without loss',
    name: 'a confirmation for an id not in the sent queue is ignored (no phantom sync)',
    run: async () => {
      const events = build([input({ clientKey: 'k1' })], idFactory('e'))
      const rogue: LedgerTransport = () => Promise.resolve(['id-that-was-never-sent'])
      const result = await flush(events, rogue, 8_000)
      assertEqual(result.syncedIds.length, 0, 'rogue id not counted')
      assertEqual(pendingEvents(result.events).length, 1, 'real event still pending')
    },
  },
  {
    group: 'offline sync without loss',
    name: 'flushing an empty queue is a no-op success',
    run: async () => {
      const online: LedgerTransport = (batch) => Promise.resolve(batch.map((e) => e.id))
      const result = await flush([], online, 9_000)
      assertEqual(result.failed, false, 'empty flush does not fail')
      assertEqual(result.syncedIds.length, 0, 'nothing to sync')
    },
  },
  {
    group: 'offline sync without loss',
    name: 'markSynced never un-syncs or drops events and is idempotent',
    run: () => {
      const events = build([input({ clientKey: 'k1' }), input({ clientKey: 'k2' })], idFactory('e'))
      const firstId = events[0]?.id ?? ''
      const once = markSynced(events, [firstId], 100)
      const twice = markSynced(once, [firstId], 999)
      assertEqual(syncedEvents(twice).length, 1, 'still one synced after a repeat mark')
      assertEqual(twice.find((e) => e.id === firstId)?.syncedAt, 100, 'original synced time preserved on repeat')
      assertEqual(twice.length, 2, 'no event dropped')
    },
  },

  /* ---- durability (survives serialize → reload) -------------------------- */
  {
    group: 'durability',
    name: 'serialize → deserialize round-trips every field (survives a reload)',
    run: async () => {
      let events = build([input({ clientKey: 'k1' }), input({ clientKey: 'k2' })], idFactory('e'))
      events = (await flush(events, (batch) => Promise.resolve([batch[0]?.id ?? '']), 6_000)).events
      const restored = deserialize(serialize(events))
      assertEqual(restored.length, 2, 'both events restored')
      assertEqual(pendingEvents(restored).length, 1, 'pending state survived')
      assertEqual(syncedEvents(restored).length, 1, 'synced state survived')
      const original = events[0]
      const back = restored.find((e) => e.id === original?.id)
      assert(back !== undefined, 'event found after round-trip')
      assertEqual(back?.clientKey, original?.clientKey, 'clientKey preserved')
      assertEqual(back?.completedAt, original?.completedAt, 'timestamp preserved')
    },
  },
  {
    group: 'durability',
    name: 'deserialize drops malformed records and de-duplicates ids/keys — never loses or clones a good event',
    run: () => {
      const good = build([input({ clientKey: 'k1' })], idFactory('e'))
      const raw = JSON.stringify([
        good[0],
        good[0], // duplicate of a good event
        { id: 'bad' }, // missing required fields
        null,
        42,
        { id: 'z', clientKey: 'k1', goalId: 'move', variant: 'full', actionTitle: 'dup key', completedAt: 1 }, // clientKey collides
      ])
      const restored = deserialize(raw)
      assertEqual(restored.length, 1, 'only the single valid, unique event survives')
      assertEqual(restored[0]?.clientKey, 'k1', 'the good event is the survivor')
    },
  },
  {
    group: 'durability',
    name: 'deserialize of empty/garbage input yields an empty ledger, never throws',
    run: () => {
      assertEqual(deserialize(null).length, 0, 'null ⇒ empty')
      assertEqual(deserialize('').length, 0, 'empty string ⇒ empty')
      assertEqual(deserialize('not json').length, 0, 'garbage ⇒ empty')
      assertEqual(deserialize('{"not":"an array"}').length, 0, 'non-array ⇒ empty')
    },
  },
]

/* ------------------------------------------------------------- runner ------ */

export interface TestSummary {
  total: number
  passed: number
  failed: number
  failures: readonly string[]
}

export async function runLedgerTests(): Promise<TestSummary> {
  failures.length = 0
  let passed = 0
  for (const testCase of CASES) {
    currentCase = `${testCase.group} › ${testCase.name}`
    const before = failures.length
    try {
      await testCase.run()
    } catch (error) {
      failures.push(`[${currentCase}] threw: ${String(error)}`)
    }
    if (failures.length === before) passed++
  }
  return { total: CASES.length, passed, failed: CASES.length - passed, failures: [...failures] }
}

/* Execute when run directly (e.g. `node src/lib/ledger.test.ts`). Not imported
 * by the app, so Vite never bundles it; tsc still type-checks it. */
const summary = await runLedgerTests()
const byGroup = new Map<string, { pass: number; total: number }>()
for (const testCase of CASES) {
  const entry = byGroup.get(testCase.group) ?? { pass: 0, total: 0 }
  entry.total++
  const failed = summary.failures.some((f) => f.startsWith(`[${testCase.group} › ${testCase.name}]`))
  if (!failed) entry.pass++
  byGroup.set(testCase.group, entry)
}
console.log('TASK-026 completion ledger — deterministic test cases')
for (const [group, entry] of byGroup) {
  console.log(`  ${entry.pass === entry.total ? '✓' : '✗'} ${group}: ${entry.pass}/${entry.total}`)
}
console.log(`\n${summary.passed}/${summary.total} passed, ${summary.failed} failed`)
if (summary.failed > 0) {
  for (const failure of summary.failures) console.log(`  • ${failure}`)
  throw new Error(`${summary.failed} ledger test case(s) failed`)
}
