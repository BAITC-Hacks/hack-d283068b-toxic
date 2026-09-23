import Rating from '../components/Rating'
import ProposalForm from '../components/ProposalForm'

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

async function submitProposal(task, payload) {
  // DEV MOCK: replace with createProposal(task.id, payload) when backend network is available
  await new Promise((resolve) => setTimeout(resolve, 300))

  return {
    id: 1,
    task_id: task.id,
    team_name: payload.team_name,
    idea: payload.idea,
    plan: payload.plan,
    deadline: payload.deadline,
    prototype_url: payload.prototype_url,
    status: 'pending',
  }
}

function TaskDetailsPage({ task, onProposalSubmitted }) {
  if (!task) {
    return (
      <section className="page-placeholder">
        <p className="eyebrow">Student</p>
        <h1>Task details</h1>
        <p>Task data is unavailable. Open a task from the Catalog.</p>
      </section>
    )
  }

  async function handleSubmitProposal(payload) {
    const proposal = await submitProposal(task, payload)
    onProposalSubmitted?.(proposal)
    return proposal
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

      <section className="proposal-section" aria-labelledby="proposal-title">
        <h2 id="proposal-title">Submit proposal</h2>
        <ProposalForm onSubmitProposal={handleSubmitProposal} />
      </section>
    </section>
  )
}

export default TaskDetailsPage
