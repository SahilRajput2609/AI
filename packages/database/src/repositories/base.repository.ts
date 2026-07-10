import type Database from 'better-sqlite3'
import { getDatabase } from '../database.js'
import { generateId } from '@ai-company/shared'

export class BaseRepository<T extends { id: string }> {
  protected db: Database.Database
  protected tableName: string

  constructor(tableName: string, db?: Database.Database) {
    this.tableName = tableName
    this.db = db || getDatabase().getDb()
  }

  async create(data: Omit<T, 'id'>): Promise<T> {
    const item = { ...data, id: generateId(this.tableName) } as unknown as T
    const keys = Object.keys(item)
    const values = Object.values(item)
    const cols = keys.join(', ')
    const placeholders = keys.map(() => '?').join(', ')

    this.db.prepare(`INSERT INTO ${this.tableName} (${cols}) VALUES (${placeholders})`).run(...values)
    return item
  }

  async findById(id: string): Promise<T | null> {
    const row = this.db.prepare(`SELECT * FROM ${this.tableName} WHERE id = ?`).get(id) as any
    return row || null
  }

  async findAll(): Promise<T[]> {
    return this.db.prepare(`SELECT * FROM ${this.tableName}`).all() as T[]
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    const existing = await this.findById(id)
    if (!existing) return null
    const updated = { ...existing, ...data }
    const keys = Object.keys(data)
    const values = Object.values(data)
    const setClause = keys.map((k) => `${k} = ?`).join(', ')

    this.db.prepare(`UPDATE ${this.tableName} SET ${setClause} WHERE id = ?`).run(...values, id)
    return updated
  }

  async delete(id: string): Promise<boolean> {
    const result = this.db.prepare(`DELETE FROM ${this.tableName} WHERE id = ?`).run(id)
    return result.changes > 0
  }
}
