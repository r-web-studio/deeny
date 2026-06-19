import { create } from "zustand";

interface UserProfile {
  fullName: string;
  email: string;
  username: string;
  avatarUrl: string | null;
  country: string | null;
  timezone: string;
}

interface UserStore {
  user: UserProfile | null;
  setUser: (user: UserProfile) => void;
  clearUser: () => void;
  loadUser: () => void;
}

const STORAGE_KEY = "deenflow-user";

function saveToStorage(user: UserProfile | null) {
  if (typeof window === "undefined") return;
  if (user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function loadFromStorage(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => {
    set({ user });
    saveToStorage(user);
  },
  clearUser: () => {
    set({ user: null });
    saveToStorage(null);
  },
  loadUser: () => {
    const user = loadFromStorage();
    set({ user });
  },
}));

export function initUser() {
  if (typeof window === "undefined") return;
  const user = loadFromStorage();
  if (user) {
    useUserStore.getState().setUser(user);
  }
}
