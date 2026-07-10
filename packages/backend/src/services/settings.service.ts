import { SettingsRepository, type UserSettings } from '@ai-company/database'
import type Database from 'better-sqlite3'

export class SettingsService {
  private settingsRepository: SettingsRepository

  constructor(db: Database.Database) {
    this.settingsRepository = new SettingsRepository(db)
  }

  async getOrCreateSettings(userId: string): Promise<UserSettings> {
    let settings = await this.settingsRepository.getByUserId(userId)

    if (!settings) {
      settings = await this.settingsRepository.create({
        userId,
        theme: 'dark',
        autoSave: true,
        defaultProjectName: 'AI-Company',
        notifyTaskUpdates: true,
        notifyAgentErrors: true,
        notifyDeploymentComplete: true,
        keyboardShortcuts: {
          search: 'ctrl+k',
          createTask: 'ctrl+n',
          toggleSidebar: 'ctrl+b',
        },
        modelPreferences: {},
        agentPreferences: {},
      })
    }

    return settings
  }

  async updateSettings(
    userId: string,
    updates: Partial<Omit<UserSettings, 'id' | 'userId' | 'createdAt'>>,
  ): Promise<UserSettings> {
    const settings = await this.getOrCreateSettings(userId)
    const updated = await this.settingsRepository.update(settings.id, updates)
    return updated!
  }

  async getSettings(userId: string): Promise<UserSettings | null> {
    return this.settingsRepository.getByUserId(userId)
  }

  async updateTheme(userId: string, theme: 'dark' | 'light'): Promise<UserSettings> {
    return this.updateSettings(userId, { theme })
  }

  async updateNotifications(
    userId: string,
    notifications: {
      taskUpdates?: boolean
      agentErrors?: boolean
      deploymentComplete?: boolean
    },
  ): Promise<UserSettings> {
    const updates: any = {}
    if (notifications.taskUpdates !== undefined) updates.notifyTaskUpdates = notifications.taskUpdates
    if (notifications.agentErrors !== undefined) updates.notifyAgentErrors = notifications.agentErrors
    if (notifications.deploymentComplete !== undefined)
      updates.notifyDeploymentComplete = notifications.deploymentComplete
    return this.updateSettings(userId, updates)
  }

  async updateKeyboardShortcuts(userId: string, shortcuts: Record<string, string>): Promise<UserSettings> {
    return this.updateSettings(userId, { keyboardShortcuts: shortcuts })
  }

  async updateModelPreferences(
    userId: string,
    preferences: {
      defaultProvider?: string
      defaultModel?: string
    },
  ): Promise<UserSettings> {
    const current = await this.getOrCreateSettings(userId)
    return this.updateSettings(userId, {
      modelPreferences: { ...current.modelPreferences, ...preferences },
    })
  }
}
