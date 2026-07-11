import { useState, useCallback, useEffect } from 'react'
import { Search, Plus, Filter, X } from 'lucide-react'
import type { KanbanColumnData, KanbanCardData } from '../data/kanban'
import { KanbanColumn } from '../components/kanban/KanbanColumn'
import { api } from '../lib/api'
import { EmptyState } from '../components/ui/EmptyState'
import { SkeletonTable } from '../components/ui/Skeleton'
import { clsx } from '../components/utils/clsx'

const COLUMN_MAP: Record<string, { title: string; color: string }> = {
  pending: { title: 'Backlog', color: '#6E6E6E' },
  in_progress: { title: 'In Progress', color: '#FACC15' },
  completed: { title: 'Done', color: '#22C55E' },
  failed: { title: 'Failed', color: '#EF4444' },
}

function buildColumns(tasks: any[]): KanbanColumnData[] {
  const columns: KanbanColumnData[] = []
  for (const [status, meta] of Object.entries(COLUMN_MAP)) {
    const cards: KanbanCardData[] = tasks
      .filter((t: any) => t.status === status)
      .map((t: any) => ({
        id: t.id,
        title: t.title,
        priority: t.priority || 'medium',
        tags: t.tags || [],
        assignee: t.assigned_agent || null,
        attachments: t.attachments || 0,
        comments: t.comments || 0,
        progress: t.progress,
        completed: status === 'completed',
      }))
    columns.push({ id: status, title: meta.title, color: meta.color, count: cards.length, cards })
  }
  return columns
}

