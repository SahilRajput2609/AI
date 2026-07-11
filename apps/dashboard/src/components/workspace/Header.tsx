import { motion } from 'framer-motion'
import { Menu, LogOut, Search } from 'lucide-react'
import type { Screen } from '../../lib/navigation'

interface HeaderProps {
  onMenuToggle?: () => void
  onCommandOpen?: () => void
  onNavigate?: (screen: Screen) => void
  onLogout?: () => void
}

export function Header({ onMenuToggle, onCommandOpen, onLogout }: HeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      className="sticky top-0 z-40 glass border-b border-[#1A1A1A] flex-shrink-0"
    >
      <div className="flex items-center justify-between h-12 px-4">
        {/* Left: Menu toggle (mobile) + Logo */}
        <div className="flex items-center gap-3">
          <button
            className="lg:hidden p-1.5 text-[#6B7280] hover:text-white transition-colors"
            onClick={onMenuToggle}
            aria-label="Toggle menu"
          >
            <Menu size={18} />
          </button>
          <div className="flex items-center gap-2">
            <motion.div
              whileHover={{ rotate: 8, scale: 1.08 }}
              transition={{ type: 'spring', stiffness: 400, damping: 18 }}
              className="w-6 h-6 rounded-md bg-gradient-to-br from-[#9285ff] to-[#6152e0] flex items-center justify-center shadow-[0_0_12px_rgba(124,107,255,0.4)]"
            >
              <span className="text-white font-bold text-xs">A</span>
            </motion.div>
            <span className="text-sm font-semibold text-white hidden sm:block tracking-tight">AI-Company</span>
          </div>
        </div>

        {/* Right: Search + Logout */}
        <div className="flex items-center gap-1">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0F0F0F] border border-[#202020] text-[#6B7280] hover:border-[#7C6BFF]/40 hover:text-[#A1A1AA] transition-colors text-xs"
            onClick={onCommandOpen}
          >
            <Search size={12} />
            <span className="hidden sm:block">Search</span>
            <kbd className="hidden sm:flex items-center gap-0.5 px-1 py-0.5 rounded text-[10px] bg-[#1A1A1A] border border-[#2A2A2A] text-[#555]">
              <span>⌘</span>
              <span>K</span>
            </kbd>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            className="p-2 text-[#6B7280] hover:text-white transition-colors rounded-lg hover:bg-[#0F0F0F]"
            title="Logout"
            aria-label="Logout"
            onClick={onLogout}
          >
            <LogOut size={16} />
          </motion.button>
        </div>
      </div>
    </motion.header>
  )
}
