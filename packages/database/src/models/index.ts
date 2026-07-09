export interface Project {
  id: string
  name: string
  description?: string
  path: string
  status: 'active' | 'archived' | 'paused'
  type: string
  user_id?: string
  model?: string
  framework?: string
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

export interface User {
  id: string
  email: string
  password_hash: string | null
  salt: string | null
  role: string
  oauth_provider?: string | null
  oauth_id?: string | null
  avatar_url?: string | null
  created_at: number
  updated_at: number
}

export interface Session {
  id: string
  user_id: string
  token: string
  expires_at: number
  created_at: number
}

export interface ApiKey {
  id: string
  user_id: string
  name: string
  key: string
  scopes: string[]
  last_used_at?: number
  expires_at?: number
  is_active: boolean
  created_at: number
}

export interface Organization {
  id: string
  name: string
  slug: string
  description?: string
  avatar_url?: string
  owner_id: string
  plan: string
  created_at: number
  updated_at: number
}

export interface OrganizationMember {
  id: string
  organization_id: string
  user_id: string
  role: string
  joined_at: number
}

export interface Version {
  id: string
  project_id: string
  version_number: number
  title: string
  description?: string
  snapshot_data: string
  file_count: number
  created_by?: string
  created_at: number
}

export interface Deployment {
  id: string
  project_id: string
  version_id?: string
  platform: string
  status: string
  url?: string
  build_logs?: string
  config: string
  deployed_by?: string
  created_at: number
  updated_at: number
}

export interface ChatMessage {
  id: string
  project_id?: string
  user_id?: string
  role: string
  content: string
  metadata: string
  created_at: number
}

export interface Template {
  id: string
  name: string
  description?: string
  category: string
  type: string
  config: string
  is_built_in: boolean
  usage_count: number
  created_at: number
  updated_at: number
}

export interface AuditLog {
  id: string
  user_id?: string
  action: string
  resource_type: string
  resource_id?: string
  details: string
  ip_address?: string
  created_at: number
}

export interface Notification {
  id: string
  type: string
  title: string
  message: string
  is_read: boolean
  timestamp: number
}
