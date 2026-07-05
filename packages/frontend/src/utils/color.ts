// Get status color based on status
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    idle: 'text-slate-400',
    online: 'text-green-400',
    running: 'text-blue-400',
    error: 'text-red-400',
    success: 'text-green-400',
    warning: 'text-orange-400',
    pending: 'text-yellow-400',
    completed: 'text-green-400',
    failed: 'text-red-400',
  }
  return colors[status.toLowerCase()] || 'text-slate-400'
}

// Get priority color
export function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    low: 'text-slate-400',
    medium: 'text-orange-400',
    high: 'text-red-400',
  }
  return colors[priority.toLowerCase()] || 'text-slate-400'
}

// Get agent role color
export function getAgentRoleColor(role: string): string {
  const colors: Record<string, string> = {
    owner: 'text-orange-400',
    planner: 'text-purple-400',
    orchestrator: 'text-blue-400',
    coder: 'text-blue-400',
    reviewer: 'text-green-400',
    frontend: 'text-cyan-400',
    backend: 'text-indigo-400',
    api: 'text-pink-400',
    database: 'text-violet-400',
    qa: 'text-green-400',
    debugger: 'text-red-400',
    devops: 'text-teal-400',
    documentation: 'text-yellow-400',
  }
  return colors[role.toLowerCase()] || 'text-slate-400'
}

// Convert hex to rgba
export function hexToRgba(hex: string, alpha: number = 1): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
