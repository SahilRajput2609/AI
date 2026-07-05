import React from 'react'
import { cn } from '../utils/cn.js'

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  max?: number
  label?: string
  showValue?: boolean
  color?: 'primary' | 'success' | 'warning' | 'error' | 'purple'
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  className,
  value,
  max = 100,
  label,
  showValue = false,
  color = 'primary',
  ...props
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))

  const colors = {
    primary: 'bg-blue-500',
    success: 'bg-green-500',
    warning: 'bg-orange-500',
    error: 'bg-red-500',
    purple: 'bg-purple-500',
  }

  return (
    <div className={cn('w-full', className)} {...props}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-2">
          {label && <span className="text-sm text-slate-400">{label}</span>}
          {showValue && (
            <span className="text-sm font-medium text-slate-300">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={cn('h-full transition-all duration-500 rounded-full', colors[color])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

ProgressBar.displayName = 'ProgressBar'
