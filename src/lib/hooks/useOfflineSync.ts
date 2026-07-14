'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import {
  loadAllData,
  saveProfile,
  savePrayerHistory,
  saveDhikrSessions,
  saveTasks,
  saveJournalEntries,
  saveAIConversations,
  saveStreak,
  saveDailyCheckins,
  isOnline as checkOnline,
} from '@/lib/sync/data-sync';
import { useUserStore } from '@/lib/stores/user-store';

export function useOfflineSync() {
  const [online, setOnline] = useState<boolean>(checkOnline());
  const [synced, setSynced] = useState<boolean>(false);
  const cancelledRef = useRef(false);
  const hasLoadedRef = useRef(false);

  const loadFromSupabase = useCallback(async () => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    let supabase;
    try {
      supabase = createClient();
    } catch (err) {
      console.error('[Sync] Failed to create Supabase client:', err);
      if (!cancelledRef.current) setSynced(true);
      return;
    }

    let user;
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        console.log('[Sync] No user or auth error, skipping sync');
        if (!cancelledRef.current) setSynced(true);
        return;
      }
      user = data.user;
    } catch (err) {
      console.error('[Sync] Failed to get user:', err);
      if (!cancelledRef.current) setSynced(true);
      return;
    }

    console.log('[Sync] Loading data from Supabase for user:', user.id);

    try {
      const remote = await loadAllData(user.id);
      if (cancelledRef.current) return;

      console.log('[Sync] Remote data loaded:', {
        prayers: remote.prayers.length,
        dhikr: remote.dhikr.length,
        tasks: remote.tasks.length,
        journal: remote.journal.length,
        conversations: remote.conversations.length,
        profile: !!remote.profile,
        streak: !!remote.streak,
      });

      // Convert remote data to localStorage format so pages can still read it
      // Pages will be updated to read from Supabase directly, but this provides
      // backward compatibility during the transition
      const prayerHistory: Record<string, Record<string, string | undefined>> = {};
      for (const log of remote.prayers) {
        if (!prayerHistory[log.date]) prayerHistory[log.date] = {};
        prayerHistory[log.date][log.prayer] = log.status;
      }
      saveToLS('deenflow-prayer-history', prayerHistory);

      const dhikrSessions = remote.dhikr.map((s) => ({
        id: s.id,
        dhikr_type: s.dhikr_type,
        count: s.count,
        target: s.target,
        date: s.date,
        timestamp: new Date(s.date).getTime(),
      }));
      saveToLS('deenflow-dhikr-sessions', dhikrSessions);

      const tasks = remote.tasks.map((t) => ({
        id: t.id,
        title: t.title,
        priority: t.priority,
        category: 'Personal',
        due_date: t.due_date || null,
        completed: t.completed,
        created_at: new Date().toISOString(),
      }));
      saveToLS('deenflow-tasks', tasks);

      const journal = remote.journal.map((e) => ({
        id: e.id,
        title: e.title,
        content: e.content,
        mood: e.mood || '',
        tags: e.tags || [],
        date: e.date,
      }));
      saveToLS('deenflow-journal', journal);

      // Rebuild AI conversations with messages
      const convMap = new Map<string, { id: string; title: string; messages: { role: string; content: string }[]; created_at: string }>();
      for (const c of remote.conversations) {
        convMap.set(c.id, { id: c.id, title: c.title, messages: [], created_at: new Date().toISOString() });
      }
      for (const m of remote.messages) {
        const convo = convMap.get(m.conversation_id);
        if (convo) convo.messages.push({ role: m.role, content: m.content });
      }
      saveToLS('deenflow-ai-conversations', Array.from(convMap.values()));

      if (remote.streak) {
        saveToLS('deenflow-streak', {
          currentStreak: remote.streak.current_streak,
          longestStreak: remote.streak.longest_streak,
          relapses: [],
          startDate: remote.streak.start_date,
        });
      }

      const checkins: Record<string, boolean> = {};
      for (const c of remote.dailyCheckins) {
        checkins[c.checkin_date] = true;
      }
      saveToLS('deenflow-daily-checkins', checkins);

      const achievements = remote.achievements.map((a) => {
        const match = a.achievement_id.match(/achievement-(\d+)/);
        return { index: match ? parseInt(match[1]) : 0, earned_at: a.earned_at };
      });
      saveToLS('deenflow-achievements', achievements);

      if (remote.profile) {
        const profile = {
          fullName: remote.profile.fullName || '',
          username: remote.profile.username || '',
          country: remote.profile.country || '',
          timezone: remote.profile.timezone || 'UTC',
          avatarUrl: remote.profile.avatarUrl || null,
        };
        saveToLS('deenflow-profile', profile);
        useUserStore.getState().setUser({
          fullName: profile.fullName,
          email: user.email || '',
          username: profile.username,
          avatarUrl: profile.avatarUrl,
          country: profile.country,
          timezone: profile.timezone,
        });
        if (remote.profile.language) {
          const currentLang = localStorage.getItem('deenflow-locale');
          if (currentLang !== remote.profile.language) {
            localStorage.setItem('deenflow-locale', remote.profile.language);
          }
        }
        if (remote.profile.colorPreset) {
          localStorage.setItem('deenflow-colors', remote.profile.colorPreset);
        }
        if (remote.profile.fontPreset) {
          localStorage.setItem('deenflow-fonts', remote.profile.fontPreset);
        }
        if (remote.profile.prayerLocation) {
          localStorage.setItem('deenflow-prayer-location', JSON.stringify(remote.profile.prayerLocation));
          const loc = remote.profile.prayerLocation as Record<string, string>;
          if (loc.countryId) {
            localStorage.setItem('deenflow-selected-country', loc.countryId);
          }
        }
      }

      if (!cancelledRef.current) {
        setSynced(true);
      }
    } catch (err) {
      console.error('[Sync] Load from Supabase failed:', err);
      if (!cancelledRef.current) {
        setSynced(true);
        toast('Cloud sync unavailable. Working with local data.', { icon: '💾', duration: 4000 });
      }
    }
  }, []);

  useEffect(() => {
    cancelledRef.current = false;
    loadFromSupabase();
    return () => { cancelledRef.current = true; };
  }, [loadFromSupabase]);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline: online, synced };
}

function saveToLS(key: string, data: unknown) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn(`[Sync] Failed to save ${key} to localStorage:`, err);
  }
}
