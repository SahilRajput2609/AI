// Core types shared across the entire application

// Agent Types
export type AgentRole = 
  | 'owner'
  | 'planner'
  | 'orchestrator'
  | 'coder'
  | 'reviewer'
  | 'frontend'
  | 'backend'
  | 'api'
  | 'database'
  | 'qa'
  | 'debugger'
  | 'devops'
  | 'documentation'

export type AgentStatus = 'online' | 'offline' | 'idle' | 'running' | 'error'

export interface Agent {
  id: string
  role: AgentRole
  status: AgentStatus
  name: string
  description?: string
  currentTask?: string
  metadata?: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

// Task Types
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled'
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical'

export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  assignedTo?: string // Agent ID
  createdBy: string // Agent ID or user ID
  tags: string[]
  attachments?: number
  comments?: number
  progress?: number
  parentId?: string // For subtasks
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
}

export interface Subtask {
  id: string
  taskId: string
  title: string
  status: TaskStatus
  order: number
  createdAt: Date
  completedAt?: Date
}

// Message Types
export type MessageRole = 'user' | 'assistant' | 'system'

export interface Message {
  id: string
  role: MessageRole
  content: string
  timestamp: Date
  agentId?: string
  userId?: string
  metadata?: Record<string, unknown>
}

// Activity Timeline Types
export type ActivityType = 
  | 'task_created'
  | 'task_assigned'
  | 'task_completed'
  | 'file_created'
  | 'file_updated'
  | 'file_deleted'
  | 'plan_updated'
  | 'pr_created'
  | 'pr_approved'
  | 'deployment_started'
  | 'deployment_completed'
  | 'agent_started'
  | 'agent_stopped'

export interface ActivityEntry {
  id: string
  type: ActivityType
  timestamp: Date
  agentId?: string
  agentRole?: AgentRole
  title: string
  description: string
  metadata?: Record<string, unknown>
}

// Project Types
export interface Project {
  id: string
  name: string
  description?: string
  path: string
  createdAt: Date
  updatedAt: Date
  settings?: ProjectSettings
}

export interface ProjectSettings {
  defaultModel?: string
  autoSave?: boolean
  lintOnSave?: boolean
  formatOnSave?: boolean
}

// AI Model Types
export type ModelProvider = 'openai' | 'anthropic' | 'google' | 'mistral' | 'cohere' | 'local' | 'custom'

export interface AIModel {
  id: string
  name: string
  provider: ModelProvider
  capabilities: string[]
  maxTokens: number
  costPer1M?: number
  isActive: boolean
}

// Notification Types
export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  timestamp: Date
  read: boolean
  actionUrl?: string
  userId?: string
  projectId?: string
  user_id?: string
  project_id?: string
  is_read?: boolean
}

// File System Types
export interface FileNode {
  name: string
  path: string
  type: 'file' | 'folder'
  language?: string
  children?: FileNode[]
  modified?: boolean
  size?: number
}

// Metrics Types
export interface SystemMetrics {
  memory: {
    used: number
    total: number
    percentage: number
  }
  cpu: {
    percentage: number
  }
  tokens: {
    used: number
    limit?: number
  }
}

// WebSocket Event Types
export type WSEventType = 
  | 'connected'
  | 'agent_status_changed'
  | 'task_updated'
  | 'activity_added'
  | 'notification'
  | 'metrics_updated'
  | 'error'

export interface WSEvent<T = unknown> {
  type: WSEventType
  data?: T
  timestamp: Date
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  timestamp: Date
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}
