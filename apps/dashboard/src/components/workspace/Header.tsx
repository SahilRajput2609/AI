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
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-40 bg-[#000000]/95 backdrop-blur-md border-b border-[#1A1A1A] flex-shrink-0"
    >
      <div className="flex items-center justify-between h-12 px-4">
        {/* Left: Menu toggle (mobile) + Logo */}
        <div className="flex items-center gap-3">
          <button className="lg:hidden p-1.5 text-[#6B7280] hover:text-white transition-colors" onClick={onMenuToggle}>
            <Menu size={18} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#7C6BFF] flex items-center justify-center">
              <span className="text-white font-bold text-xs">A</span>
            </div>
            <span className="text-sm font-semibold text-white hidden sm:block">AI-Company</span>
          </div>
        </div>

        {/* Right: Search + Logout */}
        <div className="flex items-center gap-1">
          <button
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0F0F0F] border border-[#202020] text-[#6B7280] hover:border-[#333] hover:text-[#A1A1AA] transition-all text-xs"
            onClick={onCommandOpen}
          >
            <Search size={12} />
            <span className="hidden sm:block">Search</span>
            <kbd className="hidden sm:flex items-center gap-0.5 px-1 py-0.5 rounded text-[10px] bg-[#1A1A1A] border border-[#2A2A2A] text-[#555]">
              <span>⌘</span>
              <span>K</span>
            </kbd>
          </button>

          <button
            className="p-2 text-[#6B7280] hover:text-white transition-colors rounded-lg hover:bg-[#0F0F0F]"
            title="Logout"
            onClick={onLogout}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </motion.header>
  )
}
