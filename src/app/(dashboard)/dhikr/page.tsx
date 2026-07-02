"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RotateCcw, Settings, Target, TrendingUp, Trophy, X, Zap, Flame } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DHIKR_PRESETS } from "@/lib/constants";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { saveDhikrSessions as syncDhikrSessions } from "@/lib/sync/data-sync";
import { createClient } from "@/lib/supabase/client";
import { TasbeehBody } from "@/components/tasbeeh/tasbeeh-body";
import { LCDDisplay } from "@/components/tasbeeh/lcd-display";
import { CountButton } from "@/components/tasbeeh/count-button";
import { ResetButton } from "@/components/tasbeeh/reset-button";
import { ProgressRing } from "@/components/tasbeeh/progress-ring";
import { StatsCard } from "@/components/tasbeeh/stats-card";
import { GoalCelebration } from "@/components/tasbeeh/goal-celebration";
import { DhikrPicker } from "@/components/tasbeeh/dhikr-picker";

const DHIKR_STORAGE_KEY = "deenflow-dhikr-sessions";
const GOAL_STORAGE_KEY = "deenflow-dhikr-goal";

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
  const [dailyGoal, setDailyGoal] = useState(1000);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [goalReached, setGoalReached] = useState(false);
  const [showDhikrPicker, setShowDhikrPicker] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const lastTapRef = useRef(0);

  useEffect(() => {
    const saved = localStorage.getItem(DHIKR_STORAGE_KEY);
    if (saved) {
      try { setSessions(JSON.parse(saved)); } catch {}
    }
    const savedGoal = localStorage.getItem(GOAL_STORAGE_KEY);
    if (savedGoal) {
      try { setDailyGoal(JSON.parse(savedGoal)); } catch {}
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

  const sessionTotal = count;
  const goalProgress = Math.min((todayTotal / dailyGoal) * 100, 100);

  const longestStreak = useMemo(() => {
    if (sessions.length === 0) return 0;
    const dateSet = new Set(
      sessions.map((s) => new Date(s.date).toDateString())
    );
    let streak = 0;
    const current = new Date();
    while (dateSet.has(current.toDateString())) {
      streak++;
      current.setDate(current.getDate() - 1);
    }
    return streak;
  }, [sessions]);

  const todayByDhikr = useMemo(() => {
    const map: Record<string, number> = {};
    sessions
      .filter((s) => new Date(s.date).toDateString() === new Date().toDateString())
      .forEach((s) => {
        map[s.dhikr_type] = (map[s.dhikr_type] || 0) + s.count;
      });
    return map;
  }, [sessions]);

  const weeklyData = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const dayStr = d.toLocaleDateString("en", { weekday: "short" });
        const total = sessions
          .filter((s) => new Date(s.date).toDateString() === d.toDateString())
          .reduce((sum, s) => sum + s.count, 0);
        return { day: dayStr, count: total };
      }),
    [sessions]
  );

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

    setCount((c) => {
      const next = c + 1;
      if (next >= dailyGoal && !goalReached) {
        setGoalReached(true);
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 4000);
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
      }
      return next;
    });
  }, [dailyGoal, goalReached]);

  const handleReset = () => {
    if (count > 0) {
      const newSessions: Session[] = [
        {
          dhikr_type: preset.name,
          count,
          target: preset.target,
          date: new Date().toISOString(),
          timestamp: Date.now(),
        },
        ...sessions,
      ];
      saveSessions(newSessions);
    }
    setCount(0);
    setShowResetConfirm(false);
    setGoalReached(false);
  };

  const handleDhikrChange = (index: number) => {
    if (count > 0) {
      const newSessions: Session[] = [
        {
          dhikr_type: preset.name,
          count,
          target: preset.target,
          date: new Date().toISOString(),
          timestamp: Date.now(),
        },
        ...sessions,
      ];
      saveSessions(newSessions);
    }
    setSelectedPreset(index);
    setCount(0);
    setShowDhikrPicker(false);
  };

  const updateGoal = (newGoal: number) => {
    setDailyGoal(newGoal);
    localStorage.setItem(GOAL_STORAGE_KEY, JSON.stringify(newGoal));
    setShowSettings(false);
  };

  return (
    <div className="min-h-screen bg-tasbeeh-bg transition-colors duration-300 flex flex-col">
      {/* Goal Celebration */}
      <GoalCelebration show={showCelebration} />

      {/* Top App Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between px-4 py-3 bg-tasbeeh-card/80 dark:bg-tasbeeh-card/60 backdrop-blur-xl sticky top-0 z-30 border-b border-tasbeeh-border"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="text-tasbeeh-text"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold text-tasbeeh-text font-heading">Tasbeeh</h1>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowResetConfirm(true)}
            className="text-tasbeeh-text-secondary"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSettings(true)}
            className="text-tasbeeh-text-secondary"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center px-4 pb-8 pt-4">
        {/* Dhikr Selector */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="w-full flex justify-center"
        >
          <DhikrPicker
            selectedIndex={selectedPreset}
            isOpen={showDhikrPicker}
            onToggle={() => setShowDhikrPicker(!showDhikrPicker)}
            onSelect={handleDhikrChange}
          />
        </motion.div>

        {/* Tasbeeh Device */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.12, type: "spring", damping: 20 }}
          className="relative mb-8"
        >
          <TasbeehBody goalReached={goalReached}>
            <ResetButton onClick={() => setShowResetConfirm(true)} />
            <LCDDisplay count={count} dhikrName={preset.name} />

            {/* Decorative divider */}
            <div className="mx-7 h-px bg-gradient-to-r from-transparent via-tasbeeh-gold/20 to-transparent" />

            <CountButton count={count} dhikrName={preset.name} onTap={handleTap} />

            {/* Bottom status */}
            <div className="pb-5 flex justify-center">
              <div className="flex items-center gap-2">
                <div
                  className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                    count > 0
                      ? "bg-tasbeeh-gold shadow-[0_0_6px_rgba(230,193,90,0.5)]"
                      : "bg-white/15"
                  }`}
                />
                <span className="text-white/35 text-[10px] tracking-wider uppercase">
                  {count > 0 ? "Counting" : "Tap to begin"}
                </span>
              </div>
            </div>
          </TasbeehBody>
        </motion.div>

        {/* Progress Ring */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <ProgressRing
            progress={goalProgress}
            current={todayTotal}
            goal={dailyGoal}
            size={140}
            strokeWidth={10}
          />
          <AnimatePresence>
            {goalReached && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-3 flex items-center justify-center gap-2"
              >
                <Trophy className="h-4 w-4 text-tasbeeh-gold" />
                <span className="text-xs font-medium text-tasbeeh-gold">
                  Goal reached!
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
          className="w-full max-w-md grid grid-cols-4 gap-3 mb-8"
        >
          <StatsCard icon={TrendingUp} label="Today" value={todayTotal} accent />
          <StatsCard icon={Zap} label="Session" value={sessionTotal} />
          <StatsCard icon={Target} label="Goal" value={dailyGoal} />
          <StatsCard icon={Flame} label="Streak" value={longestStreak} accent />
        </motion.div>

        {/* Weekly Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="w-full max-w-md mb-6"
        >
          <div className="tasbeeh-glass rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-tasbeeh-text text-sm">This Week</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHistory(true)}
                className="text-tasbeeh-gold text-xs h-7 px-2"
              >
                View All
              </Button>
            </div>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={weeklyData}>
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--tasbeeh-text-secondary)", fontSize: 10, opacity: 0.6 }}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    background: "var(--tasbeeh-body-bottom)",
                    border: "none",
                    borderRadius: 10,
                    color: "#fff",
                    fontSize: 11,
                    padding: "6px 10px",
                  }}
                  cursor={false}
                />
                <Bar
                  dataKey="count"
                  fill="var(--tasbeeh-gold)"
                  radius={[5, 5, 0, 0]}
                  maxBarSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Today's Dhikr Breakdown */}
        {Object.keys(todayByDhikr).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.42 }}
            className="w-full max-w-md mb-6"
          >
            <div className="tasbeeh-glass rounded-2xl p-5">
              <h3 className="font-semibold text-tasbeeh-text text-sm mb-3">
                Today&apos;s Dhikr
              </h3>
              <div className="space-y-2">
                {Object.entries(todayByDhikr).map(([name, total]) => (
                  <div
                    key={name}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-tasbeeh-text/[0.03] dark:bg-white/[0.03]"
                  >
                    <span className="text-sm font-medium text-tasbeeh-text">{name}</span>
                    <span className="text-xs font-semibold text-tasbeeh-gold bg-tasbeeh-gold/10 px-2.5 py-1 rounded-full">
                      {total}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Recent Sessions */}
        {sessions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.49 }}
            className="w-full max-w-md"
          >
            <div className="tasbeeh-glass rounded-2xl p-5">
              <h3 className="font-semibold text-tasbeeh-text text-sm mb-3">Recent Sessions</h3>
              <div className="space-y-2">
                {sessions.slice(0, 5).map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-tasbeeh-text/[0.03] dark:bg-white/[0.03]"
                  >
                    <div>
                      <p className="text-sm font-medium text-tasbeeh-text">{s.dhikr_type}</p>
                      <p className="text-[10px] text-tasbeeh-text-secondary/50">
                        {new Date(s.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-tasbeeh-body-bottom dark:text-tasbeeh-gold font-mono-lcd">
                      {s.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Reset Confirmation Dialog */}
      <AnimatePresence>
        {showResetConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="bg-tasbeeh-card rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-tasbeeh-border"
            >
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-tasbeeh-gold/10 flex items-center justify-center mx-auto mb-4">
                  <RotateCcw className="h-5 w-5 text-tasbeeh-gold" />
                </div>
                <h3 className="text-lg font-semibold text-tasbeeh-text mb-2">Reset Counter?</h3>
                <p className="text-sm text-tasbeeh-text-secondary mb-6">
                  This will save your current count ({count}) and reset to zero.
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowResetConfirm(false)}
                    className="flex-1 rounded-xl border-tasbeeh-border text-tasbeeh-text"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleReset}
                    className="flex-1 rounded-xl bg-tasbeeh-body-bottom hover:bg-tasbeeh-body-bottom/90 text-white"
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Dialog */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="bg-tasbeeh-card rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-tasbeeh-border"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-tasbeeh-text">Settings</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSettings(false)}
                  className="h-8 w-8 text-tasbeeh-text-secondary"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-tasbeeh-text mb-2 block">
                    Daily Goal
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[100, 500, 1000].map((g) => (
                      <Button
                        key={g}
                        variant={dailyGoal === g ? "default" : "outline"}
                        onClick={() => updateGoal(g)}
                        className={`rounded-xl ${
                          dailyGoal === g
                            ? "bg-tasbeeh-body-bottom text-white"
                            : "border-tasbeeh-border text-tasbeeh-text"
                        }`}
                      >
                        {g}
                      </Button>
                    ))}
                  </div>
                  <div className="mt-3">
                    <input
                      type="number"
                      value={dailyGoal}
                      onChange={(e) => updateGoal(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-4 py-2.5 rounded-xl border border-tasbeeh-border bg-tasbeeh-card text-tasbeeh-text text-sm focus:outline-none focus:ring-2 focus:ring-tasbeeh-gold/30 font-mono-lcd"
                      min={1}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History Dialog */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="bg-tasbeeh-card rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[85vh] overflow-auto border border-tasbeeh-border"
            >
              <div className="sticky top-0 bg-tasbeeh-card/95 backdrop-blur-xl p-5 border-b border-tasbeeh-border flex items-center justify-between z-10">
                <h3 className="text-lg font-semibold text-tasbeeh-text">History</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowHistory(false)}
                  className="h-8 w-8 text-tasbeeh-text-secondary"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="p-5">
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-tasbeeh-text mb-3">This Week</h4>
                  <ResponsiveContainer width="100%" height={150}>
                    <BarChart data={weeklyData}>
                      <XAxis
                        dataKey="day"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "var(--tasbeeh-text-secondary)", fontSize: 10, opacity: 0.6 }}
                      />
                      <YAxis hide />
                      <Tooltip
                        contentStyle={{
                          background: "var(--tasbeeh-body-bottom)",
                          border: "none",
                          borderRadius: 10,
                          color: "#fff",
                          fontSize: 11,
                        }}
                        cursor={false}
                      />
                      <Bar
                        dataKey="count"
                        fill="var(--tasbeeh-gold)"
                        radius={[5, 5, 0, 0]}
                        maxBarSize={24}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <h4 className="text-sm font-semibold text-tasbeeh-text mb-3">All Sessions</h4>
                {sessions.length === 0 ? (
                  <div className="text-center py-8 text-tasbeeh-text-secondary/40">
                    <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No sessions yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {sessions.map((s, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 rounded-2xl bg-tasbeeh-text/[0.03] dark:bg-white/[0.03]"
                      >
                        <div>
                          <p className="text-sm font-medium text-tasbeeh-text">{s.dhikr_type}</p>
                          <p className="text-[10px] text-tasbeeh-text-secondary/50">
                            {new Date(s.date).toLocaleDateString()} at{" "}
                            {new Date(s.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-tasbeeh-body-bottom dark:text-tasbeeh-gold font-mono-lcd">
                            {s.count}
                          </p>
                          <p className="text-[10px] text-tasbeeh-text-secondary/40">/ {s.target}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
