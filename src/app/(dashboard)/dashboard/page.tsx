"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, CheckCircle, Target, ListTodo, Shield, Quote, Calendar, Sparkles, Smile, Heart, CloudRain, Flame, Wind, Moon, PartyPopper, PenLine, Check, Download, Share, Smartphone, Wifi, WifiOff, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useIslamicDate } from "@/lib/hooks/use-islamic-date";
import { usePrayerTimes } from "@/lib/hooks/use-prayer-times";
import { useI18n } from "@/lib/i18n";
import { MOODS } from "@/lib/constants";
import { useUserStore } from "@/lib/stores/user-store";
import { usePWAInstall } from "@/components/pwa/install-context";
import { saveDailyCheckins as syncDailyCheckins, saveStreak as syncStreak } from "@/lib/sync/data-sync";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

// Helper function to get initial location state from localStorage
const getInitialLocationState = () => {
  if (typeof window === "undefined") {
    return {
      apiRegion: undefined,
      countryId: undefined,
      cityLat: undefined,
      cityLon: undefined,
    };
  }
  const savedCountry = localStorage.getItem("deenflow-selected-country");
  const savedLocation = localStorage.getItem("deenflow-prayer-location");
  let countryId = savedCountry;
  let apiRegion = undefined;
  let cityLat = undefined;
  let cityLon = undefined;
  if (savedLocation) {
    try {
      const city = JSON.parse(savedLocation);
      if (city) {
        apiRegion = city.apiRegion;
        cityLat = city.lat;
        cityLon = city.lon;
        if (city.countryId) {
          countryId = city.countryId;
        }
      }
    } catch {
      // ignore
    }
  }
  return {
    apiRegion,
    countryId,
    cityLat,
    cityLon,
  };
};

