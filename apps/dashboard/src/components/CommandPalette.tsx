import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, LayoutGrid, Kanban, FileText, Clock, Bot, Terminal, Settings,
  Plus, Rocket, GitBranch, FolderOpen, ArrowRight,
} from 'lucide-react'
import type { Screen } from '../lib/navigation'
import { api } from '../lib/api'

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
  onNavigate: (screen: Screen) => void
  onOpenProject?: (id: string) => void
}

interface ActionItem {
  id: string
  icon: any
  label: string
  shortcut?: string
}

interface ScreenItem {
  id: string
  icon: any
  label: string
  screen: Screen
}

const screens: ScreenItem[] = [
  { id: 'workspace', icon: LayoutGrid, label: 'Home', screen: 'workspace' },
  { id: 'kanban', icon: Kanban, label: 'Tasks', screen: 'kanban' },
  { id: 'files', icon: FileText, label: 'Files', screen: 'files' },
  { id: 'timeline', icon: Clock, label: 'History', screen: 'timeline' },
  { id: 'agents', icon: Bot, label: 'Agents', screen: 'agents' },
  { id: 'agent-ide', icon: Terminal, label: 'Terminal', screen: 'agent-ide' },
  { id: 'settings', icon: Settings, label: 'Settings', screen: 'settings' },
]

const actions: ActionItem[] = [
  { id: 'new-project', icon: Plus, label: 'New Project', shortcut: 'Alt+N' },
  { id: 'take-snapshot', icon: GitBranch, label: 'Take Snapshot', shortcut: 'Alt+S' },
  { id: 'deploy', icon: Rocket, label: 'Deploy Project', shortcut: 'Alt+D' },
]

