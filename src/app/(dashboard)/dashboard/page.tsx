"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, CheckCircle, Target, ListTodo, Shield, Quote, Calendar, Sparkles, Smile, Heart, CloudRain, Flame, Wind, Moon, PartyPopper, PenLine } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useIslamicDate } from "@/lib/hooks/use-islamic-date";
import { usePrayerTimes } from "@/lib/hooks/use-prayer-times";
import { useI18n } from "@/lib/i18n";
import { PRAYERS, MOODS } from "@/lib/constants";
import { useUserStore } from "@/lib/stores/user-store";

const moodIcons: Record<string, React.ReactNode> = {
  smile: <Smile className="h-5 w-5" />,
  heart: <Heart className="h-5 w-5" />,
  "cloud-rain": <CloudRain className="h-5 w-5" />,
  flame: <Flame className="h-5 w-5" />,
  wind: <Wind className="h-5 w-5" />,
  sparkles: <Sparkles className="h-5 w-5" />,
  moon: <Moon className="h-5 w-5" />,
  "party-popper": <PartyPopper className="h-5 w-5" />,
};

const quotes = [
  "The best of people are those who are most beneficial to people.",
  "Seek knowledge from the cradle to the grave.",
  "Trust in Allah, but tie your camel.",
  "The strong person is not the one who can wrestle, but the one who controls himself when angry.",
  "Do not waste time, for it is the most precious thing a person can spend.",
  "Verily, with hardship comes ease.",
  "The eyes of the believer are on the heart.",
  "Whoever believes in Allah and the Last Day, let him speak good or remain silent.",
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  const { hijri, gregorian } = useIslamicDate();
  const { t } = useI18n();
  const [apiRegion, setApiRegion] = useState<string | undefined>(undefined);
  const { times } = usePrayerTimes(apiRegion);
  const [nextPrayer, setNextPrayer] = useState("");
  const [countdown, setCountdown] = useState("");
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [prayerStats, setPrayerStats] = useState({ completed: 0, total: 5 });
  const [dhikrToday, setDhikrToday] = useState(0);
  const [taskStats, setTaskStats] = useState({ completed: 0, total: 0 });
  const [currentStreak, setCurrentStreak] = useState(0);
  const [journalCount, setJournalCount] = useState(0);
  const [userName, setUserName] = useState(() => {
    if (typeof window === "undefined") return "";
    const user = useUserStore.getState().user;
    if (user?.fullName) return user.fullName.split(" ")[0];
    const profile = localStorage.getItem("deenflow-profile");
    if (profile) {
      try {
        const p = JSON.parse(profile);
        if (p.fullName) return p.fullName.split(" ")[0];
        if (p.username) return p.username;
      } catch {}
    }
    return "";
  });
  const [quote] = useState(() => {
    const today = new Date().toISOString().slice(0, 10);
    let hash = 0;
    for (let i = 0; i < today.length; i++) {
      hash = ((hash << 5) - hash + today.charCodeAt(i)) | 0;
    }
    return quotes[Math.abs(hash) % quotes.length];
  });

  useEffect(() => {
    const unsub = useUserStore.subscribe((state) => {
      if (state.user?.fullName) {
        setUserName(state.user.fullName.split(" ")[0]);
      }
    });
    return unsub;
  }, []);

  useEffect(() => {
    const loadUserName = () => {
      const user = useUserStore.getState().user;
      if (user?.fullName) {
        setUserName(user.fullName.split(" ")[0]);
        return;
      }
      const profile = localStorage.getItem("deenflow-profile");
      if (profile) {
        try {
          const p = JSON.parse(profile);
          if (p.fullName) {
            setUserName(p.fullName.split(" ")[0]);
            return;
          }
          if (p.username) {
            setUserName(p.username);
            return;
          }
        } catch {}
      }
      setUserName("");
    };
    loadUserName();
    window.addEventListener("storage", loadUserName);
    return () => window.removeEventListener("storage", loadUserName);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("deenflow-prayer-location");
    if (saved) {
      try {
        const city = JSON.parse(saved);
        setApiRegion(city.apiRegion);
      } catch {}
    }
  }, []);

  useEffect(() => {
    const loadProgress = () => {
      try {
        const prayerRaw = localStorage.getItem("deenflow-prayer-statuses");
        if (prayerRaw) {
          const statuses = JSON.parse(prayerRaw);
          const completed = Object.values(statuses).filter((s) => s === "completed").length;
          setPrayerStats({ completed, total: 5 });
        }

        const dhikrRaw = localStorage.getItem("deenflow-dhikr-sessions");
        if (dhikrRaw) {
          const sessions = JSON.parse(dhikrRaw);
          const today = new Date().toDateString();
          const total = sessions
            .filter((s: { date: string }) => new Date(s.date).toDateString() === today)
            .reduce((sum: number, s: { count: number }) => sum + s.count, 0);
          setDhikrToday(total);
        }

        const tasksRaw = localStorage.getItem("deenflow-tasks");
        if (tasksRaw) {
          const tasks = JSON.parse(tasksRaw);
          const completed = tasks.filter((t: { completed: boolean }) => t.completed).length;
          setTaskStats({ completed, total: tasks.length });
        }

        const streakRaw = localStorage.getItem("deenflow-streak");
        if (streakRaw) {
          const data = JSON.parse(streakRaw);
          setCurrentStreak(data.currentStreak || 0);
        }

        const journalRaw = localStorage.getItem("deenflow-journal");
        if (journalRaw) {
          setJournalCount(JSON.parse(journalRaw).length);
        }
      } catch {}
    };

    loadProgress();
    window.addEventListener("storage", loadProgress);
    return () => window.removeEventListener("storage", loadProgress);
  }, []);

  useEffect(() => {
    if (!times) return;
    const updateCountdown = () => {
      const now = new Date();
      const prayers = [
        { name: "Fajr", time: times.Fajr },
        { name: "Dhuhr", time: times.Dhuhr },
        { name: "Asr", time: times.Asr },
        { name: "Maghrib", time: times.Maghrib },
        { name: "Isha", time: times.Isha },
      ];
      for (const p of prayers) {
        const [h, m] = p.time.split(":").map(Number);
        const prayerDate = new Date(now);
        prayerDate.setHours(h, m, 0, 0);
        if (prayerDate > now) {
          setNextPrayer(p.name);
          const diff = prayerDate.getTime() - now.getTime();
          const hours = Math.floor(diff / 3600000);
          const mins = Math.floor((diff % 3600000) / 60000);
          const secs = Math.floor((diff % 60000) / 1000);
          setCountdown(`${hours}h ${mins}m ${secs}s`);
          return;
        }
      }
      setNextPrayer("Fajr");
      setCountdown("Tomorrow");
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [times]);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h1 className="text-2xl md:text-3xl font-bold">Assalamu Aleykum{userName ? `, ${userName}` : ""}</h1>
        <p className="text-muted-foreground mt-1">{t("dashboard.subtitle")}</p>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass border-islamic-green/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("dashboard.nextPrayer")}</CardTitle>
            <Clock className="h-4 w-4 text-islamic-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-islamic-green">{nextPrayer || t("dashboard.loading")}</div>
            <p className="text-xs text-muted-foreground mt-1">{countdown}</p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("dashboard.prayersToday")}</CardTitle>
            <CheckCircle className="h-4 w-4 text-islamic-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{prayerStats.completed} / {prayerStats.total}</div>
            <Progress value={(prayerStats.completed / prayerStats.total) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("dashboard.dhikrCount")}</CardTitle>
            <Target className="h-4 w-4 text-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dhikrToday}</div>
            <p className="text-xs text-muted-foreground mt-1">{t("dashboard.todaysTotal")}</p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("dashboard.tasks")}</CardTitle>
            <ListTodo className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taskStats.completed} / {taskStats.total}</div>
            <Progress value={taskStats.total > 0 ? (taskStats.completed / taskStats.total) * 100 : 0} className="mt-2" />
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("dashboard.noPornStreak")}</CardTitle>
            <Shield className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentStreak} days</div>
            <p className="text-xs text-muted-foreground mt-1">{t("dashboard.keepGoing")}</p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Journal Entries</CardTitle>
            <PenLine className="h-4 w-4 text-islamic-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{journalCount}</div>
            <p className="text-xs text-muted-foreground mt-1">total entries</p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("dashboard.howAreYou")}</CardTitle>
            <Smile className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              {MOODS.map((m) => (
                <button
                  key={m.label}
                  onClick={() => setSelectedMood(m.label)}
                  className={`p-2 rounded-lg transition-all ${selectedMood === m.label ? "bg-islamic-green/20 text-islamic-green scale-110" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
                  title={m.label}
                >
                  {moodIcons[m.icon]}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-gold/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("dashboard.dailyQuote")}</CardTitle>
            <Quote className="h-4 w-4 text-gold" />
          </CardHeader>
          <CardContent>
            <p className="text-sm italic text-muted-foreground line-clamp-4 break-words">&ldquo;{quote}&rdquo;</p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("dashboard.islamicDate")}</CardTitle>
            <Sparkles className="h-4 w-4 text-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">{hijri || t("dashboard.loading")}</div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("dashboard.gregorianDate")}</CardTitle>
            <Calendar className="h-4 w-4 text-islamic-green" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">{gregorian || t("dashboard.loading")}</div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
