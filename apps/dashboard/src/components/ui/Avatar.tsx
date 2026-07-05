import { clsx } from '../utils/clsx'

interface AvatarProps {
  size?: number
  fallback: string
  src?: string
  className?: string
  border?: string
}

export function Avatar({ size = 32, fallback, src, className, border }: AvatarProps) {
  return (
    <div
      className={clsx('rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center bg-accent-primary-subtle text-text-primary text-xs font-semibold', className)}
      style={{
        width: size,
        height: size,
        border: border || '2px solid rgba(255,255,255,0.08)',
      }}
    >
      {src ? (
        <img src={src} alt={fallback} className="w-full h-full object-cover" />
      ) : (
        fallback
      )}
    </div>
  )
}
