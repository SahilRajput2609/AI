import { AgentFlowCanvas } from '../components/workspace/AgentFlowCanvas'
import { ChatPanel } from '../components/workspace/ChatPanel'
import { Terminal } from '../components/workspace/Terminal'

export function WorkspaceScreen() {
  return (
    <div className="flex-1 flex overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        <AgentFlowCanvas />
        <Terminal />
      </div>
      <ChatPanel />
    </div>
  )
}
