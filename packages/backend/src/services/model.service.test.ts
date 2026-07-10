import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ModelService } from './model.service.js'

const mockRepo = {
  create: vi.fn(),
  findById: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  findAll: vi.fn(),
}

vi.mock('@ai-company/database', () => ({
  ModelRepository: vi.fn(() => mockRepo),
}))

describe('ModelService', () => {
  let service: ModelService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new ModelService()
  })

  it('creates a model', async () => {
    const data = {
      name: 'GPT-4',
      provider: 'openai',
      modelId: 'gpt-4',
      capabilities: ['chat'],
      maxTokens: 8192,
      costPer1MTokens: 30,
    }
    const expected = { id: 'model-1', ...data, isActive: false, config: {} }
    mockRepo.create.mockResolvedValue(expected)

    const result = await service.createModel(data)
    expect(result).toEqual(expected)
    expect(mockRepo.create).toHaveBeenCalledWith({ ...data, isActive: false, config: {} })
  })

  it('gets a model by id', async () => {
    mockRepo.findById.mockResolvedValue({ id: 'model-1', name: 'GPT-4' })
    const result = await service.getModel('model-1')
    expect(result?.name).toBe('GPT-4')
  })

  it('updates a model', async () => {
    mockRepo.update.mockResolvedValue({ id: 'model-1', isActive: true })
    const result = await service.updateModel('model-1', { isActive: true })
    expect(result?.isActive).toBe(true)
  })

  it('deletes a model', async () => {
    mockRepo.delete.mockResolvedValue(true)
    expect(await service.deleteModel('model-1')).toBe(true)
  })

  it('lists models with filters', async () => {
    mockRepo.findAll.mockResolvedValue([])
    await service.listModels({ provider: 'openai' })
    expect(mockRepo.findAll).toHaveBeenCalledWith({ provider: 'openai' })
  })

  it('gets active models', async () => {
    mockRepo.findAll.mockResolvedValue([])
    await service.getActiveModels()
    expect(mockRepo.findAll).toHaveBeenCalledWith({ isActive: true })
  })

  it('gets models by provider', async () => {
    mockRepo.findAll.mockResolvedValue([])
    await service.getModelByProvider('openai')
    expect(mockRepo.findAll).toHaveBeenCalledWith({ provider: 'openai' })
  })

  it('activates a model', async () => {
    mockRepo.update.mockResolvedValue({ id: 'model-1', isActive: true })
    await service.activateModel('model-1')
    expect(mockRepo.update).toHaveBeenCalledWith('model-1', { isActive: true })
  })

  it('deactivates a model', async () => {
    mockRepo.update.mockResolvedValue({ id: 'model-1', isActive: false })
    await service.deactivateModel('model-1')
    expect(mockRepo.update).toHaveBeenCalledWith('model-1', { isActive: false })
  })
})
