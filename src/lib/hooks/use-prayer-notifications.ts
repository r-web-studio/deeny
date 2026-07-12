"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { getPrayerTimesAsDate } from "@/lib/prayer-calculation";
import { getCountryById } from "@/lib/data/countries";

const NOTIFICATIONS_ENABLED_KEY = "deenflow-notifications-enabled";
const NOTIFICATIONS_PRAYERS_KEY = "deenflow-notifications-prayers";
const NOTIFICATIONS_SOUND_KEY = "deenflow-notifications-sound";

const ALL_PRAYERS = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;
type PrayerName = (typeof ALL_PRAYERS)[number];

export interface NotificationSettings {
  enabled: boolean;
  prayers: PrayerName[];
  sound: "adhan" | "notification" | "silent";
}

export function getNotificationSettings(): NotificationSettings {
  if (typeof window === "undefined") {
    return { enabled: false, prayers: [...ALL_PRAYERS], sound: "adhan" };
  }

  const enabled = localStorage.getItem(NOTIFICATIONS_ENABLED_KEY) !== "false";
  const prayersRaw = localStorage.getItem(NOTIFICATIONS_PRAYERS_KEY);
  const prayers: PrayerName[] = prayersRaw
    ? JSON.parse(prayersRaw)
    : [...ALL_PRAYERS];
  const sound = (localStorage.getItem(NOTIFICATIONS_SOUND_KEY) as NotificationSettings["sound"]) || "adhan";

  return { enabled, prayers, sound };
}

export function saveNotificationSettings(settings: NotificationSettings) {
  localStorage.setItem(NOTIFICATIONS_ENABLED_KEY, String(settings.enabled));
  localStorage.setItem(NOTIFICATIONS_PRAYERS_KEY, JSON.stringify(settings.prayers));
  localStorage.setItem(NOTIFICATIONS_SOUND_KEY, settings.sound);
}

function playSound(type: "adhan" | "notification" | "silent") {
  if (type === "silent") return;
  try {
    const audio = new Audio(`/sounds/${type}.mp3`);
    audio.volume = 0.8;
    audio.play().catch(() => {});
  } catch { /* ignore */ }
}

function showPrayerNotification(prayerName: string, soundType: "adhan" | "notification" | "silent") {
  const title = `${prayerName} Prayer Time`;
  const body = `It's time for ${prayerName} prayer. May Allah accept your prayers.`;

  if ("Notification" in window && Notification.permission === "granted") {
    const notification = new Notification(title, {
      body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      tag: `prayer-${prayerName}`,
      requireInteraction: false,
      silent: soundType === "silent",
    });

    notification.onclick = () => {
      window.focus();
      window.location.href = "/prayers";
      notification.close();
    };

    if (soundType !== "silent") {
      playSound(soundType);
    }

    setTimeout(() => notification.close(), 30000);
  }
}

function getTimeUntilPrayer(targetDate: Date): number {
  const now = new Date();
  return targetDate.getTime() - now.getTime();
}

export function usePrayerNotifications(
  countryId?: string,
  lat?: number,
  lon?: number
) {
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const settingsRef = useRef<NotificationSettings>(getNotificationSettings());
  const [permissionState, setPermissionState] = useState<string>("default");

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current.clear();
  }, []);

  const scheduleNotifications = useCallback(() => {
    clearAllTimers();

    const settings = getNotificationSettings();
    settingsRef.current = settings;

    if (!settings.enabled || !countryId || lat === undefined || lon === undefined) {
      return;
    }

    const country = getCountryById(countryId);
    if (!country) return;

    settings.prayers.forEach((prayerName) => {
      const targetDate = getPrayerTimesAsDate(
        lat, lon, country.prayerMethod, country.school, new Date(), prayerName
      );

      if (!targetDate) return;

      const msUntil = getTimeUntilPrayer(targetDate);

      if (msUntil > 0) {
        const timer = setTimeout(() => {
          showPrayerNotification(prayerName, settings.sound);
          timersRef.current.delete(prayerName);
        }, msUntil);

        timersRef.current.set(prayerName, timer);
      }
    });
  }, [countryId, lat, lon, clearAllTimers]);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!("Notification" in window)) return false;

    if (Notification.permission === "granted") {
      setPermissionState("granted");
      return true;
    }

    if (Notification.permission === "denied") {
      setPermissionState("denied");
      return false;
    }

    const result = await Notification.requestPermission();
    setPermissionState(result);
    return result === "granted";
  }, []);

  useEffect(() => {
    if ("Notification" in window) {
      setPermissionState(Notification.permission);
    }
  }, []);

  useEffect(() => {
    scheduleNotifications();

    const interval = setInterval(scheduleNotifications, 60 * 60 * 1000);

    return () => {
      clearAllTimers();
      clearInterval(interval);
    };
  }, [scheduleNotifications, clearAllTimers]);

  return {
    requestPermission,
    permissionState,
    scheduleNotifications,
  };
}

export { ALL_PRAYERS, type PrayerName };
