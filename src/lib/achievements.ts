import { ACHIEVEMENTS_LIST } from "./constants";
import { saveAchievements as syncAchievements } from "./sync/data-sync";
import { createClient } from "./supabase/client";

const ACHIEVEMENTS_STORAGE_KEY = "deenflow-achievements";

export interface EarnedAchievement {
  index: number;
  earned_at: string;
}

function loadEarned(): EarnedAchievement[] {
  try {
    const raw = localStorage.getItem(ACHIEVEMENTS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

export function saveEarned(earned: EarnedAchievement[]) {
  localStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(earned));
  const supabase = createClient();
  supabase.auth.getUser().then(({ data: { user } }: { data: { user: { id: string } | null } }) => {
    if (user) syncAchievements(user.id, earned).catch(() => {});
  });
}

function getPrayerStreak(): number {
  try {
    const raw = localStorage.getItem("deenflow-prayer-history");
    if (!raw) return 0;
    const history = JSON.parse(raw) as Record<string, Record<string, string>>;
    const dates = Object.keys(history).sort().reverse();
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 400; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const dayStatuses = history[key];
      if (!dayStatuses) break;
      const completedCount = Object.values(dayStatuses).filter((s) => s === "completed").length;
      if (completedCount === 5) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  } catch {
    return 0;
  }
}

function getTotalPrayersLogged(): number {
  try {
    const raw = localStorage.getItem("deenflow-prayer-history");
    if (!raw) return 0;
    const history = JSON.parse(raw) as Record<string, Record<string, string>>;
    let total = 0;
    for (const dayStatuses of Object.values(history)) {
      total += Object.values(dayStatuses).filter((s) => s === "completed").length;
    }
    return total;
  } catch {
    return 0;
  }
}

function hadPerfectDay(): boolean {
  try {
    const raw = localStorage.getItem("deenflow-prayer-history");
    if (!raw) return false;
    const history = JSON.parse(raw) as Record<string, Record<string, string>>;
    for (const dayStatuses of Object.values(history)) {
      const completedCount = Object.values(dayStatuses).filter((s) => s === "completed").length;
      if (completedCount === 5) return true;
    }
    return false;
  } catch {
    return false;
  }
}

function getTotalDhikr(): number {
  try {
    const raw = localStorage.getItem("deenflow-dhikr-sessions");
    if (!raw) return 0;
    const sessions = JSON.parse(raw) as { count: number }[];
    return sessions.reduce((sum, s) => sum + (s.count || 0), 0);
  } catch {
    return 0;
  }
}

function getDhikrTypes(): number {
  try {
    const raw = localStorage.getItem("deenflow-dhikr-sessions");
    if (!raw) return 0;
    const sessions = JSON.parse(raw) as { dhikr_type: string }[];
    const types = new Set(sessions.map((s) => s.dhikr_type));
    return types.size;
  } catch {
    return 0;
  }
}

function getJournalCount(): number {
  try {
    const raw = localStorage.getItem("deenflow-journal");
    if (!raw) return 0;
    return JSON.parse(raw).length;
  } catch {
    return 0;
  }
}

function getCompletedTasks(): number {
  try {
    const raw = localStorage.getItem("deenflow-tasks");
    if (!raw) return 0;
    const tasks = JSON.parse(raw) as { completed: boolean }[];
    return tasks.filter((t) => t.completed).length;
  } catch {
    return 0;
  }
}

function getTaskCategories(): number {
  try {
    const raw = localStorage.getItem("deenflow-tasks");
    if (!raw) return 0;
    const tasks = JSON.parse(raw) as { completed: boolean; category: string }[];
    const completed = tasks.filter((t) => t.completed);
    const cats = new Set(completed.map((t) => t.category));
    return cats.size;
  } catch {
    return 0;
  }
}

function getCleanStreak(): number {
  try {
    const raw = localStorage.getItem("deenflow-streak");
    if (!raw) return 0;
    const data = JSON.parse(raw) as { currentStreak: number };
    return data.currentStreak || 0;
  } catch {
    return 0;
  }
}

function getRequirementForIndex(index: number): number {
  const achievement = ACHIEVEMENTS_LIST[index];
  if (!achievement) return 0;

  const a = achievement as { name: string; category: string; requirement: number };

  switch (a.name) {
    case "First Prayer Logged": return 1;
    case "5 Prayers in a Day": return 5;
    case "3 Day Prayer Streak": return 3;
    case "7 Day Prayer Streak": return 7;
    case "14 Day Prayer Streak": return 14;
    case "30 Day Prayer Streak": return 30;
    case "100 Prayers Logged": return getTotalPrayersLogged();
    case "First Dhikr": return getTotalDhikr() > 0 ? 1 : 0;
    case "100 Dhikr": return getTotalDhikr();
    case "500 Dhikr": return getTotalDhikr();
    case "1000 Dhikr": return getTotalDhikr();
    case "5000 Dhikr": return getTotalDhikr();
    case "First Journal Entry": return getJournalCount() > 0 ? 1 : 0;
    case "5 Journal Entries": return getJournalCount();
    case "10 Journal Entries": return getJournalCount();
    case "25 Journal Entries": return getJournalCount();
    case "50 Journal Entries": return getJournalCount();
    case "First Task Done": return getCompletedTasks() > 0 ? 1 : 0;
    case "10 Tasks Completed": return getCompletedTasks();
    case "25 Tasks Completed": return getCompletedTasks();
    case "50 Tasks Completed": return getCompletedTasks();
    case "100 Tasks Completed": return getCompletedTasks();
    case "7 Day Clean Streak": return getCleanStreak();
    case "14 Day Clean Streak": return getCleanStreak();
    case "30 Day Clean Streak": return getCleanStreak();
    case "60 Day Clean Streak": return getCleanStreak();
    case "90 Day Clean Streak": return getCleanStreak();
    case "180 Day Clean Streak": return getCleanStreak();
    case "365 Day Clean Streak": return getCleanStreak();
    case "Multi-Tasker": return getTaskCategories();
    case "Variety is Key": return getDhikrTypes();
    case "Perfect Week": return getPrayerStreak();
    default: return 0;
  }
}

function checkAchievement(index: number): boolean {
  const achievement = ACHIEVEMENTS_LIST[index];
  if (!achievement) return false;

  const a = achievement as { name: string; requirement: number };
  const current = getRequirementForIndex(index);
  return current >= a.requirement;
}

export interface AchievementStatus {
  index: number;
  earned: boolean;
  current: number;
  required: number;
  earned_at?: string;
}

export function checkAllAchievements(): {
  statuses: AchievementStatus[];
  newlyEarned: AchievementStatus[];
} {
  const previouslyEarned = loadEarned();
  const previouslyEarnedSet = new Set(previouslyEarned.map((e) => e.index));

  const statuses: AchievementStatus[] = ACHIEVEMENTS_LIST.map((achievement, index) => {
    const a = achievement as { requirement: number };
    const earned = checkAchievement(index);
    const current = getRequirementForIndex(index);
    const prev = previouslyEarned.find((e) => e.index === index);

    return {
      index,
      earned,
      current: Math.min(current, a.requirement),
      required: a.requirement,
      earned_at: prev?.earned_at,
    };
  });

  const newlyEarned: AchievementStatus[] = [];
  const updatedEarned: EarnedAchievement[] = [...previouslyEarned];

  for (const status of statuses) {
    if (status.earned && !previouslyEarnedSet.has(status.index)) {
      const now = new Date().toISOString();
      newlyEarned.push({ ...status, earned_at: now });
      updatedEarned.push({ index: status.index, earned_at: now });
    }
  }

  if (newlyEarned.length > 0) {
    saveEarned(updatedEarned);
  }

  return { statuses, newlyEarned };
}
