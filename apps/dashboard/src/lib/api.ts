import { APIClient } from '@ai-company/api'

const serverPort = window.location.port === '5173' ? '3001' : window.location.port
const baseURL = `${window.location.protocol}//${window.location.hostname}:${serverPort}`
const wsURL = `ws://${window.location.hostname}:${serverPort}/ws`

export const api = new APIClient({
  baseURL,
  wsURL,
})
