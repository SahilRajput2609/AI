import { describe, it, expect } from 'vitest'
import {
  truncate,
  capitalize,
  capitalizeWords,
  camelToKebab,
  kebabToCamel,
  snakeToCamel,
  camelToSnake,
  slugify,
  randomString,
  formatBytes,
  formatNumber,
  extractInitials,
  generateId,
} from './string.js'

describe('truncate', () => {
  it('returns original string when within max length', () => {
    expect(truncate('hello', 10)).toBe('hello')
  })

  it('truncates with suffix when exceeding max length', () => {
    expect(truncate('hello world', 5)).toBe('he...')
  })

  it('uses custom suffix', () => {
    expect(truncate('hello world', 5, '>>')).toBe('hel>>')
  })
})

describe('capitalize', () => {
  it('capitalizes first letter and lowercases rest', () => {
    expect(capitalize('hello')).toBe('Hello')
    expect(capitalize('HELLO')).toBe('Hello')
    expect(capitalize('hELLO WORLD')).toBe('Hello world')
  })

  it('returns empty string for empty input', () => {
    expect(capitalize('')).toBe('')
  })
})

describe('capitalizeWords', () => {
  it('capitalizes each word', () => {
    expect(capitalizeWords('hello world')).toBe('Hello World')
  })
})

describe('camelToKebab', () => {
  it('converts camelCase to kebab-case', () => {
    expect(camelToKebab('helloWorld')).toBe('hello-world')
    expect(camelToKebab('getUserById')).toBe('get-user-by-id')
  })
})

describe('kebabToCamel', () => {
  it('converts kebab-case to camelCase', () => {
    expect(kebabToCamel('hello-world')).toBe('helloWorld')
  })
})

describe('snakeToCamel', () => {
  it('converts snake_case to camelCase', () => {
    expect(snakeToCamel('hello_world')).toBe('helloWorld')
  })
})

describe('camelToSnake', () => {
  it('converts camelCase to snake_case', () => {
    expect(camelToSnake('helloWorld')).toBe('hello_world')
  })
})

describe('slugify', () => {
  it('converts string to URL-friendly slug', () => {
    expect(slugify('Hello World')).toBe('hello-world')
    expect(slugify('  Hello   World  ')).toBe('hello-world')
    expect(slugify('Hello_World-Test')).toBe('hello-world-test')
  })
})

describe('randomString', () => {
  it('returns string of specified length', () => {
    expect(randomString(10)).toHaveLength(10)
    expect(randomString(0)).toHaveLength(0)
  })

  it('contains only alphanumeric characters', () => {
    const result = randomString(100)
    expect(result).toMatch(/^[a-zA-Z0-9]+$/)
  })
})

describe('formatBytes', () => {
  it('formats bytes to human readable', () => {
    expect(formatBytes(0)).toBe('0 Bytes')
    expect(formatBytes(1024)).toBe('1 KB')
    expect(formatBytes(1048576)).toBe('1 MB')
  })
})

describe('formatNumber', () => {
  it('formats number with commas', () => {
    expect(formatNumber(1000)).toBe('1,000')
    expect(formatNumber(1000000)).toBe('1,000,000')
  })
})

describe('extractInitials', () => {
  it('extracts initials from name', () => {
    expect(extractInitials('John Doe')).toBe('JD')
    expect(extractInitials('Alice')).toBe('A')
    expect(extractInitials('')).toBe('')
  })
})

describe('generateId', () => {
  it('generates id with prefix', () => {
    const id = generateId('task')
    expect(id).toMatch(/^task_\d+_[a-z0-9]+$/)
  })

  it('generates unique ids', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()))
    expect(ids.size).toBe(100)
  })
})
