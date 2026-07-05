import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Avatar } from './Avatar'

describe('Avatar', () => {
  it('renders fallback text', () => {
    render(<Avatar fallback="JD" />)
    expect(screen.getByText('JD')).toBeTruthy()
  })

  it('renders image when src provided', () => {
    render(<Avatar fallback="JD" src="https://example.com/avatar.png" />)
    const img = screen.getByAltText('JD') as HTMLImageElement
    expect(img.src).toBe('https://example.com/avatar.png')
  })

  it('applies default size', () => {
    const { container } = render(<Avatar fallback="A" />)
    const div = container.querySelector('div')
    expect(div?.style.width).toBe('32px')
    expect(div?.style.height).toBe('32px')
  })

  it('applies custom size', () => {
    const { container } = render(<Avatar fallback="A" size={48} />)
    const div = container.querySelector('div')
    expect(div?.style.width).toBe('48px')
    expect(div?.style.height).toBe('48px')
  })

  it('applies custom border', () => {
    const { container } = render(<Avatar fallback="A" border="3px solid red" />)
    const div = container.querySelector('div')
    expect(div?.style.border).toBe('3px solid red')
  })
})
