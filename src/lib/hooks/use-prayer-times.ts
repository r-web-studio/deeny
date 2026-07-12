"use client";
import { useState, useEffect } from "react";
import { getCountryById } from "@/lib/data/countries";
import { calculatePrayerTimesLocally } from "@/lib/prayer-calculation";

export interface PrayerTimesData {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

interface AladhanResponse {
  data: {
    timings: {
      Fajr: string;
      Sunrise: string;
      Dhuhr: string;
      Asr: string;
      Maghrib: string;
      Isha: string;
    };
  };
}

const CACHE_KEY = "deenflow-prayer-times-cache";

function getCachedTimes(countryId: string, dateStr: string): PrayerTimesData | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    const data = JSON.parse(cached);
    if (data.countryId === countryId && data.dateStr === dateStr) {
      return data.times;
    }
    return null;
  } catch {
    return null;
  }
}

function setCachedTimes(countryId: string, dateStr: string, times: PrayerTimesData) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ countryId, dateStr, times }));
  } catch { /* quota exceeded, ignore */ }
}

export function usePrayerTimes(regionName?: string, countryId?: string, lat?: number, lon?: number) {
  const [times, setTimes] = useState<PrayerTimesData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const country = countryId ? getCountryById(countryId) : null;

    if (!country) {
      setLoading(false);
      return;
    }

    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    const dateStr = `${String(day).padStart(2, "0")}-${String(month).padStart(2, "0")}-${today.getFullYear()}`;
    const method = country.prayerMethod;
    const schoolParam = country.school !== undefined ? `&school=${country.school}` : "";

    if (lat !== undefined && lon !== undefined) {
      fetch(
        `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${lat}&longitude=${lon}&method=${method}${schoolParam}`
      )
        .then((r) => r.json())
        .then((data: AladhanResponse | null) => {
          if (data?.data?.timings) {
            const t = data.data.timings;
            const newTimes: PrayerTimesData = {
              Fajr: t.Fajr,
              Sunrise: t.Sunrise,
              Dhuhr: t.Dhuhr,
              Asr: t.Asr,
              Maghrib: t.Maghrib,
              Isha: t.Isha,
            };
            setTimes(newTimes);
            if (countryId) setCachedTimes(countryId, dateStr, newTimes);
          }
          setLoading(false);
        })
        .catch(() => {
          const cached = countryId ? getCachedTimes(countryId, dateStr) : null;
          if (cached) {
            setTimes(cached);
          } else {
            const local = calculatePrayerTimesLocally(lat, lon, method, country.school);
            setTimes(local);
          }
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [regionName, countryId, lat, lon]);

  return { times, loading };
}

export function getPrayerTimesDirect(
  countryId: string,
  lat: number,
  lon: number
): PrayerTimesData | null {
  const country = getCountryById(countryId);
  if (!country) return null;

  const today = new Date();
  const month = today.getMonth() + 1;
  const day = today.getDate();
  const dateStr = `${String(day).padStart(2, "0")}-${String(month).padStart(2, "0")}-${today.getFullYear()}`;

  const cached = getCachedTimes(countryId, dateStr);
  if (cached) return cached;

  return calculatePrayerTimesLocally(lat, lon, country.prayerMethod, country.school);
}

export function getPrayerLocationFromStorage(): { countryId: string; lat: number; lon: number } | null {
  try {
    const raw = localStorage.getItem("deenflow-prayer-location");
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data.countryId && typeof data.lat === "number" && typeof data.lon === "number") {
      return data;
    }
    return null;
  } catch {
    return null;
  }
}
