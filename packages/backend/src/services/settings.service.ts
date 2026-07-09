import { SettingsRepository, type UserSettings } from '@ai-company/database'
import type Database from 'better-sqlite3'

export class SettingsService {
  private settingsRepository: SettingsRepository

  constructor(db: Database.Database) {
    this.settingsRepository = new SettingsRepository(db)
  }

  getOrCreateSettings(userId: string): UserSettings {
    let settings = this.settingsRepository.getByUserId(userId)

    if (!settings) {
      settings = this.settingsRepository.create({
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

  updateSettings(userId: string, updates: Partial<Omit<UserSettings, 'id' | 'userId' | 'createdAt'>>): UserSettings {
    let settings = this.getOrCreateSettings(userId)
    return this.settingsRepository.update(settings.id, updates)
  }

  getSettings(userId: string): UserSettings | null {
    return this.settingsRepository.getByUserId(userId)
  }

  updateTheme(userId: string, theme: 'dark' | 'light'): UserSettings {
    return this.updateSettings(userId, { theme })
  }

  updateNotifications(userId: string, notifications: {
    taskUpdates?: boolean
    agentErrors?: boolean
    deploymentComplete?: boolean
  }): UserSettings {
    const updates: any = {}
    if (notifications.taskUpdates !== undefined) updates.notifyTaskUpdates = notifications.taskUpdates
    if (notifications.agentErrors !== undefined) updates.notifyAgentErrors = notifications.agentErrors
    if (notifications.deploymentComplete !== undefined) updates.notifyDeploymentComplete = notifications.deploymentComplete
    return this.updateSettings(userId, updates)
  }

  updateKeyboardShortcuts(userId: string, shortcuts: Record<string, string>): UserSettings {
    return this.updateSettings(userId, { keyboardShortcuts: shortcuts })
  }

  updateModelPreferences(userId: string, preferences: {
    defaultProvider?: string
    defaultModel?: string
  }): UserSettings {
    const current = this.getOrCreateSettings(userId)
    return this.updateSettings(userId, {
      modelPreferences: { ...current.modelPreferences, ...preferences }
    })
  }
}
