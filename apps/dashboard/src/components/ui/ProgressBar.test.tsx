import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProgressBar } from './ProgressBar'

describe('ProgressBar', () => {
  it('renders with correct percentage', () => {
    const { container } = render(<ProgressBar value={50} />)
    const bar = container.querySelector('div[style]')
    expect(bar?.getAttribute('style')).toContain('width: 50%')
  })

  it('renders label when showLabel is true', () => {
    render(<ProgressBar value={75} label="Progress" showLabel />)
    expect(screen.getByText('Progress')).toBeTruthy()
  })

  it('renders value label', () => {
    render(<ProgressBar value={75} valueLabel="75%" showLabel />)
    expect(screen.getByText('75%')).toBeTruthy()
  })

  it('caps value at 100%', () => {
    const { container } = render(<ProgressBar value={150} />)
    const bar = container.querySelector('div[style]')
    expect(bar?.getAttribute('style')).toContain('width: 100%')
  })

  it('handles zero value', () => {
    const { container } = render(<ProgressBar value={0} />)
    const bar = container.querySelector('div[style]')
    expect(bar?.getAttribute('style')).toContain('width: 0%')
  })
})
