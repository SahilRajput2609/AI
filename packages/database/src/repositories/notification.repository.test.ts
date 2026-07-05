import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import Database from 'better-sqlite3'
import { NotificationRepository } from './notification.repository.js'

describe('NotificationRepository', () => {
  let db: Database.Database
  let repo: NotificationRepository

  beforeAll(() => {
    db = new Database(':memory:')
    db.exec(`
      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL DEFAULT '',
        is_read INTEGER NOT NULL DEFAULT 0,
        timestamp INTEGER NOT NULL
      )
    `)
    repo = new NotificationRepository(db)
  })

  afterAll(() => {
    db.close()
  })

  beforeEach(() => {
    db.prepare('DELETE FROM notifications').run()
  })

  it('creates a notification', async () => {
    const notification = await repo.create({
      type: 'info',
      title: 'Test Notification',
      message: 'This is a test',
      isRead: false,
      metadata: {},
    })

    expect(notification.id).toBeTruthy()
    expect(notification.title).toBe('Test Notification')
    expect(notification.read).toBe(false)
    expect(notification.timestamp).toBeInstanceOf(Date)
  })

  it('finds notification by id', async () => {
    const created = await repo.create({
      type: 'success',
      title: 'Success!',
      message: 'Operation completed',
      isRead: false,
      metadata: {},
    })

    const found = await repo.findById(created.id)
    expect(found).not.toBeNull()
    expect(found!.title).toBe('Success!')
  })

  it('finds all notifications sorted by timestamp desc', async () => {
    await repo.create({ type: 'info', title: 'First', message: '', isRead: false, metadata: {} })
    await repo.create({ type: 'info', title: 'Second', message: '', isRead: false, metadata: {} })

    const all = await repo.findAll()
    expect(all.length).toBe(2)
  })

  it('filters by read status', async () => {
    await repo.create({ type: 'warning', title: 'Unread', message: '', isRead: false, metadata: {} })
    await repo.create({ type: 'error', title: 'Read', message: '', isRead: true, metadata: {} })

    const unread = await repo.findAll({ isRead: false })
    expect(unread.length).toBe(1)
    expect(unread[0].title).toBe('Unread')
  })

  it('filters by type', async () => {
    await repo.create({ type: 'warning', title: 'Filter By Type', message: '', isRead: false, metadata: {} })

    const result = await repo.findAll({ type: 'warning', isRead: false })
    expect(result.length).toBe(1)
  })

  it('updates a notification', async () => {
    const notification = await repo.create({
      type: 'info',
      title: 'Mark Read',
      message: '',
      isRead: false,
      metadata: {},
    })

    const updated = await repo.update(notification.id, { read: true })
    expect(updated!.read).toBe(true)
  })

  it('deletes a notification', async () => {
    const notification = await repo.create({
      type: 'info',
      title: 'Delete Me',
      message: '',
      isRead: false,
      metadata: {},
    })

    expect(await repo.delete(notification.id)).toBe(true)
    expect(await repo.findById(notification.id)).toBeNull()
  })
})
