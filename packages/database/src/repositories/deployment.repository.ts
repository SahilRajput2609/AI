import type Database from 'better-sqlite3'
import type { Deployment } from '../models/index.js'
import { generateId } from '@ai-company/shared'
import { getDatabase } from '../database.js'

export class DeploymentRepository {
  constructor(private db: Database.Database = getDatabase().getDb()) {}

  create(data: Omit<Deployment, 'id' | 'created_at' | 'updated_at'>): Deployment {
    const now = Date.now()
    const deployment: Deployment = {
      id: generateId('dep'),
      ...data,
      created_at: now,
      updated_at: now,
    }

    const stmt = this.db.prepare(`
      INSERT INTO deployments (id, project_id, version_id, platform, status, url, build_logs, config, deployed_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    stmt.run(
      deployment.id,
      deployment.project_id,
      deployment.version_id || null,
      deployment.platform,
      deployment.status,
      deployment.url || null,
      deployment.build_logs || null,
      deployment.config,
      deployment.deployed_by || null,
      deployment.created_at,
      deployment.updated_at,
    )

    return deployment
  }

  findById(id: string): Deployment | null {
    const stmt = this.db.prepare('SELECT * FROM deployments WHERE id = ?')
    return (stmt.get(id) as Deployment | undefined) ?? null
  }

  findByProjectId(projectId: string): Deployment[] {
    const stmt = this.db.prepare('SELECT * FROM deployments WHERE project_id = ? ORDER BY created_at DESC')
    return stmt.all(projectId) as Deployment[]
  }

  update(id: string, data: Partial<Omit<Deployment, 'id' | 'created_at'>>): Deployment | null {
    const existing = this.findById(id)
    if (!existing) return null

    const updated: Deployment = { ...existing, ...data, updated_at: Date.now() }

    const stmt = this.db.prepare(`
      UPDATE deployments SET status = ?, url = ?, build_logs = ?, config = ?, updated_at = ? WHERE id = ?
    `)
    stmt.run(updated.status, updated.url || null, updated.build_logs || null, updated.config, updated.updated_at, id)

    return updated
  }

  delete(id: string): boolean {
    return this.db.prepare('DELETE FROM deployments WHERE id = ?').run(id).changes > 0
  }
}
