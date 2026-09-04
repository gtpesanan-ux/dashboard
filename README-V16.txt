PT DIGDAYA INOVASI NUSANTARA — RELEASE V16
Tanggal: 2026-09-04

Paket ini adalah website statis siap unggah. Letakkan seluruh isi folder pada document root hosting; tidak ada build step dan tidak ada dependency eksternal saat runtime.

Koreksi final — HTML inline
- Seluruh CSS operasional sudah ditanam langsung ke 38 halaman HTML: 308 blok tertanam, 0 link stylesheet tersisa.
- Seluruh JavaScript operasional sudah ditanam langsung ke 38 halaman HTML: 351 blok tertanam, 0 script src tersisa.
- Urutan setiap blok CSS/JavaScript dipertahankan sesuai sumber agar tampilan dan perilaku tidak berubah.
- File .css dan .js lama tetap tersedia di assets hanya sebagai salinan sumber/preservasi; halaman HTML tidak bergantung pada file tersebut untuk render atau interaksi.
- Referensi gambar internal dari CSS sudah disesuaikan setelah proses inlining.
- Hash CSP di _headers dan .htaccess sudah dihitung ulang dari byte blok inline final dan tetap tidak memakai unsafe-inline untuk script.
- Deklarasi UTF-8 sekarang berada di dalam 1.024 byte pertama pada seluruh HTML.

Isi utama
- 38 halaman HTML.
- 36 halaman indexable di sitemap; 404.html dan detail berita dinamis tetap noindex.
- dukungan.html adalah hub dukungan baru dan sudah terhubung di menu, footer, breadcrumb, serta sitemap.
- Header sticky dibuat opak agar konten tidak menembus ketika scroll.
- Kartu mobile dipadatkan tanpa menghapus konten atau interaksi.
- Motion V16 menambah reveal, media wipe, parallax mikro, card depth, progress, view transition, dan reduced-motion fallback tanpa menghapus animasi lama yang masih relevan.
- Form konsultasi memiliki fallback mailto POST text/plain; tidak ada klaim bahwa data disimpan di server.

Kebijakan gambar
- Foto konten, layanan, dan berita: tanpa teks promosi tertanam.
- Copy campaign, promo, dan newsroom: HTML overlay agar responsif, dapat diakses, dan mudah diedit.
- Teks raster hanya dipakai untuk kebutuhan yang memang memerlukannya: logo, social/OG card, diagram alur, dan satu bukti antarmuka top-up.
- IMAGE-PLAN-V16.md mencatat pemetaan aset secara rinci.

Konfigurasi hosting
- _headers untuk platform yang mendukung format Netlify-style headers.
- .htaccess untuk Apache/cPanel.
- _redirects untuk fallback halaman.
- CSP, HSTS, COOP, CORP, Permissions-Policy, Referrer-Policy, dan nosniff sudah disertakan.
- Unggah seluruh folder, termasuk assets, karena gambar dan video tetap memakai file media relatif. Hanya CSS dan JavaScript yang ditanam ke HTML sesuai ketentuan build ini.

Validasi
- Lihat VALIDATION-V16.json untuk metrik dan semua gate.
- Lihat FILE-MANIFEST-V16.json untuk ukuran dan SHA-256 setiap file di paket (manifest tidak mencantumkan dirinya sendiri).

Catatan operasional
- Nomor, email, stok, harga, ketersediaan, dan kebijakan harus diverifikasi kembali sebelum produksi bila berubah.
- Enam gambar kategori berita Digital/Pariwisata dipertahankan sebagai fallback kontrak runtime; tidak diunduh browser sampai kategori tersebut benar-benar dipakai.
