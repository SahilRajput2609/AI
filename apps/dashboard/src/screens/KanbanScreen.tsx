import { useState, useCallback, useEffect } from 'react'
import { Search, Plus, Filter } from 'lucide-react'
import type { KanbanColumnData, KanbanCardData } from '../data/kanban'
import { KanbanColumn } from '../components/kanban/KanbanColumn'
import { api } from '../lib/api'

const COLUMN_MAP: Record<string, { title: string; color: string }> = {
  pending: { title: 'Backlog', color: '#64748B' },
  in_progress: { title: 'In Progress', color: '#3B82F6' },
  completed: { title: 'Done', color: '#22C55E' },
  failed: { title: 'Failed', color: '#EF4444' },
  cancelled: { title: 'Cancelled', color: '#6B7280' },
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

    columns.push({
      id: status,
      title: meta.title,
      color: meta.color,
      count: cards.length,
      cards,
    })
  }

  return columns
}

export function KanbanScreen() {
  const [columns, setColumns] = useState<KanbanColumnData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)

  useEffect(() => {
    fetchTasks()
  }, [])

  async function fetchTasks() {
    setLoading(true)
    setError(null)
    try {
      const tasks = await api.getTasks()
      setColumns(buildColumns(tasks))
    } catch {
      setError('Failed to load tasks')
    }
    setLoading(false)
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

      // Persist the status change
      await api.updateTask(cardId, { status: targetColumnId })
    } catch {
      fetchTasks() // Revert on failure by re-fetching
    }
  }, [])

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center text-sm text-red-400">
        {error}
        <button onClick={fetchTasks} className="ml-3 text-text-muted hover:text-text-primary underline cursor-pointer">Retry</button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-text-muted text-sm">
        Loading tasks...
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/5">
        <div>
          <h1 className="text-base font-semibold text-text-primary">Task Board</h1>
          <p className="text-xs text-text-muted">Drag tasks between columns to update progress</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-surface-input border border-white/10 rounded-[8px] px-3 py-1.5">
            <Search className="text-text-muted" size={14} />
            <input placeholder="Search tasks..." className="bg-transparent text-xs text-text-primary placeholder-text-muted outline-none w-32" />
          </div>
          <button className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary bg-surface-input border border-white/10 rounded-[8px] px-3 py-1.5 cursor-pointer transition-colors">
            <Filter size={14} />
            Filter
          </button>
          <button
            onClick={async () => {
              const title = prompt('Task title:')
              if (!title) return
              await api.createTask({ title, description: '', priority: 'medium', category: 'general' })
              fetchTasks()
            }}
            className="flex items-center gap-1.5 text-xs text-white bg-accent-primary hover:bg-accent-primary-hover rounded-[8px] px-3 py-1.5 cursor-pointer transition-colors"
          >
            <Plus size={14} />
            New Task
          </button>
        </div>
      </div>

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
    </div>
  )
}
