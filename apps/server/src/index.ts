import 'dotenv/config'
import express from 'express'
import { createServer } from 'http'
import { setupWebSocket } from './websocket'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { apiRouter, setBroadcast } from './routes/api.js'
import { errorMiddleware, notFoundMiddleware } from '@ai-company/backend'

const PORT = parseInt(process.env.PORT || '3001', 10)
const isDev = process.env.NODE_ENV !== 'production'

const app = express()
const server = createServer(app)
const { broadcast } = setupWebSocket(server)

app.use(express.json())

const allowedOrigins = (process.env.CORS_ORIGINS || '*').split(',')
app.use((req, res, next) => {
  const origin = req.headers.origin
  if (allowedOrigins.includes('*') || !origin || allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*')
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
  if (req.method === 'OPTIONS') {
    res.sendStatus(204)
    return
  }
  next()
})

// broadcast provided by websocket module
setBroadcast(broadcast)

app.use('/api', apiRouter)

app.use(notFoundMiddleware)
app.use(errorMiddleware)

if (!isDev) {
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = dirname(__filename)
  const distPath = join(__dirname, '..', '..', 'dashboard', 'dist')
  app.use(express.static(distPath))
  app.get('*', (_req, res) => {
    res.sendFile(join(distPath, 'index.html'))
  })
}

server.listen(PORT, () => {
  console.log(`AI-Company server running on http://localhost:${PORT}`)
  if (isDev) {
    console.log(`Dashboard dev server at http://localhost:5173`)
  }
})
