const CACHE_NAME = 'cellar-v3';
const ASSETS = [
  './',
  './index.html',
  './lektioner.html',
  './lektion.html',
  './druvor.html',
  './lander.html',
  './kartor.html',
  './matvin.html',
  './kallare.html',
  './identifiera.html',
  './identifiera-foto.html',
  './quiz.html',
  './flashcards.html',
  './framsteg.html',
  './sok.html',
  './css/style.css',
  './css/lektion.css',
  './css/druvor.css',
  './css/quiz.css',
  './css/mobile.css',
  './js/lektion.js',
  './js/druvor.js',
  './js/quiz.js',
  './js/mobile-nav.js',
  './data/druvor.json',
  './data/kursstruktur.json',
  './data/lektion-druvor.json',
  './data/lektion-kartor.json',
  './icons/icon-192.png',
  './provning.html',
  './terminsprov.html',
  './smakprofil.html',
  './vinlista.html',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('api.anthropic.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetched = fetch(event.request).then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => cached);

      return cached || fetched;
    })
  );
});
