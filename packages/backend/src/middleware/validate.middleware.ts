import type { Request, Response, NextFunction } from 'express'

interface ValidationRule {
  field: string
  required?: boolean
  type?: 'string' | 'number' | 'boolean' | 'object' | 'array'
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  message?: string
}

export function validate(rules: ValidationRule[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: string[] = []

    for (const rule of rules) {
      const value = req.body[rule.field]

      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push(rule.message || `${rule.field} is required`)
        continue
      }

      if (value === undefined || value === null) continue

      if (rule.type && typeof value !== rule.type) {
        errors.push(`${rule.field} must be a ${rule.type}`)
        continue
      }

      if (rule.type === 'string') {
        const str = value as string
        if (rule.minLength !== undefined && str.length < rule.minLength) {
          errors.push(`${rule.field} must be at least ${rule.minLength} characters`)
        }
        if (rule.maxLength !== undefined && str.length > rule.maxLength) {
          errors.push(`${rule.field} must be at most ${rule.maxLength} characters`)
        }
        if (rule.pattern && !rule.pattern.test(str)) {
          errors.push(rule.message || `${rule.field} format is invalid`)
        }
      }
    }

    if (errors.length > 0) {
      res.status(400).json({ error: errors.join('; ') })
      return
    }

    next()
  }
}
