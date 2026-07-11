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
    } else {
      // Auto-login in dev mode
      localStorage.setItem('ai_company_token', 'dev-token-' + Date.now())
      api.setToken('dev-token-' + Date.now())
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
    <div className="h-screen flex flex-col bg-black text-white overflow-hidden">
      <div className="bg-gray-900 p-4 border-b border-gray-800 sticky top-0 z-50">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">🤖 AI-Company Dashboard</h1>
          <div className="flex gap-2">
            <button onClick={() => handleNavigate('workspace')} className={`px-3 py-2 rounded text-sm font-medium transition ${screen === 'workspace' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}>Workspace</button>
            <button onClick={() => handleNavigate('agent-ide')} className={`px-3 py-2 rounded text-sm font-medium transition ${screen === 'agent-ide' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}>Agent IDE</button>
            <button onClick={() => handleNavigate('kanban')} className={`px-3 py-2 rounded text-sm font-medium transition ${screen === 'kanban' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}>Kanban</button>
            <button onClick={() => handleNavigate('timeline')} className={`px-3 py-2 rounded text-sm font-medium transition ${screen === 'timeline' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}>Timeline</button>
            <button onClick={() => handleNavigate('files')} className={`px-3 py-2 rounded text-sm font-medium transition ${screen === 'files' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}>Files</button>
            <button onClick={() => handleNavigate('settings')} className={`px-3 py-2 rounded text-sm font-medium transition ${screen === 'settings' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}>Settings</button>
            <button onClick={() => handleNavigate('agents')} className={`px-3 py-2 rounded text-sm font-medium transition ${screen === 'agents' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}>Agents</button>
            <button onClick={handleLogout} className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded text-sm font-medium transition">Logout</button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <ErrorBoundary>
          <div className="p-6">
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
        </ErrorBoundary>
      </div>
    </div>
  )
}
