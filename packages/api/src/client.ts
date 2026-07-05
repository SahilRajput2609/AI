import type {
  Task,
  Agent,
  ModelProviderConfig,
  CreateModelProviderInput,
  UpdateModelProviderInput,
} from '@ai-company/shared'

export interface LocalExecutionPlan {
  id: string
  taskId: string
  title: string
  status: 'pending' | 'active' | 'completed' | 'failed'
  subTasks: LocalSubTask[]
  createdAt: Date
  updatedAt: Date
}

export interface LocalSubTask {
  id: string
  description: string
  estimatedEffort?: 'low' | 'medium' | 'high'
  assignedRole?: string
  dependencies?: string[]
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
}

export interface AgentStatusInfo {
  agentId: string
  status: string
  currentTask: string | null
  lastActive: Date
}

export interface APIClientConfig {
  baseURL: string
  wsURL?: string
  onMessage?: (data: unknown) => void
  onConnect?: () => void
  onDisconnect?: () => void
}

export class APIClient {
  private baseURL: string
  private ws: WebSocket | null = null
  private wsURL: string
  private config: APIClientConfig
  private wsReconnectAttempts = 0
  private readonly maxReconnectAttempts = 5
  private wsReconnectTimer: ReturnType<typeof setTimeout> | null = null

  constructor(config: APIClientConfig) {
    this.config = config
    this.baseURL = config.baseURL
    this.wsURL = config.wsURL || config.baseURL.replace('http', 'ws')
  }

  // Allow hooks to override callbacks without accessing private config
  setCallbacks(callbacks: {
    onConnect?: () => void
    onDisconnect?: () => void
    onMessage?: (data: unknown) => void
  }): void {
    if (callbacks.onConnect !== undefined) this.config.onConnect = callbacks.onConnect
    if (callbacks.onDisconnect !== undefined) this.config.onDisconnect = callbacks.onDisconnect
    if (callbacks.onMessage !== undefined) this.config.onMessage = callbacks.onMessage
  }

  // WebSocket connection
  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) return

    this.ws = new WebSocket(this.wsURL)

    this.ws.onopen = () => {
      this.wsReconnectAttempts = 0
      console.log('WebSocket connected')
      this.config.onConnect?.()
    }

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        this.config.onMessage?.(data)
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error)
      }
    }

    this.ws.onclose = () => {
      console.log('WebSocket disconnected')
      this.config.onDisconnect?.()
      this.wsReconnectAttempts++
      if (this.wsReconnectAttempts <= this.maxReconnectAttempts) {
        const delay = Math.min(3000 * Math.pow(2, this.wsReconnectAttempts - 1), 30000)
        this.wsReconnectTimer = setTimeout(() => {
          this.wsReconnectAttempts = 0
          this.connect()
        }, delay)
      } else {
        console.warn('WebSocket max reconnect attempts reached')
      }
    }

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }
  }

  disconnect(): void {
    if (this.wsReconnectTimer) {
      clearTimeout(this.wsReconnectTimer)
      this.wsReconnectTimer = null
    }
    this.wsReconnectAttempts = 0
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  send(data: unknown): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    }
  }

  // HTTP requests
  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }))
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    return response.json()
  }

  // Status API
  async getStatus(): Promise<{ status: string; agents: string[]; uptime: number }> {
    return this.request('/api/status')
  }

  // Task API
  async getTasks(): Promise<Task[]> {
    return this.request('/api/tasks')
  }

  async getTask(id: string): Promise<Task> {
    return this.request(`/api/tasks/${id}`)
  }

  async createTask(data: {
    title: string
    description?: string
    priority?: 'low' | 'medium' | 'high'
    category?: string
  }): Promise<Task> {
    return this.request('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateTask(id: string, data: Record<string, any>): Promise<Task> {
    return this.request(`/api/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteTask(id: string): Promise<void> {
    return this.request(`/api/tasks/${id}`, {
      method: 'DELETE',
    })
  }

  async reviewTask(id: string, approved: boolean, feedback?: string): Promise<void> {
    return this.request(`/api/tasks/${id}/review`, {
      method: 'POST',
      body: JSON.stringify({ approved, feedback }),
    })
  }

  // Plan API
  async getPlans(): Promise<LocalExecutionPlan[]> {
    return this.request('/api/plans')
  }

  async createPlan(taskId: string, title: string): Promise<LocalExecutionPlan> {
    return this.request('/api/plans', {
      method: 'POST',
      body: JSON.stringify({ taskId, title }),
    })
  }

  async addSubTask(
    planId: string,
    data: {
      description: string
      estimatedEffort?: 'low' | 'medium' | 'high'
      assignedRole?: string
      dependencies?: string[]
    }
  ): Promise<LocalSubTask> {
    return this.request(`/api/plans/${planId}/subtasks`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async finalizePlan(planId: string): Promise<void> {
    return this.request(`/api/plans/${planId}/finalize`, {
      method: 'POST',
    })
  }

  // Model Provider API
  async getModelProviders(): Promise<ModelProviderConfig[]> {
    return this.request('/api/model-providers')
  }

  async getModelProvider(id: string): Promise<ModelProviderConfig> {
    return this.request(`/api/model-providers/${id}`)
  }

  async createModelProvider(data: CreateModelProviderInput): Promise<ModelProviderConfig> {
    return this.request('/api/model-providers', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateModelProvider(
    id: string,
    data: UpdateModelProviderInput
  ): Promise<ModelProviderConfig> {
    return this.request(`/api/model-providers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteModelProvider(id: string): Promise<void> {
    return this.request(`/api/model-providers/${id}`, {
      method: 'DELETE',
    })
  }

  async testModelProvider(id: string): Promise<{ success: boolean; latency?: number; error?: string }> {
    return this.request(`/api/model-providers/${id}/test`, {
      method: 'POST',
    })
  }

  // Agent API
  async getAgents(): Promise<Agent[]> {
    return this.request('/api/agents')
  }

  async getAgentStatus(role: string): Promise<AgentStatusInfo> {
    return this.request(`/api/agents/${role}`)
  }

  // Dispatch API
  async dispatchToAgent(agentRole: string, action: string, payload?: Record<string, any>): Promise<any> {
    const body: Record<string, any> = { action }
    if (payload) {
      for (const [key, value] of Object.entries(payload)) {
        if (key !== 'action') body[key] = value
      }
    }
    return this.request(`/api/dispatch/${agentRole}`, {
      method: 'POST',
      body: JSON.stringify(body),
    })
  }

  // Orchestrator API
  async getOrchestratorState(): Promise<any> {
    return this.request('/api/orchestrator/state')
  }

  async triggerDispatch(): Promise<any> {
    return this.request('/api/orchestrator/dispatch', { method: 'POST' })
  }

  // Files API
  async getFiles(projectId = 'default'): Promise<{ files: any[]; tree: any[] }> {
    return this.request(`/api/files?projectId=${projectId}`)
  }

  // Activities API
  async getActivities(limit = 50): Promise<any[]> {
    return this.request(`/api/activities?limit=${limit}`)
  }

  async createActivity(data: { projectId?: string; agentId?: string; type: string; title: string; description?: string }): Promise<any> {
    return this.request('/api/activities', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Agent Configs API
  async getAgentConfigs(): Promise<any[]> {
    return this.request('/api/agent-configs')
  }

  async getAgentConfig(role: string): Promise<any> {
    return this.request(`/api/agent-configs/${role}`)
  }

  async upsertAgentConfig(role: string, data: any): Promise<any> {
    return this.request(`/api/agent-configs/${role}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }
}
