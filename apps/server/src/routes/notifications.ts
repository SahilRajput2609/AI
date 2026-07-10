import { Router, type Request, type Response } from 'express'
import { asyncHandler, validate } from '@ai-company/backend'
import { NotificationRepository } from '@ai-company/database'

const notificationsRouter = Router()
const notificationRepo = new NotificationRepository()

let broadcastFn: ((data: unknown) => void) | null = null

export function setNotificationBroadcast(fn: (data: unknown) => void) {
  broadcastFn = fn
}

// List notifications for a user (query: ?userId=xxx)
notificationsRouter.get('/', (req: Request, res: Response) => {
  const userId = req.query.userId as string | undefined
  const projectId = req.query.projectId as string | undefined
  const limit = parseInt(req.query.limit as string) || 50
  if (userId) {
    const notifications = notificationRepo.findByUser(userId, limit)
    res.json(notifications)
  } else if (projectId) {
    const notifications = notificationRepo.findByProject(projectId, limit)
    res.json(notifications)
  } else {
    res.status(400).json({ error: 'Missing userId or projectId query parameter' })
  }
})

// Get a single notification
notificationsRouter.get('/:id', (req: Request, res: Response) => {
  const notification = notificationRepo.findById(req.params.id as string)
  if (!notification) {
    res.status(404).json({ error: 'Notification not found' })
    return
  }
  res.json(notification)
})

// Create a notification
notificationsRouter.post(
  '/',
  validate([
    { field: 'title', required: true, type: 'string', minLength: 1, maxLength: 200 },
    { field: 'message', type: 'string', maxLength: 2000 },
  ]),
  (req: Request, res: Response) => {
    const { title, message, type, userId, projectId } = req.body as Record<string, string>
    const notification = notificationRepo.create({
      title,
      message: message || '',
      type: type || 'info',
      user_id: userId || undefined,
      project_id: projectId || undefined,
      is_read: false,
    })
    res.status(201).json(notification)
  },
)

// Broadcast notification to all connected WebSocket clients
notificationsRouter.post(
  '/broadcast',
  validate([{ field: 'message', required: true, type: 'string', minLength: 1, maxLength: 2000 }]),
  (req: Request, res: Response) => {
    const { message, type = 'info', title } = req.body as Record<string, string>

    const broadcastData = {
      event: 'notification',
      type,
      message,
      title: title || 'Notification',
    }

    if (broadcastFn) {
      broadcastFn(broadcastData)
      res.json({ success: true, message: 'Notification broadcast to all clients' })
    } else {
      res.status(500).json({ error: 'Broadcast function not initialized' })
    }
  },
)

// Mark as read
notificationsRouter.put('/:id/read', (req: Request, res: Response) => {
  const updated = notificationRepo.update(req.params.id as string, { is_read: true })
  if (!updated) {
    res.status(404).json({ error: 'Notification not found' })
    return
  }
  res.json(updated)
})

// Mark all as read for a user
notificationsRouter.put('/read-all', (req: Request, res: Response) => {
  const { userId, projectId } = req.body as Record<string, string>
  if (userId) {
    notificationRepo.markAllRead(userId)
  } else if (projectId) {
    res.status(400).json({ error: 'userId is required' })
    return
  }
  res.json({ status: 'all marked read' })
})

// Delete a notification
notificationsRouter.delete('/:id', (req: Request, res: Response) => {
  const deleted = notificationRepo.delete(req.params.id as string)
  if (!deleted) {
    res.status(404).json({ error: 'Notification not found' })
    return
  }
  res.json({ status: 'deleted' })
})

export { notificationsRouter }
