import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react'
import { useRealtime, type RealtimeNotification } from '../../lib/realtime'

const AUTO_DISMISS_MS = 6000

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertCircle,
}

const colorMap = {
  success: 'text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/20',
  error: 'text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/20',
  info: 'text-[#7C6BFF] bg-[#7C6BFF]/10 border-[#7C6BFF]/20',
  warning: 'text-[#FACC15] bg-[#FACC15]/10 border-[#FACC15]/20',
}

const barColorMap = {
  success: 'bg-[#22C55E]/50',
  error: 'bg-[#EF4444]/50',
  info: 'bg-[#7C6BFF]/50',
  warning: 'bg-[#FACC15]/50',
}

function ToastItem({
  notification,
  onDismiss,
}: {
  notification: RealtimeNotification
  onDismiss: (id: string) => void
}) {
  const Icon = iconMap[notification.type]
  const colorClass = colorMap[notification.type]

  // Errors stay until dismissed; everything else auto-dismisses
  useEffect(() => {
    if (notification.type === 'error') return
    const timer = setTimeout(() => onDismiss(notification.id), AUTO_DISMISS_MS)
    return () => clearTimeout(timer)
  }, [notification.id, notification.type, onDismiss])

  return (
    <motion.div
      layout
      role="alert"
      initial={{ opacity: 0, x: 80, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
      className={`${colorClass} relative overflow-hidden border rounded-xl p-3.5 backdrop-blur-md pointer-events-auto flex gap-3 items-start max-w-[320px] shadow-2xl`}
    >
      <Icon size={16} className="flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold leading-none">{notification.title}</p>
        <p className="text-xs opacity-80 mt-1 leading-relaxed">{notification.message}</p>
        <p className="text-[10px] opacity-50 mt-1">{notification.time}</p>
      </div>
      <button
        onClick={() => onDismiss(notification.id)}
        className="flex-shrink-0 hover:opacity-60 transition-opacity p-0.5"
        aria-label="Dismiss notification"
      >
        <X size={14} />
      </button>
      {notification.type !== 'error' && (
        <motion.div
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: AUTO_DISMISS_MS / 1000, ease: 'linear' }}
          className={`absolute bottom-0 left-0 h-0.5 ${barColorMap[notification.type]}`}
        />
      )}
    </motion.div>
  )
}

export function NotificationToast() {
  const { notifications, removeNotification } = useRealtime()

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {notifications.slice(0, 3).map((notification) => (
          <ToastItem key={notification.id} notification={notification} onDismiss={removeNotification} />
        ))}
      </AnimatePresence>
    </div>
  )
}
