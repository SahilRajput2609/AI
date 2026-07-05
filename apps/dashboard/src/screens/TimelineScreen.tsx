import { useState, useEffect } from 'react'
import { GitBranch, Code, Terminal, Bot } from 'lucide-react'
import { api } from '../lib/api'

const TYPE_ICONS: Record<string, { icon: typeof Bot; iconBg: string; iconColor: string }> = {
  agent: { icon: Bot, iconBg: 'bg-accent-primary-subtle', iconColor: 'text-accent-primary' },
  system: { icon: Terminal, iconBg: 'bg-accent-warning-subtle', iconColor: 'text-accent-warning' },
  git: { icon: GitBranch, iconBg: 'bg-accent-success-subtle', iconColor: 'text-accent-success' },
  user: { icon: Code, iconBg: 'bg-accent-purple-subtle', iconColor: 'text-accent-purple' },
}

function formatTime(ts: number) {
  const d = new Date(ts)
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
}

function formatDate(ts: number) {
  const d = new Date(ts)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (d.toDateString() === today.toDateString()) return 'Today'
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function TimelineScreen() {
  const [entries, setEntries] = useState<any[]>([])
  const [filter, setFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchActivities()
    const interval = setInterval(fetchActivities, 10000)
    return () => clearInterval(interval)
  }, [])

  async function fetchActivities() {
    try {
      const data = await api.getActivities(50)
      setEntries(data)
      setError(null)
    } catch {
      setError('Failed to load activities')
    }
    setLoading(false)
  }

  if (error && entries.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-sm text-red-400">
        {error}
        <button onClick={fetchActivities} className="ml-3 text-text-muted hover:text-text-primary underline cursor-pointer">Retry</button>
      </div>
    )
  }

  const filtered = filter === 'All' ? entries : entries.filter((e: any) => e.type === filter.toLowerCase())

  const filters = ['All', 'Agent', 'System', 'Git']

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-text-muted text-sm">
        Loading timeline...
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-auto bg-surface-bg">
      <div className="max-w-[720px] mx-auto py-8 px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Activity Timeline</h2>
            <p className="text-sm text-text-muted">Real-time agent and system events</p>
          </div>
          <div className="flex gap-2">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-xs px-3 py-1.5 rounded-full transition-colors cursor-pointer ${f === filter ? 'bg-accent-primary-subtle text-accent-primary' : 'text-text-muted hover:text-text-primary bg-white/5'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute left-5 top-0 bottom-0 w-[2px] bg-white/5" />
          <div className="flex flex-col gap-0">
            {filtered.length === 0 && (
              <p className="text-xs text-text-muted text-center py-8">No activities yet</p>
            )}
            {filtered.map((entry: any, i: number) => {
              const typeConfig = TYPE_ICONS[entry.type] || TYPE_ICONS.system
              const Icon = typeConfig.icon
              return (
                <div
                  key={entry.id || i}
                  className="relative flex gap-4 pb-6 animate-slide-up will-change-transform"
                  style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'both' }}
                >
                  <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${typeConfig.iconBg}`}>
                    <Icon className={typeConfig.iconColor} size={16} />
                  </div>
                  <div className="flex-1 bg-surface-card border border-white/5 rounded-[10px] p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-xs text-text-muted font-mono">{formatTime(entry.created_at)}</span>
                        <span className="text-xs text-text-muted ml-2">{formatDate(entry.created_at)}</span>
                      </div>
                    </div>
                    <h4 className="text-sm font-medium text-text-primary mt-1">{entry.title}</h4>
                    {entry.description && <p className="text-xs text-text-secondary mt-0.5">{entry.description}</p>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
