import { Router } from 'express'
import { AgentConfigRepository, getDatabase } from '@ai-company/database'

const ALL_ROLES = [
  'owner', 'planner', 'orchestrator', 'api', 'backend', 'database',
  'debugger', 'devops', 'documentation', 'frontend', 'qa', 'reviewer',
]

export const agentConfigsRouter = Router()

agentConfigsRouter.get('/', (_req, res) => {
  const repo = new AgentConfigRepository(getDatabase().getDb())
  const configs = repo.findAll()
  res.json(configs)
})

agentConfigsRouter.get('/defaults', (_req, res) => {
  res.json(
    ALL_ROLES.map(role => ({
      role,
      name: role.charAt(0).toUpperCase() + role.slice(1),
      api_key: '',
      base_url: '',
      model: '',
      temperature: 0.7,
      max_tokens: 4096,
      is_active: true,
    }))
  )
})

agentConfigsRouter.put('/:role', (req, res) => {
  const { role } = req.params
  if (!ALL_ROLES.includes(role)) {
    res.status(400).json({ error: `Invalid role '${role}'. Must be one of: ${ALL_ROLES.join(', ')}` })
    return
  }

  const { name, api_key, base_url, model, temperature, max_tokens, is_active, metadata } = req.body

  if (!name) {
    res.status(400).json({ error: 'name is required' })
    return
  }

  const repo = new AgentConfigRepository(getDatabase().getDb())
  const config = repo.upsert({
    role,
    name,
    api_key,
    base_url,
    model,
    temperature,
    max_tokens,
    is_active,
    metadata,
  })

  res.json(config)
})

agentConfigsRouter.get('/:role', (req, res) => {
  const repo = new AgentConfigRepository(getDatabase().getDb())
  const config = repo.findByRole(req.params.role)
  if (!config) {
    res.status(404).json({ error: `No config found for role '${req.params.role}'` })
    return
  }
  res.json(config)
})

agentConfigsRouter.delete('/:role', (req, res) => {
  const repo = new AgentConfigRepository(getDatabase().getDb())
  const deleted = repo.delete(req.params.role)
  if (!deleted) {
    res.status(404).json({ error: `No config found for role '${req.params.role}'` })
    return
  }
  res.json({ status: 'deleted' })
})
