"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, CheckCircle, Target, Calendar, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, LineChart, Line,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { useI18n } from "@/lib/i18n";

const COLORS = [
  "oklch(0.55 0.18 155)",
  "oklch(0.75 0.15 85)",
  "oklch(0.55 0.15 200)",
  "oklch(0.65 0.15 300)",
  "oklch(0.50 0.15 250)",
];

function loadData() {
  if (typeof window === "undefined") return { weeklyPrayers: [], monthlyTasks: [], dhikrData: [], moodData: [], streakData: [], avgPrayers: 0, tasksDone: 0, totalDhikr: 0, cleanStreak: 0 };

  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const today = new Date();

  // Prayer data
  let weeklyPrayers = daysOfWeek.map((d, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (6 - i));
    const key = date.toISOString().slice(0, 10);
    let completed = 0;
    try {
      const raw = localStorage.getItem("deenflow-prayer-history");
      if (raw) {
        const history = JSON.parse(raw);
        const dayStatuses = history[key] || {};
        completed = Object.values(dayStatuses).filter((s: unknown) => s === "completed").length;
      }
    } catch {}
    return { day: d, completed, total: 5 };
  });

  // Task data
  let tasksDone = 0;
  let monthlyTasks: { week: string; completed: number; created: number }[] = [];
  try {
    const raw = localStorage.getItem("deenflow-tasks");
    if (raw) {
      const tasks = JSON.parse(raw);
      tasksDone = tasks.filter((t: { completed: boolean }) => t.completed).length;
      const totalTasks = tasks.length;
      monthlyTasks = Array.from({ length: 4 }, (_, i) => ({
        week: `Week ${i + 1}`,
        completed: Math.min(Math.floor(tasksDone / 4) + (i === 3 ? tasksDone % 4 : 0), totalTasks),
        created: Math.min(Math.floor(totalTasks / 4) + (i === 3 ? totalTasks % 4 : 0), totalTasks + 5),
      }));
    }
  } catch {}
  if (monthlyTasks.length === 0) {
    monthlyTasks = [
      { week: "Week 1", completed: 0, created: 0 },
      { week: "Week 2", completed: 0, created: 0 },
      { week: "Week 3", completed: 0, created: 0 },
      { week: "Week 4", completed: 0, created: 0 },
    ];
  }

  // Dhikr data
  let totalDhikr = 0;
  const dhikrCounts: Record<string, number> = {};
  try {
    const raw = localStorage.getItem("deenflow-dhikr-sessions");
    if (raw) {
      const sessions = JSON.parse(raw) as { dhikr_type: string; count: number }[];
      totalDhikr = sessions.reduce((sum: number, s: { count: number }) => sum + (s.count || 0), 0);
      sessions.forEach((s) => {
        dhikrCounts[s.dhikr_type] = (dhikrCounts[s.dhikr_type] || 0) + s.count;
      });
    }
  } catch {}
  const dhikrData = Object.entries(dhikrCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
  if (dhikrData.length === 0) {
    dhikrData.push({ name: "No data yet", count: 0 });
  }

  // Mood data from journal
  const moodCounts: Record<string, number> = {};
  try {
    const raw = localStorage.getItem("deenflow-journal");
    if (raw) {
      const entries = JSON.parse(raw) as { mood: string }[];
      entries.forEach((e) => {
        const mood = e.mood || "Unknown";
        moodCounts[mood] = (moodCounts[mood] || 0) + 1;
      });
    }
  } catch {}
  const moodColors: Record<string, string> = {
    smile: "#22c55e", heart: "#059669", "cloud-rain": "#6b7280",
    flame: "#ef4444", wind: "#3b82f6", sparkles: "#a855f7",
    moon: "#8b5cf6", "party-popper": "#eab308", Unknown: "#9ca3af",
  };
  const moodData = Object.entries(moodCounts)
    .map(([name, value]) => ({ name, value, color: moodColors[name] || "#9ca3af" }))
    .sort((a, b) => b.value - a.value);
  if (moodData.length === 0) {
    moodData.push({ name: "No entries", value: 1, color: "#9ca3af" });
  }

  // Streak data
  let cleanStreak = 0;
  try {
    const raw = localStorage.getItem("deenflow-streak");
    if (raw) {
      const data = JSON.parse(raw);
      cleanStreak = data.currentStreak || 0;
    }
  } catch {}
  const streakData = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    streak: Math.min(i + 1, cleanStreak),
  }));

  // Average prayers per day
  const totalCompleted = weeklyPrayers.reduce((sum, d) => sum + d.completed, 0);
  const avgPrayers = weeklyPrayers.length > 0 ? (totalCompleted / 7).toFixed(1) : "0";

  return { weeklyPrayers, monthlyTasks, dhikrData, moodData, streakData, avgPrayers: Number(avgPrayers), tasksDone, totalDhikr, cleanStreak };
}

export default function AnalyticsPage() {
  const { t } = useI18n();
  const [data, setData] = useState(loadData);

  useEffect(() => {
    setData(loadData());
    const handler = () => setData(loadData());
    window.addEventListener("storage", handler);
    document.addEventListener("visibilitychange", handler);
    return () => {
      window.removeEventListener("storage", handler);
      document.removeEventListener("visibilitychange", handler);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <h1 className="text-2xl md:text-3xl font-bold">{t("analytics.title")}</h1>
      <p className="text-muted-foreground">{t("analytics.subtitle")}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">{t("analytics.avgPrayers")}</CardTitle>
            <CheckCircle className="h-4 w-4 text-islamic-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold">{data.avgPrayers}</div>
            <p className="text-xs text-islamic-green">{t("analytics.fromLastWeek")}</p>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">{t("analytics.tasksDone")}</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold">{data.tasksDone}</div>
            <p className="text-xs text-muted-foreground">{t("analytics.thisMonth")}</p>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">{t("analytics.totalDhikr")}</CardTitle>
            <Target className="h-4 w-4 text-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold">{data.totalDhikr.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{t("analytics.thisWeek")}</p>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">{t("analytics.cleanStreak")}</CardTitle>
            <Shield className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold">{data.cleanStreak} days</div>
            <p className="text-xs text-islamic-green">{t("analytics.keepGoing")}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4" /> {t("analytics.prayerConsistency")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.weeklyPrayers}>
                <XAxis dataKey="day" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Bar dataKey="completed" fill="oklch(0.55 0.18 155)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <BarChart3 className="h-4 w-4" /> {t("analytics.taskCompletion")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.monthlyTasks}>
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="completed" fill="oklch(0.55 0.18 155)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="created" fill="oklch(0.75 0.15 85)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Target className="h-4 w-4" /> {t("analytics.dhikrStats")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.dhikrData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="oklch(0.75 0.15 85)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4" /> {t("analytics.moodDistribution")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={data.moodData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.moodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Shield className="h-4 w-4" /> {t("analytics.streakHistory")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data.streakData}>
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="streak"
                stroke="oklch(0.55 0.18 155)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}
