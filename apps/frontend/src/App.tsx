import { useState } from 'react'
import './App.css'
import { Dashboard } from './components/Dashboard.tsx'
import { LanguageSwitcher } from './components/LanguageSwitcher.tsx'
import { ProjectSelector } from './components/ProjectSelector.tsx'
import { useI18n } from './i18n/useI18n.ts'

function App() {
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null)
  const { t } = useI18n()

  return (
    <main className="dashboard-shell">
      <header>
        <div className="app-header-bar">
          <h1>{t('dashboard.title')}</h1>
          <LanguageSwitcher />
        </div>
        <ProjectSelector
          value={activeProjectId}
          onChange={(id) => setActiveProjectId(id)}
        />
      </header>
      <section aria-label={t('dashboard.ariaLabel')}>
        {activeProjectId ? (
          <Dashboard key={activeProjectId} projectId={activeProjectId} />
        ) : (
          <p>{t('dashboard.selectProjectPrompt')}</p>
        )}
      </section>
    </main>
  )
}

export default App
