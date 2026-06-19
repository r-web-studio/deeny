"use client";
import { useState, useEffect } from "react";

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

export function usePrayerTimes(regionName?: string) {
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
  }, [regionName]);

  return { times, loading };
}
