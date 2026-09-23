import './App.css'
import { useEffect, useState } from 'react'
import { health } from './services/api'
import CatalogPage from './pages/CatalogPage'
import CreateTaskPage from './pages/CreateTaskPage'
import ProposalsPage from './pages/ProposalsPage'
import TaskDetailsPage from './pages/TaskDetailsPage'
import TaskEditorPage from './pages/TaskEditorPage'

function App() {
  const [backendStatus, setBackendStatus] = useState('checking')
  const path = window.location.pathname
  let page = <CreateTaskPage />

  useEffect(() => {
    health()
      .then((data) => {
        setBackendStatus(data?.status === 'ok' ? 'connected' : 'unavailable')
      })
      .catch(() => {
        setBackendStatus('unavailable')
      })
  }, [])

  if (path === '/catalog') page = <CatalogPage />
  if (path.startsWith('/tasks/')) page = <TaskDetailsPage />
  if (path.startsWith('/business/tasks/') && path.endsWith('/proposals')) {
    page = <ProposalsPage />
  }
  if (path.startsWith('/business/tasks/') && !path.endsWith('/proposals')) {
    page = <TaskEditorPage />
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <a className="brand" href="/business/new">HackAlem AI</a>
        <nav aria-label="Main navigation">
          <a href="/business/new">Create task</a>
          <a href="/catalog">Catalog</a>
        </nav>
      </header>
      <main className="app-main">
        <p>
          {backendStatus === 'checking' && 'Checking backend...'}
          {backendStatus === 'connected' && 'Backend connected'}
          {backendStatus === 'unavailable' && 'Backend unavailable'}
        </p>
        {page}
      </main>
    </div>
  )
}

export default App
