'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  getSyncQueue,
  clearSyncedItems,
  isOnline as checkOnline,
} from '@/lib/offline-db';
import type { SyncQueueItem } from '@/lib/offline-db';

export function useOfflineSync() {
  const [online, setOnline] = useState<boolean>(checkOnline());
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);

  const syncItem = useCallback(async (item: SyncQueueItem) => {
    const supabase = createClient();

    switch (item.type) {
      case 'dhikr': {
        const { error } = await supabase
          .from('dhikr_sessions')
          .upsert(item.data, { onConflict: 'id' });
        if (error) throw error;
        break;
      }
      case 'journal': {
        const { error } = await supabase
          .from('journal_entries')
          .upsert(item.data, { onConflict: 'id' });
        if (error) throw error;
        break;
      }
      case 'prayer': {
        const { error } = await supabase
          .from('prayer_logs')
          .upsert(item.data, { onConflict: 'id' });
        if (error) throw error;
        break;
      }
      default:
        console.warn('Unknown sync type:', (item as any).type);
    }
  }, []);

  const syncAll = useCallback(async () => {
    try {
      const queue = await getSyncQueue();
      if (queue.length === 0) return;

      setPendingSyncCount(queue.length);

      const syncedIds: string[] = [];
      const errors: string[] = [];

      for (const item of queue) {
        try {
          await syncItem(item);
          syncedIds.push(item.id);
        } catch (err) {
          console.error(`Failed to sync item ${item.id}:`, err);
          errors.push(item.id);
        }
      }

      if (syncedIds.length > 0) {
        await clearSyncedItems(syncedIds);
      }

      const remaining = queue.length - syncedIds.length;
      setPendingSyncCount(remaining);

      if (errors.length > 0) {
        console.warn(`${errors.length} items failed to sync, will retry later`);
      } else {
        console.log(`Successfully synced ${syncedIds.length} items`);
      }
    } catch (err) {
      console.error('syncAll failed:', err);
    }
  }, [syncItem]);

  useEffect(() => {
    const handleOnline = () => {
      setOnline(true);
      syncAll();
    };

    const handleOffline = () => {
      setOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check pending count on mount and when coming online
    if (checkOnline()) {
      syncAll();
    } else {
      getSyncQueue().then((queue) => {
        setPendingSyncCount(queue.length);
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncAll]);

  return { isOnline: online, pendingSyncCount };
}
