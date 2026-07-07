export const APP_NAME = "Sakinah";

export const PRAYERS = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;
export type PrayerName = (typeof PRAYERS)[number];

export const DHIKR_PRESETS = [
  { name: "SubhanAllah", target: 33, arabic: "\u0633\u064f\u0628\u0652\u062d\u064e\u0627\u0646\u064e \u0627\u0644\u0644\u0651\u064e\u0647" },
  { name: "Alhamdulillah", target: 33, arabic: "\u0627\u0644\u0652\u062d\u064e\u0645\u0652\u062f\u064f \u0644\u0650\u0644\u0651\u064e\u0647" },
  { name: "Allahu Akbar", target: 34, arabic: "\u0627\u0644\u0644\u0651\u064e\u0647\u064f \u0623\u064e\u0643\u0652\u0628\u064e\u0631" },
  { name: "Astaghfirullah", target: 100, arabic: "\u0623\u064e\u0633\u0652\u062a\u064e\u063a\u0652\u0641\u0650\u0631\u064f \u0627\u0644\u0644\u0651\u064e\u0647" },
  { name: "La ilaha illa Allah", target: 100, arabic: "\u0644\u064e\u0627 \u0625\u0650\u0644\u0651\u064e\u0647\u064e \u0625\u0650\u0644\u0651\u064e\u0627 \u0627\u0644\u0644\u0651\u064e\u0647" },
] as const;

export const MOODS = [
  { icon: "smile", label: "Happy" },
  { icon: "heart", label: "Peaceful" },
  { icon: "cloud-rain", label: "Sad" },
  { icon: "flame", label: "Angry" },
  { icon: "wind", label: "Anxious" },
  { icon: "sparkles", label: "Grateful" },
  { icon: "moon", label: "Tired" },
  { icon: "party-popper", label: "Excited" },
] as const;

export const TASK_PRIORITIES = ["low", "medium", "high"] as const;
export const TASK_CATEGORIES_DEFAULT = ["Personal", "Work", "Study", "Islamic"] as const;

export const ACHIEVEMENTS_LIST = [
  { name: "First Prayer Logged",       description: "Log your first prayer",              icon: "Mosque",     category: "prayer",  requirement: 1 },
  { name: "5 Prayers in a Day",        description: "Complete all 5 prayers in one day",  icon: "Mosque",     category: "prayer",  requirement: 5 },
  { name: "3 Day Prayer Streak",       description: "Pray all 5 prayers 3 days in a row", icon: "Flame",      category: "prayer",  requirement: 3 },
  { name: "7 Day Prayer Streak",       description: "Pray all 5 prayers 7 days in a row", icon: "Flame",      category: "prayer",  requirement: 7 },
  { name: "14 Day Prayer Streak",      description: "Pray all 5 prayers 14 days in a row",icon: "Flame",      category: "prayer",  requirement: 14 },
  { name: "30 Day Prayer Streak",      description: "Pray all 5 prayers 30 days in a row",icon: "Star",       category: "prayer",  requirement: 30 },
  { name: "100 Prayers Logged",        description: "Log 100 completed prayers total",     icon: "Target",     category: "prayer",  requirement: 100 },

  { name: "First Dhikr",              description: "Complete your first dhikr session",    icon: "Beads",      category: "dhikr",   requirement: 1 },
  { name: "100 Dhikr",                description: "Complete 100 dhikr total",             icon: "Beads",      category: "dhikr",   requirement: 100 },
  { name: "500 Dhikr",                description: "Complete 500 dhikr total",             icon: "Beads",      category: "dhikr",   requirement: 500 },
  { name: "1000 Dhikr",               description: "Complete 1000 dhikr total",            icon: "Beads",      category: "dhikr",   requirement: 1000 },
  { name: "5000 Dhikr",               description: "Complete 5000 dhikr total",            icon: "Sparkles",   category: "dhikr",   requirement: 5000 },

  { name: "First Journal Entry",       description: "Write your first journal entry",      icon: "PenLine",    category: "journal", requirement: 1 },
  { name: "5 Journal Entries",         description: "Write 5 journal entries",             icon: "PenLine",    category: "journal", requirement: 5 },
  { name: "10 Journal Entries",        description: "Write 10 journal entries",            icon: "PenLine",    category: "journal", requirement: 10 },
  { name: "25 Journal Entries",        description: "Write 25 journal entries",            icon: "BookOpen",   category: "journal", requirement: 25 },
  { name: "50 Journal Entries",        description: "Write 50 journal entries",            icon: "BookOpen",   category: "journal", requirement: 50 },

  { name: "First Task Done",           description: "Complete your first task",            icon: "CheckCircle",category: "tasks",   requirement: 1 },
  { name: "10 Tasks Completed",        description: "Complete 10 tasks",                   icon: "CheckCircle",category: "tasks",   requirement: 10 },
  { name: "25 Tasks Completed",        description: "Complete 25 tasks",                   icon: "CheckCircle",category: "tasks",   requirement: 25 },
  { name: "50 Tasks Completed",        description: "Complete 50 tasks",                   icon: "CheckCircle",category: "tasks",   requirement: 50 },
  { name: "100 Tasks Completed",       description: "Complete 100 tasks",                  icon: "Trophy",     category: "tasks",   requirement: 100 },

  { name: "7 Day Clean Streak",        description: "Stay clean for 7 days",               icon: "Shield",     category: "streak",  requirement: 7 },
  { name: "14 Day Clean Streak",       description: "Stay clean for 14 days",              icon: "Shield",     category: "streak",  requirement: 14 },
  { name: "30 Day Clean Streak",       description: "Stay clean for 30 days",              icon: "Diamond",    category: "streak",  requirement: 30 },
  { name: "60 Day Clean Streak",       description: "Stay clean for 60 days",              icon: "Diamond",    category: "streak",  requirement: 60 },
  { name: "90 Day Clean Streak",       description: "Stay clean for 90 days",              icon: "Crown",      category: "streak",  requirement: 90 },
  { name: "180 Day Clean Streak",      description: "Stay clean for 180 days",             icon: "Crown",      category: "streak",  requirement: 180 },
  { name: "365 Day Clean Streak",      description: "Stay clean for a full year",          icon: "Crown",      category: "streak",  requirement: 365 },

  { name: "Multi-Tasker",              description: "Complete tasks in 3 different categories", icon: "ListTodo", category: "tasks", requirement: 3 },
  { name: "Variety is Key",            description: "Log 3 different dhikr types",         icon: "Sparkles",   category: "dhikr",   requirement: 3 },
  { name: "Perfect Week",              description: "Complete all 5 prayers for 7 days straight", icon: "Star", category: "prayer", requirement: 7 },
] as const;

export const ISLAMIC_EVENTS = [
  { name: "Ramadan", month: 9, type: "month" },
  { name: "Eid al-Fitr", month: 10, day: 1, type: "day" },
  { name: "Eid al-Adha", month: 12, day: 10, type: "day" },
  { name: "Ashura", month: 1, day: 10, type: "day" },
  { name: "Laylat al-Qadr", month: 27, type: "night" },
] as const;
