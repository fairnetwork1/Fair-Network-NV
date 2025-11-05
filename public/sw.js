
// A basic service worker for PWA capabilities

self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  // The service worker is installed.
  // You can pre-cache assets here if needed.
  event.waitUntil(self.skipWaiting()); // Activate worker immediately
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  // The service worker is activated.
  // Clean up old caches here.
  event.waitUntil(self.clients.claim()); // Become available to all pages
});

self.addEventListener('fetch', (event) => {
  // This fetch handler is required for the app to be considered installable.
  // For a basic PWA, we can use a network-first strategy.
  event.respondWith(
    fetch(event.request).catch(() => {
      // If the network fails, you could serve a fallback page from the cache.
      // For this basic setup, we just let the network request fail.
      // A more robust implementation would use caches.
    })
  );
});
