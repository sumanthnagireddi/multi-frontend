/**
 * Service Worker for Private Finance Ledger PWA
 * Strategy:
 *   - Static assets (JS/CSS/fonts/images) → Cache First
 *   - Navigation (HTML pages) → Network First with cache fallback
 *   - API requests → Network First with no cache
 */

const CACHE_NAME = 'finance-ledger-v2';
const STATIC_ASSETS = [
  '/',
  '/finance/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
];

// ─── Install ──────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// ─── Activate ─────────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ─── Fetch ────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and API calls (let those go to network)
  if (request.method !== 'GET') return;
  if (url.pathname.startsWith('/api/')) return;
  if (url.hostname !== location.hostname) return;

  // Static assets (JS, CSS, images, fonts) → Cache First
  if (
    url.pathname.match(/\.(js|css|png|jpg|jpeg|webp|svg|gif|ico|woff2?|ttf)$/)
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (!response || response.status !== 200) return response;
          const clone = response.clone();
          caches.open(CACHE_NAME).then((c) => c.put(request, clone));
          return response;
        });
      })
    );
    return;
  }

  // Navigation / HTML → Network First with cache fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((c) => c.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(request).then((c) => c || caches.match('/')))
    );
  }
});
