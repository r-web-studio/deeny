"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TasbeehBodyProps {
  children: React.ReactNode;
  className?: string;
  goalReached?: boolean;
}

export const TasbeehBody = motion.create(
  function TasbeehBody({ children, className, goalReached }: TasbeehBodyProps) {
    return (
      <div className="relative">
        {/* Goal reached glow */}
        {goalReached && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute -inset-6 rounded-[56px] pointer-events-none z-0"
            style={{ animation: "goal-glow 2.5s ease-in-out infinite" }}
          />
        )}

        {/* Device body */}
        <div
          className={cn(
            "relative w-[280px] h-[370px] sm:w-[310px] sm:h-[400px] rounded-[44px] mx-auto overflow-hidden",
            "tasbeeh-device",
            className
          )}
        >
          {/* Top highlight strip */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-[3px] rounded-b-full bg-gradient-to-r from-transparent via-tasbeeh-gold-light/60 to-transparent" />

          {/* Side accent lines */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-24 bg-gradient-to-b from-transparent via-tasbeeh-gold/20 to-transparent" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[2px] h-24 bg-gradient-to-b from-transparent via-tasbeeh-gold/20 to-transparent" />

          {/* Subtle inner texture */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.3) 0%, transparent 50%)",
            }}
          />

          {/* Content */}
          <div className="relative z-10 h-full flex flex-col">
            {children}
          </div>
        </div>
      </div>
    );
  }
);
