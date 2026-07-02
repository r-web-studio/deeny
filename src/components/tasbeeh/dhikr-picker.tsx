"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { DHIKR_PRESETS } from "@/lib/constants";

interface DhikrPickerProps {
  selectedIndex: number;
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (index: number) => void;
  className?: string;
}

export function DhikrPicker({
  selectedIndex,
  isOpen,
  onToggle,
  onSelect,
  className,
}: DhikrPickerProps) {
  const selected = DHIKR_PRESETS[selectedIndex];

  return (
    <div className={cn("w-full max-w-[340px] sm:max-w-md mb-6", className)}>
      <button
        onClick={onToggle}
        className={cn(
          "w-full flex items-center justify-between px-5 py-3.5",
          "tasbeeh-glass rounded-2xl",
          "transition-all duration-200",
          "hover:shadow-md",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-tasbeeh-gold/50"
        )}
      >
        <div className="text-left">
          <p className="text-[10px] text-tasbeeh-text-secondary/60 font-medium uppercase tracking-[0.15em]">
            Dhikr
          </p>
          <p className="text-tasbeeh-text font-semibold text-sm">{selected.name}</p>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-xl font-arabic" style={{ lineHeight: 1 }}>
            {selected.arabic}
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-tasbeeh-text-secondary/50 transition-transform duration-200",
              isOpen && "rotate-180"
            )}
          />
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 8 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="tasbeeh-glass rounded-2xl p-2 space-y-1">
              {DHIKR_PRESETS.map((preset, i) => (
                <button
                  key={preset.name}
                  onClick={() => onSelect(i)}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-3 rounded-xl",
                    "transition-all duration-150",
                    "focus:outline-none",
                    selectedIndex === i
                      ? "bg-tasbeeh-body-bottom dark:bg-tasbeeh-body-bottom text-white shadow-md"
                      : "hover:bg-tasbeeh-text/[0.04] dark:hover:bg-white/[0.04] text-tasbeeh-text"
                  )}
                >
                  <div className="text-left">
                    <p className="font-medium text-sm">{preset.name}</p>
                    <p
                      className={cn(
                        "text-[10px] mt-0.5",
                        i === selectedIndex
                          ? "text-white/50"
                          : "text-tasbeeh-text-secondary/50"
                      )}
                    >
                      Target: {preset.target}
                    </p>
                  </div>
                  <span className="text-lg font-arabic" style={{ lineHeight: 1 }}>
                    {preset.arabic}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
