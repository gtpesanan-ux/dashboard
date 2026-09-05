(() => {
  'use strict';

  const REVIEWED_AT = '2026-09-05';
  const PAGE_SIZE = 16;
  const ANGLES = [
    'Panduan langkah',
    'Daftar periksa',
    'Perbandingan',
    'Risiko',
    'Kesalahan umum',
    'Istilah penting',
    'Template praktis'
  ];

  const SOURCES = Object.freeze({
    'oss-nib': {
      name: 'OSS Indonesia — Panduan Nomor Induk Berusaha',
      url: 'https://oss.go.id/id/panduan/676a8758cde449ca8bf75911'
    },
    'oss-risk': {
      name: 'OSS Indonesia — Perizinan Berusaha Risiko Menengah Tinggi/Tinggi',
      url: 'https://oss.go.id/id/panduan/69102b5d67aecc64abaeef41'
    },
    'oss-umku': {
      name: 'OSS Indonesia — Perizinan Berusaha untuk Menunjang Kegiatan Usaha',
      url: 'https://oss.go.id/id/umku'
    },
    'ahu-ptp': {
      name: 'AHU — Pendirian Perseroan Perorangan',
      url: 'https://layanan.ahu.go.id/ahu/layanan-produk/badan-usaha/perseroan-perorangan/pendirian'
    },
    'ahu-pt': {
      name: 'AHU — Tanya Jawab Perseroan Terbatas',
      url: 'https://portal.ahu.go.id/page/faq/faq-perseroan-terbatas'
    },
    'ahu-cv': {
      name: 'AHU — Panduan Pendaftaran CV',
      url: 'https://panduan.ahu.go.id/doku.php?id=panduan_cv'
    },
    'djp-spt': {
      name: 'DJP — Buku Panduan Coretax DJP',
      url: 'https://pajak.go.id/coretaxpedia/buku-panduan-coretax-djp'
    },
    'djp-faktur': {
      name: 'DJP — Ketentuan Faktur Pajak',
      url: 'https://www.pajak.go.id/id/peraturan/faktur-pajak'
    },
    'djp-spt-masa': {
      name: 'DJP — SPT Masa pada Coretax',
      url: 'https://pajak.go.id/id/reformdjp/coretax-spt'
    },
    'djp-error': {
      name: 'DJP — Panduan Penanganan Kode Error Layanan Online',
      url: 'https://pajak.go.id/id/panduan-penanganan-kode-error-layanan-online'
    },
    'djp-cert': {
      name: 'DJP — Aktivasi Akun dan Sertifikat Digital',
      url: 'https://pajak.go.id/id/artikel/penting-cara-aktivasi-akun-dan-dapatkan-tanda-tangan-elektronik-gratis-dari-djp'
    },
    'djp-npwp': {
      name: 'DJP — Registrasi Coretax dan NPWP 16 Digit',
      url: 'https://pajak.go.id/reformdjp/coretax-registrasi/'
    },
    'uu-hpp': {
      name: 'BPK RI — Undang-Undang Nomor 7 Tahun 2021',
      url: 'https://peraturan.bpk.go.id/Details/185162/uu-no-7-tahun-2021'
    },
    'iso-records': {
      name: 'ISO — ISO 15489-1 Records Management',
      url: 'https://www.iso.org/standard/62542.html'
    },
    'nist-incident': {
      name: 'NIST — Incident Response Recommendations (SP 800-61 Rev. 3)',
      url: 'https://csrc.nist.gov/pubs/sp/800/61/r3/final'
    },
    'nist-contingency': {
      name: 'NIST — Contingency Planning Guide (SP 800-34 Rev. 1)',
      url: 'https://csrc.nist.gov/pubs/sp/800/34/r1/upd1/final'
    },
    'owasp-logging': {
      name: 'OWASP — Logging Cheat Sheet',
      url: 'https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html'
    },
    'cisa-ransomware': {
      name: 'CISA — StopRansomware Guide',
      url: 'https://www.cisa.gov/stopransomware/ransomware-guide'
    },
    'ietf-time': {
      name: 'RFC Editor — Internet X.509 Time-Stamp Protocol',
      url: 'https://www.rfc-editor.org/rfc/rfc3161'
    },
    'pdki': {
      name: 'DJKI — Pangkalan Data Kekayaan Intelektual',
      url: 'https://pdki-indonesia.dgip.go.id/'
    },
    'pandi-v10': {
      name: 'PANDI — Kebijakan Pendaftaran Nama Domain versi 10.0',
      url: 'https://api.pandi.id/public/files/2025/8/kebijakan-pendaftaran-nama-domain-versi-10-0-bilingual-new-1756441612.pdf'
    },
    'icann-transfer': {
      name: 'ICANN — Domain Name Transfer FAQs',
      url: 'https://www.icann.org/resources/pages/name-holder-faqs-2017-10-10-en'
    },
    'icann-renewal': {
      name: 'ICANN — Domain Renewal and Expiration FAQs',
      url: 'https://www.icann.org/resources/pages/domain-name-renewal-expiration-faqs-2018-12-07-en'
    },
    'icann-lifecycle': {
      name: 'ICANN — gTLD Lifecycle',
      url: 'https://www.icann.org/en/contracted-parties/accredited-registrars/resources/gtld-lifecycle'
    },
    'google-seo': {
      name: 'Google Search Central — SEO Starter Guide',
      url: 'https://developers.google.com/search/docs/fundamentals/seo-starter-guide'
    },
    'google-ranking': {
      name: 'Google Search Central — Ranking Systems Guide',
      url: 'https://developers.google.com/search/docs/appearance/ranking-systems-guide'
    },
    'gov-user-needs': {
      name: 'GOV.UK — Content Design: User Needs',
      url: 'https://www.gov.uk/guidance/content-design/user-needs'
    },
    'uu-consumer': {
      name: 'BPK RI — Undang-Undang Nomor 8 Tahun 1999',
      url: 'https://peraturan.bpk.go.id/Details/45288/uu-no-8-tahun-1999'
    },
    'google-helpful': {
      name: 'Google Search Central — Creating Helpful Content',
      url: 'https://developers.google.com/search/docs/fundamentals/creating-helpful-content'
    },
    'ftc-endorsement': {
      name: 'U.S. FTC — Disclosures 101 for Social Media Influencers',
      url: 'https://www.ftc.gov/business-guidance/resources/disclosures-101-social-media-influencers'
    },
    'ftc-dark': {
      name: 'U.S. FTC — Bringing Dark Patterns to Light',
      url: 'https://www.ftc.gov/reports/bringing-dark-patterns-light'
    },
    'iso-complaints': {
      name: 'ISO — ISO 10002 Customer Complaints',
      url: 'https://www.iso.org/standard/71580.html'
    },
    'pdp': {
      name: 'BPK RI — Undang-Undang Nomor 27 Tahun 2022',
      url: 'https://peraturan.bpk.go.id/Details/229798/uu-no-27-tahun-2022'
    },
    'cisa-phishing': {
      name: 'CISA — Recognize and Report Phishing',
      url: 'https://www.cisa.gov/secure-our-world/recognize-and-report-phishing'
    },
    'cisa-mfa': {
      name: 'CISA — Turn On Multifactor Authentication',
      url: 'https://www.cisa.gov/secure-our-world/turn-mfa'
    },
    'cisa-update': {
      name: 'CISA — Update Software',
      url: 'https://www.cisa.gov/secure-our-world/update-software'
    },
    'owasp-auth': {
      name: 'OWASP — Authentication Cheat Sheet',
      url: 'https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html'
    },
    'owasp-input': {
      name: 'OWASP — Input Validation Cheat Sheet',
      url: 'https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html'
    },
    'bpom-check': {
      name: 'BPOM — Cek Produk Kosmetika',
      url: 'https://cekbpom.pom.go.id/produk-kosmetika'
    },
    'bpom-label': {
      name: 'BPK RI — Peraturan BPOM Nomor 18 Tahun 2024 tentang Penandaan, Promosi, dan Iklan Kosmetik',
      url: 'https://peraturan.bpk.go.id/Details/309969/peraturan-bpom-no-18-tahun-2024'
    },
    'bpom-warning': {
      name: 'BPOM — Produk Public Warning',
      url: 'https://cekbpom.pom.go.id/produk-public-warning'
    },
    'bpom-definition': {
      name: 'BPOM — Definisi dan Penggunaan Kosmetik',
      url: 'https://www.pom.go.id/siaran-pers/temuan-produk-yang-didaftarkan-sebagai-kosmetik-namun-digunakan-diaplikasikan-selayaknya-obat'
    },
    'ifra-standards': {
      name: 'IFRA — Standards for the Safe Use of Fragrance',
      url: 'https://ifrafragrance.org/initiatives-positions/safe-use-fragrance-science/ifra-standards'
    },
    'ifra-library': {
      name: 'IFRA — Standards Library',
      url: 'https://ifrafragrance.org/standards-library'
    },
    'ifra-faq': {
      name: 'IFRA — Questions about Fragrance',
      url: 'https://ifrafragrance.org/about-fragrance/this-is-a-fragrance-2'
    },
    'pmse': {
      name: 'BPK RI — Peraturan Pemerintah Nomor 80 Tahun 2019',
      url: 'https://peraturan.bpk.go.id/Details/126143/pp-no-80-tahun-2019'
    },
    'bi-qris-safe': {
      name: 'Bank Indonesia — Edukasi Keamanan QRIS bagi Masyarakat dan Merchant',
      url: 'https://www.bi.go.id/id/publikasi/ruang-media/news-release/Pages/sp_259323.aspx'
    },
    'bca-transfer-proof': {
      name: 'BCA — Waspada Modus Bukti Transfer Palsu',
      url: 'https://www.bca.co.id/id/informasi/awas-modus/2025/04/09/09/32/awas-modus-bukti-transfer-palsu-ini-tips-keamanannya'
    },
    'bi-complaint': {
      name: 'Bank Indonesia — Perlindungan dan Pengaduan Konsumen',
      url: 'https://www.bi.go.id/id/layanan/pengaduan-konsumen/default.aspx'
    },
    'ojk-iasc': {
      name: 'OJK — Indonesia Anti-Scam Centre',
      url: 'https://iasc.ojk.go.id/'
    }
  });

  const LIBRARY = [
    {
      category: 'Badan usaha & perizinan',
      entries: [
        {
          angle: 'Panduan langkah',
          title: 'Urutan awal memperoleh NIB',
          summary: 'NIB diterbitkan melalui OSS setelah data pelaku usaha dan kegiatan usaha dilengkapi sesuai alur yang berlaku.',
          focus: 'Menyiapkan proses registrasi tanpa menganggap NIB sebagai pengganti seluruh izin.',
          points: [
            'Siapkan identitas pelaku usaha dan data badan usaha yang konsisten.',
            'Pilih kegiatan usaha berdasarkan uraian KBLI yang benar-benar dijalankan.',
            'Unduh dan arsipkan NIB beserta dokumen keluaran OSS setelah terbit.'
          ],
          usageLimit: 'Gunakan sebagai urutan persiapan; persyaratan akhir mengikuti profil risiko dan keluaran akun OSS.',
          source: 'oss-nib'
        },
        {
          angle: 'Daftar periksa',
          title: 'Kesiapan mendirikan Perseroan Perorangan',
          summary: 'Perseroan Perorangan ditujukan bagi usaha mikro dan kecil yang memenuhi kriteria serta didirikan oleh satu orang.',
          focus: 'Memeriksa kelayakan bentuk usaha sebelum mengisi pernyataan pendirian.',
          points: [
            'Pastikan pendiri adalah satu orang dan memenuhi kriteria usaha mikro atau kecil.',
            'Siapkan nama, alamat, kegiatan, modal, serta data pemilik dan pengurus.',
            'Rencanakan pelaporan perubahan bila data perseroan berubah setelah pendaftaran.'
          ],
          usageLimit: 'Checklist ini tidak menetapkan kelayakan hukum; konfirmasi kondisi usaha pada AHU dan OSS.',
          source: 'ahu-ptp'
        },
        {
          angle: 'Perbandingan',
          title: 'Perseroan Perorangan atau PT persekutuan modal',
          summary: 'Kedua bentuk sama-sama perseroan berbadan hukum, tetapi berbeda pada jumlah pendiri, struktur kepemilikan, dan proses korporasi.',
          focus: 'Membandingkan struktur yang sesuai dengan pemilik, modal, dan rencana pertumbuhan.',
          points: [
            'Perseroan Perorangan memiliki satu pendiri yang juga menjadi pemegang saham.',
            'PT persekutuan modal mengatur kepemilikan melalui saham dan organ perseroan.',
            'Masuknya investor atau perubahan skala usaha dapat memengaruhi bentuk yang sesuai.'
          ],
          usageLimit: 'Perbandingan ini bersifat umum dan tidak menggantikan telaah akta atau nasihat notaris.',
          source: 'ahu-pt'
        },
        {
          angle: 'Risiko',
          title: 'Risiko salah memilih KBLI',
          summary: 'Kode KBLI menghubungkan uraian kegiatan usaha dengan tingkat risiko serta perizinan yang diminta sistem OSS.',
          focus: 'Mencegah pemilihan kode hanya karena namanya mirip dengan merek atau produk.',
          points: [
            'Cocokkan kode dengan kegiatan yang menghasilkan pendapatan, bukan sekadar nama dagang.',
            'Baca uraian dan cakupan tiap kode sampai tingkat subgolongan yang relevan.',
            'Tinjau kembali KBLI ketika model usaha atau proses produksi berubah.'
          ],
          usageLimit: 'Jangan memakai judul singkat sebagai satu-satunya dasar; periksa uraian KBLI dan hasil pemetaan OSS.',
          source: 'oss-risk'
        },
        {
          angle: 'Kesalahan umum',
          title: 'Kesalahan saat mendaftarkan CV',
          summary: 'Pendaftaran CV memerlukan data sekutu, kegiatan, kedudukan, dan dokumen yang selaras agar proses AHU tidak tersendat.',
          focus: 'Mengurangi koreksi akibat data yang berbeda antar dokumen.',
          points: [
            'Hindari perbedaan ejaan nama sekutu pada identitas dan dokumen pendaftaran.',
            'Pastikan kedudukan serta alamat tidak saling bertentangan.',
            'Periksa peran sekutu aktif dan pasif sebelum pengajuan diselesaikan.'
          ],
          usageLimit: 'Daftar kesalahan ini bukan panduan pendirian lengkap; ikuti formulir dan petunjuk AHU yang aktif.',
          source: 'ahu-cv'
        },
        {
          angle: 'Istilah penting',
          title: 'Apa arti PB-UMKU',
          summary: 'PB-UMKU adalah perizinan berusaha untuk menunjang kegiatan usaha dan kebutuhannya bergantung pada kegiatan serta sektor.',
          focus: 'Membedakan izin penunjang dari identitas dasar usaha.',
          points: [
            'NIB berfungsi sebagai identitas pelaku usaha dalam sistem OSS.',
            'PB-UMKU terkait kebutuhan penunjang tertentu yang muncul pada kegiatan usaha.',
            'Nama, instansi penerbit, dan persyaratan PB-UMKU dapat berbeda menurut sektor.'
          ],
          usageLimit: 'Istilah ini tidak berarti semua usaha memerlukan PB-UMKU yang sama; baca keluaran OSS masing-masing.',
          source: 'oss-umku'
        },
        {
          angle: 'Template praktis',
          title: 'Lembar persiapan data OSS',
          summary: 'Satu lembar data induk membantu tim memasukkan identitas, lokasi, kegiatan, dan penanggung jawab secara konsisten.',
          focus: 'Membuat sumber data tunggal sebelum formulir OSS diisi.',
          points: [
            'Identitas: nama resmi, nomor identitas, kontak, dan data badan usaha.',
            'Kegiatan: uraian operasional, KBLI terpilih, lokasi, serta skala usaha.',
            'Kontrol: pemilik data, tanggal verifikasi, dokumen bukti, dan status pengajuan.'
          ],
          usageLimit: 'Template ini hanya alat konsistensi internal; kolom resmi dan bukti tetap mengikuti sistem OSS.',
          source: 'oss-nib'
        }
      ]
    },
    {
      category: 'Pajak & keuangan',
      entries: [
        {
          angle: 'Panduan langkah',
          title: 'Menyiapkan akses Coretax secara tertib',
          summary: 'Akses layanan pajak perlu dimulai dari data registrasi, kanal autentikasi, dan kewenangan pengguna yang benar.',
          focus: 'Mencegah pekerjaan pajak bergantung pada satu akun atau satu perangkat.',
          points: [
            'Cocokkan identitas wajib pajak dan kontak yang tersimpan pada sistem.',
            'Aktifkan sarana autentikasi atau tanda tangan elektronik sesuai kebutuhan layanan.',
            'Catat siapa yang berwenang membuat, memeriksa, dan mengirim dokumen pajak.'
          ],
          usageLimit: 'Ikuti tampilan Coretax terkini; menu dan proses dapat berubah setelah tanggal peninjauan.',
          source: 'djp-cert'
        },
        {
          angle: 'Daftar periksa',
          title: 'Bukti sebelum mengirim SPT Tahunan',
          summary: 'Penyampaian SPT perlu ditopang data yang relevan—misalnya penghasilan, bukti potong, harta, kewajiban, lampiran, dan bukti penerimaan—sesuai jenis SPT.',
          focus: 'Memastikan isian dapat direkonsiliasi sebelum tombol kirim digunakan.',
          points: [
            'Rekonsiliasi catatan penghasilan dengan bukti potong dan dokumen pendukung.',
            'Periksa identitas, tahun pajak, status, serta daftar harta dan kewajiban.',
            'Simpan Bukti Penerimaan Elektronik bersama salinan SPT yang dikirim.'
          ],
          usageLimit: 'Checklist tidak menentukan perlakuan pajak suatu transaksi; konsultasikan kasus khusus kepada pihak kompeten.',
          source: 'djp-spt'
        },
        {
          angle: 'Perbandingan',
          title: 'Faktur komersial dan Faktur Pajak',
          summary: 'Invoice menagih transaksi komersial, sedangkan Faktur Pajak adalah dokumen perpajakan dengan ketentuan penerbitan tersendiri.',
          focus: 'Mencegah penggunaan dua dokumen berbeda seolah memiliki fungsi yang sama.',
          points: [
            'Invoice mengikuti kesepakatan jual beli dan kebutuhan penagihan para pihak.',
            'Faktur Pajak dibuat oleh pihak serta untuk transaksi yang memenuhi ketentuan pajak.',
            'Nomor, waktu pembuatan, dan pembetulan Faktur Pajak mengikuti aturan DJP.'
          ],
          usageLimit: 'Jangan menerbitkan atau mengoreksi Faktur Pajak hanya berdasarkan ringkasan ini.',
          source: 'djp-faktur'
        },
        {
          angle: 'Risiko',
          title: 'Risiko data pajak tidak direkonsiliasi',
          summary: 'Perbedaan antara transaksi, pembayaran, bukti potong, faktur, dan pelaporan dapat memicu koreksi serta pekerjaan ulang.',
          focus: 'Menemukan selisih sebelum masa pelaporan ditutup.',
          points: [
            'Bandingkan ledger penjualan dengan faktur dan penerimaan pembayaran.',
            'Cocokkan bukti potong yang diterima atau diterbitkan dengan lawan transaksi.',
            'Dokumentasikan selisih, penyebab, keputusan koreksi, dan penanggung jawab.'
          ],
          usageLimit: 'Rekonsiliasi internal tidak membuktikan kepatuhan; kewajiban bergantung pada status dan transaksi wajib pajak.',
          source: 'djp-spt-masa'
        },
        {
          angle: 'Kesalahan umum',
          title: 'Kesalahan akses layanan pajak daring',
          summary: 'Kegagalan layanan sering berasal dari status akun, data identitas, hak akses, atau format isian yang belum sesuai.',
          focus: 'Memisahkan kesalahan data pengguna dari gangguan layanan.',
          points: [
            'Catat kode error dan waktu kejadian sebelum mengulang proses.',
            'Periksa status NPWP, registrasi akun, hak akses, dan kelengkapan kolom.',
            'Gunakan kanal bantuan resmi bila langkah pada panduan tidak menyelesaikan masalah.'
          ],
          usageLimit: 'Jangan menebak solusi untuk kode yang berbeda; cocokkan kode persis dengan panduan DJP.',
          source: 'djp-error'
        },
        {
          angle: 'Istilah penting',
          title: 'NPWP, NIK, dan identitas perpajakan',
          summary: 'Penggunaan NIK atau NPWP dalam administrasi pajak bergantung pada jenis wajib pajak dan status aktivasi datanya.',
          focus: 'Mencegah asumsi bahwa setiap nomor identitas otomatis aktif untuk seluruh layanan.',
          points: [
            'NIK adalah identitas kependudukan dan dapat digunakan dalam administrasi pajak sesuai ketentuan.',
            'Wajib pajak badan tetap memiliki identitas perpajakan badan.',
            'Format dan status nomor perlu diperiksa pada kanal DJP sebelum digunakan.'
          ],
          usageLimit: 'Ringkasan ini tidak menetapkan status NPWP seseorang; verifikasi melalui layanan DJP.',
          source: 'djp-npwp'
        },
        {
          angle: 'Template praktis',
          title: 'Matriks tenggat dan bukti pajak',
          summary: 'Matriks bulanan membuat kewajiban, pemilik tugas, status, serta bukti penyelesaian terlihat dalam satu tampilan.',
          focus: 'Mengubah kalender pajak menjadi kontrol kerja yang dapat diaudit.',
          points: [
            'Kolom inti: jenis kewajiban, masa pajak, tenggat, dan penanggung jawab.',
            'Kolom kontrol: sumber data, reviewer, status pembayaran, dan status pelaporan.',
            'Kolom bukti: nomor penerimaan, tautan arsip, serta catatan koreksi.'
          ],
          usageLimit: 'Isi tenggat harus ditentukan dari kewajiban aktual dan aturan terbaru, bukan disalin permanen dari contoh.',
          source: 'uu-hpp'
        }
      ]
    },
    {
      category: 'Administrasi & operasional',
      entries: [
        {
          angle: 'Panduan langkah',
          title: 'Membangun arsip kerja yang tertelusur',
          summary: 'Arsip yang tertib menghubungkan dokumen dengan pemilik, konteks, versi, masa simpan, dan hak akses.',
          focus: 'Membuat dokumen dapat ditemukan dan dipahami kembali.',
          points: [
            'Kelompokkan arsip berdasarkan proses bisnis, bukan hanya nama orang.',
            'Tetapkan pola nama file, metadata, versi, dan lokasi penyimpanan baku.',
            'Tentukan masa simpan serta proses pemusnahan yang sesuai kewajiban.'
          ],
          usageLimit: 'Kebijakan retensi wajib disesuaikan dengan jenis dokumen dan ketentuan hukum yang berlaku.',
          source: 'iso-records'
        },
        {
          angle: 'Daftar periksa',
          title: 'Kesiapan menangani insiden keamanan siber',
          summary: 'Respons insiden keamanan siber memerlukan peran, jalur eskalasi, bukti, komunikasi, dan pemulihan yang telah ditentukan.',
          focus: 'Mempersingkat waktu dari deteksi hingga keputusan.',
          points: [
            'Tentukan kriteria insiden siber, tingkat dampak, dan orang yang berwenang memimpin.',
            'Siapkan kanal eskalasi, kontak darurat, serta lokasi pencatatan bukti.',
            'Uji prosedur komunikasi, pemulihan, dan evaluasi pascainsiden.'
          ],
          usageLimit: 'Checklist ini mengadaptasi NIST untuk insiden keamanan siber dan perlu diuji melalui simulasi; dokumen yang belum dilatih belum membuktikan kesiapan.',
          source: 'nist-incident'
        },
        {
          angle: 'Perbandingan',
          title: 'Data operasional dan cadangan pemulihan',
          summary: 'Data operasional dipakai untuk layanan sehari-hari, sedangkan cadangan disiapkan agar sistem dan data dapat dipulihkan setelah gangguan.',
          focus: 'Membedakan ketersediaan data aktif dari kemampuan pemulihan.',
          points: [
            'Data operasional dapat berubah selama kegiatan berjalan dan bukan cadangan pemulihan.',
            'Cadangan perlu disimpan sesuai risiko, memiliki jadwal, serta akses yang dibatasi.',
            'Uji pemulihan diperlukan untuk menilai apakah target waktu dan titik pemulihan dapat dicapai.'
          ],
          usageLimit: 'NIST SP 800-34 adalah panduan kontinjensi sistem informasi federal AS; adaptasikan berdasarkan dampak bisnis dan aturan yang berlaku.',
          source: 'nist-contingency'
        },
        {
          angle: 'Risiko',
          title: 'Risiko log tanpa tata kelola',
          summary: 'Log dapat membantu investigasi, tetapi pencatatan berlebihan atau tanpa perlindungan dapat membuka data sensitif.',
          focus: 'Menyeimbangkan kebutuhan observasi dengan keamanan dan privasi.',
          points: [
            'Tentukan peristiwa yang perlu dicatat berdasarkan risiko dan tujuan.',
            'Hindari menyimpan kata sandi, token, atau data sensitif yang tidak diperlukan.',
            'Batasi akses, lindungi integritas, dan tetapkan retensi log.'
          ],
          usageLimit: 'Contoh OWASP harus dipetakan ke arsitektur sistem dan kewajiban perlindungan data setempat.',
          source: 'owasp-logging'
        },
        {
          angle: 'Kesalahan umum',
          title: 'Cadangan ada tetapi tidak dapat dipulihkan',
          summary: 'Backup yang tidak pernah diuji dapat gagal saat data benar-benar dibutuhkan setelah gangguan atau serangan.',
          focus: 'Mengukur keberhasilan pemulihan, bukan sekadar keberhasilan penyalinan.',
          points: [
            'Tetapkan target waktu pemulihan dan titik data yang dapat diterima.',
            'Simpan salinan terpisah dengan akses yang dibatasi.',
            'Lakukan uji pulih berkala dan catat hasil serta tindak lanjutnya.'
          ],
          usageLimit: 'Frekuensi dan arsitektur backup harus mengikuti dampak bisnis serta karakter sistem.',
          source: 'cisa-ransomware'
        },
        {
          angle: 'Istilah penting',
          title: 'Versi, revisi, dan cap waktu',
          summary: 'Nomor versi menunjukkan keadaan dokumen, riwayat revisi menjelaskan perubahan, dan cap waktu membantu membuktikan waktu tertentu.',
          focus: 'Memakai istilah kendali dokumen secara konsisten.',
          points: [
            'Versi mengidentifikasi keadaan dokumen yang diterbitkan atau digunakan.',
            'Riwayat revisi mencatat apa, kapan, dan siapa yang mengubah.',
            'Cap waktu digital memiliki syarat teknis dan tidak sama dengan tanggal yang diketik.'
          ],
          usageLimit: 'Cap waktu sederhana pada nama file bukan bukti kriptografis sebagaimana protokol time-stamp.',
          source: 'ietf-time'
        },
        {
          angle: 'Template praktis',
          title: 'Catatan keputusan satu halaman',
          summary: 'Catatan keputusan ringkas menjaga konteks, opsi, bukti, pemilik, dan tanggal evaluasi tetap terbaca.',
          focus: 'Mencegah keputusan penting hilang di percakapan informal.',
          points: [
            'Masalah dan batas keputusan: apa yang diputuskan serta apa yang tidak.',
            'Bukti dan opsi: sumber, asumsi, alternatif, serta risiko utama.',
            'Keputusan dan kontrol: pemilik, tanggal berlaku, indikator, dan waktu tinjau ulang.'
          ],
          usageLimit: 'Template tidak menggantikan persetujuan formal yang diwajibkan kontrak, kebijakan, atau peraturan.',
          source: 'iso-records'
        }
      ]
    },
    {
      category: 'Merek, domain & situs web',
      entries: [
        {
          angle: 'Panduan langkah',
          title: 'Memeriksa nama sebelum dipakai',
          summary: 'Pemeriksaan awal perlu membandingkan nama, unsur bunyi, kelas barang atau jasa, domain, dan identitas kanal digital.',
          focus: 'Mengurangi konflik nama sebelum biaya merek dan situs dikeluarkan.',
          points: [
            'Cari kata utama dan variasi ejaannya pada PDKI.',
            'Periksa kelas barang atau jasa yang relevan dengan kegiatan nyata.',
            'Dokumentasikan hasil pencarian serta minta telaah profesional bila berisiko.'
          ],
          usageLimit: 'Hasil pencarian mandiri bukan jaminan merek dapat didaftar atau tidak melanggar hak pihak lain.',
          source: 'pdki'
        },
        {
          angle: 'Daftar periksa',
          title: 'Kontrol akun domain generik (gTLD)',
          summary: 'Domain generik (gTLD) bisnis perlu berada pada akun organisasi dengan kontak, autentikasi, dan jadwal perpanjangan yang terkendali.',
          focus: 'Mencegah domain terkunci pada akun pribadi atau terlambat diperpanjang.',
          points: [
            'Catat registrar, pemegang nama terdaftar, email akun, dan tanggal berakhir.',
            'Gunakan email organisasi, kata sandi unik, serta autentikasi multifaktor.',
            'Uji akses akun dan siapkan pengingat perpanjangan berlapis.'
          ],
          usageLimit: 'Panduan ICANN ini terutama berlaku pada gTLD dan registrar terakreditasi; domain .id mengikuti kebijakan PANDI dan registrar terkait.',
          source: 'icann-renewal'
        },
        {
          angle: 'Perbandingan',
          title: 'Ketersediaan dan kelayakan nama domain .id',
          summary: 'Nama yang tersedia secara teknis belum tentu memenuhi persyaratan atau bebas dari perselisihan hak menurut kebijakan pendaftaran domain .id.',
          focus: 'Membedakan hasil cek ketersediaan dari pemeriksaan persyaratan dan hak pihak lain.',
          points: [
            'Cek ketersediaan hanya menunjukkan status pendaftaran pada saat pemeriksaan.',
            'Registran tetap wajib memenuhi persyaratan kategori domain dan memberikan data yang benar.',
            'Domain yang telah aktif dapat diperselisihkan oleh pihak yang merasa memiliki hak.'
          ],
          usageLimit: 'Gunakan Kebijakan Pendaftaran Nama Domain versi 10.0 dan ketentuan registrar yang berlaku pada saat pengajuan.',
          source: 'pandi-v10'
        },
        {
          angle: 'Risiko',
          title: 'Risiko transfer domain generik (gTLD) tanpa persiapan',
          summary: 'Transfer gTLD antara registrar terakreditasi ICANN dapat tertahan oleh status domain, data kontak, kode otorisasi, atau kebijakan waktu tertentu.',
          focus: 'Menjaga situs dan email tetap berjalan selama perpindahan registrar.',
          points: [
            'Periksa status domain dan kelayakan transfer sebelum memulai.',
            'Pastikan kontak penerima dapat mengakses email konfirmasi.',
            'Jangan mengubah DNS tanpa rencana kesinambungan situs dan email.'
          ],
          usageLimit: 'Ketentuan ICANN berlaku pada gTLD dan registrar terakreditasi; ccTLD, termasuk .id, dapat memiliki aturan berbeda.',
          source: 'icann-transfer'
        },
        {
          angle: 'Kesalahan umum',
          title: 'SEO terjebak pada trik peringkat',
          summary: 'Sistem pencarian memakai banyak sinyal; kualitas tidak dapat digantikan oleh pengulangan kata kunci atau klaim peringkat instan.',
          focus: 'Mengutamakan halaman yang membantu pengguna dan dapat dirayapi.',
          points: [
            'Tulis untuk kebutuhan nyata, bukan untuk kepadatan kata kunci.',
            'Gunakan judul, tautan, dan struktur halaman yang menjelaskan isi.',
            'Ukur hasil dengan data pencarian dan perbaiki hambatan teknis.'
          ],
          usageLimit: 'Tidak ada teknik pada catatan ini yang menjamin posisi tertentu di hasil pencarian.',
          source: 'google-ranking'
        },
        {
          angle: 'Istilah penting',
          title: 'Siklus hidup domain generik',
          summary: 'Domain generik dapat melewati masa aktif, kedaluwarsa, penebusan, dan penghapusan, dengan rincian yang dipengaruhi kebijakan.',
          focus: 'Memahami mengapa domain kedaluwarsa tidak selalu langsung tersedia.',
          points: [
            'Tanggal kedaluwarsa adalah pemicu proses, bukan selalu tanggal domain bebas didaftarkan.',
            'Masa tenggang atau penebusan dapat menyediakan opsi pemulihan dengan syarat tertentu.',
            'Setelah penghapusan, nama dapat kembali tersedia tanpa jaminan bagi pemilik lama.'
          ],
          usageLimit: 'Diagram ICANN terutama berlaku pada gTLD; ccTLD dapat memiliki aturan siklus berbeda.',
          source: 'icann-lifecycle'
        },
        {
          angle: 'Template praktis',
          title: 'Brief halaman web yang dapat diuji',
          summary: 'Brief efektif menghubungkan kebutuhan pengguna, tujuan bisnis, isi utama, tindakan, dan ukuran keberhasilan halaman.',
          focus: 'Mencegah desain dimulai sebelum fungsi halaman disepakati.',
          points: [
            'Pengguna dan tugas: siapa yang datang serta apa yang ingin diselesaikan.',
            'Isi dan bukti: informasi wajib, sumber, pemilik, dan tanggal peninjauan.',
            'Keberhasilan: tindakan utama, peristiwa analitik, aksesibilitas, dan kinerja.'
          ],
          usageLimit: 'Brief adalah hipotesis kerja; validasi dengan pengguna, data, dan pengujian sebelum dianggap selesai.',
          source: 'google-seo'
        }
      ]
    },
    {
      category: 'Pemasaran & layanan pelanggan',
      entries: [
        {
          angle: 'Panduan langkah',
          title: 'Mulai konten dari kebutuhan pengguna',
          summary: 'Konten yang berguna dimulai dari masalah pengguna, bukti kebutuhan, dan tugas yang ingin mereka selesaikan.',
          focus: 'Mengubah permintaan “buat konten” menjadi tujuan yang dapat diuji.',
          points: [
            'Kumpulkan pertanyaan nyata dari pencarian, layanan pelanggan, dan wawancara.',
            'Tentukan kebutuhan, konteks, serta tindakan yang harus bisa diselesaikan.',
            'Uji apakah halaman menjawab kebutuhan tanpa penjelasan tambahan.'
          ],
          usageLimit: 'Kerangka GOV.UK adalah praktik desain konten, bukan kewajiban hukum untuk situs Indonesia.',
          source: 'gov-user-needs'
        },
        {
          angle: 'Daftar periksa',
          title: 'Informasi minimum sebelum penawaran diterbitkan',
          summary: 'Penawaran perlu menyampaikan identitas, karakteristik, harga, syarat, dan batas layanan secara benar serta mudah ditemukan.',
          focus: 'Mencegah informasi penting tersembunyi di akhir alur pembelian.',
          points: [
            'Nyatakan siapa penjualnya dan bagaimana konsumen dapat menghubungi.',
            'Jelaskan produk, harga total, cara bayar, pengiriman, dan batas layanan.',
            'Tampilkan syarat pembatalan, pengembalian, atau penanganan keluhan yang berlaku.'
          ],
          usageLimit: 'Daftar ini bukan telaah kepatuhan lengkap; sesuaikan dengan produk dan transaksi yang ditawarkan.',
          source: 'uu-consumer'
        },
        {
          angle: 'Perbandingan',
          title: 'Konten membantu dan konten mengejar klik',
          summary: 'Konten membantu menyelesaikan kebutuhan pembaca, sedangkan konten pengejar klik sering menjanjikan lebih dari yang dapat dibuktikan.',
          focus: 'Menilai mutu editorial dari kegunaan, bukti, dan kejelasan.',
          points: [
            'Konten membantu memiliki tujuan, audiens, sumber, dan pembaruan yang jelas.',
            'Judul harus merepresentasikan isi, bukan mengandalkan rasa takut atau kejutan.',
            'Penulis memperlihatkan batas informasi dan tidak menyamarkan iklan.'
          ],
          usageLimit: 'Pedoman Google menjelaskan kualitas pencarian, bukan sertifikasi bahwa suatu artikel benar.',
          source: 'google-helpful'
        },
        {
          angle: 'Risiko',
          title: 'Risiko testimoni tanpa pengungkapan',
          summary: 'Testimoni berbayar, hadiah, afiliasi, atau hubungan material dapat menyesatkan bila hubungannya tidak dijelaskan.',
          focus: 'Membuat hubungan komersial terlihat pada konteks yang sama dengan klaim.',
          points: [
            'Ungkapkan hubungan material dengan bahasa yang mudah dipahami.',
            'Tempatkan pengungkapan dekat dengan rekomendasi, bukan di halaman terpisah.',
            'Pastikan pengalaman dan klaim yang disampaikan dapat dipertanggungjawabkan.'
          ],
          usageLimit: 'Rujukan FTC berlaku di Amerika Serikat; periksa pula hukum dan etika periklanan Indonesia.',
          source: 'ftc-endorsement'
        },
        {
          angle: 'Kesalahan umum',
          title: 'Antarmuka yang mendorong keputusan keliru',
          summary: 'Pilihan yang disamarkan, biaya terlambat, atau pembatalan berbelit dapat memanipulasi keputusan pengguna.',
          focus: 'Mengenali pola desain yang merusak persetujuan dan kepercayaan.',
          points: [
            'Tampilkan biaya dan konsekuensi sebelum pengguna berkomitmen.',
            'Buat tombol setuju dan menolak sama-sama dapat ditemukan.',
            'Jadikan pembatalan atau perubahan pilihan sejelas proses mendaftar.'
          ],
          usageLimit: 'Laporan FTC adalah rujukan pola, bukan penilaian hukum otomatis atas setiap antarmuka.',
          source: 'ftc-dark'
        },
        {
          angle: 'Istilah penting',
          title: 'Keluhan, permintaan, dan sengketa',
          summary: 'Permintaan informasi, keluhan atas layanan, dan sengketa memerlukan jalur, bukti, serta kewenangan penyelesaian yang berbeda.',
          focus: 'Mengklasifikasikan kontak agar ditangani oleh proses yang tepat.',
          points: [
            'Permintaan informasi mencari penjelasan tanpa selalu menyatakan ketidakpuasan.',
            'Keluhan menyampaikan ketidakpuasan dan mengharapkan tanggapan atau perbaikan.',
            'Sengketa melibatkan tuntutan yang mungkin memerlukan mekanisme penyelesaian formal.'
          ],
          usageLimit: 'Definisi internal perlu disejajarkan dengan kontrak, regulator, dan kanal penyelesaian yang berlaku.',
          source: 'iso-complaints'
        },
        {
          angle: 'Template praktis',
          title: 'Format jawaban keluhan yang jelas',
          summary: 'Jawaban keluhan perlu mengakui masalah, merangkum fakta, menyatakan tindakan, dan memberi jalur lanjutan.',
          focus: 'Mengurangi jawaban defensif atau terlalu umum.',
          points: [
            'Pembuka: nomor kasus, masalah yang dipahami, dan permintaan yang diterima.',
            'Isi: fakta terverifikasi, tindakan, pemilik, serta batas waktu yang realistis.',
            'Penutup: hasil, pilihan eskalasi, kanal balasan, dan dokumen yang perlu disimpan.'
          ],
          usageLimit: 'Jangan menjanjikan hasil atau waktu yang belum disetujui oleh pemilik kewenangan.',
          source: 'iso-complaints'
        }
      ]
    },
    {
      category: 'Keamanan, data & tata kelola',
      entries: [
        {
          angle: 'Panduan langkah',
          title: 'Memetakan data pribadi yang diproses',
          summary: 'Pemetaan data mencatat jenis data, tujuan, sumber, penerima, lokasi, retensi, dan kontrol sepanjang siklus hidup.',
          focus: 'Membuat pemrosesan data terlihat sebelum kebijakan ditulis.',
          points: [
            'Inventarisasi data dari formulir, transaksi, analitik, dukungan, dan vendor.',
            'Catat tujuan, dasar pemrosesan, akses, pengungkapan, serta lokasi penyimpanan.',
            'Tentukan retensi, penghapusan, kontrol keamanan, dan pemilik proses.'
          ],
          usageLimit: 'Pemetaan bukan bukti kepatuhan dengan sendirinya; lakukan telaah hukum atas tiap proses.',
          source: 'pdp'
        },
        {
          angle: 'Daftar periksa',
          title: 'Tanda pesan phishing',
          summary: 'Phishing sering memakai urgensi, tautan atau lampiran, penyamaran identitas, dan permintaan data sensitif.',
          focus: 'Memeriksa pesan sebelum mengeklik atau membalas.',
          points: [
            'Periksa alamat pengirim serta domain tujuan tanpa membuka tautan.',
            'Waspadai desakan, ancaman, hadiah, dan perubahan instruksi pembayaran.',
            'Konfirmasi melalui kanal resmi yang dicari secara terpisah dan laporkan pesan.'
          ],
          usageLimit: 'Ketiadaan tanda ini tidak menjamin pesan aman; verifikasi independen tetap diperlukan.',
          source: 'cisa-phishing'
        },
        {
          angle: 'Perbandingan',
          title: 'Kata sandi kuat dan MFA',
          summary: 'Kata sandi melindungi satu faktor pengetahuan, sedangkan MFA menambah faktor verifikasi lain ketika tersedia.',
          focus: 'Memahami bahwa kedua kontrol saling melengkapi.',
          points: [
            'Gunakan kata sandi panjang dan unik untuk setiap layanan.',
            'Pengelola kata sandi membantu membuat serta menyimpan kredensial unik.',
            'Aktifkan MFA, terutama pada email, domain, keuangan, dan akun administrator.'
          ],
          usageLimit: 'MFA mengurangi banyak risiko pembajakan akun tetapi tidak membuat akun kebal terhadap serangan.',
          source: 'cisa-mfa'
        },
        {
          angle: 'Risiko',
          title: 'Risiko menunda pembaruan perangkat lunak',
          summary: 'Pembaruan keamanan menutup kerentanan yang diketahui; penundaan memperpanjang waktu sistem terpapar.',
          focus: 'Membuat pembaruan menjadi proses terkendali, bukan tindakan darurat.',
          points: [
            'Inventarisasi sistem, versi, pemilik, dan ketergantungan penting.',
            'Prioritaskan pembaruan keamanan berdasarkan paparan serta dampak.',
            'Uji, pasang, verifikasi, dan dokumentasikan pengecualian sementara.'
          ],
          usageLimit: 'Pembaruan perlu diuji sesuai risiko operasional; jangan menonaktifkan kontrol keamanan tanpa mitigasi.',
          source: 'cisa-update'
        },
        {
          angle: 'Kesalahan umum',
          title: 'Kesalahan pada alur autentikasi',
          summary: 'Pesan error terlalu rinci, sesi lemah, dan pemulihan akun yang longgar dapat membocorkan atau membuka akses.',
          focus: 'Meninjau keamanan seluruh perjalanan masuk, bukan hanya kolom kata sandi.',
          points: [
            'Hindari respons yang mengungkap apakah akun tertentu terdaftar.',
            'Lindungi sesi, batasi percobaan, dan catat peristiwa autentikasi penting.',
            'Uji reset kata sandi, perubahan email, dan pemulihan akun.'
          ],
          usageLimit: 'OWASP adalah panduan teknis; implementasi perlu threat model dan pengujian keamanan aplikasi.',
          source: 'owasp-auth'
        },
        {
          angle: 'Istilah penting',
          title: 'Pengendali dan prosesor data pribadi',
          summary: 'Pengendali menentukan tujuan serta kendali pemrosesan, sementara prosesor memproses data atas nama pengendali.',
          focus: 'Memetakan peran sebelum tanggung jawab dan kontrak dibagi.',
          points: [
            'Peran ditentukan oleh kegiatan nyata, bukan semata label dalam kontrak.',
            'Satu organisasi dapat memiliki peran berbeda pada proses yang berbeda.',
            'Instruksi, keamanan, bantuan hak subjek, dan insiden perlu diatur dengan jelas.'
          ],
          usageLimit: 'Penentuan peran adalah analisis hukum berbasis fakta dan tidak dapat diputuskan dari nama vendor saja.',
          source: 'pdp'
        },
        {
          angle: 'Template praktis',
          title: 'Register validasi input formulir web',
          summary: 'Register validasi memetakan setiap kolom terhadap tujuan, tipe, panjang, format, aturan sisi server, dan penanganan kesalahan.',
          focus: 'Membuat aturan validasi sisi server dapat diperiksa dan diuji.',
          points: [
            'Kolom data: nama field, tujuan, wajib atau opsional, tipe, panjang, dan format yang diterima.',
            'Kontrol: allowlist bila sesuai, pemeriksaan sintaksis dan semantik, serta respons penolakan yang konsisten.',
            'Pengujian: nilai valid, kosong, batas panjang, format salah, dan karakter tak terduga beserta hasil yang diharapkan.'
          ],
          usageLimit: 'Validasi input tidak menggantikan encoding keluaran, otorisasi, perlindungan CSRF, dan kontrol keamanan lainnya.',
          source: 'owasp-input'
        }
      ]
    },
    {
      category: 'Parfum & kosmetik',
      entries: [
        {
          angle: 'Panduan langkah',
          title: 'Memeriksa kosmetik pada basis data BPOM',
          summary: 'Nomor notifikasi dan nama produk dapat diperiksa pada basis data resmi sebelum produk kosmetik dibeli atau diedarkan.',
          focus: 'Mencocokkan produk fisik dengan data yang tercatat.',
          points: [
            'Baca nama produk, merek, varian, produsen, dan nomor notifikasi pada kemasan.',
            'Cari data melalui layanan Cek Produk BPOM dan cocokkan hasilnya.',
            'Hindari produk bila identitas pada kemasan tidak sesuai dengan hasil resmi.'
          ],
          usageLimit: 'Hasil pencarian harus dibaca bersama kondisi produk; kecocokan data bukan jaminan untuk semua penggunaan.',
          source: 'bpom-check'
        },
        {
          angle: 'Daftar periksa',
          title: 'Informasi penting pada label kosmetik',
          summary: 'Penandaan kosmetik memuat informasi yang membantu identifikasi, penggunaan, penelusuran batch, dan pemeriksaan legalitas.',
          focus: 'Membaca label sebelum menilai klaim pemasaran.',
          points: [
            'Periksa nama, kegunaan, komposisi, cara penggunaan, dan peringatan.',
            'Cari pemilik notifikasi, nomor batch, nomor notifikasi, dan kedaluwarsa.',
            'Pastikan informasi terbaca, tidak tertutup, dan sesuai dengan produk.'
          ],
          usageLimit: 'Persyaratan rinci dapat berubah dan berbeda menurut produk; gunakan peraturan BPOM terbaru.',
          source: 'bpom-label'
        },
        {
          angle: 'Perbandingan',
          title: 'Notifikasi BPOM dan Standar IFRA',
          summary: 'Notifikasi BPOM terkait peredaran kosmetik di Indonesia, sedangkan Standar IFRA membatasi penggunaan bahan pewangi untuk kategori pemakaian.',
          focus: 'Mencegah dua rujukan berbeda diperlakukan sebagai izin yang sama.',
          points: [
            'Notifikasi BPOM diperiksa pada produk kosmetik yang diedarkan di Indonesia.',
            'Standar IFRA membahas penggunaan aman bahan pewangi menurut kategori produk.',
            'Dokumen IFRA tidak menggantikan kewajiban registrasi, label, atau regulasi nasional.'
          ],
          usageLimit: 'Penilaian formula memerlukan kategori penggunaan, konsentrasi, dan versi standar yang tepat.',
          source: 'ifra-standards'
        },
        {
          angle: 'Risiko',
          title: 'Risiko kosmetik dalam public warning',
          summary: 'Daftar public warning membantu mengenali produk yang diumumkan BPOM karena temuan pengawasan tertentu.',
          focus: 'Memeriksa peringatan resmi, bukan mengandalkan unggahan ulang.',
          points: [
            'Cari nama produk dan identitasnya pada daftar resmi BPOM.',
            'Cocokkan bentuk kemasan serta informasi batch bila tersedia.',
            'Ikuti arahan BPOM dan hindari meneruskan klaim yang tidak ada pada pengumuman.'
          ],
          usageLimit: 'Daftar dapat diperbarui; periksa halaman resmi pada saat keputusan pembelian atau penjualan.',
          source: 'bpom-warning'
        },
        {
          angle: 'Kesalahan umum',
          title: 'Klaim kosmetik berubah menjadi klaim obat',
          summary: 'Kosmetik digunakan terutama untuk membersihkan, mewangikan, mengubah penampilan, atau memelihara tubuh dalam kondisi baik.',
          focus: 'Menghindari klaim yang menjanjikan diagnosis, pengobatan, atau penyembuhan penyakit.',
          points: [
            'Bedakan manfaat kosmetik dari klaim terapeutik.',
            'Pastikan teks pemasaran selaras dengan kegunaan dan data notifikasi.',
            'Tahan publikasi klaim kesehatan sampai dasar regulasi dan buktinya diperiksa.'
          ],
          usageLimit: 'Klasifikasi produk ditentukan oleh komposisi, tujuan, klaim, dan aturan; jangan menilai dari nama saja.',
          source: 'bpom-definition'
        },
        {
          angle: 'Istilah penting',
          title: 'Kategori penggunaan dalam Standar IFRA',
          summary: 'Batas bahan pewangi pada Standar IFRA bergantung pada kategori produk dan pola paparan, bukan satu angka untuk semua produk.',
          focus: 'Membaca sertifikat atau perhitungan IFRA dalam konteks pemakaian.',
          points: [
            'Tentukan jenis produk akhir dan kategori penggunaan yang sesuai.',
            'Gunakan versi standar serta amendment yang dinyatakan dokumen.',
            'Hitung konsentrasi bahan pada produk akhir, bukan hanya pada konsentrat.'
          ],
          usageLimit: 'Interpretasi teknis formula perlu dilakukan oleh pihak kompeten dengan dokumen pemasok yang lengkap.',
          source: 'ifra-library'
        },
        {
          angle: 'Template praktis',
          title: 'Brief preferensi aroma yang netral',
          summary: 'Brief aroma yang baik mencatat konteks, karakter, intensitas, contoh, batas, dan respons pemakai tanpa menjanjikan hasil medis.',
          focus: 'Menerjemahkan selera menjadi kriteria eksplorasi yang dapat dibandingkan.',
          points: [
            'Konteks: tujuan, waktu, cuaca, ruang, dan durasi pemakaian.',
            'Karakter: keluarga aroma, bahan yang disukai, intensitas, dan contoh pembanding.',
            'Batas: bahan yang dihindari, sensitivitas yang diketahui, anggaran, dan format produk.'
          ],
          usageLimit: 'Brief preferensi bukan uji alergi atau rekomendasi medis; hentikan penggunaan bila muncul reaksi.',
          source: 'ifra-faq'
        }
      ]
    },
    {
      category: 'Produk digital & transaksi',
      entries: [
        {
          angle: 'Panduan langkah',
          title: 'Menyusun informasi transaksi digital',
          summary: 'Perdagangan melalui sistem elektronik perlu menjelaskan pelaku, barang atau jasa, harga, syarat, pembayaran, dan penyelesaian masalah.',
          focus: 'Membuat informasi tersedia sebelum konsumen menyetujui transaksi.',
          points: [
            'Tampilkan identitas penjual dan karakteristik produk digital secara jelas.',
            'Jelaskan harga total, metode bayar, waktu pemrosesan, serta batas penggunaan.',
            'Sediakan bukti transaksi, kanal pengaduan, dan ketentuan pembatalan yang berlaku.'
          ],
          usageLimit: 'Persyaratan tepat bergantung pada model PMSE, produk, dan peran pelaku usaha.',
          source: 'pmse'
        },
        {
          angle: 'Daftar periksa',
          title: 'Konfirmasi sebelum membayar QRIS',
          summary: 'Pengguna perlu memeriksa identitas merchant dan rincian transaksi yang tampil sebelum mengotorisasi pembayaran.',
          focus: 'Mencegah pembayaran ke penerima atau nominal yang keliru.',
          points: [
            'Pindai QR melalui aplikasi pembayaran yang sah.',
            'Cocokkan nama merchant, nominal, dan tujuan transaksi pada layar konfirmasi.',
            'Simpan bukti dan hubungi penyedia jasa bila hasil transaksi bermasalah.'
          ],
          usageLimit: 'Jangan melanjutkan transaksi bila informasi pada layar tidak sesuai dengan merchant atau tujuan pembayaran.',
          source: 'bi-qris-safe'
        },
        {
          angle: 'Perbandingan',
          title: 'Produk fisik dan produk digital',
          summary: 'Produk digital dapat dikirim seketika, dibatasi lisensi atau akun, dan memiliki kondisi pengembalian yang berbeda dari barang fisik.',
          focus: 'Menjelaskan sifat penyerahan serta batas penggunaan sebelum pembelian.',
          points: [
            'Nyatakan apakah konsumen membeli kepemilikan, akses, kredit, atau lisensi.',
            'Jelaskan perangkat, wilayah, akun, masa berlaku, dan prasyarat teknis.',
            'Bedakan kebijakan gagal kirim, salah tujuan, dan perubahan pikiran.'
          ],
          usageLimit: 'Hak konsumen dan syarat pengembalian tidak boleh disimpulkan hanya dari label “produk digital”.',
          source: 'uu-consumer'
        },
        {
          angle: 'Risiko',
          title: 'Risiko top up ke akun yang salah',
          summary: 'Kode pengguna, server, wilayah, dan nominal dapat menentukan tujuan akhir transaksi top up.',
          focus: 'Menghentikan transaksi ketika identitas tujuan belum terkonfirmasi.',
          points: [
            'Minta pengguna menyalin ID dan server dari aplikasi resmi.',
            'Tampilkan ulang tujuan serta nominal sebelum pembayaran dikunci.',
            'Simpan jejak konfirmasi, status pemasok, dan bukti pemenuhan.'
          ],
          usageLimit: 'Kemungkinan koreksi bergantung pada penyedia; jangan menjanjikan pengembalian sebelum status diperiksa.',
          source: 'pmse'
        },
        {
          angle: 'Kesalahan umum',
          title: 'Mengandalkan tangkapan layar pembayaran',
          summary: 'Gambar bukti dapat diedit atau tidak menunjukkan penyelesaian akhir, sehingga status harus diperiksa pada sistem penerima.',
          focus: 'Memisahkan bukti yang dikirim pelanggan dari konfirmasi dana.',
          points: [
            'Periksa transaksi pada dashboard atau mutasi resmi milik penerima.',
            'Cocokkan jumlah, waktu, referensi, dan identitas lawan transaksi.',
            'Jangan meminta OTP, PIN, kata sandi, atau kode pemulihan untuk verifikasi.'
          ],
          usageLimit: 'Prosedur verifikasi harus mengikuti penyedia pembayaran dan tidak boleh mengumpulkan kredensial rahasia.',
          source: 'bca-transfer-proof'
        },
        {
          angle: 'Istilah penting',
          title: 'Pengaduan ke penyedia dan Bank Indonesia',
          summary: 'Masalah transaksi umumnya diajukan lebih dulu kepada penyelenggara; eskalasi memerlukan identitas, kronologi, dan bukti yang relevan.',
          focus: 'Menyiapkan berkas pengaduan yang dapat diproses.',
          points: [
            'Simpan nomor transaksi, waktu, nilai, kanal, dan tanggapan penyelenggara.',
            'Susun kronologi singkat serta hasil yang diminta.',
            'Lampirkan identitas dan dokumen sesuai klasifikasi pengaduan pada kanal resmi.'
          ],
          usageLimit: 'Bank Indonesia hanya menangani pengaduan dalam ruang lingkup kewenangannya dan dengan persyaratan yang berlaku.',
          source: 'bi-complaint'
        },
        {
          angle: 'Template praktis',
          title: 'Kronologi laporan penipuan transaksi',
          summary: 'Kronologi terstruktur membantu bank, platform, dan kanal pelaporan menelusuri aliran kejadian serta bukti.',
          focus: 'Menyajikan fakta tanpa menambah dugaan yang belum terverifikasi.',
          points: [
            'Identitas kasus: tanggal, waktu, nilai, rekening atau akun tujuan, dan nomor referensi.',
            'Urutan kejadian: kanal kontak, instruksi, tindakan, serta waktu sadar terjadi masalah.',
            'Bukti dan tindakan: percakapan, transaksi, laporan ke penyedia, serta nomor tiket.'
          ],
          usageLimit: 'Laporan cepat penting, tetapi pemulihan dana tidak dijamin; gunakan hanya kanal resmi OJK, bank, dan penegak hukum.',
          source: 'ojk-iasc'
        }
      ]
    }
  ];

  function validHttpsUrl(value) {
    try {
      const parsed = new URL(value);
      return parsed.protocol === 'https:' ? parsed.href : '';
    } catch (error) {
      return '';
    }
  }

  function normalise(value) {
    return String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase('id-ID');
  }

  const DATA = Object.freeze(
    LIBRARY.flatMap((group) => group.entries.map((entry) => ({
      category: group.category,
      ...entry
    }))).map((entry, index) => {
      const source = SOURCES[entry.source];
      return Object.freeze({
        id: 'K' + String(index + 1).padStart(4, '0'),
        category: entry.category,
        angle: entry.angle,
        title: entry.title,
        summary: entry.summary,
        focus: entry.focus,
        points: Object.freeze(entry.points.slice()),
        usageLimit: entry.usageLimit,
        note: 'Ringkasan edukatif; peraturan, layanan, dan antarmuka dapat berubah setelah tanggal peninjauan. Rujukan non-Indonesia merupakan panduan atau standar penerbit, bukan hukum Indonesia.',
        sourceName: source ? source.name : '',
        sourceUrl: source ? validHttpsUrl(source.url) : '',
        reviewedAt: REVIEWED_AT,
        keywords: normalise([
          entry.category,
          entry.angle,
          entry.title,
          entry.summary,
          entry.focus,
          entry.points.join(' '),
          source ? source.name : ''
        ].join(' '))
      });
    })
  );

  function assertLibrary() {
    const unique = (values) => new Set(values).size === values.length;
    const errors = [];
    const categories = new Set(DATA.map((item) => item.category));
    const angles = new Set(DATA.map((item) => item.angle));

    if (DATA.length < 48 || DATA.length > 72) errors.push('jumlah entri harus 48–72');
    if (categories.size !== 8) errors.push('kategori harus tepat 8');
    if (ANGLES.some((angle) => !angles.has(angle)) || angles.size !== ANGLES.length) {
      errors.push('cakupan sudut pandang harus tepat 7');
    }
    ['id', 'title', 'summary', 'focus', 'usageLimit'].forEach((field) => {
      if (!unique(DATA.map((item) => item[field]))) errors.push('duplikasi pada ' + field);
    });
    if (!unique(DATA.map((item) => item.points.join('\n')))) {
      errors.push('duplikasi rangkaian poin');
    }
    DATA.forEach((item) => {
      if (!item.sourceName || !validHttpsUrl(item.sourceUrl)) {
        errors.push(item.id + ' tidak memiliki sumber HTTPS yang valid');
      }
      if (item.reviewedAt !== REVIEWED_AT) {
        errors.push(item.id + ' memiliki tanggal tinjau yang salah');
      }
      if (!ANGLES.includes(item.angle) || item.points.length !== 3) {
        errors.push(item.id + ' memiliki struktur isi yang salah');
      }
    });
    if (errors.length) throw new Error('Pustaka pengetahuan tidak valid: ' + errors.join('; '));
  }

  assertLibrary();
  globalThis.DigdayaKnowledgeData = DATA;

  const grid = document.getElementById('knowledge-grid');
  if (!grid) return;

  const search = document.getElementById('knowledge-search');
  const category = document.getElementById('knowledge-category');
  const angle = document.getElementById('knowledge-angle');
  const count = document.getElementById('knowledge-result-count');
  const more = document.getElementById('knowledge-more');
  const reset = document.getElementById('knowledge-reset');
  const dialog = document.getElementById('knowledge-dialog');
  const dialogTitle = document.getElementById('knowledge-dialog-title');
  const dialogMeta = document.getElementById('knowledge-dialog-meta');
  const dialogSummary = document.getElementById('knowledge-dialog-summary');
  const dialogFocus = document.getElementById('knowledge-dialog-focus');
  const dialogPoints = document.getElementById('knowledge-dialog-points');
  const dialogNote = document.getElementById('knowledge-dialog-note');
  const dialogSource = document.getElementById('knowledge-dialog-source');
  const copyButton = document.getElementById('knowledge-copy');
  const dataById = new Map(DATA.map((item) => [item.id, item]));
  const collator = new Intl.Collator('id-ID', { sensitivity: 'base' });
  const numberFormatter = new Intl.NumberFormat('id-ID');
  const dateFormatter = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'
  });
  let shown = PAGE_SIZE;
  let filtered = DATA.slice();
  let active = null;

  function formatReviewDate(value) {
    return dateFormatter.format(new Date(value + 'T00:00:00Z'));
  }

  function setPageCopy() {
    const section = document.getElementById('knowledge-library');
    if (section) {
      const eyebrow = section.querySelector('.section-head .eyebrow');
      const heading = document.getElementById('knowledge-library-title');
      const description = section.querySelector('.section-head > p');
      if (eyebrow) eyebrow.textContent = 'Pustaka ditinjau 5 September 2026';
      if (heading) heading.textContent = 'Lima puluh enam panduan berbasis rujukan dalam satu pusat pengetahuan.';
      if (description) {
        description.textContent = 'Setiap topik memiliki fokus, langkah yang dapat diperiksa, batas penggunaan, rujukan penerbit, dan tanggal peninjauan.';
      }
    }

    const stats = Array.from(document.querySelectorAll('.knowledge-stats > div'));
    const values = [
      [String(DATA.length), 'panduan ditinjau'],
      [String(new Set(DATA.map((item) => item.category)).size), 'kategori'],
      [String(new Set(DATA.map((item) => item.angle)).size), 'jenis panduan'],
      [String(new Set(DATA.map((item) => item.sourceUrl)).size), 'rujukan penerbit']
    ];
    stats.slice(0, values.length).forEach((box, index) => {
      const strong = box.querySelector('strong');
      const label = box.querySelector('span');
      if (strong) strong.textContent = values[index][0];
      if (label) label.textContent = values[index][1];
    });

    const seo = document.getElementById('seo-structured-data');
    if (seo) {
      try {
        const graph = JSON.parse(seo.textContent);
        const page = graph && graph['@graph'] && graph['@graph'][0];
        if (page) {
          page.description = 'Pusat pengetahuan berisi 56 panduan faktual dalam 8 kategori, dilengkapi rujukan penerbit dan tanggal peninjauan.';
          seo.textContent = JSON.stringify(graph);
        }
      } catch (error) {
        console.warn('Metadata pustaka tidak dapat diperbarui.', error);
      }
    }
  }

  function populateSelect(select, values) {
    if (!select) return;
    Array.from(select.options).slice(1).forEach((option) => option.remove());
    values.slice().sort(collator.compare).forEach((value) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function makePill(value, extraClass) {
    const pill = document.createElement('span');
    pill.className = 'knowledge-pill' + (extraClass ? ' ' + extraClass : '');
    pill.textContent = value;
    return pill;
  }

  function makeCard(item) {
    const card = document.createElement('article');
    card.className = 'knowledge-card';

    const meta = document.createElement('div');
    meta.className = 'knowledge-card-meta';
    meta.append(makePill(item.category), makePill(item.angle, 'angle'));

    const heading = document.createElement('h3');
    heading.textContent = item.title;

    const summary = document.createElement('p');
    summary.textContent = item.summary;

    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.kid = item.id;
    button.setAttribute('aria-label', 'Buka topik: ' + item.title);
    button.textContent = 'Buka topik';

    card.append(meta, heading, summary, button);
    return card;
  }

  function makeEmptyState() {
    const empty = document.createElement('div');
    empty.className = 'knowledge-empty';
    const heading = document.createElement('strong');
    heading.textContent = 'Tidak ada topik yang cocok.';
    const detail = document.createElement('span');
    detail.textContent = ' Ubah kata pencarian atau reset filter untuk menampilkan pustaka kembali.';
    empty.append(heading, document.createElement('br'), detail);
    return empty;
  }

  function render() {
    if (count) count.textContent = numberFormatter.format(filtered.length);
    const fragment = document.createDocumentFragment();
    const visible = filtered.slice(0, shown);
    if (visible.length) visible.forEach((item) => fragment.appendChild(makeCard(item)));
    else fragment.appendChild(makeEmptyState());
    grid.replaceChildren(fragment);

    if (more) {
      const remaining = Math.max(0, filtered.length - shown);
      more.hidden = remaining === 0;
      const wrapper = more.closest('.knowledge-more-wrap');
      if (wrapper) wrapper.hidden = remaining === 0;
      if (remaining) more.textContent = 'Muat ' + Math.min(PAGE_SIZE, remaining) + ' topik lagi';
    }
  }

  function applyFilters() {
    const query = normalise(search ? search.value.trim() : '');
    const selectedCategory = category ? category.value : '';
    const selectedAngle = angle ? angle.value : '';
    filtered = DATA.filter((item) => (
      (!selectedCategory || item.category === selectedCategory) &&
      (!selectedAngle || item.angle === selectedAngle) &&
      (!query || item.keywords.includes(query))
    ));
    shown = PAGE_SIZE;
    render();
  }

  function hashId() {
    let raw = '';
    try {
      raw = decodeURIComponent(globalThis.location.hash.slice(1));
    } catch (error) {
      return '';
    }
    if (!raw.startsWith('knowledge-')) return '';
    const id = raw.slice('knowledge-'.length);
    return dataById.has(id) ? id : '';
  }

  function syncHash(id) {
    const next = globalThis.location.pathname + globalThis.location.search + '#knowledge-' + id;
    if (globalThis.location.hash !== '#knowledge-' + id) {
      globalThis.history.replaceState(null, '', next);
    }
  }

  function clearHash() {
    if (!globalThis.location.hash.startsWith('#knowledge-')) return;
    globalThis.history.replaceState(
      null,
      '',
      globalThis.location.pathname + globalThis.location.search
    );
  }

  function closeDialog() {
    if (!dialog) return;
    if (typeof dialog.close === 'function' && dialog.open) dialog.close();
    else {
      dialog.removeAttribute('open');
      clearHash();
    }
  }

  function openItem(id, updateHash = true) {
    const item = dataById.get(id);
    if (!item || !dialog) return;
    active = item;

    if (dialogTitle) dialogTitle.textContent = item.title;
    if (dialogMeta) {
      dialogMeta.textContent = item.id + ' · ' + item.category + ' · ' + item.angle +
        ' · Ditinjau ' + formatReviewDate(item.reviewedAt);
    }
    if (dialogSummary) dialogSummary.textContent = item.summary;
    if (dialogFocus) dialogFocus.textContent = item.focus;
    if (dialogPoints) {
      const pointNodes = item.points.map((point) => {
        const listItem = document.createElement('li');
        listItem.textContent = point;
        return listItem;
      });
      dialogPoints.replaceChildren(...pointNodes);
    }
    if (dialogNote) {
      dialogNote.textContent = item.note + ' Batas penggunaan: ' + item.usageLimit +
        ' Sumber diperiksa: ' + item.sourceName + ', ' + formatReviewDate(item.reviewedAt) + '.';
    }
    if (dialogSource) {
      const safeUrl = validHttpsUrl(item.sourceUrl);
      dialogSource.hidden = !safeUrl;
      if (safeUrl) {
        dialogSource.href = safeUrl;
        dialogSource.target = '_blank';
        dialogSource.rel = 'noopener noreferrer external';
        dialogSource.textContent = 'Buka rujukan penerbit: ' + item.sourceName + ' ↗';
      } else {
        dialogSource.removeAttribute('href');
        dialogSource.textContent = 'Sumber tidak tersedia';
      }
    }

    if (typeof dialog.showModal === 'function') {
      if (!dialog.open) dialog.showModal();
    } else {
      dialog.setAttribute('open', '');
    }
    if (updateHash) syncHash(item.id);
  }

  function copyActiveItem() {
    if (!active || !copyButton) return;
    const text = [
      active.title,
      '',
      active.summary,
      '',
      'Fokus: ' + active.focus,
      '',
      '- ' + active.points.join('\n- '),
      '',
      'Batas penggunaan: ' + active.usageLimit,
      'Sumber: ' + active.sourceName,
      active.sourceUrl,
      'Ditinjau: ' + active.reviewedAt
    ].join('\n');

    if (!navigator.clipboard || typeof navigator.clipboard.writeText !== 'function') {
      copyButton.textContent = 'Salin manual';
      return;
    }
    navigator.clipboard.writeText(text).then(() => {
      copyButton.textContent = 'Tersalin';
      globalThis.setTimeout(() => {
        copyButton.textContent = 'Salin ringkasan';
      }, 1400);
    }).catch(() => {
      copyButton.textContent = 'Salin manual';
    });
  }

  setPageCopy();
  populateSelect(category, Array.from(new Set(DATA.map((item) => item.category))));
  populateSelect(angle, Array.from(new Set(DATA.map((item) => item.angle))));

  grid.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target.closest('[data-kid]') : null;
    if (target) openItem(target.dataset.kid);
  });
  if (search) search.addEventListener('input', applyFilters);
  if (category) category.addEventListener('change', applyFilters);
  if (angle) angle.addEventListener('change', applyFilters);
  if (more) {
    more.addEventListener('click', () => {
      const previousVisible = Math.min(filtered.length, shown);
      shown = Math.min(filtered.length, shown + PAGE_SIZE);
      render();
      if (more.hidden) {
        const firstNewButton = grid.querySelectorAll('[data-kid]')[previousVisible];
        if (firstNewButton instanceof HTMLElement) {
          try {
            firstNewButton.focus({ preventScroll: true });
          } catch (error) {
            firstNewButton.focus();
          }
        }
      }
    });
  }
  if (reset) {
    reset.addEventListener('click', () => {
      if (search) search.value = '';
      if (category) category.value = '';
      if (angle) angle.value = '';
      applyFilters();
      if (search) search.focus();
    });
  }
  if (dialog) {
    const closeButton = dialog.querySelector('[data-knowledge-close]');
    if (closeButton) closeButton.addEventListener('click', closeDialog);
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) closeDialog();
    });
    dialog.addEventListener('close', clearHash);
  }
  if (copyButton) copyButton.addEventListener('click', copyActiveItem);
  globalThis.addEventListener('hashchange', () => {
    const id = hashId();
    if (id) openItem(id, false);
    else closeDialog();
  });

  render();
  const initialId = hashId();
  if (initialId) globalThis.queueMicrotask(() => openItem(initialId, false));
})();
