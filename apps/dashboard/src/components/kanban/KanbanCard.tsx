import { Paperclip, MessageSquare, CheckCircle } from 'lucide-react'
import type { KanbanCardData } from '../../data/kanban'
import { priorityConfig } from '../../data/kanban'
import { ProgressBar } from '../ui/ProgressBar'

interface KanbanCardProps {
  card: KanbanCardData
  onDragStart: (e: React.DragEvent, cardId: string, columnId: string) => void
  columnId: string
}

export function KanbanCard({ card, onDragStart, columnId }: KanbanCardProps) {
  const priority = priorityConfig[card.priority]

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, card.id, columnId)}
      className="bg-surface-card rounded-[10px] border border-white/5 p-3.5 mb-2.5 cursor-grab active:cursor-grabbing transition-all duration-200 hover:-translate-y-0.5 hover:border-white/10 hover:shadow-md active:opacity-50 active:scale-[1.02] will-change-transform"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span
          className="text-[11px] font-medium px-2 py-0.5 rounded-[6px]"
          style={{ background: priority.bg, color: priority.color }}
        >
          {priority.label}
        </span>
        <div className="flex gap-1.5 flex-wrap justify-end">
          {card.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] text-text-muted bg-white/5 px-1.5 py-0.5 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <h4 className="text-sm text-text-primary font-medium leading-snug mb-2">
        {card.completed && <CheckCircle className="inline text-accent-success mr-1.5" size={14} />}
        {card.title}
      </h4>

      {card.progress !== undefined && (
        <ProgressBar value={card.progress} max={100} color="primary" valueLabel={`${card.progress}%`} className="mb-2" />
      )}

      <div className="flex items-center justify-between text-xs text-text-muted">
        <div className="flex items-center gap-3">
          {card.assignee && (
            <span className="flex items-center gap-1">
              <span className="w-4 h-4 rounded-full bg-accent-primary-subtle flex items-center justify-center text-[8px] font-medium text-accent-primary">
                {card.assignee.charAt(0)}
              </span>
              {card.assignee}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {card.attachments > 0 && (
            <span className="flex items-center gap-1">
              <Paperclip size={12} />
              {card.attachments}
            </span>
          )}
          {card.comments > 0 && (
            <span className="flex items-center gap-1">
              <MessageSquare size={12} />
              {card.comments}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
