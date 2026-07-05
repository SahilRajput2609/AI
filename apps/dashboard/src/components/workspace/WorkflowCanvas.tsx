import { AgentFlowCanvas } from './AgentFlowCanvas'
import { ChatPanel } from './ChatPanel'
import { Terminal } from './Terminal'

export function WorkflowCanvas() {
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
