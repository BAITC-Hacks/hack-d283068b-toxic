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
  const [businessTask, setBusinessTask] = useState(null)
  const [submittedProposals, setSubmittedProposals] = useState([])
  const [path, setPath] = useState(window.location.pathname)
  let page = <CreateTaskPage onTaskGenerated={handleTaskGenerated} />

  function navigate(nextPath) {
    window.history.pushState({}, '', nextPath)
    setPath(nextPath)
  }

  function handleTaskGenerated(task) {
    setGeneratedTask(task)
    setBusinessTask(task)
    navigate(`/business/tasks/${task.id}`)
  }

  function handleTaskPublished(task) {
    setGeneratedTask(task)
    setPublishedTasks((current) => [
      task,
      ...current.filter((item) => item.id !== task.id),
    ])
    setBusinessTask(task)
    navigate('/catalog')
  }

  function handleTaskOpen(task) {
    setSelectedTask(task)
    navigate(`/tasks/${task.id}`)
  }

  function handleProposalSubmitted(proposal) {
    setSubmittedProposals((current) => [
      proposal,
      ...current.filter((item) => item.id !== proposal.id),
    ])
    setBusinessTask(selectedTask)
  }

  function handleViewProposals(task) {
    setBusinessTask(task)
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
    page = <CatalogPage publishedTasks={publishedTasks} onTaskOpen={handleTaskOpen} />
  }
  if (path.startsWith('/tasks/')) {
    page = (
      <TaskDetailsPage
        task={selectedTask}
        onProposalSubmitted={handleProposalSubmitted}
      />
    )
  }
  if (path.startsWith('/business/tasks/') && path.endsWith('/proposals')) {
    page = (
      <ProposalsPage
        task={businessTask || generatedTask || selectedTask}
        submittedProposals={submittedProposals}
      />
    )
  }
  if (path.startsWith('/business/tasks/') && !path.endsWith('/proposals')) {
    page = (
      <TaskEditorPage
        task={generatedTask}
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
