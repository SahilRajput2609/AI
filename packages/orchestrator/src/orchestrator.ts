import { EventEmitter } from 'events'
import type { Task } from '@ai-company/shared'

export interface LocalSubTask {
  id: string
  description?: string
  agentId?: string
  status?: string
}

export interface ExecutionPlan {
  id: string
  subTasks: LocalSubTask[]
}

export interface OrchestratorConfig {
  maxConcurrentTasks?: number
  taskTimeout?: number
  retryAttempts?: number
}

export interface TaskExecution {
  taskId: string
  planId: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  startedAt?: Date
  completedAt?: Date
  error?: string
  currentStep: number
  totalSteps: number
}

export class Orchestrator extends EventEmitter {
  private config: Required<OrchestratorConfig>
  private executions: Map<string, TaskExecution> = new Map()
  private plans: Map<string, ExecutionPlan> = new Map()
  private taskQueue: string[] = []
  private runningTasks: Set<string> = new Set()

  constructor(config: OrchestratorConfig = {}) {
    super()
    this.config = {
      maxConcurrentTasks: config.maxConcurrentTasks ?? 3,
      taskTimeout: config.taskTimeout ?? 300000, // 5 minutes
      retryAttempts: config.retryAttempts ?? 2,
    }
  }

  // Queue a task for execution
  async queueTask(task: Task, plan: ExecutionPlan): Promise<void> {
    const execution: TaskExecution = {
      taskId: task.id,
      planId: plan.id,
      status: 'pending',
      currentStep: 0,
      totalSteps: plan.subTasks.length,
    }

    this.executions.set(task.id, execution)
    this.plans.set(task.id, plan)
    this.taskQueue.push(task.id)
    this.emit('task:queued', { task, plan })

    // Try to start execution if capacity available
    await this.processQueue()
  }

  // Process the task queue
  private async processQueue(): Promise<void> {
    while (this.taskQueue.length > 0 && this.runningTasks.size < this.config.maxConcurrentTasks) {
      const taskId = this.taskQueue.shift()
      if (!taskId) break

      const execution = this.executions.get(taskId)
      if (!execution) continue

      this.runningTasks.add(taskId)
      execution.status = 'running'
      execution.startedAt = new Date()

      this.emit('task:started', { taskId, execution })

      // Execute task in background
      this.executeTask(taskId, execution).catch((error) => {
        console.error(`Task execution failed: ${taskId}`, error)
      })
    }
  }

  // Execute a task using the real execution plan
  private async executeTask(taskId: string, execution: TaskExecution): Promise<void> {
    try {
      const plan = this.plans.get(taskId)
      const subTasks = plan?.subTasks || [
        { id: `${taskId}-1`, description: 'Analyzing requirements', agentId: 'planner' },
        { id: `${taskId}-2`, description: 'Executing implementation', agentId: 'coder' },
        { id: `${taskId}-3`, description: 'Running validation', agentId: 'qa' },
      ]

      for (const subtask of subTasks) {
        this.emit('task:subtask', { taskId, subtask })
        execution.currentStep = (execution.currentStep || 0) + 1
        this.emit('task:progress', { taskId, currentStep: execution.currentStep, totalSteps: subTasks.length })

        // Dispatch to a real agent if we have an agentId
        if (subtask.agentId) {
          try {
            const result = await this.dispatchToAgent(subtask.agentId, subtask)
            this.emit('task:subtask_completed', { taskId, subtask, result })
          } catch (err: any) {
            this.emit('task:subtask_failed', { taskId, subtask, error: err.message })
            throw new Error(`Agent ${subtask.agentId} failed: ${err.message}`)
          }
        }
      }

      execution.status = 'completed'
      execution.completedAt = new Date()
      this.emit('task:completed', { taskId, execution })
    } catch (error) {
      execution.status = 'failed'
      execution.error = error instanceof Error ? error.message : String(error)
      execution.completedAt = new Date()
      this.emit('task:failed', { taskId, execution, error })
    } finally {
      this.runningTasks.delete(taskId)
      await this.processQueue()
    }
  }

  // Dispatch a subtask to an agent - can be overridden by subclasses
  protected async dispatchToAgent(agentId: string, subtask: LocalSubTask): Promise<any> {
    return { agentId, subtaskId: subtask.id, status: 'completed', timestamp: new Date().toISOString() }
  }

  // Get execution status
  getExecution(taskId: string): TaskExecution | undefined {
    return this.executions.get(taskId)
  }

  // Get all executions
  getAllExecutions(): TaskExecution[] {
    return Array.from(this.executions.values())
  }

  // Cancel a task
  async cancelTask(taskId: string): Promise<void> {
    const execution = this.executions.get(taskId)
    if (!execution) {
      throw new Error(`Task not found: ${taskId}`)
    }

    if (execution.status === 'completed' || execution.status === 'failed') {
      throw new Error(`Cannot cancel ${execution.status} task`)
    }

    // Remove from queue if pending
    const queueIndex = this.taskQueue.indexOf(taskId)
    if (queueIndex !== -1) {
      this.taskQueue.splice(queueIndex, 1)
    }

    // Mark as failed
    execution.status = 'failed'
    execution.error = 'Cancelled by user'
    execution.completedAt = new Date()
    this.runningTasks.delete(taskId)

    this.emit('task:cancelled', { taskId, execution })
  }

  // Get queue status
  getQueueStatus(): {
    queued: number
    running: number
    completed: number
    failed: number
  } {
    const executions = Array.from(this.executions.values())
    return {
      queued: this.taskQueue.length,
      running: this.runningTasks.size,
      completed: executions.filter((e) => e.status === 'completed').length,
      failed: executions.filter((e) => e.status === 'failed').length,
    }
  }

  // Clear completed/failed executions
  clearHistory(): void {
    for (const [taskId, execution] of this.executions.entries()) {
      if (execution.status === 'completed' || execution.status === 'failed') {
        this.executions.delete(taskId)
      }
    }
  }
}
