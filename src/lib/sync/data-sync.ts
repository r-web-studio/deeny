import { createClient } from "@/lib/supabase/client";
import type {
  PrayerLog,
  DhikrSession,
  Task,
  JournalEntry,
  AIConversation,
  AIMessage,
  NoPornStreak,
  UserAchievement,
  DailyCheckin,
} from "./types";

let supabaseClient: ReturnType<typeof createClient> | null = null;

function getSupabase(): ReturnType<typeof createClient> | null {
  if (supabaseClient) return supabaseClient;
  try {
    supabaseClient = createClient();
    return supabaseClient;
  } catch {
    return null;
  }
}

function genId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

// ── Safe query helper ────────────────────────────────────────────────────────

async function safeQuery<T>(promise: Promise<{ data: T | null; error: unknown }>): Promise<T | null> {
  try {
    const { data, error } = await promise;
    if (error) {
      console.warn("Supabase query error:", (error as { message?: string })?.message);
      return null;
    }
    return data;
  } catch (err) {
    console.warn("Supabase query failed:", err);
    return null;
  }
}

// ── Prayers ─────────────────────────────────────────────────────────────────

export interface PrayerHistory {
  [date: string]: { [prayer: string]: string | undefined };
}

export async function savePrayerHistory(userId: string, history: PrayerHistory) {
  const supabase = getSupabase();
  if (!supabase) return;
  const logs: PrayerLog[] = [];
  for (const [date, dayStatuses] of Object.entries(history)) {
    for (const [prayer, status] of Object.entries(dayStatuses)) {
      if (status) {
        logs.push({
          id: genId(),
          user_id: userId,
          prayer: prayer.toLowerCase(),
          status,
          date,
        });
      }
    }
  }
  if (logs.length > 0) {
    const { error: delErr } = await supabase.from("prayer_logs").delete().eq("user_id", userId);
    if (delErr) console.warn("savePrayerHistory delete:", delErr.message);
    const { error } = await supabase.from("prayer_logs").insert(logs);
    if (error) console.warn("savePrayerHistory insert:", error.message);
  }
}

export async function loadPrayerHistory(userId: string): Promise<PrayerHistory> {
  const supabase = getSupabase();
  if (!supabase) return {};
  const data = await safeQuery(
    supabase.from("prayer_logs").select("*").eq("user_id", userId)
  );
  if (!data) return {};
  const history: PrayerHistory = {};
  for (const log of data as PrayerLog[]) {
    if (!history[log.date]) history[log.date] = {};
    history[log.date][log.prayer] = log.status;
  }
  return history;
}

// ── Dhikr ───────────────────────────────────────────────────────────────────

export interface DhikrSessionLocal {
  id?: string;
  dhikr_type: string;
  count: number;
  target: number;
  date: string;
  timestamp: number;
}

export async function saveDhikrSessions(userId: string, sessions: DhikrSessionLocal[]) {
  const supabase = getSupabase();
  if (!supabase) return;
  const dbSessions: DhikrSession[] = sessions.map((s) => ({
    id: genId(),
    user_id: userId,
    dhikr_type: s.dhikr_type,
    count: s.count,
    target: s.target,
    date: s.date,
  }));
  if (dbSessions.length > 0) {
    const { error: delErr } = await supabase.from("dhikr_sessions").delete().eq("user_id", userId);
    if (delErr) console.warn("saveDhikrSessions delete:", delErr.message);
    const { error } = await supabase.from("dhikr_sessions").insert(dbSessions);
    if (error) console.warn("saveDhikrSessions insert:", error.message);
  }
}

export async function loadDhikrSessions(userId: string): Promise<DhikrSessionLocal[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const data = await safeQuery(
    supabase.from("dhikr_sessions").select("*").eq("user_id", userId)
  );
  if (!data) return [];
  return (data as DhikrSession[]).map((r) => ({
    id: r.id,
    dhikr_type: r.dhikr_type,
    count: r.count,
    target: r.target,
    date: r.date,
    timestamp: new Date(r.date).getTime(),
  }));
}

// ── Tasks ───────────────────────────────────────────────────────────────────

export interface TaskLocal {
  id: string;
  title: string;
  priority: string;
  category: string;
  due_date: string | null;
  completed: boolean;
  created_at: string;
}

export async function saveTasks(userId: string, tasks: TaskLocal[]) {
  const supabase = getSupabase();
  if (!supabase) return;
  const dbTasks: Task[] = tasks.map((t) => ({
    id: genId(),
    user_id: userId,
    title: t.title,
    priority: t.priority,
    due_date: t.due_date || undefined,
    completed: t.completed,
  }));
  if (dbTasks.length > 0) {
    const { error: delErr } = await supabase.from("tasks").delete().eq("user_id", userId);
    if (delErr) console.warn("saveTasks delete:", delErr.message);
    const { error } = await supabase.from("tasks").insert(dbTasks);
    if (error) console.warn("saveTasks insert:", error.message);
  }
}