export function KanbanScreen() {
  const [columns, setColumns] = useState<KanbanColumnData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [showNewTask, setShowNewTask] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDescription, setNewTaskDescription] = useState('')
  const [filterPriority, setFilterPriority] = useState<string | null>(null)

  useEffect(() => {
    fetchTasks()
  }, [])

  async function fetchTasks() {
    setLoading(true)
    setError(null)
    try {
      const tasks = await api.getTasks()
      let filtered = tasks
      if (searchQuery)
        filtered = filtered.filter((t: any) => t.title?.toLowerCase().includes(searchQuery.toLowerCase()))
      if (filterPriority) filtered = filtered.filter((t: any) => t.priority === filterPriority)
      setColumns(buildColumns(filtered))
    } catch {
      setError('Failed to load tasks')
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchTasks()
  }, [searchQuery, filterPriority])

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) return
    try {
      await api.createTask({ title: newTaskTitle, description: newTaskDescription, priority: 'medium' })
      setNewTaskTitle('')
      setNewTaskDescription('')
      setShowNewTask(false)
      await fetchTasks()
    } catch {}
  }

  const handleDragStart = useCallback((e: React.DragEvent, cardId: string, columnId: string) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ cardId, columnId }))
    e.dataTransfer.effectAllowed = 'move'
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, columnId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverColumn(columnId)
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault()
    setDragOverColumn(null)
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'))
      const { cardId, columnId: sourceColumnId } = data
      if (sourceColumnId === targetColumnId) return
      setColumns((prev) => {
        const sourceIdx = prev.findIndex((c) => c.id === sourceColumnId)
        const targetIdx = prev.findIndex((c) => c.id === targetColumnId)
        if (sourceIdx === -1 || targetIdx === -1) return prev
        const newColumns = prev.map((col) => ({ ...col, cards: [...col.cards] }))
        const sourceCol = newColumns[sourceIdx]
        const targetCol = newColumns[targetIdx]
        const cardIdx = sourceCol.cards.findIndex((c) => c.id === cardId)
        if (cardIdx === -1) return prev
        const [movedCard] = sourceCol.cards.splice(cardIdx, 1)
        targetCol.cards.push(movedCard)
        if (movedCard.completed) movedCard.completed = false
        if (targetColumnId === 'completed') movedCard.completed = true
        return newColumns
      })
      await api.updateTask(cardId, { status: targetColumnId })
    } catch {
      fetchTasks()
    }
  }, [])

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center text-sm text-[#EF4444]">
        {error}
        <button onClick={fetchTasks} className="ml-3 text-[#6E6E6E] hover:text-white underline cursor-pointer">
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#202020]">
        <div>
          <h1 className="text-base font-semibold text-white">Tasks</h1>
          <p className="text-xs text-[#6E6E6E]">Drag tasks between columns to update status</p>
        </div>
        <div className="flex items-center gap-2">
          {showSearch ? (
            <div className="flex items-center gap-2 h-8 px-3 rounded-lg border border-[#202020] bg-[#080808]">
              <Search size={14} className="text-[#6E6E6E]" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks..."
                className="bg-transparent text-xs text-white outline-none w-32 placeholder-[#6E6E6E]"
                autoFocus
              />
              <button
                onClick={() => {
                  setSearchQuery('')
                  setShowSearch(false)
                }}
                aria-label="Clear search"
                className="text-[#6E6E6E] hover:text-white transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowSearch(true)}
              className="flex items-center gap-2 h-8 px-3 rounded-lg border border-[#202020] bg-transparent text-[#A8A8A8] text-xs hover:bg-[#080808] hover:border-[#7C6BFF]/30 transition-colors"
            >
              <Search size={14} /> Search
            </button>
          )}
          <div className="relative">
            <button
              onClick={() => setFilterPriority(filterPriority ? null : 'high')}
              className={clsx(
                'flex items-center gap-2 h-8 px-3 rounded-lg border text-xs transition-colors',
                filterPriority
                  ? 'border-[#7C6BFF] bg-[#7C6BFF]/10 text-[#7C6BFF]'
                  : 'border-[#202020] bg-transparent text-[#A8A8A8] hover:bg-[#080808] hover:border-[#7C6BFF]/30',
              )}
            >
              <Filter size={14} /> {filterPriority ? `Priority: ${filterPriority}` : 'Filter'}
            </button>
          </div>
          <button
            onClick={() => setShowNewTask(true)}
            className="flex items-center gap-2 h-8 px-3 rounded-lg bg-white text-black text-xs font-medium hover:bg-[#ececff] shadow-[0_4px_16px_-4px_rgba(124,107,255,0.35)] transition-colors"
          >
            <Plus size={14} /> New Task
          </button>
        </div>
      </div>

      {/* New Task Modal */}
      {showNewTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="glass rounded-xl p-5 w-96 shadow-[0_8px_32px_-8px_rgba(124,107,255,0.2)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-white">New Task</h3>
              <button
                onClick={() => setShowNewTask(false)}
                aria-label="Close"
                className="text-[#6E6E6E] hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
            </div>
            <div className="space-y-3">
              <input
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Task title"
                className="w-full bg-[#080808] border border-[#202020] rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-[#7C6BFF]/40"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleCreateTask()}
              />
              <textarea
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                placeholder="Description (optional)"
                rows={3}
                className="w-full bg-[#080808] border border-[#202020] rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-[#7C6BFF]/40 resize-none"
              />
              <div className="flex gap-2 justify-end pt-2">
                <button
                  onClick={() => setShowNewTask(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-[#A8A8A8] hover:text-white hover:bg-[#151515] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTask}
                  disabled={!newTaskTitle.trim()}
                  className="px-4 py-1.5 rounded-lg bg-white text-black text-xs font-medium hover:bg-[#ececff] shadow-[0_4px_16px_-4px_rgba(124,107,255,0.35)] disabled:opacity-30 transition-colors"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Board */}
      {loading ? (
        <div className="p-6">
          <SkeletonTable rows={3} />
        </div>
      ) : columns.every((c) => c.cards.length === 0) ? (
        <EmptyState title="No tasks yet" description="Create your first task to get started." />
      ) : (
        <div className="flex-1 overflow-x-auto p-6">
          <div className="flex gap-4 h-full items-start">
            {columns.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                isDragOver={dragOverColumn === column.id}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
