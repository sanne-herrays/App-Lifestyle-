/**
 * Shared live view of the durable completion ledger (TASK-026).
 *
 * The store itself lives in `src/lib/ledger.ts`; this hook just subscribes a
 * component to its newest-first snapshot. Factored out so surfaces that only
 * need the events (e.g. the TASK-027 gentle restart) don't re-implement the
 * subscription. No JSX here, so it stays off the react-refresh component
 * boundary.
 */

import { useEffect, useState } from 'react'
import { listEvents, subscribeLedger, type CompletionEvent } from '../lib/ledger'

export function useLedgerEvents(): readonly CompletionEvent[] {
  const [events, setEvents] = useState<readonly CompletionEvent[]>(listEvents)
  useEffect(() => subscribeLedger(setEvents), [])
  return events
}
