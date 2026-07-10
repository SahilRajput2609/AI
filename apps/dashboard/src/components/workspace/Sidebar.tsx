import { motion } from 'framer-motion'
import { Home, Kanban, Settings, Users, Clock, FileText, Zap, ChevronLeft, ChevronRight, LogOut } from 'lucide-react'
import type { Screen } from '../../lib/navigation'

interface SidebarProps {
  activeScreen: Screen
  onNavigate: (screen: Screen) => void
  onLogout: () => void
  collapsed?: boolean
  onToggleCollapse?: () => void
}

const navItems: {
  icon: React.ComponentType<{ size: number; className?: string }>
  label: string
  screen: Screen
}[] = [
  { icon: Home, label: 'Workspace', screen: 'workspace' },
  { icon: Kanban, label: 'Tasks', screen: 'kanban' },
  { icon: Users, label: 'Agents', screen: 'agents' },
  { icon: Zap, label: 'Agent IDE', screen: 'agent-ide' },
  { icon: FileText, label: 'Files', screen: 'files' },
  { icon: Clock, label: 'Timeline', screen: 'timeline' },
]

export function Sidebar({
  activeScreen,
  onNavigate,
  onLogout,
  collapsed = false,
  onToggleCollapse = () => {},
}: SidebarProps) {
  return (
    <motion.aside
      initial={{ x: -10, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.2 }}
      className={`
        bg-[#050505] border-r border-[#1A1A1A] flex flex-col h-full transition-all duration-200
        ${collapsed ? 'w-14' : 'w-56'}
      `}
    >
      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-0.5">
        {navItems.map((item) => {
          const isActive = activeScreen === item.screen
          return (
            <button
              key={item.screen}
              onClick={() => onNavigate(item.screen)}
              className={`
                w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all group text-left
                ${isActive ? 'bg-[#0F0F0F] text-white' : 'text-[#6B7280] hover:text-[#A1A1AA] hover:bg-[#0A0A0A]'}
              `}
            >
              <item.icon
                size={16}
                className={`flex-shrink-0 ${isActive ? 'text-[#7C6BFF]' : 'group-hover:text-[#A1A1AA]'} transition-colors`}
              />
              {!collapsed && <span className="text-sm font-medium truncate">{item.label}</span>}
              {isActive && !collapsed && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#7C6BFF] flex-shrink-0" />
              )}
            </button>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-2 py-3 border-t border-[#1A1A1A] space-y-0.5">
        <button
          onClick={() => onNavigate('settings')}
          className={`
            w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all group text-left
            ${
              activeScreen === 'settings'
                ? 'bg-[#0F0F0F] text-white'
                : 'text-[#6B7280] hover:text-[#A1A1AA] hover:bg-[#0A0A0A]'
            }
          `}
        >
          <Settings
            size={16}
            className={`flex-shrink-0 ${activeScreen === 'settings' ? 'text-[#7C6BFF]' : 'group-hover:text-[#A1A1AA]'} transition-colors`}
          />
          {!collapsed && <span className="text-sm font-medium">Settings</span>}
        </button>

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[#6B7280] hover:text-[#EF4444] hover:bg-[#EF4444]/5 transition-all group text-left"
        >
          <LogOut size={16} className="flex-shrink-0 transition-colors" />
          {!collapsed && <span className="text-sm font-medium">Logout</span>}
        </button>

        {/* Collapse toggle */}
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[#444] hover:text-[#666] transition-all"
        >
          {collapsed ? (
            <ChevronRight size={14} className="flex-shrink-0 mx-auto" />
          ) : (
            <>
              <ChevronLeft size={14} className="flex-shrink-0" />
              <span className="text-xs">Collapse</span>
            </>
          )}
        </button>
      </div>
    </motion.aside>
  )
}
