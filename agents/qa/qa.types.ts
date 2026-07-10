export type TestType = 'unit' | 'integration' | 'e2e' | 'performance' | 'security' | 'regression'

export type QATaskStatus = 'pending' | 'writing' | 'running' | 'passed' | 'failed' | 'reviewed'

export interface TestResult {
  taskId: string
  totalTests: number
  passed: number
  failed: number
  coverage: number
  duration: number
  output?: string
}

export interface QATask {
  id: string
  targetFile: string
  testType: TestType
  status: QATaskStatus
  testFile?: string
  result?: TestResult
  createdAt: string
  completedAt?: string
}

export interface QAState {
  tasks: QATask[]
  validatedFiles: string[]
}
