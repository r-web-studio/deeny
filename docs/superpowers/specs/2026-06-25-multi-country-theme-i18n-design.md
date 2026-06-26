# Design: Theme Animation, Dashboard i18n, Multi-Country Prayer Times

## Summary
Three enhancements:
1. Animated theme toggle button (sun/moon with smooth rotation)
2. Translation/language buttons in the dashboard topbar
3. Multi-country support with dynamic regions and prayer times

---

## 1. Animated Theme Toggle

### Current State
- Topbar has a simple icon button that cycles light -> dark -> system
- Uses `lucide-react` Sun/Moon/Monitor icons, no animation

### Changes
- **File:** `src/components/layout/topbar.tsx`
- Replace the plain button with an animated toggle using `framer-motion`
- When switching theme, the icon rotates/spins with a smooth transition
- Sun icon for light, Moon icon for dark, Monitor icon for system
- Use `motion.div` with `animate={{ rotate: 360 }}` and `transition={{ duration: 0.5 }}` on theme change
- Add a key prop to force re-render animation on theme change

### Implementation Detail
```
ThemeIcon wrapped in motion.div with:
  - key={theme} to force re-render
  - initial={{ rotate: -90, opacity: 0 }}
  - animate={{ rotate: 0, opacity: 1 }}
  - transition={{ type: "spring", stiffness: 200, damping: 15 }}
```

---

## 2. Translation Buttons in Dashboard Topbar

### Current State
- `LanguageSwitcher` component exists (en/uz/ru/tr flags)
- Only used in login page and settings page
- Topbar has no language controls

### Changes
- **File:** `src/components/layout/topbar.tsx`
- Import and add `LanguageSwitcher` next to the theme toggle button
- Render between the search bar and theme button

---

## 3. Multi-Country Prayer Times

### Current State
- Only Uzbekistan supported via `islomapi.uz` API
- Prayer times hook (`use-prayer-times.ts`) hardcodes the Uzbekistan API
- Country list in settings has 18 countries (no Uzbekistan)
- No connection between country selection and prayer data

### Changes

#### 3a. Country Data (`src/lib/data/countries.ts`)
Create a unified country data structure:
```ts
interface Country {
  id: string;
  name: string;
  flag: string;
  timezone: string;
  prayerMethod: number; // Aladhan calculation method
  api: "aladhan" | "islomapi";
  regions: Region[];
}

interface Region {
  name: string;
  cities: City[];
}

interface City {
  name: string;
  lat: number;
  lon: number;
}
```

**Countries to include:**
| Country | Flag | Method | API |
|---------|------|--------|-----|
| Uzbekistan | 🇺🇿 | 2 | islomapi |
| Turkey | 🇹🇷 | 13 | aladhan |
| Saudi Arabia | 🇸🇦 | 4 | aladhan |
| Pakistan | 🇵🇰 | 2 | aladhan |
| Indonesia | 🇮🇩 | 11 | aladhan |
| Malaysia | 🇲🇾 | 11 | aladhan |
| Egypt | 🇪🇬 | 5 | aladhan |
| UAE | 🇦🇪 | 8 | aladhan |
| Kazakhstan | 🇰🇿 | 2 | aladhan |
| Russia | 🇷🇺 | 2 | aladhan |
| Kyrgyzstan | 🇰🇬 | 2 | aladhan |
| Tajikistan | 🇹🇯 | 2 | aladhan |
| Afghanistan | 🇦🇫 | 2 | aladhan |
| Iran | 🇮🇷 | 14 | aladhan |
| Morocco | 🇲🇦 | 5 | aladhan |
| Jordan | 🇯🇴 | 3 | aladhan |
| Germany | 🇩🇪 | 3 | aladhan |
| France | 🇫🇷 | 12 | aladhan |
| United Kingdom | 🇬🇧 | 15 | aladhan |
| United States | 🇺🇸 | 15 | aladhan |
| Canada | 🇨🇦 | 15 | aladhan |

Uzbekistan keeps its existing `uzbekistan.ts` data (regions + cities + apiRegion mapping).

Other countries will use major cities with lat/lon for Aladhan API calls.

#### 3b. Prayer Times Hook (`src/lib/hooks/use-prayer-times.ts`)
- Accept optional `countryId` parameter
- If country is Uzbekistan: use existing `islomapi.uz` logic
- If country is anything else: use `api.aladhan.com/v1/timings/{date}?latitude={lat}&longitude={lon}&method={method}`
- Store the selected country in localStorage
- Return the same `PrayerTimesData` interface for both

#### 3c. Prayer Times Page (`src/app/(dashboard)/prayers/page.tsx`)
- Add a **Country selector** at the top (dropdown with flags)
- When country changes, clear the current city selection and show that country's regions/cities
- Store selected country in localStorage key `"deenflow-selected-country"`
- The city selector dynamically shows regions from the selected country
- Prayer times update when city is selected

#### 3d. Dashboard Page (`src/app/(dashboard)/dashboard/page.tsx`)
- Read the selected country from localStorage
- Pass it to `usePrayerTimes` along with the city/region

#### 3e. Settings Page (`src/app/(dashboard)/settings/page.tsx`)
- Add "Uzbekistan" to the COUNTRIES list
- Add "Asia/Tashkent" to TIMEZONES list
- The country in settings is the **user's profile country** (for general use)
- The country in prayers page is the **prayer location country** (for prayer times)
- These can be separate - settings country is for profile, prayers page country is for actual prayer data

#### 3f. Translation Keys
Add new keys to all locale files:
```json
{
  "prayers": {
    "selectCountry": "Select your country",
    "allCountries": "All Countries"
  },
  "countries": {
    "uzbekistan": "Uzbekistan",
    "turkey": "Turkey",
    "saudiArabia": "Saudi Arabia",
    "pakistan": "Pakistan",
    "indonesia": "Indonesia",
    "malaysia": "Malaysia",
    "egypt": "Egypt",
    "uae": "UAE",
    "kazakhstan": "Kazakhstan",
    "russia": "Russia",
    "kyrgyzstan": "Kyrgyzstan",
    "tajikistan": "Tajikistan",
    "afghanistan": "Afghanistan",
    "iran": "Iran",
    "morocco": "Morocco",
    "jordan": "Jordan",
    "germany": "Germany",
    "france": "France",
    "unitedKingdom": "United Kingdom",
    "unitedStates": "United States",
    "canada": "Canada"
  }
}
```

---

## Files to Create
- `src/lib/data/countries.ts` - Country/region/city data

## Files to Modify
- `src/components/layout/topbar.tsx` - Animated theme toggle + language switcher
- `src/lib/hooks/use-prayer-times.ts` - Multi-API support
- `src/app/(dashboard)/prayers/page.tsx` - Country selector + dynamic regions
- `src/app/(dashboard)/dashboard/page.tsx` - Use selected country for prayer times
- `src/app/(dashboard)/settings/page.tsx` - Add Uzbekistan + Asia/Tashkent
- `src/lib/i18n/locales/en.json` - New translation keys
- `src/lib/i18n/locales/uz.json` - New translation keys
- `src/lib/i18n/locales/ru.json` - New translation keys
- `src/lib/i18n/locales/tr.json` - New translation keys
