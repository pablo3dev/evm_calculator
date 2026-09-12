import { useState } from 'react'
import './App.css'
import { Dashboard } from './components/Dashboard.tsx'
import { LanguageSwitcher } from './components/LanguageSwitcher.tsx'
import { ProjectSelector } from './components/ProjectSelector.tsx'

function App() {
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null)

  return (
    <main className="dashboard-shell">
      <header>
        <div className="app-header-bar">
          <h1>EVM Project Tool</h1>
          <LanguageSwitcher />
        </div>
        <ProjectSelector
          value={activeProjectId}
          onChange={(id) => setActiveProjectId(id)}
        />
      </header>
      <section aria-label="Project dashboard">
        {activeProjectId ? (
          <Dashboard key={activeProjectId} projectId={activeProjectId} />
        ) : (
          <p>Select a project to view the dashboard.</p>
        )}
      </section>
    </main>
  )
}

export default App