export async function loadTasks(userId: string): Promise<TaskLocal[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const data = await safeQuery(
    supabase.from("tasks").select("*").eq("user_id", userId)
  );
  if (!data) return [];
  return (data as Task[]).map((r) => ({
    id: r.id,
    title: r.title,
    priority: r.priority,
    category: "Personal",
    due_date: r.due_date || null,
    completed: r.completed,
    created_at: new Date().toISOString(),
  }));
}

export async function deleteTasks(userId: string, ids: string[]) {
  const supabase = getSupabase();
  if (!supabase) return;
  const { error } = await supabase.from("tasks").delete().in("id", ids);
  if (error) console.warn("deleteTasks:", error.message);
}

// ── Journal ─────────────────────────────────────────────────────────────────

export interface JournalEntryLocal {
  id: string;
  title: string;
  content: string;
  mood: string;
  tags: string[];
  date: string;
}

export async function saveJournalEntries(userId: string, entries: JournalEntryLocal[]) {
  const supabase = getSupabase();
  if (!supabase) return;
  const dbEntries: JournalEntry[] = entries.map((e) => ({
    id: genId(),
    user_id: userId,
    title: e.title,
    content: e.content,
    mood: e.mood,
    tags: e.tags,
    date: e.date,
  }));
  if (dbEntries.length > 0) {
    const { error: delErr } = await supabase.from("journal_entries").delete().eq("user_id", userId);
    if (delErr) console.warn("saveJournalEntries delete:", delErr.message);
    const { error } = await supabase.from("journal_entries").insert(dbEntries);
    if (error) console.warn("saveJournalEntries insert:", error.message);
  }
}

export async function loadJournalEntries(userId: string): Promise<JournalEntryLocal[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const data = await safeQuery(
    supabase.from("journal_entries").select("*").eq("user_id", userId)
  );
  if (!data) return [];
  return (data as JournalEntry[]).map((r) => ({
    id: r.id,
    title: r.title,
    content: r.content,
    mood: r.mood || "",
    tags: r.tags || [],
    date: r.date,
  }));
}

export async function deleteJournalEntries(userId: string, ids: string[]) {
  const supabase = getSupabase();
  if (!supabase) return;
  const { error } = await supabase.from("journal_entries").delete().in("id", ids);
  if (error) console.warn("deleteJournalEntries:", error.message);
}

// ── AI Conversations ────────────────────────────────────────────────────────

export interface AIConversationLocal {
  id: string;
  title: string;
  messages: { role: string; content: string }[];
  created_at: string;
}

export async function saveAIConversations(userId: string, convos: AIConversationLocal[]) {
  const supabase = getSupabase();
  if (!supabase) return;
  // Delete existing conversations and their messages
  const { data: existingConvos } = await supabase.from("ai_conversations").select("id").eq("user_id", userId);
  const existingIds = (existingConvos as { id: string }[] | null)?.map((c) => c.id) || [];
  if (existingIds.length > 0) {
    await supabase.from("ai_messages").delete().in("conversation_id", existingIds);
    await supabase.from("ai_conversations").delete().eq("user_id", userId);
  }
  const dbConvos: AIConversation[] = convos.map((c) => ({
    id: genId(),
    user_id: userId,
    title: c.title,
  }));
  const dbMessages: AIMessage[] = [];
  for (let ci = 0; ci < convos.length; ci++) {
    const c = convos[ci];
    const convoId = dbConvos[ci].id;
    for (let i = 0; i < c.messages.length; i++) {
      const m = c.messages[i];
      dbMessages.push({
        id: genId(),
        conversation_id: convoId,
        role: m.role,
        content: m.content,
      });
    }
  }
  if (dbConvos.length > 0) {
    const { error } = await supabase.from("ai_conversations").insert(dbConvos);
    if (error) console.warn("saveAIConversations convos:", error.message);
  }
  if (dbMessages.length > 0) {
    const { error } = await supabase.from("ai_messages").insert(dbMessages);
    if (error) console.warn("saveAIConversations messages:", error.message);
  }
}

