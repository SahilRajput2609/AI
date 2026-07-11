'use client'

import { motion } from 'framer-motion'
import React from 'react'
import { clsx } from '../utils/clsx'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined'
  hover?: boolean
  /** Fade-and-rise entrance animation (stagger with `delay`) */
  animateIn?: boolean
  delay?: number
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', hover = true, animateIn = false, delay = 0, children, ...props }, ref) => {
    const variantStyles = {
      default: 'bg-[#090909] border border-[#202020]',
      elevated: 'bg-[#0f0f0f] border border-[#2a2a2a] shadow-lg shadow-[#7C6BFF]/5',
      outlined: 'bg-transparent border border-[#2a2a2a]',
    }

    const { onAnimationStart, onAnimationEnd, onDrag, onDragStart, onDragEnd, ...restProps } = props as any

    return (
      <motion.div
        ref={ref}
        className={clsx(
          'rounded-xl transition-[border-color,box-shadow] duration-300',
          variantStyles[variant],
          hover && 'hover:border-[#3a3a3a] hover:shadow-[0_8px_32px_-8px_rgba(124,107,255,0.18)]',
          className,
        )}
        initial={animateIn ? { opacity: 0, y: 14, scale: 0.99 } : false}
        animate={animateIn ? { opacity: 1, y: 0, scale: 1 } : undefined}
        whileHover={hover ? { y: -3 } : undefined}
        transition={{ type: 'spring', stiffness: 350, damping: 26, delay }}
        {...restProps}
      >
        {children}
      </motion.div>
    )
  },
)

Card.displayName = 'Card'
