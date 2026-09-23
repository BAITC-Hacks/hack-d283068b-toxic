function QuestionForm({ questions = [] }) {
  return <form className="question-form">{questions.map((question) => <label key={question.id}>{question.question}<input name={question.field} /></label>)}</form>
}

export default QuestionForm
