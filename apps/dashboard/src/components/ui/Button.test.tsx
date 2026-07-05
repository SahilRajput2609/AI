import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './Button'

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeTruthy()
  })

  it('applies primary variant by default', () => {
    const { container } = render(<Button>Primary</Button>)
    const button = container.querySelector('button')
    expect(button?.className).toContain('bg-[#cca374]')
  })

  it('applies ghost variant', () => {
    const { container } = render(<Button variant="ghost">Ghost</Button>)
    const button = container.querySelector('button')
    expect(button?.className).toContain('bg-transparent')
  })

  it('applies full width class', () => {
    const { container } = render(<Button fullWidth>Full</Button>)
    const button = container.querySelector('button')
    expect(button?.className).toContain('w-full')
  })

  it('handles click events', () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Click</Button>)
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('respects disabled state', () => {
    render(<Button disabled>Disabled</Button>)
    const button = screen.getByRole('button') as HTMLButtonElement
    expect(button.disabled).toBe(true)
  })
})
