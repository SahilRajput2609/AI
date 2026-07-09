"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle, Info, X } from "lucide-react";
import React from "react";

export interface Notification {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  message: string;
}

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertCircle,
};

const colorMap = {
  success: "text-[#10b981] bg-[#10b981]/10 border-[#10b981]/20",
  error: "text-[#ef4444] bg-[#ef4444]/10 border-[#ef4444]/20",
  info: "text-[#7C6BFF] bg-[#7C6BFF]/10 border-[#7C6BFF]/20",
  warning: "text-[#f59e0b] bg-[#f59e0b]/10 border-[#f59e0b]/20",
};

export function NotificationToast({
  notifications = [],
  onDismiss = () => {},
}: {
  notifications?: Notification[];
  onDismiss?: (id: string) => void;
}) {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => {
          const Icon = iconMap[notification.type];
          const colorClass = colorMap[notification.type];

          return (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 20, x: 100 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, y: -20, x: 100 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 25,
              }}
              className={`${colorClass} border rounded-lg p-4 backdrop-blur-sm pointer-events-auto flex gap-3 items-start max-w-sm shadow-lg`}
            >
              <Icon size={20} className="flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{notification.title}</p>
                <p className="text-xs opacity-90 mt-0.5">{notification.message}</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onDismiss(notification.id)}
                className="flex-shrink-0 hover:opacity-70 transition-opacity"
              >
                <X size={16} />
              </motion.button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
