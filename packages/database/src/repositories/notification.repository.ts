import type Database from 'better-sqlite3'
import { getDatabase } from '../database.js'
import { generateId } from '@ai-company/shared'
import type { Notification } from '@ai-company/shared'

export class NotificationRepository {
  constructor(private db: Database.Database = getDatabase().getDb()) {}

  create(data: {
    type: 'success' | 'error' | 'warning' | 'info' | string
    title: string
    message: string
    isRead?: boolean
    is_read?: boolean
    user_id?: string
    project_id?: string
    metadata?: Record<string, unknown>
  }): Notification {
    const id = generateId('notification')
    const now = Date.now()
    const isRead = data.isRead !== undefined ? data.isRead : data.is_read !== undefined ? data.is_read : false
    const notification: Notification = {
      id,
      type: data.type as any,
      title: data.title,
      message: data.message,
      read: isRead,
      timestamp: new Date(now),
      userId: data.user_id,
      projectId: data.project_id,
    }

    const stmt = this.db.prepare(`
      INSERT INTO notifications (id, type, title, message, is_read, timestamp, user_id, project_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)

    stmt.run(
      notification.id,
      notification.type,
      notification.title,
      notification.message,
      notification.read ? 1 : 0,
      now,
      notification.userId || null,
      notification.projectId || null,
    )

    return notification
  }

  findById(id: string): Notification | null {
    const stmt = this.db.prepare('SELECT * FROM notifications WHERE id = ?')
    const row = stmt.get(id) as any
    if (!row) return null
    return this.mapRowToNotification(row)
  }

  findByUser(userId: string, limit = 50): Notification[] {
    const stmt = this.db.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY timestamp DESC LIMIT ?')
    const rows = stmt.all(userId, limit) as any[]
    return rows.map((row) => this.mapRowToNotification(row))
  }

  findByProject(projectId: string, limit = 50): Notification[] {
    const stmt = this.db.prepare('SELECT * FROM notifications WHERE project_id = ? ORDER BY timestamp DESC LIMIT ?')
    const rows = stmt.all(projectId, limit) as any[]
    return rows.map((row) => this.mapRowToNotification(row))
  }

  markAllRead(userId: string): void {
    const stmt = this.db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?')
    stmt.run(userId)
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
    return rows.map((row) => this.mapRowToNotification(row))
  }

  update(id: string, data: Partial<Notification> & { is_read?: boolean }): Notification | null {
    const existing = this.findById(id)
    if (!existing) return null

    const isRead = data.read !== undefined ? data.read : data.is_read !== undefined ? data.is_read : existing.read
    const updated: Notification = { ...existing, ...data, read: isRead }

    const stmt = this.db.prepare(`
      UPDATE notifications
      SET type = ?, title = ?, message = ?, is_read = ?, user_id = ?, project_id = ?
      WHERE id = ?
    `)

    stmt.run(
      updated.type,
      updated.title,
      updated.message,
      updated.read ? 1 : 0,
      updated.userId || null,
      updated.projectId || null,
      id,
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
      userId: row.user_id || undefined,
      projectId: row.project_id || undefined,
    }
  }
}
