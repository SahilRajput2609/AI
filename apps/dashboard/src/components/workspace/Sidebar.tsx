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
      initial={{ x: -16, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={`
        bg-[#050505] border-r border-[#1A1A1A] flex flex-col h-full transition-all duration-300 ease-out
        ${collapsed ? 'w-14' : 'w-56'}
      `}
    >
      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-0.5">
        {navItems.map((item, i) => {
          const isActive = activeScreen === item.screen
          return (
            <motion.button
              key={item.screen}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.04 * i, type: 'spring', stiffness: 350, damping: 28 }}
              onClick={() => onNavigate(item.screen)}
              title={collapsed ? item.label : undefined}
              className={`
                relative w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group text-left
                ${isActive ? 'text-white' : 'text-[#6B7280] hover:text-[#A1A1AA] hover:bg-[#0A0A0A]'}
              `}
            >
              {isActive && (
                <motion.span
                  layoutId="sidebar-active"
                  transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                  className="absolute inset-0 rounded-lg bg-[#0F0F0F] border border-[#7C6BFF]/15 shadow-[inset_2px_0_0_#7C6BFF]"
                />
              )}
              <item.icon
                size={16}
                className={`relative z-10 flex-shrink-0 ${isActive ? 'text-[#7C6BFF]' : 'group-hover:text-[#A1A1AA]'} transition-colors`}
              />
              {!collapsed && <span className="relative z-10 text-sm font-medium truncate">{item.label}</span>}
              {isActive && !collapsed && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="relative z-10 ml-auto w-1.5 h-1.5 rounded-full bg-[#7C6BFF] flex-shrink-0 shadow-[0_0_8px_rgba(124,107,255,0.8)]"
                />
              )}
            </motion.button>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-2 py-3 border-t border-[#1A1A1A] space-y-0.5">
        <button
          onClick={() => onNavigate('settings')}
          title={collapsed ? 'Settings' : undefined}
          className={`
            relative w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group text-left
            ${
              activeScreen === 'settings'
                ? 'text-white'
                : 'text-[#6B7280] hover:text-[#A1A1AA] hover:bg-[#0A0A0A]'
            }
          `}
        >
          {activeScreen === 'settings' && (
            <motion.span
              layoutId="sidebar-active"
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              className="absolute inset-0 rounded-lg bg-[#0F0F0F] border border-[#7C6BFF]/15 shadow-[inset_2px_0_0_#7C6BFF]"
            />
          )}
          <Settings
            size={16}
            className={`relative z-10 flex-shrink-0 ${activeScreen === 'settings' ? 'text-[#7C6BFF]' : 'group-hover:text-[#A1A1AA]'} transition-colors`}
          />
          {!collapsed && <span className="relative z-10 text-sm font-medium">Settings</span>}
        </button>

        <button
          onClick={onLogout}
          title={collapsed ? 'Logout' : undefined}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[#6B7280] hover:text-[#EF4444] hover:bg-[#EF4444]/5 transition-colors group text-left"
        >
          <LogOut size={16} className="flex-shrink-0 transition-colors" />
          {!collapsed && <span className="text-sm font-medium">Logout</span>}
        </button>

        {/* Collapse toggle */}
        <button
          onClick={onToggleCollapse}
          title={collapsed ? 'Expand' : 'Collapse'}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[#444] hover:text-[#666] transition-colors"
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
