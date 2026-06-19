import { create } from "zustand";

interface ThemeStore {
  theme: "light" | "dark" | "system";
  setTheme: (theme: "light" | "dark" | "system") => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: "system",
  setTheme: (theme) => {
    set({ theme });
    if (typeof window !== "undefined") {
      localStorage.setItem("deenflow-theme", theme);
      applyTheme(theme);
    }
  },
}));

export function applyTheme(theme: "light" | "dark" | "system") {
  if (typeof window === "undefined") return;
  const root = document.documentElement;
  if (theme === "system") {
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.classList.toggle("dark", isDark);
  } else {
    root.classList.toggle("dark", theme === "dark");
  }
}

export function initTheme() {
  if (typeof window === "undefined") return;
  const saved = localStorage.getItem("deenflow-theme") as "light" | "dark" | "system" | null;
  const theme = saved || "system";
  useThemeStore.getState().setTheme(theme);
}
