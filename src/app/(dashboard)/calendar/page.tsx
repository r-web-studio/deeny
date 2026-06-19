"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ISLAMIC_EVENTS } from "@/lib/constants";
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval, isToday,
  addMonths, subMonths, startOfWeek, endOfWeek, isSameMonth,
} from "date-fns";

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

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

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold">Calendar</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="glass">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{format(currentDate, "MMMM yyyy")}</CardTitle>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setCurrentDate(new Date())}>Today</Button>
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
                  const selected = selectedDate?.toDateString() === day.toDateString();
                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => setSelectedDate(day)}
                      className={`p-2 rounded-lg text-sm transition-all relative ${
                        !inMonth ? "text-muted-foreground/40" : ""
                      } ${isToday(day) ? "bg-islamic-green text-white font-bold" : ""} ${selected && !isToday(day) ? "bg-islamic-green/20 text-islamic-green" : ""} hover:bg-accent`}
                    >
                      <div>{format(day, "d")}</div>
                      <div className="text-[10px] text-muted-foreground">{getHijriApprox(day)}</div>
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
              <CardTitle className="flex items-center gap-2"><Star className="h-4 w-4 text-gold" /> Islamic Events</CardTitle>
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

          {selectedDate && (
            <Card className="glass border-islamic-green/20">
              <CardHeader>
                <CardTitle className="text-sm">{format(selectedDate, "EEEE, MMMM d, yyyy")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">Hijri: {getHijriApprox(selectedDate)}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </motion.div>
  );
}
