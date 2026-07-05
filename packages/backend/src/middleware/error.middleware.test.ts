import { describe, it, expect, vi } from 'vitest'
import { AppError, errorMiddleware, notFoundMiddleware } from './error.middleware.js'
import type { Request, Response } from 'express'

function createMocks() {
  const req = { path: '/test' } as Request
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response
  const next = vi.fn()
  return { req, res, next }
}

describe('AppError', () => {
  it('creates an operational error', () => {
    const error = new AppError(404, 'Not found')
    expect(error.statusCode).toBe(404)
    expect(error.message).toBe('Not found')
    expect(error.isOperational).toBe(true)
  })

  it('inherits from Error', () => {
    const error = new AppError(500, 'Server error')
    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(AppError)
  })
})

describe('errorMiddleware', () => {
  it('handles AppError with correct status', () => {
    const { req, res, next } = createMocks()
    const error = new AppError(400, 'Bad request')

    errorMiddleware(error, req, res, next)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ error: 'Bad request', statusCode: 400 })
  })

  it('handles unknown error as 500', () => {
    const { req, res, next } = createMocks()
    const error = new Error('Unexpected')

    errorMiddleware(error, req, res, next)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error', statusCode: 500 })
  })
})

describe('notFoundMiddleware', () => {
  it('returns 404 with path', () => {
    const { req, res, next } = createMocks()

    notFoundMiddleware(req, res, next)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith({ error: 'Route not found', statusCode: 404, path: '/test' })
  })
})
