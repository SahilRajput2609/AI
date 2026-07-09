import { clsx } from '../utils/clsx'
import { X } from 'lucide-react'

export interface HistoryEntry {
  prompt: string
  outcome: 'completed' | 'rejected'
  timestamp: string
}

interface Props {
  history: HistoryEntry[]
  onClose: () => void
}

export function ProjectHistoryPanel({ history, onClose }: Props) {
  const sorted = [...history].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  return (
    <aside className="fixed inset-y-0 right-0 w-80 bg-[#000000] border-l border-[#202020] z-50 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#202020]">
        <h2 className="text-sm font-medium text-white">History</h2>
        <button onClick={onClose} className="text-[#6E6E6E] hover:text-white p-1 rounded-md hover:bg-[#151515] transition-colors">
          <X size={16} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {sorted.length === 0 ? (
          <p className="text-xs text-[#6E6E6E] text-center py-8">No history yet</p>
        ) : (
          sorted.map((entry, idx) => (
            <div key={idx} className="border border-[#202020] rounded-lg p-3 bg-[#0F0F0F]">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-[#6E6E6E]">{new Date(entry.timestamp).toLocaleString()}</span>
                <span className={clsx(
                  'text-[10px] font-medium px-1.5 py-0.5 rounded',
                  entry.outcome === 'completed' ? 'text-[#22C55E] bg-[#22C55E]/10' : 'text-[#EF4444] bg-[#EF4444]/10'
                )}>
                  {entry.outcome}
                </span>
              </div>
              <p className="text-sm text-white">{entry.prompt}</p>
            </div>
          ))
        )}
      </div>
    </aside>
  )
}
