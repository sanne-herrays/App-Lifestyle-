import { useState } from 'react'
import './App.css'
import FirstSessionFlows from './flows/FirstSessionFlows'
import ConceptScorecard from './components/ConceptScorecard'
import LittleWinCard from './components/LittleWinCard'

/**
 * Prototype shell. Defaults to the active TASK-020 deliverable ("Your Little
 * Win Today" card) while keeping the approved first-session flows (TASK-015)
 * and concept scorecard (TASK-014) one tap away, so no deliverable is hidden.
 */

type View = 'card' | 'flows' | 'scorecard'

function App() {
  const [view, setView] = useState<View>('card')

  return (
    <div className="shell">
      <nav className="shell-nav" aria-label="Prototype views">
        <button
          type="button"
          className={`shell-tab${view === 'card' ? ' on' : ''}`}
          aria-current={view === 'card'}
          onClick={() => setView('card')}
        >
          Little Win card
        </button>
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
      {view === 'card' ? (
        <LittleWinCard />
      ) : view === 'flows' ? (
        <FirstSessionFlows />
      ) : (
        <ConceptScorecard />
      )}
    </div>
  )
}

export default App
