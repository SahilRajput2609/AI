import { OwnerService } from './owner.service'
import type { OwnerTask, TaskPriority } from './owner.types'
import { ReviewDecision } from './owner.types'

export class Owner {
  private service: OwnerService

  constructor() {
    this.service = new OwnerService()
  }

  createAndSubmitTask(
    title: string,
    description: string,
    priority: TaskPriority = 'medium',
    category: string = 'general',
  ): OwnerTask {
    const task = this.service.createTask(title, description, priority, category)
    this.service.submitTask(task.id)
    console.log(`Owner: Task "${task.id}" submitted to system.`)
    return task
  }

  requestReview(taskId: string): void {
    this.service.markForReview(taskId)
    console.log(`Owner: Requested review for task "${taskId}".`)
  }

  approveTask(taskId: string, feedback?: string): void {
    this.service.reviewTask(taskId, { taskId, approved: true, feedback })
    console.log(`Owner: Approved task "${taskId}".`)
  }

  rejectTask(taskId: string, feedback: string): void {
    this.service.reviewTask(taskId, { taskId, approved: false, feedback })
    console.log(`Owner: Rejected task "${taskId}": ${feedback}`)
  }

  getPendingReviews(): OwnerTask[] {
    return this.service.getTasksByStatus('in-review')
  }

  getService(): OwnerService {
    return this.service
  }
}
