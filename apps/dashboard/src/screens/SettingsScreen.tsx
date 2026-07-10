import { Settings, Cpu, Bot, Key, Bell, Keyboard } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Badge } from '../components/ui/Badge'
import { api } from '../lib/api'

const categories = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'models', label: 'Models', icon: Cpu },
  { id: 'agents', label: 'Agents', icon: Bot },
  { id: 'api-keys', label: 'API Keys', icon: Key },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'shortcuts', label: 'Shortcuts', icon: Keyboard },
]

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-1">{title}</h2>
      {description && <p className="text-sm text-[#6E6E6E] mb-6">{description}</p>}
      <div className="rounded-lg border border-[#202020] bg-[#0F0F0F] divide-y divide-[#202020]">{children}</div>
    </div>
  )
}

function SettingRow({
  label,
  description,
  children,
}: {
  label: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between p-4">
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        {description && <p className="text-xs text-[#6E6E6E] mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  )
}

function GeneralSettings() {
  const [projectName, setProjectName] = useState('AI-Company')
  const [autoSave, setAutoSave] = useState(true)
  const [theme, setTheme] = useState('Dark')

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await api.getSettings()
        setProjectName(settings.defaultProjectName)
        setAutoSave(settings.autoSave)
        setTheme(settings.theme === 'dark' ? 'Dark' : 'Light')
      } catch (error) {
        console.error('Failed to load settings:', error)
      }
    }
    loadSettings()
  }, [])

  const saveSetting = async (key: string, value: string | boolean) => {
    try {
      if (key === 'projectName') {
        await api.updateSettings({ defaultProjectName: value })
      } else if (key === 'autoSave') {
        await api.updateSettings({ autoSave: value })
      } else if (key === 'theme') {
        await api.updateTheme(value === 'Dark' ? 'dark' : 'light')
      }
    } catch (error) {
      console.error('Failed to save setting:', error)
    }
  }

  return (
    <Section title="General" description="Workspace preferences and defaults">
      <SettingRow label="Default Project Name" description="Default project for new tasks">
        <input
          className="h-8 w-48 bg-[#080808] border border-[#202020] rounded-lg px-3 text-sm text-white outline-none focus:border-[#333]"
          value={projectName}
          onChange={(e) => {
            setProjectName(e.target.value)
            saveSetting('projectName', e.target.value)
          }}
        />
      </SettingRow>
      <SettingRow label="Auto-save" description="Automatically save changes">
        <input
          type="checkbox"
          checked={autoSave}
          onChange={(e) => {
            setAutoSave(e.target.checked)
            saveSetting('autoSave', e.target.checked)
          }}
          className="w-4 h-4 accent-white cursor-pointer"
        />
      </SettingRow>
      <SettingRow label="Theme" description="UI color scheme">
        <select
          value={theme}
          onChange={(e) => {
            setTheme(e.target.value)
            saveSetting('theme', e.target.value)
          }}
          className="h-8 bg-[#080808] border border-[#202020] rounded-lg px-3 text-sm text-white outline-none focus:border-[#333]"
        >
          <option>Dark</option>
        </select>
      </SettingRow>
    </Section>
  )
}

