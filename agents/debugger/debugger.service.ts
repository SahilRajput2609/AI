import type { DebugTask, ErrorSeverity, DebugStatus, DebugResult, DebuggerState } from './debugger.types'

export class DebuggerService {
  private state: DebuggerState = {
    tasks: [],
    verifiedFixes: [],
  }

  createTask(targetFile: string, errorType: string, severity: ErrorSeverity, errorMessage: string): DebugTask {
    const task: DebugTask = {
      id: `dbg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      targetFile,
      errorType,
      severity,
      status: 'open',
      errorMessage,
      createdAt: new Date().toISOString(),
    }
    this.state.tasks.push(task)
    return task
  }

  analyzeError(taskId: string): void {
    const task = this.state.tasks.find((t) => t.id === taskId)
    if (task && task.status === 'open') {
      task.status = 'analyzing'
    }
  }

  suggestFix(taskId: string, fix: string): void {
    const task = this.state.tasks.find((t) => t.id === taskId)
    if (task && task.status === 'analyzing') {
      task.suggestedFix = fix
      task.status = 'fix-ready'
    }
  }

  applyFix(taskId: string): void {
    const task = this.state.tasks.find((t) => t.id === taskId)
    if (task && task.status === 'fix-ready') {
      task.status = 'applied'
    }
  }

  verifyFix(taskId: string, success: boolean): DebugResult {
    const task = this.state.tasks.find((t) => t.id === taskId)
    const result: DebugResult = {
      taskId,
      rootCause: task?.errorMessage || 'unknown',
      fixApplied: success,
      verified: success,
    }
    if (task && success) {
      task.status = 'verified'
      task.resolvedAt = new Date().toISOString()
      if (!this.state.verifiedFixes.includes(taskId)) {
        this.state.verifiedFixes.push(taskId)
      }
    } else if (task) {
      task.status = 'open'
    }
    return result
  }

  getTask(taskId: string): DebugTask | undefined {
    return this.state.tasks.find((t) => t.id === taskId)
  }

  getTasksByStatus(status: DebugStatus): DebugTask[] {
    return this.state.tasks.filter((t) => t.status === status)
  }

  getState(): DebuggerState {
    return { ...this.state }
  }
}
