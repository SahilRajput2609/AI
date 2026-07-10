import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence, easeOut } from 'framer-motion'
import { Mail, Lock, ArrowRight, Eye, EyeOff, Zap, Shield, Users, Globe, Sun, ChevronDown } from 'lucide-react'
import { api } from '../lib/api'
import { BackgroundEffects } from '../components/BackgroundEffects'

interface RegisterScreenProps {
  onLogin: () => void
}

const features = [
  {
    icon: Zap,
    title: 'AI Powered',
    desc: 'Build production-ready software using intelligent AI.',
  },
  {
    icon: Shield,
    title: 'Secure Workspace',
    desc: 'Enterprise‑grade authentication and encrypted storage.',
  },
  {
    icon: Users,
    title: 'Collaboration',
    desc: 'Work together with teammates in real time.',
  },
]

const languages = ['English', 'Spanish', 'French', 'German', 'Japanese', 'Chinese']

const stagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06 },
  },
}

const fadeUp = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: easeOut } },
}

const inputVariant = (i: number) => ({
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { delay: 0.45 + i * 0.07, duration: 0.3, ease: easeOut },
  },
})

export function RegisterScreen({ onLogin }: RegisterScreenProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [language, setLanguage] = useState('English')
  const [langOpen, setLangOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('settings_theme') !== 'Light')
  const langRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleOAuthMessage = useCallback(
    (event: MessageEvent) => {
      if (event.data?.type === 'oauth:success') {
        localStorage.setItem('ai_company_token', event.data.token)
        api.setToken(event.data.token)
        onLogin()
      } else if (event.data?.type === 'oauth:error') {
        setError(event.data.error || 'OAuth authentication failed')
      }
    },
    [onLogin],
  )

  useEffect(() => {
    window.addEventListener('message', handleOAuthMessage)
    return () => window.removeEventListener('message', handleOAuthMessage)
  }, [handleOAuthMessage])

  const openOAuthPopup = async (provider: 'github' | 'google' | 'microsoft') => {
    setError('')
    try {
      const config = await api.getOAuthConfig()
      let url: string

      if (provider === 'github') {
        if (!config.github.clientId) {
          setError('GitHub OAuth is not configured')
          return
        }
        const redirectUri = `${window.location.origin}?state=github`
        url = `https://github.com/login/oauth/authorize?client_id=${config.github.clientId}&scope=user:email&state=github&redirect_uri=${encodeURIComponent(
          redirectUri,
        )}`
      } else if (provider === 'google') {
        if (!config.google.clientId) {
          setError('Google OAuth is not configured')
          return
        }
        const redirectUri = config.google.redirectUri || `${window.location.origin}?state=google`
        url = `https://accounts.google.com/o/oauth2/auth?client_id=${config.google.clientId}&redirect_uri=${encodeURIComponent(
          redirectUri,
        )}&response_type=code&scope=openid%20email%20profile&state=google`
      } else {
        setError('Microsoft OAuth is not configured yet')
        return
      }

      const width = 500
      const height = 600
      const left = window.screenX + (window.outerWidth - width) / 2
      const top = window.screenY + (window.outerHeight - height) / 2
      window.open(url, 'oauth_popup', `width=${width},height=${height},left=${left},top=${top},popup=yes`)
    } catch (err: any) {
      setError(err.message || 'Failed to start OAuth flow')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setIsLoading(true)
    try {
      const res = await api.signup(email, password)
      localStorage.setItem('ai_company_token', res.token)
      api.setToken(res.token)
      onLogin()
    } catch (err: any) {
      setError(err.message || 'Authentication failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#000000] flex relative overflow-hidden">
      {/* Left Branding Panel */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex flex-col justify-between w-[45%] p-12 xl:p-16 relative"
      >
        <BackgroundEffects />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#000000_75%)] pointer-events-none" />
        <div className="relative z-20 flex items-center gap-3 self-end mb-8">
          {/* Language selector */}
          <div ref={langRef} className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-[#202020] bg-[#080808] text-[#6B7280] text-xs hover:border-[#333] hover:text-[#A1A1AA] transition-all duration-200"
            >
              <Globe size={13} />
              {language}
              <ChevronDown size={11} className={`transition-transform duration-150 ${langOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {langOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-1 w-36 bg-[#090909] border border-[#202020] rounded-lg py-1 shadow-xl z-50"
                >
                  {languages.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => {
                        setLanguage(lang)
                        setLangOpen(false)
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${
                        lang === language ? 'text-white bg-[#111]' : 'text-[#6B7280] hover:text-white hover:bg-[#111]'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {/* Dark mode toggle */}
          <button
            onClick={() => {
              setDarkMode(!darkMode)
              localStorage.setItem('settings_theme', darkMode ? 'Light' : 'Dark')
            }}
            className="w-8 h-8 rounded-lg border border-[#202020] bg-[#080808] flex items-center justify-center text-[#6B7280] hover:border-[#333] hover:text-[#A1A1AA] transition-all duration-200"
          >
            <Sun size={13} />
          </button>
        </div>
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center flex-1">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="flex items-center gap-3 mb-12"
          >
            <div className="w-10 h-10 rounded-xl bg-[#7C6BFF] flex items-center justify-center">
              <span className="text-white text-sm font-bold">A</span>
            </div>
            <span className="text-sm font-semibold text-white tracking-wide">AI-Company</span>
            <span className="text-[10px] font-medium text-[#7C6BFF] bg-[#7C6BFF]/10 border border-[#7C6BFF]/20 px-2 py-0.5 rounded-full ml-1">
              AI Powered Platform
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.18 }}
            className="text-[52px] xl:text-[64px] font-bold text-white leading-[1.05] tracking-[-0.025em] mb-6"
          >
            Build anything
            <br />
            with <span className="text-[#7C6BFF]">AI</span>.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.25 }}
            className="text-base text-[#6B7280] leading-relaxed max-w-[380px] mb-14"
          >
            Create applications, websites, automation, desktop software, mobile apps, and AI agents using natural
            language.
          </motion.p>
          <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-5">
            {features.map((f) => (
              <motion.div key={f.title} variants={fadeUp} className="flex items-start gap-4 group">
                <div className="w-9 h-9 rounded-lg bg-[#090909] border border-[#202020] flex items-center justify-center flex-shrink-0 group-hover:border-[#7C6BFF]/30 transition-colors duration-200">
                  <f.icon size={15} className="text-[#7C6BFF]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white mb-0.5">{f.title}</p>
                  <p className="text-xs text-[#6B7280] leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
        <div className="relative z-10 mt-12">
          <svg
            viewBox="0 0 400 60"
            className="w-full max-w-[300px] opacity-[0.04]"
            fill="none"
            stroke="#7C6BFF"
            strokeWidth="0.7"
          >
            <path d="M0 50 Q50 15, 100 35 T200 25 T300 45 T400 30" />
            <path d="M0 55 Q60 25, 120 40 T240 30 T360 50 T400 35" />
          </svg>
        </div>
      </motion.div>

      {/* Right Login Panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-16 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_50%,rgba(124,107,255,0.03)_0%,transparent_60%)] pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut', delay: 0.1 }}
          className="w-full max-w-[520px] relative z-10"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex items-center gap-3 mb-10 lg:hidden"
          >
            <div className="w-10 h-10 rounded-xl bg-[#7C6BFF] flex items-center justify-center">
              <span className="text-white text-sm font-bold">A</span>
            </div>
            <span className="text-sm font-semibold text-white tracking-wide">AI-Company</span>
          </motion.div>

          <div className="bg-[#111111] border border-[#202020] rounded-[22px] p-10 sm:p-12 shadow-[0_0_80px_rgba(0,0,0,0.5)]">
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
              className="w-14 h-14 rounded-2xl bg-[#7C6BFF] flex items-center justify-center mb-8 shadow-[0_0_24px_rgba(124,107,255,0.2)]"
            >
              <span className="text-white text-xl font-bold">A</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
              className="mb-8"
            >
              <h2 className="text-[32px] sm:text-[36px] font-bold text-white tracking-[-0.02em] mb-2">
                Create account
              </h2>
              <p className="text-sm text-[#6B7280]">Enter your details to get started.</p>
            </motion.div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-3">
                <motion.div variants={inputVariant(0)} initial="hidden" animate="visible">
                  <div className="relative">
                    <Mail
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none"
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        setError('')
                      }}
                      placeholder="you@example.com"
                      disabled={isLoading}
                      autoComplete="email"
                      aria-label="Email address"
                      className="w-full h-12 bg-[#090909] border border-[#202020] rounded-xl pl-12 pr-4 text-sm text-white placeholder-[#6B7280] outline-none transition-all duration-200 focus:border-[#7C6BFF]/50 focus:ring-1 focus:ring-[#7C6BFF]/30 disabled:opacity-40"
                    />
                  </div>
                </motion.div>
                <motion.div variants={inputVariant(1)} initial="hidden" animate="visible">
                  <div className="relative">
                    <Lock
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none"
                    />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value)
                        setError('')
                      }}
                      placeholder="Password"
                      disabled={isLoading}
                      autoComplete="new-password"
                      aria-label="Password"
                      className="w-full h-12 bg-[#090909] border border-[#202020] rounded-xl pl-12 pr-12 text-sm text-white placeholder-[#6B7280] outline-none transition-all duration-200 focus:border-[#7C6BFF]/50 focus:ring-1 focus:ring-[#7C6BFF]/30 disabled:opacity-40"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#A1A1AA] transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </motion.div>
                <AnimatePresence>
                  <motion.div variants={inputVariant(2)} initial="hidden" animate="visible" exit="hidden">
                    <div className="relative">
                      <Lock
                        size={16}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none"
                      />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value)
                          setError('')
                        }}
                        placeholder="Confirm password"
                        disabled={isLoading}
                        autoComplete="new-password"
                        aria-label="Confirm password"
                        className="w-full h-12 bg-[#090909] border border-[#202020] rounded-xl pl-12 pr-4 text-sm text-white placeholder-[#6B7280] outline-none transition-all duration-200 focus:border-[#7C6BFF]/50 focus:ring-1 focus:ring-[#7C6BFF]/30 disabled:opacity-40"
                      />
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="text-xs text-[#EF4444] text-center"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>
              <motion.div variants={inputVariant(3)} initial="hidden" animate="visible">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-white text-black text-sm font-semibold rounded-xl flex items-center justify-center gap-2.5 hover:bg-white/95 hover:shadow-[0_4px_20px_rgba(255,255,255,0.15)] hover:scale-[1.01] active:scale-[0.98] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                  ) : (
                    <>
                      Create account
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </motion.div>
            </form>
            <motion.div
              variants={inputVariant(4)}
              initial="hidden"
              animate="visible"
              className="flex items-center gap-4 my-7"
            >
              <div className="flex-1 h-px bg-[#202020]" />
              <span className="text-xs text-[#6B7280]">Or continue with</span>
              <div className="flex-1 h-px bg-[#202020]" />
            </motion.div>
            <motion.div variants={inputVariant(5)} initial="hidden" animate="visible" className="flex gap-3">
              <button
                onClick={() => openOAuthPopup('github')}
                className="flex-1 h-11 flex items-center justify-center gap-2.5 rounded-xl border border-[#202020] bg-[#090909] text-[#A1A1AA] text-sm font-medium hover:bg-[#111] hover:border-[#333] hover:text-white transition-all duration-200"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                </svg>
                GitHub
              </button>
              <button
                onClick={() => openOAuthPopup('google')}
                className="flex-1 h-11 flex items-center justify-center gap-2.5 rounded-xl border border-[#202020] bg-[#090909] text-[#A1A1AA] text-sm font-medium hover:bg-[#111] hover:border-[#333] hover:text-white transition-all duration-200"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Google
              </button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
