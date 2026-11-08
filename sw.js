const cachePrefix = 'leopoldi-' + self.registration.scope + '-';
const version = cachePrefix + 'v1';
const files = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(version).then((cache) => cache.addAll(files)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(
    keys.filter((key) => key.startsWith(cachePrefix) && key !== version).map((key) => caches.delete(key)),
  )).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (!url.href.startsWith(self.registration.scope)) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).catch(async () => {
      const cache = await caches.open(version);
      return cache.match('./index.html');
    }));
    return;
  }
  if (!files.some((file) => new URL(file, self.registration.scope).href === url.href)) return;
  event.respondWith(caches.open(version).then(async (cache) => (await cache.match(event.request)) ?? fetch(event.request)));
});
