export type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical';

export type DebugStatus = 'open' | 'analyzing' | 'fix-ready' | 'applied' | 'verified' | 'closed';

export interface DebugTask {
  id: string;
  targetFile: string;
  errorType: string;
  severity: ErrorSeverity;
  status: DebugStatus;
  errorMessage: string;
  suggestedFix?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface DebugResult {
  taskId: string;
  rootCause: string;
  fixApplied: boolean;
  verified: boolean;
  output?: string;
}

export interface DebuggerState {
  tasks: DebugTask[];
  verifiedFixes: string[];
}
