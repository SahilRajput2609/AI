"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Home, Kanban, Settings, Users, Clock, File, X } from "lucide-react";
import React, { useState } from "react";
import type { Screen } from "../../lib/navigation";

interface SidebarProps {
  activeScreen: Screen;
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({
  activeScreen,
  onNavigate,
  onLogout,
  collapsed = false,
  onToggleCollapse = () => {},
}: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true);

  const navItems: { icon: React.ComponentType<{ size: number; className: string }>; label: string; screen: Screen }[] = [
    { icon: Home, label: "Workspace", screen: "workspace" },
    { icon: Kanban, label: "Tasks", screen: "kanban" },
    { icon: Users, label: "Agents", screen: "agents" },
    { icon: File, label: "Files", screen: "files" },
    { icon: Clock, label: "Timeline", screen: "timeline" },
    { icon: Settings, label: "Settings", screen: "settings" },
  ];

  return (
    <motion.aside
      initial={{ x: -280, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed inset-y-16 left-0 bg-[#0a0a0a] border-r border-[#202020] transition-all duration-300 z-30 ${
        isOpen ? "w-64" : "w-0"
      } md:w-64 md:relative md:inset-0`}
    >
      <div className="flex flex-col h-full p-4 space-y-2">
        {/* Close Button (Mobile) */}
        <div className="md:hidden flex justify-end mb-4">
          <motion.button
            onClick={() => setIsOpen(false)}
            whileTap={{ scale: 0.95 }}
            className="p-2 text-[#6B7280] hover:text-white"
          >
            <X size={20} />
          </motion.button>
        </div>

        {/* Logo */}
        <motion.div className="px-4 py-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#7C6BFF] flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="text-sm font-semibold text-white">AI-Company</span>
          </div>
        </motion.div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item, i) => (
            <motion.button
              key={i}
              onClick={() => onNavigate(item.screen)}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ x: 4 }}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-[#111] transition-all group ${
                activeScreen === item.screen ? "bg-[#111] text-[#7C6BFF]" : ""
              }`}
            >
              <item.icon
                size={18}
                className={`${activeScreen === item.screen ? "text-[#7C6BFF]" : "group-hover:text-[#7C6BFF]"} transition-colors`}
              />
              <span className="text-sm font-medium">{item.label}</span>
            </motion.button>
          ))}
        </nav>

        {/* Footer */}
        <motion.div
          className="pt-4 border-t border-[#202020] space-y-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="px-4 py-3 rounded-lg bg-[#7C6BFF]/10 border border-[#7C6BFF]/20">
            <p className="text-xs text-[#7C6BFF] font-medium">Pro Plan</p>
            <p className="text-xs text-[#6B7280] mt-1">Unlimited everything</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onLogout}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-[#111] border border-[#333] rounded-lg hover:bg-[#1a1a1a] transition-colors"
          >
            Logout
          </motion.button>
        </motion.div>
      </div>
    </motion.aside>
  );
}
