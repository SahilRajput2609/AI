import { Router } from 'express'
import crypto from 'crypto'
import { UserRepository, getDatabase } from '@ai-company/database'
import { generateToken, authMiddleware, requireAuth } from '@ai-company/backend'

const PBKDF2_ITERATIONS = 100000

export const authRouter = Router()

// Sign up route
authRouter.post('/signup', (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' })
      return
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters' })
      return
    }

    const db = getDatabase()
    const userRepository = new UserRepository(db.getDb())

    const existingUser = userRepository.findByEmail(email)
    if (existingUser) {
      res.status(400).json({ error: 'Email is already registered' })
      return
    }

    const salt = crypto.randomBytes(16).toString('hex')
    const passwordHash = crypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, 64, 'sha512').toString('hex')

    const user = userRepository.create({
      email,
      password_hash: passwordHash,
      salt,
      role: 'user',
    })

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    })

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error during signup' })
  }
})

// Login route
authRouter.post('/login', (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' })
      return
    }

    const db = getDatabase()
    const userRepository = new UserRepository(db.getDb())

    const user = userRepository.findByEmail(email)
    if (!user || !user.password_hash || !user.salt) {
      res.status(400).json({ error: 'Invalid email or password' })
      return
    }

    const inputHash = crypto.pbkdf2Sync(password, user.salt, PBKDF2_ITERATIONS, 64, 'sha512').toString('hex')
    
    // Constant time comparison for password hashes
    const match = crypto.timingSafeEqual(
      Buffer.from(user.password_hash, 'hex'),
      Buffer.from(inputHash, 'hex')
    )

    if (!match) {
      res.status(400).json({ error: 'Invalid email or password' })
      return
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    })

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error during login' })
  }
})

// Get current user route
authRouter.get('/me', authMiddleware, requireAuth, (req: any, res) => {
  res.json({ user: req.user })
})
