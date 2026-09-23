import { useState } from 'react'

const INITIAL_FORM = {
  team_name: '',
  idea: '',
  plan: '',
  deadline: '',
  prototype_url: '',
}

function ProposalForm({ onSubmitProposal }) {
  const [formData, setFormData] = useState(INITIAL_FORM)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  function handleChange(field, value) {
    setFormData((current) => ({ ...current, [field]: value }))
    setError('')
    setSuccess('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!formData.team_name.trim() || !formData.idea.trim() || !formData.plan.trim()) {
      setError('Team name, idea and plan are required.')
      return
    }

    const payload = {
      team_name: formData.team_name,
      idea: formData.idea,
      plan: formData.plan,
      deadline: formData.deadline,
      prototype_url: formData.prototype_url,
    }

    setIsSubmitting(true)

    try {
      await onSubmitProposal(payload)
      setSuccess('Proposal submitted successfully')
      setFormData(INITIAL_FORM)
    } catch (submitError) {
      setError(submitError.message || 'Unable to submit the proposal. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="proposal-form" onSubmit={handleSubmit} noValidate>
      <label>
        Team name
        <input
          name="team_name"
          value={formData.team_name}
          onChange={(event) => handleChange('team_name', event.target.value)}
        />
      </label>
      <label>
        Idea
        <textarea
          name="idea"
          value={formData.idea}
          onChange={(event) => handleChange('idea', event.target.value)}
        />
      </label>
      <label>
        Plan
        <textarea
          name="plan"
          value={formData.plan}
          onChange={(event) => handleChange('plan', event.target.value)}
        />
      </label>
      <label>
        Deadline
        <input
          name="deadline"
          value={formData.deadline}
          onChange={(event) => handleChange('deadline', event.target.value)}
        />
      </label>
      <label>
        Prototype URL
        <input
          name="prototype_url"
          type="url"
          value={formData.prototype_url}
          onChange={(event) => handleChange('prototype_url', event.target.value)}
        />
      </label>

      {error && <p role="alert">{error}</p>}
      {success && <p role="status">{success}</p>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit Proposal'}
      </button>
    </form>
  )
}

export default ProposalForm
