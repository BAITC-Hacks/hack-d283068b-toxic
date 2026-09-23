function ProposalForm() {
  return <form className="proposal-form">
    <label>Team name<input name="team_name" /></label>
    <label>Idea<textarea name="idea" /></label>
    <label>Plan<textarea name="plan" /></label>
    <label>Deadline<input name="deadline" /></label>
    <label>Prototype URL<input name="prototype_url" type="url" /></label>
  </form>
}

export default ProposalForm