export function CommandPalette({ open, onClose, onNavigate, onOpenProject }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [projects, setProjects] = useState<any[]>([])
  const [loadingProjects, setLoadingProjects] = useState(false)
  const [projectMode, setProjectMode] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const searchRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const filteredScreens = screens.filter(s => s.label.toLowerCase().includes(query.toLowerCase()))
  const filteredActions = actions.filter(a => a.label.toLowerCase().includes(query.toLowerCase()))

  const sections: { label: string; items: any[]; count: number }[] = []

  if (query.length > 0 || projectMode) {
    sections.push({ label: 'Projects', items: projects, count: projects.length })
  } else {
    sections.push({ label: 'Actions', items: filteredActions, count: filteredActions.length })
  }
  sections.push({ label: 'Navigate', items: filteredScreens, count: filteredScreens.length })

  const totalItems = sections.reduce((sum, s) => sum + s.count, 0)

  useEffect(() => {
    if (open) {
      setQuery('')
      setSelectedIndex(0)
      setProjects([])
      setProjectMode(false)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  useEffect(() => {
    if (searchRef.current) clearTimeout(searchRef.current)
    if (query.length > 0 || projectMode) {
      setLoadingProjects(true)
      searchRef.current = setTimeout(() => {
        api.searchProjects(query || '').then((data: any[]) => {
          setProjects(data || [])
        }).catch(() => {}).finally(() => setLoadingProjects(false))
      }, 200)
    } else {
      setProjects([])
      setLoadingProjects(false)
    }
    return () => { if (searchRef.current) clearTimeout(searchRef.current) }
  }, [query, projectMode])

  useEffect(() => { setSelectedIndex(0) }, [query, projectMode])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      if (open) onClose()
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
      e.preventDefault()
      if (open) setProjectMode(p => !p)
    }
  }, [open, onClose])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const getGlobalIndex = (sectionIdx: number, itemIdx: number) => {
    let idx = 0
    for (let i = 0; i < sectionIdx; i++) idx += sections[i].count
    return idx + itemIdx
  }

  const handleKeyboardNav = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(i => Math.min(i + 1, totalItems - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      let idx = 0
      for (const section of sections) {
        if (idx + section.count > selectedIndex) {
          const item = section.items[selectedIndex - idx]
          if (!item) return
          if (section.label === 'Navigate') {
            onNavigate(item.screen)
          } else if (section.label === 'Projects') {
            onOpenProject?.(item.id)
          } else if (section.label === 'Actions') {
            handleAction(item.id)
          }
          onClose()
          return
        }
        idx += section.count
      }
    }
  }

  const handleAction = (id: string) => {
    if (id === 'new-project') onNavigate('workspace')
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: -4 }}
          transition={{ duration: 0.15 }}
          className="relative w-full max-w-lg rounded-xl border border-[#202020] bg-[#0F0F0F] shadow-2xl overflow-hidden"
        >
          <div className="flex items-center gap-3 px-4 h-12 border-b border-[#202020]">
            <Search size={16} className="text-[#6E6E6E] flex-shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => { setQuery(e.target.value); setProjectMode(false) }}
              onKeyDown={handleKeyboardNav}
              placeholder={projectMode ? 'Search projects...' : 'Search commands and projects...'}
              className="flex-1 bg-transparent text-sm text-white placeholder-[#6E6E6E] outline-none"
            />
            <kbd className="text-[10px] font-mono bg-[#151515] border border-[#202020] rounded px-1.5 py-0.5 text-[#6E6E6E]">ESC</kbd>
          </div>

          <div className="max-h-72 overflow-y-auto py-1">
            {totalItems === 0 && !loadingProjects ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-[#6E6E6E]">No results found</p>
              </div>
            ) : (
              sections.map((section, sIdx) => {
                if (section.count === 0) return null

                return (
                  <div key={section.label}>
                    <div className="px-4 py-1.5">
                      <span className="text-[10px] font-medium text-[#6E6E6E] uppercase tracking-wider">
                        {section.label}
                      </span>
                    </div>
                    {section.items.map((item: any, i: number) => {
                      const idx = getGlobalIndex(sIdx, i)
                      const isSelected = idx === selectedIndex
                      const baseClass = `w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors cursor-pointer ${
                        isSelected ? 'bg-[#151515] text-white' : 'text-[#A8A8A8] hover:bg-[#080808] hover:text-white'
                      }`

                      if (section.label === 'Projects') {
                        return (
                          <button
                            key={item.id}
                            onClick={() => { onOpenProject?.(item.id); onClose() }}
                            className={baseClass}
                          >
                            <FolderOpen size={15} className="flex-shrink-0 text-[#7C6BFF]" />
                            <div className="flex-1 min-w-0 text-left">
                              <span className="block truncate">{item.name}</span>
                              {item.type && <span className="text-[10px] text-[#6B7280]">{item.type}</span>}
                            </div>
                            <ArrowRight size={13} className="flex-shrink-0 text-[#6E6E6E]" />
                          </button>
                        )
                      }

                      if (section.label === 'Actions') {
                        return (
                          <button
                            key={item.id}
                            onClick={() => { handleAction(item.id); onClose() }}
                            className={baseClass}
                          >
                            <item.icon size={15} className="flex-shrink-0" />
                            <span className="flex-1 text-left">{item.label}</span>
                            {item.shortcut && (
                              <kbd className="text-[10px] font-mono bg-[#080808] border border-[#202020] rounded px-1.5 py-0.5 text-[#6E6E6E]">{item.shortcut}</kbd>
                            )}
                          </button>
                        )
                      }

                      return (
                        <button
                          key={item.id}
                          onClick={() => { onNavigate(item.screen); onClose() }}
                          className={baseClass}
                        >
                          <item.icon size={15} className="flex-shrink-0" />
                          <span>{item.label}</span>
                        </button>
                      )
                    })}
                  </div>
                )
              })
            )}
          </div>

          <div className="flex items-center gap-3 px-4 py-2 border-t border-[#202020] bg-[#080808]">
            <kbd className="text-[10px] font-mono bg-[#151515] border border-[#202020] rounded px-1.5 py-0.5 text-[#6E6E6E]">↑↓</kbd>
            <span className="text-[10px] text-[#6E6E6E]">Navigate</span>
            <kbd className="text-[10px] font-mono bg-[#151515] border border-[#202020] rounded px-1.5 py-0.5 text-[#6E6E6E]">↵</kbd>
            <span className="text-[10px] text-[#6E6E6E]">Select</span>
            <kbd className="text-[10px] font-mono bg-[#151515] border border-[#202020] rounded px-1.5 py-0.5 text-[#6E6E6E]">Esc</kbd>
            <span className="text-[10px] text-[#6E6E6E]">Close</span>
            <span className="flex-1" />
            <kbd className="text-[10px] font-mono bg-[#151515] border border-[#202020] rounded px-1.5 py-0.5 text-[#6E6E6E]">Ctrl+P</kbd>
            <span className="text-[10px] text-[#6E6E6E]">Projects</span>
          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  )
}
