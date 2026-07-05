import { useState, useEffect } from 'react'
import { Bot, Eye, EyeOff, Save, RotateCcw, Check, AlertCircle, Users } from 'lucide-react'
import { cn } from '@ai-company/ui'
import { api } from '../lib/api'

interface AgentConfig {
  id?: string
  role: string
  name: string
  api_key: string
  base_url: string
  model: string
  temperature: number
  max_tokens: number
  is_active: boolean
  metadata?: Record<string, any>
}

const DEFAULT_ROLES = [
  'owner', 'planner', 'orchestrator', 'api', 'backend', 'database',
  'debugger', 'devops', 'documentation', 'frontend', 'qa', 'reviewer',
]

const ROLE_LABELS: Record<string, string> = {
  owner: 'Owner',
  planner: 'Planner',
  orchestrator: 'Orchestrator',
  api: 'API Developer',
  backend: 'Backend Developer',
  database: 'Database Engineer',
  debugger: 'Debugger',
  devops: 'DevOps Engineer',
  documentation: 'Documentation Writer',
  frontend: 'Frontend Developer',
  qa: 'QA Engineer',
  reviewer: 'Reviewer',
}

function getDefaultConfigs(): AgentConfig[] {
  return DEFAULT_ROLES.map(role => ({
    role,
    name: role.charAt(0).toUpperCase() + role.slice(1),
    api_key: '',
    base_url: '',
    model: '',
    temperature: 0.7,
    max_tokens: 4096,
    is_active: true,
  }))
}

