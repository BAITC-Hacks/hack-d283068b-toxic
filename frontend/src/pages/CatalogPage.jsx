import { useEffect, useState } from 'react'
import TaskCard from '../components/TaskCard'
import { getTasks } from '../services/api'

function CatalogPage({ onTaskOpen }) {
  const [topic, setTopic] = useState('')
  const [readiness, setReadiness] = useState('')
  const [sort, setSort] = useState('rating_desc')
  const [tasks, setTasks] = useState([])
  const [topics, setTopics] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    getTasks({ topic, readiness, sort })
      .then((loadedTasks) => {
        if (!active) return
        setTasks(loadedTasks)
        if (!topic && !readiness) {
          setTopics([...new Set(loadedTasks.map((task) => task.topic))].sort())
        }
        setError('')
        setIsLoading(false)
      })
      .catch((loadError) => {
        if (!active) return
        setTasks([])
        setError(loadError.message || 'Unable to load the catalog.')
        setIsLoading(false)
      })
    return () => { active = false }
  }, [topic, readiness, sort])

  function changeFilter(setFilter, value) {
    setIsLoading(true)
    setError('')
    setFilter(value)
  }

  return (
    <section className="page-placeholder">
      <p className="eyebrow">Student</p>
      <h1>Catalog</h1>

      <div className="catalog-filters">
        <label>
          Topic
          <select value={topic} onChange={(event) => changeFilter(setTopic, event.target.value)}>
            <option value="">All topics</option>
            {topics.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>

        <label>
          Readiness
          <select value={readiness} onChange={(event) => changeFilter(setReadiness, event.target.value)}>
            <option value="">All readiness levels</option>
            <option value="draft">Draft</option>
            <option value="working">Working</option>
            <option value="ready">Ready</option>
            <option value="priority">Priority</option>
          </select>
        </label>

        <label>
          Sort
          <select value={sort} onChange={(event) => changeFilter(setSort, event.target.value)}>
            <option value="rating_desc">Rating: high to low</option>
            <option value="rating_asc">Rating: low to high</option>
          </select>
        </label>
      </div>

      {isLoading && <p role="status">Loading tasks...</p>}
      {error && <p role="alert">{error}</p>}
      {!isLoading && !error && (
        <>
          <div className="task-grid">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} onOpen={onTaskOpen} />
            ))}
          </div>
          {tasks.length === 0 && <p>No published tasks match the selected filters.</p>}
        </>
      )}
    </section>
  )
}

export default CatalogPage
