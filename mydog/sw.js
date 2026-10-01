// Service Worker for PWA - MyDog
// Only caches owned by the /mydog/ app are managed here.
const STATIC_CACHE = 'mydog-static-v3';
const IMAGE_CACHE = 'mydog-images-v1';
const OWNED_CACHE_PREFIX = 'mydog-';
const APP_SHELL = [
    '/mydog/',
    '/mydog/index.html',
    '/mydog/style.css',
    '/mydog/script.js',
    '/mydog/data.js',
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
            .then(cache => cache.addAll(APP_SHELL))
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
    return request.destination === 'image' && IMAGE_HOSTS.has(url.host);
}

function cacheSuccessfulResponse(cache, request, response) {
    if (response && (response.ok || response.type === 'opaque')) {
        cache.put(request, response.clone()).catch(() => {});
    }
    return response;
}

function appShellRequest(event, url) {
    const request = event.request;
    return caches.open(STATIC_CACHE).then(cache => {
        if (isDocumentRequest(request, url)) {
            return fetch(request)
                .then(response => cacheSuccessfulResponse(cache, request, response))
                .catch(() => cache.match('/mydog/index.html'));
        }

        return cache.match(request)
            .then(cached => cached || fetch(request).then(response => cacheSuccessfulResponse(cache, request, response)));
    });
}

function imageRequest(event) {
    return caches.open(IMAGE_CACHE).then(cache => {
        return cache.match(event.request).then(cached => {
            if (cached) return cached;
            return fetch(event.request)
                .then(response => cacheSuccessfulResponse(cache, event.request, response));
        });
    });
}

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    const url = new URL(event.request.url);
    if (isAppRequest(url)) {
        event.respondWith(appShellRequest(event, url));
    } else if (isAllowedImageRequest(event.request, url)) {
        event.respondWith(imageRequest(event));
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
