"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, animate } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedDigitProps {
  value: number;
  padLength?: number;
}

function AnimatedDigit({ value, padLength = 6 }: AnimatedDigitProps) {
  const motionVal = useMotionValue(0);
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    const controls = animate(motionVal, value, {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
      onUpdate: (v) => setDisplayValue(Math.round(v)),
    });
    return controls.stop;
  }, [value, motionVal]);

  const padded = displayValue.toString().padStart(padLength, "0");

  return (
    <span className="inline-flex">
      {padded.split("").map((digit, i) => (
        <motion.span
          key={`${i}-${digit}`}
          initial={{ y: -8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.2, delay: i * 0.03 }}
          className="inline-block"
        >
          {digit}
        </motion.span>
      ))}
    </span>
  );
}

interface LCDDisplayProps {
  count: number;
  dhikrName: string;
  className?: string;
}

export function LCDDisplay({ count, dhikrName, className }: LCDDisplayProps) {
  return (
    <div className={cn("mx-5 sm:mx-6 mt-6 sm:mt-7 mb-3", className)}>
      <div
        className="relative rounded-2xl p-4 sm:p-5 text-center overflow-hidden tasbeeh-lcd"
      >
        {/* LCD scanline overlay */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 3px)",
          }}
        />

        {/* Top reflection */}
        <div
          className="absolute top-0 left-0 right-0 h-1/3 pointer-events-none"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 100%)",
          }}
        />

        {/* Label */}
        <p className="text-[10px] sm:text-xs text-tasbeeh-text-secondary/50 font-medium uppercase tracking-[0.2em] mb-1.5 relative z-10">
          Count
        </p>

        {/* Main digits */}
        <p className="text-4xl sm:text-5xl font-mono-lcd font-semibold relative z-10 text-tasbeeh-lcd-text">
          <AnimatedDigit value={count} />
        </p>

        {/* Dhikr name */}
        <p className="text-[10px] sm:text-xs text-tasbeeh-text-secondary/40 mt-1.5 relative z-10 font-medium">
          {dhikrName}
        </p>
      </div>
    </div>
  );
}
