// Service Worker for PWA - MyDog
// Only caches owned by the /mydog/ app are managed here.
//
// Strategy:
// - App files (HTML, JS, CSS, data, manifest, icons): network-first, cache only as offline fallback.
//   Every online visit therefore receives the deployed version; a stale script can no longer be
//   combined with newer HTML (that mismatch broke returning visitors after the share-image release).
// - Versioned, locally hosted dog photos: cache-first with a bounded entry count.
const STATIC_CACHE = 'mydog-static-v8';
const IMAGE_CACHE = 'mydog-images-v3';
const IMAGE_CACHE_LIMIT = 160;
const OWNED_CACHE_PREFIX = 'mydog-';
const APP_SHELL = [
    '/mydog/',
    '/mydog/index.html',
    '/mydog/style.css',
    '/mydog/script.js',
    '/mydog/data.js',
    '/mydog/legal/attribution.html',
    '/mydog/photo-sources.json',
    '/mydog/manifest.json',
    '/mydog/icon-192x192.png',
    '/mydog/icon-512x512.png'
];
const IMAGE_HOSTS = new Set([
    'images.dog.ceo',
    'upload.wikimedia.org',
    'thumb.wikimedia.org'
]);

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE)
            // Bypass the HTTP cache so the offline copy always matches the deployed release.
            .then(cache => cache.addAll(APP_SHELL.map(url => new Request(url, { cache: 'reload' }))))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then(cacheNames => Promise.all(
                cacheNames
                    .filter(name => name.startsWith(OWNED_CACHE_PREFIX) && ![STATIC_CACHE, IMAGE_CACHE].includes(name))
                    .map(name => caches.delete(name))
            ))
            .then(() => self.clients.claim())
    );
});

function isAppRequest(url) {
    return url.origin === self.location.origin && url.pathname.startsWith('/mydog/');
}

function isDocumentRequest(request, url) {
    return request.mode === 'navigate' || url.pathname === '/mydog/' || url.pathname.endsWith('/index.html');
}

function isAllowedImageRequest(request, url) {
    return request.destination === 'image' && (
        (url.origin === self.location.origin && url.pathname.startsWith('/mydog/images/v1/'))
        || IMAGE_HOSTS.has(url.host)
    );
}

// Cache app files under their path only, so versioned URLs (?v=…) and profile links (?dog=…)
// share one offline entry instead of piling up.
function appCacheKey(url) {
    return url.origin + url.pathname;
}

function appRequest(event, url) {
    const request = event.request;
    const key = appCacheKey(url);
    return caches.open(STATIC_CACHE).then(cache =>
        fetch(request)
            .then(response => {
                if (response && response.ok && response.type === 'basic') {
                    cache.put(key, response.clone()).catch(() => {});
                }
                return response;
            })
            .catch(() => cache.match(key).then(cached => {
                if (cached) return cached;
                if (isDocumentRequest(request, url)) return cache.match('/mydog/index.html');
                return Response.error();
            }))
    );
}

function trimImageCache(cache) {
    return cache.keys().then(keys => {
        const overflow = keys.length - IMAGE_CACHE_LIMIT;
        if (overflow <= 0) return;
        return Promise.all(keys.slice(0, overflow).map(key => cache.delete(key)));
    }).catch(() => {});
}

function imageRequest(event) {
    return caches.open(IMAGE_CACHE).then(cache =>
        cache.match(event.request).then(cached => {
            if (cached) return cached;
            return fetch(event.request).then(response => {
                if (response && (response.ok || response.type === 'opaque')) {
                    cache.put(event.request, response.clone())
                        .then(() => trimImageCache(cache))
                        .catch(() => {});
                }
                return response;
            });
        })
    );
}

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    const url = new URL(event.request.url);
    if (isAllowedImageRequest(event.request, url)) {
        event.respondWith(imageRequest(event));
    } else if (isAppRequest(url)) {
        event.respondWith(appRequest(event, url));
    }
});

// Optional notification support remains isolated from app caching.
self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : {};
    event.waitUntil(self.registration.showNotification(data.title || 'MyDog', {
        body: data.body || '',
        icon: '/mydog/icon-192x192.png',
        badge: '/mydog/icon-192x192.png',
        data: { url: data.url || '/mydog/' }
    }));
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const url = event.notification.data?.url || '/mydog/';
    event.waitUntil(clients.openWindow(url));
});

self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-favorites') event.waitUntil(Promise.resolve());
});

self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'daily-sync') event.waitUntil(Promise.resolve());
});
