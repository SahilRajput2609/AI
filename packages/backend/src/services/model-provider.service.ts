import { 
  type ModelProviderConfig, 
  type CreateModelProviderInput as ModelProviderCreateInput, 
  type UpdateModelProviderInput as ModelProviderUpdateInput,
  type ModelConfig,
  type ModelCapability,
  generateId,
  Logger,
} from '@ai-company/shared'
import { ModelProviderRepository } from '@ai-company/database'

export class ModelProviderService {
  private logger = new Logger('ModelProviderService')
  private repository: ModelProviderRepository

  constructor(repository: ModelProviderRepository) {
    this.repository = repository
  }

  async createProvider(input: ModelProviderCreateInput): Promise<ModelProviderConfig> {
    try {
      if (input.baseUrl) {
        try {
          new URL(input.baseUrl)
        } catch {
          throw new Error('Invalid base URL format')
        }
      }

      const encryptedApiKey = this.encryptApiKey(input.apiKey)

      const models: ModelConfig[] = (input.models || []).map((m) => ({
        id: generateId('model'),
        providerId: '',
        name: m.name,
        modelId: m.modelId,
        capabilities: m.capabilities as ModelCapability[],
        maxTokens: m.maxTokens,
        costPer1MTokens: m.costPer1MTokens,
        isActive: m.isActive,
      }))

      const provider = await this.repository.createProvider({
        provider: input.provider,
        name: input.name,
        baseUrl: input.baseUrl,
        apiKey: encryptedApiKey,
        isActive: input.isActive ?? false,
        models,
      })

      this.logger.info(`Created model provider: ${provider.name} (${provider.provider})`)
      
      if (provider.isActive) {
        await this.testConnection(provider.id)
      }

      return provider
    } catch (error) {
      this.logger.error('Failed to create model provider', error)
      throw error
    }
  }

  async getProvider(id: string): Promise<ModelProviderConfig | null> {
    return this.repository.getProvider(id)
  }

  async getAllProviders(): Promise<ModelProviderConfig[]> {
    return this.repository.getAllProviders()
  }

  async getActiveProviders(): Promise<ModelProviderConfig[]> {
    return this.repository.getActiveProviders()
  }

  async getProvidersByProvider(provider: string): Promise<ModelProviderConfig[]> {
    return this.repository.findByProvider(provider)
  }

  async updateProvider(id: string, input: ModelProviderUpdateInput): Promise<ModelProviderConfig> {
    try {
      const existing = await this.repository.getProvider(id)
      if (!existing) {
        throw new Error(`Model provider not found: ${id}`)
      }

      if (input.baseUrl) {
        try {
          new URL(input.baseUrl)
        } catch {
          throw new Error('Invalid base URL format')
        }
      }

      const updateData: Partial<ModelProviderConfig> = { ...input }
      if (input.apiKey) {
        updateData.apiKey = this.encryptApiKey(input.apiKey)
      }

      const updated = await this.repository.updateProvider(id, updateData)
      if (!updated) {
        throw new Error(`Model provider not found: ${id}`)
      }

      this.logger.info(`Updated model provider: ${id}`)

      if (input.isActive === true && !existing.isActive) {
        await this.testConnection(id)
      }

      return updated
    } catch (error) {
      this.logger.error(`Failed to update model provider: ${id}`, error)
      throw error
    }
  }

  async deleteProvider(id: string): Promise<void> {
    try {
      await this.repository.deleteProvider(id)
      this.logger.info(`Deleted model provider: ${id}`)
    } catch (error) {
      this.logger.error(`Failed to delete model provider: ${id}`, error)
      throw error
    }
  }

  async testConnection(id: string): Promise<boolean> {
    try {
      const provider = await this.repository.getProvider(id)
      if (!provider) {
        throw new Error(`Model provider not found: ${id}`)
      }

      const decryptedApiKey = this.decryptApiKey(provider.apiKey)
      
      const modelId = (provider.models ?? [])[0]?.modelId ?? ''
      const isValid = await this.validateProviderConnection(
        provider.provider,
        provider.baseUrl,
        decryptedApiKey,
        modelId
      )

      if (isValid) {
        await this.repository.updateProvider(id, { isActive: true })
        this.logger.info(`Connection test successful for provider: ${id}`)
      } else {
        await this.repository.updateProvider(id, { isActive: false })
        this.logger.warn(`Connection test failed for provider: ${id}`)
      }

      return isValid
    } catch (error) {
      this.logger.error(`Connection test error for provider: ${id}`, error)
      await this.repository.updateProvider(id, { isActive: false })
      return false
    }
  }

  private async validateProviderConnection(
    provider: string,
    baseUrl: string | null,
    apiKey: string,
    model: string
  ): Promise<boolean> {
    try {
      let url: string

      switch (provider.toLowerCase()) {
        case 'openai':
          url = baseUrl || 'https://api.openai.com/v1/models'
          break
        case 'anthropic':
          url = baseUrl || 'https://api.anthropic.com/v1/messages'
          break
        case 'google':
          url = baseUrl || 'https://generativelanguage.googleapis.com/v1beta/models'
          break
        case 'custom':
          if (!baseUrl) throw new Error('Base URL required for custom provider')
          url = baseUrl
          break
        default:
          throw new Error(`Unsupported provider: ${provider}`)
      }

      const response = await fetch(url, {
        method: provider.toLowerCase() === 'anthropic' ? 'POST' : 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        ...(provider.toLowerCase() === 'anthropic' ? { body: JSON.stringify({ model, max_tokens: 1, messages: [{ role: 'user', content: 'test' }] }) } : {}),
      })

      return response.ok
    } catch (error) {
      this.logger.error('Provider validation failed', error)
      return false
    }
  }

  private encryptApiKey(apiKey: string): string {
    return Buffer.from(apiKey).toString('base64')
  }

  private decryptApiKey(encryptedKey: string): string {
    return Buffer.from(encryptedKey, 'base64').toString('utf-8')
  }

  async getProviderForModel(model: string): Promise<ModelProviderConfig | null> {
    const providers = await this.getActiveProviders()
    return providers.find((p: ModelProviderConfig) => p.models.some((m: ModelConfig) => m.modelId === model)) || null
  }

  async getProviderStats(id: string): Promise<{
    config: ModelProviderConfig
    totalUsage: number
  }> {
    const config = await this.repository.getProvider(id)
    if (!config) {
      throw new Error(`Model provider not found: ${id}`)
    }

    return {
      config,
      totalUsage: 0,
    }
  }
}
