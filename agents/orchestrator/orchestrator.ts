import { OrchestratorService } from './orchestrator.service'
import type { Task } from './orchestrator.types'
import { Agent } from './orchestrator.types'

export class Orchestrator {
  private service: OrchestratorService

  constructor() {
    this.service = new OrchestratorService()
  }

  async handleOwnerTask(task: Task) {
    this.service.queueTask(task)
    this.service.trackDependencies()
    this.service.notifyOwner(`Task ${task.id} queued.`)
  }

  async handlePlannerArchitecture(architecture: any) {
    this.service.notifyOwner('Architecture received from Planner AI.')
  }

  async dispatchTasks() {
    const tasks = this.service.getState().taskQueue
    for (const task of tasks) {
      const agent = this.service.getState().taskQueue[0]?.assignedAgent // simplified
      if (agent) {
        this.service.startTask(task.id)
      }
    }
  }

  async completeAndReview() {
    const results = this.service.collectResults()
    this.service.notifyOwner('Tasks completed. Sending to Reviewer AI.')
    return results
  }
}
