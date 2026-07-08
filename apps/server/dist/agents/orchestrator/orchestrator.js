import { OrchestratorService } from './orchestrator.service';
export class Orchestrator {
    service;
    constructor() {
        this.service = new OrchestratorService();
    }
    async handleOwnerTask(task) {
        this.service.queueTask(task);
        this.service.trackDependencies();
        this.service.notifyOwner(`Task ${task.id} queued.`);
    }
    async handlePlannerArchitecture(architecture) {
        this.service.notifyOwner('Architecture received from Planner AI.');
    }
    async dispatchTasks() {
        const tasks = this.service.getState().taskQueue;
        for (const task of tasks) {
            const agent = this.service.getState().taskQueue[0]?.assignedAgent; // simplified
            if (agent) {
                this.service.startTask(task.id);
            }
        }
    }
    async completeAndReview() {
        const results = this.service.collectResults();
        this.service.notifyOwner('Tasks completed. Sending to Reviewer AI.');
        return results;
    }
}
