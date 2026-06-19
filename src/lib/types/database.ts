export interface User {
  id: string;
  email: string;
  full_name: string;
  username: string;
  avatar_url: string | null;
  country: string | null;
  timezone: string;
  theme: "light" | "dark" | "system";
  created_at: string;
  updated_at: string;
}

export interface PrayerLog {
  id: string;
  user_id: string;
  prayer: "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";
  status: "completed" | "delayed" | "missed";
  date: string;
  created_at: string;
}

export interface DhikrSession {
  id: string;
  user_id: string;
  dhikr_type: string;
  count: number;
  target: number;
  date: string;
  created_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  priority: "low" | "medium" | "high";
  category_id: string | null;
  due_date: string | null;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface TaskCategory {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface JournalEntry {
  id: string;
  user_id: string;
  title: string;
  content: string;
  mood: string;
  tags: string[];
  date: string;
  created_at: string;
  updated_at: string;
}

export interface AiConversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface AiMessage {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface NoPornStreak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  total_relapses: number;
  start_date: string;
  last_check_date: string;
  created_at: string;
  updated_at: string;
}

export interface Relapse {
  id: string;
  user_id: string;
  streak_id: string;
  date: string;
  note: string | null;
  created_at: string;
}

export interface Bookmark {
  id: string;
  user_id: string;
  surah_number: number;
  ayah_number: number;
  surah_name: string;
  note: string | null;
  created_at: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  requirement: number;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  earned_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: "prayer" | "task" | "achievement" | "daily";
  read: boolean;
  created_at: string;
}
