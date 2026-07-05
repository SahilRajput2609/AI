import { EventEmitter } from 'events'

export interface ManagedAgent {
  id: string
  role: string
  status: 'idle' | 'running' | 'error'
  capabilities: string[]
  currentTask: string | null
  tasksCompleted: number
  tasksInQueue: number
  lastActive: Date
}

export interface AgentSubTask {
  id: string
  assignedRole: string
  description?: string
  status?: 'pending' | 'in_progress' | 'completed' | 'failed'
}

export interface AgentConfig {
  id: string
  role: string
  capabilities: string[]
  maxConcurrentTasks?: number
}

export class AgentManager extends EventEmitter {
  private agents: Map<string, ManagedAgent> = new Map()
  private agentTasks: Map<string, Set<string>> = new Map()

  // Register an agent
  registerAgent(config: AgentConfig): void {
    const agent: ManagedAgent = {
      id: config.id,
      role: config.role,
      status: 'idle',
      capabilities: config.capabilities,
      currentTask: null,
      tasksCompleted: 0,
      tasksInQueue: 0,
      lastActive: new Date(),
    }

    this.agents.set(config.id, agent)
    this.agentTasks.set(config.id, new Set())
    this.emit('agent:registered', { agent })
  }

  // Unregister an agent
  unregisterAgent(agentId: string): void {
    const agent = this.agents.get(agentId)
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`)
    }

    if (agent.status === 'running') {
      throw new Error(`Cannot unregister running agent: ${agentId}`)
    }

    this.agents.delete(agentId)
    this.agentTasks.delete(agentId)
    this.emit('agent:unregistered', { agentId })
  }

  // Get agent by ID
  getAgent(agentId: string): ManagedAgent | undefined {
    return this.agents.get(agentId)
  }

  // Get all agents
  getAllAgents(): ManagedAgent[] {
    return Array.from(this.agents.values())
  }

  // Get agents by role
  getAgentsByRole(role: string): ManagedAgent[] {
    return Array.from(this.agents.values()).filter((a) => a.role === role)
  }

  // Find available agent for a subtask
  findAvailableAgent(subTask: AgentSubTask): ManagedAgent | null {
    const candidates = Array.from(this.agents.values()).filter(
      (agent) =>
        (agent.role === subTask.assignedRole || subTask.assignedRole === 'any') &&
        agent.status !== 'error'
    )

    // Prefer idle agents
    const idle = candidates.find((a) => a.status === 'idle')
    if (idle) return idle

    // Find agent with least tasks
    candidates.sort((a, b) => a.tasksInQueue - b.tasksInQueue)
    return candidates[0] || null
  }

  // Assign task to agent
  async assignTask(agentId: string, taskId: string): Promise<void> {
    const agent = this.agents.get(agentId)
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`)
    }

    const tasks = this.agentTasks.get(agentId)!
    tasks.add(taskId)

    agent.tasksInQueue = tasks.size
    agent.status = 'running'
    agent.currentTask = taskId
    agent.lastActive = new Date()

    this.emit('task:assigned', { agentId, taskId })
  }

  // Complete task
  async completeTask(agentId: string, taskId: string): Promise<void> {
    const agent = this.agents.get(agentId)
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`)
    }

    const tasks = this.agentTasks.get(agentId)!
    tasks.delete(taskId)

    agent.tasksCompleted++
    agent.tasksInQueue = tasks.size
    agent.currentTask = tasks.size > 0 ? Array.from(tasks)[0] : null
    agent.status = tasks.size > 0 ? 'running' : 'idle'
    agent.lastActive = new Date()

    this.emit('task:completed', { agentId, taskId })
  }

  // Mark agent as having an error
  markAgentError(agentId: string, error: string): void {
    const agent = this.agents.get(agentId)
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`)
    }

    agent.status = 'error'
    agent.lastActive = new Date()
    this.emit('agent:error', { agentId, error })
  }

  // Reset agent status
  resetAgent(agentId: string): void {
    const agent = this.agents.get(agentId)
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`)
    }

    const tasks = this.agentTasks.get(agentId)!
    tasks.clear()

    agent.status = 'idle'
    agent.currentTask = null
    agent.tasksInQueue = 0
    agent.lastActive = new Date()

    this.emit('agent:reset', { agentId })
  }

  // Get agent statistics
  getStatistics(): {
    total: number
    idle: number
    running: number
    error: number
    totalTasksCompleted: number
  } {
    const agents = Array.from(this.agents.values())
    return {
      total: agents.length,
      idle: agents.filter((a) => a.status === 'idle').length,
      running: agents.filter((a) => a.status === 'running').length,
      error: agents.filter((a) => a.status === 'error').length,
      totalTasksCompleted: agents.reduce((sum, a) => sum + a.tasksCompleted, 0),
    }
  }
}
