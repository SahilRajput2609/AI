import { describe, it, expect } from 'vitest'
import { ProviderFactory } from './provider-factory.js'
import { OpenAIClient, AnthropicClient, GenericClient, MockClient } from './model-client.js'

describe('ProviderFactory', () => {
  describe('createClient', () => {
    it('creates OpenAI client', () => {
      const client = ProviderFactory.createClient({
        id: '',
        provider: 'openai',
        name: 'OpenAI',
        baseUrl: 'https://api.openai.com',
        apiKey: 'sk-test',
        isActive: true,
        models: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      expect(client).toBeInstanceOf(OpenAIClient)
    })

    it('creates Anthropic client', () => {
      const client = ProviderFactory.createClient({
        id: '',
        provider: 'anthropic',
        name: 'Anthropic',
        baseUrl: 'https://api.anthropic.com',
        apiKey: 'sk-test',
        isActive: true,
        models: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      expect(client).toBeInstanceOf(AnthropicClient)
    })

    it('creates Generic client for google type', () => {
      const client = ProviderFactory.createClient({
        id: '',
        provider: 'google',
        name: 'Google',
        baseUrl: 'https://generativelanguage.googleapis.com',
        apiKey: 'google-key',
        isActive: true,
        models: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      expect(client).toBeInstanceOf(GenericClient)
    })

    it('creates Generic client for custom type', () => {
      const client = ProviderFactory.createClient({
        id: '',
        provider: 'custom',
        name: 'Custom',
        baseUrl: 'https://custom.api.com',
        apiKey: 'custom-key',
        isActive: true,
        models: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      expect(client).toBeInstanceOf(GenericClient)
    })

    it('creates MockClient when API key is missing', () => {
      const client = ProviderFactory.createClient({
        id: '',
        provider: 'openai',
        name: 'OpenAI',
        baseUrl: 'https://api.openai.com',
        apiKey: '',
        isActive: false,
        models: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      expect(client).toBeInstanceOf(MockClient)
    })

    it('throws for unsupported type', () => {
      expect(() =>
        ProviderFactory.createClient({
          id: '',
          provider: 'unknown' as any,
          name: 'Unknown',
          baseUrl: 'https://example.com',
          apiKey: 'key',
          isActive: true,
          models: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      ).toThrow('Unsupported provider type')
    })
  })

  describe('validateProvider', () => {
    it('returns empty array for valid provider', () => {
      const errors = ProviderFactory.validateProvider({
        name: 'OpenAI',
        provider: 'openai',
        baseUrl: 'https://api.openai.com',
        apiKey: 'sk-test',
      })
      expect(errors).toEqual([])
    })

    it('returns errors for missing fields', () => {
      const errors = ProviderFactory.validateProvider({} as any)
      expect(errors).toContain('Provider name is required')
      expect(errors).toContain('Provider type is required')
      expect(errors).toContain('Base URL is required')
    })

    it('detects invalid base URL', () => {
      const errors = ProviderFactory.validateProvider({
        name: 'Test',
        provider: 'openai',
        baseUrl: 'not-a-url',
        apiKey: 'key',
      })
      expect(errors).toContain('Invalid base URL format')
    })
  })
})
