import {
  Coordinates,
  CalculationMethod,
  CalculationParameters,
  Madhab,
  PrayerTimes,
  Prayer,
} from "adhan";

const ALADHAN_TO_ADHAN_METHOD: Record<number, () => CalculationParameters> = {
  0: CalculationMethod.MuslimWorldLeague,
  1: CalculationMethod.Egyptian,
  2: CalculationMethod.Karachi,
  3: CalculationMethod.UmmAlQura,
  4: CalculationMethod.Dubai,
  5: CalculationMethod.MoonsightingCommittee,
  6: CalculationMethod.NorthAmerica,
  7: CalculationMethod.Kuwait,
  8: CalculationMethod.Qatar,
  9: CalculationMethod.Singapore,
  10: CalculationMethod.Other,
  11: CalculationMethod.Karachi,
  12: CalculationMethod.Egyptian,
  13: CalculationMethod.Turkey,
  15: CalculationMethod.Dubai,
};

export interface LocalPrayerTimes {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

function formatTime(date: Date): string {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const period = hours >= 12 ? "PM" : "AM";
  const h = hours % 12 || 12;
  return `${String(h).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${period}`;
}

export function calculatePrayerTimesLocally(
  lat: number,
  lon: number,
  aladhanMethod: number,
  school?: number,
  date?: Date
): LocalPrayerTimes {
  const coordinates = new Coordinates(lat, lon);
  const paramsFn = ALADHAN_TO_ADHAN_METHOD[aladhanMethod] || CalculationMethod.MuslimWorldLeague;
  const params = paramsFn();

  if (school === 1) {
    params.madhab = Madhab.Hanafi;
  }

  const prayerTimes = new PrayerTimes(coordinates, date || new Date(), params);

  return {
    Fajr: formatTime(prayerTimes.timeForPrayer(Prayer.Fajr) || new Date()),
    Sunrise: formatTime(prayerTimes.sunrise),
    Dhuhr: formatTime(prayerTimes.timeForPrayer(Prayer.Dhuhr) || new Date()),
    Asr: formatTime(prayerTimes.timeForPrayer(Prayer.Asr) || new Date()),
    Maghrib: formatTime(prayerTimes.timeForPrayer(Prayer.Maghrib) || new Date()),
    Isha: formatTime(prayerTimes.timeForPrayer(Prayer.Isha) || new Date()),
  };
}

export function getPrayerTimesAsDate(
  lat: number,
  lon: number,
  aladhanMethod: number,
  school?: number,
  date?: Date,
  prayerName?: string
): Date | null {
  const coordinates = new Coordinates(lat, lon);
  const paramsFn = ALADHAN_TO_ADHAN_METHOD[aladhanMethod] || CalculationMethod.MuslimWorldLeague;
  const params = paramsFn();

  if (school === 1) {
    params.madhab = Madhab.Hanafi;
  }

  const pt = new PrayerTimes(coordinates, date || new Date(), params);

  switch (prayerName) {
    case "Fajr": return pt.timeForPrayer(Prayer.Fajr);
    case "Sunrise": return pt.sunrise;
    case "Dhuhr": return pt.timeForPrayer(Prayer.Dhuhr);
    case "Asr": return pt.timeForPrayer(Prayer.Asr);
    case "Maghrib": return pt.timeForPrayer(Prayer.Maghrib);
    case "Isha": return pt.timeForPrayer(Prayer.Isha);
    default: return null;
  }
}
