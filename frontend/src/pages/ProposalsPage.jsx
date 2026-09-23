import { useState } from 'react'

function createMockProposals(taskId) {
  // DEV MOCK: replace with getProposals(task.id) when backend network is available
  return [
    {
      id: 2,
      task_id: taskId,
      team_name: 'DataCraft',
      idea: 'Создать понятный AI-помощник для первичного анализа задачи.',
      plan: '1. Анализ данных\n2. Прототип\n3. Тестирование',
      deadline: '2 weeks',
      prototype_url: 'https://github.com/example/datacraft',
      status: 'pending',
    },
    {
      id: 3,
      task_id: taskId,
      team_name: 'Alem Builders',
      idea: 'Собрать рабочий web-прототип и проверить его на примерах.',
      plan: '1. Интервью\n2. Разработка\n3. Демонстрация',
      deadline: '3 weeks',
      prototype_url: 'https://github.com/example/alem-builders',
      status: 'pending',
    },
  ]
}

async function changeProposalStatus(proposal, status) {
  // DEV MOCK: replace with updateProposalStatus(proposal.id, status) when backend network is available
  await new Promise((resolve) => setTimeout(resolve, 300))
  return { ...proposal, status }
}

function ProposalsPage({ task, submittedProposals = [] }) {
  const [proposals, setProposals] = useState(() => {
    const taskId = task?.id ?? 1
    const submittedForTask = submittedProposals.filter(
      (proposal) => proposal.task_id === taskId,
    )

    return [...submittedForTask, ...createMockProposals(taskId)]
  })
  const [updating, setUpdating] = useState(null)
  const [error, setError] = useState('')

  if (!task) {
    return (
      <section className="page-placeholder">
        <p className="eyebrow">Business</p>
        <h1>Proposals</h1>
        <p>Task data is unavailable. Open proposals from the Task Editor.</p>
      </section>
    )
  }

  async function handleStatusChange(proposal, status) {
    setError('')
    setUpdating({ proposalId: proposal.id, status })

    try {
      const updatedProposal = await changeProposalStatus(proposal, status)
      setProposals((current) => current.map((item) => (
        item.id === updatedProposal.id ? updatedProposal : item
      )))
    } catch (updateError) {
      setError(updateError.message || 'Unable to update the proposal. Please try again.')
    } finally {
      setUpdating(null)
    }
  }

  return (
    <section className="page-placeholder">
      <p className="eyebrow">Business</p>
      <h1>Proposals for {task.title}</h1>

      {error && <p role="alert">{error}</p>}

      <div className="proposal-list">
        {proposals.map((proposal) => {
          const isUpdating = updating?.proposalId === proposal.id

          return (
            <article className="proposal-card" key={proposal.id}>
              <div className="proposal-card-header">
                <h2>{proposal.team_name}</h2>
                <span className={`proposal-status proposal-status-${proposal.status}`}>
                  {proposal.status.toUpperCase()}
                </span>
              </div>

              <h3>Idea</h3>
              <p>{proposal.idea}</p>
              <h3>Plan</h3>
              <p className="proposal-plan">{proposal.plan}</p>
              <p><strong>Deadline:</strong> {proposal.deadline || 'Not provided'}</p>
              <p>
                <strong>Prototype:</strong>{' '}
                {proposal.prototype_url ? (
                  <a href={proposal.prototype_url} target="_blank" rel="noreferrer">
                    {proposal.prototype_url}
                  </a>
                ) : 'Not provided'}
              </p>

              <div className="proposal-actions">
                <button
                  type="button"
                  onClick={() => handleStatusChange(proposal, 'accepted')}
                  disabled={isUpdating}
                >
                  {isUpdating && updating.status === 'accepted' ? 'Accepting...' : 'Accept'}
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => handleStatusChange(proposal, 'rejected')}
                  disabled={isUpdating}
                >
                  {isUpdating && updating.status === 'rejected' ? 'Rejecting...' : 'Reject'}
                </button>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default ProposalsPage
