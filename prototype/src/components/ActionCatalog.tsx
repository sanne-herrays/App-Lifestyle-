/**
 * TASK-024 — Evidence-reviewed action catalog (viewer).
 *
 * A browseable, Zero-Guilt surface over the structured AESR records in
 * `src/lib/actionCatalog.ts` (the single source of truth that TASK-025 will read
 * its exclusion filters from). Each card surfaces all six acceptance fields —
 * category, duration, evidence grade, contraindications, easier variant and
 * review date — plus the rubric's claim-limit statement so the honesty is
 * visible, not hidden in data.
 *
 * Standards (CLAUDE.md):
 *  - §1 Zero-Guilt: evidence grade and safety tier are shown as calm, neutral
 *    information chips with a plain-language legend — never a red warning. A
 *    contraindication reads as a gentle "good to know", resolving to an easier
 *    variant, exactly as the rubric's §3.3 design rule requires.
 *  - §3 No boilerplate: every field is real, drawn from the reviewed catalog.
 *  - Accessibility: the category filter is a labelled radiogroup with arrow-key
 *    support; grade/tier chips carry accessible descriptions; a dedicated
 *    prefers-reduced-motion block disables all transitions.
 */

import { useMemo, useState } from 'react'
import './ActionCatalog.css'
import {
  ACTION_CATALOG,
  CATALOG_COUNT,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  GRADE_MEANING,
  SAFETY_MEANING,
  type ActionRecord,
  type CatalogCategory,
  type EvidenceGrade,
} from '../lib/actionCatalog'

type Filter = 'all' | CatalogCategory

/** The filter chips, in display order: "All" first, then each category. */
const FILTERS: readonly Filter[] = ['all', ...CATEGORY_ORDER]

function filterLabel(filter: Filter): string {
  return filter === 'all' ? 'All' : CATEGORY_LABELS[filter]
}

/** One evidence-reviewed action, rendered as a calm card. */
function ActionCard({ record }: { record: ActionRecord }) {
  const gradeDesc = `Evidence grade ${record.evidenceGrade}: ${GRADE_MEANING[record.evidenceGrade]}`
  const safetyDesc = `Safety tier ${record.safetyTier}: ${SAFETY_MEANING[record.safetyTier]}`

  return (
    <li className="ac-card">
      <div className="ac-card-top">
        <span className="ac-cat">{CATEGORY_LABELS[record.category]}</span>
        <span className="ac-dur" aria-label={`takes about ${record.duration}`}>
          {record.duration}
        </span>
      </div>

      <h3 className="ac-title">{record.title}</h3>

      <p className="ac-easier">
        <span className="ac-easier-tag">Easier</span>
        {record.easierVariant.title} · {record.easierVariant.duration}
      </p>

      <div className="ac-badges">
        <span
          className={`ac-grade ac-grade-${record.evidenceGrade.toLowerCase()}`}
          title={gradeDesc}
        >
          <span aria-hidden="true">Evidence {record.evidenceGrade}</span>
          <span className="ac-sr">{gradeDesc}</span>
        </span>
        <span className="ac-tier" title={safetyDesc}>
          <span aria-hidden="true">{record.safetyTier}</span>
          <span className="ac-sr">{safetyDesc}</span>
        </span>
      </div>

      <p className="ac-claim">
        <span className="ac-claim-tag">We may say</span>
        “{record.claim.permitted}”
      </p>

      {record.contraindications.length > 0 ? (
        <div className="ac-notes">
          <p className="ac-notes-head">Good to know</p>
          <ul className="ac-notes-list">
            {record.contraindications.map((note) => (
              <li key={note.context} className="ac-note">
                <span className="ac-note-ctx">{note.context}:</span> {note.resolution}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="ac-notes-none">Gentle for most people.</p>
      )}

      <p className="ac-review">
        Reviewed {record.review.lastReviewed} · next review due {record.review.nextReviewDue} ·{' '}
        {record.review.owner}
      </p>
    </li>
  )
}

export default function ActionCatalog() {
  const [filter, setFilter] = useState<Filter>('all')

  const visible = useMemo<readonly ActionRecord[]>(
    () => (filter === 'all' ? ACTION_CATALOG : ACTION_CATALOG.filter((r) => r.category === filter)),
    [filter],
  )

  const grades: readonly EvidenceGrade[] = ['A', 'B', 'C']

  const onFilterKey = (event: React.KeyboardEvent, index: number) => {
    const last = FILTERS.length - 1
    let next = -1
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = index === last ? 0 : index + 1
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = index === 0 ? last : index - 1
    if (next >= 0) {
      event.preventDefault()
      const target = FILTERS[next]
      if (target) setFilter(target)
    }
  }

  return (
    <section className="ac" aria-labelledby="ac-headline">
      <div className="ac-glow" aria-hidden="true" />

      <header className="ac-head">
        <p className="ac-eyebrow">Little wins</p>
        <h2 id="ac-headline" className="ac-headline">
          Every action, evidence-reviewed
        </h2>
        <p className="ac-intro">
          {CATALOG_COUNT} curated micro-actions. Each one is rated for how well-established its
          general benefit is, kept gentle and safe, and reviewed on a schedule — so what we say
          stays honest.
        </p>
      </header>

      <div className="ac-legend" aria-hidden="true">
        {grades.map((g) => (
          <span key={g} className="ac-legend-item">
            <span className={`ac-grade ac-grade-${g.toLowerCase()}`}>Evidence {g}</span>
            {GRADE_MEANING[g]}
          </span>
        ))}
      </div>

      <div
        className="ac-filters"
        role="radiogroup"
        aria-label="Filter actions by category"
      >
        {FILTERS.map((f, i) => {
          const on = filter === f
          return (
            <button
              key={f}
              type="button"
              role="radio"
              aria-checked={on}
              tabIndex={on ? 0 : -1}
              className={`ac-filter${on ? ' on' : ''}`}
              onClick={() => setFilter(f)}
              onKeyDown={(e) => onFilterKey(e, i)}
            >
              {filterLabel(f)}
            </button>
          )
        })}
      </div>

      <p className="ac-count" aria-live="polite">
        {visible.length} {visible.length === 1 ? 'action' : 'actions'}
        {filter === 'all' ? '' : ` in ${CATEGORY_LABELS[filter]}`}
      </p>

      <ul className="ac-list">
        {visible.map((record) => (
          <ActionCard key={record.id} record={record} />
        ))}
      </ul>
    </section>
  )
}
