import type { DocTask, DocType, DocStatus, DocSection, DocumentationState } from './documentation.types'

export class DocumentationService {
  private state: DocumentationState = {
    tasks: [],
    publishedDocs: [],
  }

  createTask(targetFile: string, docType: DocType): DocTask {
    const task: DocTask = {
      id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      targetFile,
      docType,
      status: 'draft',
      sections: [],
      createdAt: new Date().toISOString(),
    }
    this.state.tasks.push(task)
    return task
  }

  addSection(taskId: string, title: string, content: string, order: number): void {
    const task = this.state.tasks.find((t) => t.id === taskId)
    if (task) {
      const section: DocSection = { title, content, order }
      task.sections.push(section)
      task.sections.sort((a, b) => a.order - b.order)
    }
  }

  submitForReview(taskId: string): void {
    const task = this.state.tasks.find((t) => t.id === taskId)
    if (task && task.status === 'draft') {
      task.status = 'review'
    }
  }

  publish(taskId: string): void {
    const task = this.state.tasks.find((t) => t.id === taskId)
    if (task && task.status === 'review') {
      task.status = 'published'
      task.publishedAt = new Date().toISOString()
      if (!this.state.publishedDocs.includes(task.targetFile)) {
        this.state.publishedDocs.push(task.targetFile)
      }
    }
  }

  archive(taskId: string): void {
    const task = this.state.tasks.find((t) => t.id === taskId)
    if (task) {
      task.status = 'archived'
    }
  }

  getTask(taskId: string): DocTask | undefined {
    return this.state.tasks.find((t) => t.id === taskId)
  }

  getTasksByStatus(status: DocStatus): DocTask[] {
    return this.state.tasks.filter((t) => t.status === status)
  }

  getState(): DocumentationState {
    return { ...this.state }
  }
}
