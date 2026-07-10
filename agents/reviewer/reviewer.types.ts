export type ReviewType = 'code-review' | 'design-review' | 'security-review' | 'performance-review'

export type ReviewStatus = 'pending' | 'in-progress' | 'approved' | 'changes-requested' | 'closed'

export interface ReviewFeedback {
  reviewId: string
  lineStart?: number
  lineEnd?: number
  severity: 'minor' | 'major' | 'critical'
  category: string
  message: string
  suggestion?: string
}

export interface ReviewTask {
  id: string
  targetFile: string
  reviewType: ReviewType
  status: ReviewStatus
  feedback: ReviewFeedback[]
  reviewer?: string
  createdAt: string
  completedAt?: string
}

export interface ReviewerState {
  tasks: ReviewTask[]
  approvedFiles: string[]
}
