'use client';

import { useOfflineSync } from '@/lib/hooks/useOfflineSync';

export function SyncProvider({ children }: { children: React.ReactNode }) {
  useOfflineSync();
  return <>{children}</>;
}
