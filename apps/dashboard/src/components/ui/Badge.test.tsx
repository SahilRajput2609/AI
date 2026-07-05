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
    expect(span?.className).toContain('bg-white/10')
  })

  it('applies success variant', () => {
    const { container } = render(<Badge variant="success">Success</Badge>)
    const span = container.querySelector('span')
    expect(span?.className).toContain('bg-accent-success-subtle')
  })

  it('applies error variant', () => {
    const { container } = render(<Badge variant="error">Error</Badge>)
    const span = container.querySelector('span')
    expect(span?.className).toContain('bg-accent-error-subtle')
  })

  it('applies info variant', () => {
    const { container } = render(<Badge variant="info">Info</Badge>)
    const span = container.querySelector('span')
    expect(span?.className).toContain('bg-accent-primary-subtle')
  })

  it('applies warning variant', () => {
    const { container } = render(<Badge variant="warning">Warning</Badge>)
    const span = container.querySelector('span')
    expect(span?.className).toContain('bg-accent-warning-subtle')
  })

  it('applies purple variant', () => {
    const { container } = render(<Badge variant="purple">Purple</Badge>)
    const span = container.querySelector('span')
    expect(span?.className).toContain('bg-accent-purple-subtle')
  })
})
