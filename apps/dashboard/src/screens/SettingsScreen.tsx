import { Settings, Cpu, Bot, Key, Bell, Keyboard } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@ai-company/ui'
import { Badge } from '@ai-company/ui'

interface DisplayModel {
  provider: string
  model: string
  status: 'active' | 'inactive'
  capabilities: string[]
  maxTokens: number
  cost: string
}

const categories = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'models', label: 'Models', icon: Cpu, count: 3 },
  { id: 'agents', label: 'Agents', icon: Bot },
  { id: 'api-keys', label: 'API Keys', icon: Key },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'shortcuts', label: 'Shortcuts', icon: Keyboard },
]

const models: DisplayModel[] = [
  { provider: 'OpenAI', model: 'GPT-4o', status: 'active', capabilities: ['Chat', 'Code', 'Reasoning'], maxTokens: 128000, cost: '$5.00/1M tokens' },
  { provider: 'Anthropic', model: 'Claude 3.5 Sonnet', status: 'active', capabilities: ['Chat', 'Code', 'Analysis'], maxTokens: 200000, cost: '$3.00/1M tokens' },
  { provider: 'Google', model: 'Gemini 1.5 Pro', status: 'inactive', capabilities: ['Chat', 'Code', 'Multimodal'], maxTokens: 1000000, cost: '$2.50/1M tokens' },
]

function GeneralSettings() {
  return (
    <div>
      <h2 className="text-lg font-semibold text-text-primary">General Settings</h2>
      <p className="text-sm text-text-muted mb-6">Workspace preferences and defaults</p>
      <div className="bg-surface-card border border-white/5 rounded-[12px] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-text-primary">Project Name</p>
            <p className="text-xs text-text-muted">Default project for new tasks</p>
          </div>
          <input className="bg-white/5 border border-white/10 rounded px-3 py-1.5 text-sm text-text-primary w-48" defaultValue="AI-Company" />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-text-primary">Auto-save</p>
            <p className="text-xs text-text-muted">Automatically save changes</p>
          </div>
          <input type="checkbox" defaultChecked className="toggle" />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-text-primary">Theme</p>
            <p className="text-xs text-text-muted">UI color scheme</p>
          </div>
          <select className="bg-white/5 border border-white/10 rounded px-3 py-1.5 text-sm text-text-primary">
            <option>Dark</option>
            <option>Light</option>
          </select>
        </div>
      </div>
    </div>
  )
}

