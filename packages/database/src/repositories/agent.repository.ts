import type Database from 'better-sqlite3'
import type { Agent } from '../models/index.js'
import { generateId } from '@ai-company/shared'
import { getDatabase } from '../database.js'

export class AgentRepository {
  constructor(private db: Database.Database = getDatabase().getDb()) {}

  create(data: Omit<Agent, 'id' | 'created_at' | 'updated_at' | 'status'> & { status?: Agent['status'] }): Agent {
    const now = Date.now()
    const agent: Agent = {
      id: generateId('agent'),
      ...data,
      status: data.status ?? 'idle',
      created_at: now,
      updated_at: now,
    }

    const stmt = this.db.prepare(`
      INSERT INTO agents (
        id, role, status, icon, color, subtext,
        current_task_id, metadata, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    stmt.run(
      agent.id,
      agent.role,
      agent.status,
      agent.icon || null,
      agent.color || null,
      agent.subtext || null,
      agent.current_task_id || null,
      JSON.stringify(agent.metadata || {}),
      agent.created_at,
      agent.updated_at
    )

    return agent
  }

  findById(id: string): Agent | null {
    const stmt = this.db.prepare('SELECT * FROM agents WHERE id = ?')
    const row = stmt.get(id) as any
    if (!row) return null
    return this.mapRowToAgent(row)
  }

  findByRole(role: string): Agent | null {
    const stmt = this.db.prepare('SELECT * FROM agents WHERE role = ? LIMIT 1')
    const row = stmt.get(role) as any
    if (!row) return null
    return this.mapRowToAgent(row)
  }

  findAll(): Agent[] {
    const stmt = this.db.prepare('SELECT * FROM agents ORDER BY created_at ASC')
    const rows = stmt.all() as any[]
    return rows.map(row => this.mapRowToAgent(row))
  }

  update(id: string, data: Partial<Omit<Agent, 'id' | 'created_at'>>): Agent | null {
    const existing = this.findById(id)
    if (!existing) return null

    const updated: Agent = {
      ...existing,
      ...data,
      updated_at: Date.now(),
    }

    const stmt = this.db.prepare(`
      UPDATE agents
      SET role = ?, status = ?, icon = ?, color = ?, subtext = ?,
          current_task_id = ?, metadata = ?, updated_at = ?
      WHERE id = ?
    `)

    stmt.run(
      updated.role,
      updated.status,
      updated.icon || null,
      updated.color || null,
      updated.subtext || null,
      updated.current_task_id || null,
      JSON.stringify(updated.metadata || {}),
      updated.updated_at,
      id
    )

    return updated
  }

  delete(id: string): boolean {
    const stmt = this.db.prepare('DELETE FROM agents WHERE id = ?')
    const result = stmt.run(id)
    return result.changes > 0
  }

  private mapRowToAgent(row: any): Agent {
    return {
      ...row,
      metadata: JSON.parse(row.metadata || '{}'),
    }
  }
}
