import { clsx } from '../utils/clsx'

interface ProgressBarProps {
  value: number
  max?: number
  className?: string
  /** Show accent gradient + glow instead of plain white */
  accent?: boolean
}

export function ProgressBar({ value, max = 100, className, accent = false }: ProgressBarProps) {
  const pct = Math.min(Math.round((value / max) * 100), 100)

  return (
    <div
      className={clsx('h-1 w-full rounded-full bg-[#151515] overflow-hidden', className)}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={clsx(
          'h-full rounded-full transition-[width] duration-500 ease-out',
          accent
            ? 'bg-gradient-to-r from-[#7C6BFF] to-[#b4a9ff] shadow-[0_0_8px_rgba(124,107,255,0.6)]'
            : 'bg-white',
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
