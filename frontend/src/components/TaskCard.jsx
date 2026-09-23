function TaskCard({ task, onOpen }) {
  return (
    <article className="task-card">
      <h2>{task.title}</h2>
      <p>Topic: {task.topic}</p>
      <p>Rating: {task.score} / 100</p>
      <p>Status: {task.readiness.toUpperCase()}</p>
      <button type="button" onClick={() => onOpen?.(task)}>Open</button>
    </article>
  )
}

export default TaskCard
