export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface OwnerTask {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  category: string;
  createdAt: string;
  status: 'draft' | 'submitted' | 'in-review' | 'completed' | 'rejected';
}

export interface ReviewDecision {
  taskId: string;
  approved: boolean;
  feedback?: string;
}

export interface OwnerState {
  tasks: OwnerTask[];
  pendingReviews: string[];
  completedTasks: string[];
}
