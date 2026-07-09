import { useState, useEffect } from 'react'
import { Bot, Eye, EyeOff, Save, Check, AlertCircle } from 'lucide-react'
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
}

const DEFAULT_ROLES = [
  'owner', 'planner', 'orchestrator', 'api', 'backend', 'database',
  'debugger', 'devops', 'documentation', 'frontend', 'qa', 'reviewer',
]

const ROLE_LABELS: Record<string, string> = {
  owner: 'Owner', planner: 'Planner', orchestrator: 'Orchestrator', api: 'API Developer',
  backend: 'Backend Developer', database: 'Database Engineer', debugger: 'Debugger',
  devops: 'DevOps Engineer', documentation: 'Documentation Writer', frontend: 'Frontend Developer',
  qa: 'QA Engineer', reviewer: 'Reviewer',
}

function getDefaultConfigs(): AgentConfig[] {
  return DEFAULT_ROLES.map(role => ({
    role, name: role.charAt(0).toUpperCase() + role.slice(1),
    api_key: '', base_url: '', model: '', temperature: 0.7, max_tokens: 4096, is_active: true,
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

  useEffect(() => { loadConfigs() }, [])

  async function loadConfigs() {
    setLoading(true)
    try {
      const data: AgentConfig[] = await api.getAgentConfigs()
      if (data.length > 0) {
        setConfigs(getDefaultConfigs().map(def => data.find(c => c.role === def.role) || def))
        setLoading(false)
        return
      }
    } catch {}
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
    try {
      await api.upsertAgentConfig(role, config)
      setDirtyRoles(prev => { const n = new Set(prev); n.delete(role); return n })
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch { setSaveStatus('error') }
    setSaving(false)
  }

  if (loading) {
    return <div className="flex-1 flex items-center justify-center text-[#6E6E6E] text-sm">Loading...</div>
  }

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Sidebar */}
      <div className="w-[220px] flex-shrink-0 border-r border-[#202020] flex flex-col p-3 gap-0.5 overflow-y-auto">
        <p className="text-xs text-[#6E6E6E] uppercase tracking-wider font-medium px-3 py-2">Agents</p>
        {configs.map((config) => (
          <button
            key={config.role}
            onClick={() => setSelectedRole(config.role)}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer w-full text-left ${
              selectedRole === config.role
                ? 'bg-[#151515] text-white font-medium'
                : 'text-[#6E6E6E] hover:text-[#A8A8A8] hover:bg-[#080808]'
            }`}
          >
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${config.is_active ? 'bg-[#22C55E]' : 'bg-[#333]'}`} />
            <span className="flex-1 truncate">{ROLE_LABELS[config.role] || config.name}</span>
            {dirtyRoles.has(config.role) && <div className="w-1.5 h-1.5 rounded-full bg-[#FACC15] flex-shrink-0" />}
          </button>
        ))}
      </div>

      {/* Config form */}
      <div className="flex-1 overflow-auto p-8">
        {selectedConfig && (
          <div className="max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Bot size={20} className="text-[#A8A8A8]" />
                <h2 className="text-lg font-semibold text-white">{ROLE_LABELS[selectedConfig.role]}</h2>
              </div>
              <div className="flex items-center gap-3">
                {saveStatus === 'saved' && <span className="flex items-center gap-1 text-xs text-[#22C55E]"><Check size={14} /> Saved</span>}
                {saveStatus === 'error' && <span className="flex items-center gap-1 text-xs text-[#EF4444]"><AlertCircle size={14} /> Failed</span>}
                <button
                  onClick={() => saveConfig(selectedConfig.role)}
                  disabled={saving || !dirtyRoles.has(selectedConfig.role)}
                  className="h-9 px-4 rounded-lg bg-white text-black text-sm font-medium flex items-center gap-2 hover:bg-white/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  <Save size={14} /> Save
                </button>
              </div>
            </div>

            <div className="rounded-lg border border-[#202020] bg-[#0F0F0F] p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#6E6E6E] mb-1.5 font-medium">Name</label>
                  <input type="text" value={selectedConfig.name} onChange={e => updateField(selectedConfig.role, 'name', e.target.value)}
                    className="w-full h-9 bg-[#080808] border border-[#202020] rounded-lg px-3 text-sm text-white outline-none focus:border-[#333] transition-colors" />
                </div>
                <div>
                  <label className="block text-xs text-[#6E6E6E] mb-1.5 font-medium">Role</label>
                  <input type="text" value={ROLE_LABELS[selectedConfig.role]} disabled
                    className="w-full h-9 bg-[#080808] border border-[#202020] rounded-lg px-3 text-sm text-[#6E6E6E] cursor-not-allowed" />
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#6E6E6E] mb-1.5 font-medium">API Key</label>
                <div className="relative">
                  <input type={showApiKey ? 'text' : 'password'} value={selectedConfig.api_key}
                    onChange={e => updateField(selectedConfig.role, 'api_key', e.target.value)}
                    className="w-full h-9 bg-[#080808] border border-[#202020] rounded-lg px-3 pr-10 text-sm text-white outline-none focus:border-[#333] font-mono" placeholder="sk-..." />
                  <button onClick={() => setShowApiKey(!showApiKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6E6E6E] hover:text-white">
                    {showApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#6E6E6E] mb-1.5 font-medium">Base URL</label>
                <input type="text" value={selectedConfig.base_url} onChange={e => updateField(selectedConfig.role, 'base_url', e.target.value)}
                  className="w-full h-9 bg-[#080808] border border-[#202020] rounded-lg px-3 text-sm text-white outline-none focus:border-[#333] font-mono" placeholder="https://api.openai.com/v1" />
              </div>

              <div>
                <label className="block text-xs text-[#6E6E6E] mb-1.5 font-medium">Model</label>
                <input type="text" value={selectedConfig.model} onChange={e => updateField(selectedConfig.role, 'model', e.target.value)}
                  className="w-full h-9 bg-[#080808] border border-[#202020] rounded-lg px-3 text-sm text-white outline-none focus:border-[#333] font-mono" placeholder="gpt-4o" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#6E6E6E] mb-1.5 font-medium">Temperature: {selectedConfig.temperature.toFixed(1)}</label>
                  <input type="range" min="0" max="2" step="0.1" value={selectedConfig.temperature}
                    onChange={e => updateField(selectedConfig.role, 'temperature', parseFloat(e.target.value))}
                    className="w-full accent-white" />
                </div>
                <div>
                  <label className="block text-xs text-[#6E6E6E] mb-1.5 font-medium">Max Tokens</label>
                  <input type="number" value={selectedConfig.max_tokens}
                    onChange={e => updateField(selectedConfig.role, 'max_tokens', parseInt(e.target.value) || 0)}
                    className="w-full h-9 bg-[#080808] border border-[#202020] rounded-lg px-3 text-sm text-white outline-none focus:border-[#333] font-mono" />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#202020]">
                <div>
                  <span className="text-sm font-medium text-white">Active</span>
                  <p className="text-xs text-[#6E6E6E]">Enable or disable this agent</p>
                </div>
                <button
                  onClick={() => updateField(selectedConfig.role, 'is_active', !selectedConfig.is_active)}
                  className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${selectedConfig.is_active ? 'bg-[#22C55E]' : 'bg-[#333]'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${selectedConfig.is_active ? 'translate-x-5' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
