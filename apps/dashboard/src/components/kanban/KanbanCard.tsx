"use client";

import { motion } from "framer-motion";
import React from "react";
import { GripVertical, Trash2 } from "lucide-react";

export interface KanbanCardProps {
  id: string;
  title: string;
  description?: string;
  priority?: "low" | "medium" | "high";
  onDelete?: (id: string) => void;
}

const priorityColors = {
  low: "text-[#6B7280]",
  medium: "text-[#F59E0B]",
  high: "text-[#EF4444]",
};

export function KanbanCard({ id, title, description, priority = "medium", onDelete }: KanbanCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      className="group relative bg-[#090909] border border-[#202020] rounded-lg p-4 cursor-grab active:cursor-grabbing hover:border-[#7C6BFF]/30 shadow-sm hover:shadow-lg hover:shadow-[#7C6BFF]/10 transition-all duration-200"
    >
      {/* Drag Handle */}
      <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical size={16} className="text-[#6B7280]" />
      </div>

      {/* Priority Indicator */}
      {priority && (
        <div className={`absolute top-3 right-12 w-2 h-2 rounded-full ${priorityColors[priority]} opacity-60`} />
      )}

      {/* Delete Button */}
      <button
        onClick={() => onDelete?.(id)}
        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-[#1a1a1a] rounded text-[#6B7280] hover:text-[#EF4444]"
      >
        <Trash2 size={14} />
      </button>

      {/* Content */}
      <div className="pr-8">
        <h3 className="text-sm font-semibold text-white leading-tight mb-2 line-clamp-2">
          {title}
        </h3>
        {description && (
          <p className="text-xs text-[#6B7280] leading-relaxed line-clamp-2">
            {description}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-[#202020] flex items-center justify-between">
        <span className="text-[10px] text-[#6B7280] uppercase tracking-wider">
          ID: {id.slice(0, 8)}
        </span>
        <div className="text-[10px] font-medium text-[#7C6BFF]">
          {priority.toUpperCase()}
        </div>
      </div>
    </motion.div>
  );
}
