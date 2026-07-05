export type Priority = 'high' | 'medium' | 'low'

export interface KanbanCardData {
  id: string
  title: string
  priority: Priority
  tags: string[]
  assignee: string | null
  attachments: number
  comments: number
  progress?: number
  completed?: boolean
}

export interface KanbanColumnData {
  id: string
  title: string
  color: string
  count: number
  cards: KanbanCardData[]
}

export const initialColumns: KanbanColumnData[] = [
  {
    id: 'pending',
    title: 'Backlog',
    color: '#64748B',
    count: 3,
    cards: [
      { id: '1', title: 'Write integration tests for auth flow', priority: 'low', tags: ['testing'], assignee: null, attachments: 2, comments: 1 },
      { id: '2', title: 'Add API rate limiting middleware', priority: 'medium', tags: ['backend', 'security'], assignee: null, attachments: 0, comments: 3 },
      { id: '3', title: 'Design system migration — button component', priority: 'low', tags: ['ui', 'design-system'], assignee: null, attachments: 1, comments: 0 },
    ],
  },
  {
    id: 'in_progress',
    title: 'In Progress',
    color: '#3B82F6',
    count: 2,
    cards: [
      { id: '4', title: 'JWT authentication middleware', priority: 'high', tags: ['security', 'backend'], assignee: 'Coder Agent', progress: 60, attachments: 0, comments: 2 },
      { id: '5', title: 'User profile page layout', priority: 'medium', tags: ['ui'], assignee: 'Coder Agent', progress: 30, attachments: 3, comments: 0 },
    ],
  },
  {
    id: 'completed',
    title: 'Done',
    color: '#22C55E',
    count: 2,
    cards: [
      { id: '6', title: 'Dashboard analytics widgets', priority: 'medium', tags: ['ui', 'analytics'], assignee: 'Reviewer Agent', attachments: 1, comments: 4, completed: true },
      { id: '7', title: 'Project scaffolding & routing', priority: 'high', tags: ['setup'], assignee: null, completed: true, attachments: 0, comments: 0 },
    ],
  },
]

export const priorityConfig = {
  high: { bg: 'rgba(239,68,68,0.12)', color: '#EF4444', label: 'High' },
  medium: { bg: 'rgba(245,158,11,0.12)', color: '#F59E0B', label: 'Medium' },
  low: { bg: 'rgba(100,116,139,0.12)', color: '#94A3B8', label: 'Low' },
}
