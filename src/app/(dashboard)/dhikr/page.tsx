"use client";
import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RotateCcw, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { DHIKR_PRESETS } from "@/lib/constants";
import { saveDhikrSessions as syncDhikrSessions } from "@/lib/sync/data-sync";
import { createClient } from "@/lib/supabase/client";

const DHIKR_STORAGE_KEY = "deenflow-dhikr-sessions";

interface Session {
  dhikr_type: string;
  count: number;
  target: number;
  date: string;
  timestamp: number;
}

export default function DhikrPage() {
  const router = useRouter();
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [count, setCount] = useState(0);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const lastTapRef = useRef(0);

  useEffect(() => {
    const saved = localStorage.getItem(DHIKR_STORAGE_KEY);
    if (saved) {
      try { setSessions(JSON.parse(saved)); } catch {}
    }
  }, []);

  const preset = DHIKR_PRESETS[selectedPreset];

  const todayTotal = useMemo(
    () =>
      sessions
        .filter((s) => new Date(s.date).toDateString() === new Date().toDateString())
        .reduce((sum, s) => sum + s.count, 0),
    [sessions]
  );

  const progress = preset.target > 0 ? Math.min((todayTotal / preset.target) * 100, 100) : 0;

  const saveSessions = useCallback((newSessions: Session[]) => {
    setSessions(newSessions);
    localStorage.setItem(DHIKR_STORAGE_KEY, JSON.stringify(newSessions));
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) syncDhikrSessions(user.id, newSessions).catch(() => {});
    });
  }, []);

  const handleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTapRef.current < 50) return;
    lastTapRef.current = now;
    setCount((c) => c + 1);
    if (navigator.vibrate) navigator.vibrate(15);
  }, []);

  const handleReset = () => {
    if (count > 0) {
      const newSessions: Session[] = [
        { dhikr_type: preset.name, count, target: preset.target, date: new Date().toISOString(), timestamp: Date.now() },
        ...sessions,
      ];
      saveSessions(newSessions);
    }
    setCount(0);
    setShowResetConfirm(false);
  };

  const handlePresetChange = (index: number) => {
    if (count > 0) {
      const newSessions: Session[] = [
        { dhikr_type: preset.name, count, target: preset.target, date: new Date().toISOString(), timestamp: Date.now() },
        ...sessions,
      ];
      saveSessions(newSessions);
    }
    setSelectedPreset(index);
    setCount(0);
    setShowPicker(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-30">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-base font-medium text-foreground">Tasbeeh</h1>
        <button onClick={() => setShowResetConfirm(true)} className="p-2 -mr-2 text-muted-foreground hover:text-foreground transition-colors">
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8 -mt-12">
        {/* Dhikr Selector */}
        <div className="w-full max-w-xs mb-10">
          <button
            onClick={() => setShowPicker(!showPicker)}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
          >
            <div className="text-left">
              <p className="text-xs text-muted-foreground">Dhikr</p>
              <p className="text-sm font-medium text-foreground">{preset.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg" style={{ lineHeight: 1 }}>{preset.arabic}</span>
              <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${showPicker ? "rotate-180" : ""}`} />
            </div>
          </button>

          <AnimatePresence>
            {showPicker && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-2 bg-card rounded-xl border border-border/50 p-1.5 space-y-0.5 shadow-sm">
                  {DHIKR_PRESETS.map((p, i) => (
                    <button
                      key={p.name}
                      onClick={() => handlePresetChange(i)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${
                        selectedPreset === i
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      <span className="font-medium">{p.name}</span>
                      <span className="text-base" style={{ lineHeight: 1 }}>{p.arabic}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Counter */}
        <div className="flex flex-col items-center mb-10">
          <p className="text-8xl font-light tabular-nums tracking-tight text-foreground">{count}</p>
          <p className="text-xs text-muted-foreground mt-1">Target: {preset.target}</p>
        </div>

        {/* Tap Button */}
        <motion.button
          onClick={handleTap}
          whileTap={{ scale: 0.95 }}
          className="w-24 h-24 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20 active:shadow-md transition-shadow cursor-pointer select-none mb-8"
        >
          <span className="text-2xl font-medium">{count}</span>
        </motion.button>

        {/* Progress */}
        <div className="w-full max-w-xs">
          <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
            <span>{todayTotal} today</span>
            <span>{preset.target}</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      {/* Reset Dialog */}
      <AnimatePresence>
        {showResetConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card rounded-2xl p-5 w-full max-w-xs border border-border/50 shadow-xl"
            >
              <h3 className="text-base font-medium text-foreground text-center mb-1">Reset?</h3>
              <p className="text-sm text-muted-foreground text-center mb-5">
                Saves {count} as a session and resets to zero.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-border hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  Reset
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
