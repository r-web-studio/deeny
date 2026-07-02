"use client";

import { useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CountButtonProps {
  count: number;
  dhikrName: string;
  onTap: () => void;
  className?: string;
}

export function CountButton({ count, dhikrName, onTap, className }: CountButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const rippleRef = useRef<HTMLDivElement>(null);

  const handleClick = useCallback(() => {
    onTap();

    // Trigger ripple
    if (rippleRef.current) {
      rippleRef.current.style.animation = "none";
      // Force reflow
      void rippleRef.current.offsetHeight;
      rippleRef.current.style.animation = "tasbeeh-ripple 0.6s ease-out forwards";
    }

    // Haptic feedback on mobile
    if (navigator.vibrate) navigator.vibrate(15);
  }, [onTap]);

  return (
    <div className={cn("flex-1 flex items-center justify-center py-5 sm:py-6", className)}>
      <motion.button
        ref={buttonRef}
        onClick={handleClick}
        whileTap={{ scale: 0.95, rotate: -2 }}
        whileHover={{ scale: 1.03 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        className="relative w-[120px] h-[120px] sm:w-[136px] sm:h-[136px] rounded-full cursor-pointer select-none focus:outline-none focus-visible:ring-4 focus-visible:ring-tasbeeh-gold/30 tasbeeh-btn"
        aria-label={`Count ${dhikrName}`}
      >
        {/* Outer ring */}
        <div className="absolute inset-[3px] rounded-full border-[1.5px] border-white/25 dark:border-white/10" />

        {/* Inner ring */}
        <div className="absolute inset-[8px] rounded-full border border-white/15 dark:border-white/5" />

        {/* Center content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-white/15 dark:bg-white/5 flex items-center justify-center backdrop-blur-sm">
            <span className="text-tasbeeh-body-bottom dark:text-white text-2xl sm:text-3xl font-mono-lcd font-semibold">
              {count}
            </span>
          </div>
        </div>

        {/* Ripple container */}
        <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
          <div
            ref={rippleRef}
            className="absolute inset-0 rounded-full bg-white/20 opacity-0"
          />
        </div>

        {/* Top highlight */}
        <div
          className="absolute top-1 left-1/2 -translate-x-1/2 w-1/2 h-1/3 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at center top, rgba(255,255,255,0.25) 0%, transparent 70%)",
          }}
        />
      </motion.button>
    </div>
  );
}
