import { describe, it, expect } from 'vitest'
import { initialColumns, priorityConfig } from './kanban'

describe('kanban data', () => {
  it('has kanban columns', () => {
    const ids = initialColumns.map(c => c.id)
    expect(ids).toContain('pending')
    expect(ids).toContain('in_progress')
    expect(ids).toContain('completed')
  })

  it('has priority config for all priorities', () => {
    expect(priorityConfig.high.label).toBe('High')
    expect(priorityConfig.medium.label).toBe('Medium')
    expect(priorityConfig.low.label).toBe('Low')
  })

  it('all cards have valid priorities', () => {
    const priorities = Object.keys(priorityConfig)
    for (const column of initialColumns) {
      for (const card of column.cards) {
        expect(priorities).toContain(card.priority)
      }
    }
  })
})
