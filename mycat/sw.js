// Service Worker for PWA - MyCat
// Only caches owned by the /mycat/ app are managed here.
//
// Strategy:
// - App files (HTML, JS, CSS, data, manifest, icons): network-first, cache only as offline fallback.
//   Every online visit therefore receives the deployed version; a stale script can no longer be
//   combined with newer HTML (that mismatch broke returning visitors after the share-image release).
// - Versioned, locally hosted cat photos: cache-first with a bounded entry count.
const STATIC_CACHE = 'mycat-static-v2';
const IMAGE_CACHE = 'mycat-images-v1';
const IMAGE_CACHE_LIMIT = 160;
const OWNED_CACHE_PREFIX = 'mycat-';
const APP_SHELL = [
    '/mycat/',
    '/mycat/index.html',
    '/mycat/cats&dogs/',
    '/mycat/cats&dogs/index.html',
    '/mycat/cats&dogs/app.css',
    '/mycat/cats&dogs/app.js',
    '/mycat/cats&dogs/privacy.html',
    '/mycat/style.css',
    '/mycat/manualai-theme.css',
    '/mycat/script.js',
    '/mycat/data.js',
    '/mycat/breed-research.json',
    '/mycat/legal/privacy.html',
    '/mycat/legal/impressum.html',
    '/mycat/legal/attribution.html',
    '/mycat/photo-sources.json',
    '/mycat/manifest.json',
    '/mycat/icon-192x192.png',
    '/mycat/icon-512x512.png'
];
const IMAGE_HOSTS = new Set();

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
    return url.origin === self.location.origin && url.pathname.startsWith('/mycat/');
}

function isDocumentRequest(request, url) {
    return request.mode === 'navigate' || url.pathname === '/mycat/' || url.pathname.endsWith('/index.html');
}

function isAllowedImageRequest(request, url) {
    return request.destination === 'image' && (
        (url.origin === self.location.origin && url.pathname.startsWith('/mycat/images/v1/'))
        || IMAGE_HOSTS.has(url.host)
    );
}

// Cache app files under their path only, so versioned URLs (?v=…) and profile links (?cat=…)
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
                if (isDocumentRequest(request, url)) return cache.match('/mycat/index.html');
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
    event.waitUntil(self.registration.showNotification(data.title || 'MyCat', {
        body: data.body || '',
        icon: '/mycat/icon-192x192.png',
        badge: '/mycat/icon-192x192.png',
        data: { url: data.url || '/mycat/' }
    }));
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const url = event.notification.data?.url || '/mycat/';
    event.waitUntil(clients.openWindow(url));
});

self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-favorites') event.waitUntil(Promise.resolve());
});

self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'daily-sync') event.waitUntil(Promise.resolve());
});