export async function loadAIConversations(userId: string): Promise<AIConversationLocal[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const convos = await safeQuery(
    supabase.from("ai_conversations").select("*").eq("user_id", userId)
  );
  const convList = Array.isArray(convos) ? convos : [];
  if (convList.length === 0) return [];

  const convIds = convList.map((c: AIConversation) => c.id);
  const msgs = await safeQuery(
    supabase.from("ai_messages").select("*").in("conversation_id", convIds)
  );
  const msgList = (msgs as AIMessage[]) || [];
  const msgByConvo = new Map<string, { role: string; content: string }[]>();
  for (const m of msgList) {
    const arr = msgByConvo.get(m.conversation_id) || [];
    arr.push({ role: m.role, content: m.content });
    msgByConvo.set(m.conversation_id, arr);
  }
  return convList.map((c: AIConversation) => ({
    id: c.id,
    title: c.title,
    messages: msgByConvo.get(c.id) || [],
    created_at: new Date().toISOString(),
  }));
}

export async function deleteAIConversations(userId: string, ids: string[]) {
  const supabase = getSupabase();
  if (!supabase) return;
  const { error: e1 } = await supabase.from("ai_messages").delete().in("conversation_id", ids);
  if (e1) console.warn("deleteAIConversations messages:", e1.message);
  const { error: e2 } = await supabase.from("ai_conversations").delete().in("id", ids);
  if (e2) console.warn("deleteAIConversations convos:", e2.message);
}

// ── Streak ──────────────────────────────────────────────────────────────────

export interface StreakLocal {
  currentStreak: number;
  longestStreak: number;
  relapses: { date: string; note: string }[];
  startDate: string;
}

export async function saveStreak(userId: string, streak: StreakLocal) {
  const supabase = getSupabase();
  if (!supabase) return;
  const dbStreak: NoPornStreak = {
    id: genId(),
    user_id: userId,
    current_streak: streak.currentStreak,
    longest_streak: streak.longestStreak,
    total_relapses: streak.relapses.length,
    start_date: streak.startDate,
    last_check_date: new Date().toISOString().slice(0, 10),
  };
  const { error: delErr } = await supabase.from("no_porn_streaks").delete().eq("user_id", userId);
  if (delErr) console.warn("saveStreak delete:", delErr.message);
  const { error } = await supabase.from("no_porn_streaks").insert(dbStreak);
  if (error) console.warn("saveStreak insert:", error.message);
}

export async function loadStreak(userId: string): Promise<StreakLocal | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const data = await safeQuery(
    supabase.from("no_porn_streaks").select("*").eq("user_id", userId).maybeSingle()
  );
  if (!data) return null;
  const r = data as NoPornStreak;
  return {
    currentStreak: r.current_streak,
    longestStreak: r.longest_streak,
    relapses: [],
    startDate: r.start_date,
  };
}

// ── Achievements ────────────────────────────────────────────────────────────

export interface AchievementLocal {
  index: number;
  earned_at: string;
}

export async function saveAchievements(userId: string, earned: AchievementLocal[]) {
  const supabase = getSupabase();
  if (!supabase) return;
  if (earned.length > 0) {
    const rows: UserAchievement[] = earned.map((a) => ({
      id: genId(),
      user_id: userId,
      achievement_id: `achievement-${a.index}`,
      earned_at: a.earned_at,
    }));
    const { error: delErr } = await supabase.from("user_achievements").delete().eq("user_id", userId);
    if (delErr) console.warn("saveAchievements delete:", delErr.message);
    const { error } = await supabase.from("user_achievements").insert(rows);
    if (error) console.warn("saveAchievements insert:", error.message);
  }
}

export async function loadAchievements(userId: string): Promise<AchievementLocal[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const data = await safeQuery(
    supabase.from("user_achievements").select("*").eq("user_id", userId)
  );
  if (!data) return [];
  return (data as UserAchievement[]).map((a) => {
    const match = a.achievement_id.match(/achievement-(\d+)/);
    return {
      index: match ? parseInt(match[1]) : 0,
      earned_at: a.earned_at,
    };
  });
}

// ── Profile ─────────────────────────────────────────────────────────────────

export interface ProfileLocal {
  fullName: string;
  username: string;
  country: string;
  timezone: string;
  avatarUrl: string | null;
  language?: string;
  colorPreset?: string;
  fontPreset?: string;
  prayerLocation?: Record<string, unknown>;
}

export async function saveProfile(userId: string, profile: ProfileLocal) {
  const supabase = getSupabase();
  if (!supabase) return;
  const { error } = await supabase.from("users").upsert({
    id: userId,
    full_name: profile.fullName,
    username: profile.username,
    country: profile.country,
    timezone: profile.timezone,
    avatar_url: profile.avatarUrl,
    language: profile.language || "en",
    color_preset: profile.colorPreset || "madinah-green",
    font_preset: profile.fontPreset || "amiri-classic",
    prayer_location: profile.prayerLocation || null,
  }, { onConflict: "id" });
  if (error) console.warn("saveProfile:", error.message);
}

