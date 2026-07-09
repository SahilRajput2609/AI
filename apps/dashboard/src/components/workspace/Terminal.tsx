import { useState, useEffect, useRef } from 'react'
import { clsx } from '../utils/clsx'
import { useRealtime } from '../../lib/realtime'

export function Terminal() {
  const [activeTab, setActiveTab] = useState('Terminal')
  const { logs, connected } = useRealtime()
  const [displayLines, setDisplayLines] = useState<Array<{ prefix: string; text: string; color: string }>>([
    { prefix: '', text: 'AI-Company Terminal v1.0.0', color: 'text-white' },
    { prefix: '', text: 'Connected to agent orchestration layer', color: 'text-[#6E6E6E]' },
  ])
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (connected) {
      setDisplayLines((prev) => [...prev, { prefix: '✓', text: 'WebSocket connected', color: 'text-[#22C55E]' }])
    }
  }, [connected])

  useEffect(() => {
    if (logs.length > 0) {
      setDisplayLines((prev) =>
        [...prev, ...logs.map((l) => ({ prefix: l.prefix, text: l.text, color: l.color }))].slice(-100)
      )
    }
  }, [logs])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [displayLines])

  const tabs = ['Terminal', 'Logs']

  return (
    <div className="flex flex-col h-[180px] border-t border-[#202020] bg-[#000000]">
      {/* Tabs */}
      <div className="h-9 flex items-center px-4 gap-4 border-b border-[#202020] flex-shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={clsx(
              'relative h-full flex items-center text-xs font-medium transition-colors cursor-pointer',
              activeTab === tab ? 'text-white' : 'text-[#6E6E6E] hover:text-[#A8A8A8]',
            )}
          >
            {tab}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-auto font-mono text-xs leading-relaxed">
        {displayLines.map((line, i) => (
          <div key={i} className="flex">
            {line.prefix && (
              <span className={clsx('w-4 flex-shrink-0', line.color)}>{line.prefix}</span>
            )}
            <span className={clsx(line.color || 'text-[#A8A8A8]')}>{line.text}</span>
          </div>
        ))}
        <div ref={endRef} />
        <div className="flex items-center mt-0.5">
          <span className="w-2 h-4 bg-white animate-pulse" />
        </div>
      </div>
    </div>
  )
}
