import { Router } from 'express'
import { asyncHandler, ModelProviderService } from '@ai-company/backend'
import { ModelProviderRepository } from '@ai-company/database'
import type { CreateModelProviderInput, UpdateModelProviderInput } from '@ai-company/shared'

const router = Router()
const providerRepo = new ModelProviderRepository()
const providerService = new ModelProviderService(providerRepo)

function stripApiKey(provider: any) {
  if (!provider) return provider
  const { apiKey, api_key, ...rest } = provider
  return rest
}

// Get all model providers
router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const providers = await providerService.getAllProviders()
    res.json((providers || []).map(stripApiKey))
  }),
)

// Get a specific model provider
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = req.params.id as string
    const provider = await providerService.getProvider(id)
    if (!provider) {
      res.status(404).json({ error: 'Provider not found' })
      return
    }
    res.json(stripApiKey(provider))
  }),
)

// Create a new model provider
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const input: CreateModelProviderInput = req.body
    const provider = await providerService.createProvider(input)
    res.status(201).json(stripApiKey(provider))
  }),
)

// Update a model provider
router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = req.params.id as string
    const input: UpdateModelProviderInput = req.body
    const provider = await providerService.updateProvider(id, input)
    if (!provider) {
      res.status(404).json({ error: 'Provider not found' })
      return
    }
    res.json(stripApiKey(provider))
  }),
)

// Delete a model provider
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = req.params.id as string
    const provider = await providerService.getProvider(id)
    if (!provider) {
      res.status(404).json({ error: 'Provider not found' })
      return
    }
    await providerService.deleteProvider(id)
    res.status(204).end()
  }),
)

// Test a model provider connection
router.post(
  '/:id/test',
  asyncHandler(async (req, res) => {
    const id = req.params.id as string
    const result = await providerService.testConnection(id)
    res.json({ success: result })
  }),
)

export const modelProvidersRouter = router