export function AgentsConfigScreen() {
  const [configs, setConfigs] = useState<AgentConfig[]>([])
  const [selectedRole, setSelectedRole] = useState<string>('owner')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle')
  const [showApiKey, setShowApiKey] = useState(false)
  const [dirtyRoles, setDirtyRoles] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadConfigs()
  }, [])

  async function loadConfigs() {
    setLoading(true)
    try {
      const data: AgentConfig[] = await api.getAgentConfigs()
      if (data.length > 0) {
        const merged = getDefaultConfigs().map(def => {
          const saved = data.find(c => c.role === def.role)
          return saved || def
        })
        setConfigs(merged)
        setLoading(false)
        return
      }
    } catch {}
    // fallback to defaults
    setConfigs(getDefaultConfigs())
    setLoading(false)
  }

  const selectedConfig = configs.find(c => c.role === selectedRole) || configs[0]

  function updateField(role: string, field: keyof AgentConfig, value: any) {
    setConfigs(prev => prev.map(c => c.role === role ? { ...c, [field]: value } : c))
    setDirtyRoles(prev => new Set(prev).add(role))
    setSaveStatus('idle')
  }

  async function saveConfig(role: string) {
    const config = configs.find(c => c.role === role)
    if (!config) return
    setSaving(true)
    setSaveStatus('idle')
    try {
      await api.upsertAgentConfig(role, {
        name: config.name,
        api_key: config.api_key,
        base_url: config.base_url,
        model: config.model,
        temperature: config.temperature,
        max_tokens: config.max_tokens,
        is_active: config.is_active,
      })
      setDirtyRoles(prev => {
        const next = new Set(prev)
        next.delete(role)
        return next
      })
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch {
      setSaveStatus('error')
    } finally {
      setSaving(false)
    }
  }

  async function saveAllConfigs() {
    setSaving(true)
    setSaveStatus('idle')
    let allOk = true
    for (const config of configs) {
      if (!dirtyRoles.has(config.role)) continue
      try {
        await api.upsertAgentConfig(config.role, {
          name: config.name,
          api_key: config.api_key,
          base_url: config.base_url,
          model: config.model,
          temperature: config.temperature,
          max_tokens: config.max_tokens,
          is_active: config.is_active,
        })
      } catch {
        allOk = false
      }
    }
    if (allOk) {
      setDirtyRoles(new Set())
      setSaveStatus('saved')
    } else {
      setSaveStatus('error')
    }
    setTimeout(() => setSaveStatus('idle'), 2000)
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-text-muted">
        Loading agent configurations...
      </div>
    )
  }

  return (
    <div className="flex-1 flex overflow-hidden">
      <div className="w-[240px] flex-shrink-0 bg-surface-sidebar border-r border-white/5 flex flex-col p-4 gap-1">
        <div className="flex items-center gap-2 px-3 py-2 mb-2">
          <Users size={16} className="text-accent-primary" />
          <span className="text-xs uppercase tracking-wider text-text-muted font-semibold">Agents</span>
        </div>
        {configs.map((config) => (
          <button
            key={config.role}
            onClick={() => setSelectedRole(config.role)}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-[8px] text-sm transition-all duration-200 cursor-pointer relative w-full text-left',
              selectedRole === config.role
                ? 'bg-accent-primary-subtle text-text-primary font-medium'
                : 'text-text-secondary hover:bg-white/5 hover:text-text-primary',
            )}
          >
            {selectedRole === config.role && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-accent-primary rounded-full" />
            )}
            <div className={cn(
              'w-2 h-2 rounded-full flex-shrink-0',
              config.is_active ? 'bg-green-500' : 'bg-zinc-500'
            )} />
            <span className="flex-1">{ROLE_LABELS[config.role] || config.name}</span>
            {dirtyRoles.has(config.role) && (
              <span className="w-2 h-2 rounded-full bg-yellow-500 flex-shrink-0" />
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto p-8">
        {selectedConfig && (
          <div className="max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-3">
                  <Bot size={24} className="text-accent-primary" />
                  <h2 className="text-lg font-semibold text-text-primary">
                    {ROLE_LABELS[selectedConfig.role]}
                  </h2>
                </div>
                <p className="text-sm text-text-muted mt-1 ml-[44px]">
                  Configure settings for the {ROLE_LABELS[selectedConfig.role].toLowerCase()} agent
                </p>
              </div>
              <div className="flex items-center gap-2">
                {saveStatus === 'saved' && (
                  <span className="flex items-center gap-1 text-xs text-green-500">
                    <Check size={14} /> Saved
                  </span>
                )}
                {saveStatus === 'error' && (
                  <span className="flex items-center gap-1 text-xs text-red-500">
                    <AlertCircle size={14} /> Save failed
                  </span>
                )}
                <button
                  onClick={() => saveConfig(selectedConfig.role)}
                  disabled={saving || !dirtyRoles.has(selectedConfig.role)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-[8px] text-sm font-medium transition-all cursor-pointer',
                    dirtyRoles.has(selectedConfig.role) && !saving
                      ? 'bg-accent-primary text-white hover:bg-accent-primary-hover'
                      : 'bg-white/5 text-text-muted cursor-not-allowed'
                  )}
                >
                  <Save size={14} /> Save
                </button>
              </div>
            </div>

            <div className="bg-surface-card border border-white/5 rounded-[12px] p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-text-muted mb-1.5 font-medium">Agent Name</label>
                  <input
                    type="text"
                    value={selectedConfig.name}
                    onChange={e => updateField(selectedConfig.role, 'name', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-[8px] px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary transition-colors"
                    placeholder="My Agent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-text-muted mb-1.5 font-medium">Role</label>
                  <input
                    type="text"
                    value={ROLE_LABELS[selectedConfig.role] || selectedConfig.role}
                    disabled
                    className="w-full bg-white/5 border border-white/10 rounded-[8px] px-3 py-2 text-sm text-text-muted cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-text-muted mb-1.5 font-medium">API Key</label>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={selectedConfig.api_key}
                    onChange={e => updateField(selectedConfig.role, 'api_key', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-[8px] px-3 py-2 pr-10 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary transition-colors font-mono"
                    placeholder="sk-..."
                  />
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary cursor-pointer"
                  >
                    {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs text-text-muted mb-1.5 font-medium">Base URL</label>
                <input
                  type="text"
                  value={selectedConfig.base_url}
                  onChange={e => updateField(selectedConfig.role, 'base_url', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-[8px] px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary transition-colors font-mono"
                  placeholder="https://api.openai.com/v1"
                />
              </div>

              <div>
                <label className="block text-xs text-text-muted mb-1.5 font-medium">Model</label>
                <input
                  type="text"
                  value={selectedConfig.model}
                  onChange={e => updateField(selectedConfig.role, 'model', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-[8px] px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary transition-colors font-mono"
                  placeholder="gpt-4o"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-text-muted mb-1.5 font-medium">
                    Temperature: {selectedConfig.temperature.toFixed(1)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={selectedConfig.temperature}
                    onChange={e => updateField(selectedConfig.role, 'temperature', parseFloat(e.target.value))}
                    className="w-full accent-accent-primary"
                  />
                  <div className="flex justify-between text-[10px] text-text-muted mt-1">
                    <span>Precise (0)</span>
                    <span>Creative (2)</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-text-muted mb-1.5 font-medium">Max Tokens</label>
                  <input
                    type="number"
                    value={selectedConfig.max_tokens}
                    onChange={e => updateField(selectedConfig.role, 'max_tokens', parseInt(e.target.value) || 0)}
                    className="w-full bg-white/5 border border-white/10 rounded-[8px] px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary transition-colors font-mono"
                    min={1}
                    max={1000000}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <div>
                  <span className="text-sm text-text-primary font-medium">Active</span>
                  <p className="text-xs text-text-muted">Enable or disable this agent</p>
                </div>
                <button
                  onClick={() => updateField(selectedConfig.role, 'is_active', !selectedConfig.is_active)}
                  className={cn(
                    'relative w-12 h-6 rounded-full transition-colors cursor-pointer',
                    selectedConfig.is_active ? 'bg-green-600' : 'bg-white/10'
                  )}
                >
                  <span className={cn(
                    'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-200',
                    selectedConfig.is_active ? 'translate-x-6' : 'translate-x-0'
                  )} />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              {saveStatus === 'saved' && (
                <span className="flex items-center gap-1 text-xs text-green-500">
                  <Check size={14} /> All changes saved
                </span>
              )}
              {saveStatus === 'error' && (
                <span className="flex items-center gap-1 text-xs text-red-500">
                  <AlertCircle size={14} /> Save failed
                </span>
              )}
              <button
                onClick={() => { loadConfigs(); setDirtyRoles(new Set()) }}
                className="flex items-center gap-2 px-4 py-2 rounded-[8px] text-sm text-text-secondary hover:text-text-primary bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
              >
                <RotateCcw size={14} /> Reset
              </button>
              <button
                onClick={saveAllConfigs}
                disabled={saving || dirtyRoles.size === 0}
                className={cn(
                  'flex items-center gap-2 px-6 py-2 rounded-[8px] text-sm font-medium transition-all cursor-pointer',
                  dirtyRoles.size > 0 && !saving
                    ? 'bg-accent-primary text-white hover:bg-accent-primary-hover'
                    : 'bg-white/5 text-text-muted cursor-not-allowed'
                )}
              >
                <Save size={14} /> Save All ({dirtyRoles.size})
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
