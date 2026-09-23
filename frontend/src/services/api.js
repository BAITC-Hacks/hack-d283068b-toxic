const API_BASE_URL = 'http://localhost:8000/api'

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })

  if (!response.ok) throw new Error(`API request failed: ${response.status}`)
  return response.json()
}

export const health = () => request('/health')
export const analyzeTask = (payload) => request('/tasks/analyze', { method: 'POST', body: JSON.stringify(payload) })
export const createTask = (payload) => request('/tasks', { method: 'POST', body: JSON.stringify(payload) })
export const updateTask = (taskId, payload) => request(`/tasks/${taskId}`, { method: 'PUT', body: JSON.stringify(payload) })
export const publishTask = (taskId) => request(`/tasks/${taskId}/publish`, { method: 'POST' })
export const getTasks = (query = '') => request(`/tasks${query}`)
export const getTask = (taskId) => request(`/tasks/${taskId}`)
export const createProposal = (taskId, payload) => request(`/tasks/${taskId}/proposals`, { method: 'POST', body: JSON.stringify(payload) })
export const getProposals = (taskId) => request(`/tasks/${taskId}/proposals`)
export const updateProposalStatus = (proposalId, status) => request(`/proposals/${proposalId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) })
