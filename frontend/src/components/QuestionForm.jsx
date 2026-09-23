import { useState } from 'react'

function QuestionForm({ questions = [], onAnswersChange }) {
  const [values, setValues] = useState({})

  function handleChange(field, value) {
    const nextValues = { ...values, [field]: value }
    setValues(nextValues)

    const nextAnswers = questions.map((question) => ({
      field: question.field,
      answer: nextValues[question.field] || '',
    }))

    onAnswersChange?.(nextAnswers)
  }

  return (
    <form className="question-form" onSubmit={(event) => event.preventDefault()}>
      {questions.map((question) => (
        <label key={question.id}>
          {question.question}
          <textarea
            name={question.field}
            value={values[question.field] || ''}
            onChange={(event) => handleChange(question.field, event.target.value)}
          />
        </label>
      ))}
    </form>
  )
}

export default QuestionForm
