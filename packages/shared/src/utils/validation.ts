// Common validation utilities

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validateUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export const validateRequired = (value: unknown): boolean => {
  if (value === null || value === undefined) return false
  if (typeof value === 'string' && value.trim() === '') return false
  return true
}

export const validateMinLength = (value: string, minLength: number): boolean => {
  return value.length >= minLength
}

export const validateMaxLength = (value: string, maxLength: number): boolean => {
  return value.length <= maxLength
}

export const validateRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max
}

export const validatePattern = (value: string, pattern: RegExp): boolean => {
  return pattern.test(value)
}

export interface ValidationRule {
  validate: (value: unknown) => boolean
  message: string
}

export const runValidations = (value: unknown, rules: ValidationRule[]): string[] => {
  const errors: string[] = []
  for (const rule of rules) {
    if (!rule.validate(value)) {
      errors.push(rule.message)
    }
  }
  return errors
}
