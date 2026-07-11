import { useState, useEffect, useCallback } from 'react'
import type { Screen } from './lib/navigation'
import { Header } from './components/workspace/Header'
import { Sidebar } from './components/workspace/Sidebar'
import { NotificationToast } from './components/workspace/NotificationToast'
import { PageTransition } from './components/PageTransition'
import { CommandPalette } from './components/CommandPalette'
import { ErrorBoundary } from './components/ErrorBoundary'
import { LoginScreen } from './screens/LoginScreen'
import { OAuthCallback } from './screens/OAuthCallback'
import { api } from './lib/api'

import { WorkspaceScreen } from './screens/WorkspaceScreen'
import { ProjectScreen } from './screens/ProjectScreen'
import { KanbanScreen } from './screens/KanbanScreen'
import { FilesScreen } from './screens/FilesScreen'
import { TimelineScreen } from './screens/TimelineScreen'
import { SettingsScreen } from './screens/SettingsScreen'
import { AgentIdeScreen } from './screens/AgentIdeScreen'
import { AgentsConfigScreen } from './screens/AgentsConfigScreen'

function isOAuthCallback(): boolean {
  const params = new URLSearchParams(window.location.search)
  return (
    params.has('code') && params.has('state') && (params.get('state') === 'github' || params.get('state') === 'google')
  )
}

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [screen, setScreen] = useState<Screen>('workspace')
  const [projectId, setProjectId] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('ai_company_token')
    if (token) {
      api.setToken(token)
      setLoggedIn(true)
    }
    setIsInitializing(false)
  }, [])

  // Global keyboard shortcut for command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandOpen((prev) => !prev)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleLogout = useCallback(() => {
    localStorage.removeItem('ai_company_token')
    api.setToken(null)
    setLoggedIn(false)
  }, [])

  const handleNavigate = useCallback((s: Screen) => {
    setScreen(s)
    setProjectId(null)
    setMobileMenuOpen(false)
  }, [])

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center">
        <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    )
  }

  if (isOAuthCallback()) {
    return <OAuthCallback />
  }

  if (!loggedIn) {
    return <LoginScreen onLogin={() => setLoggedIn(true)} />
  }

  return (
    <div className="h-screen flex flex-col bg-[#000000] overflow-hidden">
      <Header
        onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        onCommandOpen={() => setCommandOpen(true)}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Mobile overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
        )}

        {/* Sidebar */}
        <div
          className={`
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          fixed lg:relative inset-y-0 left-0 z-40 lg:z-auto h-full
          transition-transform duration-200
        `}
        >
          <Sidebar
            activeScreen={screen}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-hidden flex flex-col">
          <ErrorBoundary>
            <PageTransition key={projectId ? `project-${projectId}` : screen}>
              <div className="flex-1 flex overflow-hidden h-full">
              {projectId ? (
                <ProjectScreen projectId={projectId} onBack={() => setProjectId(null)} />
              ) : screen === 'workspace' ? (
                <WorkspaceScreen
                  onOpenProject={(id) => {
                    setProjectId(id)
                    setScreen('workspace')
                  }}
                />
              ) : screen === 'kanban' ? (
                <KanbanScreen />
              ) : screen === 'files' ? (
                <FilesScreen />
              ) : screen === 'timeline' ? (
                <TimelineScreen />
              ) : screen === 'settings' ? (
                <SettingsScreen />
              ) : screen === 'agent-ide' ? (
                <AgentIdeScreen />
              ) : screen === 'agents' ? (
                <AgentsConfigScreen />
              ) : (
                <WorkspaceScreen
                  onOpenProject={(id) => {
                    setProjectId(id)
                    setScreen('workspace')
                  }}
                />
              )}
              </div>
            </PageTransition>
          </ErrorBoundary>
        </main>
      </div>

      <NotificationToast />
      <CommandPalette
        open={commandOpen}
        onClose={() => setCommandOpen(false)}
        onNavigate={handleNavigate}
        onOpenProject={(id) => {
          setProjectId(id)
          setScreen('workspace')
        }}
      />
    </div>
  )
}
