export interface PrayerLog {
  id: string;
  user_id: string;
  prayer: string;
  status: string;
  date: string;
}

export interface DhikrSession {
  id: string;
  user_id: string;
  dhikr_type: string;
  count: number;
  target: number;
  date: string;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  priority: string;
  category_id?: string;
  due_date?: string;
  completed: boolean;
}

export interface JournalEntry {
  id: string;
  user_id: string;
  title: string;
  content: string;
  mood?: string;
  tags?: string[];
  date: string;
}

export interface AIConversation {
  id: string;
  user_id: string;
  title: string;
}

export interface AIMessage {
  id: string;
  conversation_id: string;
  role: string;
  content: string;
}

export interface NoPornStreak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  total_relapses: number;
  start_date: string;
  last_check_date: string;
}

export interface Relapse {
  id: string;
  user_id: string;
  streak_id: string;
  date: string;
  note?: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  earned_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  username: string;
  avatar_url?: string;
  country?: string;
  timezone?: string;
  theme?: string;
}

export type SyncQueueItemType =
  | "prayer_logs"
  | "dhikr_sessions"
  | "tasks"
  | "journal_entries"
  | "ai_conversations"
  | "ai_messages"
  | "no_porn_streaks"
  | "relapses"
  | "user_achievements"
  | "users";

export interface SyncQueueItem {
  id: string;
  type: SyncQueueItemType;
  data: Record<string, unknown>;
  action: "upsert" | "delete";
  createdAt: string;
}

export interface AllUserData {
  prayers: PrayerLog[];
  dhikr: DhikrSession[];
  tasks: Task[];
  journal: JournalEntry[];
  conversations: AIConversation[];
  messages: AIMessage[];
  streak: NoPornStreak | null;
  relapses: Relapse[];
  achievements: UserAchievement[];
  profile: UserProfile | null;
}
