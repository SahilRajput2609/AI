import { describe, it, expect, vi } from 'vitest'
import { sleep, retry, timeout, debounce, throttle } from './async.js'

describe('sleep', () => {
  it('resolves after specified time', async () => {
    const start = Date.now()
    await sleep(50)
    expect(Date.now() - start).toBeGreaterThanOrEqual(45)
  })
})

describe('retry', () => {
  it('retries on failure and eventually succeeds', async () => {
    let attempts = 0
    const fn = vi.fn().mockImplementation(() => {
      attempts++
      if (attempts < 3) throw new Error('fail')
      return 'success'
    })

    const result = await retry(fn, 3, 10)
    expect(result).toBe('success')
    expect(fn).toHaveBeenCalledTimes(3)
  })

  it('throws after max attempts', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('always fail'))
    await expect(retry(fn, 2, 10)).rejects.toThrow('always fail')
    expect(fn).toHaveBeenCalledTimes(2)
  })
})

describe('timeout', () => {
  it('resolves if promise completes in time', async () => {
    const result = await timeout(Promise.resolve('ok'), 100)
    expect(result).toBe('ok')
  })

  it('rejects if promise takes too long', async () => {
    await expect(timeout(sleep(200), 50)).rejects.toThrow('Timeout exceeded')
  })
})

describe('debounce', () => {
  it('delays function execution', async () => {
    vi.useFakeTimers()
    const fn = vi.fn()
    const debounced = debounce(fn, 100)

    debounced()
    debounced()
    debounced()

    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(1)

    vi.useRealTimers()
  })
})

describe('throttle', () => {
  it('limits function execution rate', () => {
    vi.useFakeTimers()
    const fn = vi.fn()
    const throttled = throttle(fn, 100)

    throttled()
    throttled()
    throttled()

    expect(fn).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(100)
    throttled()
    expect(fn).toHaveBeenCalledTimes(2)

    vi.useRealTimers()
  })
})
