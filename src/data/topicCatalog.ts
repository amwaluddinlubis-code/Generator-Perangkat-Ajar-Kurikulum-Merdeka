import { Jenjang } from '../types';

export interface CurriculumTopicItem {
  id: string;
  jenjang: Jenjang;
  fase: string;
  tingkat: string; // e.g. 'Kelas 1', 'Kelas 4', 'Kelas 7', 'Kelas 10', etc.
  mataPelajaranKey: string; // normalized key for matching
  mataPelajaranName: string;
  topik: string;
  semester: 1 | 2;
  deskripsiTP: string;
  rekomendasiModel: string;
  alokasiWaktuDefault: string;
  kataKunci: string[];
}

export const CURRICULUM_TOPICS: CurriculumTopicItem[] = [
  // =========================================================================
  // SD - FASE A (KELAS 1 & KELAS 2)
  // Standar BSKAP 032/H/KR/2024
  // =========================================================================

  // --- Bahasa Indonesia SD Fase A ---
  {
    id: 'sd-fase-a-indo-k1-s1',
    jenjang: 'SD',
    fase: 'Fase A',
    tingkat: 'Kelas 1',
    mataPelajaranKey: 'bahasa indonesia',
    mataPelajaranName: 'Bahasa Indonesia',
    topik: 'Mengenal Bunyi Huruf Fonem dan Suku Kata Ba-Bi-Bu-Be-Bo melalui Cerita Bergambar',
    semester: 1,
    deskripsiTP: 'Peserta didik mampu melafalkan bunyi huruf vokal dan konsonan serta membaca suku kata dasar dengan lancar dan gembira.',
    rekomendasiModel: 'Discovery Learning',
    alokasiWaktuDefault: '2 JP (2 x 35 Menit) - 1 Pertemuan',
    kataKunci: ['fonem', 'membaca permulaan', 'suku kata', 'huruf vokal', 'literasi dini']
  },
  {
    id: 'sd-fase-a-indo-k1-s2',
    jenjang: 'SD',
    fase: 'Fase A',
    tingkat: 'Kelas 1',
    mataPelajaranKey: 'bahasa indonesia',
    mataPelajaranName: 'Bahasa Indonesia',
    topik: 'Mengenal Tanda Titik, Huruf Kapital Nama Diri, dan Kosakata Tempat di Lingkungan Sekitar',
    semester: 2,
    deskripsiTP: 'Peserta didik memahami fungsi tanda titik dan huruf kapital sederhana pada nama orang serta dapat menceritakan letak benda di sekitar rumah.',
    rekomendasiModel: 'Contextual Teaching and Learning (CTL)',
    alokasiWaktuDefault: '2 JP (2 x 35 Menit) - 1 Pertemuan',
    kataKunci: ['huruf kapital', 'tanda titik', 'menulis permulaan', 'kosakata ruang']
  },
  {
    id: 'sd-fase-a-indo-k2-s1',
    jenjang: 'SD',
    fase: 'Fase A',
    tingkat: 'Kelas 2',
    mataPelajaranKey: 'bahasa indonesia',
    mataPelajaranName: 'Bahasa Indonesia',
    topik: 'Ungkapan Santun Permintaan Maaf, Tolong, Permisi, dan Terima Kasih dalam Interaksi Sehari-hari',
    semester: 1,
    deskripsiTP: 'Peserta didik mampu memperagakan percakapan santun dalam situasi berteman di sekolah dan di rumah.',
    rekomendasiModel: 'Role Playing (Bermain Peran)',
    alokasiWaktuDefault: '2 JP (2 x 35 Menit) - 1 Pertemuan',
    kataKunci: ['santun', 'maaf', 'tolong', 'terima kasih', 'komunikasi interpersonal']
  },
  {
    id: 'sd-fase-a-indo-k2-s2',
    jenjang: 'SD',
    fase: 'Fase A',
    tingkat: 'Kelas 2',
    mataPelajaranKey: 'bahasa indonesia',
    mataPelajaranName: 'Bahasa Indonesia',
    topik: 'Menyimak Dongeng Fabel Hewan Nusantara dan Menyimpulkan Nilai Kebaikan Tokoh',
    semester: 2,
    deskripsiTP: 'Peserta didik dapat mengidentifikasi tokoh, sifat baik, dan pesan moral dalam fabel fiksi sederhana.',
    rekomendasiModel: 'Storytelling & Inquiry',
    alokasiWaktuDefault: '2 JP (2 x 35 Menit) - 1 Pertemuan',
    kataKunci: ['fabel', 'dongeng', 'karakter', 'pesan moral', 'menyimak']
  },

  // --- Matematika SD Fase A ---
  {
    id: 'sd-fase-a-mat-k1-s1',
    jenjang: 'SD',
    fase: 'Fase A',
    tingkat: 'Kelas 1',
    mataPelajaranKey: 'matematika',
    mataPelajaranName: 'Matematika',
    topik: 'Bilangan Cacah 1 sampai 20 dan Konsep Nilai Tempat Satuan serta Puluhan',
    semester: 1,
    deskripsiTP: 'Peserta didik mampu membilang benda konkret hingga 20, mengurutkan bilangan, dan mengurai puluhan-satuan.',
    rekomendasiModel: 'Discovery Learning dengan Alat Peraga Konkret',
    alokasiWaktuDefault: '2 JP (2 x 35 Menit) - 1 Pertemuan',
    kataKunci: ['bilangan cacah', 'nilai tempat', 'satuan', 'puluhan', 'berhitung konkret']
  },
  {
    id: 'sd-fase-a-mat-k1-s2',
    jenjang: 'SD',
    fase: 'Fase A',
    tingkat: 'Kelas 1',
    mataPelajaranKey: 'matematika',
    mataPelajaranName: 'Matematika',
    topik: 'Mengenal Bentuk Bangun Datar Dasar (Segitiga, Segiempat, Lingkaran) di Lingkungan Kelas',
    semester: 2,
    deskripsiTP: 'Peserta didik dapat mengidentifikasi, mengelompokkan, dan menyusun pola bangun datar sederhana.',
    rekomendasiModel: 'Inquiry Learning',
    alokasiWaktuDefault: '2 JP (2 x 35 Menit) - 1 Pertemuan',
    kataKunci: ['geometri dasar', 'segitiga', 'segiempat', 'lingkaran', 'pola bangun']
  },
  {
    id: 'sd-fase-a-mat-k2-s1',
    jenjang: 'SD',
    fase: 'Fase A',
    tingkat: 'Kelas 2',
    mataPelajaranKey: 'matematika',
    mataPelajaranName: 'Matematika',
    topik: 'Operasi Penjumlahan dan Pengurangan Bersusun Bilangan Cacah sampai 100',
    semester: 1,
    deskripsiTP: 'Peserta didik terampil melakukan penjumlahan dan pengurangan dengan teknik menyimpan dan meminjam secara cermat.',
    rekomendasiModel: 'Problem Based Learning (PBL)',
    alokasiWaktuDefault: '2 JP (2 x 35 Menit) - 1 Pertemuan',
    kataKunci: ['penjumlahan bersusun', 'pengurangan', 'menyimpan meminjam', 'bilangan 100']
  },
  {
    id: 'sd-fase-a-mat-k2-s2',
    jenjang: 'SD',
    fase: 'Fase A',
    tingkat: 'Kelas 2',
    mataPelajaranKey: 'matematika',
    mataPelajaranName: 'Matematika',
    topik: 'Pengukuran Panjang dan Berat Benda Menggunakan Satuan Baku (cm, m, gram, kg)',
    semester: 2,
    deskripsiTP: 'Peserta didik mampu mengukur dan membandingkan panjang serta bobot benda memakai penggaris dan timbangan dapur sederhana.',
    rekomendasiModel: 'Project Based Learning (PjBL)',
    alokasiWaktuDefault: '2 JP (2 x 35 Menit) - 1 Pertemuan',
    kataKunci: ['pengukuran', 'centimeter', 'meter', 'kilogram', 'alat ukur baku']
  },

  // --- Pendidikan Pancasila SD Fase A ---
  {
    id: 'sd-fase-a-pkn-k1-s1',
    jenjang: 'SD',
    fase: 'Fase A',
    tingkat: 'Kelas 1',
    mataPelajaranKey: 'pendidikan pancasila',
    mataPelajaranName: 'Pendidikan Pancasila',
    topik: 'Simbol-Simbol Garuda Pancasila dan Pengamalan Sila Pertama dalam Kehidupan Sehari-hari',
    semester: 1,
    deskripsiTP: 'Peserta didik mampu mengenali 5 lambang sila Garuda Pancasila dan mencontohkan sikap taat beribadah serta toleransi.',
    rekomendasiModel: 'Contextual Teaching and Learning (CTL)',
    alokasiWaktuDefault: '2 JP (2 x 35 Menit) - 1 Pertemuan',
    kataKunci: ['garuda pancasila', 'bintang emas', 'rantai', 'pohon beringin', 'sila pertama']
  },
  {
    id: 'sd-fase-a-pkn-k2-s1',
    jenjang: 'SD',
    fase: 'Fase A',
    tingkat: 'Kelas 2',
    mataPelajaranKey: 'pendidikan pancasila',
    mataPelajaranName: 'Pendidikan Pancasila',
    topik: 'Hak dan Kewajiban Anak di Lingkungan Rumah serta Tata Tertib Sekolah',
    semester: 1,
    deskripsiTP: 'Peserta didik dapat membedakan mana hak yang diterima dan kewajiban yang wajib dilaksanakan dengan penuh tanggung jawab.',
    rekomendasiModel: 'Problem Based Learning (PBL)',
    alokasiWaktuDefault: '2 JP (2 x 35 Menit) - 1 Pertemuan',
    kataKunci: ['hak dan kewajiban', 'disiplin sekolah', 'tata tertib', 'kebersihan kelas']
  },

  // --- PJOK, Seni & Agama SD Fase A ---
  {
    id: 'sd-fase-a-pjok-k1',
    jenjang: 'SD',
    fase: 'Fase A',
    tingkat: 'Kelas 1',
    mataPelajaranKey: 'pjok',
    mataPelajaranName: 'Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)',
    topik: 'Pola Gerak Dasar Lokomotor: Berjalan, Berlari, dan Melompat Berirama',
    semester: 1,
    deskripsiTP: 'Peserta didik dapat mempraktikkan variasi gerak lokomotor terkoordinasi dalam permainan sederhana dan menyenangkan.',
    rekomendasiModel: 'Praktik Langsung & Game Based Learning',
    alokasiWaktuDefault: '3 JP (3 x 35 Menit) - 1 Pertemuan',
    kataKunci: ['gerak lokomotor', 'berlari', 'melompat', 'kebugaran jasmani']
  },
  {
    id: 'sd-fase-a-seni-k1',
    jenjang: 'SD',
    fase: 'Fase A',
    tingkat: 'Kelas 1',
    mataPelajaranKey: 'seni rupa',
    mataPelajaranName: 'Seni Rupa',
    topik: 'Eksplorasi Garis, Bidang Geometris, dan Warna Primer dalam Karya Kolase Kertas',
    semester: 1,
    deskripsiTP: 'Peserta didik mampu memotong, menempel, dan memadukan warna primer (merah, kuning, biru) untuk membentuk objek visual.',
    rekomendasiModel: 'Project Based Learning (PjBL)',
    alokasiWaktuDefault: '2 JP (2 x 35 Menit) - 1 Pertemuan',
    kataKunci: ['warna primer', 'kolase', 'garis dan bidang', 'kreativitas visual']
  },
  {
    id: 'sd-fase-a-pai-k1',
    jenjang: 'SD',
    fase: 'Fase A',
    tingkat: 'Kelas 1',
    mataPelajaranKey: 'pendidikan agama islam',
    mataPelajaranName: 'Pendidikan Agama Islam dan Budi Pekerti',
    topik: 'Kasih Sayang Allah Swt. (Ar-Rahman dan Ar-Rahim) serta Pembiasaan Huruf Hijaiyah Berharakat',
    semester: 1,
    deskripsiTP: 'Peserta didik melafalkan Asmaul Husna Ar-Rahman dan Ar-Rahim serta membaca huruf hijaiyah berharakat fathah, kasrah, dhammah.',
    rekomendasiModel: 'Talaqqi & Drill Berulang',
    alokasiWaktuDefault: '3 JP (3 x 35 Menit) - 1 Pertemuan',
    kataKunci: ['ar-rahman', 'ar-rahim', 'huruf hijaiyah', 'fathah kasrah dhammah']
  },

  // =========================================================================
  // SD - FASE B (KELAS 3 & KELAS 4)
  // Standar BSKAP 032/H/KR/2024
  // =========================================================================

  // --- IPAS SD Fase B ---
  {
    id: 'sd-fase-b-ipas-k3-s1',
    jenjang: 'SD',
    fase: 'Fase B',
    tingkat: 'Kelas 3',
    mataPelajaranKey: 'ipas',
    mataPelajaranName: 'IPAS (Ilmu Pengetahuan Alam & Sosial)',
    topik: 'Daur Hidup Hewan: Membandingkan Metamorfosis Sempurna dan Tidak Sempurna',
    semester: 1,
    deskripsiTP: 'Peserta didik mampu mengurutkan siklus hidup kupu-kupu, katak, belalang, dan kecoak serta membuat bagan perbandingannya.',
    rekomendasiModel: 'Inquiry Learning',
    alokasiWaktuDefault: '3 JP (3 x 35 Menit) - 1 Pertemuan',
    kataKunci: ['metamorfosis', 'daur hidup', 'larva pupa', 'hewan di sekitar']
  },
  {
    id: 'sd-fase-b-ipas-k3-s2',
    jenjang: 'SD',
    fase: 'Fase B',
    tingkat: 'Kelas 3',
    mataPelajaranKey: 'ipas',
    mataPelajaranName: 'IPAS (Ilmu Pengetahuan Alam & Sosial)',
    topik: 'Kenampakan Alam dan Pemanfaatan Sumber Daya Alam di Lingkungan Daerahku',
    semester: 2,
    deskripsiTP: 'Peserta didik dapat mengidentifikasi bentang alam (pantai, dataran rendah, pegunungan) dan komoditas ekonominya.',
    rekomendasiModel: 'Contextual Teaching and Learning (CTL)',
    alokasiWaktuDefault: '3 JP (3 x 35 Menit) - 1 Pertemuan',
    kataKunci: ['bentang alam', 'dataran tinggi', 'sumber daya alam', 'mata pencaharian']
  },
  {
    id: 'sd-fase-b-ipas-k4-s1',
    jenjang: 'SD',
    fase: 'Fase B',
    tingkat: 'Kelas 4',
    mataPelajaranKey: 'ipas',
    mataPelajaranName: 'IPAS (Ilmu Pengetahuan Alam & Sosial)',
    topik: 'Bagian Tubuh Tumbuhan, Struktur Jaringan Daun, dan Proses Fotosintesis',
    semester: 1,
    deskripsiTP: 'Peserta didik mampu menganalisis peran akar, batang, daun, klorofil, cahaya matahari, dan air dalam fotosintesis.',
    rekomendasiModel: 'Problem Based Learning (PBL)',
    alokasiWaktuDefault: '3 JP (3 x 35 Menit) - 1 Pertemuan',
    kataKunci: ['akar batang daun', 'fotosintesis', 'klorofil', 'oksigen glukosa']
  },
  {
    id: 'sd-fase-b-ipas-k4-s1-2',
    jenjang: 'SD',
    fase: 'Fase B',
    tingkat: 'Kelas 4',
    mataPelajaranKey: 'ipas',
    mataPelajaranName: 'IPAS (Ilmu Pengetahuan Alam & Sosial)',
    topik: 'Transformasi Bentuk Energi di Sekitar Kita dan Energi Ramah Lingkungan',
    semester: 1,
    deskripsiTP: 'Peserta didik dapat membuktikan transformasi energi kinetik, potensial, panas, bunyi, dan listrik melalui percobaan sederhana.',
    rekomendasiModel: 'Project Based Learning (PjBL)',
    alokasiWaktuDefault: '3 JP (3 x 35 Menit) - 1 Pertemuan',
    kataKunci: ['transformasi energi', 'energi kinetik', 'energi surya', 'hemat energi']
  },
  {
    id: 'sd-fase-b-ipas-k4-s2',
    jenjang: 'SD',
    fase: 'Fase B',
    tingkat: 'Kelas 4',
    mataPelajaranKey: 'ipas',
    mataPelajaranName: 'IPAS (Ilmu Pengetahuan Alam & Sosial)',
    topik: 'Pengaruh Gaya (Otot, Gesek, Magnet, Pegas, Gravitasi) terhadap Gerak dan Bentuk Benda',
    semester: 2,
    deskripsiTP: 'Peserta didik mampu menguji hukum gaya terhadap benda bergerak dan mendemonstrasikan sifat kutub magnet.',
    rekomendasiModel: 'Inquiry Learning',
    alokasiWaktuDefault: '3 JP (3 x 35 Menit) - 1 Pertemuan',
    kataKunci: ['gaya gesek', 'gaya magnet', 'gravitasi bumi', 'kecepatan gerak']
  },

  // --- Matematika SD Fase B ---
  {
    id: 'sd-fase-b-mat-k3-s1',
    jenjang: 'SD',
    fase: 'Fase B',
    tingkat: 'Kelas 3',
    mataPelajaranKey: 'matematika',
    mataPelajaranName: 'Matematika',
    topik: 'Perkalian dan Pembagian Bilangan Cacah Menggunakan Konsep Pengurangan Berulang',
    semester: 1,
    deskripsiTP: 'Peserta didik memahami tabel perkalian 1-10 dan menyelesaikan soal cerita pembagian bilangan cacah dengan tepat.',
    rekomendasiModel: 'Problem Based Learning (PBL)',
    alokasiWaktuDefault: '3 JP (3 x 35 Menit) - 1 Pertemuan',
    kataKunci: ['tabel perkalian', 'pembagian', 'aritmatika dasar', 'soal cerita']
  },
  {
    id: 'sd-fase-b-mat-k4-s1',
    jenjang: 'SD',
    fase: 'Fase B',
    tingkat: 'Kelas 4',
    mataPelajaranKey: 'matematika',
    mataPelajaranName: 'Matematika',
    topik: 'Pecahan Senilai, Menyederhanakan Pecahan, dan Membandingkan Dua Pecahan',
    semester: 1,
    deskripsiTP: 'Peserta didik mampu menentukan pecahan senilai melalui model gambar arsiran konkret dan perkalian pembilang-penyebut.',
    rekomendasiModel: 'Discovery Learning',
    alokasiWaktuDefault: '3 JP (3 x 35 Menit) - 1 Pertemuan',
    kataKunci: ['pecahan senilai', 'pembilang penyebut', 'menyederhanakan', 'garis pecahan']
  },
  {
    id: 'sd-fase-b-mat-k4-s2',
    jenjang: 'SD',
    fase: 'Fase B',
    tingkat: 'Kelas 4',
    mataPelajaranKey: 'matematika',
    mataPelajaranName: 'Matematika',
    topik: 'Keliling dan Luas Bangun Datar Persegi, Persegi Panjang, serta Segitiga',
    semester: 2,
    deskripsiTP: 'Peserta didik dapat menghitung keliling dan luas bidang lantai/petak tanah menggunakan rumus matematika standar.',
    rekomendasiModel: 'Problem Based Learning (PBL)',
    alokasiWaktuDefault: '3 JP (3 x 35 Menit) - 1 Pertemuan',
    kataKunci: ['luas persegi', 'keliling persegi panjang', 'luas segitiga', 'satuan luas']
  },

  // --- Bahasa Indonesia SD Fase B ---
  {
    id: 'sd-fase-b-indo-k3',
    jenjang: 'SD',
    fase: 'Fase B',
    tingkat: 'Kelas 3',
    mataPelajaranKey: 'bahasa indonesia',
    mataPelajaranName: 'Bahasa Indonesia',
    topik: 'Menemukan Gagasan Pokok dan Gagasan Pendukung dalam Paragraf Teks Informatif',
    semester: 1,
    deskripsiTP: 'Peserta didik mampu membedakan kalimat utama dan kalimat penjelas pada bacaan bertema lingkungan hidup.',
    rekomendasiModel: 'Guided Reading & Analysis',
    alokasiWaktuDefault: '3 JP (3 x 35 Menit) - 1 Pertemuan',
    kataKunci: ['gagasan pokok', 'gagasan pendukung', 'kalimat utama', 'paragraf']
  },
  {
    id: 'sd-fase-b-indo-k4-s1',
    jenjang: 'SD',
    fase: 'Fase B',
    tingkat: 'Kelas 4',
    mataPelajaranKey: 'bahasa indonesia',
    mataPelajaranName: 'Bahasa Indonesia',
    topik: 'Menyusun Teks Petunjuk dan Prosedur Membuat Sesuatu dengan Kalimat Perintah Efektif',
    semester: 1,
    deskripsiTP: 'Peserta didik mampu menulis langkah-langkah pembuatan karya atau petunjuk penggunaan alat secara runtut dan jelas.',
    rekomendasiModel: 'Project Based Learning (PjBL)',
    alokasiWaktuDefault: '3 JP (3 x 35 Menit) - 1 Pertemuan',
    kataKunci: ['teks prosedur', 'kalimat imperatif', 'langkah kerja', 'petunjuk alat']
  },
  {
    id: 'sd-fase-b-indo-k4-s2',
    jenjang: 'SD',
    fase: 'Fase B',
    tingkat: 'Kelas 4',
    mataPelajaranKey: 'bahasa indonesia',
    mataPelajaranName: 'Bahasa Indonesia',
    topik: 'Teknik Wawancara Narasumber Sederhana dan Menulis Laporan Hasil Wawancara',
    semester: 2,
    deskripsiTP: 'Peserta didik mampu merumuskan daftar pertanyaan 5W+1H dan mewawancarai narasumber di sekolah dengan sopan.',
    rekomendasiModel: 'Inquiry Learning & Praktik Wawancara',
    alokasiWaktuDefault: '3 JP (3 x 35 Menit) - 1 Pertemuan',
    kataKunci: ['wawancara', 'narasumber', '5w 1h', 'laporan informasi']
  },

  // --- Pendidikan Pancasila SD Fase B ---
  {
    id: 'sd-fase-b-pkn-k4-s1',
    jenjang: 'SD',
    fase: 'Fase B',
    tingkat: 'Kelas 4',
    mataPelajaranKey: 'pendidikan pancasila',
    mataPelajaranName: 'Pendidikan Pancasila',
    topik: 'Menghargai Keberagaman Suku, Budaya, dan Bahasa Daerah dalam Bingkai Bhinneka Tunggal Ika',
    semester: 1,
    deskripsiTP: 'Peserta didik dapat menampilkan sikap menghormati adat istiadat dan pakaian daerah teman sebaya tanpa diskriminasi.',
    rekomendasiModel: 'Contextual Teaching and Learning (CTL)',
    alokasiWaktuDefault: '2 JP (2 x 35 Menit) - 1 Pertemuan',
    kataKunci: ['keberagaman budaya', 'bhinneka tunggal ika', 'toleransi adat', 'persatuan']
  },

  // =========================================================================
  // SD - FASE C (KELAS 5 & KELAS 6)
  // Standar BSKAP 032/H/KR/2024
  // =========================================================================

  // --- IPAS SD Fase C ---
  {
    id: 'sd-fase-c-ipas-k5-s1',
    jenjang: 'SD',
    fase: 'Fase C',
    tingkat: 'Kelas 5',
    mataPelajaranKey: 'ipas',
    mataPelajaranName: 'IPAS (Ilmu Pengetahuan Alam & Sosial)',
    topik: 'Sistem Pernapasan Manusia: Struktur Organ Paru-Paru dan Pertukaran Gas Oksigen',
    semester: 1,
    deskripsiTP: 'Peserta didik dapat menjelaskan proses inspirasi-ekspirasi dan bahaya polusi udara terhadap alveolus.',
    rekomendasiModel: 'Problem Based Learning (PBL)',
    alokasiWaktuDefault: '3 JP (3 x 35 Menit) - 1 Pertemuan',
    kataKunci: ['organ pernapasan', 'alveolus', 'paru-paru', 'polusi udara', 'kesehatan']
  },
  {
    id: 'sd-fase-c-ipas-k5-s1-2',
    jenjang: 'SD',
    fase: 'Fase C',
    tingkat: 'Kelas 5',
    mataPelajaranKey: 'ipas',
    mataPelajaranName: 'IPAS (Ilmu Pengetahuan Alam & Sosial)',
    topik: 'Jaring-Jaring Makanan, Aliran Energi dalam Ekosistem, dan Keseimbangan Alam',
    semester: 1,
    deskripsiTP: 'Peserta didik mampu memprediksi akibat putusnya salah satu rantai makanan bagi populasi produsen dan konsumen puncak.',
    rekomendasiModel: 'Inquiry Learning',
    alokasiWaktuDefault: '3 JP (3 x 35 Menit) - 1 Pertemuan',
    kataKunci: ['rantai makanan', 'jaring makanan', 'produsen konsumen', 'dekomposer', 'ekosistem']
  },
  {
    id: 'sd-fase-c-ipas-k5-s2',
    jenjang: 'SD',
    fase: 'Fase C',
    tingkat: 'Kelas 5',
    mataPelajaranKey: 'ipas',
    mataPelajaranName: 'IPAS (Ilmu Pengetahuan Alam & Sosial)',
    topik: 'Siklus Air (Hidrologi) dan Upaya Konservasi Daerah Aliran Sungai (DAS)',
    semester: 2,
    deskripsiTP: 'Peserta didik mampu membuat skema evaporasi, kondensasi, presipitasi, dan infiltrasi serta kampanye hemat air bersih.',
    rekomendasiModel: 'Project Based Learning (PjBL)',
    alokasiWaktuDefault: '3 JP (3 x 35 Menit) - 1 Pertemuan',
    kataKunci: ['daur air', 'evaporasi', 'presipitasi', 'infiltrasi', 'air bersih']
  },
  {
    id: 'sd-fase-c-ipas-k6-s1',
    jenjang: 'SD',
    fase: 'Fase C',
    tingkat: 'Kelas 6',
    mataPelajaranKey: 'ipas',
    mataPelajaranName: 'IPAS (Ilmu Pengetahuan Alam & Sosial)',
    topik: 'Sistem Tata Surya: Karakteristik Planet, Orbit Revolusi, dan Rotasi Bumi',
    semester: 1,
    deskripsiTP: 'Peserta didik mampu membandingkan ciri planet terestrial dan gas serta menjelaskan pergantian siang-malam.',
    rekomendasiModel: 'Discovery Learning Berbantuan Model 3D',
    alokasiWaktuDefault: '3 JP (3 x 35 Menit) - 1 Pertemuan',
    kataKunci: ['tata surya', 'planet', 'rotasi revolusi', 'gerhana', 'gravitasi matahari']
  },
  {
    id: 'sd-fase-c-ipas-k6-s2',
    jenjang: 'SD',
    fase: 'Fase C',
    tingkat: 'Kelas 6',
    mataPelajaranKey: 'ipas',
    mataPelajaranName: 'IPAS (Ilmu Pengetahuan Alam & Sosial)',
    topik: 'Kerja Sama Indonesia dengan Negara-Negara ASEAN di Bidang Ekonomi dan Sosial Budaya',
    semester: 2,
    deskripsiTP: 'Peserta didik memahami peran aktif Indonesia dalam MEA (Masyarakat Ekonomi ASEAN) dan festival budaya serumpun.',
    rekomendasiModel: 'Contextual Teaching and Learning (CTL)',
    alokasiWaktuDefault: '3 JP (3 x 35 Menit) - 1 Pertemuan',
    kataKunci: ['asean', 'asia tenggara', 'kerja sama regional', 'ekspor impor']
  },

  // --- Matematika SD Fase C ---
  {
    id: 'sd-fase-c-mat-k5-s1',
    jenjang: 'SD',
    fase: 'Fase C',
    tingkat: 'Kelas 5',
    mataPelajaranKey: 'matematika',
    mataPelajaranName: 'Matematika',
    topik: 'Operasi Penjumlahan dan Pengurangan Pecahan Berpenyebut Berbeda Menggunakan KPK',
    semester: 1,
    deskripsiTP: 'Peserta didik dapat menyamakan penyebut pecahan memakai KPK dan memecahkan soal cerita kontekstual.',
    rekomendasiModel: 'Problem Based Learning (PBL)',
    alokasiWaktuDefault: '3 JP (3 x 35 Menit) - 1 Pertemuan',
    kataKunci: ['penjumlahan pecahan', 'kpk', 'pecahan campuran', 'penyebut berbeda']
  },
  {
    id: 'sd-fase-c-mat-k5-s2',
    jenjang: 'SD',
    fase: 'Fase C',
    tingkat: 'Kelas 5',
    mataPelajaranKey: 'matematika',
    mataPelajaranName: 'Matematika',
    topik: 'Volume Bangun Ruang Kubus dan Balok Menggunakan Kubus Satuan Konkret',
    semester: 2,
    deskripsiTP: 'Peserta didik mampu menemukan rumus volume V = s x s x s dan V = p x l x t serta menghitung kapasitas wadah air.',
    rekomendasiModel: 'Discovery Learning',
    alokasiWaktuDefault: '3 JP (3 x 35 Menit) - 1 Pertemuan',
    kataKunci: ['volume kubus', 'volume balok', 'kubus satuan', 'kapasitas liter']
  },
  {
    id: 'sd-fase-c-mat-k6-s1',
    jenjang: 'SD',
    fase: 'Fase C',
    tingkat: 'Kelas 6',
    mataPelajaranKey: 'matematika',
    mataPelajaranName: 'Matematika',
    topik: 'Lingkaran: Menghitung Keliling dan Luas dengan Nilai Pendekatan Phi (22/7 dan 3,14)',
    semester: 1,
    deskripsiTP: 'Peserta didik dapat menentukan jari-jari, diameter, dan menghitung luas roda/taman bundar dengan benar.',
    rekomendasiModel: 'Problem Based Learning (PBL)',
    alokasiWaktuDefault: '3 JP (3 x 35 Menit) - 1 Pertemuan',
    kataKunci: ['lingkaran', 'phi', 'jari-jari', 'luas lingkaran', 'keliling']
  },
  {
    id: 'sd-fase-c-mat-k6-s2',
    jenjang: 'SD',
    fase: 'Fase C',
    tingkat: 'Kelas 6',
    mataPelajaranKey: 'matematika',
    mataPelajaranName: 'Matematika',
    topik: 'Penyajian dan Pengolahan Data: Menghitung Mean, Median, dan Modus Hasil Survei',
    semester: 2,
    deskripsiTP: 'Peserta didik mampu membaca diagram batang/lingkaran dan menentukan nilai rata-rata nilai kelas.',
    rekomendasiModel: 'Project Based Learning (PjBL)',
    alokasiWaktuDefault: '3 JP (3 x 35 Menit) - 1 Pertemuan',
    kataKunci: ['statistika dasar', 'mean rata-rata', 'median', 'modus', 'diagram batang']
  },

  // --- Bahasa Indonesia SD Fase C ---
  {
    id: 'sd-fase-c-indo-k5',
    jenjang: 'SD',
    fase: 'Fase C',
    tingkat: 'Kelas 5',
    mataPelajaranKey: 'bahasa indonesia',
    mataPelajaranName: 'Bahasa Indonesia',
    topik: 'Menulis Teks Eksplanasi Fenomena Alam Berstruktur Pernyataan Umum dan Deretan Penjelas',
    semester: 1,
    deskripsiTP: 'Peserta didik mampu menyusun uraian ilmiah populer tentang proses terjadinya pelangi atau gempa bumi dengan kata baku.',
    rekomendasiModel: 'Genre-Based Approach',
    alokasiWaktuDefault: '3 JP (3 x 35 Menit) - 1 Pertemuan',
    kataKunci: ['teks eksplanasi', 'sebab akibat', 'kata baku', 'literasi sains']
  },
  {
    id: 'sd-fase-c-indo-k6',
    jenjang: 'SD',
    fase: 'Fase C',
    tingkat: 'Kelas 6',
    mataPelajaranKey: 'bahasa indonesia',
    mataPelajaranName: 'Bahasa Indonesia',
    topik: 'Menyusun dan Berpidato Persuasif Menghadapi Kelulusan dengan Intonasi dan Mimik Tepat',
    semester: 2,
    deskripsiTP: 'Peserta didik mampu menulis naskah pidato berstruktur (salam, pembuka, isi persuasif, penutup) dan tampil percaya diri.',
    rekomendasiModel: 'Role Playing & Public Speaking',
    alokasiWaktuDefault: '3 JP (3 x 35 Menit) - 1 Pertemuan',
    kataKunci: ['pidato persuasif', 'orasi', 'public speaking', 'intonasi dan artikulasi']
  },

  // =========================================================================
  // SMP - FASE D (KELAS 7, KELAS 8, KELAS 9)
  // Standar BSKAP 032/H/KR/2024
  // =========================================================================

  // --- IPA SMP Fase D ---
  {
    id: 'smp-fase-d-ipa-k7-s1',
    jenjang: 'SMP',
    fase: 'Fase D',
    tingkat: 'Kelas 7',
    mataPelajaranKey: 'ilmu pengetahuan alam (ipa)',
    mataPelajaranName: 'Ilmu Pengetahuan Alam (IPA)',
    topik: 'Metode Ilmiah, Keselamatan Kerja Laboratorium, dan Pengukuran Besaran Pokok-Turunan',
    semester: 1,
    deskripsiTP: 'Peserta didik mampu merancang langkah eksperimen ilmiah terkontrol dan mengukur presisi dengan neraca serta jangka sorong.',
    rekomendasiModel: 'Inquiry Learning',
    alokasiWaktuDefault: '2 JP (2 x 40 Menit) - 1 Pertemuan',
    kataKunci: ['metode ilmiah', 'besaran pokok', 'besaran turunan', 'satuan si', 'laboratorium']
  },
  {
    id: 'smp-fase-d-ipa-k7-s1-2',
    jenjang: 'SMP',
    fase: 'Fase D',
    tingkat: 'Kelas 7',
    mataPelajaranKey: 'ilmu pengetahuan alam (ipa)',
    mataPelajaranName: 'Ilmu Pengetahuan Alam (IPA)',
    topik: 'Klasifikasi Makhluk Hidup Menggunakan Kunci Determinasi Sederhana (Kunci Dikotomi)',
    semester: 1,
    deskripsiTP: 'Peserta didik dapat mengidentifikasi ciri kingdom monera, protista, fungi, plantae, animalia melalui kunci identifikasi.',
    rekomendasiModel: 'Discovery Learning',
    alokasiWaktuDefault: '2 JP (2 x 40 Menit) - 1 Pertemuan',
    kataKunci: ['kunci determinasi', 'kunci dikotomi', 'taksonomi', '5 kingdom']
  },
  {
    id: 'smp-fase-d-ipa-k7-s2',
    jenjang: 'SMP',
    fase: 'Fase D',
    tingkat: 'Kelas 7',
    mataPelajaranKey: 'ilmu pengetahuan alam (ipa)',
    mataPelajaranName: 'Ilmu Pengetahuan Alam (IPA)',
    topik: 'Suhu, Kalor, dan Mekanisme Perpindahan Panas (Konduksi, Konveksi, Radiasi)',
    semester: 2,
    deskripsiTP: 'Peserta didik mampu menganalisis azas Black serta menguji laju perambatan kalor pada berbagai bahan konduktor-isolator.',
    rekomendasiModel: 'Problem Based Learning (PBL)',
    alokasiWaktuDefault: '2 JP (2 x 40 Menit) - 1 Pertemuan',
    kataKunci: ['kalor', 'konduksi', 'konveksi', 'radiasi', 'termometer']
  },
  {
    id: 'smp-fase-d-ipa-k8-s1',
    jenjang: 'SMP',
    fase: 'Fase D',
    tingkat: 'Kelas 8',
    mataPelajaranKey: 'ilmu pengetahuan alam (ipa)',
    mataPelajaranName: 'Ilmu Pengetahuan Alam (IPA)',
    topik: 'Struktur dan Fungsi Organel Sel: Perbandingan Preparat Sel Tumbuhan vs Sel Hewan',
    semester: 1,
    deskripsiTP: 'Peserta didik terampil membuat preparat mikroskopis bawang merah dan mukosa mulut serta menjelaskan fungsi inti sel dan membran.',
    rekomendasiModel: 'Inquiry Learning Berbasis Laboratorium',
    alokasiWaktuDefault: '2 JP (2 x 40 Menit) - 1 Pertemuan',
    kataKunci: ['sel hewan', 'sel tumbuhan', 'dinding sel', 'kloroplas', 'mikroskop']
  },
  {
    id: 'smp-fase-d-ipa-k8-s1-2',
    jenjang: 'SMP',
    fase: 'Fase D',
    tingkat: 'Kelas 8',
    mataPelajaranKey: 'ilmu pengetahuan alam (ipa)',
    mataPelajaranName: 'Ilmu Pengetahuan Alam (IPA)',
    topik: 'Sistem Peredaran Darah Manusia: Struktur Jantung, Komponen Darah, dan Hipertensi',
    semester: 1,
    deskripsiTP: 'Peserta didik mampu menganalisis mekanisme sirkulasi darah ganda dan merumuskan gaya hidup pencegah penyakit jantung koroner.',
    rekomendasiModel: 'Problem Based Learning (PBL)',
    alokasiWaktuDefault: '2 JP (2 x 40 Menit) - 1 Pertemuan',
    kataKunci: ['jantung', 'eritrosit', 'leukosit', 'trombosit', 'hipertensi']
  },
  {
    id: 'smp-fase-d-ipa-k8-s2',
    jenjang: 'SMP',
    fase: 'Fase D',
    tingkat: 'Kelas 8',
    mataPelajaranKey: 'ilmu pengetahuan alam (ipa)',
    mataPelajaranName: 'Ilmu Pengetahuan Alam (IPA)',
    topik: 'Pesawat Sederhana (Tuas, Katrol, Bidang Miring) dan Perhitungan Keuntungan Mekanis',
    semester: 2,
    deskripsiTP: 'Peserta didik mampu memecahkan masalah gaya dan usaha pada linggis, tangga, serta derek konstruksi.',
    rekomendasiModel: 'Discovery Learning',
    alokasiWaktuDefault: '2 JP (2 x 40 Menit) - 1 Pertemuan',
    kataKunci: ['pesawat sederhana', 'tuas jenis 1 2 3', 'keuntungan mekanis', 'katrol']
  },
  {
    id: 'smp-fase-d-ipa-k9-s1',
    jenjang: 'SMP',
    fase: 'Fase D',
    tingkat: 'Kelas 9',
    mataPelajaranKey: 'ilmu pengetahuan alam (ipa)',
    mataPelajaranName: 'Ilmu Pengetahuan Alam (IPA)',
    topik: 'Pewarisan Sifat: Hukum Mendel I & II pada Persilangan Monohibrid dan Dihibrid',
    semester: 1,
    deskripsiTP: 'Peserta didik dapat membuat diagram persilangan Punnett dan menghitung rasio fenotipe serta genotipe keturunan.',
    rekomendasiModel: 'Problem Based Learning (PBL)',
    alokasiWaktuDefault: '2 JP (2 x 40 Menit) - 1 Pertemuan',
    kataKunci: ['genetika', 'hukum mendel', 'monohibrid', 'dihibrid', 'rasio fenotipe']
  },
  {
    id: 'smp-fase-d-ipa-k9-s1-2',
    jenjang: 'SMP',
    fase: 'Fase D',
    tingkat: 'Kelas 9',
    mataPelajaranKey: 'ilmu pengetahuan alam (ipa)',
    mataPelajaranName: 'Ilmu Pengetahuan Alam (IPA)',
    topik: 'Listrik Dinamis: Hukum Ohm, Rangkaian Seri-Paralel, dan Energi Daya Listrik Rumah Tangga',
    semester: 1,
    deskripsiTP: 'Peserta didik mampu merangkai sirkuit listrik tertutup, mengukur arus-tegangan, dan menghitung tagihan kWh listrik PLN.',
    rekomendasiModel: 'Project Based Learning (PjBL)',
    alokasiWaktuDefault: '2 JP (2 x 40 Menit) - 1 Pertemuan',
    kataKunci: ['hukum ohm', 'rangkaian seri paralel', 'kwh meter', 'daya listrik']
  },
  {
    id: 'smp-fase-d-ipa-k9-s2',
    jenjang: 'SMP',
    fase: 'Fase D',
    tingkat: 'Kelas 9',
    mataPelajaranKey: 'ilmu pengetahuan alam (ipa)',
    mataPelajaranName: 'Ilmu Pengetahuan Alam (IPA)',
    topik: 'Bioteknologi Konvensional dan Modern: Pembuatan Produk Fermentasi Pangan Lokal',
    semester: 2,
    deskripsiTP: 'Peserta didik terampil memproduksi tempe, yogurt, atau nata de coco dan mengevaluasi peran mikroorganisme Rhizopus/Lactobacillus.',
    rekomendasiModel: 'Project Based Learning (PjBL)',
    alokasiWaktuDefault: '2 JP (2 x 40 Menit) - 1 Pertemuan',
    kataKunci: ['bioteknologi pangan', 'fermentasi', 'rhizopus oryzae', 'mikroorganisme']
  },

  // --- Matematika SMP Fase D ---
  {
    id: 'smp-fase-d-mat-k7-s1',
    jenjang: 'SMP',
    fase: 'Fase D',
    tingkat: 'Kelas 7',
    mataPelajaranKey: 'matematika',
    mataPelajaranName: 'Matematika',
    topik: 'Operasi Bilangan Bulat dan Pecahan dalam Aritmatika Sosial Keuangan Sehari-hari',
    semester: 1,
    deskripsiTP: 'Peserta didik mampu menghitung keuntungan, kerugian, persentase diskon, tara, neto, dan bunga tunggal tabungan.',
    rekomendasiModel: 'Problem Based Learning (PBL)',
    alokasiWaktuDefault: '2 JP (2 x 40 Menit) - 1 Pertemuan',
    kataKunci: ['aritmatika sosial', 'diskon', 'untung rugi', 'neto tara bruto']
  },
  {
    id: 'smp-fase-d-mat-k7-s2',
    jenjang: 'SMP',
    fase: 'Fase D',
    tingkat: 'Kelas 7',
    mataPelajaranKey: 'matematika',
    mataPelajaranName: 'Matematika',
    topik: 'Persamaan dan Pertidaksamaan Linear Satu Variabel (PLSV & PtLSV)',
    semester: 2,
    deskripsiTP: 'Peserta didik mampu memodelkan situasi matematika ke dalam aljabar dan menentukan nilai himpunan penyelesaiannya.',
    rekomendasiModel: 'Discovery Learning',
    alokasiWaktuDefault: '2 JP (2 x 40 Menit) - 1 Pertemuan',
    kataKunci: ['plsv', 'ptlsv', 'variabel x', 'aljabar linear', 'himpunan penyelesaian']
  },
  {
    id: 'smp-fase-d-mat-k8-s1',
    jenjang: 'SMP',
    fase: 'Fase D',
    tingkat: 'Kelas 8',
    mataPelajaranKey: 'matematika',
    mataPelajaranName: 'Matematika',
    topik: 'Teorema Pythagoras: Pembuktian Luas Persegi dan Penentuan Tripel Pythagoras',
    semester: 1,
    deskripsiTP: 'Peserta didik dapat membuktikan a^2 + b^2 = c^2 pada segitiga siku-siku serta menghitung jarak dua titik pada koordinat kartesius.',
    rekomendasiModel: 'Inquiry Learning dengan Eksplorasi Visual',
    alokasiWaktuDefault: '2 JP (2 x 40 Menit) - 1 Pertemuan',
    kataKunci: ['teorema pythagoras', 'tripel pythagoras', 'hipotenusa', 'jarak koordinat']
  },
  {
    id: 'smp-fase-d-mat-k8-s1-2',
    jenjang: 'SMP',
    fase: 'Fase D',
    tingkat: 'Kelas 8',
    mataPelajaranKey: 'matematika',
    mataPelajaranName: 'Matematika',
    topik: 'Sistem Persamaan Linear Dua Variabel (SPLDV) dengan Metode Gabungan Eliminasi & Substitusi',
    semester: 1,
    deskripsiTP: 'Peserta didik terampil menyelesaikan masalah harga barang belanjaan menggunakan sistem dua persamaan linear dua variabel.',
    rekomendasiModel: 'Problem Based Learning (PBL)',
    alokasiWaktuDefault: '2 JP (2 x 40 Menit) - 1 Pertemuan',
    kataKunci: ['spldv', 'eliminasi', 'substitusi', 'pemodelan belanja']
  },
  {
    id: 'smp-fase-d-mat-k9-s1',
    jenjang: 'SMP',
    fase: 'Fase D',
    tingkat: 'Kelas 9',
    mataPelajaranKey: 'matematika',
    mataPelajaranName: 'Matematika',
    topik: 'Fungsi Kuadrat: Menggambar Kurva Parabola, Menentukan Sumbu Simetri, dan Titik Puncak',
    semester: 1,
    deskripsiTP: 'Peserta didik mampu menganalisis pengaruh nilai koefisien a, b, c dan diskriminan D terhadap posisi grafik fungsi kuadrat.',
    rekomendasiModel: 'Inquiry Learning Berbantuan GeoGebra',
    alokasiWaktuDefault: '2 JP (2 x 40 Menit) - 1 Pertemuan',
    kataKunci: ['fungsi kuadrat', 'parabola', 'titik optimum', 'diskriminan b2-4ac']
  },
  {
    id: 'smp-fase-d-mat-k9-s2',
    jenjang: 'SMP',
    fase: 'Fase D',
    tingkat: 'Kelas 9',
    mataPelajaranKey: 'matematika',
    mataPelajaranName: 'Matematika',
    topik: 'Peluang Teoretik dan Empirik: Eksperimen Pelemparan Dadu dan Koin Bersama',
    semester: 2,
    deskripsiTP: 'Peserta didik dapat menentukan ruang sampel, titik sampel, dan menghitung peluang kejadian acak dalam pengambilan keputusan.',
    rekomendasiModel: 'Discovery Learning Melalui Percobaan Nyata',
    alokasiWaktuDefault: '2 JP (2 x 40 Menit) - 1 Pertemuan',
    kataKunci: ['peluang teoretik', 'ruang sampel', 'frekuensi relatif', 'probabilitas']
  },

  // --- IPS SMP Fase D ---
  {
    id: 'smp-fase-d-ips-k7-s1',
    jenjang: 'SMP',
    fase: 'Fase D',
    tingkat: 'Kelas 7',
    mataPelajaranKey: 'ilmu pengetahuan sosial (ips)',
    mataPelajaranName: 'Ilmu Pengetahuan Sosial (IPS)',
    topik: 'Konektivitas Antarruang dan Letak Geografis-Geologis Indonesia serta Pengaruhnya terhadap Iklim',
    semester: 1,
    deskripsiTP: 'Peserta didik mampu membaca peta tematik letak koordinat astronomis dan jalur cincin api pasifik (ring of fire) Indonesia.',
    rekomendasiModel: 'Inquiry Learning',
    alokasiWaktuDefault: '2 JP (2 x 40 Menit) - 1 Pertemuan',
    kataKunci: ['letak geografis', 'lempeng tektonik', 'iklim tropis', 'peta tematik']
  },
  {
    id: 'smp-fase-d-ips-k8-s1',
    jenjang: 'SMP',
    fase: 'Fase D',
    tingkat: 'Kelas 8',
    mataPelajaranKey: 'ilmu pengetahuan sosial (ips)',
    mataPelajaranName: 'Ilmu Pengetahuan Sosial (IPS)',
    topik: 'Pluralitas Masyarakat Indonesia: Saluran Mobilitas Sosial dan Penanganan Konflik Sosial',
    semester: 1,
    deskripsiTP: 'Peserta didik dapat menganalisis faktor pendorong mobilitas sosial vertikal dan merumuskan mediasi integrasi sosial.',
    rekomendasiModel: 'Problem Based Learning (PBL)',
    alokasiWaktuDefault: '2 JP (2 x 40 Menit) - 1 Pertemuan',
    kataKunci: ['mobilitas sosial', 'integrasi bangsa', 'keberagaman agama suku', 'konflik dan konsensus']
  },
  {
    id: 'smp-fase-d-ips-k9-s1',
    jenjang: 'SMP',
    fase: 'Fase D',
    tingkat: 'Kelas 9',
    mataPelajaranKey: 'ilmu pengetahuan sosial (ips)',
    mataPelajaranName: 'Ilmu Pengetahuan Sosial (IPS)',
    topik: 'Perubahan Sosial Budaya di Era Globalisasi dan Penguatan Identitas Kearifan Lokal Nusantara',
    semester: 1,
    deskripsiTP: 'Peserta didik mampu bersikap selektif terhadap arus westernisasi dan melestarikan produk budaya lokal di era digital.',
    rekomendasiModel: 'Project Based Learning (PjBL)',
    alokasiWaktuDefault: '2 JP (2 x 40 Menit) - 1 Pertemuan',
    kataKunci: ['globalisasi', 'perubahan sosial', 'westernisasi', 'kearifan lokal']
  },

  // --- Bahasa Indonesia SMP Fase D ---
  {
    id: 'smp-fase-d-indo-k7-s1',
    jenjang: 'SMP',
    fase: 'Fase D',
    tingkat: 'Kelas 7',
    mataPelajaranKey: 'bahasa indonesia',
    mataPelajaranName: 'Bahasa Indonesia',
    topik: 'Menulis Teks Deskripsi Wisata dan Kuliner Daerah dengan Majas Panca Indera yang Menarik',
    semester: 1,
    deskripsiTP: 'Peserta didik mampu menggambarkan rincian objek wisata budaya memakai kata konkret dan citraan sensorik.',
    rekomendasiModel: 'Genre-Based Approach',
    alokasiWaktuDefault: '2 JP (2 x 40 Menit) - 1 Pertemuan',
    kataKunci: ['teks deskripsi', 'majas personifikasi', 'kata konkret', 'citraan sensoris']
  },
  {
    id: 'smp-fase-d-indo-k8-s1',
    jenjang: 'SMP',
    fase: 'Fase D',
    tingkat: 'Kelas 8',
    mataPelajaranKey: 'bahasa indonesia',
    mataPelajaranName: 'Bahasa Indonesia',
    topik: 'Menganalisis Teks Berita Aktual (Piramida Terbalik) dan Memilah Fakta vs Opini',
    semester: 1,
    deskripsiTP: 'Peserta didik kritis dalam memverifikasi kebenaran berita 5W+1H serta menghindari penyebaran hoaks di media sosial.',
    rekomendasiModel: 'Problem Based Learning (PBL)',
    alokasiWaktuDefault: '2 JP (2 x 40 Menit) - 1 Pertemuan',
    kataKunci: ['teks berita', 'unsur adiksimba', 'fakta opini', 'literasi digital antihoaks']
  },
  {
    id: 'smp-fase-d-indo-k9-s1',
    jenjang: 'SMP',
    fase: 'Fase D',
    tingkat: 'Kelas 9',
    mataPelajaranKey: 'bahasa indonesia',
    mataPelajaranName: 'Bahasa Indonesia',
    topik: 'Menulis Teks Laporan Percobaan Ilmiah Berstruktur Lengkap dan Menggunakan Istilah Teknis',
    semester: 1,
    deskripsiTP: 'Peserta didik mampu menyusun laporan hasil praktikum IPA ke dalam format penulisan ilmiah objektif.',
    rekomendasiModel: 'Inquiry Learning & Scientific Writing',
    alokasiWaktuDefault: '2 JP (2 x 40 Menit) - 1 Pertemuan',
    kataKunci: ['laporan percobaan', 'istilah teknis ilmiah', 'hipotesis data', 'kesimpulan objektif']
  },

  // --- Bahasa Inggris SMP Fase D ---
  {
    id: 'smp-fase-d-ing-k7',
    jenjang: 'SMP',
    fase: 'Fase D',
    tingkat: 'Kelas 7',
    mataPelajaranKey: 'bahasa inggris',
    mataPelajaranName: 'Bahasa Inggris',
    topik: 'Describing People and Animals: Using Simple Present Tense and Adjectives of Appearance',
    semester: 1,
    deskripsiTP: 'Students can describe personality traits and physical appearance of family members accurately in spoken and written text.',
    rekomendasiModel: 'Task-Based Language Teaching (TBLT)',
    alokasiWaktuDefault: '2 JP (2 x 40 Menit) - 1 Pertemuan',
    kataKunci: ['descriptive text', 'simple present tense', 'adjectives', 'appearance']
  },
  {
    id: 'smp-fase-d-ing-k8',
    jenjang: 'SMP',
    fase: 'Fase D',
    tingkat: 'Kelas 8',
    mataPelajaranKey: 'bahasa inggris',
    mataPelajaranName: 'Bahasa Inggris',
    topik: 'Recount Text: Sharing Memorable School Experiences Using Past Verbs and Time Conjunctions',
    semester: 1,
    deskripsiTP: 'Students produce cohesive personal recount stories reflecting on past events with regular and irregular verbs.',
    rekomendasiModel: 'Genre-Based Pedagogy',
    alokasiWaktuDefault: '2 JP (2 x 40 Menit) - 1 Pertemuan',
    kataKunci: ['recount text', 'simple past tense', 'irregular verbs', 'orientation events']
  },

  // --- Informatika SMP Fase D ---
  {
    id: 'smp-fase-d-inf-k7',
    jenjang: 'SMP',
    fase: 'Fase D',
    tingkat: 'Kelas 7',
    mataPelajaranKey: 'informatika',
    mataPelajaranName: 'Informatika',
    topik: 'Berpikir Komputasional (Computational Thinking): Dekomposisi, Pola, Abstraksi, dan Algoritma',
    semester: 1,
    deskripsiTP: 'Peserta didik mampu menyelesaikan teka-teki logika Bebras dan menyusun diagram alir algoritma sederhana.',
    rekomendasiModel: 'Unplugged Computer Science & Discovery',
    alokasiWaktuDefault: '2 JP (2 x 40 Menit) - 1 Pertemuan',
    kataKunci: ['computational thinking', 'algoritma flowchart', 'dekomposisi', 'abstraksi']
  },
  {
    id: 'smp-fase-d-inf-k8',
    jenjang: 'SMP',
    fase: 'Fase D',
    tingkat: 'Kelas 8',
    mataPelajaranKey: 'informatika',
    mataPelajaranName: 'Informatika',
    topik: 'Pemrograman Visual dengan Scratch: Membuat Animasi Edukatif dan Game Sederhana',
    semester: 2,
    deskripsiTP: 'Peserta didik dapat merangkai blok kode percabangan if-else dan perulangan loop untuk menggerakkan sprite.',
    rekomendasiModel: 'Project Based Learning (PjBL)',
    alokasiWaktuDefault: '2 JP (2 x 40 Menit) - 1 Pertemuan',
    kataKunci: ['scratch', 'pemrograman blok', 'percabangan perulangan', 'game edukasi']
  },

  // --- Pendidikan Pancasila SMP Fase D ---
  {
    id: 'smp-fase-d-pkn-k7',
    jenjang: 'SMP',
    fase: 'Fase D',
    tingkat: 'Kelas 7',
    mataPelajaranKey: 'pendidikan pancasila',
    mataPelajaranName: 'Pendidikan Pancasila',
    topik: 'Sejarah Perumusan dan Penetapan Pancasila sebagai Dasar Negara oleh BPUPK dan PPKI',
    semester: 1,
    deskripsiTP: 'Peserta didik meneladani komitmen para pendiri bangsa dalam Piagam Jakarta dan sidang penetapan UUD NRI 1945.',
    rekomendasiModel: 'Contextual Teaching and Learning (CTL)',
    alokasiWaktuDefault: '2 JP (2 x 40 Menit) - 1 Pertemuan',
    kataKunci: ['bpupk', 'ppki', 'piagam jakarta', 'rumusan pancasila', 'semangat juang 45']
  },

  // =========================================================================
  // SMA - FASE E (KELAS 10)
  // Standar BSKAP 032/H/KR/2024
  // =========================================================================

  // --- Biologi SMA Fase E ---
  {
    id: 'sma-fase-e-bio-k10-s1',
    jenjang: 'SMA',
    fase: 'Fase E',
    tingkat: 'Kelas 10',
    mataPelajaranKey: 'biologi',
    mataPelajaranName: 'Biologi',
    topik: 'Keanekaragaman Hayati Indonesia: Garis Wallace-Weber, Endemisme, dan Konservasi In-Situ/Ex-Situ',
    semester: 1,
    deskripsiTP: 'Peserta didik mampu mengevaluasi ancaman deforestasi terhadap spesies langka serta merancang kampanye pelestarian habitat lokal.',
    rekomendasiModel: 'Problem Based Learning (PBL)',
    alokasiWaktuDefault: '2 JP (2 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['biodiversitas', 'garis wallace', 'taman nasional', 'konservasi in-situ', 'fauna tipe asiatis']
  },
  {
    id: 'sma-fase-e-bio-k10-s2',
    jenjang: 'SMA',
    fase: 'Fase E',
    tingkat: 'Kelas 10',
    mataPelajaranKey: 'biologi',
    mataPelajaranName: 'Biologi',
    topik: 'Perubahan Lingkungan Global, Pemanasan Suhu Bumi, dan Solusi Bioremediasi Limbah Plastik',
    semester: 2,
    deskripsiTP: 'Peserta didik dapat menganalisis data emisi karbon dan mendesain purwarupa bioplastik atau kompos organik sekolah.',
    rekomendasiModel: 'Project Based Learning (PjBL)',
    alokasiWaktuDefault: '2 JP (2 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['global warming', 'gas rumah kaca', 'bioremediasi', 'jejak karbon', 'ekologi terapan']
  },

  // --- Fisika SMA Fase E ---
  {
    id: 'sma-fase-e-fis-k10-s1',
    jenjang: 'SMA',
    fase: 'Fase E',
    tingkat: 'Kelas 10',
    mataPelajaranKey: 'fisika',
    mataPelajaranName: 'Fisika',
    topik: 'Ketidakpastian Pengukuran, Angka Penting, dan Penggunaan Mikrometer Sekrup serta Jangka Sorong',
    semester: 1,
    deskripsiTP: 'Peserta didik terampil melakukan kalibrasi dan pengukuran berulang serta melaporkan hasil beserta batas ralat ketidakpastian.',
    rekomendasiModel: 'Inquiry Learning Berbasis Laboratorium',
    alokasiWaktuDefault: '2 JP (2 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['jangka sorong', 'mikrometer sekrup', 'angka penting', 'ketidakpastian mutlak']
  },
  {
    id: 'sma-fase-e-fis-k10-s2',
    jenjang: 'SMA',
    fase: 'Fase E',
    tingkat: 'Kelas 10',
    mataPelajaranKey: 'fisika',
    mataPelajaranName: 'Fisika',
    topik: 'Energi Terbarukan: Analisis Efisiensi Panel Surya Fotovoltaik dan Pembangkit Mikrohidro',
    semester: 2,
    deskripsiTP: 'Peserta didik mampu menghitung daya listrik terkonversi dari radiasi sinar matahari dan mendiskusikan transisi energi bersih.',
    rekomendasiModel: 'Project Based Learning (PjBL)',
    alokasiWaktuDefault: '2 JP (2 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['energi terbarukan', 'panel surya', 'efisiensi konversi daya', 'mikrohidro', 'sdgs']
  },

  // --- Kimia SMA Fase E ---
  {
    id: 'sma-fase-e-kim-k10-s1',
    jenjang: 'SMA',
    fase: 'Fase E',
    tingkat: 'Kelas 10',
    mataPelajaranKey: 'kimia',
    mataPelajaranName: 'Kimia',
    topik: '12 Prinsip Kimia Hijau (Green Chemistry) dalam Mendukung Pembangunan Berkelanjutan 2030',
    semester: 1,
    deskripsiTP: 'Peserta didik mampu menganalisis sintesis zat kimia ramah lingkungan dan pengurangan penggunaan pelarut beracun industri.',
    rekomendasiModel: 'Problem Based Learning (PBL)',
    alokasiWaktuDefault: '2 JP (2 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['green chemistry', 'ekonomi atom', 'katalisis', 'degradabilitas', 'kimia hijau']
  },
  {
    id: 'sma-fase-e-kim-k10-s2',
    jenjang: 'SMA',
    fase: 'Fase E',
    tingkat: 'Kelas 10',
    mataPelajaranKey: 'kimia',
    mataPelajaranName: 'Kimia',
    topik: 'Hukum Dasar Kimia (Lavoisier, Proust, Dalton, Gay-Lussac, Avogadro) dan Persamaan Reaksi Setara',
    semester: 2,
    deskripsiTP: 'Peserta didik dapat menyetarakan koefisien reaksi pembakaran hidrokarbon dan menghitung massa zat sebelum-sesudah reaksi.',
    rekomendasiModel: 'Discovery Learning',
    alokasiWaktuDefault: '2 JP (2 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['hukum lavoisier', 'perbandingan tetap', 'penyetaraan reaksi', 'stoikiometri awal']
  },

  // --- Matematika SMA Fase E ---
  {
    id: 'sma-fase-e-mat-k10-s1',
    jenjang: 'SMA',
    fase: 'Fase E',
    tingkat: 'Kelas 10',
    mataPelajaranKey: 'matematika',
    mataPelajaranName: 'Matematika (Umum)',
    topik: 'Eksponen dan Logaritma: Pemodelan Pertumbuhan Bakteri dan Peluruhan Waktu Paruh Radioaktif',
    semester: 1,
    deskripsiTP: 'Peserta didik mampu menyelesaikan masalah kontekstual rumus pertumbuhan eksponensial y = a(1 + r)^t secara akurat.',
    rekomendasiModel: 'Problem Based Learning (PBL)',
    alokasiWaktuDefault: '2 JP (2 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['eksponen', 'logaritma', 'pertumbuhan eksponensial', 'peluruhan radioaktif']
  },
  {
    id: 'sma-fase-e-mat-k10-s1-2',
    jenjang: 'SMA',
    fase: 'Fase E',
    tingkat: 'Kelas 10',
    mataPelajaranKey: 'matematika',
    mataPelajaranName: 'Matematika (Umum)',
    topik: 'Barisan dan Deret Aritmatika serta Geometri dalam Perhitungan Bunga Majemuk dan Anuitas Pinjaman',
    semester: 1,
    deskripsiTP: 'Peserta didik terampil menghitung nilai masa depan (future value) investasi dan simulasi cicilan pembiayaan perbankan.',
    rekomendasiModel: 'Contextual Teaching and Learning (CTL)',
    alokasiWaktuDefault: '2 JP (2 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['barisan aritmatika', 'deret geometri', 'bunga majemuk', 'anuitas cicilan']
  },
  {
    id: 'sma-fase-e-mat-k10-s2',
    jenjang: 'SMA',
    fase: 'Fase E',
    tingkat: 'Kelas 10',
    mataPelajaranKey: 'matematika',
    mataPelajaranName: 'Matematika (Umum)',
    topik: 'Trigonometri: Perbandingan Sinus, Kosinus, Tangen pada Segitiga Siku-Siku dan Klinometer',
    semester: 2,
    deskripsiTP: 'Peserta didik dapat mengukur tinggi pohon atau gedung tanpa memanjat menggunakan sudut elevasi klinometer.',
    rekomendasiModel: 'Project Based Learning (PjBL)',
    alokasiWaktuDefault: '2 JP (2 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['trigonometri', 'sinus cosinus tangen', 'sudut elevasi', 'klinometer']
  },

  // --- Ekonomi, Sosiologi, Geografi & Sejarah SMA Fase E ---
  {
    id: 'sma-fase-e-eko-k10',
    jenjang: 'SMA',
    fase: 'Fase E',
    tingkat: 'Kelas 10',
    mataPelajaranKey: 'ekonomi',
    mataPelajaranName: 'Ekonomi',
    topik: 'Kelangkaan Sumber Daya, Skala Prioritas Kebutuhan, dan Analisis Biaya Peluang (Opportunity Cost)',
    semester: 1,
    deskripsiTP: 'Peserta didik mampu menyusun rencana keuangan anggaran saku pribadi dengan mempertimbangkan trade-off rasional.',
    rekomendasiModel: 'Problem Based Learning (PBL)',
    alokasiWaktuDefault: '2 JP (2 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['kelangkaan', 'biaya peluang', 'skala prioritas', 'literasi keuangan']
  },
  {
    id: 'sma-fase-e-sos-k10',
    jenjang: 'SMA',
    fase: 'Fase E',
    tingkat: 'Kelas 10',
    mataPelajaranKey: 'sosiologi',
    mataPelajaranName: 'Sosiologi',
    topik: 'Fungsi Sosiologi dan Metode Penelitian Sosial Lapangan dalam Memahami Fenomena Remaja',
    semester: 1,
    deskripsiTP: 'Peserta didik mampu merancang instrumen kuesioner observasi gejala sosial di lingkungan pergaulan sebaya.',
    rekomendasiModel: 'Inquiry Learning',
    alokasiWaktuDefault: '2 JP (2 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['sosiologi', 'metode penelitian', 'interaksi sosial', 'gejala sosial']
  },
  {
    id: 'sma-fase-e-geo-k10',
    jenjang: 'SMA',
    fase: 'Fase E',
    tingkat: 'Kelas 10',
    mataPelajaranKey: 'geografi',
    mataPelajaranName: 'Geografi',
    topik: 'Prinsip Geografi dan Pemanfaatan Penginderaan Jauh (Citra Satelit) serta SIG untuk Mitigasi Bencana',
    semester: 1,
    deskripsiTP: 'Peserta didik dapat menginterpretasi citra foto udara tata guna lahan dan membuat peta zonasi rawan longsor/banjir.',
    rekomendasiModel: 'Inquiry Berbantuan Google Earth & SIG',
    alokasiWaktuDefault: '2 JP (2 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['penginderaan jauh', 'sig gis', 'mitigasi bencana', 'analisis spasial']
  },
  {
    id: 'sma-fase-e-sej-k10',
    jenjang: 'SMA',
    fase: 'Fase E',
    tingkat: 'Kelas 10',
    mataPelajaranKey: 'sejarah',
    mataPelajaranName: 'Sejarah',
    topik: 'Konsep Berpikir Sinkronik dan Diakronik serta Verifikasi Sumber Sejarah Primer vs Sekunder',
    semester: 1,
    deskripsiTP: 'Peserta didik kritis dalam melakukan kritik intern-ekstern terhadap arsip dokumen sejarah proklamasi kemerdekaan.',
    rekomendasiModel: 'Historical Inquiry',
    alokasiWaktuDefault: '2 JP (2 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['diakronik kronologis', 'sinkronik', 'kritik sumber sejarah', 'historiografi']
  },

  // =========================================================================
  // SMA - FASE F (KELAS 11 & KELAS 12)
  // Standar BSKAP 032/H/KR/2024
  // =========================================================================

  // --- Biologi SMA Fase F ---
  {
    id: 'sma-fase-f-bio-k11-s1',
    jenjang: 'SMA',
    fase: 'Fase F',
    tingkat: 'Kelas 11',
    mataPelajaranKey: 'biologi',
    mataPelajaranName: 'Biologi',
    topik: 'Transpor Pasif & Aktif Melintasi Membran Sel: Difusi, Osmosis, dan Peristiwa Plasmolisis Sel Tumbuhan',
    semester: 1,
    deskripsiTP: 'Peserta didik membuktikan plasmolisis sel Rhoeo discolor pada larutan sukrosa pekat melalui pengamatan mikroskopik.',
    rekomendasiModel: 'Inquiry Learning Berbasis Laboratorium',
    alokasiWaktuDefault: '2 JP (2 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['transpor membran', 'osmosis', 'plasmolisis', 'tekanan turgor']
  },
  {
    id: 'sma-fase-f-bio-k11-s2',
    jenjang: 'SMA',
    fase: 'Fase F',
    tingkat: 'Kelas 11',
    mataPelajaranKey: 'biologi',
    mataPelajaranName: 'Biologi',
    topik: 'Sistem Imunitas Tubuh: Respon Kekebalan Humoral-Seluler dan Mekanisme Vaksinasi mRNA',
    semester: 2,
    deskripsiTP: 'Peserta didik mampu menganalisis peranan limfosit T, limfosit B, antibodi, serta memecahkan mitos penolakan imunisasi.',
    rekomendasiModel: 'Problem Based Learning (PBL)',
    alokasiWaktuDefault: '2 JP (2 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['sistem imun', 'limfosit t b', 'antibodi', 'vaksin mrna', 'antigen']
  },
  {
    id: 'sma-fase-f-bio-k12-s1',
    jenjang: 'SMA',
    fase: 'Fase F',
    tingkat: 'Kelas 12',
    mataPelajaranKey: 'biologi',
    mataPelajaranName: 'Biologi',
    topik: 'Ekspresi Genetik: Transkripsi DNA Menjadi mRNA dan Translasi Menjadi Polipeptida Protein',
    semester: 1,
    deskripsiTP: 'Peserta didik dapat menerjemahkan tabel kodon mRNA ke urutan asam amino dan menganalisis dampak mutasi titik.',
    rekomendasiModel: 'Discovery Learning & Simulasi Model',
    alokasiWaktuDefault: '2 JP (2 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['sintesis protein', 'transkripsi', 'translasi', 'kodon asam amino', 'dna polimerase']
  },
  {
    id: 'sma-fase-f-bio-k12-s2',
    jenjang: 'SMA',
    fase: 'Fase F',
    tingkat: 'Kelas 12',
    mataPelajaranKey: 'biologi',
    mataPelajaranName: 'Biologi',
    topik: 'Bioteknologi Modern: Rekayasa Genetika, Kloning, CRISPR-Cas9, dan Isu Bioetika Transgenik',
    semester: 2,
    deskripsiTP: 'Peserta didik mampu berargumen kritis mengenai regulasi pelepasan tanaman transgenik (GMO) dan perlindungan plasma nutfah.',
    rekomendasiModel: 'Socioscientific Issues (SSI) & Debat Ilmiah',
    alokasiWaktuDefault: '2 JP (2 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['crispr cas9', 'tanaman gmo', 'rekombinasi dna', 'bioetika modern']
  },

  // --- Fisika SMA Fase F ---
  {
    id: 'sma-fase-f-fis-k11-s1',
    jenjang: 'SMA',
    fase: 'Fase F',
    tingkat: 'Kelas 11',
    mataPelajaranKey: 'fisika',
    mataPelajaranName: 'Fisika',
    topik: 'Dinamika Rotasi Benda Tegar, Momen Inersia Silinder, dan Hukum Kekekalan Momentum Sudut',
    semester: 1,
    deskripsiTP: 'Peserta didik mampu memecahkan percepatan gerak menggelinding murni silinder pejal pada bidang miring bergesek.',
    rekomendasiModel: 'Problem Based Learning (PBL)',
    alokasiWaktuDefault: '2 JP (2 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['dinamika rotasi', 'momen inersia', 'torsi torsi', 'momentum sudut']
  },
  {
    id: 'sma-fase-f-fis-k11-s2',
    jenjang: 'SMA',
    fase: 'Fase F',
    tingkat: 'Kelas 11',
    mataPelajaranKey: 'fisika',
    mataPelajaranName: 'Fisika',
    topik: 'Termodinamika: Mesin Kalor Carnot, Efisiensi Siklus Gas Ideal, dan Hukum Entropi',
    semester: 2,
    deskripsiTP: 'Peserta didik dapat menghitung batas efisiensi teoritis maksimum mesin pendingin kulkas dan pembangkit tenaga uap.',
    rekomendasiModel: 'Inquiry Learning',
    alokasiWaktuDefault: '2 JP (2 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['siklus carnot', 'hukum termodinamika 2', 'entropi', 'efisiensi termal']
  },
  {
    id: 'sma-fase-f-fis-k12-s1',
    jenjang: 'SMA',
    fase: 'Fase F',
    tingkat: 'Kelas 12',
    mataPelajaranKey: 'fisika',
    mataPelajaranName: 'Fisika',
    topik: 'Induksi Elektromagnetik: Hukum Faraday, Hukum Lenz, dan Prinsip Kerja Generator Listrik AC/DC',
    semester: 1,
    deskripsiTP: 'Peserta didik dapat membuktikan timbulnya GGL induksi pada kumparan saat digerakkan dalam medan magnet fluks berubah.',
    rekomendasiModel: 'Inquiry Berbasis Praktikum',
    alokasiWaktuDefault: '2 JP (2 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['hukum faraday', 'hukum lenz', 'ggl induksi', 'generator listrik', 'transformator']
  },
  {
    id: 'sma-fase-f-fis-k12-s2',
    jenjang: 'SMA',
    fase: 'Fase F',
    tingkat: 'Kelas 12',
    mataPelajaranKey: 'fisika',
    mataPelajaranName: 'Fisika',
    topik: 'Fisika Kuantum: Efek Fotolistrik, Dualisme Gelombang-Partikel De Broglie, dan Foton Cahaya',
    semester: 2,
    deskripsiTP: 'Peserta didik mampu menganalisis hubungan frekuensi ambang cahaya terhadap energi kinetik elektron yang terlepas.',
    rekomendasiModel: 'Discovery Learning Berbantuan PhET Simulation',
    alokasiWaktuDefault: '2 JP (2 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['efek fotolistrik', 'foton', 'konstanta planck', 'dualisme cahaya']
  },

  // --- Kimia SMA Fase F ---
  {
    id: 'sma-fase-f-kim-k11-s1',
    jenjang: 'SMA',
    fase: 'Fase F',
    tingkat: 'Kelas 11',
    mataPelajaranKey: 'kimia',
    mataPelajaranName: 'Kimia',
    topik: 'Laju Reaksi dan Faktor Penentu (Konsentrasi, Suhu, Luas Permukaan, Katalis) serta Teori Tumbukan',
    semester: 1,
    deskripsiTP: 'Peserta didik terampil merancang percobaan tabung reaksi untuk menentukan orde reaksi dan energi aktivasi.',
    rekomendasiModel: 'Inquiry Learning Berbasis Laboratorium',
    alokasiWaktuDefault: '2 JP (2 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['laju reaksi', 'orde reaksi', 'teori tumbukan', 'energi aktivasi']
  },
  {
    id: 'sma-fase-f-kim-k11-s2',
    jenjang: 'SMA',
    fase: 'Fase F',
    tingkat: 'Kelas 11',
    mataPelajaranKey: 'kimia',
    mataPelajaranName: 'Kimia',
    topik: 'Kesetimbangan Kimia dan Pergeseran Arah Reaksi Berdasarkan Asas Le Chatelier pada Sintesis Industri',
    semester: 2,
    deskripsiTP: 'Peserta didik dapat memprediksi pergeseran kesetimbangan proses Haber-Bosch untuk memaksimalkan produksi amonia.',
    rekomendasiModel: 'Problem Based Learning (PBL)',
    alokasiWaktuDefault: '2 JP (2 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['kesetimbangan kimia', 'le chatelier', 'konstanta kc kp', 'sintesis amonia']
  },
  {
    id: 'sma-fase-f-kim-k12-s1',
    jenjang: 'SMA',
    fase: 'Fase F',
    tingkat: 'Kelas 12',
    mataPelajaranKey: 'kimia',
    mataPelajaranName: 'Kimia',
    topik: 'Elektrokimia: Sel Volta, Deret Potensial Reduksi Standar, Korosi Besi dan Proteksi Katodik',
    semester: 1,
    deskripsiTP: 'Peserta didik mampu menghitung potensial sel E sel serta merumuskan pencegahan karat kapal laut menggunakan anoda tumbal Mg.',
    rekomendasiModel: 'Project Based Learning (PjBL)',
    alokasiWaktuDefault: '2 JP (2 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['sel volta', 'korosi besi', 'proteksi katodik', 'deret volta', 'potensial sel']
  },

  // --- Matematika Tingkat Lanjut SMA Fase F ---
  {
    id: 'sma-fase-f-matlan-k11',
    jenjang: 'SMA',
    fase: 'Fase F',
    tingkat: 'Kelas 11',
    mataPelajaranKey: 'matematika tingkat lanjut',
    mataPelajaranName: 'Matematika Tingkat Lanjut',
    topik: 'Polinomial (Suku Banyak): Pembagian Horner, Teorema Sisa, dan Teorema Faktor',
    semester: 1,
    deskripsiTP: 'Peserta didik terampil menentukan akar-akar rasional persamaan polinomial berderajat tinggi dan memfaktorkannya.',
    rekomendasiModel: 'Problem Based Learning (PBL)',
    alokasiWaktuDefault: '2 JP (2 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['polinomial', 'metode horner', 'teorema sisa', 'akar persamaan suku banyak']
  },
  {
    id: 'sma-fase-f-matlan-k12',
    jenjang: 'SMA',
    fase: 'Fase F',
    tingkat: 'Kelas 12',
    mataPelajaranKey: 'matematika tingkat lanjut',
    mataPelajaranName: 'Matematika Tingkat Lanjut',
    topik: 'Kalkulus Diferensial dan Integral: Penerapan Turunan untuk Nilai Maksimum-Minimum Fungsi Aljabar',
    semester: 1,
    deskripsiTP: 'Peserta didik mampu menyelesaikan persoalan optimasi biaya minimum dan luas maksimum menggunakan turunan pertama.',
    rekomendasiModel: 'Discovery Learning',
    alokasiWaktuDefault: '2 JP (2 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['kalkulus', 'turunan fungsi', 'optimasi maksimum minimum', 'integral tentu']
  },

  // --- Ekonomi & Sosiologi SMA Fase F ---
  {
    id: 'sma-fase-f-eko-k11',
    jenjang: 'SMA',
    fase: 'Fase F',
    tingkat: 'Kelas 11',
    mataPelajaranKey: 'ekonomi',
    mataPelajaranName: 'Ekonomi',
    topik: 'Perhitungan Pendapatan Nasional (PDB, PNB, NNI) dan Kesenjangan Distribusi Pendapatan (Koefisien Gini)',
    semester: 1,
    deskripsiTP: 'Peserta didik dapat menghitung PDB metode pengeluaran dan mengevaluasi kurva Lorenz kemakmuran suatu negara.',
    rekomendasiModel: 'Inquiry Learning',
    alokasiWaktuDefault: '2 JP (2 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['pendapatan nasional', 'pdb pnb', 'koefisien gini', 'kurva lorenz']
  },
  {
    id: 'sma-fase-f-eko-k12',
    jenjang: 'SMA',
    fase: 'Fase F',
    tingkat: 'Kelas 12',
    mataPelajaranKey: 'ekonomi',
    mataPelajaranName: 'Ekonomi',
    topik: 'Kebijakan Moneter Bank Indonesia dan Kebijakan Fiskal dalam Menekan Inflasi serta Menjaga Stabilitas Rupiah',
    semester: 1,
    deskripsiTP: 'Peserta didik mampu mengevaluasi instrumen suku bunga BI-Rate, operasi pasar terbuka, dan pajak dalam stabilitas makro.',
    rekomendasiModel: 'Case Study & Problem Based Learning',
    alokasiWaktuDefault: '2 JP (2 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['kebijakan moneter', 'bi rate', 'kebijakan fiskal', 'inflasi']
  },
  {
    id: 'sma-fase-f-sos-k11',
    jenjang: 'SMA',
    fase: 'Fase F',
    tingkat: 'Kelas 11',
    mataPelajaranKey: 'sosiologi',
    mataPelajaranName: 'Sosiologi',
    topik: 'Permasalahan Sosial Akibat Eksklusi Sosial, Kemiskinan Struktural, dan Kriminalitas Perkotaan',
    semester: 1,
    deskripsiTP: 'Peserta didik mampu menganalisis akar masalah kesenjangan sosial ekonomi dan merumuskan advokasi pemberdayaan.',
    rekomendasiModel: 'Problem Based Learning (PBL)',
    alokasiWaktuDefault: '2 JP (2 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['kemiskinan struktural', 'eksklusi sosial', 'masalah sosial', 'pemberdayaan warga']
  },

  // =========================================================================
  // SMK - FASE E & FASE F (VOKASI & KEJURUAN)
  // Standar BSKAP 032/H/KR/2024
  // =========================================================================

  // --- Rekayasa Perangkat Lunak (RPL) SMK ---
  {
    id: 'smk-fase-e-rpl-k10',
    jenjang: 'SMK',
    fase: 'Fase E',
    tingkat: 'Kelas 10',
    mataPelajaranKey: 'dasar-dasar rekayasa perangkat lunak',
    mataPelajaranName: 'Dasar-dasar Rekayasa Perangkat Lunak',
    topik: 'Pemrograman Berorientasi Objek (OOP): Penerapan Class, Object, Method, dan Encapsulation',
    semester: 2,
    deskripsiTP: 'Peserta didik mampu membangun program konsol modular dengan memisahkan class data dan logika bisnis secara rapi.',
    rekomendasiModel: 'Project Based Learning (PjBL)',
    alokasiWaktuDefault: '3 JP (3 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['oop', 'class object', 'encapsulation', 'clean code']
  },
  {
    id: 'smk-fase-f-rpl-k11',
    jenjang: 'SMK',
    fase: 'Fase F',
    tingkat: 'Kelas 11',
    mataPelajaranKey: 'dasar-dasar rekayasa perangkat lunak',
    mataPelajaranName: 'Dasar-dasar Rekayasa Perangkat Lunak',
    topik: 'Pengembangan Aplikasi Web Modern: Membangun RESTful API Menggunakan Express.js dan TypeScript',
    semester: 1,
    deskripsiTP: 'Peserta didik terampil merancang arsitektur API CRUD terenkripsi dan mendokumentasikan endpoint menggunakan Postman/Swagger.',
    rekomendasiModel: 'Project Based Learning (PjBL)',
    alokasiWaktuDefault: '3 JP (3 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['rest api', 'express js', 'typescript', 'backend architecture']
  },

  // --- Teknik Komputer dan Jaringan (TJKT) SMK ---
  {
    id: 'smk-fase-e-tjkt-k10',
    jenjang: 'SMK',
    fase: 'Fase E',
    tingkat: 'Kelas 10',
    mataPelajaranKey: 'dasar-dasar teknik komputer dan jaringan',
    mataPelajaranName: 'Dasar-dasar Teknik Komputer dan Jaringan',
    topik: 'Pengkabelan Jaringan UTP (Crimping T568A/B), Pengujian Fluke Cable Tester, dan Topologi LAN',
    semester: 1,
    deskripsiTP: 'Peserta didik mampu mengcrimping kabel UTP straight dan crossover sesuai standar ISO dan menguji konektivitas ping.',
    rekomendasiModel: 'Praktik Langsung & Problem Solving',
    alokasiWaktuDefault: '4 JP (4 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['crimping rj45', 'kabel utp', 'topologi lan', 'fluke tester']
  },
  {
    id: 'smk-fase-f-tjkt-k11',
    jenjang: 'SMK',
    fase: 'Fase F',
    tingkat: 'Kelas 11',
    mataPelajaranKey: 'dasar-dasar teknik komputer dan jaringan',
    mataPelajaranName: 'Dasar-dasar Teknik Komputer dan Jaringan',
    topik: 'Konfigurasi Routing Dinamik OSPF dan Manajemen Bandwidth Menggunakan Router MikroTik RouterOS',
    semester: 1,
    deskripsiTP: 'Peserta didik mampu menghubungkan beberapa segmen jaringan inter-VLAN dan menerapkan Queue Simple bandwidth limit.',
    rekomendasiModel: 'Project Based Learning (PjBL)',
    alokasiWaktuDefault: '4 JP (4 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['mikrotik routeros', 'routing ospf', 'vlan', 'manajemen bandwidth']
  },

  // --- Teknik Otomotif SMK ---
  {
    id: 'smk-fase-e-oto-k10',
    jenjang: 'SMK',
    fase: 'Fase E',
    tingkat: 'Kelas 10',
    mataPelajaranKey: 'dasar-dasar teknik otomotif',
    mataPelajaranName: 'Dasar-dasar Teknik Otomotif',
    topik: 'Prinsip Kerja Motor Bakar 4 Tak (4 Langkah: Hisap, Kompresi, Usaha, Buang) dan K3 Bengkel',
    semester: 1,
    deskripsiTP: 'Peserta didik dapat menguraikan siklus termal mesin 4 tak dan menerapkan SOP keselamatan alat pelindung diri (APD).',
    rekomendasiModel: 'Praktik Bengkel & Demonstrasi Langsung',
    alokasiWaktuDefault: '4 JP (4 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['motor bakar 4 tak', 'k3 bengkel', 'torak silinder', 'katup klep']
  },

  // --- Akuntansi dan Manajemen Perkantoran SMK ---
  {
    id: 'smk-fase-e-akl-k10',
    jenjang: 'SMK',
    fase: 'Fase E',
    tingkat: 'Kelas 10',
    mataPelajaranKey: 'dasar-dasar akuntansi dan keuangan lembaga',
    mataPelajaranName: 'Dasar-dasar Akuntansi dan Keuangan Lembaga',
    topik: 'Persamaan Dasar Akuntansi (Harta = Utang + Modal) dan Penyusunan Jurnal Umum Transaksi',
    semester: 1,
    deskripsiTP: 'Peserta didik terampil mencatat bukti transaksi kuitansi dan nota ke dalam kolom debit-kredit jurnal umum secara seimbang.',
    rekomendasiModel: 'Drill & Problem Based Learning',
    alokasiWaktuDefault: '3 JP (3 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['persamaan akuntansi', 'jurnal umum', 'debit kredit', 'siklus akuntansi']
  },
  {
    id: 'smk-fase-e-mplb-k10',
    jenjang: 'SMK',
    fase: 'Fase E',
    tingkat: 'Kelas 10',
    mataPelajaranKey: 'dasar-dasar manajemen perkantoran',
    mataPelajaranName: 'Dasar-dasar Manajemen Perkantoran',
    topik: 'Pengelolaan Kearsipan Elektronik (E-Filing System) dan Korespondensi Surat Bisnis Resmi',
    semester: 1,
    deskripsiTP: 'Peserta didik mampu mengklasifikasikan surat masuk-keluar memakai sistem abjad/kronologis dan menyimpan arsip digital di Cloud.',
    rekomendasiModel: 'Project Based Learning (PjBL)',
    alokasiWaktuDefault: '3 JP (3 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['e-filing', 'kearsipan kantor', 'korespondensi surat', 'cloud storage']
  },

  // --- Projek Kreatif dan Kewirausahaan (PKK) SMK ---
  {
    id: 'smk-fase-f-pkk-k11',
    jenjang: 'SMK',
    fase: 'Fase F',
    tingkat: 'Kelas 11',
    mataPelajaranKey: 'produk kreatif dan kewirausahaan (pkk)',
    mataPelajaranName: 'Produk Kreatif dan Kewirausahaan (PKK)',
    topik: 'Perancangan Business Model Canvas (BMC) dan Analisis Kelayakan Usaha Titik Impas (Break Even Point / BEP)',
    semester: 1,
    deskripsiTP: 'Peserta didik mampu merumuskan 9 blok BMC untuk produk jasa/barang kejuruan serta menghitung biaya tetap dan variabel.',
    rekomendasiModel: 'Project Based Learning (PjBL)',
    alokasiWaktuDefault: '4 JP (4 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['business model canvas', 'bep break even point', 'kewirausahaan vokasi', 'proposisi nilai']
  },
  {
    id: 'smk-fase-f-pkk-k12',
    jenjang: 'SMK',
    fase: 'Fase F',
    tingkat: 'Kelas 12',
    mataPelajaranKey: 'produk kreatif dan kewirausahaan (pkk)',
    mataPelajaranName: 'Produk Kreatif dan Kewirausahaan (PKK)',
    topik: 'Pemasaran Digital (Digital Marketing) Melalui Media Sosial dan Pengurusan HKI / Merek Dagang',
    semester: 1,
    deskripsiTP: 'Peserta didik dapat membuat konten iklan promosi konversi tinggi dan memahami prosedur pendaftaran hak cipta ke DJKI.',
    rekomendasiModel: 'Project Based Learning (PjBL)',
    alokasiWaktuDefault: '4 JP (4 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['digital marketing', 'hki hak cipta', 'merek dagang', 'omset penjualan']
  }
];

