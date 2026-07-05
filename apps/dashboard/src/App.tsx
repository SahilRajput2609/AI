import { useState } from 'react'
import type { Screen } from './lib/navigation'
import { Header } from './components/workspace/Header'
import { Sidebar } from './components/workspace/Sidebar'
import { NotificationToast } from './components/workspace/NotificationToast'
import { PageTransition } from './components/PageTransition'
import { WorkflowCanvas } from './components/workspace/WorkflowCanvas'
import { KanbanScreen } from './screens/KanbanScreen'
import { FilesScreen } from './screens/FilesScreen'
import { TimelineScreen } from './screens/TimelineScreen'
import { SettingsScreen } from './screens/SettingsScreen'
import { LoginScreen } from './screens/LoginScreen'
import { AgentIdeScreen } from './screens/AgentIdeScreen'
import { AgentsConfigScreen } from './screens/AgentsConfigScreen'

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [screen, setScreen] = useState<Screen>('workspace')

  if (!loggedIn) {
    return <LoginScreen onLogin={() => setLoggedIn(true)} />
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface-bg">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeScreen={screen} onNavigate={setScreen} />
        <PageTransition key={screen} className="flex-1 flex overflow-hidden">
          {screen === 'workspace' && <WorkflowCanvas />}
          {screen === 'kanban' && <KanbanScreen />}
          {screen === 'files' && <FilesScreen />}
          {screen === 'timeline' && <TimelineScreen />}
          {screen === 'settings' && <SettingsScreen />}
          {screen === 'agent-ide' && <AgentIdeScreen />}
          {screen === 'agents' && <AgentsConfigScreen />}
        </PageTransition>
      </div>
      <NotificationToast />
    </div>
  )
}