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
  const [selectedTask, setSelectedTask] = useState(null)
  const [path, setPath] = useState(window.location.pathname)
  const detailsMatch = path.match(/^\/tasks\/(\d+)\/?$/)
  const proposalsMatch = path.match(/^\/business\/tasks\/(\d+)\/proposals\/?$/)
  const editorMatch = path.match(/^\/business\/tasks\/(\d+)\/?$/)
  let page = <CreateTaskPage onTaskGenerated={handleTaskGenerated} />

  function navigate(nextPath) {
    window.history.pushState({}, '', nextPath)
    setPath(nextPath)
  }

  function handleTaskGenerated(task) {
    setSelectedTask(task)
    navigate(`/business/tasks/${task.id}`)
  }

  function handleTaskPublished(task) {
    setSelectedTask(task)
    navigate('/catalog')
  }

  function handleTaskOpen(task) {
    setSelectedTask(task)
    navigate(`/tasks/${task.id}`)
  }

  function handleViewProposals(task) {
    setSelectedTask(task)
    navigate(`/business/tasks/${task.id}/proposals`)
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

  useEffect(() => {
    function handlePopState() {
      setPath(window.location.pathname)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  if (path === '/catalog') {
    page = <CatalogPage onTaskOpen={handleTaskOpen} />
  }
  if (detailsMatch) {
    const taskId = Number(detailsMatch[1])
    page = (
      <TaskDetailsPage
        key={`details-${taskId}`}
        taskId={taskId}
        task={selectedTask?.id === taskId ? selectedTask : null}
      />
    )
  }
  if (proposalsMatch) {
    const taskId = Number(proposalsMatch[1])
    page = (
      <ProposalsPage
        key={`proposals-${taskId}`}
        taskId={taskId}
        task={selectedTask?.id === taskId ? selectedTask : null}
      />
    )
  }
  if (editorMatch) {
    const taskId = Number(editorMatch[1])
    page = (
      <TaskEditorPage
        key={`editor-${taskId}`}
        taskId={taskId}
        task={selectedTask?.id === taskId ? selectedTask : null}
        onTaskUpdated={setSelectedTask}
        onTaskPublished={handleTaskPublished}
        onViewProposals={handleViewProposals}
      />
    )
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
