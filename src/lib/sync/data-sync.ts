import { createClient } from "@/lib/supabase/client";
import type {
  AllUserData,
  PrayerLog,
  DhikrSession,
  Task,
  JournalEntry,
  AIConversation,
  AIMessage,
  NoPornStreak,
  Relapse,
  UserAchievement,
  UserProfile,
  SyncQueueItem,
  SyncQueueItemType,
} from "./types";

const DB_NAME = "deenflow-sync";
const DB_VERSION = 1;
const SYNC_QUEUE_STORE = "sync-queue";

function openSyncDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(SYNC_QUEUE_STORE)) {
        db.createObjectStore(SYNC_QUEUE_STORE, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function addToSyncQueue(item: SyncQueueItem): Promise<void> {
  try {
    const db = await openSyncDB();
    const tx = db.transaction(SYNC_QUEUE_STORE, "readwrite");
    tx.objectStore(SYNC_QUEUE_STORE).put(item);
  } catch (err) {
    console.error("Failed to add to sync queue:", err);
  }
}

export async function getSyncQueue(): Promise<SyncQueueItem[]> {
  try {
    const db = await openSyncDB();
    const tx = db.transaction(SYNC_QUEUE_STORE, "readonly");
    const request = tx.objectStore(SYNC_QUEUE_STORE).getAll();
    return new Promise((resolve) => {
      request.onsuccess = () => resolve(request.result as SyncQueueItem[]);
      request.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

export async function clearSyncQueue(ids: string[]): Promise<void> {
  try {
    const db = await openSyncDB();
    const tx = db.transaction(SYNC_QUEUE_STORE, "readwrite");
    const store = tx.objectStore(SYNC_QUEUE_STORE);
    await Promise.all(ids.map((id) => store.delete(id)));
  } catch (err) {
    console.error("Failed to clear sync queue:", err);
  }
}

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

// ── Load all data from Supabase ─────────────────────────────────────────────

export async function loadAllData(userId: string): Promise<AllUserData> {
  const supabase = getSupabase();
  if (!supabase) {
    return {
      prayers: [], dhikr: [], tasks: [], journal: [], conversations: [],
      messages: [], streak: null, relapses: [], achievements: [], profile: null,
    };
  }

  const [prayers, dhikr, tasks, journal, conversations, streakResult, relapses, achievements, profile] =
    await Promise.all([
      supabase.from("prayer_logs").select("*").eq("user_id", userId),
      supabase.from("dhikr_sessions").select("*").eq("user_id", userId),
      supabase.from("tasks").select("*").eq("user_id", userId),
      supabase.from("journal_entries").select("*").eq("user_id", userId),
      supabase.from("ai_conversations").select("*").eq("user_id", userId),
      supabase.from("no_porn_streaks").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("relapses").select("*").eq("user_id", userId),
      supabase.from("user_achievements").select("*").eq("user_id", userId),
      supabase.from("users").select("*").eq("id", userId).maybeSingle(),
    ]);

  const convIds = (conversations.data || []).map((c: AIConversation) => c.id);
  let messages: AIMessage[] = [];
  if (convIds.length > 0) {
    const msgResult = await supabase.from("ai_messages").select("*").in("conversation_id", convIds);
    messages = msgResult.data || [];
  }

  return {
    prayers: prayers.data || [],
    dhikr: dhikr.data || [],
    tasks: tasks.data || [],
    journal: journal.data || [],
    conversations: conversations.data || [],
    messages,
    streak: streakResult.data || null,
    relapses: relapses.data || [],
    achievements: achievements.data || [],
    profile: profile.data || null,
  };
}

// ── Save helpers (localStorage + queue for Supabase) ────────────────────────

function saveToLocalStorage<T>(key: string, data: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(data));
}

function getFromLocalStorage<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

async function queueAndSave<T>(
  localStorageKey: string,
  supabaseTable: SyncQueueItemType,
  userId: string,
  data: T,
  action: "upsert" | "delete" = "upsert"
) {
  saveToLocalStorage(localStorageKey, data);
  await addToSyncQueue({
    id: `${supabaseTable}-${genId()}`,
    type: supabaseTable,
    data: { items: data, user_id: userId },
    action,
    createdAt: new Date().toISOString(),
  });
}

// ── Prayers ─────────────────────────────────────────────────────────────────

export interface PrayerHistory {
  [date: string]: { [prayer: string]: string | undefined };
}

export async function savePrayerHistory(userId: string, history: PrayerHistory) {
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
  await queueAndSave("deenflow-prayer-history", "prayer_logs", userId, logs);
}

export function loadPrayerHistory(): PrayerHistory {
  return getFromLocalStorage<PrayerHistory>("deenflow-prayer-history") || {};
}

export function mergePrayerHistory(local: PrayerHistory, remote: PrayerLog[]): PrayerHistory {
  const merged = { ...local };
  for (const log of remote) {
    if (!merged[log.date]) merged[log.date] = {};
    const existing = merged[log.date][log.prayer];
    if (!existing) {
      merged[log.date][log.prayer] = log.status;
    }
  }
  return merged;
}

// ── Dhikr ───────────────────────────────────────────────────────────────────

export interface DhikrSessionLocal {
  dhikr_type: string;
  count: number;
  target: number;
  date: string;
  timestamp: number;
}

export async function saveDhikrSessions(userId: string, sessions: DhikrSessionLocal[]) {
  const dbSessions: DhikrSession[] = sessions.map((s) => ({
    id: genId(),
    user_id: userId,
    dhikr_type: s.dhikr_type,
    count: s.count,
    target: s.target,
    date: s.date,
  }));
  await queueAndSave("deenflow-dhikr-sessions", "dhikr_sessions", userId, dbSessions);
}

export function loadDhikrSessions(): DhikrSessionLocal[] {
  return getFromLocalStorage<DhikrSessionLocal[]>("deenflow-dhikr-sessions") || [];
}

export function mergeDhikrSessions(local: DhikrSessionLocal[], remote: DhikrSession[]): DhikrSessionLocal[] {
  if (remote.length === 0) return local;
  const remoteMapped: DhikrSessionLocal[] = remote.map((r) => ({
    dhikr_type: r.dhikr_type,
    count: r.count,
    target: r.target,
    date: r.date,
    timestamp: new Date(r.date).getTime(),
  }));
  const all = [...local, ...remoteMapped];
  const seen = new Set<string>();
  const merged: DhikrSessionLocal[] = [];
  for (const s of all) {
    const key = `${s.dhikr_type}-${s.date}-${s.count}`;
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(s);
    }
  }
  return merged.sort((a, b) => b.timestamp - a.timestamp);
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
  const dbTasks: Task[] = tasks.map((t) => ({
    id: t.id,
    user_id: userId,
    title: t.title,
    priority: t.priority,
    due_date: t.due_date || undefined,
    completed: t.completed,
  }));
  await queueAndSave("deenflow-tasks", "tasks", userId, dbTasks);
}

export function loadTasks(): TaskLocal[] {
  return getFromLocalStorage<TaskLocal[]>("deenflow-tasks") || [];
}

export function mergeTasks(local: TaskLocal[], remote: Task[]): TaskLocal[] {
  if (remote.length === 0) return local;
  const remoteMapped: TaskLocal[] = remote.map((r) => ({
    id: r.id,
    title: r.title,
    priority: r.priority,
    category: "Personal",
    due_date: r.due_date || null,
    completed: r.completed,
    created_at: new Date().toISOString(),
  }));
  const byId = new Map<string, TaskLocal>();
  for (const t of [...local, ...remoteMapped]) {
    const existing = byId.get(t.id);
    if (!existing) {
      byId.set(t.id, t);
    }
  }
  return Array.from(byId.values());
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
  const dbEntries: JournalEntry[] = entries.map((e) => ({
    id: e.id,
    user_id: userId,
    title: e.title,
    content: e.content,
    mood: e.mood,
    tags: e.tags,
    date: e.date,
  }));
  await queueAndSave("deenflow-journal", "journal_entries", userId, dbEntries);
}

export function loadJournalEntries(): JournalEntryLocal[] {
  return getFromLocalStorage<JournalEntryLocal[]>("deenflow-journal") || [];
}

export function mergeJournalEntries(local: JournalEntryLocal[], remote: JournalEntry[]): JournalEntryLocal[] {
  if (remote.length === 0) return local;
  const remoteMapped: JournalEntryLocal[] = remote.map((r) => ({
    id: r.id,
    title: r.title,
    content: r.content,
    mood: r.mood || "",
    tags: r.tags || [],
    date: r.date,
  }));
  const byId = new Map<string, JournalEntryLocal>();
  for (const e of [...local, ...remoteMapped]) {
    const existing = byId.get(e.id);
    if (!existing) {
      byId.set(e.id, e);
    }
  }
  return Array.from(byId.values());
}

// ── AI Conversations ────────────────────────────────────────────────────────

export interface AIConversationLocal {
  id: string;
  title: string;
  messages: { role: string; content: string }[];
  created_at: string;
}

export async function saveAIConversations(userId: string, convos: AIConversationLocal[]) {
  const dbConvos: AIConversation[] = convos.map((c) => ({
    id: c.id,
    user_id: userId,
    title: c.title,
  }));
  const dbMessages: AIMessage[] = [];
  for (const c of convos) {
    for (const m of c.messages) {
      dbMessages.push({
        id: genId(),
        conversation_id: c.id,
        role: m.role,
        content: m.content,
      });
    }
  }
  await queueAndSave("deenflow-ai-conversations", "ai_conversations", userId, { convos: dbConvos, messages: dbMessages });
}

export function loadAIConversations(): AIConversationLocal[] {
  return getFromLocalStorage<AIConversationLocal[]>("deenflow-ai-conversations") || [];
}

export function mergeAIConversations(local: AIConversationLocal[], remoteConvo: AIConversation[], remoteMsgs: AIMessage[]): AIConversationLocal[] {
  if (remoteConvo.length === 0) return local;
  const msgByConvo = new Map<string, { role: string; content: string }[]>();
  for (const m of remoteMsgs) {
    const arr = msgByConvo.get(m.conversation_id) || [];
    arr.push({ role: m.role, content: m.content });
    msgByConvo.set(m.conversation_id, arr);
  }
  const remoteMapped: AIConversationLocal[] = remoteConvo.map((c) => ({
    id: c.id,
    title: c.title,
    messages: msgByConvo.get(c.id) || [],
    created_at: new Date().toISOString(),
  }));
  const byId = new Map<string, AIConversationLocal>();
  for (const c of [...local, ...remoteMapped]) {
    const existing = byId.get(c.id);
    if (!existing || c.messages.length > existing.messages.length) {
      byId.set(c.id, c);
    }
  }
  return Array.from(byId.values());
}

// ── Streak ──────────────────────────────────────────────────────────────────

export interface StreakLocal {
  currentStreak: number;
  longestStreak: number;
  relapses: { date: string; note: string }[];
  startDate: string;
}

export async function saveStreak(userId: string, streak: StreakLocal) {
  const dbStreak: NoPornStreak = {
    id: genId(),
    user_id: userId,
    current_streak: streak.currentStreak,
    longest_streak: streak.longestStreak,
    total_relapses: streak.relapses.length,
    start_date: streak.startDate,
    last_check_date: new Date().toISOString().slice(0, 10),
  };
  await queueAndSave("deenflow-streak", "no_porn_streaks", userId, dbStreak);
}

export function loadStreak(): StreakLocal | null {
  return getFromLocalStorage<StreakLocal>("deenflow-streak");
}

export function mergeStreak(local: StreakLocal | null, remote: NoPornStreak | null): StreakLocal | null {
  if (!remote) return local;
  if (!local) {
    return {
      currentStreak: remote.current_streak,
      longestStreak: remote.longest_streak,
      relapses: [],
      startDate: remote.start_date,
    };
  }
  const newer = local.startDate < remote.start_date;
  return {
    currentStreak: newer ? remote.current_streak : local.currentStreak,
    longestStreak: Math.max(remote.longest_streak, local.longestStreak),
    relapses: local.relapses,
    startDate: local.startDate,
  };
}

// ── Achievements ────────────────────────────────────────────────────────────

export interface AchievementLocal {
  index: number;
  earned_at: string;
}

export async function saveAchievements(userId: string, earned: AchievementLocal[]) {
  await queueAndSave("deenflow-achievements", "user_achievements", userId, earned);
}

export function loadAchievements(): AchievementLocal[] {
  return getFromLocalStorage<AchievementLocal[]>("deenflow-achievements") || [];
}

// ── Profile ─────────────────────────────────────────────────────────────────

export interface ProfileLocal {
  fullName: string;
  username: string;
  country: string;
  timezone: string;
  avatarUrl: string | null;
}

export async function saveProfile(userId: string, profile: ProfileLocal) {
  await queueAndSave("deenflow-profile", "users", userId, {
    id: userId,
    full_name: profile.fullName,
    username: profile.username,
    country: profile.country,
    timezone: profile.timezone,
    avatar_url: profile.avatarUrl,
  });
}

export function loadProfile(): ProfileLocal | null {
  return getFromLocalStorage<ProfileLocal>("deenflow-profile");
}

// ── Sync Queue Processing ───────────────────────────────────────────────────

export async function processSyncQueue(): Promise<number> {
  const supabase = getSupabase();
  if (!supabase) return 0;

  const queue = await getSyncQueue();
  if (queue.length === 0) return 0;

  const syncedIds: string[] = [];

  for (const item of queue) {
    try {
      switch (item.type) {
        case "prayer_logs": {
          const items = item.data.items as PrayerLog[];
          if (items.length > 0) {
            await supabase.from("prayer_logs").upsert(items, { onConflict: "id" });
          }
          break;
        }
        case "dhikr_sessions": {
          const items = item.data.items as DhikrSession[];
          if (items.length > 0) {
            await supabase.from("dhikr_sessions").upsert(items, { onConflict: "id" });
          }
          break;
        }
        case "tasks": {
          const items = item.data.items as Task[];
          if (items.length > 0) {
            await supabase.from("tasks").upsert(items, { onConflict: "id" });
          }
          break;
        }
        case "journal_entries": {
          const items = item.data.items as JournalEntry[];
          if (items.length > 0) {
            await supabase.from("journal_entries").upsert(items, { onConflict: "id" });
          }
          break;
        }
        case "ai_conversations": {
          const data = item.data.items as { convos: AIConversation[]; messages: AIMessage[] };
          if (data.convos.length > 0) {
            await supabase.from("ai_conversations").upsert(data.convos, { onConflict: "id" });
          }
          if (data.messages.length > 0) {
            await supabase.from("ai_messages").upsert(data.messages, { onConflict: "id" });
          }
          break;
        }
        case "no_porn_streaks": {
          const streak = item.data.items as NoPornStreak;
          await supabase.from("no_porn_streaks").upsert(streak, { onConflict: "id" });
          break;
        }
        case "user_achievements": {
          const localItems = item.data.items as { index: number; earned_at: string }[];
          const userId = item.data.user_id as string;
          if (localItems.length > 0) {
            const rows: UserAchievement[] = localItems.map((a) => ({
              id: `${userId}-${a.index}`,
              user_id: userId,
              achievement_id: String(a.index),
              earned_at: a.earned_at,
            }));
            await supabase.from("user_achievements").upsert(rows, { onConflict: "id" });
          }
          break;
        }
        case "users": {
          const profile = item.data.items as Record<string, unknown>;
          if (profile.id) {
            await supabase.from("users").upsert(profile, { onConflict: "id" });
          }
          break;
        }
      }
      syncedIds.push(item.id);
    } catch (err) {
      console.error(`Failed to sync ${item.type}:`, err);
    }
  }

  if (syncedIds.length > 0) {
    await clearSyncQueue(syncedIds);
  }

  return queue.length - syncedIds.length;
}

export function isOnline(): boolean {
  return typeof navigator !== "undefined" ? navigator.onLine : true;
}
