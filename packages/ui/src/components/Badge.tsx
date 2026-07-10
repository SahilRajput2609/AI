import React from 'react'
import { cn } from '../utils/cn.js'

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'purple'
  size?: 'sm' | 'md'
}

export const Badge: React.FC<BadgeProps> = ({ className, variant = 'default', size = 'md', children, ...props }) => {
  const baseStyles = 'inline-flex items-center gap-1 font-medium rounded-md'

  const variants = {
    default: 'bg-slate-700/50 text-slate-300',
    success: 'bg-green-600/20 text-green-400',
    warning: 'bg-orange-600/20 text-orange-400',
    error: 'bg-red-600/20 text-red-400',
    info: 'bg-blue-600/20 text-blue-400',
    purple: 'bg-purple-600/20 text-purple-400',
  }

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  }

  return (
    <div className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
      {children}
    </div>
  )
}

Badge.displayName = 'Badge'
