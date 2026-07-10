export interface SubTask {
  id: string
  description: string
  estimatedEffort: 'small' | 'medium' | 'large'
  dependencies: string[]
  assignedRole: string
}

export interface Plan {
  id: string
  taskId: string
  title: string
  subtasks: SubTask[]
  status: 'draft' | 'approved' | 'executing' | 'completed'
  createdAt: string
}

export interface PlannerState {
  plans: Plan[]
  activePlanId: string | null
}
