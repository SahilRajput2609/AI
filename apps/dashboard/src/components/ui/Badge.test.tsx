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
    expect(span?.className).toContain('bg-[#151515]')
  })

  it('applies success variant', () => {
    const { container } = render(<Badge variant="success">Success</Badge>)
    const span = container.querySelector('span')
    expect(span?.className).toContain('bg-[#22C55E]/10')
  })

  it('applies error variant', () => {
    const { container } = render(<Badge variant="error">Error</Badge>)
    const span = container.querySelector('span')
    expect(span?.className).toContain('bg-[#EF4444]/10')
  })

  it('applies warning variant', () => {
    const { container } = render(<Badge variant="warning">Warning</Badge>)
    const span = container.querySelector('span')
    expect(span?.className).toContain('bg-[#FACC15]/10')
  })
})
