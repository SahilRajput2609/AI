import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AgentService } from './agent.service.js'

const mockRepo = {
  create: vi.fn(),
  findById: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  findAll: vi.fn(),
  findByRole: vi.fn(),
}

vi.mock('@ai-company/database', () => ({
  AgentRepository: vi.fn(() => mockRepo),
}))

describe('AgentService', () => {
  let service: AgentService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new AgentService()
  })

  it('creates an agent', async () => {
    const data = { role: 'coder', name: 'CodeAgent', capabilities: ['typescript'] }
    const expected = {
      id: 'agent-1',
      role: 'coder',
      status: 'idle',
      subtext: undefined,
      metadata: {
        name: 'CodeAgent',
        description: undefined,
        capabilities: ['typescript'],
        modelId: undefined,
      },
    }
    mockRepo.create.mockResolvedValue(expected)

    const result = await service.createAgent(data)
    expect(result).toEqual(expected)
    expect(mockRepo.create).toHaveBeenCalledWith({
      role: 'coder',
      status: 'idle',
      subtext: undefined,
      metadata: {
        name: 'CodeAgent',
        description: undefined,
        capabilities: ['typescript'],
        modelId: undefined,
      },
    })
  })

  it('gets an agent by id', async () => {
    mockRepo.findById.mockResolvedValue({ id: 'agent-1', role: 'coder' })
    const result = await service.getAgent('agent-1')
    expect(result?.role).toBe('coder')
  })

  it('updates an agent', async () => {
    mockRepo.update.mockResolvedValue({ id: 'agent-1', status: 'running' })
    const result = await service.updateAgent('agent-1', { status: 'running' })
    expect(result?.status).toBe('running')
  })

  it('deletes an agent', async () => {
    mockRepo.delete.mockResolvedValue(true)
    expect(await service.deleteAgent('agent-1')).toBe(true)
  })

  it('lists agents with role filter', async () => {
    mockRepo.findByRole.mockResolvedValue({ id: 'agent-1', role: 'coder' })
    const result = await service.listAgents({ role: 'coder' })
    expect(result).toHaveLength(1)
    expect(mockRepo.findByRole).toHaveBeenCalledWith('coder')
  })

  it('lists all agents when no role filter', async () => {
    mockRepo.findAll.mockResolvedValue([])
    const result = await service.listAgents({})
    expect(result).toEqual([])
    expect(mockRepo.findAll).toHaveBeenCalled()
  })

  it('updates agent status', async () => {
    mockRepo.update.mockResolvedValue({ id: 'agent-1', status: 'running', current_task_id: 'task-1' })
    await service.updateAgentStatus('agent-1', 'running', 'task-1')
    expect(mockRepo.update).toHaveBeenCalledWith('agent-1', { status: 'running', current_task_id: 'task-1' })
  })

  it('gets first agent by role', async () => {
    mockRepo.findByRole.mockResolvedValue({ id: 'agent-1', role: 'orchestrator' })
    const result = await service.getAgentByRole('orchestrator')
    expect(result?.id).toBe('agent-1')
  })

  it('returns null when no agent found by role', async () => {
    mockRepo.findByRole.mockResolvedValue(null)
    const result = await service.getAgentByRole('nonexistent')
    expect(result).toBeNull()
  })

  it('updates agent metadata', async () => {
    mockRepo.findById.mockResolvedValue({
      id: 'agent-1',
      metadata: { existing: 'value' },
    })
    mockRepo.update.mockResolvedValue({
      id: 'agent-1',
      metadata: { existing: 'value', newKey: 'newValue' },
    })

    const result = await service.updateAgentMetadata('agent-1', { newKey: 'newValue' })
    expect(result?.metadata).toEqual({ existing: 'value', newKey: 'newValue' })
  })
})
