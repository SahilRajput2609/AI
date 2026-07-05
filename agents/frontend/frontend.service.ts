import { FrontendTask, FrontendFramework, ComponentStatus, FrontendState } from './frontend.types';

export class FrontendService {
  private state: FrontendState = {
    tasks: [],
    completedComponents: [],
  };

  createTask(componentName: string, framework: FrontendFramework): FrontendTask {
    const task: FrontendTask = {
      id: `fe-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      componentName,
      framework,
      status: 'planned',
      createdAt: new Date().toISOString(),
    };
    this.state.tasks.push(task);
    return task;
  }

  startImplementation(taskId: string): void {
    const task = this.state.tasks.find(t => t.id === taskId);
    if (task && task.status === 'planned') {
      task.status = 'in-progress';
    }
  }

  markImplemented(taskId: string, fileName: string): void {
    const task = this.state.tasks.find(t => t.id === taskId);
    if (task && task.status === 'in-progress') {
      task.fileName = fileName;
      task.status = 'implemented';
    }
  }

  markStyled(taskId: string): void {
    const task = this.state.tasks.find(t => t.id === taskId);
    if (task && task.status === 'implemented') {
      task.status = 'styled';
    }
  }

  completeTask(taskId: string): void {
    const task = this.state.tasks.find(t => t.id === taskId);
    if (task && task.status === 'styled') {
      task.status = 'completed';
      task.completedAt = new Date().toISOString();
      if (!this.state.completedComponents.includes(task.componentName)) {
        this.state.completedComponents.push(task.componentName);
      }
    }
  }

  getTask(taskId: string): FrontendTask | undefined {
    return this.state.tasks.find(t => t.id === taskId);
  }

  getTasksByStatus(status: ComponentStatus): FrontendTask[] {
    return this.state.tasks.filter(t => t.status === status);
  }

  getState(): FrontendState {
    return { ...this.state };
  }
}
