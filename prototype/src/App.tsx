import { useState } from 'react'
import './App.css'
import FirstSessionFlows from './flows/FirstSessionFlows'
import ConceptScorecard from './components/ConceptScorecard'
import LittleWinCard from './components/LittleWinCard'
import TinyActionFallback from './components/TinyActionFallback'
import HabitCueScheduler from './components/HabitCueScheduler'
import ActionCatalog from './components/ActionCatalog'
import RecommendationDemo from './components/RecommendationDemo'
import CompletionLedger from './components/CompletionLedger'

/**
 * Prototype shell. Defaults to the active TASK-020 deliverable ("Your Little
 * Win Today" card) while keeping the evidence-reviewed action catalog
 * (TASK-024), cue scheduler (TASK-023), fallback flow (TASK-022), approved
 * first-session flows (TASK-015) and concept scorecard (TASK-014) one tap away,
 * so no deliverable is hidden.
 */

type View = 'card' | 'ledger' | 'recommend' | 'catalog' | 'cues' | 'fallback' | 'flows' | 'scorecard'

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
          className={`shell-tab${view === 'ledger' ? ' on' : ''}`}
          aria-current={view === 'ledger'}
          onClick={() => setView('ledger')}
        >
          Ledger
        </button>
        <button
          type="button"
          className={`shell-tab${view === 'recommend' ? ' on' : ''}`}
          aria-current={view === 'recommend'}
          onClick={() => setView('recommend')}
        >
          Suggestion
        </button>
        <button
          type="button"
          className={`shell-tab${view === 'catalog' ? ' on' : ''}`}
          aria-current={view === 'catalog'}
          onClick={() => setView('catalog')}
        >
          Action catalog
        </button>
        <button
          type="button"
          className={`shell-tab${view === 'cues' ? ' on' : ''}`}
          aria-current={view === 'cues'}
          onClick={() => setView('cues')}
        >
          Cue scheduler
        </button>
        <button
          type="button"
          className={`shell-tab${view === 'fallback' ? ' on' : ''}`}
          aria-current={view === 'fallback'}
          onClick={() => setView('fallback')}
        >
          Fallback
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
      ) : view === 'ledger' ? (
        <CompletionLedger />
      ) : view === 'recommend' ? (
        <RecommendationDemo />
      ) : view === 'catalog' ? (
        <ActionCatalog />
      ) : view === 'cues' ? (
        <HabitCueScheduler />
      ) : view === 'fallback' ? (
        <TinyActionFallback />
      ) : view === 'flows' ? (
        <FirstSessionFlows />
      ) : (
        <ConceptScorecard />
      )}
    </div>
  )
}

export default App
