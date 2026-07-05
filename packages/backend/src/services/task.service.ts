import type { TaskStatus } from '@ai-company/shared'
import type { Task } from '@ai-company/database'
import { TaskRepository } from '@ai-company/database'

export class TaskService {
  private taskRepo: TaskRepository

  constructor() {
    this.taskRepo = new TaskRepository()
  }

  async createTask(data: {
    title: string
    description?: string
    priority: 'low' | 'medium' | 'high'
    assignedTo?: string
    projectId: string
  }): Promise<Task> {
    const task = await this.taskRepo.create({
      project_id: data.projectId,
      title: data.title,
      description: data.description,
      priority: data.priority,
      assigned_agent: data.assignedTo,
      status: 'pending',
      tags: [],
      attachments: 0,
      comments: 0,
      progress: 0,
    })
    return task
  }

  async getTask(id: string): Promise<Task | null> {
    return this.taskRepo.findById(id)
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {
    return this.taskRepo.update(id, updates)
  }

  async deleteTask(id: string): Promise<boolean> {
    return this.taskRepo.delete(id)
  }

  async listTasks(filters?: {
    status?: TaskStatus
    priority?: 'low' | 'medium' | 'high'
    assignedTo?: string
    projectId?: string
  }): Promise<Task[]> {
    return this.taskRepo.findAll(filters)
  }

  async updateTaskStatus(id: string, status: Task['status']): Promise<Task | null> {
    return this.taskRepo.update(id, { status, updated_at: Date.now() })
  }

  async assignTask(id: string, agentId: string): Promise<Task | null> {
    return this.taskRepo.update(id, { assigned_agent: agentId, updated_at: Date.now() })
  }

  async getTasksByProject(projectId: string): Promise<Task[]> {
    return this.taskRepo.findAll({ projectId })
  }

  async getTasksByAgent(agentId: string): Promise<Task[]> {
    return this.taskRepo.findAll({ assignedTo: agentId })
  }
}
