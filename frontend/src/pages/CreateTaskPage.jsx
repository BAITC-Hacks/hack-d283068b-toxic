import { useState } from 'react'
import QuestionForm from '../components/QuestionForm'
import { analyzeTask, createTask } from '../services/api'

function formatFieldName(field) {
  return field.replace(/_/g, ' ').replace(/^./, (letter) => letter.toUpperCase())
}

function CreateTaskPage({ onTaskGenerated }) {
  const [topic, setTopic] = useState('')
  const [description, setDescription] = useState('')
  const [missingFields, setMissingFields] = useState([])
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
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

  async function handleGenerateTask() {
    setError('')

    const allQuestionsAnswered = questions.every((question) => {
      const answer = answers.find((item) => item.field === question.field)
      return Boolean(answer?.answer.trim())
    })

    if (!allQuestionsAnswered) {
      setError('Please answer all clarification questions before generating the Task Card.')
      return
    }

    const payload = {
      draft: description,
      topic,
      answers,
    }

    setIsGenerating(true)

    try {
      const task = await createTask(payload)
      onTaskGenerated?.(task)
    } catch (requestError) {
      setError(requestError.message || 'Unable to generate the Task Card. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <section className="page-placeholder">
      <p className="eyebrow">Business</p>
      <h1>Create task</h1>

      <form onSubmit={handleAnalyze}>
        <label>
          Topic
          <input value={topic} onChange={(event) => {
            setTopic(event.target.value)
            setQuestions([])
            setMissingFields([])
            setAnswers([])
          }} />
        </label>

        <label>
          Description
          <textarea
            value={description}
            onChange={(event) => {
              setDescription(event.target.value)
              setQuestions([])
              setMissingFields([])
              setAnswers([])
            }}
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
          <button type="button" onClick={handleGenerateTask} disabled={isGenerating}>
            {isGenerating ? 'Generating Task Card...' : 'Generate Task Card'}
          </button>
        </section>
      )}
    </section>
  )
}

export default CreateTaskPage
