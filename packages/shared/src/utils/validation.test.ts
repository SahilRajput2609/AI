import { describe, it, expect } from 'vitest'
import {
  validateEmail,
  validateUrl,
  validateRequired,
  validateMinLength,
  validateMaxLength,
  validateRange,
  validatePattern,
  runValidations,
} from './validation.js'

describe('validateEmail', () => {
  it('returns true for valid emails', () => {
    expect(validateEmail('user@example.com')).toBe(true)
    expect(validateEmail('a.b@c.co')).toBe(true)
    expect(validateEmail('test+label@domain.org')).toBe(true)
  })

  it('returns false for invalid emails', () => {
    expect(validateEmail('')).toBe(false)
    expect(validateEmail('not-an-email')).toBe(false)
    expect(validateEmail('@domain.com')).toBe(false)
    expect(validateEmail('user@')).toBe(false)
  })
})

describe('validateUrl', () => {
  it('returns true for valid URLs', () => {
    expect(validateUrl('https://example.com')).toBe(true)
    expect(validateUrl('http://localhost:3000')).toBe(true)
    expect(validateUrl('https://api.openai.com/v1')).toBe(true)
  })

  it('returns false for invalid URLs', () => {
    expect(validateUrl('')).toBe(false)
    expect(validateUrl('not-a-url')).toBe(false)
  })
})

describe('validateRequired', () => {
  it('returns true for non-empty values', () => {
    expect(validateRequired('hello')).toBe(true)
    expect(validateRequired(0)).toBe(true)
    expect(validateRequired(false)).toBe(true)
    expect(validateRequired({})).toBe(true)
  })

  it('returns false for null/undefined/empty string', () => {
    expect(validateRequired(null)).toBe(false)
    expect(validateRequired(undefined)).toBe(false)
    expect(validateRequired('')).toBe(false)
    expect(validateRequired('   ')).toBe(false)
  })
})

describe('validateMinLength', () => {
  it('returns true when string meets minimum length', () => {
    expect(validateMinLength('hello', 3)).toBe(true)
    expect(validateMinLength('abc', 3)).toBe(true)
  })

  it('returns false when string is too short', () => {
    expect(validateMinLength('ab', 3)).toBe(false)
    expect(validateMinLength('', 1)).toBe(false)
  })
})

describe('validateMaxLength', () => {
  it('returns true when string does not exceed maximum', () => {
    expect(validateMaxLength('hi', 10)).toBe(true)
    expect(validateMaxLength('hello', 5)).toBe(true)
  })

  it('returns false when string is too long', () => {
    expect(validateMaxLength('hello world', 5)).toBe(false)
  })
})

describe('validateRange', () => {
  it('returns true when value is within range', () => {
    expect(validateRange(5, 0, 10)).toBe(true)
    expect(validateRange(0, 0, 10)).toBe(true)
    expect(validateRange(10, 0, 10)).toBe(true)
  })

  it('returns false when value is outside range', () => {
    expect(validateRange(-1, 0, 10)).toBe(false)
    expect(validateRange(11, 0, 10)).toBe(false)
  })
})

describe('validatePattern', () => {
  it('returns true when value matches pattern', () => {
    expect(validatePattern('abc123', /^[a-z0-9]+$/)).toBe(true)
  })

  it('returns false when value does not match pattern', () => {
    expect(validatePattern('ABC', /^[a-z]+$/)).toBe(false)
  })
})

describe('runValidations', () => {
  it('returns empty array when all rules pass', () => {
    const rules = [
      { validate: (v: unknown) => typeof v === 'string' && (v as string).length > 0, message: 'Required' },
      { validate: (v: unknown) => typeof v === 'string' && (v as string).length >= 3, message: 'Min length 3' },
    ]
    expect(runValidations('hello', rules)).toEqual([])
  })

  it('returns error messages for failed rules', () => {
    const rules = [
      { validate: (v: unknown) => typeof v === 'string' && (v as string).length > 0, message: 'Required' },
      { validate: (v: unknown) => typeof v === 'string' && (v as string).length >= 3, message: 'Min length 3' },
    ]
    expect(runValidations('ab', rules)).toEqual(['Min length 3'])
    expect(runValidations('', rules)).toEqual(['Required', 'Min length 3'])
  })
})
