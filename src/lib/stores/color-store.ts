import { create } from "zustand";

export interface ColorPreset {
  id: string;
  name: string;
  light: {
    primary: string;
    islamicGreen: string;
    islamicGreenLight: string;
    gold: string;
    ring: string;
    secondary: string;
    accent: string;
    sidebarPrimary: string;
    sidebarAccent: string;
    sidebarRing: string;
    background: string;
    card: string;
    muted: string;
    sidebar: string;
  };
  dark: {
    primary: string;
    islamicGreen: string;
    islamicGreenLight: string;
    gold: string;
    ring: string;
    secondary: string;
    accent: string;
    sidebarPrimary: string;
    sidebarAccent: string;
    sidebarRing: string;
    background: string;
    card: string;
    muted: string;
    sidebar: string;
  };
}

export const COLOR_PRESETS: ColorPreset[] = [
  {
    id: "madinah-green",
    name: "Madinah Green",
    light: {
      primary: "oklch(0.38 0.16 155)",
      islamicGreen: "oklch(0.42 0.17 155)",
      islamicGreenLight: "oklch(0.90 0.06 155)",
      gold: "oklch(0.72 0.16 80)",
      ring: "oklch(0.38 0.16 155)",
      secondary: "oklch(0.95 0.01 155)",
      accent: "oklch(0.95 0.01 155)",
      sidebarPrimary: "oklch(0.38 0.16 155)",
      sidebarAccent: "oklch(0.95 0.01 155)",
      sidebarRing: "oklch(0.38 0.16 155)",
      background: "oklch(0.97 0.005 155)",
      card: "oklch(0.99 0.002 155)",
      muted: "oklch(0.95 0.008 155)",
      sidebar: "oklch(0.98 0.004 155)",
    },
    dark: {
      primary: "oklch(0.52 0.17 155)",
      islamicGreen: "oklch(0.56 0.18 155)",
      islamicGreenLight: "oklch(0.24 0.05 155)",
      gold: "oklch(0.78 0.16 80)",
      ring: "oklch(0.52 0.17 155)",
      secondary: "oklch(0.20 0.03 155)",
      accent: "oklch(0.20 0.03 155)",
      sidebarPrimary: "oklch(0.56 0.18 155)",
      sidebarAccent: "oklch(0.20 0.03 155)",
      sidebarRing: "oklch(0.52 0.17 155)",
      background: "oklch(0.14 0.02 155)",
      card: "oklch(0.18 0.02 155)",
      muted: "oklch(0.22 0.02 155)",
      sidebar: "oklch(0.16 0.02 155)",
    },
  },
  {
    id: "ottoman-gold",
    name: "Ottoman Gold",
    light: {
      primary: "oklch(0.48 0.14 75)",
      islamicGreen: "oklch(0.52 0.14 75)",
      islamicGreenLight: "oklch(0.93 0.05 75)",
      gold: "oklch(0.68 0.18 65)",
      ring: "oklch(0.48 0.14 75)",
      secondary: "oklch(0.95 0.01 75)",
      accent: "oklch(0.95 0.01 75)",
      sidebarPrimary: "oklch(0.48 0.14 75)",
      sidebarAccent: "oklch(0.95 0.01 75)",
      sidebarRing: "oklch(0.48 0.14 75)",
      background: "oklch(0.97 0.008 75)",
      card: "oklch(0.99 0.004 75)",
      muted: "oklch(0.95 0.01 75)",
      sidebar: "oklch(0.98 0.006 75)",
    },
    dark: {
      primary: "oklch(0.62 0.16 75)",
      islamicGreen: "oklch(0.65 0.16 75)",
      islamicGreenLight: "oklch(0.24 0.05 75)",
      gold: "oklch(0.75 0.18 65)",
      ring: "oklch(0.62 0.16 75)",
      secondary: "oklch(0.22 0.03 75)",
      accent: "oklch(0.22 0.03 75)",
      sidebarPrimary: "oklch(0.65 0.16 75)",
      sidebarAccent: "oklch(0.22 0.03 75)",
      sidebarRing: "oklch(0.62 0.16 75)",
      background: "oklch(0.14 0.02 75)",
      card: "oklch(0.18 0.02 75)",
      muted: "oklch(0.22 0.02 75)",
      sidebar: "oklch(0.16 0.02 75)",
    },
  },
  {
    id: "desert-sand",
    name: "Desert Sand",
    light: {
      primary: "oklch(0.45 0.10 55)",
      islamicGreen: "oklch(0.48 0.10 55)",
      islamicGreenLight: "oklch(0.92 0.04 55)",
      gold: "oklch(0.70 0.14 80)",
      ring: "oklch(0.45 0.10 55)",
      secondary: "oklch(0.95 0.01 55)",
      accent: "oklch(0.95 0.01 55)",
      sidebarPrimary: "oklch(0.45 0.10 55)",
      sidebarAccent: "oklch(0.95 0.01 55)",
      sidebarRing: "oklch(0.45 0.10 55)",
      background: "oklch(0.97 0.006 55)",
      card: "oklch(0.99 0.003 55)",
      muted: "oklch(0.95 0.008 55)",
      sidebar: "oklch(0.98 0.005 55)",
    },
    dark: {
      primary: "oklch(0.60 0.12 55)",
      islamicGreen: "oklch(0.62 0.12 55)",
      islamicGreenLight: "oklch(0.24 0.04 55)",
      gold: "oklch(0.76 0.14 80)",
      ring: "oklch(0.60 0.12 55)",
      secondary: "oklch(0.22 0.03 55)",
      accent: "oklch(0.22 0.03 55)",
      sidebarPrimary: "oklch(0.62 0.12 55)",
      sidebarAccent: "oklch(0.22 0.03 55)",
      sidebarRing: "oklch(0.60 0.12 55)",
      background: "oklch(0.14 0.015 55)",
      card: "oklch(0.18 0.015 55)",
      muted: "oklch(0.22 0.02 55)",
      sidebar: "oklch(0.16 0.015 55)",
    },
  },
  {
    id: "mosque-blue",
    name: "Mosque Blue",
    light: {
      primary: "oklch(0.35 0.12 240)",
      islamicGreen: "oklch(0.40 0.12 240)",
      islamicGreenLight: "oklch(0.92 0.04 240)",
      gold: "oklch(0.72 0.15 85)",
      ring: "oklch(0.35 0.12 240)",
      secondary: "oklch(0.95 0.01 240)",
      accent: "oklch(0.95 0.01 240)",
      sidebarPrimary: "oklch(0.35 0.12 240)",
      sidebarAccent: "oklch(0.95 0.01 240)",
      sidebarRing: "oklch(0.35 0.12 240)",
      background: "oklch(0.97 0.005 240)",
      card: "oklch(0.99 0.002 240)",
      muted: "oklch(0.95 0.008 240)",
      sidebar: "oklch(0.98 0.004 240)",
    },
    dark: {
      primary: "oklch(0.50 0.14 240)",
      islamicGreen: "oklch(0.54 0.14 240)",
      islamicGreenLight: "oklch(0.24 0.04 240)",
      gold: "oklch(0.78 0.15 85)",
      ring: "oklch(0.50 0.14 240)",
      secondary: "oklch(0.20 0.03 240)",
      accent: "oklch(0.20 0.03 240)",
      sidebarPrimary: "oklch(0.54 0.14 240)",
      sidebarAccent: "oklch(0.20 0.03 240)",
      sidebarRing: "oklch(0.50 0.14 240)",
      background: "oklch(0.14 0.02 240)",
      card: "oklch(0.18 0.02 240)",
      muted: "oklch(0.22 0.02 240)",
      sidebar: "oklch(0.16 0.02 240)",
    },
  },
  {
    id: "night-sky",
    name: "Night Sky",
    light: {
      primary: "oklch(0.30 0.10 260)",
      islamicGreen: "oklch(0.35 0.10 260)",
      islamicGreenLight: "oklch(0.92 0.03 260)",
      gold: "oklch(0.74 0.14 85)",
      ring: "oklch(0.30 0.10 260)",
      secondary: "oklch(0.95 0.01 260)",
      accent: "oklch(0.95 0.01 260)",
      sidebarPrimary: "oklch(0.30 0.10 260)",
      sidebarAccent: "oklch(0.95 0.01 260)",
      sidebarRing: "oklch(0.30 0.10 260)",
      background: "oklch(0.97 0.004 260)",
      card: "oklch(0.99 0.002 260)",
      muted: "oklch(0.95 0.006 260)",
      sidebar: "oklch(0.98 0.003 260)",
    },
    dark: {
      primary: "oklch(0.48 0.12 260)",
      islamicGreen: "oklch(0.52 0.12 260)",
      islamicGreenLight: "oklch(0.22 0.04 260)",
      gold: "oklch(0.80 0.14 85)",
      ring: "oklch(0.48 0.12 260)",
      secondary: "oklch(0.18 0.03 260)",
      accent: "oklch(0.18 0.03 260)",
      sidebarPrimary: "oklch(0.52 0.12 260)",
      sidebarAccent: "oklch(0.18 0.03 260)",
      sidebarRing: "oklch(0.48 0.12 260)",
      background: "oklch(0.13 0.02 260)",
      card: "oklch(0.17 0.02 260)",
      muted: "oklch(0.21 0.02 260)",
      sidebar: "oklch(0.15 0.02 260)",
    },
  },
  {
    id: "jasmine-white",
    name: "Jasmine White",
    light: {
      primary: "oklch(0.40 0.08 140)",
      islamicGreen: "oklch(0.44 0.10 140)",
      islamicGreenLight: "oklch(0.94 0.03 140)",
      gold: "oklch(0.72 0.15 85)",
      ring: "oklch(0.40 0.08 140)",
      secondary: "oklch(0.96 0.01 140)",
      accent: "oklch(0.96 0.01 140)",
      sidebarPrimary: "oklch(0.40 0.08 140)",
      sidebarAccent: "oklch(0.96 0.01 140)",
      sidebarRing: "oklch(0.40 0.08 140)",
      background: "oklch(0.98 0.003 140)",
      card: "oklch(0.995 0.001 140)",
      muted: "oklch(0.96 0.005 140)",
      sidebar: "oklch(0.985 0.002 140)",
    },
    dark: {
      primary: "oklch(0.55 0.12 140)",
      islamicGreen: "oklch(0.58 0.12 140)",
      islamicGreenLight: "oklch(0.24 0.04 140)",
      gold: "oklch(0.78 0.15 85)",
      ring: "oklch(0.55 0.12 140)",
      secondary: "oklch(0.22 0.03 140)",
      accent: "oklch(0.22 0.03 140)",
      sidebarPrimary: "oklch(0.58 0.12 140)",
      sidebarAccent: "oklch(0.22 0.03 140)",
      sidebarRing: "oklch(0.55 0.12 140)",
      background: "oklch(0.14 0.015 140)",
      card: "oklch(0.18 0.015 140)",
      muted: "oklch(0.22 0.02 140)",
      sidebar: "oklch(0.16 0.015 140)",
    },
  },
  {
    id: "rose-garden",
    name: "Rose Garden",
    light: {
      primary: "oklch(0.42 0.14 350)",
      islamicGreen: "oklch(0.46 0.14 350)",
      islamicGreenLight: "oklch(0.92 0.04 350)",
      gold: "oklch(0.72 0.15 85)",
      ring: "oklch(0.42 0.14 350)",
      secondary: "oklch(0.95 0.01 350)",
      accent: "oklch(0.95 0.01 350)",
      sidebarPrimary: "oklch(0.42 0.14 350)",
      sidebarAccent: "oklch(0.95 0.01 350)",
      sidebarRing: "oklch(0.42 0.14 350)",
      background: "oklch(0.97 0.006 350)",
      card: "oklch(0.99 0.003 350)",
      muted: "oklch(0.95 0.008 350)",
      sidebar: "oklch(0.98 0.004 350)",
    },
    dark: {
      primary: "oklch(0.58 0.16 350)",
      islamicGreen: "oklch(0.60 0.16 350)",
      islamicGreenLight: "oklch(0.24 0.05 350)",
      gold: "oklch(0.78 0.15 85)",
      ring: "oklch(0.58 0.16 350)",
      secondary: "oklch(0.22 0.03 350)",
      accent: "oklch(0.22 0.03 350)",
      sidebarPrimary: "oklch(0.60 0.16 350)",
      sidebarAccent: "oklch(0.22 0.03 350)",
      sidebarRing: "oklch(0.58 0.16 350)",
      background: "oklch(0.14 0.015 350)",
      card: "oklch(0.18 0.015 350)",
      muted: "oklch(0.22 0.02 350)",
      sidebar: "oklch(0.16 0.015 350)",
    },
  },
  {
    id: "sahara-amber",
    name: "Sahara Amber",
    light: {
      primary: "oklch(0.45 0.12 60)",
      islamicGreen: "oklch(0.50 0.12 60)",
      islamicGreenLight: "oklch(0.93 0.04 60)",
      gold: "oklch(0.68 0.16 50)",
      ring: "oklch(0.45 0.12 60)",
      secondary: "oklch(0.95 0.01 60)",
      accent: "oklch(0.95 0.01 60)",
      sidebarPrimary: "oklch(0.45 0.12 60)",
      sidebarAccent: "oklch(0.95 0.01 60)",
      sidebarRing: "oklch(0.45 0.12 60)",
      background: "oklch(0.97 0.006 60)",
      card: "oklch(0.99 0.003 60)",
      muted: "oklch(0.95 0.008 60)",
      sidebar: "oklch(0.98 0.005 60)",
    },
    dark: {
      primary: "oklch(0.60 0.14 60)",
      islamicGreen: "oklch(0.63 0.14 60)",
      islamicGreenLight: "oklch(0.24 0.04 60)",
      gold: "oklch(0.75 0.16 50)",
      ring: "oklch(0.60 0.14 60)",
      secondary: "oklch(0.22 0.03 60)",
      accent: "oklch(0.22 0.03 60)",
      sidebarPrimary: "oklch(0.63 0.14 60)",
      sidebarAccent: "oklch(0.22 0.03 60)",
      sidebarRing: "oklch(0.60 0.14 60)",
      background: "oklch(0.14 0.015 60)",
      card: "oklch(0.18 0.015 60)",
      muted: "oklch(0.22 0.02 60)",
      sidebar: "oklch(0.16 0.015 60)",
    },
  },
];

