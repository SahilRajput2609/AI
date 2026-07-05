import { describe, it, expect } from 'vitest'
import { clsx } from './clsx'

describe('clsx', () => {
  it('joins string arguments', () => {
    expect(clsx('foo', 'bar')).toBe('foo bar')
  })

  it('filters out falsy values', () => {
    expect(clsx('foo', false, null, undefined, 0, 'bar')).toBe('foo bar')
  })

  it('returns empty string for no truthy args', () => {
    expect(clsx(false, null, undefined, 0)).toBe('')
  })
})
