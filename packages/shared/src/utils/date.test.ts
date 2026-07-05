import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'
import {
  formatDate,
  formatTime,
  formatDateTime,
  formatRelativeTime,
  isToday,
  isYesterday,
  addDays,
  addHours,
} from './date.js'

describe('formatDate', () => {
  const date = new Date('2024-03-15T12:00:00')

  it('formats as short', () => {
    expect(formatDate(date, 'short')).toMatch(/Mar 15/)
  })

  it('formats as medium', () => {
    expect(formatDate(date, 'medium')).toMatch(/Mar 15, 2024/)
  })

  it('formats as long', () => {
    const result = formatDate(date, 'long')
    expect(result).toContain('March')
    expect(result).toContain('15')
    expect(result).toContain('2024')
  })
})

describe('formatTime', () => {
  it('formats time', () => {
    const date = new Date('2024-03-15T14:30:00')
    const result = formatTime(date)
    expect(result).toMatch(/02:30 PM|14:30/)
  })
})

describe('formatRelativeTime', () => {
  beforeAll(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-03-15T12:00:00'))
  })

  afterAll(() => {
    vi.useRealTimers()
  })

  it('returns "just now" for recent times', () => {
    expect(formatRelativeTime(new Date('2024-03-15T11:59:30'))).toBe('just now')
  })

  it('returns minutes ago', () => {
    expect(formatRelativeTime(new Date('2024-03-15T11:58:00'))).toBe('2m ago')
  })

  it('returns hours ago', () => {
    expect(formatRelativeTime(new Date('2024-03-15T09:00:00'))).toBe('3h ago')
  })

  it('returns days ago', () => {
    expect(formatRelativeTime(new Date('2024-03-13T12:00:00'))).toBe('2d ago')
  })
})

describe('isToday', () => {
  beforeAll(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-03-15T12:00:00'))
  })

  afterAll(() => {
    vi.useRealTimers()
  })

  it('returns true for today', () => {
    expect(isToday(new Date('2024-03-15T08:00:00'))).toBe(true)
  })

  it('returns false for other days', () => {
    expect(isToday(new Date('2024-03-14T12:00:00'))).toBe(false)
  })
})

describe('addDays', () => {
  it('adds days to date', () => {
    const date = new Date('2024-03-15')
    const result = addDays(date, 5)
    expect(result.getDate()).toBe(20)
  })
})

describe('addHours', () => {
  it('adds hours to date', () => {
    const date = new Date('2024-03-15T10:00:00')
    const result = addHours(date, 3)
    expect(result.getHours()).toBe(13)
  })
})
