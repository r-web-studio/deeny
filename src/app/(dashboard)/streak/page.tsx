"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, AlertTriangle, RotateCcw, Trophy, TrendingUp } from "lucide-react";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, LineChart, Line } from "recharts";

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
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [relapses, setRelapses] = useState<RelapseEntry[]>([]);
  const [startDate, setStartDate] = useState(new Date().toISOString());
  const [showConfirm, setShowConfirm] = useState(false);

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
  }, []);

  const saveStreakData = (data: StreakData) => {
    localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(data));
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

  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return { day: d.toLocaleDateString("en", { weekday: "short" }), relapses: relapses.filter((r) => new Date(r.date).toDateString() === d.toDateString()).length };
  });

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h1 className="text-2xl md:text-3xl font-bold">No-Porn Streak</h1>
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
      <p className="text-muted-foreground">Stay strong on your path to purity</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass border-islamic-green/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Current Streak</CardTitle>
            <Shield className="h-4 w-4 text-islamic-green" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl md:text-4xl font-bold text-islamic-green">{currentStreak}</div>
            <p className="text-sm text-muted-foreground">days clean</p>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Longest Streak</CardTitle>
            <Trophy className="h-4 w-4 text-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl md:text-4xl font-bold text-gold">{longestStreak}</div>
            <p className="text-sm text-muted-foreground">personal best</p>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Relapses</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl md:text-4xl font-bold text-red-500">{relapses.length}</div>
            <p className="text-sm text-muted-foreground">learning moments</p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass">
        <CardHeader>
          <CardTitle>Milestones</CardTitle>
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

      <div className="flex gap-3">
        {showConfirm ? (
          <Card className="glass border-red-500/30 w-full max-w-md">
            <CardContent className="pt-6 space-y-4">
              <p className="text-destructive font-medium">Are you sure? This will reset your streak.</p>
              <div className="flex gap-3">
                <Button variant="destructive" onClick={handleRelapse}>Yes, Relapse</Button>
                <Button variant="outline" onClick={() => setShowConfirm(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <Button variant="destructive" onClick={() => setShowConfirm(true)}>
              <AlertTriangle className="h-4 w-4 mr-2" />Relapse
            </Button>
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />Reset Streak
            </Button>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Weekly Relapses</CardTitle>
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
            <CardTitle className="flex items-center gap-2"><Shield className="h-4 w-4" /> Streak Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Current: {currentStreak} days</span>
                  <span>Best: {longestStreak} days</span>
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
                <p className="text-sm text-muted-foreground">days strong</p>
                <p className="text-xs text-muted-foreground mt-2">Started {new Date(startDate).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {relapses.length > 0 && (
        <Card className="glass">
          <CardHeader><CardTitle>Relapse History</CardTitle></CardHeader>
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
