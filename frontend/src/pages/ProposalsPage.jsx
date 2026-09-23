import { useEffect, useState } from 'react'
import { getProposals, getTask, updateProposalStatus } from '../services/api'

function ProposalsPage({ taskId, task }) {
  const [currentTask, setCurrentTask] = useState(task?.id === taskId ? task : null)
  const [proposals, setProposals] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [updating, setUpdating] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    const taskRequest = task?.id === taskId ? Promise.resolve(task) : getTask(taskId)
    Promise.all([taskRequest, getProposals(taskId)])
      .then(([loadedTask, loadedProposals]) => {
        if (!active) return
        setCurrentTask(loadedTask)
        setProposals(loadedProposals)
        setIsLoading(false)
      })
      .catch((loadError) => {
        if (!active) return
        setError(loadError.message || 'Unable to load proposals.')
        setIsLoading(false)
      })
    return () => { active = false }
  }, [taskId, task])

  async function handleStatusChange(proposal, status) {
    setError('')
    setUpdating({ proposalId: proposal.id, status })

    try {
      const updatedProposal = await updateProposalStatus(proposal.id, status)
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
      <h1>Proposals{currentTask ? ` for ${currentTask.title}` : ''}</h1>

      {isLoading && <p role="status">Loading proposals...</p>}
      {error && <p role="alert">{error}</p>}
      {!isLoading && !error && proposals.length === 0 && <p>No proposals yet.</p>}

      {!isLoading && (
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
                    disabled={Boolean(updating)}
                  >
                    {isUpdating && updating.status === 'accepted' ? 'Accepting...' : 'Accept'}
                  </button>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => handleStatusChange(proposal, 'rejected')}
                    disabled={Boolean(updating)}
                  >
                    {isUpdating && updating.status === 'rejected' ? 'Rejecting...' : 'Reject'}
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}

export default ProposalsPage
