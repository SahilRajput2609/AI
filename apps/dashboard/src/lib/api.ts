import { APIClient } from '@ai-company/api'

export const api = new APIClient({
  baseURL: window.location.origin,
  wsURL: window.location.origin.replace(/^http/, 'ws'),
})
