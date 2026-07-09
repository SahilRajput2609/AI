"use client";

import { motion } from "framer-motion";
import { Menu, X, Command, LogOut } from "lucide-react";
import React, { useState } from "react";
import type { Screen } from "../../lib/navigation";

interface HeaderProps {
  onMenuToggle?: () => void;
  onCommandOpen?: () => void;
  onNavigate?: (screen: Screen) => void;
  onLogout?: () => void;
}

export function Header({ onMenuToggle, onCommandOpen, onNavigate, onLogout }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="sticky top-0 z-40 backdrop-blur-md bg-[#000000]/80 border-b border-[#202020]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <motion.div
            className="flex items-center gap-3 flex-shrink-0"
            whileHover={{ scale: 1.02 }}
          >
            <div className="w-8 h-8 rounded-lg bg-[#7C6BFF] flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="text-sm font-semibold text-white hidden sm:inline">
              AI-Company
            </span>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <motion.a
              href="#"
              className="text-sm text-[#A1A1AA] hover:text-white transition-colors"
              whileHover={{ color: "#FFFFFF" }}
            >
              Workspace
            </motion.a>
            <motion.a
              href="#"
              className="text-sm text-[#A1A1AA] hover:text-white transition-colors"
              whileHover={{ color: "#FFFFFF" }}
            >
              Tasks
            </motion.a>
            <motion.a
              href="#"
              className="text-sm text-[#A1A1AA] hover:text-white transition-colors"
              whileHover={{ color: "#FFFFFF" }}
            >
              Agents
            </motion.a>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3 ml-auto">
            <motion.button
              className="p-2 text-[#A1A1AA] hover:text-white hidden sm:inline-flex"
              title="Search (Ctrl+K)"
              onClick={onCommandOpen}
              whileTap={{ scale: 0.95 }}
            >
              <Command size={18} />
            </motion.button>

            <motion.button
              className="px-4 py-2 text-sm font-medium text-white bg-[#111] border border-[#333] rounded-lg hover:bg-[#1a1a1a] transition-colors hidden sm:inline-block"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate?.('settings')}
            >
              Settings
            </motion.button>

            <motion.button
              className="p-2 text-[#A1A1AA] hover:text-white hidden sm:inline-flex"
              title="Logout"
              onClick={onLogout}
              whileTap={{ scale: 0.95 }}
            >
              <LogOut size={18} />
            </motion.button>

            {/* Mobile Menu Toggle */}
            <motion.button
              className="md:hidden p-2 text-[#A1A1AA] hover:text-white"
              onClick={() => {
                setMobileMenuOpen(!mobileMenuOpen)
                onMenuToggle?.()
              }}
              whileTap={{ scale: 0.95 }}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-[#202020] py-4 space-y-2"
          >
            <a href="#" className="block px-4 py-2 text-sm text-[#A1A1AA] hover:text-white">
              Workspace
            </a>
            <a href="#" className="block px-4 py-2 text-sm text-[#A1A1AA] hover:text-white">
              Tasks
            </a>
            <a href="#" className="block px-4 py-2 text-sm text-[#A1A1AA] hover:text-white">
              Agents
            </a>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
}
