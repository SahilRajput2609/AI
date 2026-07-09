import { clsx } from '../utils/clsx'

interface AvatarProps {
  size?: number
  fallback: string
  src?: string
  className?: string
}

export function Avatar({ size = 32, fallback, src, className }: AvatarProps) {
  return (
    <div
      className={clsx(
        'rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center bg-[#151515] text-[#A8A8A8] text-xs font-medium',
        className,
      )}
      style={{ width: size, height: size }}
    >
      {src ? (
        <img src={src} alt={fallback} className="w-full h-full object-cover" />
      ) : (
        fallback.slice(0, 2).toUpperCase()
      )}
    </div>
  )
}
