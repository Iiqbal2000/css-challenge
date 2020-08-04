// DOCUMENTATION: https://jakearchibald.github.io/isserviceworkerready/resources.html

// nama cache
const CACHE_NAME = 'v1';

// file yang di cache
let urlsToCache = [
    './',
    './app.js',
    './icon.png',
    './index.html',
    './Scarecrow.png',
    './style.css'
];

// Menginstall serviceworker
self.addEventListener('install', (event) => { // menambahkan event install untuk menginstall service worker=self
    // service worker tidak akan di install sampai kode di dalam waitUntil() berhasil dijalankan
    event.waitUntil(
        // membuat cache baru bernama v1 yang mengembalikan promise
        caches.open(CACHE_NAME).then((cache) => {
            console.log('cache dibuka');
            // pada method addAll menambahkan file yang akan di cache
            return cache.addAll(urlsToCache);
        })
    );
});



// Menyimpan cache dan mengembalikan permintaan
self.addEventListener('fetch', (event) => {
    event.respondWith(
        // memperhatikan request dan mencari file/hasil yang disimpan dalam cache dari salah satu cache yang dibuat oleh service worker
        caches.match(event.request).then((response) => {
            // jika ditemukan maka kembalikan data yang disimpan di cache, jika tidak maka melakukan request ke jaringan dan mengembalikan data
            if(response) {
                return response
            }

            /* PENTING: Mengkloning permintaan. Permintaan adalah aliran/stream dan hanya dapat dikonsumsi sekali.
            Karena kita menggunakan ini sekali dengan cache dan sekali oleh browser untuk fetch/mengambil, 
            kita perlu mengkloning responsnya. */
            let fetchRequest = event.request.clone();

            /**
            * yang akan kita lakukan:
            * 1. menambahkan callback ke .then() pada permintaan fetch
            * 2. setelah mendapatkan response, kita melakukan pemeriksaan berikut:
            *      a. pastikan response tersebut valid
            *      b. pastikan status pada response adalah 200
            *      c. pastikan tipe response adalah basic, yang menandakan
            *         bahwa permintaan tersebut berasal dari kita/original.
            *         ini berarti bahwa permintaan kepada aset pihak ketiga
            *         tidak disimpan ke dalam cache.
            * 3. Jika kita meneruskan pemeriksaan, kita meng-clone respons. 
            *    Alasannya karena respons tersebut adalah Stream, 
            *    bodinya hanya dapat dikonsumsi satu kali. Karena kita ingin
            *    menampilkan respons untuk digunakan browser, serta meneruskannya 
            *    ke cache untuk digunakan, kita perlu membuat clone-nya 
            *    agar dapat mengirimkan satu ke browser dan satu ke cache.
            */

            return fetch(fetchRequest).then(
                (response) => {
                    // apakah menerima respons yang valid
                    if(!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    /* 
                    PENTING: Mengkloning respons. Respons adalah sebuah stream/aliran dan 
                    karena kita ingin browser mengonsumsi respons serta cache yang 
                    dikonsumsi respons, kami perlu mengkloningnya sehingga kami memiliki dua aliran.
                    */
                   let responseToCache = response.clone();

                   caches.open(CACHE_NAME)
                     .then((cache) => {
                         cache.put(event.request, responseToCache);
                     });
                    
                   return response;
                }
            )
        })
    );
});

// Mengupdate service worker

/**
 * Akan ada saatnya service worker perlu diupdate. Jika saatnya tiba, 
 * Anda harus mengikuti langkah-langkah ini:
 * 
 * 1. Update file JavaScript service worker. Jika pengguna membuka situs Anda, 
 *    browser akan mencoba mendownload kembali file script yang mendefinisikan 
 *    service worker di latar belakang. Jika ada perbedaan byte pada file service worker 
 *    dibandingkan yang ada pada saat ini, maka akan dianggap new/baru.
 * 2. Service worker baru akan dijalankan dan event install akan diaktifkan.
 * 3. Sekarang service worker lama masih mengontrol halaman saat ini jadi service worker baru 
 *    akan masuk ke status waiting.
 * 4. Jika halaman situs yang saat ini terbuka ditutup, maka service worker lama 
 *    akan dinonaktifkan dan service worker baru akan mengambil alih kontrol.
 * 5. Setelah service worker baru mengambil alih kontrol, 
 *    event activate-nya akan diaktifkan.
 */

/**
 * Kode berikut akan melakukannya dengan melakukan loop pada semua cache di service worker 
 * dan menghapus cache yang tidak ditentukan dalam white list cache.
 */

 self.addEventListener('activate', (event) => {
    // var cacheAllowlist = ['pages-cache-v1', 'blog-posts-cache-v1'];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.filter((cacheName) => {
                    return cacheName != CACHE_NAME;
                }).map((cacheName) => {
                    return caches.delete(cacheName);
                })
            )
        })
    )
 });