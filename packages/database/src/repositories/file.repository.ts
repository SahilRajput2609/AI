import type Database from 'better-sqlite3'
import type { FileMetadata } from '../models/index.js'
import { generateId } from '@ai-company/shared'
import { getDatabase } from '../database.js'

export class FileRepository {
  constructor(private db: Database.Database = getDatabase().getDb()) {}

  create(data: Omit<FileMetadata, 'id' | 'created_at' | 'updated_at' | 'modified'> & { modified?: boolean }): FileMetadata {
    const now = Date.now()
    const file: FileMetadata = {
      id: generateId('file'),
      ...data,
      modified: data.modified ?? false,
      created_at: now,
      updated_at: now,
    }

    const stmt = this.db.prepare(`
      INSERT INTO files (
        id, project_id, path, name, type, language, size, modified, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    stmt.run(
      file.id,
      file.project_id,
      file.path,
      file.name,
      file.type,
      file.language || null,
      file.size || null,
      file.modified ? 1 : 0,
      file.created_at,
      file.updated_at
    )

    return file
  }

  findById(id: string): FileMetadata | null {
    const stmt = this.db.prepare('SELECT * FROM files WHERE id = ?')
    const row = stmt.get(id) as any
    if (!row) return null
    return this.mapRowToFile(row)
  }

  findByPath(projectId: string, path: string): FileMetadata | null {
    const stmt = this.db.prepare('SELECT * FROM files WHERE project_id = ? AND path = ? LIMIT 1')
    const row = stmt.get(projectId, path) as any
    if (!row) return null
    return this.mapRowToFile(row)
  }

  findByProject(projectId: string): FileMetadata[] {
    const stmt = this.db.prepare('SELECT * FROM files WHERE project_id = ? ORDER BY path ASC')
    const rows = stmt.all(projectId) as any[]
    return rows.map(row => this.mapRowToFile(row))
  }

  findAll(filters?: { projectId?: string; path?: string }): FileMetadata[] {
    let query = 'SELECT * FROM files WHERE 1=1'
    const params: unknown[] = []

    if (filters?.projectId) {
      query += ' AND project_id = ?'
      params.push(filters.projectId)
    }
    if (filters?.path) {
      query += ' AND path = ?'
      params.push(filters.path)
    }

    query += ' ORDER BY path ASC'
    const stmt = this.db.prepare(query)
    const rows = stmt.all(...params) as any[]
    return rows.map(row => this.mapRowToFile(row))
  }

  findModified(projectId: string): FileMetadata[] {
    const stmt = this.db.prepare('SELECT * FROM files WHERE project_id = ? AND modified = 1 ORDER BY updated_at DESC')
    const rows = stmt.all(projectId) as any[]
    return rows.map(row => this.mapRowToFile(row))
  }

  update(id: string, data: Partial<Omit<FileMetadata, 'id' | 'created_at'>>): FileMetadata | null {
    const existing = this.findById(id)
    if (!existing) return null

    const updated: FileMetadata = {
      ...existing,
      ...data,
      updated_at: Date.now(),
    }

    const stmt = this.db.prepare(`
      UPDATE files
      SET path = ?, name = ?, type = ?, language = ?, size = ?, modified = ?, updated_at = ?
      WHERE id = ?
    `)

    stmt.run(
      updated.path,
      updated.name,
      updated.type,
      updated.language || null,
      updated.size || null,
      updated.modified ? 1 : 0,
      updated.updated_at,
      id
    )

    return updated
  }

  delete(id: string): boolean {
    const stmt = this.db.prepare('DELETE FROM files WHERE id = ?')
    const result = stmt.run(id)
    return result.changes > 0
  }

  deleteByProject(projectId: string): number {
    const stmt = this.db.prepare('DELETE FROM files WHERE project_id = ?')
    const result = stmt.run(projectId)
    return result.changes
  }

  private mapRowToFile(row: any): FileMetadata {
    return {
      ...row,
      modified: row.modified === 1,
    }
  }
}
