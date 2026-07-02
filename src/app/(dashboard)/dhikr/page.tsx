"use client";
import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import { ArrowLeft, RotateCcw, Settings, Target, TrendingUp, History, ChevronDown, Trophy, X } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DHIKR_PRESETS } from "@/lib/constants";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { useI18n } from "@/lib/i18n";
import { saveDhikrSessions as syncDhikrSessions, type DhikrSessionLocal } from "@/lib/sync/data-sync";
import { createClient } from "@/lib/supabase/client";

const DHIKR_STORAGE_KEY = "deenflow-dhikr-sessions";
const GOAL_STORAGE_KEY = "deenflow-dhikr-goal";

interface Session {
  dhikr_type: string;
  count: number;
  target: number;
  date: string;
  timestamp: number;
}

function AnimatedNumber({ value }: { value: number }) {
  const motionVal = useMotionValue(0);
  const displayed = useTransform(motionVal, (v) => Math.round(v));
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    const controls = animate(motionVal, value, {
      duration: 0.4,
      ease: "easeOut",
      onUpdate: (v) => setDisplayValue(Math.round(v)),
    });
    return controls.stop;
  }, [value, motionVal]);

  return <span>{displayValue}</span>;
}

function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 8,
}: {
  progress: number;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-[#163A63]/10"
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="url(#goldGradient)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
      <defs>
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F3C34D" />
          <stop offset="100%" stopColor="#E9C45A" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function DhikrPage() {
  const { t } = useI18n();
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
  const buttonRef = useRef<HTMLButtonElement>(null);
  const lastTapRef = useRef(0);

  useEffect(() => {
    const saved = localStorage.getItem(DHIKR_STORAGE_KEY);
    if (saved) {
      try {
        setSessions(JSON.parse(saved));
      } catch {}
    }
    const savedGoal = localStorage.getItem(GOAL_STORAGE_KEY);
    if (savedGoal) {
      try {
        setDailyGoal(JSON.parse(savedGoal));
      } catch {}
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

  const saveSessions = useCallback(
    (newSessions: Session[]) => {
      setSessions(newSessions);
      localStorage.setItem(DHIKR_STORAGE_KEY, JSON.stringify(newSessions));
      const supabase = createClient();
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) syncDhikrSessions(user.id, newSessions).catch(() => {});
      });
    },
    []
  );

  const handleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTapRef.current < 50) return;
    lastTapRef.current = now;

    setCount((c) => {
      const next = c + 1;
      if (next >= dailyGoal && !goalReached) {
        setGoalReached(true);
        toast.success("Alhamdulillah! You reached today's goal!", {
          icon: "🏆",
          duration: 5000,
        });
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
      }
      return next;
    });

    if (navigator.vibrate) navigator.vibrate(30);

    if (buttonRef.current) {
      buttonRef.current.animate(
        [
          { transform: "scale(1)" },
          { transform: "scale(0.95)" },
          { transform: "scale(1)" },
        ],
        { duration: 150, easing: "ease-out" }
      );
    }
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

  const formatCount = (n: number) => {
    return n.toString().padStart(6, "0");
  };

  return (
    <div className="min-h-screen bg-[#F6F7F9] flex flex-col">
      {/* Top App Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur-sm sticky top-0 z-30"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="text-[#1F2937]"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold text-[#1F2937]">Tasbeeh</h1>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowResetConfirm(true)}
            className="text-[#1F2937]"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSettings(true)}
            className="text-[#1F2937]"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center px-4 pb-8">
        {/* Dhikr Selector */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="w-full max-w-md mb-6"
        >
          <button
            onClick={() => setShowDhikrPicker(!showDhikrPicker)}
            className="w-full flex items-center justify-between px-5 py-3 bg-white rounded-2xl shadow-sm border border-[#163A63]/5"
          >
            <div className="text-left">
              <p className="text-xs text-[#163A63]/50 font-medium uppercase tracking-wider">Dhikr</p>
              <p className="text-[#1F2937] font-semibold">{preset.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl" style={{ lineHeight: 1 }}>{preset.arabic}</span>
              <ChevronDown className={`h-4 w-4 text-[#163A63]/40 transition-transform ${showDhikrPicker ? "rotate-180" : ""}`} />
            </div>
          </button>

          <AnimatePresence>
            {showDhikrPicker && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-2 bg-white rounded-2xl shadow-lg border border-[#163A63]/5 p-2 space-y-1">
                  {DHIKR_PRESETS.map((p, i) => (
                    <button
                      key={p.name}
                      onClick={() => handleDhikrChange(i)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                        selectedPreset === i
                          ? "bg-[#163A63] text-white"
                          : "hover:bg-[#F6F7F9] text-[#1F2937]"
                      }`}
                    >
                      <div className="text-left">
                        <p className="font-medium">{p.name}</p>
                        <p className={`text-xs ${selectedPreset === i ? "text-white/60" : "text-[#163A63]/40"}`}>
                          Target: {p.target}
                        </p>
                      </div>
                      <span className="text-xl" style={{ lineHeight: 1 }}>{p.arabic}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Tasbeeh Device */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: "spring", damping: 20 }}
          className="relative mb-8"
        >
          {/* Device Body */}
          <div
            className="relative w-72 h-80 sm:w-80 sm:h-96 rounded-[40px] mx-auto"
            style={{
              background: "linear-gradient(180deg, #234B77 0%, #163A63 100%)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.12), 0 8px 20px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.1)",
              border: "3px solid #E9C45A",
            }}
          >
            {/* Top Accent */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-1 rounded-b-full bg-[#F3C34D]" />

            {/* LCD Display */}
            <div className="mx-6 mt-8 mb-4">
              <div
                className="relative rounded-2xl p-4 text-center overflow-hidden"
                style={{
                  background: "linear-gradient(180deg, #E8E4C8 0%, #F6D46C 100%)",
                  boxShadow: "inset 0 2px 8px rgba(0,0,0,0.15), inset 0 1px 2px rgba(0,0,0,0.1)",
                  border: "2px solid #D4B84A",
                }}
              >
                {/* LCD Grid Lines */}
                <div className="absolute inset-0 opacity-[0.03]" style={{
                  backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 3px)",
                }} />

                <p className="text-xs text-[#163A63]/40 font-medium uppercase tracking-widest mb-1">Count</p>
                <p
                  className="text-4xl sm:text-5xl font-bold tracking-wider"
                  style={{
                    fontFamily: "'Courier New', monospace",
                    color: "#163A63",
                    textShadow: "0 1px 2px rgba(0,0,0,0.1)",
                  }}
                >
                  <AnimatedNumber value={count} />
                </p>
                <p className="text-xs text-[#163A63]/40 mt-1">
                  {preset.name}
                </p>
              </div>
            </div>

            {/* Decorative Line */}
            <div className="mx-8 h-px bg-gradient-to-r from-transparent via-[#F3C34D]/30 to-transparent" />

            {/* Main Counting Button */}
            <div className="flex-1 flex items-center justify-center py-6">
              <motion.button
                ref={buttonRef}
                onClick={handleTap}
                whileTap={{ scale: 0.96 }}
                className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full cursor-pointer select-none"
                style={{
                  background: "linear-gradient(180deg, #FFF2B2 0%, #F0C55A 50%, #E9C45A 100%)",
                  boxShadow: "0 8px 24px rgba(243,195,77,0.4), 0 4px 8px rgba(0,0,0,0.1), inset 0 2px 0 rgba(255,255,255,0.5), inset 0 -2px 0 rgba(0,0,0,0.1)",
                  border: "3px solid #D4A843",
                }}
                aria-label={`Count ${preset.name}`}
              >
                {/* Button Inner Ring */}
                <div
                  className="absolute inset-2 rounded-full"
                  style={{
                    border: "2px solid rgba(255,255,255,0.3)",
                  }}
                />

                {/* Button Center */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="text-[#163A63] text-3xl font-bold" style={{ fontFamily: "'Courier New', monospace" }}>
                      {count}
                    </span>
                  </div>
                </div>

                {/* Ripple Effect */}
                <motion.div
                  className="absolute inset-0 rounded-full bg-white/30"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 0, scale: 1.2 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
            </div>

            {/* Bottom Indicator */}
            <div className="pb-6 flex justify-center">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${count > 0 ? "bg-[#F3C34D] animate-pulse" : "bg-white/20"}`} />
                <span className="text-white/40 text-xs">
                  {count > 0 ? "Counting..." : "Tap to begin"}
                </span>
              </div>
            </div>
          </div>

          {/* Goal Reached Glow */}
          <AnimatePresence>
            {goalReached && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute inset-0 -m-4 rounded-[48px] pointer-events-none"
                style={{
                  background: "radial-gradient(circle, rgba(243,195,77,0.3) 0%, transparent 70%)",
                  animation: "pulse 2s infinite",
                }}
              />
            )}
          </AnimatePresence>
        </motion.div>

        {/* Progress Ring */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative mb-8"
        >
          <div className="flex items-center justify-center">
            <ProgressRing progress={goalProgress} size={140} strokeWidth={10} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-3xl font-bold text-[#163A63]">
                <AnimatedNumber value={todayTotal} />
              </p>
              <p className="text-xs text-[#163A63]/50">/ {dailyGoal}</p>
            </div>
          </div>
          {goalReached && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-center justify-center gap-2"
            >
              <Trophy className="h-5 w-5 text-[#F3C34D]" />
              <span className="text-sm font-semibold text-[#163A63]">Alhamdulillah! Goal reached!</span>
            </motion.div>
          )}
        </motion.div>

        {/* Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full max-w-md grid grid-cols-3 gap-3 mb-8"
        >
          <Card className="bg-white rounded-[18px] border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 rounded-full bg-[#F3C34D]/10 flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="h-5 w-5 text-[#F3C34D]" />
              </div>
              <p className="text-2xl font-bold text-[#1F2937]">
                <AnimatedNumber value={todayTotal} />
              </p>
              <p className="text-xs text-[#163A63]/50 mt-0.5">Today</p>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-[18px] border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 rounded-full bg-[#163A63]/10 flex items-center justify-center mx-auto mb-2">
                <Target className="h-5 w-5 text-[#163A63]" />
              </div>
              <p className="text-2xl font-bold text-[#1F2937]">
                <AnimatedNumber value={sessionTotal} />
              </p>
              <p className="text-xs text-[#163A63]/50 mt-0.5">Session</p>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-[18px] border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 rounded-full bg-[#F3C34D]/10 flex items-center justify-center mx-auto mb-2">
                <Trophy className="h-5 w-5 text-[#F3C34D]" />
              </div>
              <p className="text-2xl font-bold text-[#1F2937]">
                <AnimatedNumber value={dailyGoal} />
              </p>
              <p className="text-xs text-[#163A63]/50 mt-0.5">Goal</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Weekly Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="w-full max-w-md mb-6"
        >
          <Card className="bg-white rounded-[18px] border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-[#1F2937]">This Week</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHistory(true)}
                  className="text-[#163A63] text-xs"
                >
                  View All
                </Button>
              </div>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={weeklyData}>
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#163A63", fontSize: 11, opacity: 0.4 }}
                  />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      background: "#163A63",
                      border: "none",
                      borderRadius: 12,
                      color: "#fff",
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="count" fill="#163A63" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Today's Dhikr Breakdown */}
        {Object.keys(todayByDhikr).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="w-full max-w-md mb-6"
          >
            <Card className="bg-white rounded-[18px] border-0 shadow-sm">
              <CardContent className="p-5">
                <h3 className="font-semibold text-[#1F2937] mb-3">Today&apos;s Dhikr</h3>
                <div className="space-y-2">
                  {Object.entries(todayByDhikr).map(([name, total]) => (
                    <div key={name} className="flex items-center justify-between p-2 rounded-xl bg-[#F6F7F9]">
                      <span className="text-sm font-medium text-[#1F2937]">{name}</span>
                      <Badge variant="secondary" className="bg-[#163A63]/10 text-[#163A63]">
                        {total}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Recent Sessions */}
        {sessions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="w-full max-w-md"
          >
            <Card className="bg-white rounded-[18px] border-0 shadow-sm">
              <CardContent className="p-5">
                <h3 className="font-semibold text-[#1F2937] mb-3">Recent Sessions</h3>
                <div className="space-y-2">
                  {sessions.slice(0, 5).map((s, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-[#F6F7F9]">
                      <div>
                        <p className="text-sm font-medium text-[#1F2937]">{s.dhikr_type}</p>
                        <p className="text-xs text-[#163A63]/40">
                          {new Date(s.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-[#163A63]">
                        {s.count}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
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
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl"
            >
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-[#F3C34D]/10 flex items-center justify-center mx-auto mb-4">
                  <RotateCcw className="h-6 w-6 text-[#F3C34D]" />
                </div>
                <h3 className="text-lg font-semibold text-[#1F2937] mb-2">Reset Counter?</h3>
                <p className="text-sm text-[#163A63]/50 mb-6">
                  This will save your current count ({count}) and reset to zero.
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowResetConfirm(false)}
                    className="flex-1 rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleReset}
                    className="flex-1 rounded-xl bg-[#163A63] hover:bg-[#163A63]/90 text-white"
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
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-[#1F2937]">Settings</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSettings(false)}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-[#1F2937] mb-2 block">Daily Goal</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[100, 500, 1000].map((g) => (
                      <Button
                        key={g}
                        variant={dailyGoal === g ? "default" : "outline"}
                        onClick={() => updateGoal(g)}
                        className={`rounded-xl ${dailyGoal === g ? "bg-[#163A63] text-white" : ""}`}
                      >
                        {g}
                      </Button>
                    ))}
                  </div>
                  <div className="mt-2">
                    <input
                      type="number"
                      value={dailyGoal}
                      onChange={(e) => updateGoal(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-4 py-2 rounded-xl border border-[#163A63]/10 text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#163A63]/20"
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
              className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[85vh] overflow-auto"
            >
              <div className="sticky top-0 bg-white p-5 border-b border-[#163A63]/5 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[#1F2937]">History</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowHistory(false)}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="p-5">
                {/* Weekly Chart */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-[#1F2937] mb-3">This Week</h4>
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={weeklyData}>
                      <XAxis
                        dataKey="day"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#163A63", fontSize: 11, opacity: 0.4 }}
                      />
                      <YAxis hide />
                      <Tooltip
                        contentStyle={{
                          background: "#163A63",
                          border: "none",
                          borderRadius: 12,
                          color: "#fff",
                          fontSize: 12,
                        }}
                      />
                      <Bar dataKey="count" fill="#163A63" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* All Sessions */}
                <h4 className="text-sm font-semibold text-[#1F2937] mb-3">All Sessions</h4>
                {sessions.length === 0 ? (
                  <div className="text-center py-8 text-[#163A63]/40">
                    <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No sessions yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {sessions.map((s, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-[#F6F7F9]">
                        <div>
                          <p className="text-sm font-medium text-[#1F2937]">{s.dhikr_type}</p>
                          <p className="text-xs text-[#163A63]/40">
                            {new Date(s.date).toLocaleDateString()} at{" "}
                            {new Date(s.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-[#163A63]">{s.count}</p>
                          <p className="text-xs text-[#163A63]/40">/ {s.target}</p>
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
