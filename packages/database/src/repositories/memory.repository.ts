import type Database from 'better-sqlite3'
import type { Memory } from '../models/index.js'
import { generateId } from '@ai-company/shared'
import { getDatabase } from '../database.js'

export class MemoryRepository {
  constructor(private db: Database.Database = getDatabase().getDb()) {}

  create(data: Omit<Memory, 'id' | 'created_at' | 'updated_at'>): Memory {
    const now = Date.now()
    const memory: Memory = {
      id: generateId('memory'),
      ...data,
      metadata: data.metadata ?? {},
      created_at: now,
      updated_at: now,
    }

    const stmt = this.db.prepare(`
      INSERT INTO memory (
        id, agent_id, type, key, value, metadata, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)

    stmt.run(
      memory.id,
      memory.agent_id || null,
      memory.type,
      memory.key,
      memory.value,
      JSON.stringify(memory.metadata || {}),
      memory.created_at,
      memory.updated_at,
    )

    return memory
  }

  findById(id: string): Memory | null {
    const stmt = this.db.prepare('SELECT * FROM memory WHERE id = ?')
    const row = stmt.get(id) as any
    if (!row) return null
    return this.mapRowToMemory(row)
  }

  findByKey(type: Memory['type'], key: string, agentId?: string): Memory | null {
    let stmt: Database.Statement
    let row: any

    if (agentId) {
      stmt = this.db.prepare('SELECT * FROM memory WHERE type = ? AND key = ? AND agent_id = ? LIMIT 1')
      row = stmt.get(type, key, agentId)
    } else {
      stmt = this.db.prepare('SELECT * FROM memory WHERE type = ? AND key = ? AND agent_id IS NULL LIMIT 1')
      row = stmt.get(type, key)
    }

    if (!row) return null
    return this.mapRowToMemory(row)
  }

  findByAgent(agentId: string): Memory[] {
    const stmt = this.db.prepare('SELECT * FROM memory WHERE agent_id = ? ORDER BY updated_at DESC')
    const rows = stmt.all(agentId) as any[]
    return rows.map((row) => this.mapRowToMemory(row))
  }

  findByType(type: Memory['type']): Memory[] {
    const stmt = this.db.prepare('SELECT * FROM memory WHERE type = ? ORDER BY updated_at DESC')
    const rows = stmt.all(type) as any[]
    return rows.map((row) => this.mapRowToMemory(row))
  }

  upsert(data: Omit<Memory, 'id' | 'created_at' | 'updated_at'>): Memory {
    const existing = this.findByKey(data.type, data.key, data.agent_id)

    if (existing) {
      return this.update(existing.id, { value: data.value, metadata: data.metadata })!
    }

    return this.create(data)
  }

  update(id: string, data: Partial<Pick<Memory, 'value' | 'metadata'>>): Memory | null {
    const existing = this.findById(id)
    if (!existing) return null

    const updated: Memory = {
      ...existing,
      ...data,
      updated_at: Date.now(),
    }

    const stmt = this.db.prepare(`
      UPDATE memory
      SET value = ?, metadata = ?, updated_at = ?
      WHERE id = ?
    `)

    stmt.run(updated.value, JSON.stringify(updated.metadata || {}), updated.updated_at, id)

    return updated
  }

  delete(id: string): boolean {
    const stmt = this.db.prepare('DELETE FROM memory WHERE id = ?')
    const result = stmt.run(id)
    return result.changes > 0
  }

  deleteByAgent(agentId: string): number {
    const stmt = this.db.prepare('DELETE FROM memory WHERE agent_id = ?')
    const result = stmt.run(agentId)
    return result.changes
  }

  private mapRowToMemory(row: any): Memory {
    return {
      ...row,
      metadata: JSON.parse(row.metadata || '{}'),
    }
  }
}
