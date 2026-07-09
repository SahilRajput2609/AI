"use client";

import { motion } from "framer-motion";
import { Users, Zap, Brain } from "lucide-react";
import React from "react";

export interface AgentCardProps {
  id: string;
  name: string;
  role: string;
  status: "online" | "offline" | "busy";
  tasksCompleted: number;
  capabilities: string[];
}

export function AgentCard({
  id,
  name,
  role,
  status,
  tasksCompleted,
  capabilities,
}: AgentCardProps) {
  const statusColors = {
    online: "bg-[#10b981]",
    offline: "bg-[#6B7280]",
    busy: "bg-[#f59e0b]",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="bg-[#090909] border border-[#202020] rounded-lg p-6 hover:border-[#7C6BFF]/30 hover:shadow-lg hover:shadow-[#7C6BFF]/10 transition-all"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-[#7C6BFF]/20 border border-[#7C6BFF]/30 flex items-center justify-center">
              <Brain size={20} className="text-[#7C6BFF]" />
            </div>
            <div>
              <h3 className="font-semibold text-white">{name}</h3>
              <p className="text-xs text-[#6B7280]">{role}</p>
            </div>
          </div>
        </div>
        <motion.div
          className={`w-3 h-3 rounded-full ${statusColors[status]}`}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-[#202020]">
        <div>
          <p className="text-xs text-[#6B7280] mb-1">Tasks Completed</p>
          <p className="text-lg font-semibold text-white">{tasksCompleted}</p>
        </div>
        <div>
          <p className="text-xs text-[#6B7280] mb-1">Status</p>
          <p className="text-sm font-medium text-[#7C6BFF] capitalize">{status}</p>
        </div>
      </div>

      {/* Capabilities */}
      <div>
        <p className="text-xs text-[#6B7280] mb-2 uppercase tracking-wider">
          Capabilities
        </p>
        <div className="flex flex-wrap gap-2">
          {capabilities.slice(0, 2).map((cap, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="px-2 py-1 text-xs bg-[#7C6BFF]/10 text-[#7C6BFF] border border-[#7C6BFF]/20 rounded-full"
            >
              {cap}
            </motion.span>
          ))}
          {capabilities.length > 2 && (
            <span className="px-2 py-1 text-xs text-[#6B7280]">
              +{capabilities.length - 2} more
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
