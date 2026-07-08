export class OwnerService {
    state = {
        tasks: [],
        pendingReviews: [],
        completedTasks: [],
    };
    createTask(title, description, priority, category) {
        const task = {
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
    submitTask(taskId) {
        const task = this.state.tasks.find(t => t.id === taskId);
        if (task && task.status === 'draft') {
            task.status = 'submitted';
        }
    }
    markForReview(taskId) {
        const task = this.state.tasks.find(t => t.id === taskId);
        if (task) {
            task.status = 'in-review';
            if (!this.state.pendingReviews.includes(taskId)) {
                this.state.pendingReviews.push(taskId);
            }
        }
    }
    reviewTask(taskId, decision) {
        const task = this.state.tasks.find(t => t.id === taskId);
        if (!task)
            return;
        this.state.pendingReviews = this.state.pendingReviews.filter(id => id !== taskId);
        if (decision.approved) {
            task.status = 'completed';
            this.state.completedTasks.push(taskId);
        }
        else {
            task.status = 'rejected';
        }
    }
    getTasksByStatus(status) {
        return this.state.tasks.filter(t => t.status === status);
    }
    getTask(taskId) {
        return this.state.tasks.find(t => t.id === taskId);
    }
    getState() {
        return { ...this.state };
    }
}
