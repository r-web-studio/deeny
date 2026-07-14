"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {
  Trophy, Star, Lock, Landmark, Flame, PenLine, CheckCircle,
  Diamond, Crown, Target, Shield, BookOpen, ListTodo, Sparkles, X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ACHIEVEMENTS_LIST } from "@/lib/constants";
import { checkAllAchievements, type AchievementStatus } from "@/lib/achievements";
import { useI18n } from "@/lib/i18n";

const iconMap: Record<string, React.ReactNode> = {
  Mosque: <Landmark className="h-5 w-5" />,
  Flame: <Flame className="h-5 w-5" />,
  Star: <Star className="h-5 w-5" />,
  Beads: <Target className="h-5 w-5" />,
  PenLine: <PenLine className="h-5 w-5" />,
  CheckCircle: <CheckCircle className="h-5 w-5" />,
  Diamond: <Diamond className="h-5 w-5" />,
  Crown: <Crown className="h-5 w-5" />,
  Shield: <Shield className="h-5 w-5" />,
  BookOpen: <BookOpen className="h-5 w-5" />,
  ListTodo: <ListTodo className="h-5 w-5" />,
  Trophy: <Trophy className="h-5 w-5" />,
  Sparkles: <Sparkles className="h-5 w-5" />,
};

const categoryColors: Record<string, string> = {
  prayer: "from-islamic-green/20 to-islamic-green/10 text-islamic-green",
  dhikr: "from-gold/20 to-gold/10 text-gold",
  journal: "from-blue-500/20 to-blue-500/10 text-blue-500",
  tasks: "from-purple-500/20 to-purple-500/10 text-purple-500",
  streak: "from-orange-500/20 to-orange-500/10 text-orange-500",
};

const categoryBadgeColors: Record<string, string> = {
  prayer: "bg-islamic-green/20 text-islamic-green",
  dhikr: "bg-gold/20 text-gold",
  journal: "bg-blue-500/20 text-blue-500",
  tasks: "bg-purple-500/20 text-purple-500",
  streak: "bg-orange-500/20 text-orange-500",
};

function fireConfetti() {
  const duration = 3000;
  const end = Date.now() + duration;

  const colors = ["#22c55e", "#eab308", "#a855f7", "#3b82f6", "#f97316", "#ec4899"];

  (function frame() {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors,
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors,
    });
    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}

function fireBurst() {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ["#22c55e", "#eab308", "#a855f7", "#3b82f6"],
  });
}

