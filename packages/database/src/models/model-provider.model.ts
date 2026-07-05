import { ModelProvider, ModelProviderConfig, ModelConfig } from '@ai-company/shared'

export interface ModelProviderEntity {
  id: string
  provider: ModelProvider
  name: string
  baseUrl: string
  apiKey: string
  isActive: boolean
  models: string // JSON stringified ModelConfig[]
  createdAt: Date
  updatedAt: Date
}

export class ModelProviderModel {
  static toEntity(config: ModelProviderConfig): ModelProviderEntity {
    return {
      id: config.id,
      provider: config.provider,
      name: config.name,
      baseUrl: config.baseUrl,
      apiKey: config.apiKey,
      isActive: config.isActive,
      models: JSON.stringify(config.models),
      createdAt: config.createdAt,
      updatedAt: config.updatedAt
    }
  }

  static fromEntity(entity: ModelProviderEntity): ModelProviderConfig {
    return {
      id: entity.id,
      provider: entity.provider,
      name: entity.name,
      baseUrl: entity.baseUrl,
      apiKey: entity.apiKey,
      isActive: entity.isActive,
      models: JSON.parse(entity.models) as ModelConfig[],
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt
    }
  }

  static maskApiKey(apiKey: string): string {
    if (apiKey.length <= 4) return '****'
    return '...' + apiKey.slice(-4)
  }
}
