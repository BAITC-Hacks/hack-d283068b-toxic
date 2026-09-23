const API_BASE_URL = 'http://localhost:8000/api'

async function parseJson(response) {
  const text = await response.text()

  if (!text) return null

  try {
    return JSON.parse(text)
  } catch {
    throw new Error('Backend returned an invalid JSON response')
  }
}

async function request(path, options = {}) {
  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('Cannot connect to backend at http://localhost:8000. Check that it is running.')
    }
    throw error
  }

  const data = await parseJson(response)

  if (!response.ok) {
    const message = data?.detail || data?.message || data?.error
    throw new Error(message || `API request failed with status ${response.status}`)
  }

  return data
}

export const health = () => request('/health')

export const analyzeTask = (payload) =>
  request('/tasks/analyze', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const createTask = (payload) =>
  request('/tasks', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const updateTask = (taskId, payload) =>
  request(`/tasks/${taskId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })

export const publishTask = (taskId) =>
  request(`/tasks/${taskId}/publish`, {
    method: 'POST',
  })

export const getTasks = ({ topic, readiness, sort } = {}) => {
  const searchParams = new URLSearchParams()

  if (topic) searchParams.set('topic', topic)
  if (readiness) searchParams.set('readiness', readiness)
  if (sort) searchParams.set('sort', sort)

  const query = searchParams.toString()
  return request(`/tasks${query ? `?${query}` : ''}`)
}

export const getTask = (taskId) => request(`/tasks/${taskId}`)

export const createProposal = (taskId, payload) =>
  request(`/tasks/${taskId}/proposals`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const getProposals = (taskId) =>
  request(`/tasks/${taskId}/proposals`)

export const updateProposalStatus = (proposalId, status) =>
  request(`/proposals/${proposalId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
