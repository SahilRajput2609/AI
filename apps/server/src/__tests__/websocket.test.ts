import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import type { Server as HttpServer } from 'http'
import { createServer } from 'http'
import type { AddressInfo } from 'net'
import { WebSocket as WsClient } from 'ws'
import { setupWebSocket } from '../websocket'

describe.skip('WebSocket Server', () => {
  let httpServer: HttpServer
  let serverUrl: string

  beforeAll(async () => {
    httpServer = createServer()
    setupWebSocket(httpServer)

    return new Promise<void>((resolve) => {
      httpServer.listen(0, () => {
        const address = httpServer.address() as AddressInfo
        const port = address.port
        serverUrl = `ws://localhost:${port}`
        resolve()
      })
    })
  })

  afterAll(async () => {
    return new Promise<void>((resolve) => {
      httpServer.close(() => {
        resolve()
      })
    })
  })

  it('should establish WebSocket connection', async () => {
    return new Promise<void>((resolve, reject) => {
      const ws = new WsClient(`${serverUrl}/ws`)

      const timeout = setTimeout(() => {
        ws.close()
        reject(new Error('Connection timeout'))
      }, 2000)

      ws.on('open', () => {
        clearTimeout(timeout)
        expect(ws.readyState).toBe(WsClient.OPEN)
        ws.close()
        resolve()
      })

      ws.on('error', (error) => {
        clearTimeout(timeout)
        ws.close()
        reject(error)
      })
    })
  })

  it('should receive welcome message on connection', async () => {
    return new Promise<void>((resolve, reject) => {
      const ws = new WsClient(`${serverUrl}/ws`)

      const timeout = setTimeout(() => {
        ws.close()
        reject(new Error('No welcome message received'))
      }, 2000)

      ws.on('message', (data) => {
        const message = JSON.parse(data.toString())
        if (message.event === 'welcome') {
          clearTimeout(timeout)
          expect(message.event).toBe('welcome')
          expect(message.message).toBe('connected')
          expect(message.timestamp).toBeDefined()
          ws.close()
          resolve()
        }
      })

      ws.on('error', (error) => {
        clearTimeout(timeout)
        ws.close()
        reject(error)
      })
    })
  })

  it('should echo messages back to client', async () => {
    return new Promise<void>((resolve, reject) => {
      const ws = new WsClient(`${serverUrl}/ws`)
      const testMessage = 'Hello WebSocket'
      let receivedWelcome = false

      const timeout = setTimeout(() => {
        ws.close()
        reject(new Error('Echo message not received'))
      }, 2000)

      ws.on('message', (data) => {
        const message = JSON.parse(data.toString())

        if (message.event === 'welcome') {
          receivedWelcome = true
          ws.send(testMessage)
        } else if (message.event === 'echo' && receivedWelcome) {
          clearTimeout(timeout)
          expect(message.data).toBe(testMessage)
          expect(message.timestamp).toBeDefined()
          ws.close()
          resolve()
        }
      })

      ws.on('error', (error) => {
        clearTimeout(timeout)
        ws.close()
        reject(error)
      })
    })
  })

  it('should handle multiple clients', async () => {
    return new Promise<void>((resolve, reject) => {
      const ws1 = new WsClient(`${serverUrl}/ws`)
      const ws2 = new WsClient(`${serverUrl}/ws`)
      let client1Connected = false
      let client2Connected = false

      const timeout = setTimeout(() => {
        ws1.close()
        ws2.close()
        reject(new Error('Multiple clients connection timeout'))
      }, 2000)

      ws1.on('open', () => {
        client1Connected = true
        checkBothConnected()
      })

      ws2.on('open', () => {
        client2Connected = true
        checkBothConnected()
      })

      function checkBothConnected() {
        if (client1Connected && client2Connected) {
          clearTimeout(timeout)
          expect(ws1.readyState).toBe(WsClient.OPEN)
          expect(ws2.readyState).toBe(WsClient.OPEN)
          ws1.close()
          ws2.close()
          resolve()
        }
      }

      ws1.on('error', reject)
      ws2.on('error', reject)
    })
  })
})
