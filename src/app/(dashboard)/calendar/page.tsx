"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ISLAMIC_EVENTS } from "@/lib/constants";
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval, isToday,
  addMonths, subMonths, startOfWeek, endOfWeek, isSameMonth, isSameDay,
} from "date-fns";
import { useI18n } from "@/lib/i18n";

interface PrayerStatus {
  [key: string]: "completed" | "delayed" | "missed" | undefined;
}

interface PrayerHistory {
  [date: string]: PrayerStatus;
}

const PRAYER_HISTORY_KEY = "deenflow-prayer-history";
const prayerNames = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

export default function CalendarPage() {
  const { t } = useI18n();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [history, setHistory] = useState<PrayerHistory>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PRAYER_HISTORY_KEY);
      if (raw) setHistory(JSON.parse(raw));
    } catch {}
  }, []);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const getHijriApprox = (date: Date) => {
    const g = date.getTime();
    const h = g - 2242592000000;
    const hy = Math.floor(h / 31557600000);
    const hm = Math.floor((h % 31557600000) / 2629800000);
    const hd = Math.floor(((h % 31557600000) % 2629800000) / 86400000);
    return `${hd + 1} / ${hm + 1} / ${hy + 1}`;
  };

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
    if (!selectedDate) return null;
    const key = format(selectedDate, "yyyy-MM-dd");
    return history[key] || null;
  }, [selectedDate, history]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold">{t("calendar.title")}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="glass">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{format(currentDate, "MMMM yyyy")}</CardTitle>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setCurrentDate(new Date())}>{t("calendar.today")}</Button>
                <Button variant="ghost" size="icon" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-0.5 sm:gap-1 text-center">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <div key={d} className="p-2 text-xs font-medium text-muted-foreground">{d}</div>
                ))}
                {days.map((day) => {
                  const inMonth = isSameMonth(day, currentDate);
                  const selected = selectedDate && isSameDay(day, selectedDate);
                  const dayIsToday = isToday(day);
                  const ratio = getDayCompletionRatio(day);

                  let bgClass = "";
                  if (!inMonth) bgClass = "text-muted-foreground/40";
                  else if (dayIsToday) bgClass = "bg-islamic-green text-white font-bold";
                  else if (selected) bgClass = "bg-islamic-green/20 text-islamic-green";
                  else if (ratio) {
                    if (ratio.completed === ratio.total) bgClass = "bg-green-500/20 hover:bg-green-500/30";
                    else if (ratio.completed > 0) bgClass = "bg-yellow-500/20 hover:bg-yellow-500/30";
                    else bgClass = "bg-red-500/10 hover:bg-red-500/20";
                  }

                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => setSelectedDate(day)}
                      className={`p-2 rounded-lg text-sm transition-all relative ${bgClass} hover:bg-accent`}
                    >
                      <div>{format(day, "d")}</div>
                      <div className="text-[10px] text-muted-foreground">{getHijriApprox(day)}</div>
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
        </div>

        <div className="space-y-4">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Star className="h-4 w-4 text-gold" /> {t("calendar.islamicEvents")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {ISLAMIC_EVENTS.map((event) => (
                <div key={event.name} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium text-sm">{event.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {event.type === "month" ? `Month ${event.month}` : event.type === "night" ? `Night ${event.month}` : `${event.month}/${event.day}`}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">{event.type}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <AnimatePresence>
            {selectedDate && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                <Card className="glass border-islamic-green/20">
                  <CardHeader>
                    <CardTitle className="text-sm">{format(selectedDate, "EEEE, MMMM d, yyyy")}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-xs text-muted-foreground">{t("calendar.hijri")} {getHijriApprox(selectedDate)}</p>

                    {selectedDayDetail ? (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("calendarExtra.prayerProgress")}</p>
                        {prayerNames.map((name) => {
                          const status = selectedDayDetail[name];
                          return (
                            <div key={name} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                              <span className="font-medium text-sm">{name}</span>
                              {status === "completed" && <Badge className="bg-green-500">&#10003; {t("calendarExtra.completed")}</Badge>}
                              {status === "delayed" && <Badge className="bg-yellow-500">{t("calendarExtra.delayed")}</Badge>}
                              {status === "missed" && <Badge className="bg-red-500">{t("calendarExtra.missed")}</Badge>}
                              {!status && <Badge variant="outline">{t("calendarExtra.notMarked")}</Badge>}
                            </div>
                          );
                        })}
                        <div className="text-xs text-muted-foreground text-right">
                          {Object.values(selectedDayDetail).filter((s) => s === "completed").length}{t("calendarExtra.completedCount")}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">{t("calendarExtra.noPrayerData")}</p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
