import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react'
import { useRealtime } from '../../lib/realtime'

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

export function NotificationToast() {
  const { notifications, removeNotification } = useRealtime()

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {notifications.slice(0, 3).map((notification) => {
          const Icon = iconMap[notification.type]
          const colorClass = colorMap[notification.type]

          return (
            <motion.div
              key={notification.id}
              layout
              initial={{ opacity: 0, x: 60, y: 0 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: 60 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className={`${colorClass} border rounded-xl p-3.5 backdrop-blur-sm pointer-events-auto flex gap-3 items-start max-w-[320px] shadow-2xl`}
            >
              <Icon size={16} className="flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold leading-none">{notification.title}</p>
                <p className="text-xs opacity-80 mt-1 leading-relaxed">{notification.message}</p>
                <p className="text-[10px] opacity-50 mt-1">{notification.time}</p>
              </div>
              <button
                onClick={() => removeNotification(notification.id)}
                className="flex-shrink-0 hover:opacity-60 transition-opacity p-0.5"
              >
                <X size={14} />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
