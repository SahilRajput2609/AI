import { useState } from 'react'
import { clsx } from '../utils/clsx'

interface Tab {
  label: string
  active: boolean
  count: number | null
}

const tabs: Tab[] = [
  { label: 'Terminal', active: true, count: null },
  { label: 'Logs', active: false, count: 12 },
  { label: 'Problems', active: false, count: 3 },
]

const lines = [
  { prefix: '→', text: ' npm run dev', color: 'text-text-secondary' },
  { prefix: '', text: '', color: '' },
  { prefix: '>', text: ' ai-company@1.0.0 dev', color: 'text-text-muted' },
  { prefix: '>', text: ' vite --port 3000', color: 'text-text-muted' },
  { prefix: '', text: '', color: '' },
  { prefix: '✓', text: ' VITE v5.4.2 ready in 380ms', color: 'text-accent-success' },
  { prefix: '→', text: ' Local: http://localhost:3000', color: 'text-text-link' },
  { prefix: '', text: '', color: '' },
  { prefix: '!', text: ' [hmr] Warning: unused import \'useEffect\' in Header.tsx', color: 'text-accent-warning' },
  { prefix: '→', text: ' watching for file changes...', color: 'text-text-secondary' },
]

export function Terminal() {
  const [activeTab, setActiveTab] = useState('Terminal')

  return (
    <div className="h-[200px] flex-shrink-0 bg-surface-terminal border-t border-white/5 flex flex-col">
      <div className="h-9 bg-surface-sidebar border-b border-white/5 flex items-center px-4 gap-4 flex-shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab.label}
            onClick={() => setActiveTab(tab.label)}
            className={clsx(
              'relative h-full flex items-center gap-1.5 text-xs font-medium transition-colors cursor-pointer',
              activeTab === tab.label
                ? 'text-text-primary'
                : 'text-text-muted hover:text-text-secondary',
            )}
          >
            {tab.label}
            {tab.count && (
              <span className="bg-surface-card text-text-muted text-[10px] px-1.5 py-0.5 rounded-full">
                {tab.count}
              </span>
            )}
            {activeTab === tab.label && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-primary rounded-full" />
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 p-4 overflow-auto font-mono text-xs leading-relaxed" style={{ scrollBehavior: 'smooth' }}>
        {lines.map((line, i) => (
          <div key={i} className="flex">
            {line.prefix && (
              <span className={clsx('w-4 flex-shrink-0', line.color || 'text-text-secondary')}>
                {line.prefix}
              </span>
            )}
            <span className={clsx(line.color || 'text-text-secondary')}>
              {line.text}
            </span>
          </div>
        ))}
        <div className="flex items-center mt-0.5">
          <span className="w-2 h-4 bg-accent-primary animate-blink" />
        </div>
      </div>
    </div>
  )
}
