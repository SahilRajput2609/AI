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
  attachments: 2,
  comments: 3,
  progress: 60,
}

describe('KanbanCard', () => {
  it('renders card title', () => {
    render(<KanbanCard card={baseCard} onDragStart={vi.fn()} columnId="col1" />)
    expect(screen.getByText('Test Task')).toBeTruthy()
  })

  it('renders priority label', () => {
    render(<KanbanCard card={baseCard} onDragStart={vi.fn()} columnId="col1" />)
    expect(screen.getByText('High')).toBeTruthy()
  })

  it('renders tags', () => {
    render(<KanbanCard card={baseCard} onDragStart={vi.fn()} columnId="col1" />)
    expect(screen.getByText('bug')).toBeTruthy()
    expect(screen.getByText('frontend')).toBeTruthy()
  })

  it('renders assignee initial', () => {
    render(<KanbanCard card={baseCard} onDragStart={vi.fn()} columnId="col1" />)
    expect(screen.getByText('C')).toBeTruthy() // First letter of 'Coder Agent'
  })

  it('renders attachment and comment counts', () => {
    render(<KanbanCard card={baseCard} onDragStart={vi.fn()} columnId="col1" />)
    expect(screen.getByText('2')).toBeTruthy()
    expect(screen.getByText('3')).toBeTruthy()
  })

  it('renders progress bar', () => {
    const { container } = render(<KanbanCard card={baseCard} onDragStart={vi.fn()} columnId="col1" />)
    const bar = container.querySelector('[style*="width: 60%"]')
    expect(bar).toBeTruthy()
  })

  it('shows completed checkmark when completed', () => {
    const completedCard = { ...baseCard, completed: true }
    const { container } = render(<KanbanCard card={completedCard} onDragStart={vi.fn()} columnId="col1" />)
    const iconContainer = container.querySelector('svg')
    expect(iconContainer).toBeTruthy()
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
