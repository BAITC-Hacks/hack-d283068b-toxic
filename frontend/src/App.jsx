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
  const [generatedTask, setGeneratedTask] = useState(null)
  const [publishedTasks, setPublishedTasks] = useState([])
  const [selectedTask, setSelectedTask] = useState(null)
  const path = window.location.pathname
  let page = <CreateTaskPage onTaskGenerated={handleTaskGenerated} />

  function handleTaskGenerated(task) {
    setGeneratedTask(task)
    window.history.pushState({}, '', `/business/tasks/${task.id}`)
  }

  function handleTaskPublished(task) {
    setGeneratedTask(task)
    setPublishedTasks((current) => [
      task,
      ...current.filter((item) => item.id !== task.id),
    ])
    window.history.pushState({}, '', '/catalog')
  }

  function handleTaskOpen(task) {
    setSelectedTask(task)
    window.history.pushState({}, '', `/tasks/${task.id}`)
  }

  useEffect(() => {
    health()
      .then((data) => {
        setBackendStatus(data?.status === 'ok' ? 'connected' : 'unavailable')
      })
      .catch(() => {
        setBackendStatus('unavailable')
      })
  }, [])

  if (path === '/catalog') {
    page = <CatalogPage publishedTasks={publishedTasks} onTaskOpen={handleTaskOpen} />
  }
  if (path.startsWith('/tasks/')) page = <TaskDetailsPage task={selectedTask} />
  if (path.startsWith('/business/tasks/') && path.endsWith('/proposals')) {
    page = <ProposalsPage />
  }
  if (path.startsWith('/business/tasks/') && !path.endsWith('/proposals')) {
    page = <TaskEditorPage task={generatedTask} onTaskPublished={handleTaskPublished} />
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
