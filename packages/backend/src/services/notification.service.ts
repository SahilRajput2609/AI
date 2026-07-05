import type { Notification } from '@ai-company/shared'
import { NotificationRepository } from '@ai-company/database'

export class NotificationService {
  private notificationRepo: NotificationRepository
  private broadcastFn?: (data: unknown) => void

  constructor() {
    this.notificationRepo = new NotificationRepository()
  }

  setBroadcastFunction(fn: (data: unknown) => void) {
    this.broadcastFn = fn
  }

  async createNotification(data: {
    type: 'success' | 'error' | 'warning' | 'info'
    title: string
    message: string
    metadata?: Record<string, unknown>
  }): Promise<Notification> {
    const notification = await this.notificationRepo.create({
      type: data.type,
      title: data.title,
      message: data.message,
      isRead: false,
      metadata: data.metadata || {}
    })

    if (this.broadcastFn) {
      this.broadcastFn({
        type: 'notification',
        data: notification
      })
    }

    return notification
  }

  async getNotification(id: string): Promise<Notification | null> {
    return this.notificationRepo.findById(id)
  }

  async listNotifications(filters?: {
    read?: boolean
    type?: 'success' | 'error' | 'warning' | 'info'
  }): Promise<Notification[]> {
    return this.notificationRepo.findAll({
      isRead: filters?.read,
      type: filters?.type,
    })
  }

  async markAsRead(id: string): Promise<Notification | null> {
    return this.notificationRepo.update(id, { read: true, timestamp: new Date() })
  }

  async markAllAsRead(): Promise<void> {
    const notifications = await this.notificationRepo.findAll()
    const unread = notifications.filter(n => !n.read)
    await Promise.all(
      unread.map(n => this.notificationRepo.update(n.id, { read: true, timestamp: new Date() }))
    )
  }

  async deleteNotification(id: string): Promise<boolean> {
    return this.notificationRepo.delete(id)
  }

  async deleteAllRead(): Promise<void> {
    const notifications = await this.notificationRepo.findAll()
    const read = notifications.filter(n => n.read)
    await Promise.all(read.map(n => this.notificationRepo.delete(n.id)))
  }
}
