# PT Digdaya Inovasi Nusantara — V26

Paket ini melanjutkan V25: perlindungan interaksi gambar, perbaikan menu ponsel, dan 500 artikel baru dalam katalog Berita & Wawasan serta Pusat Pengetahuan.

## Perubahan

- Menu simpan gambar melalui tekan lama/klik kanan dan seret gambar dicegah pada antarmuka halaman. Aturan berlaku untuk gambar awal, kartu artikel yang baru dimuat, dan pratinjau gambar. Teks biasa tetap dapat dipilih dan disalin.
- Gerakan double tap yang memicu zoom tidak sengaja dibatasi melalui `touch-action: manipulation`. Pinch zoom dua jari tetap tersedia. Ukuran teks kolom isian ponsel minimal 16 px untuk mengurangi zoom saat fokus.
- Lebar menu, ruang scrollbar, dan fokus keyboard distabilkan. Animasi menu, reveal, separator, scroll, kartu, serta pratinjau gambar tetap dipertahankan.
- Ditambahkan 500 artikel orisinal: 100 Parfum, 100 Domain, 100 Website, 100 Usaha & Layanan, 50 Keamanan Digital, serta 50 Pembayaran & Top Up. Setiap artikel mempunyai ringkasan, penjelasan beberapa bagian, dan daftar periksa.
- Katalog mendukung pencarian isi, kategori, jenis, pengurutan, halaman sebelumnya/berikutnya, pilihan nomor halaman, dan muat lebih banyak. Status filter disimpan pada URL agar dapat dibagikan atau dibuka kembali.
- Pusat Pengetahuan menggunakan koleksi yang sama. Ringkasan dialog terhubung ke artikel lengkap. Setiap artikel mempunyai URL sendiri dalam bentuk `berita-detail.html?id=...`, metadata, bacaan terkait, serta tombol berbagi/salin tautan.
- Tidak ada tautan sumber eksternal atau panel sumber pada isi artikel yang ditampilkan kepada pengunjung. Nama lembaga atau istilah faktual yang diperlukan tetap digunakan sebagai teks. Artikel baru merupakan panduan dan pengetahuan evergreen; tanggal terbit bukan klaim terjadinya peristiwa berita.
- Katalog utama ditampilkan setelah pengantar. Tiga panduan lama tetap tersedia sebagai bacaan pilihan dengan gambar dan animasinya.

## Akun pelanggan tetap dinamis

Seluruh 149 tautan akun pada 38 HTML tetap mengikuti V25: `https://auth.<domain-terdaftar>/masuk.html`, diturunkan dari hostname tempat file dibuka. Tidak ada domain login perusahaan yang ditanam secara tetap, konfigurasi origin manual, atau fallback login ke panel.

Contoh ilustratif: `panel.contoh.co.id` maupun `www.contoh.co.id` menuju `auth.contoh.co.id/masuk.html`. DNS, HTTPS, dan aplikasi autentikasi pada subdomain tujuan tetap merupakan layanan server yang harus tersedia. Backend akun dan payment gateway tidak disertakan dalam arsip ini.

## Batas perlindungan gambar dan validasi

Gambar yang telah ditampilkan browser tidak dapat dijamin kebal unduhan secara mutlak. Screenshot, alat pengembang, akses jaringan, browser yang mengabaikan aturan, atau penonaktifan JavaScript masih dapat mengambil konten. Perubahan ini menghalangi jalur simpan biasa pada antarmuka; bukan enkripsi atau kontrol akses terhadap file publik.

Pemeriksaan browser menggunakan Chromium. Safari/iPhone fisik tidak tersedia untuk diuji; perilaku menu tekan lama native dan zoom pada perangkat tersebut perlu dikonfirmasi setelah pemasangan. Tidak ada batas `maximum-scale` atau `user-scalable=no` yang mengunci pembesaran pembaca.

Artikel diperiksa untuk konsistensi fakta, urutan tindakan, pernyataan berlebihan, keunikan, kelengkapan struktur, dan ketepatan tautan. Materi praktis tidak menjanjikan hasil produk, transaksi, atau keamanan. Pemeriksaan editorial ini bukan sertifikasi kepatuhan terhadap seluruh hukum nasional dan internasional untuk setiap cara penggunaan; keputusan khusus tetap mengikuti keadaan dan ketentuan yang relevan.

## Pemasangan

Unggah isi paket beserta aset, `.htaccess`, dan `_headers` secara bersamaan. Katalog dan artikel dimuat dari data lokal yang juga telah disertakan inline pada HTML terkait; tidak memerlukan layanan berita eksternal. Pastikan cache HTML lama diperbarui saat memasang revisi ini.

`VALIDATION-V26.json` dan `FILE-MANIFEST-V26.json` mencatat hasil pemeriksaan serta hash file final. Dokumen versi sebelumnya tetap disimpan sebagai arsip historis; instruksi V26 dan aturan akun V25 adalah yang berlaku. File pemeriksaan sementara tidak termasuk paket.
