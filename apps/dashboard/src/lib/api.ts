import { APIClient } from '@ai-company/api'

const isDev = window.location.port === '5173'
const serverPort = isDev ? '3001' : window.location.port
const portSuffix = serverPort ? `:${serverPort}` : ''
const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws'

const baseURL = `${window.location.protocol}//${window.location.hostname}${portSuffix}`
const wsURL = `${wsProtocol}://${window.location.hostname}${portSuffix}/ws`

export const api = new APIClient({
  baseURL,
  wsURL,
})
