export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'blocked'

export interface Task {
  id: string
  description: string
  status: TaskStatus
  dependencies: string[]
  assignedAgent?: string
  result?: any
  error?: string
}

export interface OrchestratorState {
  taskQueue: Task[]
  runningTasks: Task[]
  waitingTasks: Task[]
  completedTasks: Task[]
  failedTasks: Task[]
  blockedTasks: Task[]
}

export interface Agent {
  id: string
  name: string
  capabilities: string[]
}
