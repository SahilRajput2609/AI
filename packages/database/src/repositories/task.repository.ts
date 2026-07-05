import type Database from 'better-sqlite3'
import type { Task } from '../models/index.js'
import { generateId } from '@ai-company/shared'
import { getDatabase } from '../database.js'

export class TaskRepository {
  constructor(private db: Database.Database = getDatabase().getDb()) {}

  create(data: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'progress' | 'tags' | 'attachments' | 'comments'> & { progress?: number; tags?: string[]; attachments?: number; comments?: number }): Task {
    const now = Date.now()
    const task: Task = {
      id: generateId('task'),
      ...data,
      progress: data.progress ?? 0,
      tags: data.tags ?? [],
      attachments: data.attachments ?? 0,
      comments: data.comments ?? 0,
      created_at: now,
      updated_at: now,
    }

    const stmt = this.db.prepare(`
      INSERT INTO tasks (
        id, project_id, title, description, category, status, priority,
        assigned_agent, progress, tags, attachments, comments,
        created_at, updated_at, completed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    stmt.run(
      task.id,
      task.project_id,
      task.title,
      task.description || null,
      task.category || null,
      task.status,
      task.priority,
      task.assigned_agent || null,
      task.progress,
      JSON.stringify(task.tags),
      task.attachments,
      task.comments,
      task.created_at,
      task.updated_at,
      task.completed_at || null
    )

    return task
  }

  findById(id: string): Task | null {
    const stmt = this.db.prepare('SELECT * FROM tasks WHERE id = ?')
    const row = stmt.get(id) as any
    if (!row) return null
    return this.mapRowToTask(row)
  }

  findByProject(projectId: string): Task[] {
    const stmt = this.db.prepare('SELECT * FROM tasks WHERE project_id = ? ORDER BY created_at DESC')
    const rows = stmt.all(projectId) as any[]
    return rows.map(row => this.mapRowToTask(row))
  }

  findByStatus(projectId: string, status: Task['status']): Task[] {
    const stmt = this.db.prepare('SELECT * FROM tasks WHERE project_id = ? AND status = ? ORDER BY created_at DESC')
    const rows = stmt.all(projectId, status) as any[]
    return rows.map(row => this.mapRowToTask(row))
  }

  findAll(filters?: { status?: Task['status']; priority?: string; assignedTo?: string; projectId?: string }): Task[] {
    let query = 'SELECT * FROM tasks WHERE 1=1'
    const params: unknown[] = []

    if (filters?.status) {
      query += ' AND status = ?'
      params.push(filters.status)
    }
    if (filters?.priority) {
      query += ' AND priority = ?'
      params.push(filters.priority)
    }
    if (filters?.assignedTo) {
      query += ' AND assigned_agent = ?'
      params.push(filters.assignedTo)
    }
    if (filters?.projectId) {
      query += ' AND project_id = ?'
      params.push(filters.projectId)
    }

    query += ' ORDER BY created_at DESC'
    const stmt = this.db.prepare(query)
    const rows = stmt.all(...params) as any[]
    return rows.map(row => this.mapRowToTask(row))
  }

  findByAgent(agentId: string): Task[] {
    const stmt = this.db.prepare('SELECT * FROM tasks WHERE assigned_agent = ? ORDER BY created_at DESC')
    const rows = stmt.all(agentId) as any[]
    return rows.map(row => this.mapRowToTask(row))
  }

  update(id: string, data: Partial<Omit<Task, 'id' | 'created_at'>>): Task | null {
    const existing = this.findById(id)
    if (!existing) return null

    const updated: Task = {
      ...existing,
      ...data,
      updated_at: Date.now(),
    }

    if (updated.status === 'completed' && !updated.completed_at) {
      updated.completed_at = Date.now()
    }

    const stmt = this.db.prepare(`
      UPDATE tasks
      SET title = ?, description = ?, status = ?, priority = ?,
          assigned_agent = ?, progress = ?, tags = ?, attachments = ?,
          comments = ?, updated_at = ?, completed_at = ?
      WHERE id = ?
    `)

    stmt.run(
      updated.title,
      updated.description || null,
      updated.status,
      updated.priority,
      updated.assigned_agent || null,
      updated.progress,
      JSON.stringify(updated.tags),
      updated.attachments,
      updated.comments,
      updated.updated_at,
      updated.completed_at || null,
      id
    )

    return updated
  }

  delete(id: string): boolean {
    const stmt = this.db.prepare('DELETE FROM tasks WHERE id = ?')
    const result = stmt.run(id)
    return result.changes > 0
  }

  private mapRowToTask(row: any): Task {
    return {
      ...row,
      tags: JSON.parse(row.tags || '[]'),
    }
  }
}
