import type Database from 'better-sqlite3'
import { getDatabase } from '../database.js'
import { generateId } from '@ai-company/shared'
import { Notification } from '@ai-company/shared'

export class NotificationRepository {
  constructor(private db: Database.Database = getDatabase().getDb()) {}

  create(data: {
    type: 'success' | 'error' | 'warning' | 'info'
    title: string
    message: string
    isRead: boolean
    metadata: Record<string, unknown>
  }): Notification {
    const id = generateId('notification')
    const now = Date.now()
    const notification: Notification = {
      id,
      type: data.type,
      title: data.title,
      message: data.message,
      read: data.isRead,
      timestamp: new Date(now),
    }

    const stmt = this.db.prepare(`
      INSERT INTO notifications (id, type, title, message, is_read, timestamp)
      VALUES (?, ?, ?, ?, ?, ?)
    `)

    stmt.run(
      notification.id,
      notification.type,
      notification.title,
      notification.message,
      notification.read ? 1 : 0,
      now
    )

    return notification
  }

  findById(id: string): Notification | null {
    const stmt = this.db.prepare('SELECT * FROM notifications WHERE id = ?')
    const row = stmt.get(id) as any
    if (!row) return null
    return this.mapRowToNotification(row)
  }

  findAll(filters?: { isRead?: boolean; type?: string }): Notification[] {
    let query = 'SELECT * FROM notifications WHERE 1=1'
    const params: unknown[] = []

    if (filters?.isRead !== undefined) {
      query += ' AND is_read = ?'
      params.push(filters.isRead ? 1 : 0)
    }
    if (filters?.type) {
      query += ' AND type = ?'
      params.push(filters.type)
    }

    query += ' ORDER BY timestamp DESC'
    const stmt = this.db.prepare(query)
    const rows = stmt.all(...params) as any[]
    return rows.map(row => this.mapRowToNotification(row))
  }

  update(id: string, data: Partial<Notification>): Notification | null {
    const existing = this.findById(id)
    if (!existing) return null

    const updated: Notification = { ...existing, ...data }

    const stmt = this.db.prepare(`
      UPDATE notifications
      SET type = ?, title = ?, message = ?, is_read = ?
      WHERE id = ?
    `)

    stmt.run(
      updated.type,
      updated.title,
      updated.message,
      updated.read ? 1 : 0,
      id
    )

    return updated
  }

  delete(id: string): boolean {
    const stmt = this.db.prepare('DELETE FROM notifications WHERE id = ?')
    const result = stmt.run(id)
    return result.changes > 0
  }

  private mapRowToNotification(row: any): Notification {
    return {
      id: row.id,
      type: row.type,
      title: row.title,
      message: row.message || '',
      read: row.is_read === 1,
      timestamp: new Date(row.timestamp),
    }
  }
}
