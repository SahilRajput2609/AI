"use client";

import { motion } from "framer-motion";
import React from "react";
import { X, Minus, Square } from "lucide-react";

export interface TerminalProps {
  title?: string;
  lines?: string[];
  isActive?: boolean;
}

export function Terminal({ title = "Terminal", lines = [], isActive = false }: TerminalProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={`flex flex-col rounded-lg border overflow-hidden shadow-2xl ${
        isActive
          ? "border-[#7C6BFF]/50 bg-[#0a0a0a]"
          : "border-[#202020] bg-[#050505]"
      }`}
    >
      {/* Title Bar */}
      <div className="bg-[#111] border-b border-[#202020] px-4 py-3 flex items-center justify-between">
        <span className="text-xs font-mono text-[#A1A1AA]">{title}</span>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="p-1 text-[#6B7280] hover:text-[#A1A1AA] transition-colors"
          >
            <Minus size={14} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="p-1 text-[#6B7280] hover:text-[#A1A1AA] transition-colors"
          >
            <Square size={14} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="p-1 text-[#6B7280] hover:text-[#EF4444] transition-colors"
          >
            <X size={14} />
          </motion.button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 font-mono text-sm leading-relaxed max-h-96">
        {lines.length === 0 ? (
          <div className="text-[#6B7280]">
            $ <span className="text-[#7C6BFF]">Ready</span>
          </div>
        ) : (
          lines.map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="text-[#A1A1AA] whitespace-pre-wrap break-words"
            >
              {line.startsWith("$") ? (
                <>
                  <span className="text-[#6B7280]">{line.split(" ")[0]}</span>
                  <span className="text-[#7C6BFF]">{line.slice(1)}</span>
                </>
              ) : line.startsWith(">") ? (
                <>
                  <span className="text-[#EF4444]">{line.split(" ")[0]}</span>
                  <span className="text-white">{line.slice(1)}</span>
                </>
              ) : (
                line
              )}
            </motion.div>
          ))
        )}
      </div>

      {/* Input Line */}
      <div className="bg-[#111] border-t border-[#202020] px-4 py-3 flex items-center gap-2">
        <span className="text-[#6B7280] font-mono text-sm">$</span>
        <input
          type="text"
          placeholder="Type a command..."
          className="flex-1 bg-transparent text-white placeholder-[#6B7280] outline-none font-mono text-sm"
        />
      </div>
    </motion.div>
  );
}