function ModelsSettings() {
  return (
    <div>
      <h2 className="text-lg font-semibold text-text-primary">Model Configuration</h2>
      <p className="text-sm text-text-muted mb-6">Configure AI models available to agents</p>
      <div className="flex flex-col gap-3">
        {models.map((m) => (
          <div key={m.model} className="bg-surface-card border border-white/5 rounded-[12px] p-5 flex items-start justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md will-change-transform">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-text-primary">{m.provider}</span>
                <Badge variant={m.status === 'active' ? 'success' : 'default'}>{m.status === 'active' ? 'Active' : 'Inactive'}</Badge>
              </div>
              <p className="text-sm text-text-secondary">{m.model}</p>
              <div className="flex gap-2 mt-2">
                {m.capabilities.map((c) => (
                  <span key={c} className="text-[11px] text-text-muted bg-white/5 px-2 py-0.5 rounded">{c}</span>
                ))}
              </div>
              <p className="text-xs text-text-muted mt-2">{m.maxTokens.toLocaleString()} max tokens · {m.cost}</p>
            </div>
            <div className="flex gap-2">
              <button className="text-xs text-text-secondary hover:text-text-primary bg-white/5 px-3 py-1.5 rounded-[8px] cursor-pointer transition-colors">Configure</button>
              <button className="text-xs text-text-secondary hover:text-text-primary bg-white/5 px-3 py-1.5 rounded-[8px] cursor-pointer transition-colors">{m.status === 'active' ? 'Disable' : 'Enable'}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AgentsSettings() {
  return (
    <div>
      <h2 className="text-lg font-semibold text-text-primary">Agent Configuration</h2>
      <p className="text-sm text-text-muted mb-6">Manage agent roles and capabilities</p>
      <div className="bg-surface-card border border-white/5 rounded-[12px] p-5">
        <p className="text-sm text-text-secondary">Agent settings can be configured from the Agents tab in the sidebar.</p>
      </div>
    </div>
  )
}

function ApiKeysSettings() {
  return (
    <div>
      <h2 className="text-lg font-semibold text-text-primary">API Keys</h2>
      <p className="text-sm text-text-muted mb-6">Manage API keys for AI providers</p>
      <div className="bg-surface-card border border-white/5 rounded-[12px] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-text-primary">OpenAI</p>
            <p className="text-xs text-text-muted">••••••••••••••••</p>
          </div>
          <button className="text-xs text-text-secondary hover:text-text-primary bg-white/5 px-3 py-1.5 rounded-[8px] cursor-pointer">Update</button>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-text-primary">Anthropic</p>
            <p className="text-xs text-text-muted">Not configured</p>
          </div>
          <button className="text-xs text-text-secondary hover:text-text-primary bg-white/5 px-3 py-1.5 rounded-[8px] cursor-pointer">Add Key</button>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-text-primary">Google</p>
            <p className="text-xs text-text-muted">Not configured</p>
          </div>
          <button className="text-xs text-text-secondary hover:text-text-primary bg-white/5 px-3 py-1.5 rounded-[8px] cursor-pointer">Add Key</button>
        </div>
      </div>
    </div>
  )
}

function NotificationsSettings() {
  return (
    <div>
      <h2 className="text-lg font-semibold text-text-primary">Notifications</h2>
      <p className="text-sm text-text-muted mb-6">Configure notification preferences</p>
      <div className="bg-surface-card border border-white/5 rounded-[12px] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-text-primary">Task Updates</p>
            <p className="text-xs text-text-muted">Notifications when task status changes</p>
          </div>
          <input type="checkbox" defaultChecked className="toggle" />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-text-primary">Agent Errors</p>
            <p className="text-xs text-text-muted">Alert on agent execution errors</p>
          </div>
          <input type="checkbox" defaultChecked className="toggle" />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-text-primary">Deployment Complete</p>
            <p className="text-xs text-text-muted">Notify when deployments finish</p>
          </div>
          <input type="checkbox" defaultChecked className="toggle" />
        </div>
      </div>
    </div>
  )
}

function ShortcutsSettings() {
  return (
    <div>
      <h2 className="text-lg font-semibold text-text-primary">Keyboard Shortcuts</h2>
      <p className="text-sm text-text-muted mb-6">Customize keyboard shortcuts</p>
      <div className="bg-surface-card border border-white/5 rounded-[12px] p-5 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-primary">Deploy Task</span>
          <kbd className="bg-white/5 border border-white/10 px-2 py-0.5 rounded text-xs font-mono text-text-muted">Ctrl+Enter</kbd>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-primary">Search Tasks</span>
          <kbd className="bg-white/5 border border-white/10 px-2 py-0.5 rounded text-xs font-mono text-text-muted">Ctrl+K</kbd>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-primary">Toggle Sidebar</span>
          <kbd className="bg-white/5 border border-white/10 px-2 py-0.5 rounded text-xs font-mono text-text-muted">Ctrl+B</kbd>
        </div>
      </div>
    </div>
  )
}

const tabComponents: Record<string, React.FC> = {
  general: GeneralSettings,
  models: ModelsSettings,
  agents: AgentsSettings,
  'api-keys': ApiKeysSettings,
  notifications: NotificationsSettings,
  shortcuts: ShortcutsSettings,
}

export function SettingsScreen() {
  const [activeCategory, setActiveCategory] = useState('models')

  const ActiveComponent = tabComponents[activeCategory] || ModelsSettings

  return (
    <div className="flex-1 flex overflow-hidden">
      <div className="w-[240px] flex-shrink-0 bg-surface-sidebar border-r border-white/5 flex flex-col p-4 gap-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-[8px] text-sm transition-all duration-200 cursor-pointer relative',
              activeCategory === cat.id
                ? 'bg-accent-primary-subtle text-text-primary font-medium'
                : 'text-text-secondary hover:bg-white/5 hover:text-text-primary',
            )}
          >
            {activeCategory === cat.id && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-accent-primary rounded-full" />
            )}
            <cat.icon size={16} />
            <span className="flex-1 text-left">{cat.label}</span>
            {cat.count && <Badge variant="default">{cat.count}</Badge>}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-2xl">
          <ActiveComponent />
        </div>
      </div>
    </div>
  )
}
