import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';

// Listen for skip waiting message from PWAUpdatePrompt
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Bypass OAuth redirects — must come before precacheAndRoute
self.addEventListener('fetch', (event) => {
  try {
    if (new URL(event.request.url).pathname.startsWith('/~oauth')) {
      event.respondWith(fetch(event.request));
    }
  } catch (e) {
    // ignore malformed URLs
  }
});

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

// ─── Push Notification Handler ───
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  event.waitUntil(
    self.registration.showNotification(data.title || 'Revela', {
      body: data.body || 'Sua leitura diária está esperando. 📖',
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      tag: 'revela-daily',
      data: { url: data.url || '/leitor' },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/leitor';
  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ('focus' in client) {
            return client.focus();
          }
        }
        return self.clients.openWindow(url);
      })
  );
});
