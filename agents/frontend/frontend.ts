import { FrontendService } from './frontend.service'
import type { FrontendTask, FrontendFramework } from './frontend.types'

export class Frontend {
  private service: FrontendService

  constructor() {
    this.service = new FrontendService()
  }

  createComponent(name: string, framework: FrontendFramework): FrontendTask {
    const task = this.service.createTask(name, framework)
    console.log(`Frontend: Component "${name}" planned (${framework}).`)
    return task
  }

  implementFeature(taskId: string, fileName: string): void {
    this.service.startImplementation(taskId)
    this.service.markImplemented(taskId, fileName)
    console.log(`Frontend: Implemented component in "${fileName}".`)
  }

  styleComponent(taskId: string): void {
    this.service.markStyled(taskId)
    this.service.completeTask(taskId)
    console.log(`Frontend: Component "${taskId}" styled and completed.`)
  }

  getComponent(taskId: string): FrontendTask | undefined {
    return this.service.getTask(taskId)
  }

  getService(): FrontendService {
    return this.service
  }
}
