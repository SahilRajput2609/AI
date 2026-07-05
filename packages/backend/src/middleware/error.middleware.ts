import type { Request, Response, NextFunction } from 'express'

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public isOperational = true
  ) {
    super(message)
    Object.setPrototypeOf(this, AppError.prototype)
  }
}

export function errorMiddleware(
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
      statusCode: err.statusCode
    })
    return
  }

  console.error('Unexpected error:', err)
  res.status(500).json({
    error: 'Internal server error',
    statusCode: 500
  })
}

export function notFoundMiddleware(req: Request, res: Response, next: NextFunction) {
  res.status(404).json({
    error: 'Route not found',
    statusCode: 404,
    path: req.path
  })
}

export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}
