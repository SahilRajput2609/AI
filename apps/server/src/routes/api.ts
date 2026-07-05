import { Router } from 'express'
import { asyncHandler } from '@ai-company/backend'
import { AgentManager, AgentRole } from '../agent-manager.js'
import { modelProvidersRouter } from './model-providers.js'
import { agentConfigsRouter } from './agent-configs.js'
import { filesRouter } from './files.js'
import { activitiesRouter } from './activities.js'

const agentManager = new AgentManager()
const owner = agentManager.getOwner()
const planner = agentManager.getPlanner()

let broadcastFn: ((data: unknown) => void) | null = null

export function setBroadcast(fn: (data: unknown) => void) {
  broadcastFn = fn
}

function broadcast(data: unknown) {
  if (broadcastFn) broadcastFn(data)
}

export const apiRouter = Router()

apiRouter.use('/model-providers', modelProvidersRouter)
apiRouter.use('/agent-configs', agentConfigsRouter)
apiRouter.use('/files', filesRouter)
apiRouter.use('/activities', activitiesRouter)

apiRouter.get('/status', (_req, res) => {
  const agents = agentManager.listAgents()
  res.json({
    status: 'running',
    agents: agents.map(a => a.name),
    agentCount: agents.length,
    uptime: process.uptime(),
  })
})

// ---- Task routes (Owner) ----
apiRouter.get('/tasks', (_req, res) => {
  const state = owner.getService().getState()
  res.json(state.tasks)
})

apiRouter.post('/tasks', (req, res) => {
  const { title, description, priority, category, assignedRole } = req.body
  if (!title) {
    res.status(400).json({ error: 'title is required' })
    return
  }

  const task = owner.createAndSubmitTask(
    title,
    description || '',
    priority || 'medium',
    category || 'general'
  )

  if (assignedRole) {
    const orchService = agentManager.getOrchestratorService()
    orchService.queueTask({
      id: task.id,
      description: task.description,
      status: 'pending',
      dependencies: [],
      assignedAgent: assignedRole,
    })
    orchService.trackDependencies()
    broadcast({ type: 'task:queued', taskId: task.id, agent: assignedRole })
  }

  broadcast({ type: 'task:created', task })
  res.status(201).json(task)
})

apiRouter.get('/tasks/:id', (req, res) => {
  const task = owner.getService().getTask(req.params.id)
  if (!task) {
    res.status(404).json({ error: 'task not found' })
    return
  }
  res.json(task)
})

apiRouter.post('/tasks/:id/review', (req, res) => {
  const { approved, feedback } = req.body
  if (typeof approved !== 'boolean') {
    res.status(400).json({ error: 'approved is required and must be a boolean' })
    return
  }
  if (approved) {
    owner.approveTask(req.params.id, feedback)
  } else {
    owner.rejectTask(req.params.id, feedback || 'No feedback provided')
  }
  broadcast({ type: 'task:reviewed', taskId: req.params.id, approved })
  res.json({ status: 'ok' })
})

// ---- Plan routes (Planner) ----
apiRouter.get('/plans', (_req, res) => {
  const state = planner.getService().getState()
  res.json(state.plans)
})

apiRouter.post('/plans', (req, res) => {
  const { taskId, title } = req.body
  if (!taskId || !title) {
    res.status(400).json({ error: 'taskId and title are required' })
    return
  }

  const plan = planner.createExecutionPlan(taskId, title)
  broadcast({ type: 'plan:created', plan })
  res.status(201).json(plan)
})

apiRouter.post('/plans/:id/subtasks', (req, res) => {
  const { description, estimatedEffort, assignedRole, dependencies } = req.body
  if (!description || !assignedRole) {
    res.status(400).json({ error: 'description and assignedRole are required' })
    return
  }

  const subTask = planner.addTask(
    req.params.id,
    description,
    estimatedEffort || 'medium',
    assignedRole,
    dependencies || []
  )
  if (!subTask) {
    res.status(404).json({ error: 'plan not found' })
    return
  }

  res.status(201).json(subTask)
})

apiRouter.post('/plans/:id/finalize', (req, res) => {
  planner.finalizePlan(req.params.id)

  const plan = planner.getPlan(req.params.id)
  if (plan) {
    const orchService = agentManager.getOrchestratorService()
    for (const sub of plan.subtasks) {
      orchService.queueTask({
        id: `sub-${plan.id}-${sub.id}`,
        description: sub.description,
        status: 'pending',
        dependencies: sub.dependencies,
        assignedAgent: sub.assignedRole,
      })
    }
    orchService.trackDependencies()
    broadcast({ type: 'plan:dispatched', planId: req.params.id, subtaskCount: plan.subtasks.length })
  }

  broadcast({ type: 'plan:finalized', planId: req.params.id })
  res.json({ status: 'ok' })
})

// ---- Orchestrator routes ----
apiRouter.get('/orchestrator/state', (_req, res) => {
  const state = agentManager.getQueueState()
  res.json(state)
})

apiRouter.post('/orchestrator/dispatch', asyncHandler(async (_req, res) => {
  await agentManager.dispatchFromQueue()
  const state = agentManager.getQueueState()
  broadcast({ type: 'orchestrator:dispatched', state })
  res.json(state)
}))

// ---- Dispatch routes (assign tasks to specific agents) ----
apiRouter.post('/dispatch/:agentRole', (req, res) => {
  const { agentRole } = req.params
  const { action, ...payload } = req.body

  if (!action) {
    res.status(400).json({ error: 'action is required' })
    return
  }

  try {
    const result = agentManager.dispatch(agentRole as AgentRole, action as any, payload)
    broadcast({ type: 'agent:dispatched', agentRole, action })
    res.json({ success: true, result })
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

// ---- Agent status routes ----
apiRouter.get('/agents', (_req, res) => {
  res.json(agentManager.listAgents())
})

apiRouter.get('/agents/:role', (req, res) => {
  const info = agentManager.getAgentInfo(req.params.role as AgentRole)
  if (!info) {
    res.status(404).json({ error: `Agent '${req.params.role}' not found` })
    return
  }

  const instance = info.instance as any
  const state = instance.service?.getState?.()
  res.json({
    id: info.id,
    role: info.role,
    name: info.name,
    capabilities: info.capabilities,
    isActive: !!(instance.service),
    state: state || {},
  })
})