const STORAGE_KEY = "deenflow-colors";

interface ColorStore {
  colorPresetId: string;
  setColorPreset: (id: string) => void;
  loadColors: () => void;
}

export const useColorStore = create<ColorStore>((set) => ({
  colorPresetId: "madinah-green",
  setColorPreset: (id) => {
    set({ colorPresetId: id });
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, id);
      applyColorPreset(id);
    }
  },
  loadColors: () => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem(STORAGE_KEY);
    const id = saved || "madinah-green";
    set({ colorPresetId: id });
    applyColorPreset(id);
  },
}));

export function applyColorPreset(presetId: string) {
  if (typeof window === "undefined") return;
  const preset = COLOR_PRESETS.find((p) => p.id === presetId);
  if (!preset) return;

  const root = document.documentElement;
  const isDark = root.classList.contains("dark");
  const colors = isDark ? preset.dark : preset.light;

  root.style.setProperty("--primary", colors.primary);
  root.style.setProperty("--islamic-green", colors.islamicGreen);
  root.style.setProperty("--islamic-green-light", colors.islamicGreenLight);
  root.style.setProperty("--gold", colors.gold);
  root.style.setProperty("--ring", colors.ring);
  root.style.setProperty("--secondary", colors.secondary);
  root.style.setProperty("--accent", colors.accent);
  root.style.setProperty("--sidebar-primary", colors.sidebarPrimary);
  root.style.setProperty("--sidebar-accent", colors.sidebarAccent);
  root.style.setProperty("--sidebar-ring", colors.sidebarRing);
  root.style.setProperty("--background", colors.background);
  root.style.setProperty("--card", colors.card);
  root.style.setProperty("--muted", colors.muted);
  root.style.setProperty("--sidebar", colors.sidebar);
}

export function initColors() {
  if (typeof window === "undefined") return;
  const saved = localStorage.getItem(STORAGE_KEY);
  const id = saved || "madinah-green";
  useColorStore.getState().setColorPreset(id);
}
