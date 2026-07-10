import type Database from 'better-sqlite3'
import type { Template } from '../models/index.js'
import { generateId } from '@ai-company/shared'
import { getDatabase } from '../database.js'

export class TemplateRepository {
  constructor(private db: Database.Database = getDatabase().getDb()) {}

  create(
    data: Omit<Template, 'id' | 'created_at' | 'updated_at' | 'usage_count' | 'type'> & { type?: string },
  ): Template {
    const now = Date.now()
    const template: Template = {
      id: generateId('tpl'),
      type: 'project',
      ...data,
      usage_count: 0,
      created_at: now,
      updated_at: now,
    }

    const stmt = this.db.prepare(`
      INSERT INTO templates (id, name, description, category, type, config, is_built_in, usage_count, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    stmt.run(
      template.id,
      template.name,
      template.description || null,
      template.category,
      template.type,
      template.config,
      template.is_built_in ? 1 : 0,
      template.usage_count,
      template.created_at,
      template.updated_at,
    )

    return template
  }

  findAll(category?: string): Template[] {
    if (category) {
      return this.db
        .prepare('SELECT * FROM templates WHERE category = ? ORDER BY usage_count DESC, name ASC')
        .all(category) as Template[]
    }
    return this.db
      .prepare('SELECT * FROM templates ORDER BY is_built_in DESC, usage_count DESC, name ASC')
      .all() as Template[]
  }

  findById(id: string): Template | null {
    const stmt = this.db.prepare('SELECT * FROM templates WHERE id = ?')
    return (stmt.get(id) as Template | undefined) ?? null
  }

  incrementUsage(id: string): void {
    this.db.prepare('UPDATE templates SET usage_count = usage_count + 1 WHERE id = ?').run(id)
  }

  update(id: string, data: Partial<Template>): Template | null {
    const existing = this.findById(id)
    if (!existing) return null

    const updated = { ...existing, ...data }

    const stmt = this.db.prepare(`
      UPDATE templates
      SET name = ?, description = ?, category = ?, type = ?, config = ?, is_built_in = ?, usage_count = ?, updated_at = ?
      WHERE id = ?
    `)

    stmt.run(
      updated.name,
      updated.description || null,
      updated.category,
      updated.type,
      updated.config,
      updated.is_built_in ? 1 : 0,
      updated.usage_count,
      Date.now(),
      id,
    )

    return updated
  }

  delete(id: string): boolean {
    return this.db.prepare('DELETE FROM templates WHERE id = ?').run(id).changes > 0
  }
}
