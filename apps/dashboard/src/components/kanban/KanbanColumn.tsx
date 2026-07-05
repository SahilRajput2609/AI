import { Plus } from 'lucide-react'
import type { KanbanColumnData } from '../../data/kanban'
import { KanbanCard } from './KanbanCard'

interface KanbanColumnProps {
  column: KanbanColumnData
  onDragStart: (e: React.DragEvent, cardId: string, columnId: string) => void
  onDragOver: (e: React.DragEvent, columnId: string) => void
  onDrop: (e: React.DragEvent, columnId: string) => void
  isDragOver: boolean
}

export function KanbanColumn({ column, onDragStart, onDragOver, onDrop, isDragOver }: KanbanColumnProps) {
  return (
    <div
      className={`flex-shrink-0 rounded-xl p-4 transition-colors duration-200 ${isDragOver ? 'bg-white/5' : ''}`}
      style={{
        width: 300,
        background: isDragOver ? 'rgba(255,255,255,0.05)' : `rgba(255,255,255,0.02)`,
      }}
      onDragOver={(e) => onDragOver(e, column.id)}
      onDrop={(e) => onDrop(e, column.id)}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: column.color }} />
          <h3 className="text-sm font-semibold text-text-primary">{column.title}</h3>
          <span className="text-xs text-text-muted bg-white/5 px-1.5 py-0.5 rounded-full">{column.cards.length}</span>
        </div>
        <button className="text-text-muted hover:text-text-primary cursor-pointer transition-colors">
          <Plus size={16} />
        </button>
      </div>

      <div className="flex flex-col">
        {column.cards.map((card) => (
          <KanbanCard key={card.id} card={card} onDragStart={onDragStart} columnId={column.id} />
        ))}
      </div>
    </div>
  )
}
