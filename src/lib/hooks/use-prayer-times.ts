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

interface IslomApiPrayerTime {
  region: string;
  regionNumber: number;
  month: number;
  day: number;
  date: string;
  hijri_date: { month: string; day: string | number };
  weekday: string;
  times: {
    tong_saharlik: string;
    quyosh: string;
    peshin: string;
    asr: string;
    shom_iftor: string;
    hufton: string;
  };
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
    if (!regionName) {
      setLoading(false);
      return;
    }

    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();

    const country = countryId ? getCountryById(countryId) : null;

    if (country?.api === "islomapi") {
      fetch(
        `https://islomapi.uz/api/daily?region=${encodeURIComponent(regionName)}&month=${month}&day=${day}`
      )
        .then((r) => r.json())
        .then((data: IslomApiPrayerTime | null) => {
          if (data && data.times) {
            setTimes({
              Fajr: data.times.tong_saharlik,
              Sunrise: data.times.quyosh,
              Dhuhr: data.times.peshin,
              Asr: data.times.asr,
              Maghrib: data.times.shom_iftor,
              Isha: data.times.hufton,
            });
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else if (country?.api === "aladhan" && lat !== undefined && lon !== undefined) {
      const dateStr = `${String(day).padStart(2, "0")}-${String(month).padStart(2, "0")}-${today.getFullYear()}`;
      const method = country.prayerMethod;

      fetch(
        `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${lat}&longitude=${lon}&method=${method}`
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
