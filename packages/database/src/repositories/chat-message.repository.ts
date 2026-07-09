import type Database from 'better-sqlite3'
import type { ChatMessage } from '../models/index.js'
import { generateId } from '@ai-company/shared'
import { getDatabase } from '../database.js'

export class ChatMessageRepository {
  constructor(private db: Database.Database = getDatabase().getDb()) {}

  create(data: Omit<ChatMessage, 'id' | 'created_at'>): ChatMessage {
    const now = Date.now()
    const msg: ChatMessage = {
      id: generateId('msg'),
      ...data,
      created_at: now,
    }

    const stmt = this.db.prepare(`
      INSERT INTO chat_messages (id, project_id, user_id, role, content, metadata, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)

    stmt.run(
      msg.id,
      msg.project_id || null,
      msg.user_id || null,
      msg.role,
      msg.content,
      msg.metadata || '{}',
      msg.created_at
    )

    return msg
  }

  findByProjectId(projectId: string): ChatMessage[] {
    const stmt = this.db.prepare(
      'SELECT * FROM chat_messages WHERE project_id = ? ORDER BY created_at ASC'
    )
    return stmt.all(projectId) as ChatMessage[]
  }

  findAll(limit = 50, offset = 0): ChatMessage[] {
    const stmt = this.db.prepare('SELECT * FROM chat_messages ORDER BY created_at DESC LIMIT ? OFFSET ?')
    return stmt.all(limit, offset) as ChatMessage[]
  }

  deleteByProjectId(projectId: string): void {
    this.db.prepare('DELETE FROM chat_messages WHERE project_id = ?').run(projectId)
  }

  countByProjectId(projectId: string): number {
    const stmt = this.db.prepare('SELECT COUNT(*) as count FROM chat_messages WHERE project_id = ?')
    const row = stmt.get(projectId) as { count: number }
    return row.count
  }
}
