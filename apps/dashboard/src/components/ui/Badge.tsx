"use client";

import { motion } from "framer-motion";
import React from "react";
import { clsx } from "../utils/clsx";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "error" | "info";
  size?: "sm" | "md";
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", size = "sm", children, ...props }, ref) => {
    const variantStyles = {
      default: "bg-[#2a2a2a] text-[#A1A1AA]",
      success: "bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/30",
      warning: "bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/30",
      error: "bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/30",
      info: "bg-[#7C6BFF]/10 text-[#7C6BFF] border border-[#7C6BFF]/30",
    };

    const sizeStyles = {
      sm: "px-2 py-1 text-xs",
      md: "px-3 py-1.5 text-sm",
    };

    return (
      <motion.span
        ref={ref}
        className={clsx(
          "inline-flex items-center justify-center rounded-full font-medium transition-all",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        {...props}
      >
        {children}
      </motion.span>
    );
  }
);

Badge.displayName = "Badge";
