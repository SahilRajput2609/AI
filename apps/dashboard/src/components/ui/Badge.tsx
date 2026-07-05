import type { ReactNode } from 'react'
import { clsx } from '../utils/clsx'

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'purple'

interface BadgeProps {
  variant?: BadgeVariant
  children: ReactNode
  className?: string
}

const badgeColors: Record<BadgeVariant, string> = {
  default: 'bg-white/10 text-text-secondary',
  success: 'bg-accent-success-subtle text-accent-success',
  warning: 'bg-accent-warning-subtle text-accent-warning',
  error: 'bg-accent-error-subtle text-accent-error',
  info: 'bg-accent-primary-subtle text-accent-primary',
  purple: 'bg-accent-purple-subtle text-accent-purple',
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-[6px] text-[11px] font-medium tracking-wide',
        badgeColors[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}
