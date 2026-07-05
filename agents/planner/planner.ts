import { PlannerService } from './planner.service';
import { Plan, SubTask } from './planner.types';

export class Planner {
  private service: PlannerService;

  constructor() {
    this.service = new PlannerService();
  }

  createExecutionPlan(taskId: string, title: string): Plan {
    const plan = this.service.createPlan(taskId, title);
    console.log(`Planner: Created plan "${plan.id}" for task "${taskId}".`);
    return plan;
  }

  addTask(planId: string, description: string, estimatedEffort: SubTask['estimatedEffort'], assignedRole: string, dependencies: string[] = []): SubTask | null {
    const subTask = this.service.addSubTask(planId, description, estimatedEffort, assignedRole, dependencies);
    if (subTask) {
      console.log(`Planner: Added subtask "${subTask.id}" to plan "${planId}".`);
    }
    return subTask;
  }

  finalizePlan(planId: string): void {
    this.service.approvePlan(planId);
    console.log(`Planner: Finalized plan "${planId}" and submitted for execution.`);
  }

  getPlan(planId: string): Plan | undefined {
    return this.service.getPlan(planId);
  }

  getActivePlan(): Plan | undefined {
    return this.service.getActivePlan();
  }

  getService(): PlannerService {
    return this.service;
  }
}
