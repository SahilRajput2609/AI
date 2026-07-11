import { Router } from 'express'
import { getDatabase, UserRepository } from '@ai-company/database'
import { SettingsService, authMiddleware, requireAuth, type AuthRequest, asyncHandler } from '@ai-company/backend'

const dbConnection = getDatabase()
const dbInstance = dbConnection.getDb()
const settingsService = new SettingsService(dbInstance)
const userRepository = new UserRepository(dbInstance)

export const settingsRouter = Router()

// Get user settings (requires auth)
settingsRouter.get(
  '/me',
  authMiddleware,
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const userId = req.user?.id
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    // Return default settings for all users in dev mode
    const settings = {
      userId,
      theme: 'light',
      autoSave: true,
      defaultProjectName: 'New Project',
      notifyTaskUpdates: true,
      notifyAgentErrors: true,
      notifyDeploymentComplete: true,
      keyboardShortcuts: {},
      modelPreferences: { defaultModel: 'gpt-4' },
      agentPreferences: {}
    }
    res.json(settings)
  }),
)

// Update user settings
settingsRouter.put(
  '/me',
  authMiddleware,
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const userId = req.user?.id
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    try {
      // Ensure user exists in users table
      let user = userRepository.findById(userId)
      if (!user) {
        const now = Date.now()
        const stmt = dbInstance.prepare(`
          INSERT INTO users (id, email, password_hash, salt, role, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `)
        stmt.run(userId, `dev-user-${userId}@example.com`, '', '', 'admin', now, now)
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
    } catch (error: any) {
      console.error('Error updating settings:', error)
      res.status(500).json({ error: 'Failed to update settings', details: error.message })
    }
  }),
)

// Update specific setting sections
settingsRouter.put(
  '/me/theme',
  authMiddleware,
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const userId = req.user?.id
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    try {
      // Ensure user exists in users table
      let user = userRepository.findById(userId)
      if (!user) {
        const now = Date.now()
        const stmt = dbInstance.prepare(`
          INSERT INTO users (id, email, password_hash, salt, role, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `)
        stmt.run(userId, `dev-user-${userId}@example.com`, '', '', 'admin', now, now)
      }

      const { theme } = req.body
      if (!theme || !['dark', 'light'].includes(theme)) {
        res.status(400).json({ error: 'Invalid theme' })
        return
      }

      const settings = await settingsService.updateTheme(userId, theme)
      res.json(settings)
    } catch (error: any) {
      console.error('Error updating theme:', error)
      res.status(500).json({ error: 'Failed to update theme', details: error.message })
    }
  }),
)

settingsRouter.put(
  '/me/notifications',
  authMiddleware,
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const userId = req.user?.id
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    try {
      // Ensure user exists in users table
      let user = userRepository.findById(userId)
      if (!user) {
        const now = Date.now()
        const stmt = dbInstance.prepare(`
          INSERT INTO users (id, email, password_hash, salt, role, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `)
        stmt.run(userId, `dev-user-${userId}@example.com`, '', '', 'admin', now, now)
      }

      const settings = await settingsService.updateNotifications(userId, req.body)
      res.json(settings)
    } catch (error: any) {
      console.error('Error updating notifications:', error)
      res.status(500).json({ error: 'Failed to update notifications', details: error.message })
    }
  }),
)

settingsRouter.put(
  '/me/shortcuts',
  authMiddleware,
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const userId = req.user?.id
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    try {
      // Ensure user exists in users table
      let user = userRepository.findById(userId)
      if (!user) {
        const now = Date.now()
        const stmt = dbInstance.prepare(`
          INSERT INTO users (id, email, password_hash, salt, role, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `)
        stmt.run(userId, `dev-user-${userId}@example.com`, '', '', 'admin', now, now)
      }

      const { shortcuts } = req.body
      if (!shortcuts || typeof shortcuts !== 'object') {
        res.status(400).json({ error: 'Invalid shortcuts' })
        return
      }

      const settings = await settingsService.updateKeyboardShortcuts(userId, shortcuts)
      res.json(settings)
    } catch (error: any) {
      console.error('Error updating shortcuts:', error)
      res.status(500).json({ error: 'Failed to update shortcuts', details: error.message })
    }
  }),
)

settingsRouter.put(
  '/me/models',
  authMiddleware,
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const userId = req.user?.id
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    try {
      // Ensure user exists in users table
      let user = userRepository.findById(userId)
      if (!user) {
        const now = Date.now()
        const stmt = dbInstance.prepare(`
          INSERT INTO users (id, email, password_hash, salt, role, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `)
        stmt.run(userId, `dev-user-${userId}@example.com`, '', '', 'admin', now, now)
      }

      const settings = await settingsService.updateModelPreferences(userId, req.body)
      res.json(settings)
    } catch (error: any) {
      console.error('Error updating model preferences:', error)
      res.status(500).json({ error: 'Failed to update model preferences', details: error.message })
    }
  }),
)
