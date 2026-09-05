# PT Digdaya Inovasi Nusantara — Revisi V24

Revisi ini mengarahkan pembelian ke portal pelanggan yang sudah dimiliki perusahaan. Website publik berfungsi sebagai pengantar layanan; pelanggan masuk atau mendaftar untuk membeli, membayar melalui payment gateway, dan mengelola pesanan di portal tersebut.

## Perubahan utama

- Menu desktop dan mobile menampilkan **Masuk / Daftar** dengan keterangan **Belanja & bayar otomatis**. Pada mobile, akses akun ditempatkan di awal menu agar segera terlihat.
- Tiga formulir transaksi publik diganti dengan pengantar dan tombol menuju portal pelanggan, sehingga tidak ada alur pemesanan kedua yang menyaingi fitur di dalam akun.
- Tujuh panduan nontransaksi tetap tersedia untuk membantu pelanggan memahami kebutuhannya.
- WhatsApp dipertahankan sebagai saluran bantuan. Arah utama pembelian adalah portal pelanggan.
- Animasi dan media yang sudah ada dipertahankan. Revisi mengikuti tampilan, warna, dan perilaku navigasi yang sudah digunakan.

## Alamat portal dinamis

Tautan bawaan adalah **`/masuk.html`**. Tautan ini mengikuti protokol dan host website yang sedang dibuka, termasuk subdomainnya. Jika website dipindahkan ke domain lain dan halaman masuk berada pada host yang sama, tidak perlu mengganti alamat pada setiap HTML.

Alamat ini tidak menebak atau menemukan subdomain lain secara otomatis. Jika portal pelanggan berada pada host yang berbeda, atur satu kali nilai `origin` di **`assets/portal-config.js`**.

```js
window.DIGDAYA_PORTAL_CONFIG = {
  origin: "https://akun.example.com"
};
```

**`https://akun.example.com` di atas hanya contoh pengganti, bukan alamat portal perusahaan.** Ganti dengan origin HTTPS portal sebenarnya. Isi hanya protokol dan host; jangan menambahkan `/masuk.html`, path lain, parameter, fragmen, atau informasi akun. Path tujuan tetap **`/masuk.html`** dan ditambahkan oleh resolver.

Pengaturan ini opsional. Nilai kosong, tidak valid, atau konfigurasi yang gagal dimuat mengembalikan tautan ke bawaan `/masuk.html`. Bila memakai origin terpisah dan alamat portal kemudian berubah, cukup perbarui file konfigurasi pusat tersebut. Jangan menambahkan domain yang belum dipastikan sebagai portal perusahaan.

## Pemasangan

Pasang HTML, folder `assets` termasuk `portal-config.js`, serta **`.htaccess` dan `_headers`** dari revisi ini bersama-sama. File kebijakan keamanan memuat izin hash untuk kode revisi; mencampurnya dengan versi lama dapat membuat kode diblokir. Pastikan file `.htaccess` ikut tersalin saat mengekstrak atau mengunggah paket.

Portal pelanggan dan backend autentikasi/payment gateway yang sudah ada tidak termasuk dalam ZIP ini. Setelah pemasangan, buka tombol Masuk / Daftar pada domain tujuan dan pastikan ia menuju portal sebenarnya. Pengujian halaman login, pendaftaran, pembayaran, serta pemrosesan pesanan di backend tersebut tidak dilakukan dalam revisi website publik ini.

## Catatan versi

Dokumen V22 dan V23 yang tetap ada di paket merupakan arsip historis. Untuk arah pembelian dan pengaturan portal yang berlaku pada revisi ini, gunakan README V24 serta laporan validasi V24. Pernyataan lama yang menjadikan WhatsApp sebagai tujuan utama pembelian tidak lagi menjadi acuan alur transaksi V24.
