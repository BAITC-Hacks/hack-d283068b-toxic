import { useState } from 'react'
import Rating from '../components/Rating'

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

async function saveTaskAndRecalculate(task, payload) {
  // DEV MOCK: replace with updateTask(task.id, payload) when backend network is available
  await new Promise((resolve) => setTimeout(resolve, 300))

  const hasRequiredDemoFields = [
    'success_criteria',
    'contact',
    'interaction_format',
  ].every((field) => payload[field].trim())

  return {
    ...task,
    ...payload,
    score: hasRequiredDemoFields ? 100 : 65,
    readiness: hasRequiredDemoFields ? 'priority' : 'working',
    missing_fields: hasRequiredDemoFields
      ? []
      : ['success_criteria', 'contact', 'interaction_format'],
  }
}

async function publishCurrentTask(task) {
  // DEV MOCK: replace with publishTask(task.id) when backend network is available
  await new Promise((resolve) => setTimeout(resolve, 300))
  return { ...task, status: 'published' }
}

function TaskEditorPage({ task, onTaskPublished, onViewProposals }) {
  const [currentTask, setCurrentTask] = useState(task)
  const [formData, setFormData] = useState(() => {
    if (!task) return {}

    return Object.fromEntries(
      EDITABLE_FIELDS.map(([field]) => [field, task[field] || '']),
    )
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [error, setError] = useState('')

  if (!task) {
    return (
      <section className="page-placeholder">
        <p className="eyebrow">Business</p>
        <h1>Task editor</h1>
        <p>Task data is unavailable. Generate a Task Card first.</p>
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
      const updatedTask = await saveTaskAndRecalculate(currentTask, payload)
      setCurrentTask(updatedTask)
      setFormData(
        Object.fromEntries(
          EDITABLE_FIELDS.map(([field]) => [field, updatedTask[field] || '']),
        ),
      )
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
      const publishedTask = await publishCurrentTask(currentTask)
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
