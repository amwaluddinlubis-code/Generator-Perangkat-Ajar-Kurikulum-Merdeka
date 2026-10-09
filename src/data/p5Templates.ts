import { Jenjang } from '../types';

export interface P5ThematicTemplate {
  id: string;
  tema: string;
  judul: string;
  subjudul?: string;
  deskripsi: string;
  isuKontekstual: string;
  jenjang: Jenjang[];
  fase: string[];
  dimensiUtama: string[];
  elemenKunci: string[];
  bentukAksi: string;
  alokasiJP: string;
  sistemWaktu: string;
  mitraProjek: string;
  ringkasanAktivitas: {
    pengenalan: string;
    kontekstualisasi: string;
    aksi: string;
    refleksi: string;
  };
}

export const P5_THEMATIC_TEMPLATES: P5ThematicTemplate[] = [
  // 1. Gaya Hidup Berkelanjutan
  {
    id: 'p5-ghb-sampah-organik',
    tema: 'Gaya Hidup Berkelanjutan',
    judul: 'Jejak Hijau Sekolahku: Mengubah Sampah Organik Menjadi Kompos Emas',
    subjudul: 'Eksplorasi pengolahan limbah organik kantin dan daun gugur di lingkungan sekolah',
    deskripsi: 'Peserta didik menyelidiki volume sampah sisa makanan dan daun di sekolah, memahami siklus dekomposisi hayati, serta mempraktikkan pembuatan pupuk kompos takakura atau lubang biopori.',
    isuKontekstual: 'Timbulan sampah kantin dan sisa tanaman di sekolah yang belum terpilah serta menyebabkan bau dan pencemaran tanah.',
    jenjang: ['SD', 'SMP'],
    fase: ['Fase B', 'Fase C', 'Fase D'],
    dimensiUtama: ['Keimanan dan Ketakwaan kepada Tuhan YME', 'Penalaran Kritis', 'Kolaborasi'],
    elemenKunci: ['Akhlak terhadap Alam', 'Memperoleh dan Memproses Informasi', 'Kerja Sama'],
    bentukAksi: 'Panen Kompos Ramah Lingkungan & Pameran Taman Edukasi Tanaman Sekolah',
    alokasiJP: '36 JP',
    sistemWaktu: 'Sistem Terjadwal (1 Hari per Minggu selama 6 Pekan)',
    mitraProjek: 'Petugas Kebersihan Sekolah, Pengelola Bank Sampah Lokal, Orang Tua',
    ringkasanAktivitas: {
      pengenalan: 'Observasi timbunan sampah sekolah, bedah video dampak limbah tak terkelola, wawancara penjual kantin.',
      kontekstualisasi: 'Audit sampah harian per kelas, pemilahan organik vs anorganik, uji coba komposter skala kecil.',
      aksi: 'Pembuatan instalasi biopori/komposter komunal, monitoring kelembapan kompos, pemanenan pupuk.',
      refleksi: 'Gelar karya taman hijau, evaluasi penurunan sampah kantin, deklarasi nol sampah organik.'
    }
  },
  {
    id: 'p5-ghb-ecobrick-plastik',
    tema: 'Gaya Hidup Berkelanjutan',
    judul: 'Aksi Plastik Bijak: Menata Ulang Sampah Menjadi Furnitur Ecobrick',
    subjudul: 'Solusi kreatif mereduksi plastik sekali pakai menjadi modular meja dan kursi kelas',
    deskripsi: 'Projek investigatif pemilahan plastik pembungkus makanan untuk dipadatkan menjadi botol ecobrick bernilai fungsional.',
    isuKontekstual: 'Tingginya konsumsi plastik sachet makanan ringan di kantin yang membutuhkan ratusan tahun untuk terurai.',
    jenjang: ['SMP', 'SMA', 'SMK'],
    fase: ['Fase D', 'Fase E', 'Fase F'],
    dimensiUtama: ['Kreativitas', 'Penalaran Kritis', 'Kemandirian'],
    elemenKunci: ['Menghasilkan Karya Orisinal', 'Refleksi Pemikiran', 'Regulasi Diri'],
    bentukAksi: 'Gelar Karya Furnitur Modular Ecobrick & Kampanye Sekolah Bebas Plastik',
    alokasiJP: '48 JP',
    sistemWaktu: 'Sistem Blok (2 Minggu Penuh Akhir Semester)',
    mitraProjek: 'Komunitas Peduli Lingkungan Hidup, Pengelola Daur Ulang Plastik',
    ringkasanAktivitas: {
      pengenalan: 'Eksplorasi jejak mikroplastik, pemutaran dokumenter lingkungan, studi audit sampah rumah.',
      kontekstualisasi: 'Penimbangan sampah plastik per murid, standardisasi berat botol ecobrick, desain perakitan.',
      aksi: 'Workshop pemadatan ecobrick, perakitan meja dan kursi santai perpustakaan/taman sekolah.',
      refleksi: 'Uji kekuatan beban furnitur, pameran gelar karya, peluncuran kantin tumbler sekolah.'
    }
  },

  // 2. Kearifan Lokal
  {
    id: 'p5-kl-kuliner-tradisional',
    tema: 'Kearifan Lokal',
    judul: 'Dapur Nusantara: Merawat Cita Rasa dan Khasiat Pangan Tradisional',
    subjudul: 'Eksplorasi resep masakan dan jamu herbal leluhur di tengah serbuan makanan cepat saji',
    deskripsi: 'Murid menelusuri sejarah, bahan rempah lokal, nilai filosofi, dan gizi makanan khas daerah tempat tinggalnya.',
    isuKontekstual: 'Anak-anak generasi muda semakin asing dengan jajanan dan makanan tradisional lokal karena serbuan junk food modern.',
    jenjang: ['SD', 'SMP'],
    fase: ['Fase C', 'Fase D'],
    dimensiUtama: ['Kewargaan', 'Kreativitas', 'Kolaborasi'],
    elemenKunci: ['Mengenal dan Menghargai Budaya', 'Menghasilkan Karya Inovatif', 'Berbagi'],
    bentukAksi: 'Festival Kuliner Tradisional Nusantara & Buku Resep Bergambar Buatan Siswa',
    alokasiJP: '36 JP',
    sistemWaktu: 'Sistem Terjadwal (6 JP per Pekan)',
    mitraProjek: 'Ibu Kantin, Pedagang Pasar Tradisional, Tokoh Sepuh/Nenek Murid',
    ringkasanAktivitas: {
      pengenalan: 'Mencicipi aneka jajanan pasar, mendata rempah nusantara dan khasiat kesehatannya.',
      kontekstualisasi: 'Wawancara pembuat pangan lokal, dokumentasi resep keluarga, uji coba dapur kelas.',
      aksi: 'Praktik memasak kudapan tradisional secara higienis, pengemasan dengan daun pisang ramah lingkungan.',
      refleksi: 'Gelar pasar kuliner sekolah, penyusunan buklet resep digital, evaluasi apresiasi budaya.'
    }
  },
  {
    id: 'p5-kl-seni-batik-motif',
    tema: 'Kearifan Lokal',
    judul: 'Goresan Canting Generasi Baru: Eksplorasi Motif dan Filosofi Wastra Nusantara',
    subjudul: 'Mengenal makna ragam hias daerah serta berkreasi membuat kain batik jumputan/ecoprint',
    deskripsi: 'Projek apresiasi seni tradisi tekstil lokal, membedah makna motif etnis, dan praktik membatik dengan pewarna alami daun sekitar.',
    isuKontekstual: 'Pudarnya regenerasi pengrajin wastra lokal dan kurangnya pemahaman generasi muda terhadap filosofi kain tradisional.',
    jenjang: ['SMP', 'SMA', 'SMK'],
    fase: ['Fase D', 'Fase E', 'Fase F'],
    dimensiUtama: ['Kewargaan', 'Kreativitas', 'Penalaran Kritis'],
    elemenKunci: ['Pelestarian Warisan Budaya', 'Eksplorasi Gagasan', 'Menalar Historis'],
    bentukAksi: 'Peragaan Busana (Fashion Show) Wastra Ecoprint & Katalog Digital Filosofi Motif',
    alokasiJP: '48 JP',
    sistemWaktu: 'Sistem Terjadwal Berkala (1 Hari per Minggu)',
    mitraProjek: 'Pengrajin Batik/Tenun Lokal, Sanggar Seni Daerah, Dinas Kebudayaan',
    ringkasanAktivitas: {
      pengenalan: 'Kunjungan virtual/langsung ke museum tekstil, telaah filosofi motif batik lokal.',
      kontekstualisasi: 'Eksplorasi tanaman pewarna alami di sekolah, pembuatan sketsa motif kontemporer.',
      aksi: 'Pencelupan kain jumputan atau teknik pounding ecoprint, penjahitan produk syal/tote bag.',
      refleksi: 'Pameran karya seni wastra di aula sekolah, lelang amal hasil karya siswa.'
    }
  },

  // 3. Bhinneka Tunggal Ika
  {
    id: 'p5-bti-toleransi-harmoni',
    tema: 'Bhinneka Tunggal Ika',
    judul: 'Rumah Damai Nusantara: Merajut Harmoni dalam Keberagaman Budaya dan Keyakinan',
    subjudul: 'Membangun jembatan empati dan dialog antarteman berbeda latar belakang',
    deskripsi: 'Peserta didik mengeksplorasi keragaman suku, bahasa, adat, dan agama di lingkungan pergaulan mereka untuk menumbuhkan sikap inklusif dan anti-diskriminasi.',
    isuKontekstual: 'Munculnya prasangka stereotip antarsuku/agama di media sosial dan potensi perundungan verbal di sekolah.',
    jenjang: ['SD', 'SMP', 'SMA'],
    fase: ['Fase C', 'Fase D', 'Fase E'],
    dimensiUtama: ['Kewargaan', 'Komunikasi', 'Kolaborasi'],
    elemenKunci: ['Komunikasi dan Interaksi Antarbudaya', 'Keadilan Sosial', 'Saling Menghargai'],
    bentukAksi: 'Pentas Seni Kolaborasi Budaya & Podcast Remaja Bersuara Harmoni',
    alokasiJP: '36 JP',
    sistemWaktu: 'Sistem Harian Terintegrasi (2 JP tiap akhir hari)',
    mitraProjek: 'Forum Kerukunan Umat Beragama (FKUB), Komite Sekolah, Komunitas Sahabat Anak',
    ringkasanAktivitas: {
      pengenalan: 'Pemetaan keragaman latar belakang kelas, bedah studi kasus prasangka di media sosial.',
      kontekstualisasi: 'Dialog santai lintas budaya, studi perayaan adat nusantara, penulisan cerita empati.',
      aksi: 'Pembuatan film pendek/video podcast tentang persahabatan tanpa sekat suku-agama.',
      refleksi: 'Pemutaran film bersama orang tua murid, deklarasi ikrar sekolah inklusif damai.'
    }
  },

  // 4. Bangunlah Jiwa dan Raganya
  {
    id: 'p5-bjr-stop-bullying',
    tema: 'Bangunlah Jiwa dan Raganya',
    judul: 'Sahabat Sehati: Sekolah Ramah Tanpa Perundungan (Anti-Bullying Campaign)',
    subjudul: 'Membina kecerdasan emosional, manajemen konflik sehat, dan budaya saling mendukung',
    deskripsi: 'Projek pembiasaan iklim positif di sekolah melalui edukasi batasan personal, empati pada teman, dan strategi menjadi penolong aktif (upstander).',
    isuKontekstual: 'Kasus perundungan maya (cyberbullying) dan pengucilan antarteman sebaya yang berdampak pada kesehatan mental anak.',
    jenjang: ['SD', 'SMP', 'SMA', 'SMK'],
    fase: ['Fase B', 'Fase C', 'Fase D', 'Fase E'],
    dimensiUtama: ['Kesehatan', 'Kemandirian', 'Komunikasi'],
    elemenKunci: ['Kesehatan Mental dan Emosional', 'Regulasi Emosi', 'Komunikasi Asertif'],
    bentukAksi: 'Kampanye Dinding Mural Anti-Bullying, Kotak Curhat Aman, dan Drama Musikal Empati',
    alokasiJP: '36 JP',
    sistemWaktu: 'Sistem Terjadwal (6 Pekan)',
    mitraProjek: 'Guru BK (Bimbingan Konseling), Psikolog Anak Puskesmas, Orang Tua Murid',
    ringkasanAktivitas: {
      pengenalan: 'Mengenali bentuk perundungan fisik, verbal, relasional, dan digital; survei anonim iklim kelas.',
      kontekstualisasi: 'Latihan bermain peran (role play) respon asertif dan teknik pertolongan saksi (upstander).',
      aksi: 'Pembuatan poster edukasi infografis, mural dinding persahabatan, duta sahabat damai per kelas.',
      refleksi: 'Penandatanganan petisi komitmen sekolah aman ramah anak, evaluasi berkala kotak curhat.'
    }
  },
  {
    id: 'p5-bjr-gizi-seimbang',
    tema: 'Bangunlah Jiwa dan Raganya',
    judul: 'Gizi Cerdas, Fisik Tangguh: Pola Hidup Bugar Menuju Generasi Bebas Stunting',
    subjudul: 'Investigasi menu piring isi giziku, bahaya gula berlebih, dan kebiasaan olahraga aktif',
    deskripsi: 'Peserta didik menganalisis asupan gizi harian mereka, membedah kandungan makanan instan, dan merancang menu seimbang lokal yang terjangkau.',
    isuKontekstual: 'Tingginya konsumsi minuman berpemanis buatan dan makanan ultra-proses di kalangan pelajar yang memicu obesitas serta anemia.',
    jenjang: ['SD', 'SMP'],
    fase: ['Fase B', 'Fase C', 'Fase D'],
    dimensiUtama: ['Kesehatan', 'Kemandirian', 'Penalaran Kritis'],
    elemenKunci: ['Merawat Diri Secara Fisik dan Mental', 'Pengambilan Keputusan Sadar', 'Literasi Sains'],
    bentukAksi: 'Gerakan Bekal Sehat Bareng Teman & Modul Resep Infografis Piring Gizi Seimbang',
    alokasiJP: '24 JP',
    sistemWaktu: 'Sistem Terjadwal (4 Pekan)',
    mitraProjek: 'Tenaga Gizi Puskesmas, Dokter Cilik, Pengelola Kantin Sehat',
    ringkasanAktivitas: {
      pengenalan: 'Menghitung indeks massa tubuh (IMT), membaca tabel informasi nilai gizi pada kemasan snack.',
      kontekstualisasi: 'Eksperimen kandungan gula dalam minuman kemasan, menyusun menu ideal "Isi Piringku".',
      aksi: 'Tantangan 14 hari membawa bekal sehat minim gula dan senam kreasi irama nusantara.',
      refleksi: 'Pengukuran kebugaran pasca-program, deklarasi kantin sekolah sehat bebas pemanis buatan.'
    }
  },

  // 5. Suara Demokrasi
  {
    id: 'p5-sd-pemilu-osis',
    tema: 'Suara Demokrasi',
    judul: 'Pesta Demokrasi Pelajar: Musyawarah dan Pemilu OSIS Berintegritas',
    subjudul: 'Simulasi utuh pemilu cerdas, penyusunan visi-misi solutif, dan budaya debat santun',
    deskripsi: 'Projek kewargaan aktif yang memandu murid mengalami tahapan demokrasi: penjaringan kandidat, kampanye gagasan, debat publik, pencoblosan rahasia, hingga penghitungan suara transparan.',
    isuKontekstual: 'Apatisme generasi muda terhadap proses musyawarah atau maraknya politik uang dan hoaks saat pemilihan ketua organisasi.',
    jenjang: ['SMP', 'SMA', 'SMK'],
    fase: ['Fase D', 'Fase E', 'Fase F'],
    dimensiUtama: ['Kewargaan', 'Penalaran Kritis', 'Komunikasi'],
    elemenKunci: ['Partisipasi Publik', 'Menalar Logis dan Menilai Opini', 'Musyawarah Mufakat'],
    bentukAksi: 'Simulasi Pemilu Raya Berbasis Digital / Kotak Suara & Sidang Terbuka Pleno',
    alokasiJP: '48 JP',
    sistemWaktu: 'Sistem Terjadwal Terpadu Menjelang Suksesi OSIS',
    mitraProjek: 'Komisi Pemilihan Umum (KPU) Daerah, Pembina OSIS, Majelis Perwakilan Kelas',
    ringkasanAktivitas: {
      pengenalan: 'Membedah asas Luber Jurdil, membedakan kampanye positif vs ujaran kebencian/hoaks.',
      kontekstualisasi: 'Penyusunan kriteria pemimpin ideal sekolah, uji kelayakan program kerja kandidat.',
      aksi: 'Debat kandidat terbuka, pemungutan suara berintegritas, dan rekapitulasi transparan.',
      refleksi: 'Pelantikan pengurus baru, pidato komitmen, evaluasi partisipasi seluruh warga sekolah.'
    }
  },

  // 6. Rekayasa dan Teknologi
  {
    id: 'p5-rt-filtrasi-air',
    tema: 'Rekayasa dan Teknologi',
    judul: 'Inovasi Air Bersih: Rancang Bangun Alat Filtrasi Sederhana Ramah Lingkungan',
    subjudul: 'Memanfaatkan arang, ijuk, pasir, dan batu kerikil untuk menjernihkan air keruh',
    deskripsi: 'Murid menerapkan prinsip sains fisika dan kimia untuk mendesain prototipe penjernih air limbah wudhu atau air hujan agar bisa dipakai kembali menyiram tanaman.',
    isuKontekstual: 'Kelangkaan air bersih saat musim kemarau dan terbuangnya air bekas wudhu di sekolah tanpa pemanfaatan ulang.',
    jenjang: ['SMP', 'SMA', 'SMK'],
    fase: ['Fase D', 'Fase E'],
    dimensiUtama: ['Kreativitas', 'Penalaran Kritis', 'Kolaborasi'],
    elemenKunci: ['Merancang Prototipe Teknologi', 'Eksperimen Saintifik', 'Kerja Sama'],
    bentukAksi: 'Demonstrasi Prototipe Instalasi Filtrasi Air Sekolah & Panduan DIY Siap Pakai',
    alokasiJP: '48 JP',
    sistemWaktu: 'Sistem Blok 2 Pekan',
    mitraProjek: 'Laboratorium Lingkungan, Ahli Sanitasi, Tukang Ledeng/Perpipaan Sekolah',
    ringkasanAktivitas: {
      pengenalan: 'Uji kualitas air keruh (pH, bau, kekeruhan), studi prinsip penyaringan fisika bertingkat.',
      kontekstualisasi: 'Eksperimen bahan alami (karbon aktif arang batok kelapa, zeolit, sabut kelapa).',
      aksi: 'Perakitan pipa filter bertingkat, uji debit dan kejernihan air hasil filtrasi.',
      refleksi: 'Pemasangan instalasi filtrasi di keran wudhu sekolah, presentasi laporan efisiensi alat.'
    }
  },
  {
    id: 'p5-rt-smart-greenhouse',
    tema: 'Rekayasa dan Teknologi',
    judul: 'Kebun Cerdas Otomatis: Sistem Penyiram Tanaman Berbasis Sensor Sederhana',
    subjudul: 'Memanfaatkan teknologi otomatisasi ramah biaya untuk merawat kebun sekolah',
    deskripsi: 'Peserta didik merakit prototipe penyiram tanaman otomatis memanfaatkan sensor kelembapan tanah sederhana atau mikrokontroler ramah pemula.',
    isuKontekstual: 'Tanaman kebun sekolah sering layu saat libur semester karena tidak ada yang menyiram secara rutin.',
    jenjang: ['SMA', 'SMK'],
    fase: ['Fase E', 'Fase F'],
    dimensiUtama: ['Penalaran Kritis', 'Kreativitas', 'Kemandirian'],
    elemenKunci: ['Solusi Berbasis Teknologi', 'Pemikiran Algoritmik', 'Ketekunan Menuntaskan Masalah'],
    bentukAksi: 'Instalasi Taman Otomatis Cerdas Sekolah & Pameran Sains Terapan',
    alokasiJP: '54 JP',
    sistemWaktu: 'Sistem Blok (Sesi Lab & Kebun)',
    mitraProjek: 'Guru Informatika/Fisika, Komunitas IoT/Robotik Lokal, Petani Hidroponik',
    ringkasanAktivitas: {
      pengenalan: 'Mempelajari kebutuhan air tanaman, pengenalan sensor kelembapan dan saklar otomatis.',
      kontekstualisasi: 'Merancang skema instalasi pipa tetes dan kalibrasi sensor kelembapan tanah.',
      aksi: 'Perakitan prototipe, pengujian otomatisasi penyiraman saat tanah kering di bawah batas.',
      refleksi: 'Pameran gelar karya teknologi, pemeliharaan berkelanjutan oleh kelompok ekstrakurikuler.'
    }
  },

  // 7. Kewirausahaan
  {
    id: 'p5-kwu-bazar-kreasi',
    tema: 'Kewirausahaan',
    judul: 'Pojok Wirausaha Muda: Dari Ide Kreatif Menjadi Produk Bernilai Ekonomi',
    subjudul: 'Menyusun rencana bisnis ramah lingkungan, produksi mandiri, dan festival bazar sekolah',
    deskripsi: 'Projek inkubasi bisnis mini bagi murid untuk melatih mental pantang menyerah, riset pasar, inovasi produk lokal, manajemen modal, dan etika berdagang jujur.',
    isuKontekstual: 'Potensi bahan baku lokal melimpah yang belum dimanfaatkan secara bernilai tambah dan kurangnya literasi finansial praktis siswa.',
    jenjang: ['SD', 'SMP', 'SMA', 'SMK'],
    fase: ['Fase C', 'Fase D', 'Fase E', 'Fase F'],
    dimensiUtama: ['Kemandirian', 'Kreativitas', 'Kolaborasi'],
    elemenKunci: ['Inisiatif dan Bekerja Mandiri', 'Inovasi Produk', 'Kerja Sama Tim'],
    bentukAksi: 'Festival Bazar Kewirausahaan Murid, Laporan Laba-Rugi Transparan, & Gerai Digital',
    alokasiJP: '48 JP',
    sistemWaktu: 'Sistem Terjadwal (8 Pekan)',
    mitraProjek: 'Pelaku Usaha Mikro Kecil (UMKM) Sekitar, Bank Sampah/Koperasi Sekolah, Orang Tua',
    ringkasanAktivitas: {
      pengenalan: 'Wawancara pengusaha sukses lokal, mengenali konsep modal, harga pokok produksi (HPP), dan laba.',
      kontekstualisasi: 'Riset selera pasar di sekolah, penentuan produk olahan/kerajinan orisinal, tes rasa/sampel.',
      aksi: 'Produksi massal higienis, pembuatan kemasan dan promosi medsos, pelaksanaan hari bazar sekolah.',
      refleksi: 'Penghitungan omset dan pembagian hasil, donasi sebagian laba ke kas sosial, evaluasi kepuasan konsumen.'
    }
  },

  // 8. Kebekerjaan (Khusus SMK)
  {
    id: 'p5-kbk-budaya-kerja',
    tema: 'Kebekerjaan (Khusus SMK)',
    judul: 'Membangun Etos Profesional: Penerapan Budaya Industri 5S/5R dan K3 di Sekolah',
    subjudul: 'Internalisasi disiplin kerja, komunikasi profesional, dan kesiapan mental masuk dunia kerja',
    deskripsi: 'Projek penguatan karakter vokasi yang mentransformasi bengkel/lab sekolah menjadi replika lingkungan kerja standar industri internasional (Ringkas, Rapi, Resik, Rawat, Rajin).',
    isuKontekstual: 'Kesenjangan antara kebiasaan santai di sekolah dengan tuntutan kedisiplinan dan keselamatan kerja ketat di industri mitra.',
    jenjang: ['SMK'],
    fase: ['Fase E', 'Fase F'],
    dimensiUtama: ['Kemandirian', 'Kolaborasi', 'Penalaran Kritis'],
    elemenKunci: ['Disiplin Diri & Etika Profesi', 'Komunikasi di Tempat Kerja', 'Kesadaran Keselamatan'],
    bentukAksi: 'Simulasi Sertifikasi Budaya Kerja Industri & Pembuatan SOP Bengkel Standar 5R',
    alokasiJP: '72 JP',
    sistemWaktu: 'Sistem Blok Pelatihan Khusus Kesiapan Vokasi',
    mitraProjek: 'Instruktur Dunia Usaha dan Dunia Industri (DUDI), Asesor Kompetensi BNSP',
    ringkasanAktivitas: {
      pengenalan: 'Kunjungan industri / sharing session dari praktisi HRD tentang soft skills dan bahaya kelalaian K3.',
      kontekstualisasi: 'Audit kepatuhan keselamatan dan kerapian alat di laboratorium/bengkel jurusan.',
      aksi: 'Penerapan apel pagi teratur, visual factory layout, demonstrasi tanggap darurat kecelakaan kerja.',
      refleksi: 'Uji simulasi budaya kerja, sertifikat internal kesiapan magang/PKL bagi murid.'
    }
  }
];

