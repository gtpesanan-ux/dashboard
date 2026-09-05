# V22 — Ikon, sambungan bidang, dan motion Digdaya

Tanggal: 5 September 2026.
Baseline tunggal: `PT(20260905-050754).zip` yang dilampirkan pada permintaan ini.

## Perubahan

1. **Footer menyatu dengan bagian sebelumnya.** Margin atas 25 px yang menampilkan warna body di belakang gelombang diubah menjadi nol. Gelombang menumpang pada bidang sebelumnya dengan overlap 1 px. Warna SVG dan pangkal gradasi footer memakai nilai navy yang sama; gradasi footer berlanjut di bawah pangkal tersebut.
2. **Ikon sosial presisi.** Tata letak konsisten empat kolom, diameter 48 px pada ponsel dan 52 px pada layar lebih besar. Semua ikon tampil sebagai SVG; Threads menggunakan bentuk Threads, dan LinkedIn menggunakan vektor sebagai pengganti teks. Ukuran optis setiap ikon diseimbangkan. Nama aksesibel dan tujuan tautan lama tetap digunakan. Kanal yang belum mempunyai tautan tetap seperti baseline.
3. **61 separator di bagian isi, tersebar pada 38 HTML.** Wave/arc ditempatkan pada peralihan bidang; garis lengkung tipis digunakan pada bidang sewarna, bagian baca, dan navigator yang memerlukan pembatasan overflow. Tidak ada teks, bagian, gambar, atau kartu yang dihilangkan. Daftar penempatan rinci tersedia pada `VALIDATION-V22.json`.
4. **Warna separator mengikuti permukaan.** Bagian formulir yang memakai gradasi mendapat pangkal warna yang sama dengan isi SVG. Gradasi lama tetap berlanjut di bawah pangkal tersebut. Gelombang tidak dipaksakan keluar dari container navigator yang memang harus memotong overflow.
5. **Animasi tambahan.** Gelombang bergerak horizontal perlahan, garis kontur digambar bertahap, dan ikon muncul berurutan. Posisi area klik tidak ikut bergerak. Gerakan dekorasi berhenti saat di luar viewport atau tab tidak terlihat. Preferensi reduced motion dihormati oleh kode dan media query tambahan.
6. **Pemicu reveal judul diperbaiki.** Pada V16, judul memakai `clip-path: inset(0 0 100% 0)` sekaligus diamati menggunakan IntersectionObserver. Mask penuh dapat membuat intersection kosong dan judul tidak pernah muncul ketika di-scroll. V22 memeriksa kotak layout judul yang masih menunggu melalui requestAnimationFrame, kemudian menyalakan class reveal yang sudah ada. Mask, durasi, easing, dan stagger lama dipertahankan.
7. **Pemilih WhatsApp footer diperbaiki.** Panel kontak mengambang memang disembunyikan oleh aturan collision V21 ketika footer terlihat. Tombol WhatsApp footer kini membuka dialog native dengan tiga tujuan WhatsApp yang disalin dari tautan footer yang sudah ada. Close, Escape, dan pengembalian fokus diuji. Tidak ada nomor baru dan tidak ada pesan yang dikirim saat pengujian.
8. **Fingerprint CSP diperbarui.** `.htaccess` dan `_headers` masing-masing mendapat satu hash CSS dan satu hash JavaScript V22. Semua hash dan pembatasan lama tetap dipertahankan; tidak ada penambahan `unsafe-inline` pada script atau perubahan kebijakan akses.

## Preservasi dan cakupan

- Arsip sumber memuat 197 berkas, di luar entri direktori.
- Perubahan mencakup 38 HTML serta dua berkas konfigurasi CSP (`.htaccess` dan `_headers`). Sebanyak 157 berkas asli lainnya identik secara byte, termasuk seluruh aset gambar/video, logo, dan CSS/JS eksternal. Dua konfigurasi tersebut hanya mendapat tambahan hash untuk mengizinkan kode V22 yang tepat.
- Setiap blok CSS dan JavaScript lama di dalam HTML tetap hadir byte-for-byte; V22 menambahkan satu blok style dan satu blok script per HTML.
- Semua nama animasi lama tetap ada. Tidak ada perubahan pada keyframe, durasi, atau easing lama.
- Tujuan tautan, formulir, gambar, dan video asli dipertahankan. Perubahan isi teks hanya menyangkut glyph ikon `in` dan `@` yang diganti dengan SVG; konten editorial tetap sama.
- Halaman tetap mandiri untuk CSS dan JavaScript; tidak ada dependensi CDN atau pustaka baru yang perlu dimuat saat situs berjalan.
- Dokumen V16–V21 tetap disertakan sebagai histori. Status perubahan terbaru adalah V22.

