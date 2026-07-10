import type { AgentStatus } from '@ai-company/shared'
import { AgentRepository } from '@ai-company/database'
import type { Agent } from '@ai-company/database'

export class AgentService {
  private agentRepo: AgentRepository

  constructor() {
    this.agentRepo = new AgentRepository()
  }

  async createAgent(data: {
    role: string
    name: string
    description?: string
    capabilities: string[]
    modelId?: string
  }): Promise<Agent> {
    const agent = await this.agentRepo.create({
      role: data.role,
      status: 'idle',
      subtext: data.description,
      metadata: {
        name: data.name,
        description: data.description,
        capabilities: data.capabilities,
        modelId: data.modelId,
      },
    })
    return agent
  }

  async getAgent(id: string): Promise<Agent | null> {
    return this.agentRepo.findById(id)
  }

  async updateAgent(id: string, updates: Partial<Agent>): Promise<Agent | null> {
    return this.agentRepo.update(id, updates)
  }

  async deleteAgent(id: string): Promise<boolean> {
    return this.agentRepo.delete(id)
  }

  async listAgents(filters?: { role?: string; status?: AgentStatus }): Promise<Agent[]> {
    if (filters?.role) {
      const agent = await this.agentRepo.findByRole(filters.role)
      return agent ? [agent] : []
    }
    return this.agentRepo.findAll()
  }

  async updateAgentStatus(id: string, status: Agent['status'], currentTaskId?: string): Promise<Agent | null> {
    return this.agentRepo.update(id, {
      status,
      current_task_id: currentTaskId,
    })
  }

  async getAgentsByStatus(status: AgentStatus): Promise<Agent[]> {
    return this.agentRepo.findAll()
  }

  async getAgentByRole(role: string): Promise<Agent | null> {
    return this.agentRepo.findByRole(role)
  }

  async updateAgentMetadata(id: string, metadata: Record<string, unknown>): Promise<Agent | null> {
    const agent = await this.agentRepo.findById(id)
    if (!agent) return null

    return this.agentRepo.update(id, {
      metadata: { ...agent.metadata, ...metadata },
    })
  }
}
