export class PlannerService {
    state = {
        plans: [],
        activePlanId: null,
    };
    createPlan(taskId, title) {
        const plan = {
            id: `plan-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            taskId,
            title,
            subtasks: [],
            status: 'draft',
            createdAt: new Date().toISOString(),
        };
        this.state.plans.push(plan);
        return plan;
    }
    addSubTask(planId, description, estimatedEffort, assignedRole, dependencies = []) {
        const plan = this.state.plans.find(p => p.id === planId);
        if (!plan)
            return null;
        const subTask = {
            id: `sub-${planId}-${plan.subtasks.length + 1}`,
            description,
            estimatedEffort,
            dependencies,
            assignedRole,
        };
        plan.subtasks.push(subTask);
        return subTask;
    }
    approvePlan(planId) {
        const plan = this.state.plans.find(p => p.id === planId);
        if (plan) {
            plan.status = 'approved';
            this.state.activePlanId = planId;
        }
    }
    startExecution(planId) {
        const plan = this.state.plans.find(p => p.id === planId);
        if (plan && plan.status === 'approved') {
            plan.status = 'executing';
        }
    }
    completePlan(planId) {
        const plan = this.state.plans.find(p => p.id === planId);
        if (plan) {
            plan.status = 'completed';
            if (this.state.activePlanId === planId) {
                this.state.activePlanId = null;
            }
        }
    }
    getPlan(planId) {
        return this.state.plans.find(p => p.id === planId);
    }
    getPlansForTask(taskId) {
        return this.state.plans.filter(p => p.taskId === taskId);
    }
    getActivePlan() {
        if (!this.state.activePlanId)
            return undefined;
        return this.state.plans.find(p => p.id === this.state.activePlanId);
    }
    getState() {
        return { ...this.state };
    }
}
