import { Router } from 'express'
import { ActivityRepository, getDatabase } from '@ai-company/database'

export const activitiesRouter = Router()

activitiesRouter.get('/', (req, res) => {
  const limit = Math.max(1, parseInt(req.query.limit as string, 10) || 50)
  const projectId = (req.query.projectId as string) || 'default'
  const repo = new ActivityRepository(getDatabase().getDb())
  const activities = repo.findByProject(projectId, limit)
  res.json(activities)
})

activitiesRouter.post('/', (req, res) => {
  const { projectId, agentId, type, title, description, metadata } = req.body
  if (!title || !type) {
    res.status(400).json({ error: 'title and type are required' })
    return
  }

  const repo = new ActivityRepository(getDatabase().getDb())
  const activity = repo.create({
    project_id: projectId || 'default',
    agent_id: agentId,
    type,
    title,
    description,
    metadata,
  })
  res.status(201).json(activity)
})
