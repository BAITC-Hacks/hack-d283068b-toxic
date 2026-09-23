import Rating from '../components/Rating'

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

function TaskDetailsPage({ task }) {
  if (!task) {
    return (
      <section className="page-placeholder">
        <p className="eyebrow">Student</p>
        <h1>Task details</h1>
        <p>Task data is unavailable. Open a task from the Catalog.</p>
      </section>
    )
  }

  return (
    <section className="page-placeholder">
      <p className="eyebrow">Student</p>
      <h1>{task.title}</h1>
      <p>Status: {task.status}</p>

      <div className="details-layout">
        <dl className="task-details">
          {TASK_FIELDS.map(([field, label]) => (
            <div key={field}>
              <dt>{label}</dt>
              <dd>{task[field] || 'Not provided'}</dd>
            </div>
          ))}
        </dl>

        <Rating
          score={task.score}
          readiness={task.readiness}
          missingFields={task.missing_fields}
        />
      </div>
    </section>
  )
}

export default TaskDetailsPage
