import { PlannerService } from './planner.service';
export class Planner {
    service;
    constructor() {
        this.service = new PlannerService();
    }
    createExecutionPlan(taskId, title) {
        const plan = this.service.createPlan(taskId, title);
        console.log(`Planner: Created plan "${plan.id}" for task "${taskId}".`);
        return plan;
    }
    addTask(planId, description, estimatedEffort, assignedRole, dependencies = []) {
        const subTask = this.service.addSubTask(planId, description, estimatedEffort, assignedRole, dependencies);
        if (subTask) {
            console.log(`Planner: Added subtask "${subTask.id}" to plan "${planId}".`);
        }
        return subTask;
    }
    finalizePlan(planId) {
        this.service.approvePlan(planId);
        console.log(`Planner: Finalized plan "${planId}" and submitted for execution.`);
    }
    getPlan(planId) {
        return this.service.getPlan(planId);
    }
    getActivePlan() {
        return this.service.getActivePlan();
    }
    getService() {
        return this.service;
    }
}
