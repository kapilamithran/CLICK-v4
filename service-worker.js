self.addEventListener("install", () => {
  self.skipWaiting();
});

// This worker is network-first and never writes to Cache Storage itself
// (see the fetch handler below), so any entry that does exist here is a
// leftover from an earlier version of this file -- clear it on every
// activation so a stale cached index.html/CSS can never be served from the
// offline fallback path.
self.addEventListener("activate", event => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k)))),
    ])
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
