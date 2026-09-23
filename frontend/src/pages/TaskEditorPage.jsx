import { useEffect, useState } from 'react'
import Rating from '../components/Rating'
import { getTask, publishTask, updateTask } from '../services/api'

const EDITABLE_FIELDS = [
  ['title', 'Title'],
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

function fieldsFromTask(task) {
  return Object.fromEntries(
    EDITABLE_FIELDS.map(([field]) => [field, task?.[field] || '']),
  )
}

function TaskEditorPage({ taskId, task, onTaskUpdated, onTaskPublished, onViewProposals }) {
  const [currentTask, setCurrentTask] = useState(task?.id === taskId ? task : null)
  const [formData, setFormData] = useState(() => fieldsFromTask(task?.id === taskId ? task : null))
  const [isLoading, setIsLoading] = useState(!task || task.id !== taskId)
  const [isSaving, setIsSaving] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (task?.id === taskId) return
    let active = true
    getTask(taskId)
      .then((loadedTask) => {
        if (!active) return
        setCurrentTask(loadedTask)
        setFormData(fieldsFromTask(loadedTask))
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
        <p className="eyebrow">Business</p>
        <h1>Task editor</h1>
        <p>{isLoading ? 'Loading task...' : error || 'Task data is unavailable.'}</p>
      </section>
    )
  }

  function handleFieldChange(field, value) {
    setFormData((current) => ({ ...current, [field]: value }))
  }

  async function handleSave(event) {
    event.preventDefault()
    setError('')

    const payload = Object.fromEntries(
      EDITABLE_FIELDS.map(([field]) => [field, formData[field] || '']),
    )

    setIsSaving(true)

    try {
      const updatedTask = await updateTask(currentTask.id, payload)
      setCurrentTask(updatedTask)
      setFormData(fieldsFromTask(updatedTask))
      onTaskUpdated?.(updatedTask)
    } catch (saveError) {
      setError(saveError.message || 'Unable to save the task. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  async function handlePublish() {
    setError('')
    setIsPublishing(true)

    try {
      const publishedTask = await publishTask(currentTask.id)
      setCurrentTask(publishedTask)
      onTaskPublished?.(publishedTask)
    } catch (publishError) {
      setError(publishError.message || 'Unable to publish the task. Please try again.')
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <section className="page-placeholder">
      <p className="eyebrow">Business</p>
      <h1>Task editor</h1>

      <div className="editor-layout">
        <form className="task-editor-form" onSubmit={handleSave}>
          {EDITABLE_FIELDS.map(([field, label]) => (
            <label key={field}>
              {label}
              {field === 'title' || field === 'topic' || field === 'contact' ? (
                <input
                  name={field}
                  value={formData[field]}
                  onChange={(event) => handleFieldChange(field, event.target.value)}
                />
              ) : (
                <textarea
                  name={field}
                  value={formData[field]}
                  onChange={(event) => handleFieldChange(field, event.target.value)}
                />
              )}
            </label>
          ))}

          {error && <p role="alert">{error}</p>}

          <button type="submit" disabled={isSaving || isPublishing}>
            {isSaving ? 'Saving & Recalculating...' : 'Save & Recalculate'}
          </button>
          <button type="button" onClick={handlePublish} disabled={isPublishing || isSaving}>
            {isPublishing ? 'Publishing...' : 'Publish'}
          </button>
          <button
            type="button"
            onClick={() => onViewProposals?.(currentTask)}
            disabled={isPublishing || isSaving}
          >
            View Proposals
          </button>
        </form>

        <Rating
          score={currentTask.score}
          readiness={currentTask.readiness}
          missingFields={currentTask.missing_fields}
        />
      </div>
    </section>
  )
}

export default TaskEditorPage
