import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { NotificationToast } from './NotificationToast'

describe('NotificationToast', () => {
  it('renders all notifications', () => {
    render(<NotificationToast />)
    expect(screen.getByText('Task Completed')).toBeTruthy()
    expect(screen.getByText('High Memory Usage')).toBeTruthy()
    expect(screen.getByText('Plan Updated')).toBeTruthy()
  })

  it('removes notification on dismiss', () => {
    render(<NotificationToast />)
    expect(screen.getByText('Task Completed')).toBeTruthy()

    const dismissButtons = screen.getAllByRole('button')
    fireEvent.click(dismissButtons[0])

    expect(screen.queryByText('Task Completed')).toBeNull()
  })

  it('returns null when no notifications', () => {
    const { container } = render(<NotificationToast />)
    const dismissButtons = screen.getAllByRole('button')
    dismissButtons.forEach((btn: Element) => fireEvent.click(btn))

    expect(container.innerHTML).toBe('')
  })
})
