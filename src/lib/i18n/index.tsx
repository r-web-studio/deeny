"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { saveProfile as syncProfile } from "@/lib/sync/data-sync";

export type Locale = "en" | "uz" | "ru" | "tr";

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const STORAGE_KEY = "deenflow-locale";

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (saved && ["en", "uz", "ru", "tr"].includes(saved)) {
      setLocaleState(saved);
    }
  }, []);

  useEffect(() => {
    import(`./locales/${locale}.json`)
      .then((mod) => {
        const flat = flattenObject(mod.default);
        setTranslations(flat);
        setLoaded(true);
      })
      .catch(() => {
        setLoaded(true);
      });
  }, [locale]);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(STORAGE_KEY, newLocale);
    setLoaded(false);
    // Sync language to Supabase profile
    syncLanguageToProfile(newLocale);
  };

  const t = (key: string): string => {
    return translations[key] || key;
  };

  if (!loaded) {
    return null;
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

function syncLanguageToProfile(lang: Locale) {
  if (typeof window === "undefined") return;
  try {
    const profileRaw = localStorage.getItem("deenflow-profile");
    const profile = profileRaw ? JSON.parse(profileRaw) : {};
    profile.language = lang;
    localStorage.setItem("deenflow-profile", JSON.stringify(profile));
    // Import dynamically to avoid SSR issues
    import("@/lib/supabase/client").then(({ createClient }) => {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data: { user } }: { data: { user: { id: string } | null } }) => {
        if (user) {
          syncProfile(user.id, {
            fullName: profile.fullName || "",
            username: profile.username || "",
            country: profile.country || "",
            timezone: profile.timezone || "UTC",
            avatarUrl: profile.avatarUrl || null,
            language: lang,
            colorPreset: profile.colorPreset || "madinah-green",
            fontPreset: profile.fontPreset || "amiri-classic",
            prayerLocation: profile.prayerLocation || null,
          }).catch(() => {});
        }
      });
    });
  } catch {}
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}

function flattenObject(obj: Record<string, any>, prefix = ""): Record<string, string> {
  const result: Record<string, string> = {};
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === "object" && obj[key] !== null && !Array.isArray(obj[key])) {
      Object.assign(result, flattenObject(obj[key], fullKey));
    } else if (Array.isArray(obj[key])) {
      result[fullKey] = obj[key].join("|||");
    } else {
      result[fullKey] = String(obj[key]);
    }
  }
  return result;
}
