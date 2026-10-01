// Service Worker for PWA - Hundefinder
const CACHE_NAME = 'mydog-v1';
const ASSETS_TO_CACHE = [
    '/mydog/',
    '/mydog/index.html',
    '/mydog/style.css',
    '/mydog/script.js',
    '/mydog/data.js',
    '/mydog/manifest.json',
    'https://fonts.googleapis.com/css?family=Segoe+UI',
    'https://images.unsplash.com/photo-1568572933382-74d440642017?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1529429617124-95b44e41a3b2?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1551717743-49959800b1f6?w=400&h=300&fit=crop'
];

// Install Service Worker
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Caching assets...');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => {
                console.log('Service Worker: Assets cached successfully');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('Service Worker: Error caching assets:', error);
            })
    );
});

// Activate Service Worker
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating...');
    
    // Remove old caches
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log(`Service Worker: Removing old cache ${cacheName}`);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
        .then(() => {
            console.log('Service Worker: Activated and ready to serve');
            return self.clients.claim();
        })
    );
});

// Fetch Event - Serve from cache or fetch from network
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    
    // Skip POST requests and non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }
    
    // Skip requests to other origins (CORS)
    if (url.origin !== self.location.origin && !url.pathname.includes('unsplash.com')) {
        return;
    }
    
    // Strategy: Cache first, then network
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) {
                    console.log(`Service Worker: Serving ${event.request.url} from cache`);
                    return response;
                }
                
                console.log(`Service Worker: Fetching ${event.request.url} from network`);
                return fetch(event.request)
                    .then((response) => {
                        // Clone the response to cache it
                        const responseClone = response.clone();
                        
                        // Cache images from Unsplash
                        if (url.pathname.includes('unsplash.com')) {
                            caches.open(CACHE_NAME)
                                .then((cache) => {
                                    cache.put(event.request, responseClone);
                                });
                        }
                        
                        return response;
                    });
            })
            .catch((error) => {
                console.error('Service Worker: Error fetching:', error);
                // Fallback: Return a simple offline page
                if (event.request.destination === 'document') {
                    return caches.match('/mydog/index.html');
                }
            })
    );
});

// Push Notification Support
self.addEventListener('push', (event) => {
    const data = event.data.json();
    
    const options = {
        body: data.body,
        icon: '/mydog/icon-192x192.png',
        badge: '/mydog/icon-192x192.png',
        data: {
            url: data.url || '/mydog/'
        }
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Notification Click Handler
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    if (event.notification.data && event.notification.data.url) {
        event.waitUntil(
            clients.openWindow(event.notification.data.url)
        );
    }
});

// Background Sync Support
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-favorites') {
        event.waitUntil(syncFavorites());
    }
});

async function syncFavorites() {
    // This would sync favorites with a server if we had one
    console.log('Service Worker: Syncing favorites...');
    return Promise.resolve();
}

// Periodic Background Sync (every 24 hours)
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'daily-sync') {
        event.waitUntil(syncFavorites());
    }
});

console.log('Service Worker: Loaded and ready');
