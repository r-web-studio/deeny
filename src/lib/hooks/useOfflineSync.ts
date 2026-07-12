'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import {
  processSyncQueue,
  loadAllData,
  mergePrayerHistory,
  mergeDhikrSessions,
  mergeTasks,
  mergeJournalEntries,
  mergeAIConversations,
  mergeStreak,
  mergeDailyCheckins,
  saveProfile,
  savePrayerHistory,
  saveDhikrSessions,
  saveTasks,
  saveJournalEntries,
  saveAIConversations,
  saveStreak,
  saveDailyCheckins,
  loadPrayerHistory,
  loadDhikrSessions,
  loadTasks,
  loadJournalEntries,
  loadAIConversations,
  loadStreak,
  loadAchievements,
  loadProfile,
  loadDailyCheckins,
  isOnline as checkOnline,
} from '@/lib/sync/data-sync';
import { useUserStore } from '@/lib/stores/user-store';

const SYNC_INTERVAL = 30000;

export function useOfflineSync() {
  const [online, setOnline] = useState<boolean>(checkOnline());
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);
  const [synced, setSynced] = useState<boolean>(false);
  const hasMergedRef = useRef(false);

  const syncQueue = useCallback(async () => {
    if (!checkOnline()) return;
    try {
      const remaining = await processSyncQueue();
      setPendingSyncCount(remaining);
    } catch (err) {
      console.error('Sync queue failed:', err);
      // Don't spam toasts for sync failures
    }
  }, []);

  const loadAndMerge = useCallback(async () => {
    if (hasMergedRef.current) return;
    hasMergedRef.current = true;

    let supabase;
    try {
      supabase = createClient();
    } catch (err) {
      console.error('Failed to create Supabase client:', err);
      setSynced(true);
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setSynced(true);
      return;
    }

    try {
      const remote = await loadAllData(user.id);

      // Check if all remote data is empty (Supabase may be suspended)
      const isAllEmpty = !remote.prayers.length && !remote.dhikr.length && !remote.tasks.length
        && !remote.journal.length && !remote.conversations.length && !remote.streak
        && !remote.achievements.length && !remote.profile && !Object.keys(remote.dailyCheckins).length;

      if (isAllEmpty && (localStorage.getItem('deenflow-prayer-history') || localStorage.getItem('deenflow-tasks'))) {
        toast.error('Our service is temporarily unavailable. Your local data is safe.', { duration: 6000 });
      }

      const localPrayers = loadPrayerHistory();
      const mergedPrayers = mergePrayerHistory(localPrayers, remote.prayers);
      saveToLS('deenflow-prayer-history', mergedPrayers);
      await savePrayerHistory(user.id, mergedPrayers);

      const localDhikr = loadDhikrSessions();
      const mergedDhikr = mergeDhikrSessions(localDhikr, remote.dhikr);
      saveToLS('deenflow-dhikr-sessions', mergedDhikr);
      await saveDhikrSessions(user.id, mergedDhikr);

      const localTasks = loadTasks();
      const mergedTasks = mergeTasks(localTasks, remote.tasks);
      saveToLS('deenflow-tasks', mergedTasks);
      await saveTasks(user.id, mergedTasks);

      const localJournal = loadJournalEntries();
      const mergedJournal = mergeJournalEntries(localJournal, remote.journal);
      saveToLS('deenflow-journal', mergedJournal);
      await saveJournalEntries(user.id, mergedJournal);

      const localConvo = loadAIConversations();
      const mergedConvo = mergeAIConversations(localConvo, remote.conversations, remote.messages);
      saveToLS('deenflow-ai-conversations', mergedConvo);
      await saveAIConversations(user.id, mergedConvo);

      const localStreak = loadStreak();
      const mergedStreak = mergeStreak(localStreak, remote.streak);
      if (mergedStreak) {
        saveToLS('deenflow-streak', mergedStreak);
        await saveStreak(user.id, mergedStreak);
      }

      const localCheckins = loadDailyCheckins();
      const mergedCheckins = mergeDailyCheckins(localCheckins, remote.dailyCheckins);
      saveToLS('deenflow-daily-checkins', mergedCheckins);
      await saveDailyCheckins(user.id, mergedCheckins);

      const localAchievements = loadAchievements();
      saveToLS('deenflow-achievements', localAchievements);

      const localProfile = loadProfile();
      if (remote.profile) {
        const remoteProfile = {
          fullName: remote.profile.full_name || localProfile?.fullName || '',
          username: remote.profile.username || localProfile?.username || '',
          country: remote.profile.country || localProfile?.country || '',
          timezone: remote.profile.timezone || localProfile?.timezone || 'UTC',
          avatarUrl: remote.profile.avatar_url || localProfile?.avatarUrl || null,
          language: remote.profile.language || localProfile?.language || 'en',
          colorPreset: remote.profile.color_preset || localProfile?.colorPreset || 'madinah-green',
          fontPreset: remote.profile.font_preset || localProfile?.fontPreset || 'amiri-classic',
          prayerLocation: remote.profile.prayer_location || localProfile?.prayerLocation || null,
        };
        saveToLS('deenflow-profile', remoteProfile);
        useUserStore.getState().setUser({
          fullName: remoteProfile.fullName,
          email: user.email || '',
          username: remoteProfile.username,
          avatarUrl: remoteProfile.avatarUrl,
          country: remoteProfile.country,
          timezone: remoteProfile.timezone,
        });
        // Sync language, color, font from remote profile to localStorage
        if (remoteProfile.language) {
          const currentLang = localStorage.getItem('deenflow-locale');
          if (currentLang !== remoteProfile.language) {
            localStorage.setItem('deenflow-locale', remoteProfile.language);
          }
        }
        if (remoteProfile.colorPreset) {
          localStorage.setItem('deenflow-colors', remoteProfile.colorPreset);
        }
        if (remoteProfile.fontPreset) {
          localStorage.setItem('deenflow-fonts', remoteProfile.fontPreset);
        }
        if (remoteProfile.prayerLocation) {
          localStorage.setItem('deenflow-prayer-location', JSON.stringify(remoteProfile.prayerLocation));
          const loc = remoteProfile.prayerLocation as Record<string, string>;
          if (loc.countryId) {
            localStorage.setItem('deenflow-selected-country', loc.countryId);
          }
        }
      } else if (localProfile) {
        saveProfile(user.id, localProfile);
      }

      setSynced(true);
      await syncQueue();
    } catch (err) {
      console.error('Load and merge failed:', err);
      const errMsg = err instanceof Error ? err.message : String(err);
      if (errMsg.includes("suspend") || errMsg.includes("pause") || errMsg.includes("503") || errMsg.includes("Service Unavailable")) {
        toast.error('Our service is temporarily unavailable. Your local data is safe.', { duration: 6000 });
      } else {
        toast.error('Cloud sync unavailable. Working with local data.', { duration: 4000 });
      }
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

function saveToLS(key: string, data: unknown) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
}
