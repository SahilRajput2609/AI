import type { QATask, TestType, QATaskStatus, TestResult, QAState } from './qa.types'

export class QAService {
  private state: QAState = {
    tasks: [],
    validatedFiles: [],
  }

  createTask(targetFile: string, testType: TestType): QATask {
    const task: QATask = {
      id: `qa-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      targetFile,
      testType,
      status: 'pending',
      createdAt: new Date().toISOString(),
    }
    this.state.tasks.push(task)
    return task
  }

  startWriting(taskId: string, testFile: string): void {
    const task = this.state.tasks.find((t) => t.id === taskId)
    if (task && task.status === 'pending') {
      task.testFile = testFile
      task.status = 'writing'
    }
  }

  startRunning(taskId: string): void {
    const task = this.state.tasks.find((t) => t.id === taskId)
    if (task && task.status === 'writing') {
      task.status = 'running'
    }
  }

  recordResult(taskId: string, result: TestResult): void {
    const task = this.state.tasks.find((t) => t.id === taskId)
    if (task) {
      task.result = result
      task.status = result.failed > 0 ? 'failed' : 'passed'
      task.completedAt = new Date().toISOString()
      if (result.failed === 0 && !this.state.validatedFiles.includes(task.targetFile)) {
        this.state.validatedFiles.push(task.targetFile)
      }
    }
  }

  markReviewed(taskId: string): void {
    const task = this.state.tasks.find((t) => t.id === taskId)
    if (task && (task.status === 'passed' || task.status === 'failed')) {
      task.status = 'reviewed'
    }
  }

  getTasksByStatus(status: QATaskStatus): QATask[] {
    return this.state.tasks.filter((t) => t.status === status)
  }

  getTask(taskId: string): QATask | undefined {
    return this.state.tasks.find((t) => t.id === taskId)
  }

  getState(): QAState {
    return { ...this.state }
  }
}
