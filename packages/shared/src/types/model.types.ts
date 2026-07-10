import type { ModelProvider } from './index.js'

export type { ModelProvider }

export enum ModelProviderStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ERROR = 'error',
}

export interface Model {
  id: string
  name: string
  provider: string
  modelId: string
  capabilities: string[]
  maxTokens: number
  costPer1MTokens: number
  isActive: boolean
  config?: Record<string, unknown>
  updatedAt?: Date
}

export type ModelCapability = 'chat' | 'code' | 'reasoning' | 'analysis' | 'multimodal' | 'function-calling'

export interface ModelProviderConfig {
  id: string
  provider: ModelProvider
  name: string
  baseUrl: string
  apiKey: string
  isActive: boolean
  models: ModelConfig[]
  createdAt: Date
  updatedAt: Date
}

export interface ModelConfig {
  id: string
  providerId: string
  name: string
  modelId: string
  capabilities: ModelCapability[]
  maxTokens: number
  costPer1MTokens: number
  isActive: boolean
  metadata?: {
    contextWindow?: number
    description?: string
    version?: string
    [key: string]: any
  }
}

export interface CreateModelProviderInput {
  provider: ModelProvider
  name: string
  baseUrl: string
  apiKey: string
  isActive?: boolean
  models?: Omit<ModelConfig, 'id' | 'providerId'>[]
}

export interface UpdateModelProviderInput {
  name?: string
  baseUrl?: string
  apiKey?: string
  isActive?: boolean
}

export interface ModelProviderResponse {
  id: string
  provider: ModelProvider
  name: string
  baseUrl: string
  apiKeyPreview: string // Last 4 characters only
  isActive: boolean
  models: ModelConfig[]
  createdAt: string
  updatedAt: string
}

export interface ModelRequest {
  messages: ChatMessage[]
  temperature?: number
  maxTokens?: number
  stream?: boolean
}

export interface ModelResponse {
  id: string
  content: string
  model: string
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  finishReason: string
  createdAt: Date
}

export interface ChatCompletionRequest {
  providerId: string
  modelId: string
  messages: ChatMessage[]
  temperature?: number
  maxTokens?: number
  stream?: boolean
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ChatCompletionResponse {
  id: string
  model: string
  choices: {
    message: ChatMessage
    finishReason: string
  }[]
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}
