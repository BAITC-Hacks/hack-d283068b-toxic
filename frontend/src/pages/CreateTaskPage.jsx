import { useState } from 'react'
import QuestionForm from '../components/QuestionForm'
import { analyzeTask } from '../services/api'

function formatFieldName(field) {
  return field.replace(/_/g, ' ').replace(/^./, (letter) => letter.toUpperCase())
}

// DEV MOCK: remove when backend network connection is available
const DEV_MOCK_ANALYSIS_RESPONSE = {
  missing_fields: [
    'users',
    'data_materials',
    'expected_result',
  ],
  questions: [
    {
      id: 'q1',
      field: 'users',
      question: 'Кто будет основным пользователем решения?',
    },
    {
      id: 'q2',
      field: 'data_materials',
      question: 'Какие данные или материалы доступны для решения задачи?',
    },
    {
      id: 'q3',
      field: 'expected_result',
      question: 'Какой конкретный результат бизнес ожидает получить?',
    },
  ],
}

function isNetworkError(error) {
  if (!(error instanceof TypeError)) return false

  return /failed to fetch|networkerror|network request failed|load failed/i.test(
    error.message,
  )
}

// DEV MOCK: replace with createTask(payload) when backend network is available
const DEV_MOCK_TASK = {
  id: 1,
  title: 'AI-анализ практических заданий',
  topic: 'Education',
  context: 'Тестовый контекст',
  need: 'Тестовая потребность',
  users: 'Студенты',
  data_materials: 'Примеры практических заданий',
  constraints: '',
  expected_result: 'Работающий прототип',
  success_criteria: '',
  contact: '',
  interaction_format: '',
  score: 65,
  readiness: 'working',
  missing_fields: [
    'success_criteria',
    'contact',
    'interaction_format',
  ],
  status: 'draft',
}

async function generateTaskCard(payload) {
  void payload
  await new Promise((resolve) => setTimeout(resolve, 300))
  return { ...DEV_MOCK_TASK, missing_fields: [...DEV_MOCK_TASK.missing_fields] }
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
      let response

      try {
        response = await analyzeTask({ description, topic })
      } catch (requestError) {
        if (!isNetworkError(requestError)) throw requestError

        response = DEV_MOCK_ANALYSIS_RESPONSE
      }

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
      const task = await generateTaskCard(payload)
      onTaskGenerated?.(task)
    } catch {
      setError('Unable to generate the Task Card. Please try again.')
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
          <button type="button" onClick={handleGenerateTask} disabled={isGenerating}>
            {isGenerating ? 'Generating Task Card...' : 'Generate Task Card'}
          </button>
        </section>
      )}
    </section>
  )
}

export default CreateTaskPage
