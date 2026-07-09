import type {
  Task,
  Agent,
  ModelProviderConfig,
  CreateModelProviderInput,
  UpdateModelProviderInput,
} from '@ai-company/shared'

export interface APIRequestInit extends RequestInit {
  responseType?: 'json' | 'arraybuffer'
}

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
  private token: string | null = null

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

  setToken(token: string | null): void {
    this.token = token
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

  // Room management
  joinRoom(room: string): void {
    this.send({ type: 'join_room', room })
  }

  leaveRoom(room: string): void {
    this.send({ type: 'leave_room', room })
  }

  setUserId(userId: string): void {
    this.send({ type: 'set_user', userId })
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
    options?: APIRequestInit
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const { responseType, ...fetchOptions } = options || {}
    const headers = {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    } as Record<string, string>

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }))
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    if (responseType === 'arraybuffer') {
      return response.arrayBuffer() as Promise<any>
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

  // Projects API
  async getProjects(): Promise<any[]> {
    return this.request('/api/projects')
  }

  async getProject(id: string): Promise<any> {
    return this.request(`/api/projects/${id}`)
  }

  async createProject(data: {
    name: string
    description?: string
    type?: string
    model?: string
    framework?: string
  }): Promise<any> {
    return this.request('/api/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateProject(id: string, data: Record<string, any>): Promise<any> {
    return this.request(`/api/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteProject(id: string): Promise<void> {
    return this.request(`/api/projects/${id}`, {
      method: 'DELETE',
    })
  }

  async getProjectTasks(id: string): Promise<any[]> {
    return this.request(`/api/projects/${id}/tasks`)
  }

  async getProjectFiles(id: string): Promise<{ files: any[]; tree: any[] }> {
    return this.request(`/api/projects/${id}/files`)
  }

  async readProjectFile(id: string, filePath: string): Promise<{ content: string }> {
    return this.request(`/api/projects/${id}/files/read?path=${encodeURIComponent(filePath)}`)
  }

  async writeProjectFile(id: string, filePath: string, content: string): Promise<any> {
    return this.request(`/api/projects/${id}/files/write`, {
      method: 'POST',
      body: JSON.stringify({ path: filePath, content }),
    })
  }

  async getProjectStats(id: string): Promise<any> {
    return this.request(`/api/projects/${id}/stats`)
  }

  async searchProjects(query: string): Promise<any[]> {
    return this.request(`/api/projects/search?q=${encodeURIComponent(query)}`)
  }

  // Chat API (global + project-scoped)
  async getChatMessages(projectId?: string): Promise<any[]> {
    const query = projectId ? `?projectId=${projectId}` : ''
    return this.request(`/api/chat${query}`)
  }

  async sendChatMessage(text: string, projectId?: string): Promise<any> {
    const body: Record<string, string> = { text }
    if (projectId) body.projectId = projectId
    return this.request('/api/chat', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  }

  async deleteChatMessages(projectId?: string): Promise<void> {
    const query = projectId ? `?projectId=${projectId}` : ''
    return this.request(`/api/chat${query}`, {
      method: 'DELETE',
    })
  }

  // Versions API
  async getVersions(projectId: string): Promise<any[]> {
    return this.request(`/api/versions?projectId=${projectId}`)
  }

  async getVersion(id: string): Promise<any> {
    return this.request(`/api/versions/${id}`)
  }

  async createVersion(projectId: string, label?: string): Promise<any> {
    return this.request('/api/versions', {
      method: 'POST',
      body: JSON.stringify({ projectId, label }),
    })
  }

  async deleteVersion(id: string): Promise<void> {
    return this.request(`/api/versions/${id}`, {
      method: 'DELETE',
    })
  }

  async restoreVersion(id: string): Promise<{ status: string; fileCount: number }> {
    return this.request(`/api/versions/${id}/restore`, {
      method: 'POST',
    })
  }

  async diffVersions(idA: string, idB: string): Promise<{
    versionA: any; versionB: any; changes: { path: string; type: 'added' | 'removed' | 'modified' | 'unchanged' }[]; summary: { added: number; removed: number; modified: number; unchanged: number; total: number }
  }> {
    return this.request(`/api/versions/${idA}/diff/${idB}`)
  }

  // Deployments API
  async getDeployments(projectId: string): Promise<any[]> {
    return this.request(`/api/deployments?projectId=${projectId}`)
  }

  async getDeployment(id: string): Promise<any> {
    return this.request(`/api/deployments/${id}`)
  }

  async createDeployment(projectId: string, platform?: string, region?: string): Promise<any> {
    return this.request('/api/deployments', {
      method: 'POST',
      body: JSON.stringify({ projectId, platform, region }),
    })
  }

  async getDeploymentLogs(id: string): Promise<{ id: string; project_id: string; status: string; build_logs: string; config: string }> {
    return this.request(`/api/deployments/${id}/logs`)
  }

  // Templates API
  async getTemplates(category?: string): Promise<any[]> {
    const query = category ? `?category=${encodeURIComponent(category)}` : ''
    return this.request(`/api/templates${query}`)
  }

  async getTemplate(id: string): Promise<any> {
    return this.request(`/api/templates/${id}`)
  }

  async createTemplate(data: { name: string; description?: string; category?: string; config?: any }): Promise<any> {
    return this.request('/api/templates', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateTemplate(id: string, data: Record<string, any>): Promise<any> {
    return this.request(`/api/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteTemplate(id: string): Promise<void> {
    return this.request(`/api/templates/${id}`, {
      method: 'DELETE',
    })
  }

  // Agent Config API
  async getAgentConfigDefaults(): Promise<any[]> {
    return this.request('/api/agent-configs/defaults')
  }

  async deleteAgentConfig(role: string): Promise<void> {
    return this.request(`/api/agent-configs/${role}`, {
      method: 'DELETE',
    })
  }

  // Notifications API
  async getNotifications(userId?: string, projectId?: string, limit?: number): Promise<any[]> {
    const params = new URLSearchParams()
    if (userId) params.set('userId', userId)
    if (projectId) params.set('projectId', projectId)
    if (limit) params.set('limit', String(limit))
    return this.request(`/api/notifications?${params}`)
  }

  async createNotification(data: { title: string; message?: string; type?: string; userId?: string; projectId?: string }): Promise<any> {
    return this.request('/api/notifications', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async markNotificationRead(id: string): Promise<any> {
    return this.request(`/api/notifications/${id}/read`, {
      method: 'PUT',
    })
  }

  async deleteNotification(id: string): Promise<void> {
    return this.request(`/api/notifications/${id}`, {
      method: 'DELETE',
    })
  }

  // Deployment download
  async downloadDeployment(id: string): Promise<ArrayBuffer> {
    return this.request(`/api/deployments/${id}/download`, { responseType: 'arraybuffer' })
  }

  // Users API
  async getCurrentUser(): Promise<any> {
    return this.request('/api/users/me')
  }

  async getUser(id: string): Promise<any> {
    return this.request(`/api/users/${id}`)
  }

  // Settings API
  async getSettings(): Promise<any> {
    return this.request('/api/settings/me')
  }

  async updateSettings(data: Record<string, any>): Promise<any> {
    return this.request('/api/settings/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async updateTheme(theme: 'dark' | 'light'): Promise<any> {
    return this.request('/api/settings/me/theme', {
      method: 'PUT',
      body: JSON.stringify({ theme }),
    })
  }

  async updateNotifications(notifications: Record<string, any>): Promise<any> {
    return this.request('/api/settings/me/notifications', {
      method: 'PUT',
      body: JSON.stringify(notifications),
    })
  }

  async updateKeyboardShortcuts(shortcuts: Record<string, string>): Promise<any> {
    return this.request('/api/settings/me/shortcuts', {
      method: 'PUT',
      body: JSON.stringify({ shortcuts }),
    })
  }

  async updateModelPreferences(preferences: Record<string, any>): Promise<any> {
    return this.request('/api/settings/me/models', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    })
  }

  // Auth API
  async login(email: string, password: string): Promise<{ token: string; user: { id: string; email: string; role: string } }> {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  async signup(email: string, password: string): Promise<{ token: string; user: { id: string; email: string; role: string } }> {
    return this.request('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  async getCurrentUser(): Promise<{ user: { id: string; email: string; role: string } }> {
    return this.request('/api/auth/me')
  }

  // OAuth API
  async getOAuthConfig(): Promise<{ github: { clientId: string | null }; google: { clientId: string | null; redirectUri: string } }> {
    return this.request('/api/auth/oauth/config')
  }

  async loginWithGithub(code: string): Promise<{ token: string; user: { id: string; email: string; role: string; avatar_url?: string } }> {
    return this.request('/api/auth/oauth/github', {
      method: 'POST',
      body: JSON.stringify({ code }),
    })
  }

  async loginWithGoogle(code: string): Promise<{ token: string; user: { id: string; email: string; role: string; avatar_url?: string } }> {
    return this.request('/api/auth/oauth/google', {
      method: 'POST',
      body: JSON.stringify({ code }),
    })
  }
}