export async function loadProfile(userId: string): Promise<ProfileLocal | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const data = await safeQuery(
    supabase.from("users").select("*").eq("id", userId).maybeSingle()
  );
  if (!data) return null;
  const p = data as {
    full_name?: string;
    username?: string;
    country?: string;
    timezone?: string;
    avatar_url?: string;
    language?: string;
    color_preset?: string;
    font_preset?: string;
    prayer_location?: Record<string, unknown>;
  };
  return {
    fullName: p.full_name || "",
    username: p.username || "",
    country: p.country || "",
    timezone: p.timezone || "UTC",
    avatarUrl: p.avatar_url || null,
    language: p.language,
    colorPreset: p.color_preset,
    fontPreset: p.font_preset,
    prayerLocation: p.prayer_location,
  };
}

// ── Daily Checkins ──────────────────────────────────────────────────────────

export interface DailyCheckinLocal {
  [date: string]: boolean;
}

export async function saveDailyCheckins(userId: string, checkins: DailyCheckinLocal) {
  const supabase = getSupabase();
  if (!supabase) return;
  const dbCheckins = Object.keys(checkins)
    .filter((date) => checkins[date])
    .map((date) => ({
      id: genId(),
      user_id: userId,
      checkin_date: date,
    }));
  if (dbCheckins.length > 0) {
    const { error: delErr } = await supabase.from("daily_checkins").delete().eq("user_id", userId);
    if (delErr) console.warn("saveDailyCheckins delete:", delErr.message);
    const { error } = await supabase.from("daily_checkins").insert(dbCheckins);
    if (error) console.warn("saveDailyCheckins insert:", error.message);
  }
}

export async function loadDailyCheckins(userId: string): Promise<DailyCheckinLocal> {
  const supabase = getSupabase();
  if (!supabase) return {};
  const data = await safeQuery(
    supabase.from("daily_checkins").select("*").eq("user_id", userId)
  );
  if (!data) return {};
  const checkins: DailyCheckinLocal = {};
  for (const c of data as DailyCheckin[]) {
    checkins[c.checkin_date] = true;
  }
  return checkins;
}

// ── Load all data ───────────────────────────────────────────────────────────

export async function loadAllData(userId: string) {
  const empty = {
    prayers: [] as PrayerLog[],
    dhikr: [] as DhikrSession[],
    tasks: [] as Task[],
    journal: [] as JournalEntry[],
    conversations: [] as AIConversation[],
    messages: [] as AIMessage[],
    streak: null as NoPornStreak | null,
    relapses: [] as unknown[],
    achievements: [] as UserAchievement[],
    profile: null as ProfileLocal | null,
    dailyCheckins: [] as DailyCheckin[],
  };

  const supabase = getSupabase();
  if (!supabase) return empty;

  const [prayers, dhikr, tasks, journal, conversations, streakResult, achievements, profile, checkins] =
    await Promise.all([
      safeQuery(supabase.from("prayer_logs").select("*").eq("user_id", userId)),
      safeQuery(supabase.from("dhikr_sessions").select("*").eq("user_id", userId)),
      safeQuery(supabase.from("tasks").select("*").eq("user_id", userId)),
      safeQuery(supabase.from("journal_entries").select("*").eq("user_id", userId)),
      safeQuery(supabase.from("ai_conversations").select("*").eq("user_id", userId)),
      safeQuery(supabase.from("no_porn_streaks").select("*").eq("user_id", userId).maybeSingle()),
      safeQuery(supabase.from("user_achievements").select("*").eq("user_id", userId)),
      safeQuery(supabase.from("users").select("*").eq("id", userId).maybeSingle()),
      safeQuery(supabase.from("daily_checkins").select("*").eq("user_id", userId)),
    ]);

  const convList = Array.isArray(conversations) ? conversations : conversations ? [conversations] : [];
  const convIds = (convList as AIConversation[]).map((c) => c.id);
  let messages: AIMessage[] = [];
  if (convIds.length > 0) {
    const msgResult = await safeQuery(supabase.from("ai_messages").select("*").in("conversation_id", convIds));
    messages = (msgResult as AIMessage[] | null) || [];
  }

  return {
    prayers: (prayers as PrayerLog[]) || [],
    dhikr: (dhikr as DhikrSession[]) || [],
    tasks: (tasks as Task[]) || [],
    journal: (journal as JournalEntry[]) || [],
    conversations: (convList as AIConversation[]) || [],
    messages,
    streak: (streakResult as NoPornStreak | null) || null,
    relapses: [],
    achievements: (achievements as UserAchievement[]) || [],
    profile: profile as ProfileLocal | null,
    dailyCheckins: (checkins as DailyCheckin[]) || [],
  };
}

export function isOnline(): boolean {
  return typeof navigator !== "undefined" ? navigator.onLine : true;
}
