import { DevOpsService } from './devops.service';
import { DevOpsTask, DevOpsEnvironment } from './devops.types';

export class DevOps {
  private service: DevOpsService;

  constructor() {
    this.service = new DevOpsService();
  }

  deploy(environment: DevOpsEnvironment, version: string, notes?: string): DevOpsTask {
    const task = this.service.createTask(environment, 'deploy', notes);
    task.version = version;
    this.service.startTask(task.id);
    this.service.completeTask(task.id);
    console.log(`DevOps: Deployed version "${version}" to "${environment}".`);
    return task;
  }

  configureCI(environment: DevOpsEnvironment, notes?: string): DevOpsTask {
    const task = this.service.createTask(environment, 'configure', notes);
    this.service.startTask(task.id);
    this.service.completeTask(task.id);
    console.log(`DevOps: CI configured for "${environment}".`);
    return task;
  }

  monitorDeployment(taskId: string): DevOpsTask | undefined {
    const task = this.service.getTask(taskId);
    console.log(`DevOps: Monitoring deployment "${taskId}".`);
    return task;
  }

  rollback(taskId: string): void {
    this.service.rollbackTask(taskId);
    console.log(`DevOps: Rolled back deployment "${taskId}".`);
  }

  getService(): DevOpsService {
    return this.service;
  }
}
