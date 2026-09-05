"use strict";

(() => {
  const REVIEW_DATE = "5 September 2026";
  const provenance = "Ringkasan editorial Digdaya disusun dari sumber primer yang ditautkan. Penerbit, tanggal sumber, dan tanggal pemeriksaan ditampilkan agar konteks asli dapat diperiksa.";
  const limits = {
    legal: "Informasi umum, bukan nasihat hukum. Ketentuan dan alur layanan dapat berubah; periksa sumber resmi terbaru dan gunakan bantuan petugas atau profesional berwenang untuk kasus khusus.",
    safety: "Panduan pencegahan umum, bukan jaminan keamanan atau pemulihan kerugian. Jika insiden sedang terjadi, segera hubungi penyedia layanan dan otoritas melalui kanal resmi.",
    product: "Panduan konsumen umum, bukan penilaian keamanan satu produk atau diagnosis. Cocokkan produk pada kanal resmi dan cari bantuan profesional bila muncul reaksi yang mengkhawatirkan.",
    technical: "Panduan teknis umum. Ukur kondisi nyata, uji pada perangkat pengguna, dan lakukan peninjauan profesional sebelum menyimpulkan risiko atau kepatuhan."
  };

  const sources = {
    oss: {
      name: "OSS Indonesia — Kementerian Investasi dan Hilirisasi/BKPM",
      url: "https://oss.go.id/id",
      date: "Halaman layanan aktif; diperiksa 5 September 2026"
    },
    ossNib: {
      name: "Panduan Pembuatan NIB — OSS Indonesia",
      url: "https://oss.go.id/id/panduan/676a8758cde449ca8bf75911",
      date: "Panduan resmi; diperiksa 5 September 2026"
    },
    ahu: {
      name: "Layanan Perseroan Perorangan — Ditjen AHU",
      url: "https://layanan.ahu.go.id/ahu/layanan-produk/badan-usaha/perseroan-perorangan/pendirian",
      date: "Halaman layanan aktif; diperiksa 5 September 2026"
    },
    merek: {
      name: "Prosedur Pendaftaran Merek Baru — DJKI",
      url: "https://www.dgip.go.id/menu-utama/merek/syarat-prosedur",
      date: "Halaman prosedur aktif; diperiksa 5 September 2026"
    },
    pandi: {
      name: "Kebijakan Pendaftaran Nama Domain .id versi 10.0 — PANDI",
      url: "https://api.pandi.id/public/files/2025/8/kebijakan-pendaftaran-nama-domain-versi-10-0-bilingual-new-1756441612.pdf",
      date: "Kebijakan versi 10.0 tertanggal 29 Agustus 2025; diperiksa 5 September 2026"
    },
    pdp: {
      name: "UU Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi — JDIH Komdigi",
      url: "https://jdih.komdigi.go.id/produk_hukum/view/id/832/t/undangundang%2Bnomor%2B27%2Btahun%2B2022",
      date: "Diundangkan 17 Oktober 2022; diperiksa 5 September 2026"
    },
    iasc: {
      name: "Siaran Pers Indonesia Anti-Scam Centre — OJK",
      url: "https://ojk.go.id/id/berita-dan-kegiatan/siaran-pers/Pages/IASC-Berhasil-Kembalikan-Rp161-Miliar-Dana-Masyarakat-Korban-Scam.aspx",
      date: "Diterbitkan 22 Januari 2026; diperiksa 5 September 2026"
    },
    iascWarning: {
      name: "Peringatan situs palsu IASC — OJK",
      url: "https://ojk.go.id/id/berita-dan-kegiatan/info-terkini/Pages/Waspada-Penipuan-Website-Mengatasnamakan-Indonesia-Anti-Scam-Centre-IASC.aspx",
      date: "Diterbitkan 28 Maret 2025; diperiksa 5 September 2026"
    },
    bpom: {
      name: "Waspada, Temuan Kosmetik Ilegal Meningkat 10 Kali Lipat — Badan POM",
      url: "https://www.pom.go.id/berita/waspada-temuan-kosmetik-ilegal-meningkat-10-kali-lipat",
      date: "Diterbitkan 21 Februari 2025; diperiksa 5 September 2026"
    },
    cekBpom: {
      name: "Daftar Produk Kosmetika — Cek BPOM",
      url: "https://cekbpom.pom.go.id/produk-kosmetika",
      date: "Basis data aktif; diperiksa 5 September 2026"
    },
    qris: {
      name: "Quick Response Code Indonesian Standard — Bank Indonesia",
      url: "https://www.bi.go.id/id/fungsi-utama/sistem-pembayaran/ritel/kanal-layanan/qris/default.aspx",
      date: "Halaman resmi aktif; diperiksa 5 September 2026"
    },
    consumer: {
      name: "Permendag Nomor 19 Tahun 2026 tentang Penyelenggaraan Usaha Perdagangan Melalui Sistem Elektronik — JDIH Kemendag",
      url: "https://jdih.kemendag.go.id/peraturan/peraturan-menteri-perdagangan-republik-indonesia-nomor-19-tahun-2026-tentang-penyelenggaraan-usaha-perdagangan-melalui-sistem-elektronik-1",
      date: "Diundangkan 8 Juni 2026; status berlaku; diperiksa 5 September 2026"
    },
    vitals: {
      name: "Web Vitals — web.dev",
      url: "https://web.dev/articles/vitals",
      date: "Diperbarui 31 Oktober 2024; diperiksa 5 September 2026"
    },
    helpful: {
      name: "Helpful, Reliable, People-First Content — Google Search Central",
      url: "https://developers.google.com/search/docs/fundamentals/creating-helpful-content",
      date: "Diperbarui 10 Desember 2025; diperiksa 5 September 2026"
    },
    wcag: {
      name: "Web Content Accessibility Guidelines 2.2 — W3C",
      url: "https://www.w3.org/TR/WCAG22/",
      date: "Rekomendasi W3C 12 Desember 2024; diperiksa 5 September 2026"
    },
    owasp: {
      name: "OWASP Top 10:2025",
      url: "https://owasp.org/Top10/2025/",
      date: "Rilis 2025; diperiksa 5 September 2026"
    },
    auth: {
      name: "Authentication Failures — OWASP Top 10:2025",
      url: "https://owasp.org/Top10/2025/A07_2025-Authentication_Failures/",
      date: "Rilis 2025; diperiksa 5 September 2026"
    }
  };

  const section = (heading, paragraphs, bullets = []) => ({ heading, paragraphs, bullets });
  const categoryMedia = {
    Legalitas: "assets/legal-nib-oss-v16.webp",
    "Badan Usaha": "assets/legal-pt-documents-v16.webp",
    Merek: "assets/domain-strategy-v16.webp",
    Domain: "assets/domain-strategy-v16.webp",
    Privasi: "assets/security-verification-v16.webp",
    Keamanan: "assets/security-verification-v16.webp",
    Parfum: "assets/fragrance-workshop-v16.webp",
    Pembayaran: "assets/digital-operations-v16.webp",
    Konsumen: "assets/customer-support-v16.webp",
    Website: "assets/website-studio-v16.webp",
    Aksesibilitas: "assets/website-studio-v16.webp"
  };
  const article = ({ source, ...item }) => ({
    kind: "panduan-editorial",
    date: "2026-09-05",
    publishedAt: "2026-09-05",
    reviewedAt: "2026-09-05",
    author: "Tim Editorial PT Digdaya Inovasi Nusantara",
    reviewScope: "Kesesuaian ringkasan dengan sumber primer yang ditautkan",
    statusLabel: "Sumber primer diperiksa",
    readingMinutes: 5,
    provenance,
    ...source,
    ...item,
    image: item.image || categoryMedia[item.category] || "assets/corporate-home-v16.webp",
    imageAlt: item.imageAlt || `Ilustrasi editorial untuk topik ${item.category}`,
    imageCaption: item.imageCaption || `Ilustrasi editorial kategori ${item.category}; bukan dokumentasi peristiwa.`
  });

  const data = [
    article({
      id: "nib-identitas-usaha-dan-perizinan-berbasis-risiko",
      category: "Legalitas",
      title: "NIB: identitas usaha dan pintu awal perizinan berbasis risiko",
      summary: "OSS menjelaskan NIB sebagai identitas resmi untuk memulai atau menjalankan usaha. Izin dan kewajiban berikutnya ditentukan oleh kegiatan serta tingkat risikonya.",
      source: { sourceName: sources.oss.name, sourceUrl: sources.oss.url, sourceDate: sources.oss.date },
      usageLimit: limits.legal,
      takeaways: ["NIB adalah identitas resmi pelaku usaha.", "OSS membagi kegiatan ke dalam empat tingkat risiko.", "Klasifikasi usaha, lokasi, dan skala memengaruhi keluaran perizinan."],
      sections: [
        section("Apa yang dikonfirmasi OSS", ["Portal OSS menyebut NIB sebagai identitas resmi untuk memulai atau menjalankan usaha di Indonesia. Data pelaku usaha dan kegiatan karena itu perlu diisi sesuai kondisi sebenarnya.", "Perizinan berusaha berbasis risiko mengelompokkan kegiatan ke empat tingkat risiko. Pengelompokan tersebut menentukan izin dan kewajiban lanjutan yang harus dipenuhi."]),
        section("Yang perlu disiapkan", ["Mulailah dari data yang dapat dipertanggungjawabkan, bukan pilihan yang dianggap paling cepat."], ["Identitas dan profil pelaku usaha.", "Uraian kegiatan serta Klasifikasi Baku Lapangan Usaha Indonesia (KBLI) yang sesuai.", "Lokasi, skala, dan data proyek.", "Waktu untuk membaca kembali draf keluaran sistem."]),
        section("Batas penting", ["NIB tidak selalu berarti seluruh kewajiban untuk setiap kegiatan telah selesai. Periksa apakah keluaran OSS juga memuat Sertifikat Standar, persyaratan dasar, izin, atau Perizinan Berusaha untuk Menunjang Kegiatan Usaha (PB-UMKU)."])
      ],
      keywords: "NIB OSS legalitas usaha perizinan berbasis risiko KBLI"
    }),
    article({
      id: "panduan-membuat-nib-dan-memeriksa-draf",
      category: "Legalitas",
      title: "Membuat NIB: periksa profil, kegiatan, dan draf sebelum terbit",
      summary: "OSS menyediakan panduan pembuatan NIB, tetapi urutan dan tampilan akun dapat berbeda mengikuti profil, kegiatan, masa transisi, dan pembaruan sistem.",
      source: { sourceName: sources.ossNib.name, sourceUrl: sources.ossNib.url, sourceDate: sources.ossNib.date },
      usageLimit: limits.legal,
      takeaways: ["Gunakan jenis akun pelaku usaha yang sesuai.", "Ikuti panduan yang tampil pada akun OSS Anda.", "Periksa dan arsipkan dokumen yang benar-benar diterbitkan sistem."],
      sections: [
        section("Mulai dari data yang benar", ["Periksa identitas, alamat, kontak, profil badan usaha, dan uraian kegiatan berdasarkan kondisi nyata. Jangan memilih data hanya karena terlihat mempercepat proses."]),
        section("Ikuti alur pada akun", ["Urutan layar dan data yang diminta dapat berubah. Gunakan petunjuk yang tampil pada OSS dan baca keluaran sebelum menyelesaikan proses."], ["Cocokkan kegiatan dengan usaha yang dijalankan.", "Periksa lokasi dan data usaha atau proyek.", "Baca kewajiban yang dihasilkan.", "Unduh dokumen hanya setelah datanya diperiksa."]),
        section("Jika panduan dan layar berbeda", ["Gunakan pusat bantuan OSS atau petugas berwenang ketika tampilan akun, data transisi, Klasifikasi Baku Lapangan Usaha Indonesia (KBLI), atau kewajiban tidak sesuai contoh panduan. Ringkasan ini tidak menetapkan urutan layar yang berlaku untuk semua akun."])
      ],
      keywords: "panduan NIB profil OSS kegiatan draf dokumen"
    }),
    article({
      id: "perseroan-perorangan-periksa-kelayakan",
      category: "Badan Usaha",
      title: "Perseroan Perorangan: periksa kelayakan sebelum mendaftar",
      summary: "AHU menyediakan Perseroan Perorangan bagi orang perseorangan yang memenuhi persyaratan dan berada dalam kriteria usaha mikro atau kecil.",
      source: { sourceName: sources.ahu.name, sourceUrl: sources.ahu.url, sourceDate: sources.ahu.date },
      usageLimit: limits.legal,
      takeaways: ["Pendirinya satu orang dan harus memenuhi persyaratan AHU.", "Kriteria usaha mikro atau kecil tetap perlu diperiksa.", "Modal, kegiatan, dan alamat harus sesuai dokumen."],
      sections: [
        section("Kelayakan adalah langkah pertama", ["Halaman layanan AHU mencantumkan pendiri berupa orang perseorangan, warga negara Indonesia berusia minimal 17 tahun, cakap hukum, dan modal maksimal Rp5 miliar. Kriteria usaha mikro atau kecil (UMK) serta cara menghitung modal tetap perlu dicocokkan dengan ketentuan yang berlaku. Bentuk ini tidak otomatis cocok untuk setiap rencana usaha hanya karena prosesnya elektronik."]),
        section("Data yang harus konsisten", ["Siapkan data yang sama di seluruh dokumen dan layanan terkait."], ["Nama perseroan dan identitas pendiri.", "Alamat serta maksud dan tujuan.", "Modal dan kegiatan usaha.", "Kontak yang benar-benar dapat digunakan."]),
        section("Kapan meminta bantuan", ["Minta penjelasan AHU atau profesional bila struktur kepemilikan akan melibatkan lebih dari satu orang, skala usaha berubah, atau ada izin sektoral yang belum jelas. Simpan keluaran resmi layanan dan periksa kembali data sebelum menggunakannya pada OSS, pajak, perbankan, atau kontrak."])
      ],
      keywords: "Perseroan Perorangan AHU UMK pendirian badan usaha"
    }),
    article({
      id: "merek-syarat-dan-pemeriksaan-kelas",
      category: "Merek",
      title: "Sebelum mendaftarkan merek: siapkan label dan periksa kelasnya",
      summary: "DJKI mencantumkan etiket atau label merek dan tanda tangan pemohon sebagai persyaratan, dengan dokumen tambahan untuk fasilitas tarif UMK.",
      source: { sourceName: sources.merek.name, sourceUrl: sources.merek.url, sourceDate: sources.merek.date },
      usageLimit: limits.legal,
      takeaways: ["Tetapkan representasi merek yang akan diajukan.", "Petakan barang atau jasa ke kelas yang sesuai.", "Periksa persyaratan fasilitas UMK bila digunakan."],
      sections: [
        section("Merek berbeda dari domain", ["Ketersediaan nama domain tidak membuktikan bahwa tanda dapat didaftarkan sebagai merek. Permohonan merek diperiksa menurut kelas barang atau jasa dan ketentuan DJKI."]),
        section("Checklist sebelum mengajukan", ["Sebagai rekomendasi editorial, penelusuran awal pada basis data kekayaan intelektual resmi dapat membantu menemukan tanda serupa, tetapi bukan jaminan penerimaan."], ["Tetapkan kata, logo, atau kombinasi yang digunakan.", "Petakan barang atau jasa dan uraian pada kelas yang dipilih.", "Lakukan penelusuran awal pada basis data resmi DJKI.", "Siapkan etiket atau label dan tanda tangan pemohon.", "Pastikan identitas pemohon dan dokumen fasilitas tarif UMK berlaku."]),
        section("Pantau setelah permohonan", ["Prosedur DJKI meminta data kelas dimasukkan dalam permohonan. Kelas dan uraian harus mewakili barang atau jasa yang benar-benar akan dilindungi. Kelengkapan administrasi bukan jaminan permohonan disetujui; pantau status dan tanggapi pemberitahuan melalui kanal resmi DJKI."])
      ],
      keywords: "merek DJKI pendaftaran label kelas PDKI UMK"
    }),
    article({
      id: "domain-id-registrar-dan-data-registran",
      category: "Domain",
      title: "Domain .id: gunakan registrar dan data registran yang benar",
      summary: "PANDI mengarahkan pendaftaran domain .id melalui registrar dan kebijakannya menempatkan kebenaran, keaslian, keabsahan, serta kelengkapan data pada registran.",
      source: { sourceName: sources.pandi.name, sourceUrl: sources.pandi.url, sourceDate: sources.pandi.date },
      usageLimit: "Orientasi domain .id. Persyaratan kategori dan registrar dapat berbeda; periksa kebijakan PANDI serta syarat registrar saat transaksi.",
      takeaways: ["Pendaftaran .id dilakukan melalui registrar.", "Registran bertanggung jawab atas data.", "Kategori tertentu dapat meminta dokumen tambahan."],
      sections: [
        section("Bedakan registri, registrar, dan registran", ["PANDI mengelola registri .id, registrar melayani pendaftaran, dan registran memegang hak penggunaan. Perbedaan peran ini menentukan jalur dukungan, perubahan, dan perpanjangan."]),
        section("Data registran dan kendali operasional", ["Kebijakan PANDI mewajibkan pendaftar dan registran menjamin kebenaran, keaslian, keabsahan, serta kelengkapan persyaratan. Gunakan kontak yang tetap dapat diakses pemilik yang sah. Sebagai rekomendasi operasional Digdaya, perlakukan akses akun dan kode transfer sebagai informasi sensitif."], ["Identitas pemilik atau badan usaha.", "Email dan nomor telepon aktif.", "Bukti pembayaran serta tanggal berakhir.", "Akses akun registrar dan kode transfer bila digunakan."]),
        section("Cek persyaratan kategori", ["co.id, or.id, sch.id, dan kategori lain memiliki peruntukan serta dapat meminta dokumen berbeda. Registri berhak meminta registrar mengunggah dokumen persyaratan. Jangan mengirim dokumen melalui kanal yang tidak dapat diverifikasi."])
      ],
      keywords: "domain id PANDI registrar registran pendaftaran"
    }),
    article({
      id: "domain-perpanjangan-transfer-dan-kendali-akun",
      category: "Domain",
      title: "Domain tidak cukup dibeli: kelola perpanjangan, transfer, dan akses",
      summary: "Kebijakan PANDI mencakup masa berlaku, perpanjangan, dan pengalihan. Kendali akun registrar menentukan kesinambungan situs serta email berbasis domain.",
      source: { sourceName: sources.pandi.name, sourceUrl: sources.pandi.url, sourceDate: sources.pandi.date },
      usageLimit: "Periksa periode dan prosedur pada registrar. Jangan memindahkan domain atau membagikan auth code tanpa verifikasi pemilik dan tujuan transfer.",
      takeaways: ["Catat tanggal berakhir.", "Pastikan email registran aktif.", "Perlakukan auth code sebagai informasi sensitif."],
      sections: [
        section("Risiko terbesar dapat muncul setelah pendaftaran", ["Situs dan email dapat berhenti ketika domain kedaluwarsa, pengaturan Domain Name System (DNS) berubah tanpa kendali, atau akun registrar hilang. Kebijakan PANDI menetapkan masa berlaku .id antara 1 sampai 10 tahun dan hak registran menerima pemberitahuan berkala dari registrar selama tiga bulan sebelum masa berlaku habis. Inventaris domain perlu memuat pemilik, registrar, kontak, tanggal berakhir, dan penanggung jawab."]),
        section("Rekomendasi operasional Digdaya", ["Langkah berikut adalah praktik pengelolaan internal, bukan kutipan persyaratan PANDI."], ["Aktifkan autentikasi tambahan bila registrar menyediakannya.", "Buat beberapa pengingat perpanjangan.", "Catat perubahan DNS dan penyetuju.", "Verifikasi tujuan sebelum memberi kode transfer."]),
        section("Pisahkan kepemilikan dan pekerjaan teknis", ["Pihak teknis dapat diberi akses terbatas tanpa mengambil alih identitas registran. Pastikan pemilik tetap memiliki jalur pemulihan akun. Kebijakan PANDI juga membatasi pengalihan pada 60 hari pertama setelah aktivasi dan 10 hari menjelang akhir masa berlaku."])
      ],
      keywords: "domain renewal perpanjangan transfer auth code DNS"
    }),
    article({
      id: "formulir-digital-minimalisasi-data-pribadi",
      category: "Privasi",
      title: "Formulir digital: kumpulkan data secara terbatas, spesifik, dan transparan",
      summary: "UU Pelindungan Data Pribadi mengatur pengumpulan secara terbatas dan spesifik, sah, transparan, serta sesuai tujuan pemrosesan.",
      source: { sourceName: sources.pdp.name, sourceUrl: sources.pdp.url, sourceDate: sources.pdp.date },
      usageLimit: limits.legal,
      readingMinutes: 6,
      takeaways: ["Jangan meminta data yang tidak diperlukan.", "Jelaskan tujuan sebelum data dikirim.", "Batasi akses dan retensi sesuai kebutuhan yang sah."],
      sections: [
        section("Mulai dari tujuan dan dasar", ["UU PDP mewajibkan pengendali memiliki dasar pemrosesan. Sebelum menambah kolom formulir, tentukan tujuan serta dasar untuk setiap data. Bila informasi tidak dibutuhkan untuk menangani permintaan, transaksi, atau kewajiban yang sah, pertimbangkan untuk tidak mengumpulkannya."]),
        section("Pemeriksaan formulir kontak", ["Pilihan kata harus dapat dipahami sebelum pengguna menyetujui. Bila dasar pemrosesannya persetujuan, UU PDP mewajibkan informasi antara lain legalitas dan tujuan pemrosesan, jenis dan relevansi data, retensi dokumen, rincian informasi yang dikumpulkan, serta jangka waktu pemrosesan."], ["Labeli data yang diminta.", "Bedakan kolom wajib dan opsional.", "Tautkan pemberitahuan privasi.", "Jangan meminta password, OTP, PIN, CVV, atau kode pemulihan."]),
        section("Sesudah data diterima", ["Tentukan siapa yang dapat mengakses, berapa lama data diperlukan, bagaimana hak subjek ditangani, dan kapan data dihapus atau dimusnahkan. UU PDP juga mewajibkan perekaman seluruh kegiatan pemrosesan serta langkah keamanan yang memperhatikan sifat dan risikonya."])
      ],
      keywords: "UU PDP privasi formulir minimalisasi transparansi"
    }),
    article({
      id: "insiden-data-pribadi-pencatatan-dan-pemberitahuan",
      category: "Privasi",
      title: "Insiden data pribadi: siapkan pencatatan dan jalur pemberitahuan",
      summary: "Pasal 46 UU PDP mengatur pemberitahuan tertulis paling lambat 3×24 jam kepada subjek data dan lembaga ketika terjadi kegagalan pelindungan data pribadi.",
      source: { sourceName: sources.pdp.name, sourceUrl: sources.pdp.url, sourceDate: sources.pdp.date },
      usageLimit: limits.legal,
      readingMinutes: 6,
      takeaways: ["Catat kapan dan bagaimana insiden diketahui.", "Identifikasi data yang terdampak.", "Libatkan fungsi hukum, privasi, dan keamanan sejak awal."],
      sections: [
        section("Ruang lingkup kegagalan pelindungan", ["Penjelasan UU mencakup kegagalan menjaga kerahasiaan, integritas, atau ketersediaan yang mengarah pada perusakan, kehilangan, perubahan, pengungkapan, atau akses tidak sah."]),
        section("Catatan insiden", ["Pisahkan fakta yang sudah diketahui dari dugaan yang masih diselidiki. Tetapkan pemilik keputusan, jalur eskalasi, dan bukti waktu agar kewajiban 3×24 jam dapat dinilai terhadap peristiwa konkret."], ["Waktu deteksi dan rangkaian kejadian.", "Jenis data serta subjek yang mungkin terdampak.", "Sistem, akun, dan pihak terlibat.", "Tindakan pembatasan dan pemulihan."]),
        section("Isi dan penerima pemberitahuan", ["UU menyebut data yang terungkap, kapan dan bagaimana terungkap, serta upaya penanganan dan pemulihan sebagai isi minimum pemberitahuan tertulis. Penerimanya adalah subjek data dan lembaga; dalam keadaan tertentu, pengendali juga wajib memberitahukan masyarakat. Penentuan penerapan pada kasus nyata memerlukan pemeriksaan hukum yang berwenang."])
      ],
      keywords: "insiden data pribadi 3x24 pemberitahuan UU PDP"
    }),
    article({
      id: "lapor-penipuan-keuangan-melalui-iasc",
      kind: "pembaruan-resmi",
      category: "Keamanan",
      title: "Korban penipuan keuangan dapat melapor melalui situs resmi IASC",
      sourcePublishedAt: "2026-01-22",
      statusLabel: "Siaran pers resmi diperiksa",
      summary: "OJK menyatakan laporan penipuan keuangan dapat disampaikan melalui iasc.ojk.go.id dan mengingatkan masyarakat terhadap pihak yang mengaku mewakili IASC.",
      source: { sourceName: sources.iasc.name, sourceUrl: sources.iasc.url, sourceDate: sources.iasc.date },
      usageLimit: limits.safety,
      takeaways: ["Segera lapor ke IASC untuk upaya pemblokiran atau penelusuran dana.", "Buat Laporan Polisi untuk proses penegakan hukum.", "Pelaporan tidak menjamin dana kembali; jangan membayar pihak yang menjanjikannya."],
      sections: [
        section("Lakukan dua jalur pelaporan", ["Situs resmi IASC meminta korban segera melapor ke IASC untuk upaya pemblokiran atau penelusuran dana dan membuat Laporan Polisi untuk proses hukum. Simpan bukti transfer, mutasi, percakapan, nomor rekening, tautan, serta waktu kejadian."]),
        section("Siapkan laporan yang dapat ditelusuri", ["Portal IASC menjelaskan satu formulir difokuskan pada transaksi dari satu rekening korban ke satu rekening terlapor; transfer ke beberapa rekening dapat memerlukan laporan terpisah."], ["Siapkan identitas dan kontak aktif.", "Catat rekening korban dan rekening tujuan.", "Unggah bukti transaksi serta komunikasi.", "Simpan nomor laporan untuk pelacakan."]),
        section("Rahasia akun tidak boleh dibagikan", ["Pihak yang sah tidak memerlukan rahasia autentikasi Anda."], ["Jangan berikan password.", "Jangan berikan OTP, PIN, atau CVV.", "Ketik alamat IASC sendiri atau buka dari OJK.", "Simpan nomor laporan dan pembaruannya."]),
        section("Pelaporan bukan jaminan dana kembali", ["IASC menegaskan pelaporan tidak menjamin dana kembali. Hasil dipengaruhi waktu laporan, aliran dana, bukti, dan proses pihak berwenang. Jika dana dapat dikembalikan, situs IASC menyatakan pemberitahuan resmi datang dari bank atau Penyedia Jasa Pembayaran (PJP) yang digunakan korban. Waspadai janji pengembalian dengan pembayaran tambahan."])
      ],
      keywords: "IASC OJK lapor penipuan scam bukti transaksi"
    }),
    article({
      id: "waspada-situs-palsu-mengatasnamakan-iasc",
      kind: "pembaruan-resmi",
      category: "Keamanan",
      title: "OJK mengingatkan adanya situs palsu yang mengatasnamakan IASC",
      sourcePublishedAt: "2025-03-28",
      statusLabel: "Peringatan resmi diperiksa",
      summary: "OJK meminta masyarakat memeriksa informasi IASC melalui kanal resmi dan mewaspadai situs atau pihak yang mengaku mewakili layanan tersebut.",
      source: { sourceName: sources.iascWarning.name, sourceUrl: sources.iascWarning.url, sourceDate: sources.iascWarning.date },
      usageLimit: limits.safety,
      takeaways: ["Periksa ejaan domain.", "Jangan percaya hasil iklan semata.", "Konfirmasi melalui Kontak OJK bila ragu."],
      sections: [
        section("Nama dan logo dapat ditiru", ["Tampilan yang menyerupai lembaga resmi bukan bukti keaslian. Pemeriksaan perlu berfokus pada domain, sumber tautan, data yang diminta, dan konsistensinya dengan pengumuman OJK."]),
        section("Tanda yang perlu dihentikan", ["Berhenti dan periksa ulang jika muncul salah satu pola berikut."], ["Permintaan OTP, PIN, password, atau CVV.", "Janji dana pasti kembali dengan biaya di muka.", "Tekanan agar bertindak segera.", "Alamat yang menyerupai tetapi bukan domain resmi."]),
        section("Cara membuka kanal resmi", ["Pengumuman OJK tanggal 28 Maret 2025 menyatakan pelaporan IASC hanya melalui iasc.ojk.go.id. Untuk memeriksa informasi yang meragukan, pengumuman tersebut mencantumkan Kontak OJK 157, WhatsApp 081 157 157 157, dan konsumen@ojk.go.id. Gunakan bookmark yang sudah diperiksa atau buka dari situs utama OJK; jangan mengandalkan tautan pendek dan tangkapan layar."])
      ],
      keywords: "situs palsu IASC OJK phishing penipuan"
    }),
    article({
      id: "cek-klik-sebelum-membeli-parfum-kosmetik",
      category: "Parfum",
      title: "Membeli parfum atau kosmetik: lakukan Cek KLIK terlebih dahulu",
      sourcePublishedAt: "2025-02-21",
      statusLabel: "Imbauan BPOM diperiksa",
      summary: "BPOM mengimbau konsumen memeriksa Kemasan, Label, Izin Edar, dan Kedaluwarsa serta membeli kosmetik dari sarana penjualan yang jelas.",
      source: { sourceName: sources.bpom.name, sourceUrl: sources.bpom.url, sourceDate: sources.bpom.date },
      usageLimit: limits.product,
      takeaways: ["Periksa kemasan dan label.", "Cocokkan izin edar melalui kanal BPOM.", "Hindari penjual dengan identitas tidak jelas."],
      sections: [
        section("Mengapa Cek KLIK diperlukan", ["Dalam berita 21 Februari 2025, BPOM melaporkan temuan kosmetik ilegal berupa produk tanpa izin edar, palsu, mengandung bahan dilarang atau berbahaya, produk kedaluwarsa, serta nomor izin edar fiktif. Karena nomor pada kemasan juga dapat dipalsukan, pemeriksaan tidak boleh berhenti pada ada atau tidaknya nomor."]),
        section("Empat pemeriksaan konsumen", ["Periksa kondisi Kemasan, baca seluruh Label, cocokkan Izin edar pada kanal BPOM, dan lihat Kedaluwarsa. BPOM juga mengimbau pembelian dari sarana penjualan yang jelas serta tidak mudah terpengaruh iklan berlebihan."]),
        section("Sebelum menggunakan", ["Cocokkan barang fisik dengan informasi resmi."], ["Cocokkan nama, merek, nomor, dan pendaftar.", "Baca cara penggunaan serta peringatan.", "Jangan gunakan kemasan rusak.", "Hentikan penggunaan bila timbul reaksi mengkhawatirkan.", "Laporkan produk mencurigakan melalui kanal pengaduan BPOM."]),
        section("Batas pemeriksaan", ["Cek KLIK adalah langkah verifikasi konsumen, bukan diagnosis atau jaminan bahwa produk cocok untuk setiap orang. Nilai produk dari label, status pada kanal resmi, kondisi barang, dan kecocokan penggunaan—bukan testimoni saja."])
      ],
      keywords: "parfum kosmetik BPOM Cek KLIK izin edar label"
    }),
    article({
      id: "membaca-hasil-pencarian-kosmetik-cek-bpom",
      category: "Parfum",
      title: "Cara membaca hasil pencarian kosmetik pada Cek BPOM",
      summary: "Cek BPOM menyediakan pencarian berdasarkan nama, merek, nomor izin edar, pendaftar, atau komposisi untuk membantu verifikasi awal kosmetik.",
      source: { sourceName: sources.cekBpom.name, sourceUrl: sources.cekBpom.url, sourceDate: sources.cekBpom.date },
      usageLimit: limits.product,
      takeaways: ["Gunakan lebih dari satu atribut pencarian.", "Cocokkan nama, merek, nomor, dan pendaftar.", "Periksa pula pengumuman produk bermasalah."],
      sections: [
        section("Jangan berhenti pada nama", ["Nama produk dapat mirip. Basis Cek BPOM menampilkan nomor registrasi, nama produk, dan pendaftar; filter resminya juga menyediakan merek, kemasan, bentuk sediaan, komposisi, tanggal permohonan, tanggal terbit, tanggal kedaluwarsa, serta status. Buka detail hasil dan cocokkan atribut yang tersedia dengan barang."]),
        section("Jika hasil tidak cocok", ["Tunda penggunaan sampai identitasnya jelas."], ["Cari memakai nomor pada label.", "Periksa salah ketik atau variasi merek.", "Bandingkan pendaftar dan kemasan.", "Gunakan kanal BPOM untuk meminta penjelasan."]),
        section("Periksa lebih dari daftar terdaftar", ["Cek BPOM juga menyediakan bagian Produk Ditarik dari Peredaran dan Penjelasan Publik. Periksa keduanya bila produk menimbulkan keraguan atau ada kabar penarikan; hasil pencarian nama saja tidak menggantikan pemeriksaan pengumuman tersebut."]),
        section("Status dapat berubah", ["Catat tanggal pemeriksaan dan buka kembali basis resmi ketika akan membeli ulang atau bila ada informasi penarikan produk. Ketidakhadiran hasil tidak membuktikan sendiri bahwa suatu barang palsu; minta klarifikasi BPOM sebelum menyimpulkan."])
      ],
      keywords: "Cek BPOM kosmetik parfum notifikasi registrasi"
    }),
    article({
      id: "qris-dan-pemeriksaan-transaksi",
      category: "Pembayaran",
      title: "QRIS memudahkan pembayaran, tetapi detail transaksi tetap harus diperiksa",
      summary: "Bank Indonesia menjelaskan QRIS sebagai standar QR pembayaran yang didukung penyelenggara jasa pembayaran berizin dan diawasi.",
      source: { sourceName: sources.qris.name, sourceUrl: sources.qris.url, sourceDate: sources.qris.date },
      usageLimit: limits.safety,
      takeaways: ["QRIS adalah standar, bukan satu aplikasi.", "Periksa nama merchant dan nominal.", "Simpan status serta bukti transaksi."],
      sections: [
        section("Standar yang menghubungkan aplikasi dan merchant", ["Bank Indonesia menetapkan QRIS sebagai standar QR Code pembayaran, bukan satu aplikasi atau rekening tertentu. QRIS dikembangkan bersama industri sistem pembayaran dan Penyedia Jasa Pembayaran (PJP) penyelenggara QRIS harus berizin serta diawasi Bank Indonesia."]),
        section("Kenali cara nominal diisi", ["Pada Merchant Presented Mode (MPM) Statis, merchant memajang satu kode dan pengguna memasukkan nominal. Karena nominal diisi pengguna, pemeriksaan angka sebelum otorisasi sangat penting. Pada pola lain, nominal dapat sudah terbentuk oleh sistem; nama merchant dan jumlah tetap harus diperiksa pada layar aplikasi."]),
        section("Sebelum membayar", ["Konfirmasi berdasarkan layar aplikasi Anda sendiri."], ["Pastikan kode berasal dari merchant yang benar.", "Cocokkan nama merchant atau penerima.", "Periksa nominal.", "Jangan bagikan PIN atau OTP."]),
        section("Sesudah pembayaran", ["Jangan hanya mengandalkan tangkapan layar pihak lain. Pengguna dan merchant perlu memeriksa notifikasi atau status pada aplikasi masing-masing. Bila transaksi bermasalah atau diduga penipuan, segera hubungi PJP yang aplikasinya digunakan melalui kanal resmi."])
      ],
      keywords: "QRIS Bank Indonesia pembayaran merchant nominal"
    }),
    article({
      id: "transaksi-daring-bukti-dan-pengaduan-konsumen",
      category: "Konsumen",
      title: "Transaksi daring: simpan informasi penjual, harga, dan bukti komunikasi",
      summary: "Permendag 19/2026 mengatur perdagangan melalui sistem elektronik, termasuk layanan pengaduan konsumen pada penyelenggara dan perantara tertentu. Checklist bukti di artikel ini adalah rekomendasi editorial agar transaksi lebih mudah ditelusuri.",
      source: { sourceName: sources.consumer.name, sourceUrl: sources.consumer.url, sourceDate: sources.consumer.date },
      usageLimit: limits.legal,
      takeaways: ["Cari kanal pengaduan yang jelas dan dapat dihubungi.", "Sebagai praktik dokumentasi, simpan bukti pesanan dan pembayaran.", "Ajukan pengaduan dengan kronologi yang dapat diperiksa."],
      sections: [
        section("Apa yang dikonfirmasi peraturan", ["Permendag 19/2026 mewajibkan Penyelenggara Perdagangan Melalui Sistem Elektronik (PPMSE) dan Penyelenggara Sarana Perantara (PSP) yang tidak dikecualikan dari kewajiban Perizinan Berusaha memiliki layanan pengaduan konsumen. Layanan itu harus ditampilkan jelas pada laman yang mudah dibaca dan berupa nomor kontak dan/atau alamat surat elektronik yang dapat dihubungi serta ditanggapi. Ruang lingkup kewajiban berbeda menurut peran dan model bisnis."]),
        section("Informasi sebelum transaksi", ["Periksa informasi barang atau jasa, harga dan biaya, identitas pihak yang tersedia, syarat transaksi, serta kanal pengaduan. Peraturan yang sama juga mewajibkan pedagang menyampaikan informasi asal dan bukti pemenuhan standar tertentu bila memang diwajibkan untuk barang atau jasa tersebut. Buka sumber peraturan untuk ruang lingkup lengkap."]),
        section("Rekomendasi dokumentasi Digdaya", ["Daftar berikut adalah praktik editorial untuk membantu penelusuran, bukan daftar kewajiban hukum yang dikutip lengkap dari satu pasal."], ["Halaman penawaran atau ringkasan pesanan.", "Identitas dan kanal penjual.", "Bukti pembayaran serta nomor referensi.", "Percakapan dan perubahan kesepakatan."]),
        section("Pisahkan fakta dari tuduhan", ["Tulis apa yang dipesan, diterima, kapan terjadi, upaya yang sudah dilakukan, dan penyelesaian yang diminta. Kirim melalui kanal yang diumumkan dan simpan nomor tiket atau balasan. Hindari tuduhan tanpa bukti."])
      ],
      keywords: "perlindungan konsumen transaksi daring bukti pengaduan"
    }),
    article({
      id: "core-web-vitals-lcp-inp-cls",
      category: "Website",
      title: "Core Web Vitals: LCP, INP, dan CLS mengukur pengalaman berbeda",
      summary: "web.dev mendokumentasikan LCP untuk pemuatan, INP untuk respons interaksi, dan CLS untuk stabilitas visual, dengan ambang baik 2,5 detik, 200 ms, dan 0,1.",
      source: { sourceName: sources.vitals.name, sourceUrl: sources.vitals.url, sourceDate: sources.vitals.date },
      usageLimit: limits.technical,
      readingMinutes: 6,
      takeaways: ["LCP menilai konten utama tampil.", "INP menilai respons interaksi.", "CLS menilai pergeseran tata letak."],
      sections: [
        section("Satu angka tidak mewakili seluruh pengalaman", ["Largest Contentful Paint (LCP) menilai pemuatan konten utama, Interaction to Next Paint (INP) menilai respons interaksi, dan Cumulative Layout Shift (CLS) menilai stabilitas visual. Halaman dapat memuat cepat tetapi lambat saat disentuh, atau responsif tetapi terus bergeser. Ketiganya perlu dibaca bersama pada perangkat dan jaringan yang mewakili pengguna."]),
        section("Ambang baik", ["Dokumentasi menyarankan evaluasi pada persentil ke-75, dipisahkan untuk mobile dan desktop."], ["LCP tidak lebih dari 2,5 detik.", "INP tidak lebih dari 200 milidetik.", "CLS tidak lebih dari 0,1."]),
        section("Bedakan data lapangan dan laboratorium", ["web.dev menegaskan Core Web Vitals terutama merupakan metrik lapangan. Lighthouse dapat mengukur LCP dan CLS secara simulasi, tetapi tidak mengukur INP tanpa interaksi pengguna; Total Blocking Time (TBT) hanya dipakai sebagai proksi laboratorium. Data lapangan tetap diperlukan untuk menangkap variasi perangkat, jaringan, dan pola interaksi nyata."]),
        section("Prioritas perbaikan", ["Prioritaskan aset konten utama, pecah tugas JavaScript panjang, tetapkan dimensi media, dan hindari animasi yang memicu perubahan tata letak. Ukur ulang pada persentil yang sama agar perubahan sebelum dan sesudah dapat dibandingkan."])
      ],
      keywords: "Core Web Vitals LCP INP CLS performa website"
    }),
    article({
      id: "konten-bermanfaat-people-first-dan-seo",
      category: "Website",
      title: "SEO yang sehat dimulai dari konten yang membantu manusia",
      summary: "Google Search Central menyarankan konten people-first yang jelas siapa pembuatnya, bagaimana disusun, dan mengapa diterbitkan.",
      source: { sourceName: sources.helpful.name, sourceUrl: sources.helpful.url, sourceDate: sources.helpful.date },
      usageLimit: "Tidak ada teknik yang menjamin peringkat atau pengindeksan. Fokuskan keputusan pada kebutuhan pembaca dan patuhi Search Essentials.",
      readingMinutes: 6,
      takeaways: ["Judul harus sesuai isi.", "Sebutkan sumber dan tanggal pemeriksaan.", "Jelaskan batas pada topik berisiko tinggi."],
      sections: [
        section("Who, how, dan why", ["Google menyarankan evaluasi siapa yang membuat konten, bagaimana konten disusun, dan mengapa diterbitkan. Gunakan byline yang akurat, jelaskan proses ketika pembaca wajar ingin mengetahuinya, serta pastikan tujuan utamanya membantu pengguna. Pada topik hukum, finansial, kesehatan, atau keselamatan, transparansi sumber dan batas semakin penting."]),
        section("Ciri halaman berguna", ["Google tidak menetapkan jumlah kata yang disukai. Yang dinilai dalam panduan ini adalah apakah uraian substansial, lengkap, memberi nilai tambahan, dan membuat pembaca merasa cukup belajar untuk mencapai tujuannya."], ["Judul benar-benar dijelaskan.", "Ringkasan tidak melebih-lebihkan sumber.", "Tautan mengarah ke halaman relevan.", "Artikel memiliki konteks, langkah, dan tanggal pemeriksaan.", "Penulis atau penanggung jawab dapat dikenali."]),
        section("Yang dihindari", ["Hindari banyak halaman berpola sama, ringkasan tanpa sumber, atau judul tren yang tidak memiliki artikel. Google juga memperingatkan agar tanggal tidak diubah hanya supaya halaman tampak segar ketika isinya tidak berubah secara substansial. Banyaknya halaman bukan pengganti kegunaan."])
      ],
      keywords: "SEO people first helpful content sumber artikel"
    }),
    article({
      id: "target-sentuh-focus-dan-aksesibilitas-mobile",
      category: "Aksesibilitas",
      title: "Kontrol mobile harus mudah disentuh dan fokus keyboard harus terlihat",
      summary: "WCAG 2.2 menetapkan ukuran minimum target 24×24 CSS piksel pada Level AA dengan pengecualian tertentu. Pada Level AA, komponen yang berfokus tidak boleh sepenuhnya tersembunyi oleh konten buatan penulis.",
      source: { sourceName: sources.wcag.name, sourceUrl: sources.wcag.url, sourceDate: sources.wcag.date },
      usageLimit: limits.technical,
      readingMinutes: 6,
      takeaways: ["Target kecil membutuhkan ukuran atau jarak memadai.", "Level AA mencegah fokus sepenuhnya tersembunyi; seluruh fokus terlihat adalah Level AAA atau praktik lebih kuat.", "Interaksi tidak boleh hanya bergantung pada hover."],
      sections: [
        section("Ukuran dan jarak bekerja bersama", ["WCAG 2.2 Level AA memuat ukuran minimum target 24×24 CSS piksel dengan pengecualian. Tindakan utama pada ponsel biasanya lebih nyaman dengan area yang lebih lega."]),
        section("Pemeriksaan menu dan tombol", ["Uji menggunakan sentuhan dan keyboard. Outline yang sangat kontras serta seluruh indikator fokus tetap terlihat merupakan praktik lebih kuat; persyaratan Level AA yang dirujuk di sini adalah fokus tidak sepenuhnya tersembunyi."], ["Area target memenuhi ukuran atau pengecualian yang berlaku.", "Indikator fokus dapat dikenali.", "Komponen berfokus tidak sepenuhnya tersembunyi header sticky.", "Menu dapat ditutup dengan tombol, backdrop, dan Escape."]),
        section("Uji dengan pembesaran", ["Pada zoom dan ukuran teks lebih besar, karakter tidak boleh tumpang tindih, tombol terpotong, atau paragraf memerlukan gulir dua arah."])
      ],
      keywords: "WCAG 2.2 target size focus mobile aksesibilitas"
    }),
    article({
      id: "owasp-top-10-2025-peta-risiko-website",
      category: "Keamanan",
      title: "OWASP Top 10:2025 adalah peta risiko, bukan sertifikat keamanan",
      summary: "OWASP Top 10:2025 menempatkan kontrol akses rusak, salah konfigurasi, dan kegagalan rantai pasok perangkat lunak pada tiga urutan teratas.",
      source: { sourceName: sources.owasp.name, sourceUrl: sources.owasp.url, sourceDate: sources.owasp.date },
      usageLimit: limits.technical,
      readingMinutes: 7,
      takeaways: ["Mulai dari aset dan akses.", "Pembaruan komponen bukan satu-satunya kontrol.", "Catat konfigurasi, pengujian, dan respons insiden."],
      sections: [
        section("Dokumen kesadaran, bukan sertifikat", ["OWASP menyebut Top 10:2025 sebagai dokumen kesadaran standar bagi pengembang dan keamanan aplikasi web. Tiga urutan pertamanya adalah Broken Access Control, Security Misconfiguration, dan Software Supply Chain Failures. Daftar ini membantu memulai percakapan risiko, tetapi tidak menyatakan satu aplikasi telah aman atau patuh."]),
        section("Risiko tidak selesai dengan satu pemindai", ["Hasil pemindaian bersih tidak membuktikan bahwa otorisasi bisnis, konfigurasi, rantai pasok, desain, logging, autentikasi, dan penanganan kondisi luar biasa sudah aman. Sebagian kontrol membutuhkan peninjauan arsitektur serta uji alur bisnis oleh manusia."]),
        section("Pertanyaan untuk pemilik layanan", ["Petakan jawaban ke aset dan alur nyata."], ["Siapa dapat melihat atau mengubah data?", "Konfigurasi apa berbeda antara lingkungan?", "Dari mana dependensi dan build berasal?", "Bagaimana kegagalan dicatat dan dipulihkan?"]),
        section("Jadikan backlog berbasis risiko", ["Nilai relevansi dan dampak setiap kategori pada sistem nyata. Tentukan pemilik perbaikan, bukti pengujian, batas waktu, dan kriteria penutupan untuk setiap risiko yang ditemukan; jangan menandai seluruh daftar selesai hanya karena alat otomatis tidak memberi temuan."])
      ],
      keywords: "OWASP Top 10 2025 keamanan website risiko"
    }),
    article({
      id: "keamanan-login-sesi-dan-pemulihan-akun",
      category: "Keamanan",
      title: "Keamanan login mencakup sesi, percobaan gagal, dan pemulihan akun",
      summary: "OWASP menyarankan pengelola sesi yang aman, rotasi ID sesi setelah login, pembatasan percobaan gagal, dan invalidasi sesi saat logout serta batas waktu.",
      source: { sourceName: sources.auth.name, sourceUrl: sources.auth.url, sourceDate: sources.auth.date },
      usageLimit: limits.technical,
      readingMinutes: 7,
      takeaways: ["Jangan menaruh ID sesi pada URL.", "Rotasi ID setelah autentikasi.", "Invalidasi sesi saat logout dan batas waktu."],
      sections: [
        section("Sesi adalah kelanjutan login", ["Setelah autentikasi, pengenal sesi mewakili akses pengguna. Penggunaan ulang sesi dapat berbahaya walaupun password tidak diketahui penyerang."]),
        section("Kontrol yang perlu dibahas", ["OWASP merekomendasikan pengelola sesi bawaan sisi server yang aman, ID acak baru setelah login, penyimpanan melalui cookie aman, serta invalidasi setelah logout, idle timeout, dan absolute timeout. Sebagai rekomendasi operasional, evaluasi atribut cookie terhadap arsitektur dan alur aplikasi Anda."], ["Atur Secure dan HttpOnly; evaluasi SameSite sesuai alur aplikasi.", "Jangan menaruh ID sesi pada URL.", "Batasi atau perlambat percobaan gagal tanpa menciptakan denial of service.", "Catat kegagalan dan beri peringatan untuk pola serangan otomatis."]),
        section("Perkuat faktor dan kebijakan password", ["OWASP menyarankan autentikasi multifaktor (MFA) bila memungkinkan, pengecekan password baru terhadap daftar kredensial yang diketahui bocor, dan tidak memaksa rotasi password rutin kecuali ada dugaan kebocoran. Kebijakan harus disesuaikan dengan risiko serta standar identitas yang digunakan."]),
        section("Pemulihan akun tidak boleh lebih lemah", ["Alur lupa password, perubahan email, dan dukungan akun perlu dilindungi setara dengan login utama. Gunakan pesan hasil yang tidak membocorkan apakah suatu akun terdaftar. Jangan meminta password, OTP, atau kode pemulihan melalui chat."])
      ],
      keywords: "login sesi OWASP authentication cookie logout timeout"
    })
  ];

  const deepFreeze = value => {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.freeze(value);
    Object.values(value).forEach(deepFreeze);
    return value;
  };

  globalThis.DigdayaNewsMeta = deepFreeze({ reviewDate: REVIEW_DATE, count: data.length });
  globalThis.DigdayaNewsData = deepFreeze(data);
})();
