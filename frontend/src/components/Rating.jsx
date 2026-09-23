function formatFieldName(field) {
  return field.replace(/_/g, ' ').replace(/^./, (letter) => letter.toUpperCase())
}

function Rating({ score, readiness, missingFields = [] }) {
  return (
    <aside className="rating" aria-label="Task rating">
      <h2>Rating: {score} / 100</h2>
      <p>Status: {(readiness || '').toUpperCase()}</p>

      <h3>Missing information</h3>
      {missingFields.length > 0 ? (
        <ul>
          {missingFields.map((field) => (
            <li key={field}>{formatFieldName(field)}</li>
          ))}
        </ul>
      ) : (
        <p>No missing information</p>
      )}
    </aside>
  )
}

export default Rating