export const SISTEM_WAKTU_P5 = [
  { value: 'Sistem Blok (1-3 Minggu Penuh)', label: 'Sistem Blok — dialokasikan 1-3 minggu penuh khusus projek di akhir/tengah semester' },
  { value: 'Sistem Terjadwal Berkala (1 Hari per Minggu)', label: 'Sistem Terjadwal — dialokasikan 1 hari khusus (cth. tiap Jumat/Sabtu) selama beberapa pekan' },
  { value: 'Sistem Harian Terintegrasi (1-2 JP tiap Hari)', label: 'Sistem Harian — dialokasikan 1-2 jam pelajaran di akhir jam pelajaran setiap hari' }
];

export const BENTUK_AKSI_P5 = [
  'Gelar Karya & Pameran Projek Komunitas Sekolah',
  'Festival & Bazar Kewirausahaan / Kuliner Siswa',
  'Kampanye Sosial, Poster Infografis, & Video Edukasi',
  'Aksi Nyata Lingkungan (Bank Sampah, Kompos, Penghijauan)',
  'Prototipe Produk Teknologi Tepat Guna & Sains Terapan',
  'Pentas Seni Kolaborasi, Teater, & Musik Nusantara',
  'Buku Antologi / Jurnal Dokumentasi Karya Siswa',
  'Simulasi Demokrasi / Sidang Terbuka Musyawarah'
];
