let urlsToCache = [
    '/',
    '/app.js',
    '/icon.png',
    '/index.html',
    '/Scarecrow.png',
    '/style.css'
];

self.addEventListener('install', (event) => { // menambahkan event install untuk menginstall service worker=self
    // service worker tidak akan di install sampai kode di dalam waitUntil() berhasil dijalankan
    event.waitUntil(
        // membuat cache baru bernama v1 yang mengembalikan promise
        caches.open('v1').then((cache) => {
            console.log('cache dibuka');
            // pada method addAll menambahkan file yang akan di cache
            return cache.addAll(urlsToCache);
        })
    );
});