import { useState, useEffect } from 'react'
import { GitBranch, Code, Terminal, Bot } from 'lucide-react'
import { api } from '../lib/api'
import { EmptyState } from '../components/ui/EmptyState'
import { SkeletonTable } from '../components/ui/Skeleton'

const TYPE_ICONS: Record<string, { icon: typeof Bot; color: string }> = {
  agent: { icon: Bot, color: 'text-white' },
  system: { icon: Terminal, color: 'text-[#FACC15]' },
  git: { icon: GitBranch, color: 'text-[#22C55E]' },
  user: { icon: Code, color: 'text-[#A8A8A8]' },
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
}

function formatDate(ts: number) {
  const d = new Date(ts)
  const today = new Date()
  if (d.toDateString() === today.toDateString()) return 'Today'
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
    } catch { setError('Failed to load activities') }
    setLoading(false)
  }

  if (error && entries.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-sm text-[#EF4444]">
        {error}
        <button onClick={fetchActivities} className="ml-3 text-[#6E6E6E] hover:text-white underline cursor-pointer">Retry</button>
      </div>
    )
  }

  const filtered = filter === 'All' ? entries : entries.filter((e: any) => e.type === filter.toLowerCase())
  const filters = ['All', 'Agent', 'System', 'Git']

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-[720px] mx-auto py-8 px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-white">Activity</h2>
            <p className="text-sm text-[#6E6E6E]">Real-time agent and system events</p>
          </div>
          <div className="flex gap-1">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  f === filter ? 'bg-[#151515] text-white' : 'text-[#6E6E6E] hover:text-[#A8A8A8] hover:bg-[#080808]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <SkeletonTable rows={5} />
        ) : filtered.length === 0 ? (
          <EmptyState title="No activities yet" description="Activities will appear here as agents work." />
        ) : (
          <div className="relative">
            <div className="absolute left-5 top-0 bottom-0 w-px bg-[#202020]" />
            <div className="space-y-0">
              {filtered.map((entry: any, i: number) => {
                const typeConfig = TYPE_ICONS[entry.type] || TYPE_ICONS.system
                const Icon = typeConfig.icon
                return (
                  <div key={entry.id || i} className="relative flex gap-4 pb-6">
                    <div className="relative z-10 w-10 h-10 rounded-lg bg-[#0F0F0F] border border-[#202020] flex items-center justify-center flex-shrink-0">
                      <Icon className={typeConfig.color} size={16} />
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-[#6E6E6E] font-mono">{formatTime(entry.created_at)}</span>
                        <span className="text-xs text-[#6E6E6E]">{formatDate(entry.created_at)}</span>
                      </div>
                      <h4 className="text-sm font-medium text-white">{entry.title}</h4>
                      {entry.description && (
                        <p className="text-xs text-[#A8A8A8] mt-0.5">{entry.description}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
