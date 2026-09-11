import { useState } from 'react'
import './App.css'
import { Dashboard } from './components/Dashboard.tsx'
import { ProjectSelector } from './components/ProjectSelector.tsx'

function App() {
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null)

  return (
    <main className="dashboard-shell">
      <header>
        <h1>EVM Project Tool</h1>
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
