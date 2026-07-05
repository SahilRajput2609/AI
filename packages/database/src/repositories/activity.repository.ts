import type Database from 'better-sqlite3'
import type { Activity } from '../models/index.js'
import { generateId } from '@ai-company/shared'
import { getDatabase } from '../database.js'

export class ActivityRepository {
  constructor(private db: Database.Database = getDatabase().getDb()) {}

  create(data: Omit<Activity, 'id' | 'created_at'>): Activity {
    const activity: Activity = {
      id: generateId('activity'),
      ...data,
      metadata: data.metadata ?? {},
      created_at: Date.now(),
    }

    const stmt = this.db.prepare(`
      INSERT INTO activity (
        id, project_id, agent_id, type, title, description, metadata, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)

    stmt.run(
      activity.id,
      activity.project_id,
      activity.agent_id || null,
      activity.type,
      activity.title,
      activity.description || null,
      JSON.stringify(activity.metadata || {}),
      activity.created_at
    )

    return activity
  }

  findById(id: string): Activity | null {
    const stmt = this.db.prepare('SELECT * FROM activity WHERE id = ?')
    const row = stmt.get(id) as any
    if (!row) return null
    return this.mapRowToActivity(row)
  }

  findByProject(projectId: string, limit = 50): Activity[] {
    const stmt = this.db.prepare(`
      SELECT * FROM activity 
      WHERE project_id = ? 
      ORDER BY created_at DESC 
      LIMIT ?
    `)
    const rows = stmt.all(projectId, limit) as any[]
    return rows.map(row => this.mapRowToActivity(row))
  }

  findByAgent(agentId: string, limit = 50): Activity[] {
    const stmt = this.db.prepare(`
      SELECT * FROM activity 
      WHERE agent_id = ? 
      ORDER BY created_at DESC 
      LIMIT ?
    `)
    const rows = stmt.all(agentId, limit) as any[]
    return rows.map(row => this.mapRowToActivity(row))
  }

  findByType(projectId: string, type: Activity['type'], limit = 50): Activity[] {
    const stmt = this.db.prepare(`
      SELECT * FROM activity 
      WHERE project_id = ? AND type = ? 
      ORDER BY created_at DESC 
      LIMIT ?
    `)
    const rows = stmt.all(projectId, type, limit) as any[]
    return rows.map(row => this.mapRowToActivity(row))
  }

  delete(id: string): boolean {
    const stmt = this.db.prepare('DELETE FROM activity WHERE id = ?')
    const result = stmt.run(id)
    return result.changes > 0
  }

  deleteByProject(projectId: string): number {
    const stmt = this.db.prepare('DELETE FROM activity WHERE project_id = ?')
    const result = stmt.run(projectId)
    return result.changes
  }

  private mapRowToActivity(row: any): Activity {
    return {
      ...row,
      metadata: JSON.parse(row.metadata || '{}'),
    }
  }
}
