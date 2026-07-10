import type Database from 'better-sqlite3'
import { getDatabase } from '../database.js'
import { generateId } from '@ai-company/shared'
import type { ModelProviderConfig, ModelProvider } from '@ai-company/shared'
import type { ModelProviderEntity } from '../models/model-provider.model.js'
import { ModelProviderModel } from '../models/model-provider.model.js'

export class ModelProviderRepository {
  constructor(private db: Database.Database = getDatabase().getDb()) {}

  createProvider(config: Omit<ModelProviderConfig, 'id' | 'createdAt' | 'updatedAt'>): ModelProviderConfig {
    const now = new Date()
    const id = generateId('model-provider')
    const entity: ModelProviderEntity = {
      id,
      provider: config.provider,
      name: config.name,
      baseUrl: config.baseUrl,
      apiKey: config.apiKey,
      isActive: config.isActive ?? false,
      models: JSON.stringify(config.models || []),
      createdAt: now,
      updatedAt: now,
    }

    const stmt = this.db.prepare(`
      INSERT INTO model_providers (id, provider, name, base_url, api_key, is_active, models, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    stmt.run(
      entity.id,
      entity.provider,
      entity.name,
      entity.baseUrl,
      entity.apiKey,
      entity.isActive ? 1 : 0,
      entity.models,
      entity.createdAt.getTime(),
      entity.updatedAt.getTime(),
    )

    return ModelProviderModel.fromEntity({ ...entity, createdAt: now, updatedAt: now })
  }

  getProvider(id: string): ModelProviderConfig | null {
    const stmt = this.db.prepare('SELECT * FROM model_providers WHERE id = ?')
    const row = stmt.get(id) as any
    if (!row) return null
    return this.mapRowToProviderConfig(row)
  }

  getAllProviders(): ModelProviderConfig[] {
    const stmt = this.db.prepare('SELECT * FROM model_providers ORDER BY created_at ASC')
    const rows = stmt.all() as any[]
    return rows.map((row) => this.mapRowToProviderConfig(row))
  }

  getActiveProviders(): ModelProviderConfig[] {
    const stmt = this.db.prepare('SELECT * FROM model_providers WHERE is_active = 1 ORDER BY created_at ASC')
    const rows = stmt.all() as any[]
    return rows.map((row) => this.mapRowToProviderConfig(row))
  }

  updateProvider(id: string, updates: Partial<ModelProviderConfig>): ModelProviderConfig | null {
    const existing = this.getProvider(id)
    if (!existing) return null

    const now = new Date()
    const updated: ModelProviderConfig = { ...existing, ...updates, updatedAt: now }

    const stmt = this.db.prepare(`
      UPDATE model_providers
      SET provider = ?, name = ?, base_url = ?, api_key = ?, is_active = ?, models = ?, updated_at = ?
      WHERE id = ?
    `)

    stmt.run(
      updated.provider,
      updated.name,
      updated.baseUrl,
      updated.apiKey,
      updated.isActive ? 1 : 0,
      JSON.stringify(updated.models),
      now.getTime(),
      id,
    )

    return updated
  }

  deleteProvider(id: string): boolean {
    const stmt = this.db.prepare('DELETE FROM model_providers WHERE id = ?')
    const result = stmt.run(id)
    return result.changes > 0
  }

  getProviderByName(name: string): ModelProviderConfig | null {
    const stmt = this.db.prepare('SELECT * FROM model_providers WHERE name = ? LIMIT 1')
    const row = stmt.get(name) as any
    if (!row) return null
    return this.mapRowToProviderConfig(row)
  }

  getProvidersByType(provider: ModelProvider): ModelProviderConfig[] {
    const stmt = this.db.prepare('SELECT * FROM model_providers WHERE provider = ? ORDER BY created_at ASC')
    const rows = stmt.all(provider) as any[]
    return rows.map((row) => this.mapRowToProviderConfig(row))
  }

  findByStatus(status: string): ModelProviderConfig[] {
    const isActive = status === 'active' ? 1 : 0
    const stmt = this.db.prepare('SELECT * FROM model_providers WHERE is_active = ? ORDER BY created_at ASC')
    const rows = stmt.all(isActive) as any[]
    return rows.map((row) => this.mapRowToProviderConfig(row))
  }

  findByProvider(provider: string): ModelProviderConfig[] {
    const stmt = this.db.prepare('SELECT * FROM model_providers WHERE provider = ? ORDER BY created_at ASC')
    const rows = stmt.all(provider) as any[]
    return rows.map((row) => this.mapRowToProviderConfig(row))
  }

  private mapRowToProviderConfig(row: any): ModelProviderConfig {
    return {
      id: row.id,
      provider: row.provider,
      name: row.name,
      baseUrl: row.base_url,
      apiKey: row.api_key,
      isActive: row.is_active === 1,
      models: JSON.parse(row.models || '[]'),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }
  }
}
