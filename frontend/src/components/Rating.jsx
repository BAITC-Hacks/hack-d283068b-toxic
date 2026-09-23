function Rating({ score, readiness, breakdown, missingFields = [] }) {
  return <section className="rating"><h2>Rating</h2><p>{score ?? 0} / 100</p><p>{readiness || 'draft'}</p>{breakdown && <pre>{JSON.stringify(breakdown, null, 2)}</pre>}{missingFields.length > 0 && <p>Missing: {missingFields.join(', ')}</p>}</section>
}

export default Rating
