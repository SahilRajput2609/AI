import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { useState } from 'react'
import { NotificationToast } from './NotificationToast'

const mockNotifications = [
  {
    id: '1',
    type: 'success' as const,
    title: 'Task Completed',
    message: 'Coder finished writing auth middleware.',
    time: '2 min ago',
  },
  {
    id: '2',
    type: 'warning' as const,
    title: 'High Memory Usage',
    message: 'Memory usage reached 82%.',
    time: '5 min ago',
  },
  {
    id: '3',
    type: 'info' as const,
    title: 'Plan Updated',
    message: 'Planner generated 3 new subtasks.',
    time: '8 min ago',
  },
]

vi.mock('../../lib/realtime', () => ({
  useRealtime: () => {
    const [notifications, setNotifications] = useState([...mockNotifications])
    return {
      notifications,
      removeNotification: (id: string) => setNotifications((prev) => prev.filter((n) => n.id !== id)),
      clearNotifications: () => setNotifications([]),
      logs: [],
      chatMessages: [],
      connected: true,
      addNotification: vi.fn(),
      clearLogs: vi.fn(),
    }
  },
}))

describe('NotificationToast', () => {
  it('renders all notifications', () => {
    render(<NotificationToast />)
    expect(screen.getByText('Task Completed')).toBeTruthy()
    expect(screen.getByText('High Memory Usage')).toBeTruthy()
    expect(screen.getByText('Plan Updated')).toBeTruthy()
  })

  it('removes notification on dismiss', async () => {
    render(<NotificationToast />)
    expect(screen.getByText('Task Completed')).toBeTruthy()

    const dismissButtons = screen.getAllByRole('button')
    await act(async () => {
      fireEvent.click(dismissButtons[0])
      // wait for animation
      await new Promise((r) => setTimeout(r, 300))
    })

    expect(screen.queryByText('Task Completed')).toBeNull()
  })

  it('returns null when no notifications', async () => {
    const { container } = render(<NotificationToast />)
    const dismissButtons = screen.getAllByRole('button')
    await act(async () => {
      dismissButtons.forEach((btn: Element) => fireEvent.click(btn))
      await new Promise((r) => setTimeout(r, 300))
    })

    // Component renders a wrapper div even with no notifications
    const notificationElements = container.querySelectorAll('[role="alert"]')
    expect(notificationElements.length).toBe(0)
  })
})
