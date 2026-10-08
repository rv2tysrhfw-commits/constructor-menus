var CACHE = 'menus-v2';
var FILES = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    new Promise(function (resolve) {
      var done = false;
      var fromCache = function () { return caches.match(e.request, { ignoreSearch: true }).then(function (h) { return h || caches.match('index.html'); }); };
      var t = setTimeout(function () { fromCache().then(function (h) { if (h && !done) { done = true; resolve(h); } }); }, 3000);
      fetch(e.request).then(function (res) {
        clearTimeout(t);
        if (res && res.ok && new URL(e.request.url).origin === location.origin) { var c = res.clone(); caches.open(CACHE).then(function (ca) { ca.put(e.request, c); }); }
        if (!done) { done = true; resolve(res); }
      }).catch(function () { clearTimeout(t); if (!done) fromCache().then(function (h) { done = true; resolve(h || Response.error()); }); });
    })
  );
});
