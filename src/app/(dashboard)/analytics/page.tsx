"use client";
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

export default function AnalyticsPage() {
  const { t } = useI18n();
  const weeklyPrayers = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => ({
    day: d,
    completed: Math.floor(Math.random() * 6),
    total: 5,
  }));

  const monthlyTasks = Array.from({ length: 4 }, (_, i) => ({
    week: `Week ${i + 1}`,
    completed: Math.floor(Math.random() * 20),
    created: Math.floor(Math.random() * 25) + 5,
  }));

  const dhikrData = [
    { name: "SubhanAllah", count: 33 },
    { name: "Alhamdulillah", count: 33 },
    { name: "Allahu Akbar", count: 34 },
    { name: "Astaghfirullah", count: 67 },
  ];

  const moodData = [
    { name: "Happy", value: 12, color: "#22c55e" },
    { name: "Peaceful", value: 8, color: "#059669" },
    { name: "Sad", value: 3, color: "#6b7280" },
    { name: "Anxious", value: 2, color: "#ef4444" },
    { name: "Grateful", value: 5, color: "#eab308" },
  ];

  const streakData = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    streak: Math.floor(Math.random() * 30) + 1,
  }));

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
            <div className="text-2xl md:text-3xl font-bold">4.2</div>
            <p className="text-xs text-islamic-green">{t("analytics.fromLastWeek")}</p>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">{t("analytics.tasksDone")}</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold">67</div>
            <p className="text-xs text-muted-foreground">{t("analytics.thisMonth")}</p>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">{t("analytics.totalDhikr")}</CardTitle>
            <Target className="h-4 w-4 text-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold">1,247</div>
            <p className="text-xs text-muted-foreground">{t("analytics.thisWeek")}</p>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">{t("analytics.cleanStreak")}</CardTitle>
            <Shield className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold">14 days</div>
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
              <BarChart data={weeklyPrayers}>
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
              <BarChart data={monthlyTasks}>
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
              <BarChart data={dhikrData}>
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
                  data={moodData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {moodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
            <LineChart data={streakData}>
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
