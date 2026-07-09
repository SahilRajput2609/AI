import { useState, useRef, useEffect } from 'react'
import { Search, Check } from 'lucide-react'
import { clsx } from '../utils/clsx'
import { api as apiClient } from '../../lib/api'

interface ModelItem {
  name: string
  provider: string
}

interface ModelSelectorProps {
  onClose: () => void
  onSelect?: (name: string) => void
}

export function ModelSelector({ onClose, onSelect }: ModelSelectorProps) {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(() => localStorage.getItem('ai_company_selected_model') || 'GPT-4o')
  const [models, setModels] = useState<ModelItem[]>([])
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    apiClient.getModelProviders().then((providers: any[]) => {
      const active = providers.filter((p: any) => p.isActive)
      const items: ModelItem[] = active.flatMap((p: any) =>
        (p.models || []).map((m: any) => ({
          name: m.name || m.modelId,
          provider: p.name || p.provider,
        }))
      )
      if (items.length > 0) setModels(items)
      else setModels([
        { name: 'GPT-4o', provider: 'OpenAI' },
        { name: 'Claude 3.5 Sonnet', provider: 'Anthropic' },
      ])
    }).catch(() => {
      setModels([
        { name: 'GPT-4o', provider: 'OpenAI' },
        { name: 'Claude 3.5 Sonnet', provider: 'Anthropic' },
      ])
    })
  }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])

  const filtered = models.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.provider.toLowerCase().includes(search.toLowerCase())
  )

  const handleSelect = (name: string) => {
    setSelected(name)
    localStorage.setItem('ai_company_selected_model', name)
    onSelect?.(name)
    onClose()
  }

  return (
    <div ref={ref} className="absolute top-full right-0 mt-2 w-[300px] rounded-xl border border-[#202020] bg-[#0F0F0F] shadow-2xl z-50 overflow-hidden">
      <div className="flex items-center gap-2 px-3 h-10 border-b border-[#202020]">
        <Search size={14} className="text-[#6E6E6E]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search models..."
          className="flex-1 bg-transparent text-sm text-white placeholder-[#6E6E6E] outline-none"
          autoFocus
        />
      </div>
      <div className="max-h-[280px] overflow-y-auto py-1">
        {filtered.map((model) => (
          <button
            key={model.name}
            onClick={() => handleSelect(model.name)}
            className={clsx(
              'w-full flex items-center justify-between px-3 py-2.5 text-sm transition-colors cursor-pointer',
              selected === model.name ? 'bg-[#151515] text-white' : 'text-[#A8A8A8] hover:bg-[#080808] hover:text-white',
            )}
          >
            <div>
              <span className="font-medium">{model.name}</span>
              <span className="text-xs text-[#6E6E6E] ml-2">{model.provider}</span>
            </div>
            {selected === model.name && <Check size={14} className="text-white" />}
          </button>
        ))}
      </div>
    </div>
  )
}
