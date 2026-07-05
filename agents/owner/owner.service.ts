import { OwnerTask, TaskPriority, ReviewDecision, OwnerState } from './owner.types';

export class OwnerService {
  private state: OwnerState = {
    tasks: [],
    pendingReviews: [],
    completedTasks: [],
  };

  createTask(title: string, description: string, priority: TaskPriority, category: string): OwnerTask {
    const task: OwnerTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title,
      description,
      priority,
      category,
      createdAt: new Date().toISOString(),
      status: 'draft',
    };
    this.state.tasks.push(task);
    return task;
  }

  submitTask(taskId: string): void {
    const task = this.state.tasks.find(t => t.id === taskId);
    if (task && task.status === 'draft') {
      task.status = 'submitted';
    }
  }

  markForReview(taskId: string): void {
    const task = this.state.tasks.find(t => t.id === taskId);
    if (task) {
      task.status = 'in-review';
      if (!this.state.pendingReviews.includes(taskId)) {
        this.state.pendingReviews.push(taskId);
      }
    }
  }

  reviewTask(taskId: string, decision: ReviewDecision): void {
    const task = this.state.tasks.find(t => t.id === taskId);
    if (!task) return;

    this.state.pendingReviews = this.state.pendingReviews.filter(id => id !== taskId);

    if (decision.approved) {
      task.status = 'completed';
      this.state.completedTasks.push(taskId);
    } else {
      task.status = 'rejected';
    }
  }

  getTasksByStatus(status: OwnerTask['status']): OwnerTask[] {
    return this.state.tasks.filter(t => t.status === status);
  }

  getTask(taskId: string): OwnerTask | undefined {
    return this.state.tasks.find(t => t.id === taskId);
  }

  getState(): OwnerState {
    return { ...this.state };
  }
}
