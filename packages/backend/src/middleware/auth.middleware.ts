import type { Request, Response, NextFunction } from 'express'
import { createHmac, timingSafeEqual } from 'crypto'

export interface AuthRequest extends Request {
  user?: {
    id: string
    email: string
    role: string
  }
}

function getSecret(): string {
  return process.env.JWT_SECRET || 'ai-company-dev-secret-key'
}

// Verify HMAC-SHA256 signed JWT
function verifyToken(token: string): { id: string; email: string; role: string } | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const signature = createHmac('sha256', getSecret()).update(`${parts[0]}.${parts[1]}`).digest('base64url')

    const sigBuffer = Buffer.from(signature)
    const tokenSigBuffer = Buffer.from(parts[2])
    if (sigBuffer.length !== tokenSigBuffer.length) return null

    if (!timingSafeEqual(sigBuffer, tokenSigBuffer)) return null

    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf-8'))
    if (payload.exp && Date.now() >= payload.exp * 1000) return null

    return { id: payload.id, email: payload.email, role: payload.role }
  } catch {
    return null
  }
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    if (process.env.REQUIRE_AUTH === 'true' || process.env.NODE_ENV === 'production') {
      return next()
    }
    req.user = {
      id: 'dev-user',
      email: 'dev@ai-company.com',
      role: 'admin',
    }
    return next()
  }

  const decoded = verifyToken(token)
  if (!decoded) {
    res.status(401).json({ error: 'Invalid or expired token' })
    return
  }

  req.user = decoded
  next()
}

export function generateToken(payload: { id: string; email: string; role: string }): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + 86400 })).toString(
    'base64url',
  )
  const signature = createHmac('sha256', getSecret()).update(`${header}.${body}`).digest('base64url')
  return `${header}.${body}.${signature}`
}

// Require authentication
export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }
  next()
}

// Role-based access control
export function requireRole(role: string) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== role) {
      res.status(403).json({ error: 'Forbidden' })
      return
    }
    next()
  }
}
