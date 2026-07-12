"use client";
import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Save, TrendingUp, History } from "lucide-react";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DHIKR_PRESETS } from "@/lib/constants";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { saveDhikrSessions as syncDhikrSessions } from "@/lib/sync/data-sync";
import { createClient } from "@/lib/supabase/client";

const DHIKR_STORAGE_KEY = "deenflow-dhikr-sessions";

interface Session {
  dhikr_type: string;
  count: number;
  target: number;
  date: string;
  timestamp: number;
}

export default function DhikrPage() {
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [count, setCount] = useState(0);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [ripple, setRipple] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(DHIKR_STORAGE_KEY);
    if (saved) {
      try {
        setSessions(JSON.parse(saved));
      } catch {}
    }
  }, []);

  const preset = DHIKR_PRESETS[selectedPreset];
  const progress = Math.min((count / preset.target) * 100, 100);

  const handleTap = useCallback(() => {
    setCount((c) => c + 1);
    setRipple(true);
    setTimeout(() => setRipple(false), 200);
    if (navigator.vibrate) navigator.vibrate(50);
  }, []);

  const saveSessions = (newSessions: Session[]) => {
    setSessions(newSessions);
    localStorage.setItem(DHIKR_STORAGE_KEY, JSON.stringify(newSessions));
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }: { data: { user: { id: string } | null } }) => {
      if (user) syncDhikrSessions(user.id, newSessions).catch(() => {});
    }).catch(() => {});
  };

  const handleReset = () => {
    if (count > 0) {
      const newSessions = [
        { dhikr_type: preset.name, count, target: preset.target, date: new Date().toISOString(), timestamp: Date.now() },
        ...sessions,
      ];
      saveSessions(newSessions);
    }
    setCount(0);
  };

  const handleSaveSession = () => {
    if (count > 0) {
      const newSessions = [
        { dhikr_type: preset.name, count, target: preset.target, date: new Date().toISOString(), timestamp: Date.now() },
        ...sessions,
      ];
      saveSessions(newSessions);
      setCount(0);
    }
  };

  const todayTotal = sessions
    .filter((s) => new Date(s.date).toDateString() === new Date().toDateString())
    .reduce((sum, s) => sum + s.count, 0);

  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayStr = d.toLocaleDateString("en", { weekday: "short" });
    const total = sessions
      .filter((s) => new Date(s.date).toDateString() === d.toDateString())
      .reduce((sum, s) => sum + s.count, 0);
    return { day: dayStr, count: total };
  });

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold">Dhikr Counter</h1>

      <div className="flex gap-2 flex-wrap">
        {DHIKR_PRESETS.map((p, i) => (
          <Button
            key={p.name}
            variant={selectedPreset === i ? "default" : "outline"}
            onClick={() => { setSelectedPreset(i); setCount(0); }}
            className={selectedPreset === i ? "bg-islamic-green hover:bg-islamic-green/90" : ""}
          >
            {p.name}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2 glass flex flex-col items-center justify-center py-12">
          <p className="text-lg text-muted-foreground mb-2">{preset.arabic}</p>
          <p className="text-sm text-muted-foreground mb-6">{preset.name} • Target: {preset.target}</p>
          <motion.button
            ref={buttonRef}
            onClick={handleTap}
            whileTap={{ scale: 0.95 }}
            className={`relative w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-islamic-green to-islamic-green/70 text-white text-4xl sm:text-5xl font-bold shadow-lg shadow-islamic-green/30 flex items-center justify-center transition-all ${ripple ? "ring-4 ring-islamic-green/30" : ""}`}
          >
            {count}
            <div className="absolute inset-0 rounded-full bg-white/10 animate-ping" style={{ animationDuration: "0.3s", opacity: ripple ? 0.3 : 0 }} />
          </motion.button>
          <div className="w-full max-w-xs mt-6">
            <div className="flex justify-between text-sm text-muted-foreground mb-1">
              <span>{count} / {preset.target}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-islamic-green to-gold rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ type: "spring", damping: 15 }}
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={handleReset}><RotateCcw className="h-4 w-4 mr-2" />Reset</Button>
            <Button className="bg-islamic-green hover:bg-islamic-green/90" onClick={() => { handleSaveSession(); toast.success("Dhikr session saved!"); }}><Save className="h-4 w-4 mr-2" />Save</Button>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="glass">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{todayTotal}</div>
              <p className="text-xs text-muted-foreground">total dhikr</p>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{sessions.length}</div>
              <p className="text-xs text-muted-foreground">completed</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Weekly Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData}>
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="oklch(0.55 0.18 155)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {sessions.length > 0 && (
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><History className="h-4 w-4" /> Recent Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {sessions.slice(0, 10).map((s, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <div>
                    <span className="font-medium">{s.dhikr_type}</span>
                    <span className="text-sm text-muted-foreground ml-2">{s.count}/{s.target}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{new Date(s.timestamp).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
