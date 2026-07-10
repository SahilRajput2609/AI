'use client'

import { motion } from 'framer-motion'
import React from 'react'
import { clsx } from '../utils/clsx'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined'
  hover?: boolean
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', hover = true, children, ...props }, ref) => {
    const variantStyles = {
      default: 'bg-[#090909] border border-[#202020]',
      elevated: 'bg-[#0f0f0f] border border-[#2a2a2a] shadow-lg shadow-[#7C6BFF]/5',
      outlined: 'bg-transparent border border-[#2a2a2a]',
    }

    const { onAnimationStart, onAnimationEnd, ...restProps } = props as any

    return (
      <motion.div
        ref={ref}
        className={clsx(
          'rounded-xl transition-all duration-300',
          variantStyles[variant],
          hover && 'hover:border-[#333] hover:shadow-lg hover:shadow-[#7C6BFF]/10',
          className,
        )}
        whileHover={hover ? { y: -2 } : undefined}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        {...restProps}
      >
        {children}
      </motion.div>
    )
  },
)

Card.displayName = 'Card'
