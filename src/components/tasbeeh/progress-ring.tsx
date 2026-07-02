"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProgressRingProps {
  progress: number;
  current: number;
  goal: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function ProgressRing({
  progress,
  current,
  goal,
  size = 140,
  strokeWidth = 10,
  className,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(progress, 100) / 100) * circumference;

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className="stroke-tasbeeh-text/[0.06] dark:stroke-white/[0.06]"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#tasbeehProgressGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
        <defs>
          <linearGradient id="tasbeehProgressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" className="stop-tasbeeh-gold-light" />
            <stop offset="50%" className="stop-tasbeeh-gold" />
            <stop offset="100%" className="stop-tasbeeh-gold-dark" />
          </linearGradient>
        </defs>
      </svg>

      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.p
          key={current}
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          className="text-3xl font-bold text-tasbeeh-text font-mono-lcd"
        >
          {current}
        </motion.p>
        <p className="text-xs text-tasbeeh-text-secondary mt-0.5">
          / {goal}
        </p>
      </div>
    </div>
  );
}
