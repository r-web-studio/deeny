"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, AlertTriangle, RotateCcw, Trophy, TrendingUp, Check } from "lucide-react";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, LineChart, Line } from "recharts";
import { useI18n } from "@/lib/i18n";
import { saveStreak as syncStreak, saveDailyCheckins as syncDailyCheckins, type StreakLocal } from "@/lib/sync/data-sync";
import { createClient } from "@/lib/supabase/client";

const MILESTONES = [7, 14, 30, 60, 90, 180, 365];
const STREAK_STORAGE_KEY = "deenflow-streak";

interface RelapseEntry {
  date: string;
  note: string;
}

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  relapses: RelapseEntry[];
  startDate: string;
}

export default function StreakPage() {
  const { t } = useI18n();
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [relapses, setRelapses] = useState<RelapseEntry[]>([]);
  const [startDate, setStartDate] = useState(new Date().toISOString());
  const [showConfirm, setShowConfirm] = useState(false);
  const [checkedInToday, setCheckedInToday] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STREAK_STORAGE_KEY);
    if (saved) {
      try {
        const data: StreakData = JSON.parse(saved);
        setCurrentStreak(data.currentStreak || 0);
        setLongestStreak(data.longestStreak || 0);
        setRelapses(data.relapses || []);
        if (data.startDate) setStartDate(data.startDate);
      } catch {}
    }

    const todayKey = new Date().toISOString().slice(0, 10);
    const checkinsRaw = localStorage.getItem("deenflow-daily-checkins");
    if (checkinsRaw) {
      try {
        const checkins = JSON.parse(checkinsRaw);
        setCheckedInToday(!!checkins[todayKey]);
      } catch {}
    }
  }, []);

  const saveStreakData = (data: StreakData) => {
    localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(data));
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }: { data: { user: { id: string } | null } }) => {
      if (user) syncStreak(user.id, data).catch(() => {});
    }).catch(() => {});
  };

  const handleRelapse = () => {
    const newRelapses = [...relapses, { date: new Date().toISOString(), note: "" }];
    const newLongest = currentStreak > longestStreak ? currentStreak : longestStreak;
    setRelapses(newRelapses);
    setLongestStreak(newLongest);
    setCurrentStreak(0);
    setShowConfirm(false);
    saveStreakData({ currentStreak: 0, longestStreak: newLongest, relapses: newRelapses, startDate });
  };

  const handleReset = () => {
    setCurrentStreak(0);
    setRelapses([]);
    setLongestStreak(0);
    saveStreakData({ currentStreak: 0, longestStreak: 0, relapses: [], startDate });
  };

  const handleDailyCheckin = () => {
    const today = new Date().toISOString().slice(0, 10);
    const checkinsRaw = localStorage.getItem("deenflow-daily-checkins");
    const checkins = checkinsRaw ? JSON.parse(checkinsRaw) : {};

    if (checkins[today]) return;

    checkins[today] = true;
    localStorage.setItem("deenflow-daily-checkins", JSON.stringify(checkins));

    const newStreak = currentStreak + 1;
    const newLongest = Math.max(newStreak, longestStreak);
    setCurrentStreak(newStreak);
    setLongestStreak(newLongest);
    setCheckedInToday(true);
    saveStreakData({ currentStreak: newStreak, longestStreak: newLongest, relapses, startDate });
    toast.success("MashaAllah! Day marked as clean. Keep going!");

    // Sync daily checkins to Supabase
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }: { data: { user: { id: string } | null } }) => {
      if (user) {
        syncDailyCheckins(user.id, checkins).catch(() => {});
      }
    }).catch(() => {});
  };

  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return { day: d.toLocaleDateString("en", { weekday: "short" }), relapses: relapses.filter((r) => new Date(r.date).toDateString() === d.toDateString()).length };
  });

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h1 className="text-2xl md:text-3xl font-bold">{t("streak.title")}</h1>
        <Button
          variant="outline"
          onClick={() => {
            saveStreakData({ currentStreak, longestStreak, relapses, startDate });
            toast.success("Streak progress saved!");
          }}
        >
          Save Progress
        </Button>
      </div>
      <p className="text-muted-foreground">{t("streak.subtitle")}</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass border-islamic-green/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">{t("streak.currentStreak")}</CardTitle>
            <Shield className="h-4 w-4 text-islamic-green" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl md:text-4xl font-bold text-islamic-green">{currentStreak}</div>
            <p className="text-sm text-muted-foreground">{t("streak.daysClean")}</p>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">{t("streak.longestStreak")}</CardTitle>
            <Trophy className="h-4 w-4 text-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl md:text-4xl font-bold text-gold">{longestStreak}</div>
            <p className="text-sm text-muted-foreground">{t("streak.personalBest")}</p>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">{t("streak.totalRelapses")}</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl md:text-4xl font-bold text-red-500">{relapses.length}</div>
            <p className="text-sm text-muted-foreground">{t("streak.learningMoments")}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass">
        <CardHeader>
          <CardTitle>{t("streak.milestones")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {MILESTONES.map((m) => (
              <Badge
                key={m}
                variant={currentStreak >= m ? "default" : "outline"}
                className={`text-sm py-1 px-3 ${currentStreak >= m ? "bg-islamic-green text-white" : ""}`}
              >
                {m} days {currentStreak >= m ? "✓" : ""}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="glass border-purple-500/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="font-medium">Daily Check-in</p>
              <p className="text-sm text-muted-foreground">Mark today as clean to continue your streak</p>
            </div>
            <Button
              onClick={handleDailyCheckin}
              disabled={checkedInToday}
              className={
                checkedInToday
                  ? "bg-green-600/20 text-green-600 cursor-default"
                  : "bg-purple-500 hover:bg-purple-600 text-white"
              }
            >
              {checkedInToday ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Checked In Today
                </>
              ) : (
                "Mark Today as Clean"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        {showConfirm ? (
          <Card className="glass border-red-500/30 w-full max-w-md">
            <CardContent className="pt-6 space-y-4">
              <p className="text-destructive font-medium">{t("streak.confirmReset")}</p>
              <div className="flex gap-3">
                <Button variant="destructive" onClick={handleRelapse}>{t("streak.yesRelapse")}</Button>
                <Button variant="outline" onClick={() => setShowConfirm(false)}>{t("streak.cancel")}</Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <Button variant="destructive" onClick={() => setShowConfirm(true)}>
              <AlertTriangle className="h-4 w-4 mr-2" />{t("streak.relapse")}
            </Button>
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />{t("streak.resetStreak")}
            </Button>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><TrendingUp className="h-4 w-4" /> {t("streak.weeklyRelapses")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyData}>
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="relapses" fill="oklch(0.577 0.245 27.325)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Shield className="h-4 w-4" /> {t("streak.streakProgress")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>{t("streak.current")} {currentStreak} {t("dashboard.days")}</span>
                  <span>{t("streak.best")} {longestStreak} {t("dashboard.days")}</span>
                </div>
                <div className="h-4 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-islamic-green to-gold rounded-full"
                    animate={{ width: `${longestStreak > 0 ? (currentStreak / longestStreak) * 100 : 0}%` }}
                  />
                </div>
              </div>
              <div className="text-center py-4">
                <p className="text-2xl font-bold text-islamic-green">{currentStreak}</p>
                <p className="text-sm text-muted-foreground">{t("streak.daysStrong")}</p>
                <p className="text-xs text-muted-foreground mt-2">{t("streak.started")} {new Date(startDate).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {relapses.length > 0 && (
        <Card className="glass">
          <CardHeader><CardTitle>{t("streak.relapseHistory")}</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {relapses.slice().reverse().map((r, i) => (
                <div key={i} className="flex justify-between p-2 rounded-lg bg-muted/50 text-sm">
                  <span>{new Date(r.date).toLocaleDateString()}</span>
                  <span>{new Date(r.date).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
