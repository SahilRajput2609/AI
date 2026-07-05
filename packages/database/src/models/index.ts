export interface Project {
  id: string
  name: string
  description?: string
  path: string
  status: 'active' | 'archived' | 'paused'
  created_at: number
  updated_at: number
}

export interface Task {
  id: string
  project_id: string
  title: string
  description?: string
  category?: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'critical'
  assigned_agent?: string
  progress: number
  tags: string[]
  attachments: number
  comments: number
  created_at: number
  updated_at: number
  completed_at?: number
}

export interface Agent {
  id: string
  role: string
  status: 'online' | 'offline' | 'idle' | 'running' | 'error'
  icon?: string
  color?: string
  subtext?: string
  current_task_id?: string
  metadata?: Record<string, any>
  created_at: number
  updated_at: number
}

export interface Activity {
  id: string
  project_id: string
  agent_id?: string
  type: 'agent' | 'system' | 'git' | 'user'
    | 'task_created' | 'task_assigned' | 'task_completed'
    | 'file_created' | 'file_updated' | 'file_deleted'
    | 'plan_updated' | 'pr_created' | 'pr_approved'
    | 'deployment_started' | 'deployment_completed'
    | 'agent_started' | 'agent_stopped'
  title: string
  description?: string
  metadata?: Record<string, any>
  created_at: number
}

export interface Memory {
  id: string
  agent_id?: string
  type: 'global' | 'agent' | 'session'
  key: string
  value: string
  metadata?: Record<string, any>
  created_at: number
  updated_at: number
}

export interface AgentConfig {
  id: string
  role: string
  name: string
  api_key: string
  base_url: string
  model: string
  temperature: number
  max_tokens: number
  is_active: boolean
  metadata: Record<string, any>
  created_at: number
  updated_at: number
}

export interface FileMetadata {
  id: string
  project_id: string
  path: string
  name: string
  type: 'file' | 'folder'
  language?: string
  size?: number
  modified: boolean
  created_at: number
  updated_at: number
}
