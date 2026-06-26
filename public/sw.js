/*
 * DeenFlow Service Worker
 *
 * Caching strategies:
 *   - Static assets: Cache-First
 *   - Page navigations: Network-First (fallback to /offline)
 *   - Aladhan prayer API: Stale-While-Revalidate
 *   - JS/CSS bundles: Cache-First
 *   - Images: Cache-First
 *
 * Excluded from interception:
 *   - Supabase (*.supabase.co)
 *   - Next.js API routes (/api/*)
 *   - OpenRouter (openrouter.ai)
 */

const CACHE_NAME = 'deenflow-v1';
const PRAYER_CACHE = 'prayer-api';
const STATIC_CACHE = 'static-resources';
const IMAGE_CACHE = 'images';
const OFFLINE_URL = '/offline';

// Assets to precache on install
const PRECACHE_ASSETS = [
  '/',
  '/offline',
  '/login',
  '/_next/static/',
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function shouldSkipRequest(url) {
  // Skip Supabase, Next.js API routes, and OpenRouter
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

// ─── INSTALL ────────────────────────────────────────────────────────────────

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      // Precache known static routes
      for (const asset of PRECACHE_ASSETS) {
        try {
          const response = await fetch(asset);
          if (response.ok) {
            await cache.put(asset, response);
          }
        } catch (err) {
          // Offline during install — skip this asset, it'll be fetched on first visit
          console.warn(`[SW] Could not precache ${asset}:`, err.message);
        }
      }

      // Attempt to warm the _next/static cache with a broad match
      // We can't enumerate every file here, so we rely on runtime caching for _next/static.
      // However, we can try fetching the root page and its linked scripts.
      try {
        const rootResponse = await fetch('/');
        if (rootResponse.ok) {
          const html = await rootResponse.text();
          // Extract /_next/static/... script and link hrefs
          const matches = html.match(/\/_next\/static\/[^"'\s)]+/g) || [];
          for (const match of matches) {
            try {
              const res = await fetch(match);
              if (res.ok) {
                await cache.put(match, res);
              }
            } catch (_) {
              // skip individual failures
            }
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

  // 1. Aladhan prayer API — Stale-While-Revalidate
  if (url.hostname === 'api.aladhan.com') {
    event.respondWith(staleWhileRevalidate(request, PRAYER_CACHE));
    return;
  }

  // 2. Navigation requests — Network-First with offline fallback
  if (isNavigationRequest(event)) {
    event.respondWith(networkFirstWithOffline(request));
    return;
  }

  // 3. JS/CSS bundles — Cache-First
  if (/\.(js|css)$/.test(url.pathname)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // 4. Images — Cache-First
  if (/\.(png|jpg|jpeg|svg|ico|webp)$/.test(url.pathname)) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE));
    return;
  }

  // 5. _next/static/ path — Cache-First (catches hashed bundles not ending in .js/.css)
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // 6. All other same-origin navigations — Network-First
  if (isSameOrigin(url)) {
    event.respondWith(networkFirstWithOffline(request));
    return;
  }

  // 7. Cross-origin requests (not excluded above) — Network-First
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
    // Return a basic offline response for critical assets
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
    console.log('[SW] Background sync triggered — implement Supabase sync here');
    // TODO: Implement actual Supabase sync logic here
    // Example:
    //   event.waitUntil(syncUserDataToSupabase());
  }
});
