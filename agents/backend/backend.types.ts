export type TaskPriority = 'low' | 'medium' | 'high' | 'critical'

export type BackendStatus = 'pending' | 'in-progress' | 'completed' | 'reviewed'

export interface BackendTask {
  id: string
  serviceName: string
  description: string
  priority: TaskPriority
  status: BackendStatus
  assignedTo?: string
  createdAt: string
  completedAt?: string
}

export interface BackendState {
  tasks: BackendTask[]
  completedServices: string[]
}
