import type { ReviewTask, ReviewType, ReviewStatus, ReviewFeedback, ReviewerState } from './reviewer.types'

export class ReviewerService {
  private state: ReviewerState = {
    tasks: [],
    approvedFiles: [],
  }

  createTask(targetFile: string, reviewType: ReviewType): ReviewTask {
    const task: ReviewTask = {
      id: `rev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      targetFile,
      reviewType,
      status: 'pending',
      feedback: [],
      createdAt: new Date().toISOString(),
    }
    this.state.tasks.push(task)
    return task
  }

  startReview(taskId: string, reviewer: string): void {
    const task = this.state.tasks.find((t) => t.id === taskId)
    if (task && task.status === 'pending') {
      task.reviewer = reviewer
      task.status = 'in-progress'
    }
  }

  addFeedback(taskId: string, feedback: ReviewFeedback): void {
    const task = this.state.tasks.find((t) => t.id === taskId)
    if (task) {
      task.feedback.push(feedback)
    }
  }

  approve(taskId: string): void {
    const task = this.state.tasks.find((t) => t.id === taskId)
    if (task && task.status === 'in-progress') {
      task.status = 'approved'
      task.completedAt = new Date().toISOString()
      if (!this.state.approvedFiles.includes(task.targetFile)) {
        this.state.approvedFiles.push(task.targetFile)
      }
    }
  }

  requestChanges(taskId: string): void {
    const task = this.state.tasks.find((t) => t.id === taskId)
    if (task && (task.status === 'in-progress' || task.status === 'pending')) {
      task.status = 'changes-requested'
    }
  }

  closeTask(taskId: string): void {
    const task = this.state.tasks.find((t) => t.id === taskId)
    if (task) {
      task.status = 'closed'
      task.completedAt = new Date().toISOString()
    }
  }

  getTask(taskId: string): ReviewTask | undefined {
    return this.state.tasks.find((t) => t.id === taskId)
  }

  getTasksByStatus(status: ReviewStatus): ReviewTask[] {
    return this.state.tasks.filter((t) => t.status === status)
  }

  getState(): ReviewerState {
    return { ...this.state }
  }
}
