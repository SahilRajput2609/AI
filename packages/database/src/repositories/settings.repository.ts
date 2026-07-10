import { BaseRepository } from './base.repository.js'
import type Database from 'better-sqlite3'
import { generateId } from '@ai-company/shared'

export interface UserSettings {
  id: string
  userId: string
  theme: 'dark' | 'light'
  autoSave: boolean
  defaultProjectName: string
  notifyTaskUpdates: boolean
  notifyAgentErrors: boolean
  notifyDeploymentComplete: boolean
  keyboardShortcuts: Record<string, string>
  modelPreferences: {
    defaultProvider?: string
    defaultModel?: string
  }
  agentPreferences: Record<string, unknown>
  createdAt: number
  updatedAt: number
}

export class SettingsRepository extends BaseRepository<UserSettings> {
  constructor(db?: Database.Database) {
    super('user_settings', db)
  }

  protected generateId(): string {
    return generateId('settings')
  }

  async create(settings: Omit<UserSettings, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserSettings> {
    const id = this.generateId()
    const now = Date.now()

    const stmt = (this as any).db.prepare(`
      INSERT INTO user_settings (
        id, user_id, theme, auto_save, default_project_name,
        notify_task_updates, notify_agent_errors, notify_deployment_complete,
        keyboard_shortcuts, model_preferences, agent_preferences,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    stmt.run(
      id,
      settings.userId,
      settings.theme,
      settings.autoSave ? 1 : 0,
      settings.defaultProjectName,
      settings.notifyTaskUpdates ? 1 : 0,
      settings.notifyAgentErrors ? 1 : 0,
      settings.notifyDeploymentComplete ? 1 : 0,
      JSON.stringify(settings.keyboardShortcuts),
      JSON.stringify(settings.modelPreferences),
      JSON.stringify(settings.agentPreferences),
      now,
      now,
    )

    return (await this.getById(id))!
  }

  async getById(id: string): Promise<UserSettings | null> {
    const stmt = (this as any).db.prepare('SELECT * FROM user_settings WHERE id = ?')
    const row = stmt.get(id) as any
    return row ? this.mapRow(row) : null
  }

  async getByUserId(userId: string): Promise<UserSettings | null> {
    const stmt = (this as any).db.prepare('SELECT * FROM user_settings WHERE user_id = ?')
    const row = stmt.get(userId) as any
    return row ? this.mapRow(row) : null
  }

  async update(
    id: string,
    updates: Partial<Omit<UserSettings, 'id' | 'userId' | 'createdAt'>>,
  ): Promise<UserSettings | null> {
    const settings = await this.getById(id)
    if (!settings) throw new Error('Settings not found')

    const now = Date.now()
    const fields: string[] = []
    const values: unknown[] = []

    if (updates.theme !== undefined) {
      fields.push('theme = ?')
      values.push(updates.theme)
    }
    if (updates.autoSave !== undefined) {
      fields.push('auto_save = ?')
      values.push(updates.autoSave ? 1 : 0)
    }
    if (updates.defaultProjectName !== undefined) {
      fields.push('default_project_name = ?')
      values.push(updates.defaultProjectName)
    }
    if (updates.notifyTaskUpdates !== undefined) {
      fields.push('notify_task_updates = ?')
      values.push(updates.notifyTaskUpdates ? 1 : 0)
    }
    if (updates.notifyAgentErrors !== undefined) {
      fields.push('notify_agent_errors = ?')
      values.push(updates.notifyAgentErrors ? 1 : 0)
    }
    if (updates.notifyDeploymentComplete !== undefined) {
      fields.push('notify_deployment_complete = ?')
      values.push(updates.notifyDeploymentComplete ? 1 : 0)
    }
    if (updates.keyboardShortcuts !== undefined) {
      fields.push('keyboard_shortcuts = ?')
      values.push(JSON.stringify(updates.keyboardShortcuts))
    }
    if (updates.modelPreferences !== undefined) {
      fields.push('model_preferences = ?')
      values.push(JSON.stringify(updates.modelPreferences))
    }
    if (updates.agentPreferences !== undefined) {
      fields.push('agent_preferences = ?')
      values.push(JSON.stringify(updates.agentPreferences))
    }

    fields.push('updated_at = ?')
    values.push(now)
    values.push(id)

    const stmt = (this as any).db.prepare(`UPDATE user_settings SET ${fields.join(', ')} WHERE id = ?`)
    stmt.run(...values)

    return (await this.getById(id))!
  }

  async delete(id: string): Promise<boolean> {
    const stmt = (this as any).db.prepare('DELETE FROM user_settings WHERE id = ?')
    const result = stmt.run(id) as any
    return result.changes > 0
  }

  private mapRow(row: any): UserSettings {
    return {
      id: row.id,
      userId: row.user_id,
      theme: row.theme,
      autoSave: row.auto_save === 1,
      defaultProjectName: row.default_project_name,
      notifyTaskUpdates: row.notify_task_updates === 1,
      notifyAgentErrors: row.notify_agent_errors === 1,
      notifyDeploymentComplete: row.notify_deployment_complete === 1,
      keyboardShortcuts: row.keyboard_shortcuts ? JSON.parse(row.keyboard_shortcuts) : {},
      modelPreferences: row.model_preferences ? JSON.parse(row.model_preferences) : {},
      agentPreferences: row.agent_preferences ? JSON.parse(row.agent_preferences) : {},
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  }
}