// Handle storage events for location and country
function handleStorageLocationChange(event: StorageEvent, setters: { setCountryId: (v: string | undefined) => void; setApiRegion: (v: string | undefined) => void; setCityLat: (v: number | undefined) => void; setCityLon: (v: number | undefined) => void }) {
  if (event.key === "deenflow-selected-country" || event.key === "deenflow-prayer-location") {
    const newCountryId = localStorage.getItem("deenflow-selected-country");
    const newLocation = localStorage.getItem("deenflow-prayer-location");
    let countryId = newCountryId;
    let apiRegion = undefined;
    let cityLat = undefined;
    let cityLon = undefined;
    if (newLocation) {
      try {
        const city = JSON.parse(newLocation);
        if (city) {
          apiRegion = city.apiRegion;
          cityLat = city.lat;
          cityLon = city.lon;
          if (city.countryId) {
            countryId = city.countryId;
          }
        }
      } catch {
        // ignore
      }
    }
    setters.setCountryId(countryId ?? undefined);
    setters.setApiRegion(apiRegion);
    setters.setCityLat(cityLat);
    setters.setCityLon(cityLon);
  }
}

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
  const { canInstall, isInstalled, isIOS, isDismissed, hasNativePrompt, triggerInstall, dismiss } = usePWAInstall();
  const { apiRegion: initialApiRegion, countryId: initialCountryId, cityLat: initialCityLat, cityLon: initialCityLon } = getInitialLocationState();
  const [apiRegion, setApiRegion] = useState(initialApiRegion);
  const [countryId, setCountryId] = useState(initialCountryId ?? undefined);
  const [cityLat, setCityLat] = useState(initialCityLat);
  const [cityLon, setCityLon] = useState(initialCityLon);
  const { times } = usePrayerTimes(apiRegion, countryId, cityLat, cityLon);
  const [nextPrayer, setNextPrayer] = useState("");
  const [countdown, setCountdown] = useState("");
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [prayerStats, setPrayerStats] = useState({ completed: 0, total: 5 });
  const [dhikrToday, setDhikrToday] = useState(0);
  const [taskStats, setTaskStats] = useState({ completed: 0, total: 0 });
  const [currentStreak, setCurrentStreak] = useState(0);
  const [journalCount, setJournalCount] = useState(0);
  const [checkedInToday, setCheckedInToday] = useState(false);
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
    // Default English quotes - will be overridden by translated ones
    const fallbackQuotes = [
      "The best of people are those who are most beneficial to people.",
      "Seek knowledge from the cradle to the grave.",
      "Trust in Allah, but tie your camel.",
      "The strong person is not the one who can wrestle, but the one who controls himself when angry.",
      "Do not waste time, for it is the most precious thing a person can spend.",
      "Verily, with hardship comes ease.",
      "The eyes of the believer are on the heart.",
      "Whoever believes in Allah and the Last Day, let him speak good or remain silent.",
    ];
    return fallbackQuotes[Math.abs(hash) % fallbackQuotes.length];
  });

  // Get translated quote (overrides the useState default after locale loads)
  const translatedQuotesRaw = t("dashboard.quotes");
  const translatedQuotes = translatedQuotesRaw.includes("|||")
    ? translatedQuotesRaw.split("|||")
    : null;
  const displayQuote = translatedQuotes
    ? translatedQuotes[Math.abs(
        (() => {
          const today = new Date().toISOString().slice(0, 10);
          let h = 0;
          for (let i = 0; i < today.length; i++) h = ((h << 5) - h + today.charCodeAt(i)) | 0;
          return h;
        })()
      ) % translatedQuotes.length]
    : quote;

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
    const loadProgress = () => {
      try {
        const todayKey = new Date().toISOString().slice(0, 10);
        const prayerHistoryRaw = localStorage.getItem("deenflow-prayer-history");
        if (prayerHistoryRaw) {
          const history = JSON.parse(prayerHistoryRaw);
          const todayStatuses = history[todayKey] || {};
          const completed = Object.values(todayStatuses).filter((s: unknown) => s === "completed").length;
          setPrayerStats({ completed, total: 5 });
        } else {
          const prayerRaw = localStorage.getItem("deenflow-prayer-statuses");
          if (prayerRaw) {
            const statuses = JSON.parse(prayerRaw);
            const completed = Object.values(statuses).filter((s: unknown) => s === "completed").length;
            setPrayerStats({ completed, total: 5 });
          }
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

        const checkinsRaw = localStorage.getItem("deenflow-daily-checkins");
        if (checkinsRaw) {
          const checkins = JSON.parse(checkinsRaw);
          setCheckedInToday(!!checkins[todayKey]);
        }
      } catch {}
    };

    loadProgress();
    const storageHandler = (e: StorageEvent) => {
      loadProgress();
      handleStorageLocationChange(e, { setCountryId, setApiRegion, setCityLat, setCityLon });
    };
    window.addEventListener("storage", storageHandler);
    return () => window.removeEventListener("storage", storageHandler);
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

  // Load and save daily mood
  useEffect(() => {
    const todayKey = new Date().toISOString().slice(0, 10);
    try {
      const raw = localStorage.getItem("deenflow-daily-mood");
      if (raw) {
        const moods = JSON.parse(raw) as Record<string, string>;
        if (moods[todayKey]) setSelectedMood(moods[todayKey]);
      }
    } catch {}
  }, []);

  const handleMoodSelect = (moodLabel: string) => {
    setSelectedMood(moodLabel);
    const todayKey = new Date().toISOString().slice(0, 10);
    try {
      const raw = localStorage.getItem("deenflow-daily-mood");
      const moods = raw ? JSON.parse(raw) : {};
      moods[todayKey] = moodLabel;
      localStorage.setItem("deenflow-daily-mood", JSON.stringify(moods));
    } catch {
      const moods: Record<string, string> = {};
      moods[todayKey] = moodLabel;
      localStorage.setItem("deenflow-daily-mood", JSON.stringify(moods));
    }
  };

  const handleDailyCheckin = () => {
    const today = new Date().toISOString().slice(0, 10);
    const checkinsRaw = localStorage.getItem("deenflow-daily-checkins");
    const checkins = checkinsRaw ? JSON.parse(checkinsRaw) : {};

    if (checkins[today]) return;

    checkins[today] = true;
    localStorage.setItem("deenflow-daily-checkins", JSON.stringify(checkins));

    const streakRaw = localStorage.getItem("deenflow-streak");
    const streakData = streakRaw ? JSON.parse(streakRaw) : {};
    const newStreak = (streakData.currentStreak || 0) + 1;
    const newLongest = Math.max(newStreak, streakData.longestStreak || 0);

    const updatedStreak = {
      ...streakData,
      currentStreak: newStreak,
      longestStreak: newLongest,
      startDate: streakData.startDate || new Date().toISOString(),
    };
    localStorage.setItem("deenflow-streak", JSON.stringify(updatedStreak));

    setCurrentStreak(newStreak);
    setCheckedInToday(true);
    toast.success("MashaAllah! Day marked as clean. Keep going!");

    // Sync to Supabase
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }: { data: { user: { id: string } | null } }) => {
      if (user) {
        syncDailyCheckins(user.id, checkins).catch(() => {});
        syncStreak(user.id, updatedStreak).catch(() => {});
      }
    }).catch(() => {});
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h1 className="text-2xl md:text-3xl font-bold font-heading">
          Assalamu Aleykum{userName ? `, ${userName}` : ""}
        </h1>
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
        <Card className="glass border-purple-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("dashboard.noPornStreak")}</CardTitle>
            <Shield className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentStreak} {t("dashboard.days")}</div>
            <p className="text-xs text-muted-foreground mt-1">{t("dashboard.keepGoing")}</p>
            <Button
              onClick={handleDailyCheckin}
              disabled={checkedInToday}
              className={`mt-3 w-full ${
                checkedInToday
                  ? "bg-green-600/20 text-green-600 cursor-default"
                  : "bg-purple-500 hover:bg-purple-600 text-white"
              }`}
              size="sm"
            >
              {checkedInToday ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  {t("dashboard.checkedInToday")}
                </>
              ) : (
                t("dashboard.markClean")
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("dashboardExtra.journalEntries")}</CardTitle>
            <PenLine className="h-4 w-4 text-islamic-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{journalCount}</div>
            <p className="text-xs text-muted-foreground mt-1">{t("dashboardExtra.totalEntries")}</p>
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
                  onClick={() => handleMoodSelect(m.label)}
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
            <p className="text-sm italic text-muted-foreground line-clamp-4 break-words">&ldquo;{displayQuote}&rdquo;</p>
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

      {!isInstalled && !isDismissed && canInstall && (
        <motion.div variants={item}>
          <Card className="relative overflow-hidden border-islamic-green/20 bg-gradient-to-br from-islamic-green/5 via-card to-gold/5">
            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-islamic-green/40 to-transparent" />
            <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 py-5 px-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-islamic-green to-islamic-green/80 shadow-lg shadow-islamic-green/20">
                  {isIOS ? (
                    <Share className="h-6 w-6 text-white" />
                  ) : (
                    <Smartphone className="h-6 w-6 text-white" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Install Sakinah</h3>
                  <p className="text-sm text-muted-foreground">
                    {isIOS
                      ? 'Tap the share button, then "Add to Home Screen"'
                      : 'Add to your home screen for quick access & offline use'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {!isIOS ? (
                  <Button
                    onClick={triggerInstall}
                    className="bg-gradient-to-r from-islamic-green to-islamic-green/90 text-white shadow-md shadow-islamic-green/20 hover:shadow-lg hover:shadow-islamic-green/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Install App
                  </Button>
                ) : (
                  <div className="inline-flex items-center gap-1.5 rounded-md bg-islamic-green/10 px-4 py-2 text-sm font-semibold text-islamic-green">
                    <Share className="h-4 w-4" />
                    Share to Install
                  </div>
                )}
                <button
                  onClick={dismiss}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground/50 transition-colors hover:text-muted-foreground"
                  aria-label="Dismiss"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}