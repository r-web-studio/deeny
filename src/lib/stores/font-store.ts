import { create } from "zustand";

export interface FontPreset {
  id: string;
  name: string;
  arabicName: string;
  headingFont: string;
  bodyFont: string;
  arabicFont: string;
  googleLink: string;
  headingVariable: string;
  bodyVariable: string;
  arabicVariable: string;
}

export const FONT_PRESETS: FontPreset[] = [
  {
    id: "amiri-classic",
    name: "Amiri Classic",
    arabicName: "كلاسيكي",
    headingFont: "'Amiri', serif",
    bodyFont: "'Geist', system-ui, sans-serif",
    arabicFont: "'Amiri', serif",
    googleLink: "",
    headingVariable: "--font-heading",
    bodyVariable: "--font-geist-sans",
    arabicVariable: "--font-arabic",
  },
  {
    id: "noto-naskh",
    name: "Noto Naskh",
    arabicName: "نوت نسخ",
    headingFont: "'Noto Naskh Arabic', serif",
    bodyFont: "'Geist', system-ui, sans-serif",
    arabicFont: "'Noto Naskh Arabic', serif",
    googleLink: "",
    headingVariable: "--font-heading",
    bodyVariable: "--font-geist-sans",
    arabicVariable: "--font-arabic",
  },
  {
    id: "scheherazade",
    name: "Scheherazade",
    arabicName: "شهرزاد",
    headingFont: "'Scheherazade New', serif",
    bodyFont: "'Geist', system-ui, sans-serif",
    arabicFont: "'Scheherazade New', serif",
    googleLink: "https://fonts.googleapis.com/css2?family=Scheherazade+New:wght@400;500;600;700&display=swap",
    headingVariable: "--font-heading",
    bodyVariable: "--font-geist-sans",
    arabicVariable: "--font-arabic",
  },
  {
    id: "sahel",
    name: "Sahel",
    arabicName: "ساحل",
    headingFont: "'Sahel', sans-serif",
    bodyFont: "'Geist', system-ui, sans-serif",
    arabicFont: "'Sahel', sans-serif",
    googleLink: "https://fonts.googleapis.com/css2?family=Sahel&display=swap",
    headingVariable: "--font-heading",
    bodyVariable: "--font-geist-sans",
    arabicVariable: "--font-arabic",
  },
  {
    id: "cairo",
    name: "Cairo",
    arabicName: "القاهرة",
    headingFont: "'Cairo', sans-serif",
    bodyFont: "'Geist', system-ui, sans-serif",
    arabicFont: "'Cairo', sans-serif",
    googleLink: "https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700&display=swap",
    headingVariable: "--font-heading",
    bodyVariable: "--font-geist-sans",
    arabicVariable: "--font-arabic",
  },
  {
    id: "tajawal",
    name: "Tajawal",
    arabicName: "تجوال",
    headingFont: "'Tajawal', sans-serif",
    bodyFont: "'Geist', system-ui, sans-serif",
    arabicFont: "'Tajawal', sans-serif",
    googleLink: "https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800&display=swap",
    headingVariable: "--font-heading",
    bodyVariable: "--font-geist-sans",
    arabicVariable: "--font-arabic",
  },
  {
    id: "el-messiri",
    name: "El Messiri",
    arabicName: "المصري",
    headingFont: "'El Messiri', sans-serif",
    bodyFont: "'Geist', system-ui, sans-serif",
    arabicFont: "'El Messiri', sans-serif",
    googleLink: "https://fonts.googleapis.com/css2?family=El+Messiri:wght@400;500;600;700&display=swap",
    headingVariable: "--font-heading",
    bodyVariable: "--font-geist-sans",
    arabicVariable: "--font-arabic",
  },
  {
    id: "reem-kufi",
    name: "Reem Kufi",
    arabicName: "ريم كوفي",
    headingFont: "'Reem Kufi', sans-serif",
    bodyFont: "'Geist', system-ui, sans-serif",
    arabicFont: "'Reem Kufi', sans-serif",
    googleLink: "https://fonts.googleapis.com/css2?family=Reem+Kufi:wght@400;500;600;700&display=swap",
    headingVariable: "--font-heading",
    bodyVariable: "--font-geist-sans",
    arabicVariable: "--font-arabic",
  },
];

const STORAGE_KEY = "deenflow-fonts";

interface FontStore {
  fontPresetId: string;
  setFontPreset: (id: string) => void;
  loadFonts: () => void;
}

export const useFontStore = create<FontStore>((set) => ({
  fontPresetId: "amiri-classic",
  setFontPreset: (id) => {
    set({ fontPresetId: id });
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, id);
      applyFontPreset(id);
    }
  },
  loadFonts: () => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem(STORAGE_KEY);
    const id = saved || "amiri-classic";
    set({ fontPresetId: id });
    applyFontPreset(id);
  },
}));

export function applyFontPreset(presetId: string) {
  if (typeof window === "undefined") return;
  const preset = FONT_PRESETS.find((p) => p.id === presetId);
  if (!preset) return;

  const root = document.documentElement;
  root.style.setProperty("--font-heading", preset.headingFont);
  root.style.setProperty("--font-arabic", preset.arabicFont);

  // Inject or update font links
  let linksContainer = document.getElementById("deenflow-font-links");
  if (!linksContainer) {
    linksContainer = document.createElement("div");
    linksContainer.id = "deenflow-font-links";
    document.head.appendChild(linksContainer);
  }

  // Add Google Fonts link if needed
  const existingLinks = linksContainer.querySelectorAll("link[data-dynamic-font]");
  existingLinks.forEach((l) => l.remove());

  if (preset.googleLink) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = preset.googleLink;
    link.setAttribute("data-dynamic-font", preset.id);
    linksContainer.appendChild(link);
  }
}

export function initFonts() {
  if (typeof window === "undefined") return;
  const saved = localStorage.getItem(STORAGE_KEY);
  const id = saved || "amiri-classic";
  useFontStore.getState().setFontPreset(id);
}
