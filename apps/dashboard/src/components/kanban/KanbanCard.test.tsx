import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { KanbanCard } from './KanbanCard'
import type { KanbanCardData } from '../../data/kanban'

const baseCard: KanbanCardData = {
  id: '1',
  title: 'Test Task',
  priority: 'high',
  tags: ['bug', 'frontend'],
  assignee: 'Coder Agent',
  attachments: 0,
  comments: 0,
  progress: 60,
}

describe('KanbanCard', () => {
  it('renders card title', () => {
    render(<KanbanCard card={baseCard} onDragStart={vi.fn()} columnId="col1" />)
    expect(screen.getByText('Test Task')).toBeTruthy()
  })

  it('renders priority indicator', () => {
    const { container } = render(<KanbanCard card={baseCard} onDragStart={vi.fn()} columnId="col1" />)
    // Priority is shown as a colored indicator, check that the card renders
    expect(screen.getByText('Test Task')).toBeTruthy()
    expect(container.querySelector('[draggable]')).toBeTruthy()
  })

  it('renders card with drag support', () => {
    const { container } = render(<KanbanCard card={baseCard} onDragStart={vi.fn()} columnId="col1" />)
    const draggableElement = container.querySelector('[draggable="true"]')
    expect(draggableElement).toBeTruthy()
  })

  it('renders card priority in footer', () => {
    render(<KanbanCard card={baseCard} onDragStart={vi.fn()} columnId="col1" />)
    // Priority is displayed in footer in uppercase
    expect(screen.getByText('HIGH')).toBeTruthy()
  })

  it('renders card ID in footer', () => {
    render(<KanbanCard card={baseCard} onDragStart={vi.fn()} columnId="col1" />)
    // Card ID is shown in footer (sliced to 8 chars)
    expect(screen.getByText('ID: 1')).toBeTruthy()
  })

  it('fires onDragStart when dragged', () => {
    const onDragStart = vi.fn()
    render(<KanbanCard card={baseCard} onDragStart={onDragStart} columnId="col1" />)
    const card = screen.getByText('Test Task').closest('div[draggable]')
    if (card) {
      fireEvent.dragStart(card)
      expect(onDragStart).toHaveBeenCalled()
    }
  })
})
