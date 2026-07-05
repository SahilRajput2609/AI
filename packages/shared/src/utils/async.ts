// Async utility functions

export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export const retry = async <T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  delayMs = 1000
): Promise<T> => {
  let lastError: Error | undefined

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      if (attempt < maxAttempts) {
        await sleep(delayMs * attempt)
      }
    }
  }

  throw lastError || new Error('Retry failed')
}

export const timeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout exceeded')), ms)
    ),
  ])
}

export const batch = async <T, R>(
  items: T[],
  fn: (item: T) => Promise<R>,
  batchSize = 10
): Promise<R[]> => {
  const results: R[] = []

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    const batchResults = await Promise.all(batch.map(fn))
    results.push(...batchResults)
  }

  return results
}

export const debounce = <T extends (...args: unknown[]) => unknown>(
  fn: T,
  delayMs: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout | undefined

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(() => fn(...args), delayMs)
  }
}

export const throttle = <T extends (...args: unknown[]) => unknown>(
  fn: T,
  delayMs: number
): ((...args: Parameters<T>) => void) => {
  let lastCall = 0

  return (...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastCall >= delayMs) {
      lastCall = now
      fn(...args)
    }
  }
}
