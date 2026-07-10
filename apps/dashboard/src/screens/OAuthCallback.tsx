import { useEffect, useRef } from 'react'
import { api } from '../lib/api'

type OAuthProvider = 'github' | 'google'

function getQueryParam(name: string): string | null {
  return new URLSearchParams(window.location.search).get(name)
}

export function OAuthCallback() {
  const processedRef = useRef(false)

  useEffect(() => {
    if (processedRef.current) return
    processedRef.current = true

    const code = getQueryParam('code')
    const error = getQueryParam('error')
    const state = getQueryParam('state') as OAuthProvider | null

    if (error) {
      window.opener?.postMessage({ type: 'oauth:error', error: decodeURIComponent(error) }, window.location.origin)
      window.close()
      return
    }

    if (!code || !state) {
      window.opener?.postMessage(
        { type: 'oauth:error', error: 'Missing authorization code or state' },
        window.location.origin,
      )
      window.close()
      return
    }

    const loginFn = state === 'github' ? api.loginWithGithub.bind(api) : api.loginWithGoogle.bind(api)

    loginFn(code)
      .then((res) => {
        window.opener?.postMessage({ type: 'oauth:success', token: res.token, user: res.user }, window.location.origin)
        window.close()
      })
      .catch((err: Error) => {
        window.opener?.postMessage(
          { type: 'oauth:error', error: err.message || 'OAuth login failed' },
          window.location.origin,
        )
        window.close()
      })
  }, [])

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-zinc-400 text-sm">Completing authentication...</div>
    </div>
  )
}
