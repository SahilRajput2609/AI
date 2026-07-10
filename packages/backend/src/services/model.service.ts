import type { AIModel } from '@ai-company/shared'
import type { ModelEntity } from '@ai-company/database'
import { ModelRepository } from '@ai-company/database'

export class ModelService {
  private modelRepo: ModelRepository

  constructor() {
    this.modelRepo = new ModelRepository()
  }

  async createModel(data: {
    name: string
    provider: string
    modelId: string
    capabilities: string[]
    maxTokens: number
    costPer1MTokens: number
  }): Promise<ModelEntity> {
    const model = await this.modelRepo.create({
      ...data,
      isActive: false,
      config: {},
    })
    return model
  }

  async getModel(id: string): Promise<ModelEntity | null> {
    return this.modelRepo.findById(id)
  }

  async updateModel(id: string, updates: Partial<ModelEntity>): Promise<ModelEntity | null> {
    return this.modelRepo.update(id, updates)
  }

  async deleteModel(id: string): Promise<boolean> {
    return this.modelRepo.delete(id)
  }

  async listModels(filters?: { provider?: string; isActive?: boolean }): Promise<ModelEntity[]> {
    return this.modelRepo.findAll(filters)
  }

  async getActiveModels(): Promise<ModelEntity[]> {
    return this.modelRepo.findAll({ isActive: true })
  }

  async getModelByProvider(provider: string): Promise<ModelEntity[]> {
    return this.modelRepo.findAll({ provider })
  }

  async activateModel(id: string): Promise<ModelEntity | null> {
    return this.modelRepo.update(id, { isActive: true })
  }

  async deactivateModel(id: string): Promise<ModelEntity | null> {
    return this.modelRepo.update(id, { isActive: false })
  }
}