/**
 * Filter topics dynamically by selected criteria:
 * Jenjang, Fase, Tingkat (Kelas), and Mata Pelajaran
 */
export function getContextualTopics(
  jenjang: Jenjang,
  fase: string,
  tingkat: string,
  mataPelajaran: string
): CurriculumTopicItem[] {
  const normMapel = (mataPelajaran || '').toLowerCase().trim();
  const normTingkat = (tingkat || '').toLowerCase().trim();
  const normFase = (fase || '').toLowerCase().trim();

  // Helper function to check if subject matches
  const isMapelMatch = (itemKey: string, itemName: string): boolean => {
    const k = itemKey.toLowerCase();
    const n = itemName.toLowerCase();

    // Exact or substring match
    if (normMapel.includes(k) || k.includes(normMapel)) return true;
    if (normMapel.includes(n) || n.includes(normMapel)) return true;

    // Domain-specific acronyms and keyword mappings
    if ((normMapel.includes('ipas') || normMapel.includes('alam & sosial')) && (k.includes('ipas') || k.includes('alam & sosial'))) return true;
    if (normMapel.includes('ipa') && !normMapel.includes('ipas') && k.includes('ipa') && !k.includes('ipas')) return true;
    if (normMapel.includes('ips') && k.includes('ips')) return true;
    if (normMapel.includes('matematika') && k.includes('matematika')) return true;
    if (normMapel.includes('pancasila') || normMapel.includes('pkn') || normMapel.includes('ppkn')) {
      return k.includes('pancasila') || k.includes('pkn');
    }
    if (normMapel.includes('indonesia') && k.includes('indonesia')) return true;
    if (normMapel.includes('inggris') && k.includes('inggris')) return true;
    if (normMapel.includes('biologi') && k.includes('biologi')) return true;
    if (normMapel.includes('fisika') && k.includes('fisika')) return true;
    if (normMapel.includes('kimia') && k.includes('kimia')) return true;
    if (normMapel.includes('ekonomi') && k.includes('ekonomi')) return true;
    if (normMapel.includes('sosiologi') && k.includes('sosiologi')) return true;
    if (normMapel.includes('geografi') && k.includes('geografi')) return true;
    if (normMapel.includes('sejarah') && k.includes('sejarah')) return true;
    if (normMapel.includes('informatika') && k.includes('informatika')) return true;
    if (normMapel.includes('pjok') || normMapel.includes('jasmani') || normMapel.includes('olahraga')) {
      return k.includes('pjok') || k.includes('jasmani');
    }
    if (normMapel.includes('seni') && (k.includes('seni') || k.includes('budaya'))) return true;
    if (normMapel.includes('agama') && (k.includes('agama') || k.includes('pai'))) return true;
    if (normMapel.includes('rpl') || normMapel.includes('perangkat lunak')) return k.includes('perangkat lunak');
    if (normMapel.includes('jaringan') || normMapel.includes('tjkt') || normMapel.includes('tkj')) {
      return k.includes('jaringan') || k.includes('komputer dan jaringan');
    }
    if (normMapel.includes('otomotif') || normMapel.includes('mesin')) {
      return k.includes('otomotif') || k.includes('mesin');
    }
    if (normMapel.includes('akuntansi') || normMapel.includes('akl')) return k.includes('akuntansi');
    if (normMapel.includes('perkantoran') || normMapel.includes('mplb')) return k.includes('perkantoran');
    if (normMapel.includes('kewirausahaan') || normMapel.includes('pkk')) return k.includes('kewirausahaan') || k.includes('pkk');

    return false;
  };

  // 1. Level 1: Match Jenjang + Specific Class (Tingkat) + Subject
  const level1Matches = CURRICULUM_TOPICS.filter(item => {
    if (item.jenjang !== jenjang) return false;
    const matchClass = item.tingkat.toLowerCase() === normTingkat;
    return matchClass && isMapelMatch(item.mataPelajaranKey, item.mataPelajaranName);
  });

  if (level1Matches.length > 0) {
    return level1Matches;
  }

  // 2. Level 2: Match Jenjang + Fase + Subject (e.g. Fase A covers Kelas 1 & 2)
  const level2Matches = CURRICULUM_TOPICS.filter(item => {
    if (item.jenjang !== jenjang) return false;
    const matchFase = item.fase.toLowerCase() === normFase;
    return matchFase && isMapelMatch(item.mataPelajaranKey, item.mataPelajaranName);
  });

  if (level2Matches.length > 0) {
    return level2Matches;
  }

  // 3. Level 3: Match Jenjang + Subject (any class in this jenjang)
  const level3Matches = CURRICULUM_TOPICS.filter(item => {
    if (item.jenjang !== jenjang) return false;
    return isMapelMatch(item.mataPelajaranKey, item.mataPelajaranName);
  });

  if (level3Matches.length > 0) {
    return level3Matches;
  }

  // 4. Level 4: Fallback return all topics for this specific Tingkat / Fase in this Jenjang
  const level4Matches = CURRICULUM_TOPICS.filter(item => {
    return item.jenjang === jenjang && (item.tingkat.toLowerCase() === normTingkat || item.fase.toLowerCase() === normFase);
  });

  if (level4Matches.length > 0) {
    return level4Matches.slice(0, 6);
  }

  // 5. Ultimate Fallback: topics in this Jenjang
  return CURRICULUM_TOPICS.filter(item => item.jenjang === jenjang).slice(0, 6);
}
