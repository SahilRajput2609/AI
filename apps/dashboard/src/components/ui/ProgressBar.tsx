import { clsx } from '../utils/clsx'

interface ProgressBarProps {
  value: number
  max?: number
  color?: 'primary' | 'purple' | 'success' | 'warning' | 'error'
  label?: string
  valueLabel?: string
  showLabel?: boolean
  className?: string
}

const barColors = {
  primary: 'bg-accent-primary',
  purple: 'bg-accent-purple',
  success: 'bg-accent-success',
  warning: 'bg-accent-warning',
  error: 'bg-accent-error',
}

export function ProgressBar({
  value,
  max = 100,
  color = 'primary',
  label,
  valueLabel,
  showLabel = false,
  className,
}: ProgressBarProps) {
  const pct = Math.min(Math.round((value / max) * 100), 100)

  return (
    <div className={clsx('flex flex-col gap-1', className)}>
      {(showLabel || label) && (
        <div className="flex items-center justify-between">
          {label && <span className="text-xs text-text-muted">{label}</span>}
          {valueLabel && <span className="text-xs text-text-primary font-medium">{valueLabel}</span>}
        </div>
      )}
      <div className="h-[6px] rounded-full bg-[#1E293B] overflow-hidden">
        <div
          className={clsx('h-full rounded-full transition-all duration-500', barColors[color])}
          style={{ width: `${pct}%`, transition: 'width 500ms cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
      </div>
    </div>
  )
}
