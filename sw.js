'use strict';

const CACHE_NAME = 'member-elite-portal-v33';

const APP_SHELL = [
  './',
  './index.html',
  './styles.css',
  './date.js',
  './duties.js',
  './modules/date.js',
  './data/duties.js',
  './modal.js',
  './modals.js',
  './local-week-storage.js',
  './weekly-totals-actions.js',
  './all-days-elite.js',
  './app.js',
  './summary-image.js',
  './rota-popup.js',
  './rota.html',
  './rota-elite.js',
  './elite-tools.css',
  './elite-lock.js',
  './elite-splash.js',
  './day-modal-elite.js',
  './payin-modal-filter.js',
  './rep-on-demand.js',
  './pdf-library.js',
  './images/gallery.json',
  './images/er.jpg',
  './pwa-install.js',
  './pwa-notifications.js',
  './manifest.json',
  './icon.svg',
  './maskable-icon.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => Promise.allSettled(APP_SHELL.map(url => cache.add(url))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) return;

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put('./', copy));
          return response;
        })
        .catch(() => caches.match('./').then(cached => cached || caches.match('./index.html')))
    );
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() =>
        caches.match(event.request).then(cached => cached || new Response('', {
          status: 408,
          statusText: 'Offline'
        }))
      )
  );
});

self.addEventListener('message', event => {
  const data = event.data || {};
  if (data.type !== 'SHOW_NOTIFICATION') return;

  self.registration.showNotification(data.title || 'Member Elite', {
    body: data.body || 'New Member Elite alert',
    icon: './icon.svg',
    badge: './maskable-icon.svg',
    tag: data.tag || 'member-elite-alert',
    renotify: true,
    data: { url: data.url || './' },
    actions: [{ action: 'open', title: 'Open app' }]
  });
});

self.addEventListener('notificationclick', event => {
  event.notification.close();

  const targetUrl = new URL(event.notification.data?.url || './', self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }

      return clients.openWindow ? clients.openWindow(targetUrl) : null;
    })
  );
});