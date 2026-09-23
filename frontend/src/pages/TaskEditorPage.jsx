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

function TaskEditorPage({ task }) {
  const [formData, setFormData] = useState(() => {
    if (!task) return {}

    return Object.fromEntries(
      EDITABLE_FIELDS.map(([field]) => [field, task[field] || '']),
    )
  })

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

  return (
    <section className="page-placeholder">
      <p className="eyebrow">Business</p>
      <h1>Task editor</h1>

      <div className="editor-layout">
        <form className="task-editor-form" onSubmit={(event) => event.preventDefault()}>
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
        </form>

        <Rating
          score={task.score}
          readiness={task.readiness}
          missingFields={task.missing_fields}
        />
      </div>
    </section>
  )
}

export default TaskEditorPage
