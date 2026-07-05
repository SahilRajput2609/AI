import type { InputHTMLAttributes, ReactNode } from 'react'
import { clsx } from '../utils/clsx'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  leftIcon?: ReactNode
  rightAction?: ReactNode
}

export function Input({
  label,
  leftIcon,
  rightAction,
  className,
  id,
  ...props
}: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm text-secondary-font font-medium text-secondary">
        {label}
      </label>
      <div className="relative flex items-center">
        {leftIcon && (
          <span className="absolute left-3 text-secondary pointer-events-none">
            {leftIcon}
          </span>
        )}
        <input
          id={id}
          className={clsx(
            'w-full bg-surface-input border border-white/10 rounded-md px-4 py-3 text-sm text-primary placeholder-primary outline-none focus:border-primary focus:ring-primary focus:ring-1 focus:ring-primary/30 transition-all duration-200',
            leftIcon && 'pl-10',
            rightAction && 'pr-8',
            className,
          )}
          {...props}
        />
        {rightAction && (
          <span className="absolute right-3">
            {rightAction}
          </span>
        )}
      </div>
    </div>
  )
}