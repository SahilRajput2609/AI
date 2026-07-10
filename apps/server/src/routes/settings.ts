import { Router } from 'express'
import { getDatabase } from '@ai-company/database'
import { SettingsService, requireAuth, type AuthRequest } from '@ai-company/backend'

const db = getDatabase()
const settingsService = new SettingsService(db.getDb())

export const settingsRouter = Router()

// Get user settings (requires auth)
settingsRouter.get('/me', requireAuth, async (req: AuthRequest, res) => {
  const userId = req.user?.id
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const settings = await settingsService.getOrCreateSettings(userId)
  res.json(settings)
})

// Update user settings
settingsRouter.put('/me', requireAuth, async (req: AuthRequest, res) => {
  const userId = req.user?.id
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const {
    theme,
    autoSave,
    defaultProjectName,
    notifyTaskUpdates,
    notifyAgentErrors,
    notifyDeploymentComplete,
    keyboardShortcuts,
    modelPreferences,
    agentPreferences,
  } = req.body

  const updates: any = {}
  if (theme !== undefined) updates.theme = theme
  if (autoSave !== undefined) updates.autoSave = autoSave
  if (defaultProjectName !== undefined) updates.defaultProjectName = defaultProjectName
  if (notifyTaskUpdates !== undefined) updates.notifyTaskUpdates = notifyTaskUpdates
  if (notifyAgentErrors !== undefined) updates.notifyAgentErrors = notifyAgentErrors
  if (notifyDeploymentComplete !== undefined) updates.notifyDeploymentComplete = notifyDeploymentComplete
  if (keyboardShortcuts !== undefined) updates.keyboardShortcuts = keyboardShortcuts
  if (modelPreferences !== undefined) updates.modelPreferences = modelPreferences
  if (agentPreferences !== undefined) updates.agentPreferences = agentPreferences

  const settings = await settingsService.updateSettings(userId, updates)
  res.json(settings)
})

// Update specific setting sections
settingsRouter.put('/me/theme', requireAuth, async (req: AuthRequest, res) => {
  const userId = req.user?.id
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const { theme } = req.body
  if (!theme || !['dark', 'light'].includes(theme)) {
    res.status(400).json({ error: 'Invalid theme' })
    return
  }

  const settings = await settingsService.updateTheme(userId, theme)
  res.json(settings)
})

settingsRouter.put('/me/notifications', requireAuth, async (req: AuthRequest, res) => {
  const userId = req.user?.id
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const settings = await settingsService.updateNotifications(userId, req.body)
  res.json(settings)
})

settingsRouter.put('/me/shortcuts', requireAuth, async (req: AuthRequest, res) => {
  const userId = req.user?.id
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const { shortcuts } = req.body
  if (!shortcuts || typeof shortcuts !== 'object') {
    res.status(400).json({ error: 'Invalid shortcuts' })
    return
  }

  const settings = await settingsService.updateKeyboardShortcuts(userId, shortcuts)
  res.json(settings)
})

settingsRouter.put('/me/models', requireAuth, async (req: AuthRequest, res) => {
  const userId = req.user?.id
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const settings = await settingsService.updateModelPreferences(userId, req.body)
  res.json(settings)
})
