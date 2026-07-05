import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { KanbanColumn } from './KanbanColumn'
import type { KanbanColumnData } from '../../data/kanban'

const column: KanbanColumnData = {
  id: 'pending',
  title: 'Backlog',
  color: '#64748B',
  count: 2,
  cards: [
    { id: '1', title: 'Task 1', priority: 'low', tags: [], assignee: null, attachments: 0, comments: 0 },
    { id: '2', title: 'Task 2', priority: 'medium', tags: ['ui'], assignee: null, attachments: 1, comments: 2 },
  ],
}

describe('KanbanColumn', () => {
  it('renders column title and count', () => {
    render(<KanbanColumn column={column} onDragStart={vi.fn()} onDragOver={vi.fn()} onDrop={vi.fn()} isDragOver={false} />)
    expect(screen.getByText('Backlog')).toBeTruthy()
    expect(screen.getAllByText('2').length).toBeGreaterThanOrEqual(1)
  })

  it('renders all cards in column', () => {
    render(<KanbanColumn column={column} onDragStart={vi.fn()} onDragOver={vi.fn()} onDrop={vi.fn()} isDragOver={false} />)
    expect(screen.getByText('Task 1')).toBeTruthy()
    expect(screen.getByText('Task 2')).toBeTruthy()
  })

  it('fires onDragOver when dragging over', () => {
    const onDragOver = vi.fn()
    render(<KanbanColumn column={column} onDragStart={vi.fn()} onDragOver={onDragOver} onDrop={vi.fn()} isDragOver={false} />)
    const columnDiv = screen.getByText('Backlog').closest('div[style]')
    if (columnDiv) {
      fireEvent.dragOver(columnDiv)
      expect(onDragOver).toHaveBeenCalled()
    }
  })

  it('fires onDrop when dropping', () => {
    const onDrop = vi.fn()
    render(<KanbanColumn column={column} onDragStart={vi.fn()} onDragOver={vi.fn()} onDrop={onDrop} isDragOver={false} />)
    const columnDiv = screen.getByText('Backlog').closest('div[style]')
    if (columnDiv) {
      fireEvent.drop(columnDiv)
      expect(onDrop).toHaveBeenCalled()
    }
  })
})
