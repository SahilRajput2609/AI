import type Database from 'better-sqlite3'
import { getDatabase } from '../database.js'
import { generateId } from '@ai-company/shared'

export interface ModelEntity {
  id: string
  name: string
  provider: string
  modelId: string
  capabilities: string[]
  maxTokens: number
  costPer1MTokens: number
  isActive: boolean
  config: Record<string, unknown>
  updatedAt?: Date
}

export class ModelRepository {
  constructor(private db: Database.Database = getDatabase().getDb()) {}

  create(data: {
    name: string
    provider: string
    modelId: string
    capabilities: string[]
    maxTokens: number
    costPer1MTokens: number
    isActive: boolean
    config: Record<string, unknown>
  }): ModelEntity {
    const id = generateId('model')
    const entity: ModelEntity = { id, ...data }

    const stmt = this.db.prepare(`
      INSERT INTO model_entities (id, name, provider, model_id, capabilities, max_tokens, cost_per_1m_tokens, is_active, config)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    stmt.run(
      entity.id,
      entity.name,
      entity.provider,
      entity.modelId,
      JSON.stringify(entity.capabilities),
      entity.maxTokens,
      entity.costPer1MTokens,
      entity.isActive ? 1 : 0,
      JSON.stringify(entity.config),
    )

    return entity
  }

  findById(id: string): ModelEntity | null {
    const stmt = this.db.prepare('SELECT * FROM model_entities WHERE id = ?')
    const row = stmt.get(id) as any
    if (!row) return null
    return this.mapRowToEntity(row)
  }

  findAll(filters?: { provider?: string; isActive?: boolean }): ModelEntity[] {
    let query = 'SELECT * FROM model_entities WHERE 1=1'
    const params: unknown[] = []

    if (filters?.provider) {
      query += ' AND provider = ?'
      params.push(filters.provider)
    }
    if (filters?.isActive !== undefined) {
      query += ' AND is_active = ?'
      params.push(filters.isActive ? 1 : 0)
    }

    query += ' ORDER BY name ASC'
    const stmt = this.db.prepare(query)
    const rows = stmt.all(...params) as any[]
    return rows.map((row) => this.mapRowToEntity(row))
  }

  update(id: string, data: Partial<ModelEntity>): ModelEntity | null {
    const existing = this.findById(id)
    if (!existing) return null

    const updated: ModelEntity = { ...existing, ...data, updatedAt: data.updatedAt || new Date() }

    const stmt = this.db.prepare(`
      UPDATE model_entities
      SET name = ?, provider = ?, model_id = ?, capabilities = ?, max_tokens = ?,
          cost_per_1m_tokens = ?, is_active = ?, config = ?, updated_at = ?
      WHERE id = ?
    `)

    stmt.run(
      updated.name,
      updated.provider,
      updated.modelId,
      JSON.stringify(updated.capabilities),
      updated.maxTokens,
      updated.costPer1MTokens,
      updated.isActive ? 1 : 0,
      JSON.stringify(updated.config),
      updated.updatedAt ? updated.updatedAt.getTime() : null,
      id,
    )

    return updated
  }

  delete(id: string): boolean {
    const stmt = this.db.prepare('DELETE FROM model_entities WHERE id = ?')
    const result = stmt.run(id)
    return result.changes > 0
  }

  private mapRowToEntity(row: any): ModelEntity {
    return {
      id: row.id,
      name: row.name,
      provider: row.provider,
      modelId: row.model_id,
      capabilities: JSON.parse(row.capabilities || '[]'),
      maxTokens: row.max_tokens,
      costPer1MTokens: row.cost_per_1m_tokens,
      isActive: row.is_active === 1,
      config: JSON.parse(row.config || '{}'),
      updatedAt: row.updated_at ? new Date(row.updated_at) : undefined,
    }
  }
}
