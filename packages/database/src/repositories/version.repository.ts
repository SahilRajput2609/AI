import type Database from 'better-sqlite3'
import type { Version } from '../models/index.js'
import { generateId } from '@ai-company/shared'
import { getDatabase } from '../database.js'

export class VersionRepository {
  constructor(private db: Database.Database = getDatabase().getDb()) {}

  create(data: Omit<Version, 'id' | 'created_at'>): Version {
    const now = Date.now()
    const version: Version = {
      id: generateId('ver'),
      ...data,
      created_at: now,
    }

    const stmt = this.db.prepare(`
      INSERT INTO versions (id, project_id, version_number, title, description, snapshot_data, file_count, created_by, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    stmt.run(
      version.id,
      version.project_id,
      version.version_number,
      version.title,
      version.description || null,
      version.snapshot_data,
      version.file_count,
      version.created_by || null,
      version.created_at
    )

    return version
  }

  findById(id: string): Version | null {
    const stmt = this.db.prepare('SELECT * FROM versions WHERE id = ?')
    return (stmt.get(id) as Version | undefined) ?? null
  }

  findByProjectId(projectId: string): Version[] {
    const stmt = this.db.prepare('SELECT * FROM versions WHERE project_id = ? ORDER BY version_number DESC')
    return stmt.all(projectId) as Version[]
  }

  getLatestVersion(projectId: string): number {
    const stmt = this.db.prepare('SELECT MAX(version_number) as max FROM versions WHERE project_id = ?')
    const row = stmt.get(projectId) as { max: number | null }
    return row.max || 0
  }

  delete(id: string): boolean {
    const stmt = this.db.prepare('DELETE FROM versions WHERE id = ?')
    return stmt.run(id).changes > 0
  }

  deleteByProjectId(projectId: string): void {
    this.db.prepare('DELETE FROM versions WHERE project_id = ?').run(projectId)
  }
}
