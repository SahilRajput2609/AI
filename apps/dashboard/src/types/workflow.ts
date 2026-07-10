// src/types/workflow.ts
export interface TaskStatus {
  id: string
  description: string
  assignedRole: string
  duration: number
  status: 'queued' | 'running' | 'success' | 'failed'
}

export interface TerminalLog {
  timestamp: number
  level: 'info' | 'success' | 'warning' | 'error'
  message: string
  agent?: string
}

export interface CodeFile {
  path: string
  language: string
  code: string
}

export interface WorkflowState {
  // Current IDE state
  prompt: string
  selectedProjectId: string | null
  taskStatuses: ('queued' | 'running' | 'success' | 'failed')[]
  terminalLogs: TerminalLog[]
  currentStep: number
  isRunning: boolean
  activeFilePath: string
  typedCode: string

  // Project data (embedded for self-contained export)
  projects: Record<
    string,
    {
      id: string
      title: string
      description: string
      files: CodeFile[]
      tasks: TaskStatus[]
      tests: string[]
    }
  >

  // History state (with timestamps)
  history: Array<{ prompt: string; outcome: 'completed' | 'rejected'; timestamp: string }>

  // Export metadata
  exportedAt: string
  version: string
}
