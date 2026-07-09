import { Router, type Request, type Response } from 'express'
import { asyncHandler, validate } from '@ai-company/backend'
import { ChatMessageRepository, ProjectRepository, ModelProviderRepository } from '@ai-company/database'
import { ProviderFactory } from '@ai-company/backend'

let broadcastFn: ((data: unknown) => void) | null = null

export function setChatBroadcast(fn: (data: unknown) => void) {
  broadcastFn = fn
}

const chatRouter = Router()
const chatRepo = new ChatMessageRepository()
const projectRepo = new ProjectRepository()
const providerRepo = new ModelProviderRepository()

function getChatHistory(projectId?: string): { role: string; content: string }[] {
  const messages = projectId ? chatRepo.findByProjectId(projectId) : chatRepo.findAll(50, 0)
  return messages.map(m => ({ role: m.role, content: m.content }))
}

// Get messages (optional projectId query param)
chatRouter.get('/', (req: Request, res: Response) => {
  const projectId = req.query.projectId as string | undefined
  if (projectId) {
    const messages = chatRepo.findByProjectId(projectId)
    res.json(messages)
  } else {
    const messages = chatRepo.findAll(100, 0)
    res.json(messages)
  }
})

// Send a message
chatRouter.post('/', validate([
  { field: 'content', required: true, type: 'string', minLength: 1, maxLength: 10000 },
  { field: 'role', type: 'string' },
]), asyncHandler(async (req: Request, res: Response) => {
  const { content, role, projectId } = req.body as Record<string, string>

  if (projectId) {
    const project = projectRepo.findById(projectId)
    if (!project) {
      res.status(404).json({ error: 'Project not found' })
      return
    }
  }

  const userMsg = chatRepo.create({
    project_id: projectId || undefined,
    user_id: undefined,
    role: role || 'user',
    content,
    metadata: '{}',
  })

  if (broadcastFn) {
    broadcastFn({ type: 'chat:message', message: userMsg })
  }

  // Get active AI provider and generate response
  let aiContent = ''
  let modelName = 'mock-model'
  let providerName = 'mock'

  try {
    const activeProviders = providerRepo.getActiveProviders()
    const provider = activeProviders.length > 0 ? activeProviders[0] : null

    if (provider) {
      const client = ProviderFactory.createClient(provider)
      modelName = provider.models.length > 0 ? provider.models[0].modelId : 'gpt-4o'
      providerName = provider.provider
      const history = getChatHistory(projectId)
      const response = await client.chat({
        messages: [...history.map(m => ({ role: m.role as 'system' | 'user' | 'assistant', content: m.content })), { role: 'user', content }],
        temperature: 0.7,
        maxTokens: 2048,
      })
      aiContent = response.content
    } else {
      // No providers configured - use mock
      const mockClient = ProviderFactory.createClient({
        id: 'mock',
        name: 'Mock AI',
        provider: 'openai',
        baseUrl: 'https://api.openai.com/v1',
        apiKey: '',
        models: [],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      const response = await mockClient.chat({
        messages: [{ role: 'user', content }],
        temperature: 0.7,
        maxTokens: 2048,
      })
      aiContent = response.content
    }
  } catch (err: any) {
    aiContent = `I encountered an error processing your request: ${err.message}`
  }

  const assistantMsg = chatRepo.create({
    project_id: projectId || undefined,
    user_id: undefined,
    role: 'assistant',
    content: aiContent,
    metadata: JSON.stringify({ model: modelName, provider: providerName }),
  })

  if (broadcastFn) {
    broadcastFn({ type: 'chat:message', message: assistantMsg })
  }

  res.status(201).json({ userMessage: userMsg, assistantMessage: assistantMsg })
}))

// Clear chat for a project
chatRouter.delete('/', (req: Request, res: Response) => {
  const projectId = req.query.projectId as string | undefined
  if (projectId) {
    chatRepo.deleteByProjectId(projectId)
  }
  res.json({ status: 'cleared' })
})

export { chatRouter }
