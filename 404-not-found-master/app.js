// registrasi service worker
if('serviceWorker' in navigator) { // Apakah serviceWorker di support?
  // jika true, lakukan registrasi
  navigator.serviceWorker.register('/sw.js')
   .then(reg => {
    //  registrasi bekerja
    console.log("Registrasi Sukses dengan cakupan: ", reg.scope);
   }).catch(err => {
    //  registrasi gagal
    console.log("Registrasi Gagal:", err);
   });
}

