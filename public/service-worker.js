// Cache name
const CACHE_NAME = 'zakharmony-offline-v1';

// Files to cache
const urlsToCache = [
  '/',
  '/offline',
  '/locales/fr/common.json',
  '/locales/en/common.json',
];

// Dynamic routes that should be handled
const DYNAMIC_ROUTES = [
  /^\/jam\/[a-zA-Z0-9-]+$/,
  /^\/playlist\/[a-zA-Z0-9-]+$/,
  /^\/album\/[a-zA-Z0-9-]+$/,
  /^\/artist\/[a-zA-Z0-9-]+$/
];

// Install service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Helper function to check if URL matches dynamic routes
const isDynamicRoute = (url) => {
  const pathname = new URL(url).pathname;
  return DYNAMIC_ROUTES.some(pattern => pattern.test(pathname));
};

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached response if found
        if (response) {
          return response;
        }

        // Clone the request because it can only be used once
        const fetchRequest = event.request.clone();

        // Handle dynamic routes and navigation requests differently
        if (event.request.mode === 'navigate' || isDynamicRoute(event.request.url)) {
          return fetch(fetchRequest, {
            redirect: 'follow',
            credentials: 'include'
          }).catch(() => {
            // If offline, return the offline page for navigation requests
            return caches.match('/offline');
          });
        }

        // For other requests, try to fetch from network
        return fetch(fetchRequest, {
          redirect: 'follow',
          credentials: 'include'
        }).catch(() => {
          // Return offline content for non-navigation requests
          return new Response('Offline content not available');
        });
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Handle messages from the client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
}); 