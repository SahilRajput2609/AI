import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Badge } from './Badge'

describe('Badge', () => {
  it('renders children', () => {
    render(<Badge>Active</Badge>)
    expect(screen.getByText('Active')).toBeTruthy()
  })

  it('applies default variant styling', () => {
    const { container } = render(<Badge>Default</Badge>)
    const span = container.querySelector('span')
    expect(span?.className).toContain('bg-[#2a2a2a]')
    expect(span?.className).toContain('text-[#A1A1AA]')
  })

  it('applies success variant', () => {
    const { container } = render(<Badge variant="success">Success</Badge>)
    const span = container.querySelector('span')
    expect(span?.className).toContain('bg-[#10b981]/10')
    expect(span?.className).toContain('text-[#10b981]')
  })

  it('applies error variant', () => {
    const { container } = render(<Badge variant="error">Error</Badge>)
    const span = container.querySelector('span')
    expect(span?.className).toContain('bg-[#ef4444]/10')
    expect(span?.className).toContain('text-[#ef4444]')
  })

  it('applies warning variant', () => {
    const { container } = render(<Badge variant="warning">Warning</Badge>)
    const span = container.querySelector('span')
    expect(span?.className).toContain('bg-[#f59e0b]/10')
    expect(span?.className).toContain('text-[#f59e0b]')
  })
})
