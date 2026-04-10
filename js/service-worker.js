const CACHE_NAME = 'agendaplus-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './css/style.css',
    './js/app.js',
    './js/ui.js',
    './js/storage.js',
    './js/calendar.js',
    './js/finance.js',
    './js/report.js',
    './manifest.json',
    'https://unpkg.com/@phosphor-icons/web',
    'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
        .then((response) => {
            // Retorna do cache se encontrar, senão faz a requisição na rede
            return response || fetch(event.request);
        })
    );
});
