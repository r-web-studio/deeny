"use client";
import { motion } from "framer-motion";
import { Trophy, Star, Lock, Landmark, Flame, PenLine, CheckCircle, Diamond, Crown, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ACHIEVEMENTS_LIST } from "@/lib/constants";

const iconMap: Record<string, React.ReactNode> = {
  Mosque: <Landmark className="h-5 w-5" />,
  Flame: <Flame className="h-5 w-5" />,
  Star: <Star className="h-5 w-5" />,
  Beads: <Target className="h-5 w-5" />,
  PenLine: <PenLine className="h-5 w-5" />,
  CheckCircle: <CheckCircle className="h-5 w-5" />,
  Diamond: <Diamond className="h-5 w-5" />,
  Crown: <Crown className="h-5 w-5" />,
};

interface UserAchievement {
  achievementIndex: number;
  earned: boolean;
  earned_at?: string;
}

const userAchievements: UserAchievement[] = [];

export default function AchievementsPage() {
  const earnedCount = userAchievements.filter((a) => a.earned).length;
  const total = ACHIEVEMENTS_LIST.length;
  const progress = total > 0 ? (earnedCount / total) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Achievements</h1>
        <p className="text-muted-foreground">
          {earnedCount} of {total} unlocked
        </p>
        <Progress value={progress} className="mt-2 max-w-md" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ACHIEVEMENTS_LIST.map((achievement, index) => {
          const isEarned = userAchievements.some(
            (a) => a.achievementIndex === index && a.earned
          );

          return (
            <motion.div
              key={achievement.name}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className={`glass ${isEarned ? "border-gold/30" : "opacity-60"}`}
              >
                <CardHeader className="flex flex-row items-center gap-3 pb-2">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      isEarned
                        ? "bg-gradient-to-br from-gold/20 to-gold/10 text-gold"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isEarned
                      ? iconMap[achievement.icon] || <Trophy className="h-5 w-5" />
                      : <Lock className="h-5 w-5" />}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-sm">{achievement.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {achievement.description}
                    </p>
                  </div>
                  {isEarned && (
                    <Badge className="bg-gold/20 text-gold">
                      <Star className="h-3 w-3 mr-1" /> Earned
                    </Badge>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Category: {achievement.category}</span>
                    <span>Requirement: {achievement.requirement}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
