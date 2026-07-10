import type Database from 'better-sqlite3'
import { getDatabase } from '../database.js'
import { generateId } from '@ai-company/shared'
import type { AgentConfig } from '../models/index.js'

export class AgentConfigRepository {
  constructor(private db: Database.Database = getDatabase().getDb()) {}

  upsert(data: {
    role: string
    name: string
    api_key?: string
    base_url?: string
    model?: string
    temperature?: number
    max_tokens?: number
    is_active?: boolean
    metadata?: Record<string, any>
  }): AgentConfig {
    const existing = this.findByRole(data.role)
    const now = Date.now()

    if (existing) {
      const updated: AgentConfig = {
        ...existing,
        name: data.name ?? existing.name,
        api_key: data.api_key ?? existing.api_key,
        base_url: data.base_url ?? existing.base_url,
        model: data.model ?? existing.model,
        temperature: data.temperature ?? existing.temperature,
        max_tokens: data.max_tokens ?? existing.max_tokens,
        is_active: data.is_active ?? existing.is_active,
        metadata: data.metadata ?? existing.metadata,
        updated_at: now,
      }

      const stmt = this.db.prepare(`
        UPDATE agent_configs
        SET name = ?, api_key = ?, base_url = ?, model = ?, temperature = ?,
            max_tokens = ?, is_active = ?, metadata = ?, updated_at = ?
        WHERE role = ?
      `)

      stmt.run(
        updated.name,
        updated.api_key,
        updated.base_url,
        updated.model,
        updated.temperature,
        updated.max_tokens,
        updated.is_active ? 1 : 0,
        JSON.stringify(updated.metadata),
        updated.updated_at,
        updated.role,
      )

      return updated
    }

    const config: AgentConfig = {
      id: generateId('agent-config'),
      role: data.role,
      name: data.name,
      api_key: data.api_key || '',
      base_url: data.base_url || '',
      model: data.model || '',
      temperature: data.temperature ?? 0.7,
      max_tokens: data.max_tokens ?? 4096,
      is_active: data.is_active ?? true,
      metadata: data.metadata || {},
      created_at: now,
      updated_at: now,
    }

    const stmt = this.db.prepare(`
      INSERT INTO agent_configs (id, role, name, api_key, base_url, model, temperature, max_tokens, is_active, metadata, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    stmt.run(
      config.id,
      config.role,
      config.name,
      config.api_key,
      config.base_url,
      config.model,
      config.temperature,
      config.max_tokens,
      config.is_active ? 1 : 0,
      JSON.stringify(config.metadata),
      config.created_at,
      config.updated_at,
    )

    return config
  }

  findByRole(role: string): AgentConfig | null {
    const stmt = this.db.prepare('SELECT * FROM agent_configs WHERE role = ?')
    const row = stmt.get(role) as any
    if (!row) return null
    return this.mapRow(row)
  }

  findAll(): AgentConfig[] {
    const stmt = this.db.prepare('SELECT * FROM agent_configs ORDER BY role ASC')
    const rows = stmt.all() as any[]
    return rows.map((row) => this.mapRow(row))
  }

  delete(role: string): boolean {
    const stmt = this.db.prepare('DELETE FROM agent_configs WHERE role = ?')
    const result = stmt.run(role)
    return result.changes > 0
  }

  private mapRow(row: any): AgentConfig {
    return {
      id: row.id,
      role: row.role,
      name: row.name,
      api_key: row.api_key,
      base_url: row.base_url,
      model: row.model,
      temperature: row.temperature,
      max_tokens: row.max_tokens,
      is_active: row.is_active === 1,
      metadata: JSON.parse(row.metadata || '{}'),
      created_at: row.created_at,
      updated_at: row.updated_at,
    }
  }
}
