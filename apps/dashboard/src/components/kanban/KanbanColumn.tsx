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
      className={`flex-shrink-0 rounded-lg p-4 transition-colors duration-150 min-w-[280px] ${isDragOver ? 'bg-[#080808]' : 'bg-transparent'}`}
      onDragOver={(e) => onDragOver(e, column.id)}
      onDrop={(e) => onDrop(e, column.id)}
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full" style={{ background: column.color }} />
        <h3 className="text-sm font-medium text-white">{column.title}</h3>
        <span className="text-[11px] text-[#6E6E6E] bg-[#0F0F0F] border border-[#202020] px-1.5 py-0.5 rounded">
          {column.cards.length}
        </span>
      </div>

      <div className="space-y-0">
        {column.cards.map((card) => (
          <KanbanCard key={card.id} card={card} onDragStart={onDragStart} columnId={column.id} />
        ))}
      </div>
    </div>
  )
}
