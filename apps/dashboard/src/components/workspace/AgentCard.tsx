import type { LucideIcon } from 'lucide-react'
import { Crown } from 'lucide-react'
import { clsx } from '../utils/clsx'
import { Badge } from '../ui/Badge'
import { ProgressBar } from '../ui/ProgressBar'

type AgentStatus = 'online' | 'running' | 'idle' | 'error'

interface Metric {
  label: string
  value: number | string
}

interface LogEntry {
  level: string
  message: string
}

interface AgentCardProps {
  type: 'OwnerCard' | 'AgentCard'
  title: string
  subtitle: string
  status: AgentStatus
  icon?: LucideIcon
  accentColor: string
  width?: number
  badge?: string
  metrics?: Metric[]
  progressBar?: { value: number; color: string }
  currentAction?: string
  logs?: LogEntry[]
  actions?: { label: string; variant: string }[]
  style?: React.CSSProperties
}

const statusBorders: Record<AgentStatus, string> = {
  online: 'border-accent-success/40',
  running: 'border-accent-primary/50',
  idle: 'border-white/8',
  error: 'border-accent-error/50',
}

const statusGlows: Record<AgentStatus, string> = {
  online: 'shadow-[0_4px_20px_rgba(52,211,153,0.05)]',
  running: 'shadow-[0_8px_30px_rgba(204,163,116,0.1)]',
  idle: 'shadow-md',
  error: 'shadow-[0_8px_30px_rgba(248,113,113,0.1)]',
}

const logColors: Record<string, string> = {
  info: 'text-text-secondary',
  success: 'text-accent-success font-medium',
  error: 'text-accent-error font-medium',
  warning: 'text-accent-warning font-medium',
}

export function AgentCard({
  type,
  title,
  subtitle,
  status,
  icon: Icon,
  accentColor,
  width = 280,
  badge,
  metrics,
  progressBar,
  currentAction,
  logs,
  actions,
  style,
}: AgentCardProps) {
  const isOwner = type === 'OwnerCard'

  return (
    <div
      className={clsx(
        'glass-card rounded-[12px] p-5 flex flex-col gap-4.5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(0,0,0,0.45)] hover:border-white/15',
        statusBorders[status],
        statusGlows[status],
        'will-change-transform',
      )}
      style={{ width, ...style }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {isOwner ? (
            <div className="w-7 h-7 rounded-full bg-accent-warning/20 flex items-center justify-center">
              <Crown className="text-accent-warning" size={16} />
            </div>
          ) : Icon ? (
            <Icon className={accentColor} size={18} />
          ) : null}
          <div>
            <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
            <p className="text-xs text-text-muted">{subtitle}</p>
          </div>
        </div>
        {badge && (
          <Badge variant={status === 'running' ? 'info' : status === 'idle' ? 'default' : 'success'}>
            {badge}
          </Badge>
        )}
      </div>

      {metrics && (
        <div className="flex gap-4">
          {metrics.map((m) => (
            <div key={m.label}>
              <span className="text-xs text-text-muted block">{m.label}</span>
              <span className="text-sm font-semibold text-text-primary">{m.value}</span>
            </div>
          ))}
        </div>
      )}

      {progressBar && (
        <ProgressBar
          value={progressBar.value}
          max={100}
          color={progressBar.color as 'primary' | 'purple' | 'success'}
          valueLabel={`${progressBar.value}%`}
        />
      )}

      {currentAction && (
        <p className="text-xs text-text-secondary font-mono">{currentAction}</p>
      )}

      {logs && (
        <div className="flex flex-col gap-0.5">
          {logs.map((log, i) => (
            <span
              key={i}
              className={clsx('text-xs font-mono', logColors[log.level] || 'text-text-secondary')}
            >
              {log.message}
            </span>
          ))}
        </div>
      )}

      {actions && (
        <div className="flex gap-2 mt-1">
          {actions.map((action) => (
            <button
              key={action.label}
              className={clsx(
                'px-3.5 py-1.5 rounded-[8px] text-xs font-semibold cursor-pointer transition-all duration-300 transform active:scale-95',
                action.variant === 'primary'
                  ? 'bg-[#cca374] text-black shadow-[0_4px_15px_rgba(204,163,116,0.2)] hover:bg-[#e2cca8] hover:shadow-[0_6px_20px_rgba(204,163,116,0.3)] hover:-translate-y-0.5'
                  : 'bg-white/5 border border-white/8 text-text-secondary hover:bg-white/10 hover:text-white hover:-translate-y-0.5',
              )}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
