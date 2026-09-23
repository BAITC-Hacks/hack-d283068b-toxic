import { useEffect, useState } from 'react'
import Rating from '../components/Rating'
import ProposalForm from '../components/ProposalForm'
import { createProposal, getTask } from '../services/api'

const TASK_FIELDS = [
  ['topic', 'Topic'],
  ['context', 'Context'],
  ['need', 'Need'],
  ['users', 'Users'],
  ['data_materials', 'Data and materials'],
  ['constraints', 'Constraints'],
  ['expected_result', 'Expected result'],
  ['success_criteria', 'Success criteria'],
  ['contact', 'Contact'],
  ['interaction_format', 'Interaction format'],
]

function TaskDetailsPage({ taskId, task }) {
  const [currentTask, setCurrentTask] = useState(task?.id === taskId ? task : null)
  const [isLoading, setIsLoading] = useState(!task || task.id !== taskId)
  const [error, setError] = useState('')

  useEffect(() => {
    if (task?.id === taskId) return
    let active = true
    getTask(taskId)
      .then((loadedTask) => {
        if (!active) return
        setCurrentTask(loadedTask)
        setIsLoading(false)
      })
      .catch((loadError) => {
        if (!active) return
        setError(loadError.message || 'Unable to load the task.')
        setIsLoading(false)
      })
    return () => { active = false }
  }, [taskId, task])

  if (isLoading || !currentTask) {
    return (
      <section className="page-placeholder">
        <p className="eyebrow">Student</p>
        <h1>Task details</h1>
        <p>{isLoading ? 'Loading task...' : error || 'Task data is unavailable.'}</p>
      </section>
    )
  }

  async function handleSubmitProposal(payload) {
    return createProposal(currentTask.id, payload)
  }

  return (
    <section className="page-placeholder">
      <p className="eyebrow">Student</p>
      <h1>{currentTask.title}</h1>
      <p>Status: {currentTask.status}</p>

      <div className="details-layout">
        <dl className="task-details">
          {TASK_FIELDS.map(([field, label]) => (
            <div key={field}>
              <dt>{label}</dt>
              <dd>{currentTask[field] || 'Not provided'}</dd>
            </div>
          ))}
        </dl>

        <Rating
          score={currentTask.score}
          readiness={currentTask.readiness}
          missingFields={currentTask.missing_fields}
        />
      </div>

      <section className="proposal-section" aria-labelledby="proposal-title">
        <h2 id="proposal-title">Submit proposal</h2>
        <ProposalForm onSubmitProposal={handleSubmitProposal} />
      </section>
    </section>
  )
}

export default TaskDetailsPage
