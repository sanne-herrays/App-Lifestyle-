import { useState } from 'react'
import './App.css'
import FirstSessionFlows from './flows/FirstSessionFlows'
import ConceptScorecard from './components/ConceptScorecard'

/**
 * Prototype shell. Defaults to the active TASK-015 deliverable (the three
 * first-session flows) while keeping the approved TASK-014 concept scorecard
 * one tap away, so neither deliverable is hidden.
 */

type View = 'flows' | 'scorecard'

function App() {
  const [view, setView] = useState<View>('flows')

  return (
    <div className="shell">
      <nav className="shell-nav" aria-label="Prototype views">
        <button
          type="button"
          className={`shell-tab${view === 'flows' ? ' on' : ''}`}
          aria-current={view === 'flows'}
          onClick={() => setView('flows')}
        >
          First-session flows
        </button>
        <button
          type="button"
          className={`shell-tab${view === 'scorecard' ? ' on' : ''}`}
          aria-current={view === 'scorecard'}
          onClick={() => setView('scorecard')}
        >
          Concept scorecard
        </button>
      </nav>
      {view === 'flows' ? <FirstSessionFlows /> : <ConceptScorecard />}
    </div>
  )
}

export default App
