import { BackendTask, TaskPriority, BackendStatus, BackendState } from './backend.types';

export class BackendService {
  private state: BackendState = {
    tasks: [],
    completedServices: [],
  };

  createTask(serviceName: string, description: string, priority: TaskPriority = 'medium'): BackendTask {
    const task: BackendTask = {
      id: `be-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      serviceName,
      description,
      priority,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    this.state.tasks.push(task);
    return task;
  }

  assignTask(taskId: string, assignee: string): void {
    const task = this.state.tasks.find(t => t.id === taskId);
    if (task && task.status === 'pending') {
      task.assignedTo = assignee;
      task.status = 'in-progress';
    }
  }

  completeTask(taskId: string): void {
    const task = this.state.tasks.find(t => t.id === taskId);
    if (task && task.status === 'in-progress') {
      task.status = 'completed';
      task.completedAt = new Date().toISOString();
      if (!this.state.completedServices.includes(task.serviceName)) {
        this.state.completedServices.push(task.serviceName);
      }
    }
  }

  markReviewed(taskId: string): void {
    const task = this.state.tasks.find(t => t.id === taskId);
    if (task) {
      task.status = 'reviewed';
    }
  }

  getTasksByStatus(status: BackendStatus): BackendTask[] {
    return this.state.tasks.filter(t => t.status === status);
  }

  getTask(taskId: string): BackendTask | undefined {
    return this.state.tasks.find(t => t.id === taskId);
  }

  getState(): BackendState {
    return { ...this.state };
  }
}