function ModelsSettings() {
  const models = [
    {
      provider: 'OpenAI',
      model: 'GPT-4o',
      status: 'active',
      capabilities: ['Chat', 'Code', 'Reasoning'],
      maxTokens: 128000,
      cost: '$5.00/1M tokens',
    },
    {
      provider: 'Anthropic',
      model: 'Claude 3.5 Sonnet',
      status: 'active',
      capabilities: ['Chat', 'Code', 'Analysis'],
      maxTokens: 200000,
      cost: '$3.00/1M tokens',
    },
    {
      provider: 'Google',
      model: 'Gemini 1.5 Pro',
      status: 'inactive',
      capabilities: ['Chat', 'Code', 'Multimodal'],
      maxTokens: 1000000,
      cost: '$2.50/1M tokens',
    },
  ]
  return (
    <Section title="Models" description="Configure AI models available to agents">
      {models.map((m) => (
        <div key={m.model} className="flex items-center justify-between p-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-white">{m.provider}</span>
              <Badge variant={m.status === 'active' ? 'success' : 'default'}>
                {m.status === 'active' ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <p className="text-xs text-[#A8A8A8]">{m.model}</p>
            <div className="flex gap-1.5 mt-1.5">
              {m.capabilities.map((c) => (
                <span
                  key={c}
                  className="text-[10px] text-[#6E6E6E] bg-[#080808] border border-[#202020] px-1.5 py-0.5 rounded"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button className="h-8 px-3 rounded-lg border border-[#202020] bg-transparent text-xs text-[#A8A8A8] hover:bg-[#080808] hover:border-[#333] transition-all">
              Configure
            </button>
          </div>
        </div>
      ))}
    </Section>
  )
}

function ApiKeysSettings() {
  return (
    <Section title="API Keys" description="Manage API keys for AI providers">
      {['OpenAI', 'Anthropic', 'Google'].map((provider) => (
        <SettingRow key={provider} label={provider} description="••••••••••••••••">
          <button className="h-8 px-3 rounded-lg border border-[#202020] bg-transparent text-xs text-[#A8A8A8] hover:bg-[#080808] hover:border-[#333] transition-all">
            Update
          </button>
        </SettingRow>
      ))}
    </Section>
  )
}

function NotificationsSettings() {
  const [taskUpdates, setTaskUpdates] = useState(true)
  const [agentErrors, setAgentErrors] = useState(true)
  const [deployComplete, setDeployComplete] = useState(true)

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await api.getSettings()
        setTaskUpdates(settings.notifyTaskUpdates)
        setAgentErrors(settings.notifyAgentErrors)
        setDeployComplete(settings.notifyDeploymentComplete)
      } catch (error) {
        console.error('Failed to load notification settings:', error)
      }
    }
    loadSettings()
  }, [])

  const saveSetting = async (key: string, value: boolean) => {
    try {
      if (key === 'notify_task') {
        await api.updateNotifications({ taskUpdates: value })
      } else if (key === 'notify_error') {
        await api.updateNotifications({ agentErrors: value })
      } else if (key === 'notify_deploy') {
        await api.updateNotifications({ deploymentComplete: value })
      }
    } catch (error) {
      console.error('Failed to save notification setting:', error)
    }
  }

  return (
    <Section title="Notifications" description="Configure notification preferences">
      <SettingRow label="Task Updates" description="Notifications when task status changes">
        <input
          type="checkbox"
          checked={taskUpdates}
          onChange={(e) => {
            setTaskUpdates(e.target.checked)
            saveSetting('notify_task', e.target.checked)
          }}
          className="w-4 h-4 accent-white cursor-pointer"
        />
      </SettingRow>
      <SettingRow label="Agent Errors" description="Alert on agent execution errors">
        <input
          type="checkbox"
          checked={agentErrors}
          onChange={(e) => {
            setAgentErrors(e.target.checked)
            saveSetting('notify_error', e.target.checked)
          }}
          className="w-4 h-4 accent-white cursor-pointer"
        />
      </SettingRow>
      <SettingRow label="Deployment Complete" description="Notify when deployments finish">
        <input
          type="checkbox"
          checked={deployComplete}
          onChange={(e) => {
            setDeployComplete(e.target.checked)
            saveSetting('notify_deploy', e.target.checked)
          }}
          className="w-4 h-4 accent-white cursor-pointer"
        />
      </SettingRow>
    </Section>
  )
}

function ShortcutsSettings() {
  return (
    <Section title="Keyboard Shortcuts" description="Customize keyboard shortcuts">
      {[
        { action: 'Search', key: '⌘K' },
        { action: 'Create Task', key: '⌘N' },
        { action: 'Toggle Sidebar', key: '⌘B' },
      ].map((s) => (
        <SettingRow key={s.action} label={s.action}>
          <kbd className="text-xs font-mono bg-[#080808] border border-[#202020] rounded px-2 py-1 text-[#6E6E6E]">
            {s.key}
          </kbd>
        </SettingRow>
      ))}
    </Section>
  )
}

const tabComponents: Record<string, React.FC> = {
  general: GeneralSettings,
  models: ModelsSettings,
  agents: () => (
    <Section title="Agents" description="Agent settings can be configured from the Agents tab.">
      <div className="p-4 text-sm text-[#6E6E6E]">Configure agents from the Agents page.</div>
    </Section>
  ),
  'api-keys': ApiKeysSettings,
  notifications: NotificationsSettings,
  shortcuts: ShortcutsSettings,
}

export function SettingsScreen() {
  const [activeCategory, setActiveCategory] = useState('models')
  const ActiveComponent = tabComponents[activeCategory] || ModelsSettings

  return (
    <div className="flex-1 flex overflow-hidden">
      <div className="w-[220px] flex-shrink-0 border-r border-[#202020] flex flex-col p-3 gap-0.5">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
              activeCategory === cat.id
                ? 'bg-[#151515] text-white font-medium'
                : 'text-[#6E6E6E] hover:text-[#A8A8A8] hover:bg-[#080808]'
            }`}
          >
            <cat.icon size={16} />
            <span>{cat.label}</span>
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
