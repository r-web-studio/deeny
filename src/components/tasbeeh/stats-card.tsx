"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  accent?: boolean;
  className?: string;
}

export function StatsCard({ icon: Icon, label, value, accent, className }: StatsCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className={cn(
        "tasbeeh-glass rounded-2xl p-4 text-center tasbeeh-card-hover cursor-default",
        className
      )}
    >
      <div
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2.5",
          accent
            ? "bg-tasbeeh-gold/10 dark:bg-tasbeeh-gold/15"
            : "bg-tasbeeh-text/[0.04] dark:bg-white/[0.06]"
        )}
      >
        <Icon
          className={cn(
            "h-4.5 w-4.5",
            accent
              ? "text-tasbeeh-gold"
              : "text-tasbeeh-text-secondary"
          )}
        />
      </div>
      <motion.p
        key={value}
        initial={{ scale: 1.05 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
        className="text-2xl font-bold text-tasbeeh-text font-mono-lcd"
      >
        {value}
      </motion.p>
      <p className="text-xs text-tasbeeh-text-secondary mt-0.5 font-medium">{label}</p>
    </motion.div>
  );
}
