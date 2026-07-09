import { clsx } from '../utils/clsx'

interface ProgressBarProps {
  value: number
  max?: number
  className?: string
}

export function ProgressBar({ value, max = 100, className }: ProgressBarProps) {
  const pct = Math.min(Math.round((value / max) * 100), 100)

  return (
    <div className={clsx('h-1 w-full rounded-full bg-[#151515] overflow-hidden', className)}>
      <div
        className="h-full rounded-full bg-white transition-all duration-300"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
