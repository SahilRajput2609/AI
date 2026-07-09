import type { ReactNode } from 'react'
import { FileX } from 'lucide-react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-12 h-12 rounded-xl bg-[#0F0F0F] border border-[#202020] flex items-center justify-center mb-4">
        {icon || <FileX size={20} className="text-[#6E6E6E]" />}
      </div>
      <h3 className="text-sm font-medium text-white mb-1">{title}</h3>
      {description && (
        <p className="text-xs text-[#6E6E6E] text-center max-w-[280px]">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
