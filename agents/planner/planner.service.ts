import type { SubTask, Plan, PlannerState } from './planner.types'

export class PlannerService {
  private state: PlannerState = {
    plans: [],
    activePlanId: null,
  }

  createPlan(taskId: string, title: string): Plan {
    const plan: Plan = {
      id: `plan-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      taskId,
      title,
      subtasks: [],
      status: 'draft',
      createdAt: new Date().toISOString(),
    }
    this.state.plans.push(plan)
    return plan
  }

  addSubTask(
    planId: string,
    description: string,
    estimatedEffort: SubTask['estimatedEffort'],
    assignedRole: string,
    dependencies: string[] = [],
  ): SubTask | null {
    const plan = this.state.plans.find((p) => p.id === planId)
    if (!plan) return null

    const subTask: SubTask = {
      id: `sub-${planId}-${plan.subtasks.length + 1}`,
      description,
      estimatedEffort,
      dependencies,
      assignedRole,
    }
    plan.subtasks.push(subTask)
    return subTask
  }

  approvePlan(planId: string): void {
    const plan = this.state.plans.find((p) => p.id === planId)
    if (plan) {
      plan.status = 'approved'
      this.state.activePlanId = planId
    }
  }

  startExecution(planId: string): void {
    const plan = this.state.plans.find((p) => p.id === planId)
    if (plan && plan.status === 'approved') {
      plan.status = 'executing'
    }
  }

  completePlan(planId: string): void {
    const plan = this.state.plans.find((p) => p.id === planId)
    if (plan) {
      plan.status = 'completed'
      if (this.state.activePlanId === planId) {
        this.state.activePlanId = null
      }
    }
  }

  getPlan(planId: string): Plan | undefined {
    return this.state.plans.find((p) => p.id === planId)
  }

  getPlansForTask(taskId: string): Plan[] {
    return this.state.plans.filter((p) => p.taskId === taskId)
  }

  getActivePlan(): Plan | undefined {
    if (!this.state.activePlanId) return undefined
    return this.state.plans.find((p) => p.id === this.state.activePlanId)
  }

  getState(): PlannerState {
    return { ...this.state }
  }
}
