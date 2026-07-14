const DB_NAME = 'deenflow-offline';
const DB_VERSION = 1;

export interface DhikrSession {
  id: string;
  userId: string;
  dhikrName: string;
  count: number;
  date: string;
  syncedAt?: string;
}

export interface JournalEntry {
  id: string;
  userId: string;
  content: string;
  mood?: string;
  tags?: string[];
  date: string;
  syncedAt?: string;
}

export interface SyncQueueItem {
  id: string;
  type: 'dhikr' | 'journal' | 'prayer';
  data: object;
  createdAt: string;
}

// ─── Database ───────────────────────────────────────────────────────────────

export function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains('dhikr-sessions')) {
        const store = db.createObjectStore('dhikr-sessions', { keyPath: 'id' });
        store.createIndex('userId', 'userId', { unique: false });
        store.createIndex('date', 'date', { unique: false });
      }

      if (!db.objectStoreNames.contains('journal-entries')) {
        const store = db.createObjectStore('journal-entries', { keyPath: 'id' });
        store.createIndex('userId', 'userId', { unique: false });
        store.createIndex('date', 'date', { unique: false });
      }

      if (!db.objectStoreNames.contains('prayer-logs')) {
        const store = db.createObjectStore('prayer-logs', { keyPath: 'id' });
        store.createIndex('userId', 'userId', { unique: false });
        store.createIndex('date', 'date', { unique: false });
      }

      if (!db.objectStoreNames.contains('sync-queue')) {
        db.createObjectStore('sync-queue', { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
      console.error('Failed to open IndexedDB:', request.error);
      reject(request.error);
    };
  });
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function txStore(
  db: IDBDatabase,
  storeName: string,
  mode: IDBTransactionMode = 'readonly'
): IDBObjectStore {
  const tx = db.transaction(storeName, mode);
  return tx.objectStore(storeName);
}

function getAll<T>(store: IDBObjectStore): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result as T[]);
    request.onerror = () => {
      console.error('getAll error:', request.error);
      reject(request.error);
    };
  });
}

function getAllByIndex<T>(
  store: IDBObjectStore,
  indexName: string,
  query: IDBKeyRange | IDBValidKey
): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const index = store.index(indexName);
    const request = index.getAll(query);
    request.onsuccess = () => resolve(request.result as T[]);
    request.onerror = () => {
      console.error('getAllByIndex error:', request.error);
      reject(request.error);
    };
  });
}

function put<T>(store: IDBObjectStore, value: T): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = store.put(value);
    request.onsuccess = () => resolve();
    request.onerror = () => {
      console.error('put error:', request.error);
      reject(request.error);
    };
  });
}

function remove(store: IDBObjectStore, key: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = store.delete(key);
    request.onsuccess = () => resolve();
    request.onerror = () => {
      console.error('remove error:', request.error);
      reject(request.error);
    };
  });
}

// ─── Dhikr Sessions ─────────────────────────────────────────────────────────

export async function saveDhikrSession(session: DhikrSession): Promise<void> {
  try {
    const db = await openDB();
    const store = txStore(db, 'dhikr-sessions', 'readwrite');
    await put(store, session);

    if (session.userId) {
      const syncStore = txStore(db, 'sync-queue', 'readwrite');
      await put(syncStore, {
        id: `dhikr-${session.id}`,
        type: 'dhikr' as const,
        data: session,
        createdAt: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.error('saveDhikrSession failed:', err);
    throw err;
  }
}

export async function getDhikrSessions(
  userId: string,
  date?: string
): Promise<DhikrSession[]> {
  try {
    const db = await openDB();
    const store = txStore(db, 'dhikr-sessions');

    if (date) {
      const sessions = await getAllByIndex<DhikrSession>(store, 'userId', userId);
      return sessions.filter((s) => s.date === date);
    }

    return getAllByIndex<DhikrSession>(store, 'userId', userId);
  } catch (err) {
    console.error('getDhikrSessions failed:', err);
    return [];
  }
}

// ─── Journal Entries ────────────────────────────────────────────────────────

export async function saveJournalEntry(entry: JournalEntry): Promise<void> {
  try {
    const db = await openDB();
    const store = txStore(db, 'journal-entries', 'readwrite');
    await put(store, entry);

    if (entry.userId) {
      const syncStore = txStore(db, 'sync-queue', 'readwrite');
      await put(syncStore, {
        id: `journal-${entry.id}`,
        type: 'journal' as const,
        data: entry,
        createdAt: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.error('saveJournalEntry failed:', err);
    throw err;
  }
}

export async function getJournalEntries(
  userId: string
): Promise<JournalEntry[]> {
  try {
    const db = await openDB();
    const store = txStore(db, 'journal-entries');
    return getAllByIndex<JournalEntry>(store, 'userId', userId);
  } catch (err) {
    console.error('getJournalEntries failed:', err);
    return [];
  }
}

// ─── Sync Queue ─────────────────────────────────────────────────────────────

export async function getSyncQueue(): Promise<SyncQueueItem[]> {
  try {
    const db = await openDB();
    const store = txStore(db, 'sync-queue');
    return getAll<SyncQueueItem>(store);
  } catch (err) {
    console.error('getSyncQueue failed:', err);
    return [];
  }
}

export async function clearSyncedItems(ids: string[]): Promise<void> {
  try {
    const db = await openDB();
    const store = txStore(db, 'sync-queue', 'readwrite');
    await Promise.all(ids.map((id) => remove(store, id)));
  } catch (err) {
    console.error('clearSyncedItems failed:', err);
    throw err;
  }
}

// ─── Utility ────────────────────────────────────────────────────────────────

export function isOnline(): boolean {
  if (typeof navigator === "undefined") return true;
  return navigator.onLine;
}
