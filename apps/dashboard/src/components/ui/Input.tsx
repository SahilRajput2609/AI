'use client'

import { motion } from 'framer-motion'
import React from 'react'
import { clsx } from '../utils/clsx'

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  error?: string
  icon?: React.ReactNode
  leftIcon?: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, leftIcon, size = 'md', ...props }, ref) => {
    const displayIcon = leftIcon || icon
    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm h-8',
      md: 'px-4 py-2 text-sm h-10',
      lg: 'px-4 py-3 text-base h-12',
    }

    return (
      <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-2">
        {label && (
          <label htmlFor={props.id} className="text-sm font-medium text-white">
            {label}
          </label>
        )}

        <div className="relative">
          {displayIcon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]">{displayIcon}</div>}

          <motion.input
            ref={ref}
            className={clsx(
              sizeStyles[size],
              'w-full bg-[#090909] border border-[#202020] rounded-lg text-white placeholder-[#6B7280] outline-none transition-all duration-200',
              'focus:border-[#7C6BFF]/50 focus:ring-1 focus:ring-[#7C6BFF]/30',
              'hover:border-[#333]',
              error && 'border-[#EF4444]/50 focus:border-[#EF4444]/50 focus:ring-[#EF4444]/20',
              displayIcon && 'pl-10',
              className,
            )}
            whileFocus={{ scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            {...(({ onAnimationStart, onAnimationEnd, ...rest }) => rest)(props as any)}
          />
        </div>

        {error && (
          <motion.span
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-[#EF4444]"
          >
            {error}
          </motion.span>
        )}
      </motion.div>
    )
  },
)

Input.displayName = 'Input'
