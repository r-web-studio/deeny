# Design Spec: Offline + Installable + Notifications

**Date**: 2026-07-12
**App**: DeenFlow / Sakinah
**Status**: Approved

## Goals

1. Make offline prayer times work properly
2. Make the app downloadable on Android (APK) and iOS (PWA) with zero friction
3. Add prayer time notifications with sounds at exact prayer times

## Architecture

### Platform Strategy

| Platform | Distribution | Notifications |
|----------|-------------|---------------|
| Android | Capacitor APK (direct download from website) | `@capacitor/push-notifications` (native) |
| iOS | PWA install via Safari (Share → Add to Home Screen) | Web Notification API (iOS 16.4+) |
| Desktop | Standard PWA install | Web Notification API |

### Component Overview

```
┌─────────────────────────────────────────────┐
│                  App Shell                   │
├──────────────┬──────────────┬───────────────┤
│  Adhan Lib   │ Notification │   Offline     │
│  (local calc)│   Manager    │   Cache SW    │
├──────────────┴──────────────┴───────────────┤
│           Capacitor (Android only)           │
└─────────────────────────────────────────────┘
```

## 1. Offline Prayer Times

### Problem
`usePrayerTimes` hook calls `api.aladhan.com` on every load. No offline fallback — times are `null` when offline.

### Solution
- Install `adhan` npm package (lightweight, zero-dependency prayer time calculator)
- Modify `src/lib/hooks/usePrayerTimes.ts`:
  - On load: try API first (existing behavior)
  - If API fails or offline: calculate using `adhan` library with cached params from localStorage
  - Cache the last successful API response in localStorage as backup
- The `adhan` library supports all calculation methods already in the app's settings

### Files to Modify
- `src/lib/hooks/usePrayerTimes.ts` — add offline fallback
- `package.json` — add `adhan` dependency

### Files to Create
- `src/lib/prayer-calculation.ts` — wrapper around `adhan` library

## 2. Offline Service Worker

### Problem
Service worker only precaches `_next/static/chunks/*`. App shell HTML is not cached — navigating offline shows blank or error.

### Solution
- Update `next.config.ts` PWA config to precache app shell routes
- Add route-level precaching for critical pages: `/`, `/dashboard`, `/prayers`, `/settings`
- Ensure `/offline` page is always available from cache

### Files to Modify
- `next.config.ts` — update `runtimeCaching` and `globPatterns` for better precaching

## 3. Android APK (Capacitor)

### Problem
No native Android build. User can't install the app directly.

### Solution
- Capacitor is already configured (`capacitor.config.ts`)
- Install `@capacitor/push-notifications` for native notification support
- Build APK using existing `Dockerfile.apk`
- Host APK on the website with a download page
- The APK will be a WebView wrapper around the Next.js app, fully functional

### Files to Modify
- `capacitor.config.ts` — add push notification plugin config
- `package.json` — add `@capacitor/push-notifications`
- `src/app/page.tsx` or new `/download` page — add APK download button

### Build Process
```bash
# Build Next.js for Capacitor
CAPACITOR_BUILD=true npm run build
# Sync with Capacitor
npx cap sync android
# Build APK
cd android && ./gradlew assembleDebug
```

## 4. iOS PWA Install UX

### Problem
iOS users don't know they can install the PWA. No guidance shown.

### Solution
- Detect iOS Safari via user agent
- Show a sleek, non-intrusive install banner on iOS with step-by-step instructions:
  1. Tap the Share button (square with arrow)
  2. Tap "Add to Home Screen"
  3. Tap "Add"
- Once installed, the app runs full-screen with push notification support (iOS 16.4+)
- Auto-dismiss the banner after user installs or dismisses 3 times

### Files to Modify
- `src/components/pwa/InstallPrompt.tsx` — improve iOS detection and instructions

## 5. Prayer Time Notifications

### Architecture

```
usePrayerNotifications hook
    │
    ├── Calculate today's prayer times (adhan library)
    ├── For each prayer time:
    │     └── setTimeout(fireAt)
    ├── On fire:
    │     ├── Request notification permission (if not granted)
    │     ├── Show notification: "Asr prayer time has arrived"
    │     └── Play sound (adhan.mp3 or notification.mp3)
    └── On notification click → open app
```

### Sound Files
- `public/sounds/adhan.mp3` — short adhan snippet for prayer notifications
- `public/sounds/notification.mp3` — gentle notification tone (fallback)

### Notification Flow
1. User opens app → `usePrayerNotifications` initializes
2. Calculates all 5 prayer times for today using `adhan`
3. Sets a `setTimeout` for each prayer time
4. When timer fires:
   - Check if notification permission is granted
   - If not, request permission
   - Show `Notification` with prayer name ("Asr time has arrived")
   - Play sound via `Audio` API
5. User taps notification → app opens to `/prayers`

### Settings UI
- Add "Notifications" section in `/settings`
- Toggle: Enable/Disable prayer notifications
- Checkboxes for each prayer: Fajr, Dhuhr, Asr, Maghrib, Isha
- Sound selector: Adhan / Gentle / Silent

### Files to Create
- `src/lib/hooks/usePrayerNotifications.ts` — notification scheduling hook
- `src/components/notifications/NotificationSettings.tsx` — settings UI
- `public/sounds/adhan.mp3` — adhan notification sound
- `public/sounds/notification.mp3` — gentle notification sound

### Files to Modify
- `src/app/settings/page.tsx` — add notification settings section
- `src/components/pwa/ServiceWorkerRegister.tsx` — add `notificationclick` handler
- `public/sw.js` — add push/notification event listeners (if using push)

### Storage Keys
- `deenflow-notifications-enabled` — boolean
- `deenflow-notifications-prayers` — JSON array of enabled prayer names
- `deenflow-notifications-sound` — "adhan" | "notification" | "silent"
- `deenflow-notifications-permission` — "granted" | "denied" | "default"

## Implementation Order

1. **Offline prayer times** — install `adhan`, modify hook, add wrapper
2. **Service worker precaching** — update next.config.ts for app shell caching
3. **Notification system** — sounds, hook, settings UI
4. **Capacitor APK build** — plugins, build config, download page
5. **iOS PWA install UX** — improved banner and instructions
6. **Testing** — verify offline, install, and notifications on both platforms

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| iOS push requires PWA install first | Clear install instructions in banner |
| `adhan` library may not match Aladhan API exactly | Use same calculation methods; document any minor differences |
| APK size may be large | Capacitor APK is typically 5-15MB, acceptable |
| Notifications blocked by browser/OS | Graceful fallback — show in-app notification badge |
| Timer-based notifications may drift | Re-calculate and re-set timers every hour |
