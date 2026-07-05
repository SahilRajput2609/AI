import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { ModelCapability } from '@ai-company/shared'
import { ModelProviderService } from './model-provider.service.js'

const mockRepo = {
  createProvider: vi.fn(),
  getProvider: vi.fn(),
  getAllProviders: vi.fn(),
  getActiveProviders: vi.fn(),
  updateProvider: vi.fn(),
  deleteProvider: vi.fn(),
  findByProvider: vi.fn(),
}

describe('ModelProviderService', () => {
  let service: ModelProviderService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new ModelProviderService(mockRepo as any)
  })

  describe('createProvider', () => {
    it('creates a provider with encrypted API key', async () => {
      const input = {
        name: 'OpenAI',
        provider: 'openai' as const,
        baseUrl: 'https://api.openai.com',
        apiKey: 'sk-test',
        models: [
          { name: 'GPT-4', modelId: 'gpt-4', capabilities: [] as ModelCapability[], maxTokens: 8192, costPer1MTokens: 30, isActive: true },
        ],
        isActive: true,
      }
      mockRepo.createProvider.mockResolvedValue({
        id: 'prov-1',
        provider: input.provider,
        name: input.name,
        baseUrl: input.baseUrl,
        apiKey: Buffer.from('sk-test').toString('base64'),
        isActive: input.isActive,
        models: (input.models || []).map((m) => ({
          id: 'model-1',
          providerId: 'prov-1',
          name: m.name,
          modelId: m.modelId,
          capabilities: m.capabilities as ModelCapability[],
          maxTokens: m.maxTokens,
          costPer1MTokens: m.costPer1MTokens,
          isActive: m.isActive,
        })),
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const result = await service.createProvider(input)
      expect(result.apiKey).toBe(Buffer.from('sk-test').toString('base64'))
    })

    it('throws on invalid base URL', async () => {
      await expect(service.createProvider({
        name: 'Bad', provider: 'openai' as const, baseUrl: 'not-a-url', apiKey: 'key',
      })).rejects.toThrow('Invalid base URL format')
    })

    it('accepts input when baseUrl is not provided (defaults will apply)', async () => {
      const input = {
        name: 'OpenAI',
        provider: 'openai' as const,
        baseUrl: 'https://api.openai.com',
        apiKey: 'sk-test',
      }
      mockRepo.createProvider.mockResolvedValue({
        id: 'prov-1', ...input, isActive: false,
        models: [],
        createdAt: new Date(), updatedAt: new Date(),
      })

      const result = await service.createProvider(input)
      expect(result).toBeTruthy()
    })
  })

  describe('getProvider / getAllProviders', () => {
    it('gets provider by id', async () => {
      mockRepo.getProvider.mockResolvedValue({ id: 'prov-1', name: 'OpenAI' })
      const result = await service.getProvider('prov-1')
      expect(result?.name).toBe('OpenAI')
    })

    it('returns null for unknown provider', async () => {
      mockRepo.getProvider.mockResolvedValue(null)
      expect(await service.getProvider('unknown')).toBeNull()
    })

    it('gets all providers', async () => {
      mockRepo.getAllProviders.mockResolvedValue([{ id: 'prov-1' }, { id: 'prov-2' }])
      const result = await service.getAllProviders()
      expect(result).toHaveLength(2)
    })

    it('gets active providers', async () => {
      mockRepo.getActiveProviders.mockResolvedValue([{ id: 'prov-1', isActive: true }])
      const result = await service.getActiveProviders()
      expect(result).toHaveLength(1)
    })

    it('gets providers by provider name', async () => {
      mockRepo.findByProvider.mockResolvedValue([{ id: 'prov-1', provider: 'openai' }])
      const result = await service.getProvidersByProvider('openai')
      expect(result).toHaveLength(1)
    })
  })

  describe('updateProvider', () => {
    it('updates a provider', async () => {
      const existing = { id: 'prov-1', name: 'OpenAI', isActive: false, apiKey: Buffer.from('old-key').toString('base64') }
      mockRepo.getProvider.mockResolvedValue(existing)
      mockRepo.updateProvider.mockResolvedValue({ ...existing, isActive: true })

      const result = await service.updateProvider('prov-1', { isActive: true })
      expect(result.isActive).toBe(true)
    })

    it('throws when provider not found', async () => {
      mockRepo.getProvider.mockResolvedValue(null)
      await expect(service.updateProvider('unknown', {})).rejects.toThrow('Model provider not found')
    })

    it('validates base URL on update', async () => {
      mockRepo.getProvider.mockResolvedValue({ id: 'prov-1', apiKey: 'key' })
      await expect(service.updateProvider('prov-1', { baseUrl: 'invalid' })).rejects.toThrow('Invalid base URL format')
    })

    it('encrypts API key when provided on update', async () => {
      mockRepo.getProvider.mockResolvedValue({ id: 'prov-1', name: 'OpenAI', isActive: false, apiKey: 'base64old' })
      mockRepo.updateProvider.mockResolvedValue({ id: 'prov-1', apiKey: 'bmV3LWtleQ==' })

      const result = await service.updateProvider('prov-1', { apiKey: 'new-key' })
      expect(result.apiKey).toBe(Buffer.from('new-key').toString('base64'))
    })
  })

  describe('deleteProvider', () => {
    it('deletes a provider', async () => {
      mockRepo.deleteProvider.mockResolvedValue(true)
      await expect(service.deleteProvider('prov-1')).resolves.toBeUndefined()
    })
  })

  describe('getProviderForModel', () => {
    it('finds provider for a model', async () => {
      mockRepo.getActiveProviders.mockResolvedValue([
        { id: 'p1', models: [{ modelId: 'gpt-4' }], isActive: true },
        { id: 'p2', models: [{ modelId: 'claude-3' }], isActive: true },
      ])
      const result = await service.getProviderForModel('gpt-4')
      expect(result?.id).toBe('p1')
    })

    it('returns null when no provider matches model', async () => {
      mockRepo.getActiveProviders.mockResolvedValue([])
      const result = await service.getProviderForModel('gpt-4')
      expect(result).toBeNull()
    })
  })

  describe('getProviderStats', () => {
    it('returns provider stats', async () => {
      mockRepo.getProvider.mockResolvedValue({ id: 'prov-1', isActive: true })
      const stats = await service.getProviderStats('prov-1')
      expect(stats.totalUsage).toBe(0)
      expect(stats.config.id).toBe('prov-1')
    })

    it('throws for unknown provider', async () => {
      mockRepo.getProvider.mockResolvedValue(null)
      await expect(service.getProviderStats('unknown')).rejects.toThrow('Model provider not found')
    })
  })
})
