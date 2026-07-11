import { Router } from 'express'
import { asyncHandler, ModelService, ModelProviderService } from '@ai-company/backend'
import { ModelProviderRepository, type ModelEntity } from '@ai-company/database'

const router = Router()
const modelService = new ModelService()
const providerRepo = new ModelProviderRepository()
const providerService = new ModelProviderService(providerRepo)

// Helper to format model response
function formatModel(model: ModelEntity) {
  return {
    id: model.id,
    name: model.name,
    provider: model.provider,
    modelId: model.modelId,
    capabilities: (model.capabilities as string[]) || [],
    maxTokens: model.maxTokens || 4096,
    costPer1MTokens: model.costPer1MTokens || 0,
    isActive: model.isActive || false,
  }
}

// Get all available models with their providers
router.get(
  '/',
  asyncHandler(async (_req, res) => {
    try {
      const models = await modelService.listModels()
      res.json((models as ModelEntity[]).map(formatModel))
    } catch (error: any) {
      console.error('Error fetching models:', error)
      res.status(500).json({ error: 'Failed to fetch models', details: error.message })
    }
  }),
)

// Get a specific model
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    try {
      const model = await modelService.getModel(req.params.id)
      if (!model) {
        res.status(404).json({ error: 'Model not found' })
        return
      }
      res.json(formatModel(model as ModelEntity))
    } catch (error: any) {
      console.error('Error fetching model:', error)
      res.status(500).json({ error: 'Failed to fetch model', details: error.message })
    }
  }),
)

// Get models by provider
router.get(
  '/provider/:provider',
  asyncHandler(async (req, res) => {
    try {
      const models = await modelService.getModelByProvider(req.params.provider)
      res.json((models as ModelEntity[]).map(formatModel))
    } catch (error: any) {
      console.error('Error fetching models by provider:', error)
      res.status(500).json({ error: 'Failed to fetch models', details: error.message })
    }
  }),
)

// Get active models
router.get(
  '/active/list',
  asyncHandler(async (_req, res) => {
    try {
      const models = await modelService.getActiveModels()
      res.json((models as ModelEntity[]).map(formatModel))
    } catch (error: any) {
      console.error('Error fetching active models:', error)
      res.status(500).json({ error: 'Failed to fetch active models', details: error.message })
    }
  }),
)

export const modelsRouter = router
