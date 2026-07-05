import { describe, it, expect } from 'vitest'
import { APP_NAME, APP_VERSION, AGENT_ROLES, TASK_PRIORITIES, TASK_STATUSES } from './constants/index.js'

describe('constants', () => {
  it('exports app metadata', () => {
    expect(APP_NAME).toBe('AI-Company')
    expect(APP_VERSION).toBe('1.0.0')
  })

  it('exports all agent roles', () => {
    expect(AGENT_ROLES).toContain('owner')
    expect(AGENT_ROLES).toContain('planner')
    expect(AGENT_ROLES).toContain('orchestrator')
    expect(AGENT_ROLES).toContain('coder')
    expect(AGENT_ROLES).toContain('reviewer')
  })

  it('exports task priorities', () => {
    expect(TASK_PRIORITIES).toContain('low')
    expect(TASK_PRIORITIES).toContain('medium')
    expect(TASK_PRIORITIES).toContain('high')
    expect(TASK_PRIORITIES).toContain('critical')
  })

  it('exports task statuses', () => {
    expect(TASK_STATUSES).toContain('pending')
    expect(TASK_STATUSES).toContain('completed')
    expect(TASK_STATUSES).toContain('failed')
  })
})
