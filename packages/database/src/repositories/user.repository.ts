import type Database from 'better-sqlite3'
import type { User } from '../models/index.js'
import { generateId } from '@ai-company/shared'
import { getDatabase } from '../database.js'

export class UserRepository {
  constructor(private db: Database.Database = getDatabase().getDb()) {}

  create(data: Omit<User, 'id' | 'created_at' | 'updated_at'>): User {
    const now = Date.now()
    const user: User = {
      id: generateId('user'),
      ...data,
      created_at: now,
      updated_at: now,
    }

    const stmt = this.db.prepare(`
      INSERT INTO users (id, email, password_hash, salt, role, oauth_provider, oauth_id, avatar_url, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    stmt.run(
      user.id,
      user.email,
      user.password_hash ?? null,
      user.salt ?? null,
      user.role,
      user.oauth_provider ?? null,
      user.oauth_id ?? null,
      user.avatar_url ?? null,
      user.created_at,
      user.updated_at
    )

    return user
  }

  findByOAuthProvider(provider: string, oauthId: string): User | null {
    const stmt = this.db.prepare(
      'SELECT * FROM users WHERE oauth_provider = ? AND oauth_id = ?'
    )
    return (stmt.get(provider, oauthId) as User | undefined) ?? null
  }

  findById(id: string): User | null {
    const stmt = this.db.prepare('SELECT * FROM users WHERE id = ?')
    return (stmt.get(id) as User | undefined) ?? null
  }

  findByEmail(email: string): User | null {
    const stmt = this.db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)')
    return (stmt.get(email) as User | undefined) ?? null
  }

  delete(id: string): boolean {
    const stmt = this.db.prepare('DELETE FROM users WHERE id = ?')
    const result = stmt.run(id)
    return result.changes > 0
  }
}
