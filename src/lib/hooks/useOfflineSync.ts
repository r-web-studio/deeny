'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  processSyncQueue,
  loadAllData,
  mergePrayerHistory,
  mergeDhikrSessions,
  mergeTasks,
  mergeJournalEntries,
  mergeAIConversations,
  mergeStreak,
  savePrayerHistory,
  saveDhikrSessions,
  saveTasks,
  saveJournalEntries,
  saveAIConversations,
  saveStreak,
  saveAchievements,
  saveProfile,
  loadPrayerHistory,
  loadDhikrSessions,
  loadTasks,
  loadJournalEntries,
  loadAIConversations,
  loadStreak,
  loadAchievements,
  loadProfile,
  isOnline as checkOnline,
  type PrayerHistory,
  type DhikrSessionLocal,
  type TaskLocal,
  type JournalEntryLocal,
  type AIConversationLocal,
  type StreakLocal,
  type AchievementLocal,
  type ProfileLocal,
} from '@/lib/sync/data-sync';

const SYNC_INTERVAL = 30000;

export function useOfflineSync() {
  const [online, setOnline] = useState<boolean>(checkOnline());
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);
  const [synced, setSynced] = useState<boolean>(false);

  const syncQueue = useCallback(async () => {
    if (!checkOnline()) return;
    try {
      const remaining = await processSyncQueue();
      setPendingSyncCount(remaining);
    } catch (err) {
      console.error('Sync queue failed:', err);
    }
  }, []);

  const loadAndMerge = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setSynced(true);
      return;
    }

    try {
      const remote = await loadAllData(user.id);

      const localPrayers = loadPrayerHistory();
      const mergedPrayers = mergePrayerHistory(localPrayers, remote.prayers);
      savePrayerHistory(user.id, mergedPrayers);

      const localDhikr = loadDhikrSessions();
      const mergedDhikr = mergeDhikrSessions(localDhikr, remote.dhikr);
      saveDhikrSessions(user.id, mergedDhikr);

      const localTasks = loadTasks();
      const mergedTasks = mergeTasks(localTasks, remote.tasks);
      saveTasks(user.id, mergedTasks);

      const localJournal = loadJournalEntries();
      const mergedJournal = mergeJournalEntries(localJournal, remote.journal);
      saveJournalEntries(user.id, mergedJournal);

      const localConvo = loadAIConversations();
      const mergedConvo = mergeAIConversations(localConvo, remote.conversations, remote.messages);
      saveAIConversations(user.id, mergedConvo);

      const localStreak = loadStreak();
      const mergedStreak = mergeStreak(localStreak, remote.streak);
      if (mergedStreak) saveStreak(user.id, mergedStreak);

      const localAchievements = loadAchievements();
      saveAchievements(user.id, localAchievements);

      const localProfile = loadProfile();
      if (localProfile) saveProfile(user.id, localProfile);

      localStorage.setItem('deenflow-prayer-history', JSON.stringify(mergedPrayers));
      localStorage.setItem('deenflow-dhikr-sessions', JSON.stringify(mergedDhikr));
      localStorage.setItem('deenflow-tasks', JSON.stringify(mergedTasks));
      localStorage.setItem('deenflow-journal', JSON.stringify(mergedJournal));
      localStorage.setItem('deenflow-ai-conversations', JSON.stringify(mergedConvo));
      if (mergedStreak) localStorage.setItem('deenflow-streak', JSON.stringify(mergedStreak));
      localStorage.setItem('deenflow-achievements', JSON.stringify(localAchievements));

      setSynced(true);
      await syncQueue();
    } catch (err) {
      console.error('Load and merge failed:', err);
      setSynced(true);
    }
  }, [syncQueue]);

  useEffect(() => {
    loadAndMerge();
  }, [loadAndMerge]);

  useEffect(() => {
    const handleOnline = () => {
      setOnline(true);
      syncQueue();
    };
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const interval = setInterval(() => {
      if (checkOnline()) syncQueue();
    }, SYNC_INTERVAL);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [syncQueue]);

  return { isOnline: online, pendingSyncCount, synced };
}
