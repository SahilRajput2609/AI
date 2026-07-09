import { Router } from 'express'
import crypto from 'crypto'
import { UserRepository, getDatabase } from '@ai-company/database'
import { generateToken } from '@ai-company/backend'

export const oauthRouter = Router()

interface OAuthUserInfo {
  id: string
  email: string
  name?: string
  avatar_url?: string
}

async function fetchGitHubUser(code: string): Promise<OAuthUserInfo> {
  const clientId = process.env.GITHUB_CLIENT_ID
  const clientSecret = process.env.GITHUB_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('GitHub OAuth is not configured. Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET.')
  }

  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
  })

  const tokenData = await tokenRes.json() as { access_token?: string; error?: string }
  if (!tokenData.access_token) {
    throw new Error(tokenData.error || 'Failed to exchange GitHub code for access token')
  }

  const userRes = await fetch('https://api.github.com/user', {
    headers: { Authorization: `Bearer ${tokenData.access_token}`, Accept: 'application/json' },
  })
  const ghUser = await userRes.json() as { id: number; email?: string; login: string; avatar_url?: string }

  let email = ghUser.email
  if (!email) {
    const emailsRes = await fetch('https://api.github.com/user/emails', {
      headers: { Authorization: `Bearer ${tokenData.access_token}`, Accept: 'application/json' },
    })
    const emails = await emailsRes.json() as { email: string; primary: boolean }[]
    email = emails.find(e => e.primary)?.email ?? emails[0]?.email
  }

  if (!email) {
    throw new Error('No email found on GitHub account. Please make your email public or add one.')
  }

  return {
    id: String(ghUser.id),
    email,
    name: ghUser.login,
    avatar_url: ghUser.avatar_url,
  }
}

async function fetchGoogleUser(code: string): Promise<OAuthUserInfo> {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.')
  }

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5173/auth/google/callback',
      grant_type: 'authorization_code',
    }),
  })

  const tokenData = await tokenRes.json() as { access_token?: string; error?: string }
  if (!tokenData.access_token) {
    throw new Error(tokenData.error || 'Failed to exchange Google code for access token')
  }

  const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  })
  const gUser = await userRes.json() as { id: string; email: string; name?: string; picture?: string }

  return {
    id: gUser.id,
    email: gUser.email,
    name: gUser.name,
    avatar_url: gUser.picture,
  }
}

function findOrCreateOAuthUser(provider: string, info: OAuthUserInfo) {
  const db = getDatabase()
  const userRepository = new UserRepository(db.getDb())

  let user = userRepository.findByOAuthProvider(provider, info.id)

  if (!user) {
    user = userRepository.findByEmail(info.email)
    if (user) {
      return { user, isNew: false, linked: true }
    }

    user = userRepository.create({
      email: info.email,
      password_hash: null,
      salt: null,
      role: 'user',
      oauth_provider: provider,
      oauth_id: info.id,
      avatar_url: info.avatar_url ?? null,
    })
    return { user, isNew: true, linked: false }
  }

  return { user, isNew: false, linked: false }
}

oauthRouter.post('/github', async (req, res) => {
  try {
    const { code } = req.body
    if (!code) {
      res.status(400).json({ error: 'GitHub authorization code is required' })
      return
    }

    const userInfo = await fetchGitHubUser(code)
    const { user } = findOrCreateOAuthUser('github', userInfo)

    const token = generateToken({ id: user.id, email: user.email, role: user.role })

    res.json({
      token,
      user: { id: user.id, email: user.email, role: user.role, avatar_url: user.avatar_url },
    })
  } catch (error: any) {
    console.error('GitHub OAuth error:', error)
    res.status(500).json({ error: error.message || 'GitHub authentication failed' })
  }
})

oauthRouter.post('/google', async (req, res) => {
  try {
    const { code } = req.body
    if (!code) {
      res.status(400).json({ error: 'Google authorization code is required' })
      return
    }

    const userInfo = await fetchGoogleUser(code)
    const { user } = findOrCreateOAuthUser('google', userInfo)

    const token = generateToken({ id: user.id, email: user.email, role: user.role })

    res.json({
      token,
      user: { id: user.id, email: user.email, role: user.role, avatar_url: user.avatar_url },
    })
  } catch (error: any) {
    console.error('Google OAuth error:', error)
    res.status(500).json({ error: error.message || 'Google authentication failed' })
  }
})

// OAuth config endpoint for frontend to get client IDs
oauthRouter.get('/config', (_req, res) => {
  res.json({
    github: { clientId: process.env.GITHUB_CLIENT_ID || null },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || null,
      redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5173/auth/google/callback',
    },
  })
})
