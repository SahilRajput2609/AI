import { cn } from '../utils/cn.js'
import type { HTMLAttributes, ReactNode } from 'react'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean
  glass?: boolean
  children?: ReactNode
}

export function Card({ className, hover = false, glass = false, children, ...props }: CardProps) {
  const baseStyles = 'rounded-xl border transition-all'

  const styles = glass ? 'bg-slate-900/60 backdrop-blur-xl border-white/8' : 'bg-slate-900 border-white/5'

  const hoverStyles = hover ? 'hover:border-white/10 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer' : ''

  return (
    <div className={cn(baseStyles, styles, hoverStyles, className)} {...props}>
      {children}
    </div>
  )
}
