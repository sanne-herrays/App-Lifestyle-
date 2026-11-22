/**
 * TASK-015 — Prototype three first-session flows.
 *
 * A single, standalone harness that lets you independently navigate the first
 * session for each of the three strategy.md §3 concepts. Each flow supports
 * entry → goal selection → first action → completion with no dead ends, and
 * every concept is reachable, replayable, and exitable from here.
 */

import { useState } from 'react'
import './flows.css'
import { ACCENT, type ConceptId } from './flowData'
import TinyWinFlow from './TinyWinFlow'
import GrowingWorldFlow from './GrowingWorldFlow'
import EverydayAdventuresFlow from './EverydayAdventuresFlow'

interface ConceptCard {
  id: ConceptId
  name: string
  tagline: string
  hypothesis: string
  firstAction: string
}

const CONCEPTS: readonly ConceptCard[] = [
  {
    id: 'tiny-win',
    name: 'The Tiny Win',
    tagline: 'One absurdly easy action a day.',
    hypothesis: 'Reduced choice and effort increase consistency.',
    firstAction: 'Do one tiny action inside onboarding.',
  },
  {
    id: 'growing-world',
    name: 'The Growing World',
    tagline: 'Actions grow a beautiful, living world.',
    hypothesis: 'Attachment and visual progress improve repetition.',
    firstAction: 'Plant the first permanent piece of your world.',
  },
  {
    id: 'everyday-adventures',
    name: 'Everyday Adventures',
    tagline: 'Tiny missions woven into ordinary life.',
    hypothesis: 'Novelty and situational relevance lower resistance.',
    firstAction: 'Set a stable anchor, then do a fitted mission.',
  },
]

export default function FirstSessionFlows() {
  const [active, setActive] = useState<ConceptId | null>(null)

  if (active) {
    const exit = () => setActive(null)
    return (
      <section className="flows flows-live" aria-label="First-session prototype">
        <div className="flows-stage">
          {active === 'tiny-win' && <TinyWinFlow onExit={exit} />}
          {active === 'growing-world' && <GrowingWorldFlow onExit={exit} />}
          {active === 'everyday-adventures' && <EverydayAdventuresFlow onExit={exit} />}
        </div>
        <button type="button" className="flows-exit" onClick={exit}>
          ← All three concepts
        </button>
      </section>
    )
  }

  return (
    <section className="flows" aria-labelledby="flows-title">
      <div className="flows-glow" aria-hidden="true" />
      <header className="flows-head">
        <p className="flows-eyebrow">HerRays · First-Session Prototypes</p>
        <h1 id="flows-title">Three ways to begin.</h1>
        <p className="flows-lede">
          Each concept’s first session is a complete, tappable path — entry,
          goal, first real action, and a warm completion — with no dead ends.
          Pick one to run it; a hold-to-complete gesture finishes the first win
          in under two seconds.
        </p>
      </header>

      <div className="flows-grid">
        {CONCEPTS.map((concept) => (
          <article
            key={concept.id}
            className="flows-card"
            style={{ ['--accent']: ACCENT[concept.id] } as React.CSSProperties}
          >
            <div className="flows-card-ray" aria-hidden="true" />
            <h2>{concept.name}</h2>
            <p className="flows-card-tag">{concept.tagline}</p>
            <p className="flows-card-hyp">
              <span>Hypothesis</span> {concept.hypothesis}
            </p>
            <p className="flows-card-first">
              <span>First action</span> {concept.firstAction}
            </p>
            <button type="button" className="btn btn-primary flows-start" onClick={() => setActive(concept.id)}>
              Start first session
            </button>
          </article>
        ))}
      </div>

      <footer className="flows-foot">
        <p>
          Concepts &amp; hypotheses: <code>strategy.md</code> §3 · Onboarding
          steps &amp; actions: the three approved briefs in{' '}
          <code>docs/strategy/</code>. Actions stay at plain general-benefit
          framing (no individual health-risk claims, TASK-006).
        </p>
      </footer>
    </section>
  )
}
