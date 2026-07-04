"use client";
import { useState, useEffect } from "react";
import { getCountryById } from "@/lib/data/countries";

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
            setTimes({
              Fajr: t.Fajr,
              Sunrise: t.Sunrise,
              Dhuhr: t.Dhuhr,
              Asr: t.Asr,
              Maghrib: t.Maghrib,
              Isha: t.Isha,
            });
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [regionName, countryId, lat, lon]);

  return { times, loading };
}
