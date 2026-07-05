import { ModelProviderConfig } from '@ai-company/shared'
import { ModelClient, OpenAIClient, AnthropicClient, GenericClient, MockClient } from './model-client.js'

export class ProviderFactory {
  static createClient(config: ModelProviderConfig): ModelClient {
    if (!config.apiKey) {
      console.warn(`[ProviderFactory] API key not configured for provider: ${config.name}. Using mock client.`)
      return new MockClient((config.models ?? [])[0]?.modelId ?? 'mock-model')
    }

    switch (config.provider) {
      case 'openai':
        return new OpenAIClient(
          config.apiKey,
          config.baseUrl,
          (config.models ?? [])[0]?.modelId ?? 'gpt-4o'
        )
      
      case 'anthropic':
        return new AnthropicClient(
          config.apiKey,
          config.baseUrl,
          (config.models ?? [])[0]?.modelId ?? 'claude-3-5-sonnet-20241022'
        )
      
      case 'google':
      case 'custom':
        return new GenericClient(
          config.apiKey,
          config.baseUrl,
          (config.models ?? [])[0]?.modelId ?? 'model'
        )
      
      default:
        throw new Error(`Unsupported provider type: ${config.provider}`)
    }
  }

  static validateProvider(config: Partial<ModelProviderConfig>): string[] {
    const errors: string[] = []

    if (!config.name) {
      errors.push('Provider name is required')
    }

    if (!config.provider) {
      errors.push('Provider type is required')
    }

    if (!config.baseUrl) {
      errors.push('Base URL is required')
    } else {
      try {
        new URL(config.baseUrl)
      } catch {
        errors.push('Invalid base URL format')
      }
    }

    // API key is optional; MockClient is used as fallback

    return errors
  }
}
