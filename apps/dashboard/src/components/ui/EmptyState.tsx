import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { FileX } from 'lucide-react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 24 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="w-12 h-12 rounded-xl bg-[#0F0F0F] border border-[#202020] flex items-center justify-center mb-4 shadow-[0_0_24px_-6px_rgba(124,107,255,0.25)]"
      >
        {icon || <FileX size={20} className="text-[#6E6E6E]" />}
      </motion.div>
      <h3 className="text-sm font-medium text-white mb-1">{title}</h3>
      {description && <p className="text-xs text-[#6E6E6E] text-center max-w-[280px]">{description}</p>}
      {action && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="mt-4"
        >
          {action}
        </motion.div>
      )}
    </motion.div>
  )
}
