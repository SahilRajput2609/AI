import { BackendService } from './backend.service';
import { BackendTask, TaskPriority } from './backend.types';

export class Backend {
  private service: BackendService;

  constructor() {
    this.service = new BackendService();
  }

  createService(name: string, description: string, priority: TaskPriority = 'medium'): BackendTask {
    const task = this.service.createTask(name, description, priority);
    console.log(`Backend: Service task "${task.id}" created for "${name}".`);
    return task;
  }

  implementService(taskId: string, developer: string): void {
    this.service.assignTask(taskId, developer);
    console.log(`Backend: Assigned task "${taskId}" to "${developer}" for implementation.`);
  }

  reviewImplementation(taskId: string): void {
    this.service.completeTask(taskId);
    this.service.markReviewed(taskId);
    console.log(`Backend: Implementation for task "${taskId}" reviewed and completed.`);
  }

  getService(taskId: string): BackendTask | undefined {
    return this.service.getTask(taskId);
  }

  getServiceInstance(): BackendService {
    return this.service;
  }
}
