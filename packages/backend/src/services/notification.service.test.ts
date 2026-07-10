import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NotificationService } from './notification.service.js'

const mockRepo = {
  create: vi.fn(),
  findById: vi.fn(),
  findAll: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
}

vi.mock('@ai-company/database', () => ({
  NotificationRepository: vi.fn(() => mockRepo),
}))

describe('NotificationService', () => {
  let service: NotificationService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new NotificationService()
  })

  it('creates a notification', async () => {
    const notif = { id: 'notif-1', type: 'info', title: 'Test', message: 'Hello', read: false, timestamp: new Date() }
    mockRepo.create.mockResolvedValue(notif)

    const result = await service.createNotification({ type: 'info', title: 'Test', message: 'Hello' })
    expect(result).toEqual(notif)
  })

  it('broadcasts notification when broadcast function is set', async () => {
    const broadcastFn = vi.fn()
    service.setBroadcastFunction(broadcastFn)

    const notif = {
      id: 'notif-1',
      type: 'warning',
      title: 'Alert',
      message: 'Warning!',
      read: false,
      timestamp: new Date(),
    }
    mockRepo.create.mockResolvedValue(notif)

    await service.createNotification({ type: 'warning', title: 'Alert', message: 'Warning!' })
    expect(broadcastFn).toHaveBeenCalledWith({ type: 'notification', data: notif })
  })

  it('does not broadcast when no function set', async () => {
    mockRepo.create.mockResolvedValue({
      id: 'notif-1',
      type: 'info',
      title: 'Test',
      message: '',
      read: false,
      timestamp: new Date(),
    })

    const result = await service.createNotification({ type: 'info', title: 'Test', message: '' })
    expect(result).toBeTruthy()
  })

  it('gets notification by id', async () => {
    mockRepo.findById.mockResolvedValue({ id: 'notif-1' })
    const result = await service.getNotification('notif-1')
    expect(result?.id).toBe('notif-1')
  })

  it('lists notifications with filters', async () => {
    mockRepo.findAll.mockResolvedValue([])
    await service.listNotifications({ read: false, type: 'info' })
    expect(mockRepo.findAll).toHaveBeenCalledWith({ isRead: false, type: 'info' })
  })

  it('marks notification as read', async () => {
    mockRepo.update.mockResolvedValue({ id: 'notif-1', read: true })
    await service.markAsRead('notif-1')
    expect(mockRepo.update).toHaveBeenCalledWith('notif-1', { read: true, timestamp: expect.any(Date) })
  })

  it('marks all notifications as read', async () => {
    mockRepo.findAll.mockResolvedValue([
      { id: 'n1', read: false },
      { id: 'n2', read: false },
    ])
    mockRepo.update.mockResolvedValue({})

    await service.markAllAsRead()
    expect(mockRepo.update).toHaveBeenCalledTimes(2)
  })

  it('deletes a notification', async () => {
    mockRepo.delete.mockResolvedValue(true)
    expect(await service.deleteNotification('notif-1')).toBe(true)
  })

  it('deletes all read notifications', async () => {
    mockRepo.findAll.mockResolvedValue([
      { id: 'n1', read: true },
      { id: 'n2', read: true },
    ])
    mockRepo.delete.mockResolvedValue(true)

    await service.deleteAllRead()
    expect(mockRepo.delete).toHaveBeenCalledTimes(2)
  })
})
