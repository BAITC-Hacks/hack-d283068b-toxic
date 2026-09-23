import { useState } from 'react'
import QuestionForm from '../components/QuestionForm'
import { analyzeTask } from '../services/api'

function formatFieldName(field) {
  return field.replace(/_/g, ' ').replace(/^./, (letter) => letter.toUpperCase())
}

function CreateTaskPage() {
  const [topic, setTopic] = useState('')
  const [description, setDescription] = useState('')
  const [missingFields, setMissingFields] = useState([])
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState('')

  async function handleAnalyze(event) {
    event.preventDefault()
    setError('')

    if (!description.trim()) {
      setError('Please enter a description before analyzing the task.')
      return
    }

    setIsAnalyzing(true)

    try {
      const response = await analyzeTask({ description, topic })
      setMissingFields(Array.isArray(response?.missing_fields) ? response.missing_fields : [])
      setQuestions(Array.isArray(response?.questions) ? response.questions : [])
      setAnswers([])
    } catch (requestError) {
      setError(requestError.message || 'Unable to analyze the task. Please try again.')
      setMissingFields([])
      setQuestions([])
      setAnswers([])
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <section className="page-placeholder">
      <p className="eyebrow">Business</p>
      <h1>Create task</h1>

      <form onSubmit={handleAnalyze}>
        <label>
          Topic
          <input value={topic} onChange={(event) => setTopic(event.target.value)} />
        </label>

        <label>
          Description
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Describe the business problem"
          />
        </label>

        {error && <p role="alert">{error}</p>}

        <button type="submit" disabled={isAnalyzing}>
          {isAnalyzing ? 'Analyzing...' : 'Analyze'}
        </button>
      </form>

      {missingFields.length > 0 && (
        <section aria-labelledby="missing-fields-title">
          <h2 id="missing-fields-title">Information to clarify</h2>
          <ul>
            {missingFields.map((field) => <li key={field}>{formatFieldName(field)}</li>)}
          </ul>
        </section>
      )}

      {questions.length > 0 && (
        <section aria-labelledby="questions-title">
          <h2 id="questions-title">AI Questions</h2>
          <QuestionForm
            key={questions.map((question) => question.id).join('-')}
            questions={questions}
            onAnswersChange={setAnswers}
          />
          <p>{answers.filter((answer) => answer.answer.trim()).length} answers collected</p>
        </section>
      )}
    </section>
  )
}

export default CreateTaskPage
