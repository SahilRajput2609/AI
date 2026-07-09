import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { ProgressBar } from './ProgressBar'

describe('ProgressBar', () => {
  it('renders with correct percentage', () => {
    const { container } = render(<ProgressBar value={50} />)
    const bar = container.querySelector('div[style]')
    expect(bar?.getAttribute('style')).toContain('width: 50%')
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

  it('applies custom className', () => {
    const { container } = render(<ProgressBar value={50} className="custom-class" />)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.className).toContain('custom-class')
  })
})