export default function AchievementsPage() {
  const { t } = useI18n();
  const [statuses, setStatuses] = useState<AchievementStatus[]>([]);
  const [newlyEarned, setNewlyEarned] = useState<AchievementStatus[]>([]);
  const [celebrationIndex, setCelebrationIndex] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const hasChecked = useRef(false);

  const confettiTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearConfettiTimers = useCallback(() => {
    confettiTimersRef.current.forEach((t) => clearTimeout(t));
    confettiTimersRef.current = [];
  }, []);

  const loadAchievements = useCallback(() => {
    const { statuses: s, newlyEarned: n } = checkAllAchievements();
    setStatuses(s);

    if (n.length > 0 && hasChecked.current) {
      setNewlyEarned(n);
      clearConfettiTimers();
      // Big celebration confetti
      fireConfetti();
      confettiTimersRef.current.push(setTimeout(() => fireBurst(), 300));
      confettiTimersRef.current.push(setTimeout(() => fireBurst(), 800));
      confettiTimersRef.current.push(setTimeout(() => fireBurst(), 1400));
      confettiTimersRef.current.push(setTimeout(() => {
        confetti({ particleCount: 50, angle: 60, spread: 55, origin: { x: 0, y: 0.6 }, colors: ["#22c55e", "#eab308", "#a855f7", "#3b82f6"] });
        confetti({ particleCount: 50, angle: 120, spread: 55, origin: { x: 1, y: 0.6 }, colors: ["#22c55e", "#eab308", "#a855f7", "#3b82f6"] });
      }, 2000));
      setCelebrationIndex(n[0].index);
    }
    hasChecked.current = true;
  }, [clearConfettiTimers]);

  useEffect(() => {
    loadAchievements();
    window.addEventListener("storage", loadAchievements);
    document.addEventListener("visibilitychange", loadAchievements);
    return () => {
      clearConfettiTimers();
      window.removeEventListener("storage", loadAchievements);
      document.removeEventListener("visibilitychange", loadAchievements);
    };
  }, [loadAchievements, clearConfettiTimers]);

  const earnedCount = statuses.filter((s) => s.earned).length;
  const total = ACHIEVEMENTS_LIST.length;
  const progress = total > 0 ? (earnedCount / total) * 100 : 0;

  const categories = ["all", "prayer", "dhikr", "journal", "tasks", "streak"];
  const filtered = filter === "all"
    ? statuses
    : statuses.filter((s) => {
        const a = ACHIEVEMENTS_LIST[s.index] as { category: string };
        return a.category === filter;
      });

  const closeCelebration = () => {
    setCelebrationIndex(null);
    setNewlyEarned([]);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">{t("achievements.title")}</h1>
        <p className="text-muted-foreground">
          {earnedCount} {t("achievements.of")} {total} {t("achievements.unlocked")}
        </p>
        <Progress value={progress} className="mt-2 max-w-md" />
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <Button
            key={cat}
            variant={filter === cat ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(cat)}
            className={filter === cat ? "bg-islamic-green hover:bg-islamic-green/90 capitalize" : ""}
          >
            {cat === "all" ? t("achievementsExtra.all") : cat}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((status) => {
          const achievement = ACHIEVEMENTS_LIST[status.index] as {
            name: string;
            description: string;
            icon: string;
            category: string;
            requirement: number;
          };
          const pct = status.required > 0 ? Math.min((status.current / status.required) * 100, 100) : 0;

          return (
            <motion.div
              key={status.index}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: status.index * 0.03 }}
              layout
            >
              <Card className={`glass ${status.earned ? "border-gold/30" : ""}`}>
                <CardHeader className="flex flex-row items-center gap-3 pb-2">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${status.earned ? categoryColors[achievement.category] || "from-gold/20 to-gold/10 text-gold" : "bg-muted text-muted-foreground"}`}>
                    {status.earned
                      ? iconMap[achievement.icon] || <Trophy className="h-5 w-5" />
                      : <Lock className="h-5 w-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm truncate">{achievement.name}</CardTitle>
                    <p className="text-xs text-muted-foreground truncate">{achievement.description}</p>
                  </div>
                  {status.earned && (
                    <Badge className="bg-gold/20 text-gold shrink-0">
                      <Star className="h-3 w-3 mr-1" /> {t("achievements.earned")}
                    </Badge>
                  )}
                </CardHeader>
                <CardContent className="space-y-2">
                  <Progress value={pct} className="h-1.5" />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <Badge variant="outline" className={`text-[10px] ${categoryBadgeColors[achievement.category] || ""}`}>
                      {achievement.category}
                    </Badge>
                    <span>{status.current} / {status.required}</span>
                  </div>
                  {status.earned && status.earned_at && (
                    <p className="text-[10px] text-muted-foreground">
                      {t("achievements.earned")} {new Date(status.earned_at).toLocaleDateString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {celebrationIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={closeCelebration}
          >
            <motion.div
              initial={{ scale: 0.3, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.3, opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 15, stiffness: 200 }}
              className="relative max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="glass border-gold/30 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-gold/10 via-transparent to-islamic-green/10 pointer-events-none" />
                <CardHeader className="text-center relative pb-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2"
                    onClick={closeCelebration}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", damping: 10, stiffness: 150, delay: 0.2 }}
                    className="w-24 h-24 rounded-2xl bg-gradient-to-br from-gold/30 to-gold/10 flex items-center justify-center mx-auto"
                  >
                    <Trophy className="h-12 w-12 text-gold" />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h1 className="text-3xl font-bold text-gold mt-4 tracking-tight">
                      CONGRATULATIONS!
                    </h1>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <p className="text-lg font-semibold text-foreground mt-3">
                      You&apos;ve earned:
                    </p>
                    <h2 className="text-2xl font-bold mt-2 text-islamic-green">
                      {ACHIEVEMENTS_LIST[celebrationIndex]?.name}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-2">
                      {ACHIEVEMENTS_LIST[celebrationIndex]?.description}
                    </p>
                  </motion.div>
                </CardHeader>
                <CardContent className="text-center relative pb-6">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    {newlyEarned.length > 1 && (
                      <p className="text-sm text-muted-foreground mb-3">
                        +{newlyEarned.length - 1} more achievement{newlyEarned.length > 2 ? "s" : ""} unlocked!
                      </p>
                    )}
                    <p className="text-sm text-islamic-green font-medium mb-4">
                      Keep going! Your dedication is inspiring.
                    </p>
                    <Button onClick={closeCelebration} className="bg-gold hover:bg-gold/90 text-black px-8 py-3 text-lg font-bold">
                      <Star className="h-5 w-5 mr-2" /> AWESOME!
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
