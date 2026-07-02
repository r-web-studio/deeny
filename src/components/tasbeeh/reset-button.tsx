"use client";

import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResetButtonProps {
  onClick: () => void;
  className?: string;
}

export function ResetButton({ onClick, className }: ResetButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "absolute top-4 right-4 sm:top-5 sm:right-5 z-20",
        "w-8 h-8 sm:w-9 sm:h-9 rounded-full",
        "flex items-center justify-center",
        "bg-white/10 dark:bg-white/5",
        "backdrop-blur-md border border-white/15 dark:border-white/8",
        "text-white/60 dark:text-white/40",
        "hover:bg-white/20 dark:hover:bg-white/10",
        "hover:text-white/80 dark:hover:text-white/60",
        "transition-all duration-200",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-tasbeeh-gold/50",
        "active:scale-90",
        className
      )}
      aria-label="Reset counter"
    >
      <RotateCcw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
    </button>
  );
}
