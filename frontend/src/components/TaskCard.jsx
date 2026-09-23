function TaskCard({ task }) {
  return <article className="task-card"><h2>{task?.title || 'Task title'}</h2><p>{task?.topic || 'Topic'}</p></article>
}

export default TaskCard
