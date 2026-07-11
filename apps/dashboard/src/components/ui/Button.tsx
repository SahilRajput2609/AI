'use client'

import { motion } from 'framer-motion'
import React from 'react'
import { clsx } from '../utils/clsx'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  icon?: React.ReactNode
  isLoading?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', icon, isLoading, children, disabled, ...props }, ref) => {
    const baseStyles =
      'relative inline-flex items-center justify-center gap-2 font-medium rounded-lg overflow-hidden transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C6BFF]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed select-none'

    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm h-8',
      md: 'px-4 py-2 text-sm h-10',
      lg: 'px-6 py-3 text-base h-12',
    }

    const variantStyles = {
      primary: 'bg-white text-black hover:bg-[#ececff] shadow-[0_1px_0_rgba(255,255,255,0.4)_inset,0_4px_16px_-4px_rgba(124,107,255,0.35)]',
      secondary: 'bg-[#111] text-white border border-[#333] hover:border-[#4a4a4a] hover:bg-[#1a1a1a]',
      ghost: 'text-[#A1A1AA] hover:text-white hover:bg-white/5',
      danger: 'bg-[#EF4444] text-white hover:bg-[#DC2626] shadow-[0_4px_16px_-4px_rgba(239,68,68,0.4)]',
    }

    const { onAnimationStart, onAnimationEnd, onDrag, onDragStart, onDragEnd, ...restProps } = props as any

    return (
      <motion.button
        ref={ref}
        className={clsx(baseStyles, sizeStyles[size], variantStyles[variant], className)}
        disabled={disabled || isLoading}
        whileHover={disabled || isLoading ? undefined : { y: -1, scale: 1.015 }}
        whileTap={disabled || isLoading ? undefined : { scale: 0.97, y: 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 28 }}
        {...restProps}
      >
        {isLoading ? (
          <>
            <motion.svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </motion.svg>
            <span className="opacity-70">{children}</span>
          </>
        ) : (
          <>
            {icon}
            {children}
          </>
        )}
      </motion.button>
    )
  },
)

Button.displayName = 'Button'
