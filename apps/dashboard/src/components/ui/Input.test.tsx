import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Input } from './Input'

describe('Input', () => {
  it('renders label and input', () => {
    render(<Input label="Email" id="email" />)
    expect(screen.getByLabelText('Email')).toBeTruthy()
  })

  it('renders left icon', () => {
    render(<Input label="Search" id="search" leftIcon={<span>🔍</span>} />)
    expect(screen.getByText('🔍')).toBeTruthy()
  })

  it('renders right action', () => {
    render(<Input label="Password" id="password" rightAction={<button>Show</button>} />)
    expect(screen.getByText('Show')).toBeTruthy()
  })

  it('handles value changes', () => {
    const onChange = vi.fn()
    render(<Input label="Name" id="name" onChange={onChange} />)
    const input = screen.getByLabelText('Name')
    fireEvent.change(input, { target: { value: 'John' } })
    expect(onChange).toHaveBeenCalled()
  })

  it('forwards additional props to input', () => {
    render(<Input label="Test" id="test" placeholder="Enter text" />)
    const input = screen.getByLabelText('Test') as HTMLInputElement
    expect(input.placeholder).toBe('Enter text')
  })
})
