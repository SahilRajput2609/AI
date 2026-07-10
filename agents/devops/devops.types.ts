export type DevOpsEnvironment = 'development' | 'staging' | 'production'

export type DevOpsOperation = 'deploy' | 'configure' | 'monitor' | 'rollback' | 'scale'

export type DevOpsStatus = 'pending' | 'in-progress' | 'completed' | 'failed' | 'rolled-back'

export interface DevOpsTask {
  id: string
  environment: DevOpsEnvironment
  operation: DevOpsOperation
  status: DevOpsStatus
  version?: string
  notes?: string
  createdAt: string
  completedAt?: string
}

export interface DevOpsState {
  tasks: DevOpsTask[]
  activeDeployments: string[]
  environments: DevOpsEnvironment[]
}
