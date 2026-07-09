import { useEffect, useState, useCallback, useRef } from 'react'

export interface RealtimeNotification {
  id: string
  type: 'success' | 'warning' | 'info' | 'error'
  title: string
  message: string
  time: string
}

export interface RealtimeLog {
  prefix: string
  text: string
  color: string
}

export interface RealtimeAgentStatus {
  id: string
  role: string
  name: string
  status: string
  currentTask?: string
  metrics?: { label: string; value: number }[]
  logs?: { level: string; message: string }[]
}

export interface FileSavedEvent {
  projectId: string
  path: string
}

export function useRealtime() {
  const [connected, setConnected] = useState(false)
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([])
  const [logs, setLogs] = useState<RealtimeLog[]>([])
  const [chatMessages, setChatMessages] = useState<any[]>([])
  const [lastFileSaved, setLastFileSaved] = useState<FileSavedEvent | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectRef = useRef(0)

  const addNotification = useCallback((notif: RealtimeNotification) => {
    setNotifications(prev => [notif, ...prev].slice(0, 5))
  }, [])

  const addLog = useCallback((log: RealtimeLog) => {
    setLogs(prev => [...prev, log].slice(-100))
  }, [])

  const connect = useCallback(() => {
    const serverPort = window.location.port === '5173' ? '3001' : window.location.port
    const wsUrl = `ws://${window.location.hostname}:${serverPort}/ws`
    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onopen = () => {
      setConnected(true)
      reconnectRef.current = 0
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        switch (data.type) {
          case 'connected':
            setConnected(true)
            break
          case 'task:created':
          case 'task:completed':
          case 'task:failed':
            addNotification({
              id: `notif-${Date.now()}`,
              type: data.type === 'task:failed' ? 'error' : data.type === 'task:completed' ? 'success' : 'info',
              title: data.type === 'task:created' ? 'Task Created' : data.type === 'task:completed' ? 'Task Completed' : 'Task Failed',
              message: data.type === 'task:created' ? `New task "${data.task?.title || ''}" created` : data.type === 'task:completed' ? 'Task completed successfully' : 'Task execution failed',
              time: 'just now',
            })
            addLog({
              prefix: data.type === 'task:failed' ? '✗' : '✓',
              text: data.type === 'task:created' ? `Task created: ${data.task?.title || ''}` : data.type === 'task:completed' ? 'Task completed' : 'Task failed',
              color: data.type === 'task:failed' ? 'text-accent-error' : data.type === 'task:completed' ? 'text-accent-success' : 'text-text-secondary',
            })
            break
          case 'plan:created':
          case 'plan:finalized':
            addNotification({
              id: `notif-${Date.now()}`,
              type: 'info',
              title: 'Plan Updated',
              message: data.type === 'plan:created' ? 'New execution plan created' : 'Execution plan finalized and dispatched',
              time: 'just now',
            })
            break
          case 'chat:message':
            setChatMessages(prev => [...prev, data.message])
            break
          case 'agent:dispatched':
            addLog({
              prefix: '→',
              text: `Agent ${data.agentRole} dispatched for ${data.action}`,
              color: 'text-text-link',
            })
            break
          case 'orchestrator:dispatched':
            addLog({
              prefix: '→',
              text: 'Orchestrator dispatched queued tasks',
              color: 'text-text-secondary',
            })
            break
          case 'file:saved':
            setLastFileSaved({ projectId: data.projectId, path: data.path })
            break
        }
      } catch {
        // ignore parse errors
      }
    }

    ws.onclose = () => {
      setConnected(false)
      if (reconnectRef.current < 5) {
        reconnectRef.current++
        setTimeout(connect, Math.min(3000 * Math.pow(2, reconnectRef.current - 1), 30000))
      }
    }

    ws.onerror = () => {
      ws.close()
    }
  }, [addNotification, addLog])

  useEffect(() => {
    connect()
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [connect])

  return {
    connected,
    notifications,
    logs,
    chatMessages,
    lastFileSaved,
    addNotification,
    removeNotification: (id: string) => setNotifications(prev => prev.filter(n => n.id !== id)),
    clearNotifications: () => setNotifications([]),
    clearLogs: () => setLogs([]),
  }
}
