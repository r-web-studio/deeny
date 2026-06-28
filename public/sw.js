/*
 * DeenFlow Service Worker
 *
 * Caching strategies:
 *   - Static assets: Cache-First
 *   - Page navigations: Network-First (fallback to /offline)
 *   - Aladhan prayer API: Stale-While-Revalidate
 *   - JS/CSS bundles: Cache-First
 *   - Images: Cache-First
 *   - Google Fonts: Cache-First (for offline)
 *
 * Excluded from interception:
 *   - Supabase (*.supabase.co)
 *   - Next.js API routes (/api/*)
 *   - OpenRouter (openrouter.ai)
 */

const CACHE_VERSION = 'v3';
const CACHE_NAME = `deenflow-${CACHE_VERSION}`;
const PRAYER_CACHE = 'prayer-api';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const IMAGE_CACHE = `images-${CACHE_VERSION}`;
const FONT_CACHE = `fonts-${CACHE_VERSION}`;
const OFFLINE_URL = '/offline';

// Core routes to precache
const PRECACHE_ROUTES = [
  '/',
  '/offline',
  '/login',
  '/dashboard',
  '/prayers',
  '/dhikr',
  '/journal',
  '/quran',
  '/settings',
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function shouldSkipRequest(url) {
  if (url.hostname.includes('supabase')) return true;
  if (url.pathname.startsWith('/api/')) return true;
  if (url.hostname.includes('openrouter.ai')) return true;
  return false;
}

function isNavigationRequest(event) {
  return event.request.mode === 'navigate';
}

function isSameOrigin(url) {
  return url.origin === self.location.origin;
}

function isFontRequest(url) {
  return url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com');
}

// ─── INSTALL ────────────────────────────────────────────────────────────────

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      // Precache core routes
      for (const route of PRECACHE_ROUTES) {
        try {
          const response = await fetch(route);
          if (response.ok) {
            await cache.put(route, response);
          }
        } catch (err) {
          console.warn(`[SW] Could not precache ${route}:`, err.message);
        }
      }

      // Warm the _next/static cache by extracting scripts from root HTML
      try {
        const rootResponse = await fetch('/');
        if (rootResponse.ok) {
          const html = await rootResponse.text();
          const matches = html.match(/\/_next\/static\/[^"'\s)]+/g) || [];
          const staticCache = await caches.open(STATIC_CACHE);
          for (const match of matches) {
            try {
              const res = await fetch(match);
              if (res.ok) {
                await staticCache.put(match, res);
              }
            } catch (_) {
              // skip individual failures
            }
          }
        }
      } catch (_) {
        // skip
      }

      // Pre-cache Google Fonts for offline use
      try {
        const fontCache = await caches.open(FONT_CACHE);
        const fontUrls = [
          'https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Poppins:wght@300;400;500;600;700&family=Noto+Naskh+Arabic:wght@400;500;600;700&display=swap',
        ];
        for (const url of fontUrls) {
          try {
            const response = await fetch(url);
            if (response.ok) {
              await fontCache.put(url, response);
              // Parse CSS to find font file URLs and cache them
              const css = await response.text();
              const fontFileUrls = css.match(/url\(([^)]+)\)/g) || [];
              for (const fontFileMatch of fontFileUrls) {
                const fontFileUrl = fontFileMatch.replace(/url\(|\)/g, '').replace(/['"]/g, '');
                if (fontFileUrl.startsWith('http')) {
                  try {
                    const fontResponse = await fetch(fontFileUrl);
                    if (fontResponse.ok) {
                      await fontCache.put(fontFileUrl, fontResponse);
                    }
                  } catch (_) {
                    // skip
                  }
                }
              }
            }
          } catch (_) {
            // skip
          }
        }
      } catch (_) {
        // skip
      }

      self.skipWaiting();
    })()
  );
});

// ─── ACTIVATE ───────────────────────────────────────────────────────────────

self.addEventListener('activate', (event) => {
  const ALLOWED_CACHES = new Set([
    CACHE_NAME,
    PRAYER_CACHE,
    STATIC_CACHE,
    IMAGE_CACHE,
    FONT_CACHE,
  ]);

  event.waitUntil(
    (async () => {
      // Delete old caches
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((name) => !ALLOWED_CACHES.has(name))
          .map((name) => caches.delete(name))
      );

      // Claim all clients immediately
      self.clients.claim();
    })()
  );
});

// ─── FETCH ──────────────────────────────────────────────────────────────────

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests, Supabase, API routes, OpenRouter
  if (request.method !== 'GET') return;
  if (shouldSkipRequest(url)) return;

  // 1. Google Fonts — Cache-First (critical for offline)
  if (isFontRequest(url)) {
    event.respondWith(cacheFirst(request, FONT_CACHE));
    return;
  }

  // 2. Aladhan prayer API — Stale-While-Revalidate
  if (url.hostname === 'api.aladhan.com') {
    event.respondWith(staleWhileRevalidate(request, PRAYER_CACHE));
    return;
  }

  // 3. Navigation requests — Network-First with offline fallback
  if (isNavigationRequest(event)) {
    event.respondWith(networkFirstWithOffline(request));
    return;
  }

  // 4. JS/CSS bundles — Cache-First
  if (/\.(js|css)$/.test(url.pathname)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // 5. Images — Cache-First
  if (/\.(png|jpg|jpeg|svg|ico|webp|gif)$/.test(url.pathname)) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE));
    return;
  }

  // 6. _next/static/ path — Cache-First (catches hashed bundles)
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // 7. Manifest and icons — Cache-First
  if (url.pathname === '/manifest.json' || url.pathname.startsWith('/icons/')) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // 8. All other same-origin requests — Network-First
  if (isSameOrigin(url)) {
    event.respondWith(networkFirstWithOffline(request));
    return;
  }

  // 9. Cross-origin requests — Network-First
  event.respondWith(networkFirstWithOffline(request));
});

// ─── CACHING STRATEGIES ─────────────────────────────────────────────────────

/**
 * Cache-First: return cached version if available, otherwise fetch and cache.
 */
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

/**
 * Network-First: try network, fall back to cache, then offline page.
 */
async function networkFirstWithOffline(request) {
  try {
    const response = await fetch(request);
    // Cache successful responses for offline use
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    // Network failed — try cache
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    if (cached) return cached;

    // Last resort — serve offline page
    const offlineCache = await caches.open(CACHE_NAME);
    const offlineResponse = await offlineCache.match(OFFLINE_URL);
    if (offlineResponse) return offlineResponse;

    // Final fallback — basic offline message
    return new Response(
      `<!DOCTYPE html>
      <html lang="en">
      <head><meta charset="utf-8"><title>Offline — DeenFlow</title></head>
      <body style="display:flex;justify-content:center;align-items:center;min-height:100vh;background:#0F172A;color:#e2e8f0;font-family:system-ui;text-align:center;padding:2rem;">
        <div>
          <h1 style="font-size:1.5rem;margin-bottom:0.5rem;">You're offline</h1>
          <p>Please check your internet connection and try again.</p>
        </div>
      </body>
      </html>`,
      { status: 503, headers: { 'Content-Type': 'text/html' } }
    );
  }
}

/**
 * Stale-While-Revalidate: return cached version immediately,
 * fetch in background and update cache for next time.
 */
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cached);

  return cached || fetchPromise;
}

// ─── BACKGROUND SYNC ────────────────────────────────────────────────────────

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-user-data') {
    console.log('[SW] Background sync triggered');
  }
});
