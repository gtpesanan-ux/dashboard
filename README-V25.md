# PT Digdaya Inovasi Nusantara — V25

Seluruh tombol Masuk / Daftar dan tombol pembelian menuju **`https://auth.<domain-terdaftar>/masuk.html`**. Domain diambil dari hostname halaman yang sedang dibuka, bukan dari alamat tetap, parameter URL, referrer, atau konfigurasi origin.

## Perilaku saat dipindahkan

Contoh berikut hanya ilustrasi, bukan domain perusahaan yang ditanam dalam kode:

| File dibuka melalui | Tujuan Masuk / Daftar |
| --- | --- |
| `https://contoh.com/index.html` | `https://auth.contoh.com/masuk.html` |
| `https://www.contoh.com/layanan.html` | `https://auth.contoh.com/masuk.html` |
| `https://panel.contoh.com/parfum-lokal.html` | `https://auth.contoh.com/masuk.html` |
| `https://jualan.panel.contoh.com/folder/index.html` | `https://auth.contoh.com/masuk.html` |
| `https://panel.usaha-baru.co.id/index.html` | `https://auth.usaha-baru.co.id/masuk.html` |
| `https://auth.usaha-baru.co.id/index.html` | `https://auth.usaha-baru.co.id/masuk.html` |

Tidak perlu mengganti domain di 38 HTML atau mengisi file konfigurasi saat pindah ke domain lain. Prefiks `auth` dan path `/masuk.html` tetap sesuai instruksi; domain pemiliknya mengikuti lokasi pemasangan. Tautan memakai HTTPS dan tidak membawa port panel, folder halaman, parameter pencarian, atau fragmen ke portal.

## Perubahan dari V24

- 149 tautan akun pada 38 HTML diperbarui dengan satu logika inline yang identik.
- Resolver V24 yang memakai host aktif langsung atau origin manual diganti dengan resolver subdomain `auth` otomatis.
- `assets/portal-config.js`, pemanggilnya, dan aturan cache khususnya dihapus. Tidak ada aset runtime baru, file konfigurasi pengganti, atau permintaan jaringan tambahan untuk menentukan domain.
- Menu, teks layanan, formulir panduan, CSS, gambar, video, dan skrip animasi V24 tidak berubah. Pengganti tiga formulir transaksi publik dari V24 tetap menuju akun.
- Hash CSP dalam `.htaccess` dan `_headers` diperbarui untuk resolver baru. Kebijakan lainnya tetap dipertahankan.

## Cara domain dikenali

Resolver mengikuti [algoritma Public Suffix List](https://github.com/publicsuffix/list/wiki/Format), termasuk bagian ICANN dan PRIVATE. Ini menangani akhiran bertingkat seperti `.co.id`, aturan wildcard dan pengecualian, serta batas domain milik penyewa pada hosting bersama. Data disertakan di dalam HTML agar browser tidak perlu mengunduh daftar saat pelanggan membuka halaman.

Sumber data: [Public Suffix List resmi](https://publicsuffix.org/list/public_suffix_list.dat), versi `2026-09-03_19-51-30_UTC`. Data dinormalisasi ke ASCII/Punycode. Aturan satu label diwakili aturan bawaan `*` yang ekuivalen; aturan bertingkat, wildcard, dan pengecualian dipertahankan. Data PSL berada di bawah [Mozilla Public License 2.0](https://mozilla.org/MPL/2.0/); pemberitahuan lisensi dan sumber tercantum di skrip inline.

## Pemasangan dan batas pemeriksaan

Unggah HTML, aset yang dipertahankan, `.htaccess`, dan `_headers` dari paket ini bersama-sama. Jika memperbarui instalasi V24, `assets/portal-config.js` lama boleh dihapus; tidak lagi dibaca walaupun masih tertinggal di server.

Subdomain `auth` pada domain tujuan tetap harus memiliki DNS, HTTPS, dan aplikasi login milik perusahaan yang aktif. Revisi ini membentuk tautan secara otomatis; ia tidak membuat DNS atau memindahkan backend. Source autentikasi, pendaftaran, dan payment gateway tidak ada dalam ZIP dan tidak diuji sebagai transaksi langsung.

`file:`, localhost, alamat IP, nama lokal `.local`, dan public suffix tanpa domain pemilik tidak memiliki domain perusahaan yang dapat dipakai. Dalam konteks tersebut, tautan akun dinonaktifkan dan penjelasan ditampilkan. Tidak ada fallback login ke `panel`. Bila JavaScript dimatikan, halaman memberi petunjuk untuk mengaktifkannya; tidak menyajikan URL login yang salah.

Laporan `VALIDATION-V25.json` memuat pemeriksaan final V25. README dan laporan V22–V24 tetap ada sebagai arsip historis; instruksi origin manual V24 sudah tidak berlaku.
