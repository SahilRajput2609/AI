import type Database from 'better-sqlite3'
import type { Project } from '../models/index.js'
import { generateId } from '@ai-company/shared'
import { getDatabase } from '../database.js'

export class ProjectRepository {
  constructor(private db: Database.Database = getDatabase().getDb()) {}

  create(data: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Project {
    const now = Date.now()
    const project: Project = {
      id: generateId('project'),
      ...data,
      created_at: now,
      updated_at: now,
    }

    const stmt = this.db.prepare(`
      INSERT INTO projects (id, name, description, path, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)

    stmt.run(
      project.id,
      project.name,
      project.description || null,
      project.path,
      project.status,
      project.created_at,
      project.updated_at
    )

    return project
  }

  findById(id: string): Project | null {
    const stmt = this.db.prepare('SELECT * FROM projects WHERE id = ?')
    return (stmt.get(id) as Project | undefined) ?? null
  }

  findAll(): Project[] {
    const stmt = this.db.prepare('SELECT * FROM projects ORDER BY updated_at DESC')
    return stmt.all() as Project[]
  }

  update(id: string, data: Partial<Omit<Project, 'id' | 'created_at'>>): Project | null {
    const existing = this.findById(id)
    if (!existing) return null

    const updated: Project = {
      ...existing,
      ...data,
      updated_at: Date.now(),
    }

    const stmt = this.db.prepare(`
      UPDATE projects
      SET name = ?, description = ?, path = ?, status = ?, updated_at = ?
      WHERE id = ?
    `)

    stmt.run(
      updated.name,
      updated.description || null,
      updated.path,
      updated.status,
      updated.updated_at,
      id
    )

    return updated
  }

  delete(id: string): boolean {
    const stmt = this.db.prepare('DELETE FROM projects WHERE id = ?')
    const result = stmt.run(id)
    return result.changes > 0
  }
}
