import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { clsx } from '../utils/clsx'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'social'
  fullWidth?: boolean
  children: ReactNode
}

export function Button({
  variant = 'primary',
  fullWidth = false,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-2 font-mono font-bold uppercase tracking-wider transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
        variant === 'primary' && 'bg-[#cca374] text-black hover:bg-[#e2cca8] hover:shadow-[0_0_15px_rgba(204,163,116,0.6)] disabled:opacity-50 border border-[#cca374]',
        variant === 'ghost' && 'bg-transparent text-[#cca374] border border-transparent hover:border-[#cca374] hover:shadow-[inset_0_0_10px_rgba(204,163,116,0.3)] hover:bg-[rgba(204,163,116,0.1)]',
        variant === 'social' && 'bg-transparent border border-[#555] px-4 py-2.5 text-sm text-[#a0a0a0] hover:text-white hover:border-[#cca374] hover:shadow-[0_0_10px_rgba(204,163,116,0.4)] cursor-pointer',
        fullWidth && 'w-full',
        'rounded-md transition-all duration-200',
      )}
      {...props}
    >
      {children}
    </button>
  )
}