import { Router } from 'express'
import { getDatabase, UserRepository } from '@ai-company/database'
import { requireAuth, type AuthRequest } from '@ai-company/backend'

const db = getDatabase()
const userRepository = new UserRepository(db.getDb())

export const usersRouter = Router()

// Get current user profile
usersRouter.get('/me', requireAuth, (req: AuthRequest, res) => {
  const userId = req.user?.id
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  try {
    const user = userRepository.findById(userId)
    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    const { password_hash, salt, ...safeUser } = user
    res.json(safeUser)
  } catch (error) {
    console.error('Error fetching user:', error)
    res.status(500).json({ error: 'Failed to fetch user' })
  }
})

// Get user by ID (admin only or own profile)
usersRouter.get('/:id', requireAuth, (req: AuthRequest, res) => {
  const userId = req.user?.id
  const targetId = req.params.id

  if (userId !== targetId && req.user?.role !== 'admin') {
    res.status(403).json({ error: 'Forbidden' })
    return
  }

  try {
    const user = userRepository.findById(targetId as string)
    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    const { password_hash, salt, ...safeUser } = user
    res.json(safeUser)
  } catch (error) {
    console.error('Error fetching user:', error)
    res.status(500).json({ error: 'Failed to fetch user' })
  }
})

// Delete user (admin only or self)
usersRouter.delete('/:id', requireAuth, (req: AuthRequest, res) => {
  const userId = req.user?.id
  const targetId = req.params.id

  if (userId !== targetId && req.user?.role !== 'admin') {
    res.status(403).json({ error: 'Forbidden' })
    return
  }

  try {
    userRepository.delete(targetId as string)
    res.json({ status: 'deleted' })
  } catch (error) {
    console.error('Error deleting user:', error)
    res.status(500).json({ error: 'Failed to delete user' })
  }
})
