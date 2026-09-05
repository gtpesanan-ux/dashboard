# Digdaya V23 — WhatsApp utama dan perapian antarmuka

Revisi ini melanjutkan ZIP V22 yang terakhir diserahkan. Identitas visual navy, krem, dan emas tetap digunakan.

## Perubahan

- Seluruh tautan WhatsApp pada 38 HTML mengarah ke **0878-9252-3968** (`6287892523968`). Pilihan nomor cadangan pada footer dan panel kontak dihapus sesuai arahan satu nomor tujuan. Email tetap tersedia untuk dokumen dan dukungan.
- Formulir konsultasi tetap tersedia untuk menyusun kebutuhan. Setelah data valid, tombol **Siapkan pesan WhatsApp** menampilkan tautan ke nomor utama. Pengunjung memeriksa dan mengirim pesan sendiri di WhatsApp; formulir tidak lagi menampilkan kegagalan dari endpoint yang belum dikonfigurasi.
- Isian yang berubah membatalkan draf lama; pengguna menyiapkan pesan lagi. Batas panjang diperiksa sebelum pembuatan tautan sehingga kebutuhan tidak dipotong diam-diam.
- Teks di 14 halaman layanan dan pengantar diperjelas. Struktur bagian, informasi produk, formulir, gambar, video, dan navigasi tetap tersedia. Jumlah kelompok aroma Timur Tengah dikoreksi menjadi enam.
- FAQ memakai satu chevron. Animasi buka/tutup tetap 280 ms dan dapat membalik dari posisi saat ini ketika diketuk cepat.
- Garis navigator mengikuti ukuran panel dan berhenti sebelum sorotan pilihan. Cabang Website bertingkat, sorotan bergerak, animasi penelusuran garis, pratinjau, dan buka/tutup kelompok tetap berfungsi.
- Pembulatan tambahan pada lima gambar alur dihilangkan dari tampilan karena aset sudah mempunyai bingkai sendiri. Semua berkas gambar tetap identik dengan V22.
- Deteksi benturan tombol WhatsApp diperluas ke formulir, FAQ, tombol tindakan, dan navigator. Tombol mengambang disembunyikan sementara ketika menutupi area tersebut, lalu muncul kembali saat ruangnya aman.
- Perbaikan wave, warna footer, ikon sosial, dan gerak V22 tetap dipertahankan.

## Login

Paket ini **tidak memuat `masuk.html`, kode autentikasi, ataupun konfigurasi subdomain login**. Karena itu, login dinamis belum dapat diperiksa atau diubah dari paket ini. Tidak ada hostname login yang ditebak dan tidak ada halaman login statis baru. Untuk pemeriksaan lanjutan, berkas login/backend dapat diberikan tanpa mengungkap alamat publiknya.

## Validasi

- 38 HTML lolos pemeriksaan parser, ID duplikat, JSON terstruktur, serta referensi file dan anchor lokal.
- 114 pemeriksaan tata letak: 38 halaman × 390, 768, dan 1440 piksel di Chromium. Tidak ditemukan overflow horizontal, celah footer, marker FAQ ganda, atau gambar gagal pada yang sudah dimuat.
- 22 blok JavaScript operasional unik lolos pemeriksaan sintaks final. Audit tambahan juga mencakup salinan CSS/JS dalam assets.
- Seluruh 35 nama keyframe lama dipertahankan. Semua aset tetap identik byte dengan V22, termasuk 84 gambar raster dan dua video yang telah divalidasi pada V22.
- Uji interaksi mencakup navigator dan lipatannya, menu tablet dan Escape, kontak footer satu nomor, FAQ dengan ketukan cepat, serta formulir kosong, terlalu panjang, valid, perubahan draf, dan reset.
- Kode baru diuji dengan pembatasan script/style CSP yang sama dengan konfigurasi paket; semua hash kode cocok. Pengujian ini bukan pengujian server Apache/CDN.
- Tidak ada pesan WhatsApp, transaksi, atau deployment yang dilakukan. Pengujian dilakukan di Chromium, belum pada perangkat iPhone/Safari fisik atau Firefox. Pemeriksaan interaksi mewakili skenario penting, bukan seluruh kombinasi input.

Hasil terperinci tersedia di `VALIDATION-V23.json`. Dokumen V22 di dalam ZIP merupakan catatan historis.

## Memasang revisi

Ekstrak isi ZIP ke document root website yang benar. `index.html`, HTML lain, dan `assets/` berada langsung di tingkat utama arsip.

**Perbarui juga `.htaccess` dan `_headers` bersama HTML.** Keduanya mendapat hash yang diperlukan untuk kode revisi dan izin form-action terbatas ke alamat WhatsApp utama. Jangan memakai HTML V23 dengan daftar hash V22 karena browser dapat memblokir kode yang baru.

Pemasangan paket ini tidak mengubah DNS, konfigurasi subdomain, backend, atau sistem login yang berada di luar arsip.
