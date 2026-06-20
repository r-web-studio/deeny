"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Clock, Check, AlertCircle, ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { usePrayerTimes, PrayerTimesData } from "@/lib/hooks/use-prayer-times";
import { UZBEKISTAN_REGIONS, UzbekistanCity } from "@/lib/data/uzbekistan";
import { useI18n } from "@/lib/i18n";
import toast from "react-hot-toast";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, addMonths, subMonths, isSameDay } from "date-fns";

interface PrayerStatus {
  [key: string]: "completed" | "delayed" | "missed" | undefined;
}

interface PrayerHistory {
  [date: string]: PrayerStatus;
}

const STORAGE_KEY = "deenflow-prayer-location";
const PRAYER_HISTORY_KEY = "deenflow-prayer-history";
const PRAYER_STATUSES_KEY = "deenflow-prayer-statuses";

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function loadHistory(): PrayerHistory {
  try {
    const raw = localStorage.getItem(PRAYER_HISTORY_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

function saveHistory(history: PrayerHistory) {
  localStorage.setItem(PRAYER_HISTORY_KEY, JSON.stringify(history));
}

function migrateOldStatuses(history: PrayerHistory): PrayerHistory {
  const todayKey = getTodayKey();
  if (!history[todayKey]) {
    try {
      const raw = localStorage.getItem(PRAYER_STATUSES_KEY);
      if (raw) {
        const old = JSON.parse(raw);
        if (old && typeof old === "object" && Object.keys(old).length > 0) {
          history[todayKey] = old;
          localStorage.removeItem(PRAYER_STATUSES_KEY);
        }
      }
    } catch {}
  }
  return history;
}

export default function PrayersPage() {
  const { t } = useI18n();
  const [selectedCity, setSelectedCity] = useState<UzbekistanCity | null>(null);
  const [search, setSearch] = useState("");
  const { times, loading: prayerLoading } = usePrayerTimes(
    selectedCity?.apiRegion
  );
  const [statuses, setStatuses] = useState<PrayerStatus>({});
  const [history, setHistory] = useState<PrayerHistory>({});
  const [currentDate, setCurrentDate] = useState(new Date());
  const [nextPrayerIdx, setNextPrayerIdx] = useState(-1);
  const [countdown, setCountdown] = useState("");
  const [selectedCalDay, setSelectedCalDay] = useState<Date | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const prayerNames = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setSelectedCity(JSON.parse(saved));
      } catch {}
    }
    let h = loadHistory();
    h = migrateOldStatuses(h);
    setHistory(h);
    const todayKey = getTodayKey();
    setStatuses(h[todayKey] || {});
  }, []);

  const selectCity = (city: UzbekistanCity) => {
    setSelectedCity(city);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(city));
    setNextPrayerIdx(-1);
    setCountdown("");
  };

  useEffect(() => {
    if (!times) return;
    const interval = setInterval(() => {
      const now = new Date();
      for (let i = 0; i < prayerNames.length; i++) {
        const t = times[prayerNames[i] as keyof PrayerTimesData];
        if (!t) continue;
        const [h, m] = t.split(":").map(Number);
        const pd = new Date(now);
        pd.setHours(h, m, 0, 0);
        if (pd > now) {
          setNextPrayerIdx(i);
          const diff = pd.getTime() - now.getTime();
          const hrs = Math.floor(diff / 3600000);
          const mins = Math.floor((diff % 3600000) / 60000);
          const secs = Math.floor((diff % 60000) / 1000);
          setCountdown(`${hrs}h ${mins}m ${secs}s`);
          return;
        }
      }
      setNextPrayerIdx(-1);
      setCountdown(t("prayers.allPassed"));
    }, 1000);
    return () => clearInterval(interval);
  }, [times]);

  const markPrayer = (name: string, status: "completed" | "delayed" | "missed") => {
    const todayKey = getTodayKey();
    const updated = { ...statuses, [name]: status };
    setStatuses(updated);
    const newHistory = { ...history, [todayKey]: updated };
    setHistory(newHistory);
    saveHistory(newHistory);
  };

  useEffect(() => {
    const tick = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

  const monthDays = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const getDayCompletionRatio = useCallback(
    (day: Date): { completed: number; total: number } | null => {
      const key = format(day, "yyyy-MM-dd");
      const dayStatuses = history[key];
      if (!dayStatuses) return null;
      const total = 5;
      const completed = Object.values(dayStatuses).filter((s) => s === "completed").length;
      return { completed, total };
    },
    [history]
  );

  const selectedDayDetail = useMemo(() => {
    if (!selectedCalDay) return null;
    const key = format(selectedCalDay, "yyyy-MM-dd");
    return history[key] || null;
  }, [selectedCalDay, history]);

  const allCities = UZBEKISTAN_REGIONS.flatMap((r) =>
    r.cities.map((c) => ({ ...c, region: r.region }))
  );
  const filteredCities = allCities.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.nameUz.toLowerCase().includes(search.toLowerCase()) ||
      c.region.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">{t("prayers.title")}</h1>
        <p className="text-muted-foreground flex items-center gap-1 mt-1">
          <MapPin className="h-4 w-4" />
          {selectedCity
            ? `${selectedCity.name} (${selectedCity.nameUz})`
            : t("prayers.selectCity")}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="glass border-islamic-green/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Current Time</CardTitle>
            <Clock className="h-4 w-4 text-islamic-green" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl md:text-5xl font-bold text-islamic-green font-mono tabular-nums">
              {currentTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {currentTime.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </CardContent>
        </Card>

        {times && (
          <Card className="glass">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Today&apos;s Prayer Schedule</CardTitle>
              <Clock className="h-4 w-4 text-gold" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-2 text-center">
                {prayerNames.map((name, idx) => {
                  const time = times[name as keyof PrayerTimesData];
                  const status = statuses[name];
                  const [h, m] = (time || "00:00").split(":").map(Number);
                  const prayerDate = new Date(currentTime);
                  prayerDate.setHours(h, m, 0, 0);
                  const isPast = prayerDate < currentTime;
                  const isNextPrayer = idx === nextPrayerIdx;

                  return (
                    <div key={name} className={`p-2 rounded-lg transition-all ${isNextPrayer ? "bg-islamic-green/20 ring-1 ring-islamic-green" : isPast ? "opacity-50" : "bg-muted/50"}`}>
                      <div className={`text-xs font-medium mb-1 ${isNextPrayer ? "text-islamic-green" : ""}`}>{name}</div>
                      <div className="text-sm font-bold">{time}</div>
                      {status === "completed" && <div className="text-[10px] text-green-500 mt-1">&#10003;</div>}
                      {status === "delayed" && <div className="text-[10px] text-yellow-500 mt-1">~</div>}
                      {status === "missed" && <div className="text-[10px] text-red-500 mt-1">x</div>}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-sm">{t("prayers.selectYourCity")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("prayers.searchCities")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {search ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-60 overflow-y-auto">
              {filteredCities.map((c) => (
                <button
                  key={`${c.name}-${c.lat}`}
                  onClick={() => selectCity(c)}
                  className={`p-2 rounded-lg text-left text-sm transition-all ${
                    selectedCity?.name === c.name && selectedCity?.lat === c.lat
                      ? "bg-islamic-green text-white font-medium"
                      : "bg-muted/50 hover:bg-accent"
                  }`}
                >
                  <div className="font-medium">{c.name}</div>
                  <div className="text-xs opacity-70">{c.nameUz} &middot; {c.region}</div>
                </button>
              ))}
              {filteredCities.length === 0 && (
                <p className="text-muted-foreground text-sm col-span-full text-center py-4">
                  {t("prayers.noCitiesFound")}
                </p>
              )}
            </div>
          ) : (
            UZBEKISTAN_REGIONS.map((region) => (
              <div key={region.region}>
                <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                  {region.region}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {region.cities.map((city) => (
                    <button
                      key={city.name}
                      onClick={() => selectCity(city)}
                      className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                        selectedCity?.name === city.name && selectedCity?.lat === city.lat
                          ? "bg-islamic-green text-white font-medium"
                          : "bg-muted/50 hover:bg-accent text-foreground"
                      }`}
                    >
                      {city.name}
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {selectedCity && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {prayerLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Card key={i} className="glass animate-pulse h-32" />
              ))
            ) : times ? (
              prayerNames.map((name, idx) => {
                const time = times[name as keyof PrayerTimesData];
                const isNext = idx === nextPrayerIdx;
                const status = statuses[name];
                return (
                  <motion.div
                    key={name}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className={`glass ${isNext ? "border-islamic-green border-2" : ""}`}>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg">{name}</CardTitle>
                        {isNext && (
                          <Badge className="bg-islamic-green text-white animate-pulse">
                            <Clock className="h-3 w-3 mr-1" /> Next
                          </Badge>
                        )}
                        {status === "completed" && (
                          <Badge className="bg-green-500">&#10003; Done</Badge>
                        )}
                        {status === "delayed" && (
                          <Badge className="bg-yellow-500">Delayed</Badge>
                        )}
                        {status === "missed" && (
                          <Badge className="bg-red-500">Missed</Badge>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl md:text-3xl font-bold">{time}</div>
                        {isNext && (
                          <p className="text-sm text-islamic-green mt-1">
                            in {countdown}
                          </p>
                        )}
                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            variant={status === "completed" ? "default" : "outline"}
                            onClick={() => markPrayer(name, "completed")}
                            className={
                              status === "completed"
                                ? "bg-green-500 hover:bg-green-600"
                                : ""
                            }
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant={status === "delayed" ? "default" : "outline"}
                            onClick={() => markPrayer(name, "delayed")}
                            className={
                              status === "delayed"
                                ? "bg-yellow-500 hover:bg-yellow-600"
                                : ""
                            }
                          >
                            <Clock className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant={status === "missed" ? "default" : "outline"}
                            onClick={() => markPrayer(name, "missed")}
                            className={
                              status === "missed"
                                ? "bg-red-500 hover:bg-red-600"
                                : ""
                            }
                          >
                            <AlertCircle className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })
            ) : (
              <Card className="col-span-full glass">
                <CardContent className="text-center py-8 text-muted-foreground">
                  {t("prayers.error")}
                </CardContent>
              </Card>
            )}
          </div>

          <Card className="glass">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t("prayers.monthlySchedule")}</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="font-medium">
                  {format(currentDate, "MMMM yyyy")}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-0.5 sm:gap-1 text-center text-[10px] sm:text-xs">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <div key={d} className="p-1 sm:p-2 font-medium text-muted-foreground">
                    {d}
                  </div>
                ))}
                {Array.from({
                  length: new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth(),
                    1
                  ).getDay(),
                }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {monthDays.map((day) => {
                  const ratio = getDayCompletionRatio(day);
                  const isSelected = selectedCalDay && isSameDay(day, selectedCalDay);
                  const dayIsToday = isToday(day);
                  let bgClass = "hover:bg-accent cursor-pointer";
                  if (dayIsToday) bgClass = "bg-islamic-green text-white font-bold";
                  else if (isSelected) bgClass = "bg-islamic-green/20 text-islamic-green ring-1 ring-islamic-green";
                  else if (ratio) {
                    if (ratio.completed === ratio.total) bgClass = "bg-green-500/20 hover:bg-green-500/30 cursor-pointer";
                    else if (ratio.completed > 0) bgClass = "bg-yellow-500/20 hover:bg-yellow-500/30 cursor-pointer";
                    else bgClass = "bg-red-500/10 hover:bg-red-500/20 cursor-pointer";
                  }

                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => setSelectedCalDay(day)}
                      className={`p-1 sm:p-2 rounded-lg text-[10px] sm:text-sm transition-all relative ${bgClass}`}
                    >
                      <div>{format(day, "d")}</div>
                      {ratio && (
                        <div className="flex justify-center gap-0.5 mt-0.5">
                          {Array.from({ length: ratio.total }).map((_, i) => (
                            <div
                              key={i}
                              className={`w-1 h-1 rounded-full ${
                                i < ratio.completed ? "bg-green-500" : "bg-muted-foreground/30"
                              } ${dayIsToday ? "bg-white/80" : ""}`}
                            />
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <AnimatePresence>
        {selectedCalDay && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <Card className="glass border-islamic-green/20">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm">
                  {format(selectedCalDay, "EEEE, MMMM d, yyyy")}
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setSelectedCalDay(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                {selectedDayDetail ? (
                  <div className="space-y-2">
                    {prayerNames.map((name) => {
                      const status = selectedDayDetail[name];
                      return (
                        <div key={name} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                          <span className="font-medium text-sm">{name}</span>
                          {status === "completed" && <Badge className="bg-green-500">&#10003; Completed</Badge>}
                          {status === "delayed" && <Badge className="bg-yellow-500">Delayed</Badge>}
                          {status === "missed" && <Badge className="bg-red-500">Missed</Badge>}
                          {!status && <Badge variant="outline">Not marked</Badge>}
                        </div>
                      );
                    })}
                    <div className="text-xs text-muted-foreground text-right mt-2">
                      {Object.values(selectedDayDetail).filter((s) => s === "completed").length}/5 completed
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No prayer data recorded for this day.</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
