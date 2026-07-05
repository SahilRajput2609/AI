import { useState, useRef, useEffect } from 'react'
import { Search, Check, Zap, Sparkles } from 'lucide-react'
import { clsx } from '../utils/clsx'

interface ModelItem {
  name: string
  provider: string
  badge: string | null
  speed: string
  quality: string
}

const groups: { label: string; items: ModelItem[] }[] = [
  {
    label: 'Recommended',
    items: [
      { name: 'GPT-4o', provider: 'OpenAI', badge: 'Best', speed: 'fast', quality: 'best' },
      { name: 'Claude 3.5 Sonnet', provider: 'Anthropic', badge: null, speed: 'fast', quality: 'best' },
    ],
  },
  {
    label: 'Fast',
    items: [
      { name: 'GPT-4o Mini', provider: 'OpenAI', badge: 'Cheap', speed: 'fastest', quality: 'good' },
      { name: 'Claude 3 Haiku', provider: 'Anthropic', badge: null, speed: 'fastest', quality: 'good' },
    ],
  },
]

interface ModelSelectorProps {
  onClose: () => void
}

export function ModelSelector({ onClose }: ModelSelectorProps) {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState('GPT-4o')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])

  const filtered = groups
    .map((g) => ({
      ...g,
      items: g.items.filter(
        (m) =>
          m.name.toLowerCase().includes(search.toLowerCase()) ||
          m.provider.toLowerCase().includes(search.toLowerCase()),
      ),
    }))
    .filter((g) => g.items.length > 0)

  const handleSelect = (name: string) => {
    setSelected(name)
    onClose()
  }

  return (
    <div
      ref={ref}
      className="absolute top-full right-0 mt-2 w-[320px] max-h-[400px] bg-surface-card border border-white/10 rounded-[12px] shadow-xl p-2 z-50 animate-fade-in"
      style={{ boxShadow: '0 16px 48px rgba(0,0,0,0.6)' }}
    >
      <div className="flex items-center gap-2 bg-surface-input rounded-[8px] px-3 py-2 mb-2 border border-white/5 focus-within:border-accent-primary/30 transition-colors">
        <Search className="text-text-muted flex-shrink-0" size={14} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search models..."
          className="flex-1 bg-transparent text-xs text-text-primary placeholder-text-muted outline-none"
          autoFocus
        />
      </div>

      <div className="overflow-y-auto max-h-[320px]">
        {filtered.map((group) => (
          <div key={group.label}>
            <span className="block text-[11px] uppercase tracking-wider text-text-muted px-3 py-2 font-medium">
              {group.label}
            </span>
            {group.items.map((item) => {
              const isActive = selected === item.name
              return (
                <button
                  key={item.name}
                  onClick={() => handleSelect(item.name)}
                  className={clsx(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-sm transition-colors cursor-pointer',
                    isActive
                      ? 'bg-accent-primary-subtle'
                      : 'hover:bg-white/5',
                  )}
                >
                  <div className="flex-1 flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-accent-primary-subtle flex items-center justify-center">
                      <span className="text-[10px] font-bold text-accent-primary">
                        {item.provider === 'OpenAI' ? 'O' : item.provider === 'Anthropic' ? 'A' : 'G'}
                      </span>
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-text-primary">{item.name}</span>
                        {item.badge && (
                          <span className="text-[10px] font-medium text-accent-success bg-accent-success-subtle px-1.5 py-0.5 rounded">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-text-muted">{item.provider}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-text-muted">
                    {item.speed === 'fastest' ? (
                      <Zap size={12} className="text-accent-warning" />
                    ) : (
                      <Zap size={12} />
                    )}
                    {item.quality === 'best' && <Sparkles size={12} className="text-accent-purple" />}
                  </div>
                  {isActive && <Check className="text-accent-primary" size={16} />}
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
