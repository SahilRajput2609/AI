import type { Task, TaskStatus, OrchestratorState, Agent } from './orchestrator.types'

export class OrchestratorService {
  private state: OrchestratorState = {
    taskQueue: [],
    runningTasks: [],
    waitingTasks: [],
    completedTasks: [],
    failedTasks: [],
    blockedTasks: [],
  }
  private agents: Agent[] = []

  registerAgent(agent: Agent): void {
    this.agents.push(agent)
  }

  queueTask(task: Task): void {
    this.state.taskQueue.push(task)
  }

  assignTask(taskId: string, agentId: string): void {
    const task = this.state.taskQueue.find((t) => t.id === taskId)
    if (task) {
      task.assignedAgent = agentId
    }
  }

  startTask(taskId: string): void {
    const taskIndex = this.state.taskQueue.findIndex((t) => t.id === taskId)
    if (taskIndex !== -1) {
      const task = this.state.taskQueue.splice(taskIndex, 1)[0]
      task.status = 'running'
      this.state.runningTasks.push(task)
    }
  }

  cancelTask(taskId: string): void {
    this.state.runningTasks = this.state.runningTasks.filter((t) => t.id !== taskId)
    this.state.taskQueue = this.state.taskQueue.filter((t) => t.id !== taskId)
  }

  retryTask(taskId: string): void {
    const taskIndex = this.state.failedTasks.findIndex((t) => t.id === taskId)
    if (taskIndex !== -1) {
      const task = this.state.failedTasks.splice(taskIndex, 1)[0]
      task.status = 'pending'
      this.state.taskQueue.push(task)
    }
  }

  collectResults(): any[] {
    return this.state.completedTasks.map((t) => t.result)
  }

  trackDependencies(): void {
    this.state.waitingTasks = this.state.taskQueue.filter((t) =>
      t.dependencies.some((depId) => !this.state.completedTasks.some((ct) => ct.id === depId)),
    )
  }

  updateProgress(taskId: string, status: TaskStatus, result?: any, error?: string): void {
    const taskIndex = this.state.runningTasks.findIndex((t) => t.id === taskId)
    if (taskIndex !== -1) {
      const task = this.state.runningTasks.splice(taskIndex, 1)[0]
      task.status = status
      task.result = result
      task.error = error

      if (status === 'completed') this.state.completedTasks.push(task)
      else if (status === 'failed') this.state.failedTasks.push(task)
      else if (status === 'blocked') this.state.blockedTasks.push(task)
      else if (status === 'pending') this.state.taskQueue.push(task)
    }
  }

  notifyOwner(message: string): void {
    console.log(`Notification to Owner: ${message}`)
  }

  getState(): OrchestratorState {
    return this.state
  }
}
