import { OwnerService } from './owner.service';
export class Owner {
    service;
    constructor() {
        this.service = new OwnerService();
    }
    createAndSubmitTask(title, description, priority = 'medium', category = 'general') {
        const task = this.service.createTask(title, description, priority, category);
        this.service.submitTask(task.id);
        console.log(`Owner: Task "${task.id}" submitted to system.`);
        return task;
    }
    requestReview(taskId) {
        this.service.markForReview(taskId);
        console.log(`Owner: Requested review for task "${taskId}".`);
    }
    approveTask(taskId, feedback) {
        this.service.reviewTask(taskId, { taskId, approved: true, feedback });
        console.log(`Owner: Approved task "${taskId}".`);
    }
    rejectTask(taskId, feedback) {
        this.service.reviewTask(taskId, { taskId, approved: false, feedback });
        console.log(`Owner: Rejected task "${taskId}": ${feedback}`);
    }
    getPendingReviews() {
        return this.service.getTasksByStatus('in-review');
    }
    getService() {
        return this.service;
    }
}
