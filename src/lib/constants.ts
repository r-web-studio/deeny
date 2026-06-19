export const APP_NAME = "DeenFlow";

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
  { name: "First Prayer Logged", description: "Log your first prayer", icon: "Mosque", category: "prayer", requirement: 1 },
  { name: "7 Day Prayer Streak", description: "Pray 7 days in a row", icon: "Flame", category: "prayer", requirement: 7 },
  { name: "30 Day Prayer Streak", description: "Pray 30 days in a row", icon: "Star", category: "prayer", requirement: 30 },
  { name: "1000 Dhikr", description: "Complete 1000 dhikr", icon: "Beads", category: "dhikr", requirement: 1000 },
  { name: "First Journal Entry", description: "Write your first journal entry", icon: "PenLine", category: "journal", requirement: 1 },
  { name: "Complete All Tasks", description: "Complete 100 tasks", icon: "CheckCircle", category: "tasks", requirement: 100 },
  { name: "30 Day Clean Streak", description: "Stay clean for 30 days", icon: "Diamond", category: "streak", requirement: 30 },
  { name: "90 Day Clean Streak", description: "Stay clean for 90 days", icon: "Crown", category: "streak", requirement: 90 },
] as const;

export const ISLAMIC_EVENTS = [
  { name: "Ramadan", month: 9, type: "month" },
  { name: "Eid al-Fitr", month: 10, day: 1, type: "day" },
  { name: "Eid al-Adha", month: 12, day: 10, type: "day" },
  { name: "Ashura", month: 1, day: 10, type: "day" },
  { name: "Laylat al-Qadr", month: 27, type: "night" },
] as const;