## Rujukan desain yang dipelajari

Rujukan berikut digunakan untuk mempelajari prinsip, bukan menyalin layout, aset, atau kode situs. Daftar ini bukan klaim peringkat universal nomor 1–10.

- [Linear — konsistensi token dan perilaku interaksi](https://linear.app/now/styling-linear-for-the-future-stylex): ukuran, warna, batas komponen, serta perilaku hover/fokus yang konsisten.
- [Linear — penyempurnaan antarmuka](https://linear.app/now/behind-the-latest-design-refresh): hirarki yang tenang dan detail yang konsisten.
- [Stripe](https://stripe.com/en-it): ritme bagian dan penyajian layanan secara terstruktur.
- [Lusion](https://lusion.co/) dan [studi kasus Lusion di Awwwards](https://www.awwwards.com/case-study-for-lusion-by-lusion-winner-of-site-of-the-month-may.html): gerakan sebagai bagian dari pengalaman visual.

Ikon Threads bersumber dari Simple Icons v16.0.0, proyek CC0: [Simple Icons](https://simpleicons.org/). SVG diambil dari `https://cdn.jsdelivr.net/npm/simple-icons@16.0.0/icons/threads.svg` dan ditanam langsung ke HTML; situs tidak menghubungi alamat tersebut saat digunakan.

## Pemasangan

1. Simpan salinan versi yang sedang digunakan sebelum mengganti berkas.
2. Isi ZIP ini berada langsung di tingkat utama: `index.html`, HTML lain, `assets/`, dan konfigurasi asli. Ekstrak ke folder website yang benar, misalnya `public_html` atau document root subdomain yang digunakan. Tidak ada lapisan folder `PT/` tambahan.
3. Jika memakai proses salin selektif, salin seluruh 38 HTML V22 beserta `.htaccess` dan `_headers`. Dua berkas konfigurasi ini wajib ikut sesuai platform hosting agar CSS/JavaScript V22 tidak diblokir CSP. Aset pendukungnya tetap sama dengan baseline.
4. Setelah penggantian, muat ulang halaman dan bersihkan cache situs/CDN bila tampilan lama masih tersimpan.

Tidak perlu membuat database, tabel, environment variable, atau menjalankan build.

## Batas pengujian

Pengujian menggunakan browser Chromium dengan viewport dokumen 390, 768, dan 1440 px melalui fixture responsif. Pengujian ini bukan pengujian pada Safari iPhone fisik. Browser memakai scrollbar desktop, sehingga lebar area isi dapat 15 px lebih sempit daripada viewport; perbandingan overflow menggunakan lebar area isi yang sebenarnya.

Pengujian interaksi mencakup menu ponsel, submenu Digital, Escape, menu tablet, kontrol cerita hero desktop, reveal judul saat scroll, serta buka/tutup pemilih WhatsApp footer. Ini bukan klaim telah menguji setiap kombinasi isian seluruh formulir, seluruh layanan eksternal, atau seluruh browser. Tidak ada deployment atau transaksi eksternal yang dijalankan.

Detail pemeriksaan arsip, struktur, preservasi, media, dan layout berada pada `VALIDATION-V22.json`. Checksum berkas paket berada pada `FILE-MANIFEST-V22.json`.

Kecocokan semua hash inline dengan CSP diperiksa. Pengujian browser untuk direktif `script-src`/`style-src` membandingkan whitelist lama dan whitelist V22: whitelist lama memblokir tambahan V22, sedangkan whitelist baru menjalankannya. Pengujian ini tidak mengklaim telah menjalankan seluruh konfigurasi Apache atau header CDN pada server produksi.
