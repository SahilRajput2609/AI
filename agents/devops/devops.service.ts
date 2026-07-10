import type { DevOpsTask, DevOpsEnvironment, DevOpsOperation, DevOpsState } from './devops.types'
import { DevOpsStatus } from './devops.types'

export class DevOpsService {
  private state: DevOpsState = {
    tasks: [],
    activeDeployments: [],
    environments: ['development', 'staging', 'production'],
  }

  createTask(environment: DevOpsEnvironment, operation: DevOpsOperation, notes?: string): DevOpsTask {
    const task: DevOpsTask = {
      id: `do-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      environment,
      operation,
      status: 'pending',
      notes,
      createdAt: new Date().toISOString(),
    }
    this.state.tasks.push(task)
    return task
  }

  startTask(taskId: string): void {
    const task = this.state.tasks.find((t) => t.id === taskId)
    if (task && task.status === 'pending') {
      task.status = 'in-progress'
    }
  }

  completeTask(taskId: string): void {
    const task = this.state.tasks.find((t) => t.id === taskId)
    if (task && task.status === 'in-progress') {
      task.status = 'completed'
      task.completedAt = new Date().toISOString()
      if (task.operation === 'deploy') {
        this.state.activeDeployments.push(taskId)
      }
    }
  }

  failTask(taskId: string): void {
    const task = this.state.tasks.find((t) => t.id === taskId)
    if (task && (task.status === 'in-progress' || task.status === 'pending')) {
      task.status = 'failed'
    }
  }

  rollbackTask(taskId: string): void {
    const task = this.state.tasks.find((t) => t.id === taskId)
    if (task && task.status === 'completed') {
      task.status = 'rolled-back'
      this.state.activeDeployments = this.state.activeDeployments.filter((id) => id !== taskId)
    }
  }

  getTasksByEnvironment(environment: DevOpsEnvironment): DevOpsTask[] {
    return this.state.tasks.filter((t) => t.environment === environment)
  }

  getTask(taskId: string): DevOpsTask | undefined {
    return this.state.tasks.find((t) => t.id === taskId)
  }

  getState(): DevOpsState {
    return { ...this.state }
  }
}
