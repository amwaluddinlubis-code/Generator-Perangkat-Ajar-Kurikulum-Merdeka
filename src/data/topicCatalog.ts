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
  // Standar BSKAP 046/H/KR/2025
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
  // Standar BSKAP 046/H/KR/2025
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
  // Standar BSKAP 046/H/KR/2025
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
  // Standar BSKAP 046/H/KR/2025
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
  // Standar BSKAP 046/H/KR/2025
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
  // Standar BSKAP 046/H/KR/2025
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
  // Standar BSKAP 046/H/KR/2025
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
  },

  // =========================================================================
  // PENDIDIKAN AGAMA & BUDI PEKERTI — 6 agama, semua jenjang
  // Acuan: BKPDM 020 Tahun 2026 (revisi CP Lampiran II & V BSKAP 046/H/KR/2025):
  // iman-takwa, akhlak mulia, pengamalan nilai sehari-hari.
  // =========================================================================

  // --- PAI SD Fase B/C ---
  {
    id: 'sd-fase-b-pai-puasa-k3',
    jenjang: 'SD',
    fase: 'Fase B',
    tingkat: 'Kelas 3',
    mataPelajaranKey: 'pendidikan agama islam',
    mataPelajaranName: 'Pendidikan Agama Islam dan Budi Pekerti',
    topik: 'Rukun Islam dan Hikmah Puasa Ramadhan dalam Kehidupan Sehari-hari',
    semester: 2,
    deskripsiTP: 'Peserta didik dapat menyebutkan lima Rukun Islam serta menceritakan pengalaman berpuasa dan hikmah menahan diri.',
    rekomendasiModel: 'Contextual Teaching and Learning (CTL)',
    alokasiWaktuDefault: '2 JP (2 x 35 Menit) - 1 Pertemuan',
    kataKunci: ['rukun islam', 'puasa ramadhan', 'hikmah puasa', 'menahan diri']
  },
  {
    id: 'sd-fase-c-pai-nabi-k5',
    jenjang: 'SD',
    fase: 'Fase C',
    tingkat: 'Kelas 5',
    mataPelajaranKey: 'pendidikan agama islam',
    mataPelajaranName: 'Pendidikan Agama Islam dan Budi Pekerti',
    topik: 'Keteladanan Nabi Muhammad Saw.: Sidiq, Amanah, Tabligh, Fathanah',
    semester: 1,
    deskripsiTP: 'Peserta didik dapat meneladani empat sifat wajib rasul melalui contoh perilaku jujur dan amanah di sekolah.',
    rekomendasiModel: 'Cooperative Learning',
    alokasiWaktuDefault: '2 JP (2 x 35 Menit) - 1 Pertemuan',
    kataKunci: ['sifat rasul', 'sidiq amanah', 'keteladanan nabi', 'jujur']
  },
  // --- Kristen SD ---
  {
    id: 'sd-fase-a-pak-kristen-k1',
    jenjang: 'SD',
    fase: 'Fase A',
    tingkat: 'Kelas 1',
    mataPelajaranKey: 'pendidikan agama kristen',
    mataPelajaranName: 'Pendidikan Agama Kristen dan Budi Pekerti',
    topik: 'Allah Mengasihi Aku: Doa Sederhana dan Ucapan Syukur Setiap Hari',
    semester: 1,
    deskripsiTP: 'Peserta didik dapat berdoa sederhana dengan kalimat sendiri dan menyebut tiga berkat Tuhan setiap hari.',
    rekomendasiModel: 'Contextual Teaching and Learning (CTL)',
    alokasiWaktuDefault: '2 JP (2 x 35 Menit) - 1 Pertemuan',
    kataKunci: ['doa anak', 'ucapan syukur', 'kasih allah', 'berkat tuhan']
  },
  {
    id: 'sd-fase-b-pak-kristen-k4',
    jenjang: 'SD',
    fase: 'Fase B',
    tingkat: 'Kelas 4',
    mataPelajaranKey: 'pendidikan agama kristen',
    mataPelajaranName: 'Pendidikan Agama Kristen dan Budi Pekerti',
    topik: 'Sepuluh Perintah Allah dan Penerapannya: Hormat Orang Tua dan Sesama',
    semester: 2,
    deskripsiTP: 'Peserta didik dapat menjelaskan isi Sepuluh Perintah Allah serta memberi contoh hormat kepada orang tua di rumah.',
    rekomendasiModel: 'Discovery Learning',
    alokasiWaktuDefault: '2 JP (2 x 35 Menit) - 1 Pertemuan',
    kataKunci: ['sepuluh perintah', 'hormat orang tua', 'taurat', 'perilaku baik']
  },
  // --- Katolik SD ---
  {
    id: 'sd-fase-b-pak-katolik-k3',
    jenjang: 'SD',
    fase: 'Fase B',
    tingkat: 'Kelas 3',
    mataPelajaranKey: 'pendidikan agama katolik',
    mataPelajaranName: 'Pendidikan Agama Katolik dan Budi Pekerti',
    topik: 'Doa Salam Maria dan Teladan Bunda Maria yang Taat',
    semester: 1,
    deskripsiTP: 'Peserta didik dapat mendaraskan Doa Salam Maria dengan baik serta meneladani ketaatan Bunda Maria.',
    rekomendasiModel: 'Contextual Teaching and Learning (CTL)',
    alokasiWaktuDefault: '2 JP (2 x 35 Menit) - 1 Pertemuan',
    kataKunci: ['salam maria', 'bunda maria', 'doa katolik', 'ketaatan']
  },
  // --- Hindu SD ---
  {
    id: 'sd-fase-b-pak-hindu-k4',
    jenjang: 'SD',
    fase: 'Fase B',
    tingkat: 'Kelas 4',
    mataPelajaranKey: 'pendidikan agama hindu',
    mataPelajaranName: 'Pendidikan Agama Hindu dan Budi Pekerti',
    topik: 'Tri Hita Karana: Harmoni dengan Tuhan, Sesama, dan Alam',
    semester: 1,
    deskripsiTP: 'Peserta didik dapat menjelaskan tiga penyebab keharmonisan Tri Hita Karana dan memberi contoh menjaga kebersihan lingkungan.',
    rekomendasiModel: 'Contextual Teaching and Learning (CTL)',
    alokasiWaktuDefault: '2 JP (2 x 35 Menit) - 1 Pertemuan',
    kataKunci: ['tri hita karana', 'parahyangan pawongan palemahan', 'harmoni alam', 'kebersihan']
  },
  // --- Buddha SD ---
  {
    id: 'sd-fase-b-pak-buddha-k3',
    jenjang: 'SD',
    fase: 'Fase B',
    tingkat: 'Kelas 3',
    mataPelajaranKey: 'pendidikan agama buddha',
    mataPelajaranName: 'Pendidikan Agama Buddha dan Budi Pekerti',
    topik: 'Tri Ratna dan Kasih Sayang (Metta) kepada Semua Makhluk',
    semester: 2,
    deskripsiTP: 'Peserta didik dapat menyebut Tri Ratna serta menunjukkan perilaku metta seperti menyayangi hewan dan teman.',
    rekomendasiModel: 'Cooperative Learning',
    alokasiWaktuDefault: '2 JP (2 x 35 Menit) - 1 Pertemuan',
    kataKunci: ['tri ratna', 'buddha dhamma sangha', 'metta kasih sayang', 'menyayangi hewan']
  },
  // --- Khonghucu SD ---
  {
    id: 'sd-fase-b-pak-khonghucu-k4',
    jenjang: 'SD',
    fase: 'Fase B',
    tingkat: 'Kelas 4',
    mataPelajaranKey: 'pendidikan agama khonghucu',
    mataPelajaranName: 'Pendidikan Agama Khonghucu dan Budi Pekerti',
    topik: 'Xiao (Bakti) kepada Orang Tua dan Tata Krama (Li) Sehari-hari',
    semester: 1,
    deskripsiTP: 'Peserta didik dapat mempraktikkan bakti kepada orang tua dan tata krama Li saat makan serta berbicara dengan guru.',
    rekomendasiModel: 'Contextual Teaching and Learning (CTL)',
    alokasiWaktuDefault: '2 JP (2 x 35 Menit) - 1 Pertemuan',
    kataKunci: ['xiao bakti', 'li tata krama', 'hormat guru', 'nabi kongzi']
  },
  // --- Budi Pekerti generik SD ---
  {
    id: 'sd-fase-a-budi-jujur-k2',
    jenjang: 'SD',
    fase: 'Fase A',
    tingkat: 'Kelas 2',
    mataPelajaranKey: 'pendidikan agama',
    mataPelajaranName: 'Pendidikan Agama dan Budi Pekerti',
    topik: 'Jujur Itu Hebat: Berkata Benar di Rumah dan Sekolah',
    semester: 2,
    deskripsiTP: 'Peserta didik dapat membedakan perilaku jujur dan tidak jujur serta berani mengakui kesalahan.',
    rekomendasiModel: 'Contextual Teaching and Learning (CTL)',
    alokasiWaktuDefault: '2 JP (2 x 35 Menit) - 1 Pertemuan',
    kataKunci: ['jujur', 'berkata benar', 'mengakui kesalahan', 'akhlak']
  },
  {
    id: 'sd-fase-c-budi-toleransi-k6',
    jenjang: 'SD',
    fase: 'Fase C',
    tingkat: 'Kelas 6',
    mataPelajaranKey: 'pendidikan agama',
    mataPelajaranName: 'Pendidikan Agama dan Budi Pekerti',
    topik: 'Toleransi Beragama: Berteman dengan Siapa Saja dan Menghargai Perbedaan',
    semester: 1,
    deskripsiTP: 'Peserta didik dapat menunjukkan sikap toleran terhadap teman berbeda agama dalam kegiatan kelompok.',
    rekomendasiModel: 'Project Based Learning (PjBL)',
    alokasiWaktuDefault: '2 JP (2 x 35 Menit) - 1 Pertemuan',
    kataKunci: ['toleransi', 'kerukunan', 'menghargai perbedaan', 'bhinneka']
  },

  // --- Agama SMP Fase D ---
  {
    id: 'smp-fase-d-budi-amanah-k7',
    jenjang: 'SMP',
    fase: 'Fase D',
    tingkat: 'Kelas 7',
    mataPelajaranKey: 'pendidikan agama',
    mataPelajaranName: 'Pendidikan Agama dan Budi Pekerti',
    topik: 'Amanah dan Tanggung Jawab: Menjaga Titipan, Janji, dan Tugas Kelompok',
    semester: 1,
    deskripsiTP: 'Peserta didik dapat menganalisis makna amanah dan mempraktikkannya dalam tugas sekolah serta pergaulan.',
    rekomendasiModel: 'Problem Based Learning (PBL)',
    alokasiWaktuDefault: '2 JP (2 x 40 Menit) - 1 Pertemuan',
    kataKunci: ['amanah', 'tanggung jawab', 'menepati janji', 'integritas']
  },
  {
    id: 'smp-fase-d-budi-lingkungan-k8',
    jenjang: 'SMP',
    fase: 'Fase D',
    tingkat: 'Kelas 8',
    mataPelajaranKey: 'pendidikan agama',
    mataPelajaranName: 'Pendidikan Agama dan Budi Pekerti',
    topik: 'Merawat Bumi Amanah Tuhan: Aksi Nyata Peduli Lingkungan Sekolah',
    semester: 2,
    deskripsiTP: 'Peserta didik dapat merancang aksi peduli lingkungan sebagai wujud syukur dan tanggung jawab khalifah di bumi.',
    rekomendasiModel: 'Project Based Learning (PjBL)',
    alokasiWaktuDefault: '3 JP (3 x 40 Menit) - 1 Pertemuan',
    kataKunci: ['peduli lingkungan', 'khalifah bumi', 'syukur nikmat', 'aksi nyata']
  },
  {
    id: 'smp-fase-d-pai-ibadah-k7',
    jenjang: 'SMP',
    fase: 'Fase D',
    tingkat: 'Kelas 7',
    mataPelajaranKey: 'pendidikan agama islam',
    mataPelajaranName: 'Pendidikan Agama Islam dan Budi Pekerti',
    topik: 'Thaharah dan Tata Cara Salat Fardu serta Salat Berjamaah',
    semester: 1,
    deskripsiTP: 'Peserta didik dapat mempraktikkan thaharah dan gerakan-bacaan salat fardu dengan tertib serta salat berjamaah.',
    rekomendasiModel: 'Praktik Terbimbing',
    alokasiWaktuDefault: '3 JP (3 x 40 Menit) - 1 Pertemuan',
    kataKunci: ['thaharah wudu', 'salat fardu', 'salat berjamaah', 'gerakan salat']
  },
  {
    id: 'smp-fase-d-pak-kristen-kitab-k8',
    jenjang: 'SMP',
    fase: 'Fase D',
    tingkat: 'Kelas 8',
    mataPelajaranKey: 'pendidikan agama kristen',
    mataPelajaranName: 'Pendidikan Agama Kristen dan Budi Pekerti',
    topik: 'Alkitab Pedoman Hidup: Membaca, Memahami, dan Menerapkan Firman',
    semester: 2,
    deskripsiTP: 'Peserta didik dapat menggali makna satu perikop Alkitab dan menyusun komitmen penerapannya seminggu.',
    rekomendasiModel: 'Inquiry Learning',
    alokasiWaktuDefault: '2 JP (2 x 40 Menit) - 1 Pertemuan',
    kataKunci: ['alkitab', 'perikop', 'firman tuhan', 'saat teduh']
  },
  {
    id: 'smp-fase-d-pak-katolik-sakramen-k9',
    jenjang: 'SMP',
    fase: 'Fase D',
    tingkat: 'Kelas 9',
    mataPelajaranKey: 'pendidikan agama katolik',
    mataPelajaranName: 'Pendidikan Agama Katolik dan Budi Pekerti',
    topik: 'Sakramen Ekaristi: Persatuan Umat dan Perutusan Melayani',
    semester: 1,
    deskripsiTP: 'Peserta didik dapat menjelaskan makna Ekaristi sebagai sumber persatuan dan merancang aksi pelayanan sederhana.',
    rekomendasiModel: 'Problem Based Learning (PBL)',
    alokasiWaktuDefault: '2 JP (2 x 40 Menit) - 1 Pertemuan',
    kataKunci: ['ekaristi', 'komuni', 'pelayanan', 'persatuan umat']
  },
  {
    id: 'smp-fase-d-pak-hindu-yadnya-k8',
    jenjang: 'SMP',
    fase: 'Fase D',
    tingkat: 'Kelas 8',
    mataPelajaranKey: 'pendidikan agama hindu',
    mataPelajaranName: 'Pendidikan Agama Hindu dan Budi Pekerti',
    topik: 'Panca Yadnya dan Ketulusan Berkorban untuk Sesama',
    semester: 2,
    deskripsiTP: 'Peserta didik dapat menjelaskan lima jenis Yadnya dan memberi contoh pengorbanan tulus dalam kehidupan sehari-hari.',
    rekomendasiModel: 'Discovery Learning',
    alokasiWaktuDefault: '2 JP (2 x 40 Menit) - 1 Pertemuan',
    kataKunci: ['panca yadnya', 'dewa yadnya', 'pitra yadnya', 'berkorban tulus']
  },
  {
    id: 'smp-fase-d-pak-buddha-sila-k7',
    jenjang: 'SMP',
    fase: 'Fase D',
    tingkat: 'Kelas 7',
    mataPelajaranKey: 'pendidikan agama buddha',
    mataPelajaranName: 'Pendidikan Agama Buddha dan Budi Pekerti',
    topik: 'Panca Sila Buddhis sebagai Etika Hidup Remaja Digital',
    semester: 1,
    deskripsiTP: 'Peserta didik dapat mengaitkan lima sila Buddhis dengan etika bermedia sosial dan menjauhi perundungan.',
    rekomendasiModel: 'Problem Based Learning (PBL)',
    alokasiWaktuDefault: '2 JP (2 x 40 Menit) - 1 Pertemuan',
    kataKunci: ['panca sila buddhis', 'etika digital', 'anti perundungan', 'musyawarah']
  },
  {
    id: 'smp-fase-d-pak-khonghucu-junzi-k9',
    jenjang: 'SMP',
    fase: 'Fase D',
    tingkat: 'Kelas 9',
    mataPelajaranKey: 'pendidikan agama khonghucu',
    mataPelajaranName: 'Pendidikan Agama Khonghucu dan Budi Pekerti',
    topik: 'Junzi dan Delapan Kebajikan (Ba De): Jalan Hidup Berbudi Luhur',
    semester: 2,
    deskripsiTP: 'Peserta didik dapat menjelaskan profil Junzi dan mempraktikkan dua kebajikan Ba De dalam pergaulan.',
    rekomendasiModel: 'Inquiry Learning',
    alokasiWaktuDefault: '2 JP (2 x 40 Menit) - 1 Pertemuan',
    kataKunci: ['junzi', 'ba de delapan kebajikan', 'ren yi', 'budi luhur']
  },

  // --- Agama SMA Fase E/F ---
  {
    id: 'sma-fase-e-budi-kritis-k10',
    jenjang: 'SMA',
    fase: 'Fase E',
    tingkat: 'Kelas 10',
    mataPelajaranKey: 'pendidikan agama',
    mataPelajaranName: 'Pendidikan Agama dan Budi Pekerti',
    topik: 'Iman yang Berpikir Kritis: Menyikapi Hoaks dan Ujaran Kebencian Berbau SARA',
    semester: 1,
    deskripsiTP: 'Peserta didik dapat menganalisis berita bohong bernuansa SARA dengan nalar kritis berlandaskan nilai keagamaan.',
    rekomendasiModel: 'Problem Based Learning (PBL)',
    alokasiWaktuDefault: '2 JP (2 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['hoaks sara', 'ujaran kebencian', 'literasi digital', 'tabayyun verifikasi']
  },
  {
    id: 'sma-fase-f-budi-moderasi-k11',
    jenjang: 'SMA',
    fase: 'Fase F',
    tingkat: 'Kelas 11',
    mataPelajaranKey: 'pendidikan agama',
    mataPelajaranName: 'Pendidikan Agama dan Budi Pekerti',
    topik: 'Moderasi Beragama: Jalan Tengah, Toleran, dan Anti Kekerasan',
    semester: 2,
    deskripsiTP: 'Peserta didik dapat merumuskan sikap moderat beragama dan menolak segala bentuk ekstremisme kekerasan.',
    rekomendasiModel: 'Group Investigation',
    alokasiWaktuDefault: '2 JP (2 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['moderasi beragama', 'jalan tengah', 'anti ekstremisme', 'wasathiyah']
  },
  {
    id: 'sma-fase-e-pai-sains-k10',
    jenjang: 'SMA',
    fase: 'Fase E',
    tingkat: 'Kelas 10',
    mataPelajaranKey: 'pendidikan agama islam',
    mataPelajaranName: 'Pendidikan Agama Islam dan Budi Pekerti',
    topik: 'Islam dan Sains: Ayat-Ayat Kauniyah serta Etika Ilmuwan Muslim',
    semester: 2,
    deskripsiTP: 'Peserta didik dapat mengaitkan ayat kauniyah dengan penemuan sains dan meneladani etika ilmuwan muslim.',
    rekomendasiModel: 'Inquiry Learning',
    alokasiWaktuDefault: '2 JP (2 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['ayat kauniyah', 'islam dan sains', 'ilmuwan muslim', 'etika ilmu']
  },
  {
    id: 'sma-fase-f-pai-muamalah-k12',
    jenjang: 'SMA',
    fase: 'Fase F',
    tingkat: 'Kelas 12',
    mataPelajaranKey: 'pendidikan agama islam',
    mataPelajaranName: 'Pendidikan Agama Islam dan Budi Pekerti',
    topik: 'Muamalah dan Ekonomi Syariah: Jual Beli, Riba, dan Pinjaman Online',
    semester: 1,
    deskripsiTP: 'Peserta didik dapat menganalisis akad jual beli yang sah serta bahaya riba dan pinjol ilegal.',
    rekomendasiModel: 'Problem Based Learning (PBL)',
    alokasiWaktuDefault: '2 JP (2 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['muamalah', 'ekonomi syariah', 'riba pinjol', 'akad jual beli']
  },
  {
    id: 'sma-fase-e-pak-kristen-kasih-k10',
    jenjang: 'SMA',
    fase: 'Fase E',
    tingkat: 'Kelas 10',
    mataPelajaranKey: 'pendidikan agama kristen',
    mataPelajaranName: 'Pendidikan Agama Kristen dan Budi Pekerti',
    topik: 'Kasih Agape dalam Pergaulan: Persahabatan Sehat Tanpa Pergaulan Bebas',
    semester: 1,
    deskripsiTP: 'Peserta didik dapat membedakan kasih agape dari nafsu serta berkomitmen pada pergaulan sehat.',
    rekomendasiModel: 'Discovery Learning',
    alokasiWaktuDefault: '2 JP (2 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['kasih agape', 'pergaulan sehat', 'persahabatan', 'menolak pergaulan bebas']
  },
  {
    id: 'sma-fase-e-pak-katolik-sosial-k10',
    jenjang: 'SMA',
    fase: 'Fase E',
    tingkat: 'Kelas 10',
    mataPelajaranKey: 'pendidikan agama katolik',
    mataPelajaranName: 'Pendidikan Agama Katolik dan Budi Pekerti',
    topik: 'Ajaran Sosial Gereja: Keadilan, HAM, dan Keberpihakan pada Kaum Miskin',
    semester: 2,
    deskripsiTP: 'Peserta didik dapat menganalisis ketimpangan sosial dengan terang Ajaran Sosial Gereja dan aksi solidaritas.',
    rekomendasiModel: 'Project Based Learning (PjBL)',
    alokasiWaktuDefault: '3 JP (3 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['ajaran sosial gereja', 'keadilan sosial', 'ham', 'solidaritas miskin']
  },
  {
    id: 'sma-fase-e-pak-hindu-karma-k10',
    jenjang: 'SMA',
    fase: 'Fase E',
    tingkat: 'Kelas 10',
    mataPelajaranKey: 'pendidikan agama hindu',
    mataPelajaranName: 'Pendidikan Agama Hindu dan Budi Pekerti',
    topik: 'Karma Phala dan Tanggung Jawab Pilihan Hidup Remaja',
    semester: 1,
    deskripsiTP: 'Peserta didik dapat menjelaskan hukum Karma Phala dan mengaitkannya dengan tanggung jawab atas pilihan hidup.',
    rekomendasiModel: 'Inquiry Learning',
    alokasiWaktuDefault: '2 JP (2 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['karma phala', 'tanggung jawab', 'pilihan hidup', 'tri kaya parisudha']
  },
  {
    id: 'sma-fase-f-pak-buddha-meditasi-k11',
    jenjang: 'SMA',
    fase: 'Fase F',
    tingkat: 'Kelas 11',
    mataPelajaranKey: 'pendidikan agama buddha',
    mataPelajaranName: 'Pendidikan Agama Buddha dan Budi Pekerti',
    topik: 'Jalan Mulia Berunsur Delapan dan Meditasi Perhatian Murni untuk Kesehatan Mental',
    semester: 2,
    deskripsiTP: 'Peserta didik dapat mempraktikkan meditasi pernapasan sederhana untuk mengelola stres dan emosi.',
    rekomendasiModel: 'Praktik Terbimbing',
    alokasiWaktuDefault: '2 JP (2 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['jalan mulia berunsur delapan', 'meditasi mindfulness', 'kesehatan mental', 'mengelola stres']
  },
  {
    id: 'sma-fase-f-pak-khonghucu-li-k12',
    jenjang: 'SMA',
    fase: 'Fase F',
    tingkat: 'Kelas 12',
    mataPelajaranKey: 'pendidikan agama khonghucu',
    mataPelajaranName: 'Pendidikan Agama Khonghucu dan Budi Pekerti',
    topik: 'Li dan Etika Publik: Antri, Berlalu Lintas, dan Ruang Digital yang Beradab',
    semester: 1,
    deskripsiTP: 'Peserta didik dapat menerapkan Li dalam etika berlalu lintas dan berkomunikasi santun di ruang digital.',
    rekomendasiModel: 'Problem Based Learning (PBL)',
    alokasiWaktuDefault: '2 JP (2 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['li etika', 'tertib lalu lintas', 'santun digital', 'ruang publik']
  },

  // --- Agama SMK Fase E/F ---
  {
    id: 'smk-fase-e-budi-kerja-k10',
    jenjang: 'SMK',
    fase: 'Fase E',
    tingkat: 'Kelas 10',
    mataPelajaranKey: 'pendidikan agama',
    mataPelajaranName: 'Pendidikan Agama dan Budi Pekerti',
    topik: 'Etos Kerja Religius: Jujur, Disiplin, dan Amanah di Dunia Kerja',
    semester: 1,
    deskripsiTP: 'Peserta didik dapat mengaitkan nilai keagamaan dengan etos kerja jujur, disiplin, dan amanah di tempat PKL.',
    rekomendasiModel: 'Contextual Teaching and Learning (CTL)',
    alokasiWaktuDefault: '2 JP (2 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['etos kerja', 'jujur disiplin', 'amanah kerja', 'pkl magang']
  },
  {
    id: 'smk-fase-f-budi-profesi-k11',
    jenjang: 'SMK',
    fase: 'Fase F',
    tingkat: 'Kelas 11',
    mataPelajaranKey: 'pendidikan agama',
    mataPelajaranName: 'Pendidikan Agama dan Budi Pekerti',
    topik: 'Integritas Profesi: Menolak Korupsi, Gratifikasi, dan Kecurangan Kerja',
    semester: 2,
    deskripsiTP: 'Peserta didik dapat menganalisis kasus korupsi dan gratifikasi serta berkomitmen pada integritas profesi.',
    rekomendasiModel: 'Problem Based Learning (PBL)',
    alokasiWaktuDefault: '2 JP (2 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['integritas', 'anti korupsi', 'gratifikasi', 'etika profesi']
  },
  {
    id: 'smk-fase-e-pai-akhlak-k10',
    jenjang: 'SMK',
    fase: 'Fase E',
    tingkat: 'Kelas 10',
    mataPelajaranKey: 'pendidikan agama islam',
    mataPelajaranName: 'Pendidikan Agama Islam dan Budi Pekerti',
    topik: 'Akhlak Mahmudah di Bengkel dan Lab: Sabar, Teliti, dan Menjaga Amanah Alat',
    semester: 2,
    deskripsiTP: 'Peserta didik dapat mempraktikkan akhlak mahmudah seperti sabar, teliti, dan amanah saat praktik kejuruan.',
    rekomendasiModel: 'Praktik Terbimbing',
    alokasiWaktuDefault: '2 JP (2 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['akhlak mahmudah', 'sabar teliti', 'praktik bengkel', 'amanah alat']
  },
  {
    id: 'smk-fase-e-pak-kristen-pelayanan-k10',
    jenjang: 'SMK',
    fase: 'Fase E',
    tingkat: 'Kelas 10',
    mataPelajaranKey: 'pendidikan agama kristen',
    mataPelajaranName: 'Pendidikan Agama Kristen dan Budi Pekerti',
    topik: 'Melayani dengan Kasih: Pelayanan Prima Berbasis Nilai Kristiani di Dunia Kerja',
    semester: 2,
    deskripsiTP: 'Peserta didik dapat menerapkan kasih dalam pelayanan prima kepada pelanggan dan rekan kerja.',
    rekomendasiModel: 'Contextual Teaching and Learning (CTL)',
    alokasiWaktuDefault: '2 JP (2 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['pelayanan prima', 'kasih kristiani', 'pelanggan', 'dunia kerja']
  },
  {
    id: 'smk-fase-e-pak-katolik-kejujuran-k10',
    jenjang: 'SMK',
    fase: 'Fase E',
    tingkat: 'Kelas 10',
    mataPelajaranKey: 'pendidikan agama katolik',
    mataPelajaranName: 'Pendidikan Agama Katolik dan Budi Pekerti',
    topik: 'Kejujuran Hati Nurani: Menolak Manipulasi Data dan Laporan Kerja',
    semester: 1,
    deskripsiTP: 'Peserta didik dapat menjelaskan suara hati nurani dan menolak manipulasi data serta laporan kerja.',
    rekomendasiModel: 'Problem Based Learning (PBL)',
    alokasiWaktuDefault: '2 JP (2 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['hati nurani', 'kejujuran', 'manipulasi data', 'laporan kerja']
  },
  {
    id: 'smk-fase-e-pak-hindu-dharma-k10',
    jenjang: 'SMK',
    fase: 'Fase E',
    tingkat: 'Kelas 10',
    mataPelajaranKey: 'pendidikan agama hindu',
    mataPelajaranName: 'Pendidikan Agama Hindu dan Budi Pekerti',
    topik: 'Dharma dalam Bekerja: Tanggung Jawab, Disiplin, dan Cinta Produk Berkualitas',
    semester: 1,
    deskripsiTP: 'Peserta didik dapat melaksanakan swadharma di tempat kerja dengan disiplin dan standar mutu.',
    rekomendasiModel: 'Contextual Teaching and Learning (CTL)',
    alokasiWaktuDefault: '2 JP (2 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['dharma bekerja', 'swadharma', 'disiplin mutu', 'tanggung jawab']
  },
  {
    id: 'smk-fase-e-pak-buddha-samma-k10',
    jenjang: 'SMK',
    fase: 'Fase E',
    tingkat: 'Kelas 10',
    mataPelajaranKey: 'pendidikan agama buddha',
    mataPelajaranName: 'Pendidikan Agama Buddha dan Budi Pekerti',
    topik: 'Samma Ajiva: Mata Pencaharian Benar dan Menolak Pekerjaan Tercela',
    semester: 2,
    deskripsiTP: 'Peserta didik dapat menjelaskan mata pencaharian benar dan menolak pekerjaan yang merugikan makhluk lain.',
    rekomendasiModel: 'Inquiry Learning',
    alokasiWaktuDefault: '2 JP (2 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['samma ajiva', 'mata pencaharian benar', 'pekerjaan tercela', 'sila']
  },
  {
    id: 'smk-fase-e-pak-khonghucu-xin-k10',
    jenjang: 'SMK',
    fase: 'Fase E',
    tingkat: 'Kelas 10',
    mataPelajaranKey: 'pendidikan agama khonghucu',
    mataPelajaranName: 'Pendidikan Agama Khonghucu dan Budi Pekerti',
    topik: 'Xin (Dapat Dipercaya): Kredibilitas Teknisi di Mata Pelanggan dan Atasan',
    semester: 2,
    deskripsiTP: 'Peserta didik dapat membangun kredibilitas melalui kejujuran, ketepatan janji, dan kualitas hasil kerja.',
    rekomendasiModel: 'Problem Based Learning (PBL)',
    alokasiWaktuDefault: '2 JP (2 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['xin dipercaya', 'kredibilitas teknisi', 'tepat janji', 'kualitas kerja']
  },

  // =========================================================================
  // MAPEL UMUM — SD (Seni Musik, Seni Tari, Bahasa Inggris)
  // =========================================================================
  {
    id: 'sd-fase-a-musik-ritme-k1',
    jenjang: 'SD',
    fase: 'Fase A',
    tingkat: 'Kelas 1',
    mataPelajaranKey: 'seni musik',
    mataPelajaranName: 'Seni Musik',
    topik: 'Bunyi Kuat-Lemah dan Panjang-Pendek: Bernyanyi Sambil Bertepuk Tangan',
    semester: 1,
    deskripsiTP: 'Peserta didik dapat membedakan bunyi kuat-lemah dan panjang-pendek serta menyanyikan lagu anak dengan tepukan ritmis.',
    rekomendasiModel: 'Praktik Terbimbing',
    alokasiWaktuDefault: '2 JP (2 x 35 Menit) - 1 Pertemuan',
    kataKunci: ['bunyi kuat lemah', 'ritme tepukan', 'lagu anak', 'panjang pendek nada']
  },
  {
    id: 'sd-fase-c-musik-lagu-k5',
    jenjang: 'SD',
    fase: 'Fase C',
    tingkat: 'Kelas 5',
    mataPelajaranKey: 'seni musik',
    mataPelajaranName: 'Seni Musik',
    topik: 'Lagu Wajib dan Lagu Daerah: Menyanyikan Indonesia Raya dan Satu Lagu Daerah dengan Tepat',
    semester: 2,
    deskripsiTP: 'Peserta didik dapat menyanyikan lagu wajib dan satu lagu daerah dengan tempo, tinggi nada, dan penghayatan yang tepat.',
    rekomendasiModel: 'Praktik Terbimbing',
    alokasiWaktuDefault: '2 JP (2 x 35 Menit) - 1 Pertemuan',
    kataKunci: ['lagu wajib', 'lagu daerah', 'indonesia raya', 'tempo nada']
  },
  {
    id: 'sd-fase-a-tari-gerak-k1',
    jenjang: 'SD',
    fase: 'Fase A',
    tingkat: 'Kelas 1',
    mataPelajaranKey: 'seni tari',
    mataPelajaranName: 'Seni Tari / Teater',
    topik: 'Gerak Alam Sekitar: Menirukan Gerak Hewan dan Tumbuhan Berirama',
    semester: 2,
    deskripsiTP: 'Peserta didik dapat menirukan gerak hewan dan tumbuhan mengikuti irama musik sederhana.',
    rekomendasiModel: 'Praktik Terbimbing',
    alokasiWaktuDefault: '2 JP (2 x 35 Menit) - 1 Pertemuan',
    kataKunci: ['gerak tari', 'menirukan hewan', 'gerak berirama', 'motorik kasar']
  },
  {
    id: 'sd-fase-c-tari-nusantara-k6',
    jenjang: 'SD',
    fase: 'Fase C',
    tingkat: 'Kelas 6',
    mataPelajaranKey: 'seni tari',
    mataPelajaranName: 'Seni Tari / Teater',
    topik: 'Tari Nusantara Sederhana: Gerak Dasar Tari Daerah Setempat',
    semester: 1,
    deskripsiTP: 'Peserta didik dapat memperagakan rangkaian gerak dasar satu tari daerah setempat dengan kompak.',
    rekomendasiModel: 'Project Based Learning (PjBL)',
    alokasiWaktuDefault: '3 JP (3 x 35 Menit) - 1 Pertemuan',
    kataKunci: ['tari nusantara', 'tari daerah', 'gerak dasar tari', 'kekompakan']
  },
  {
    id: 'sd-fase-a-inggris-greeting-k2',
    jenjang: 'SD',
    fase: 'Fase A',
    tingkat: 'Kelas 2',
    mataPelajaranKey: 'bahasa inggris',
    mataPelajaranName: 'Bahasa Inggris',
    topik: 'Greeting and Introduction: Menyapa dan Memperkenalkan Diri dalam Bahasa Inggris',
    semester: 1,
    deskripsiTP: 'Peserta didik dapat mengucapkan sapaan dan memperkenalkan nama, umur, serta asal dengan percaya diri.',
    rekomendasiModel: 'Contextual Teaching and Learning (CTL)',
    alokasiWaktuDefault: '2 JP (2 x 35 Menit) - 1 Pertemuan',
    kataKunci: ['greeting', 'introduction', 'my name is', 'perkenalan diri']
  },
  {
    id: 'sd-fase-c-inggris-animals-k5',
    jenjang: 'SD',
    fase: 'Fase C',
    tingkat: 'Kelas 5',
    mataPelajaranKey: 'bahasa inggris',
    mataPelajaranName: 'Bahasa Inggris',
    topik: 'Animals Around Us: Kosakata Hewan, Habitat, dan Kalimat Simple Present Tense',
    semester: 2,
    deskripsiTP: 'Peserta didik dapat menyebutkan kosakata hewan dan habitatnya serta menyusun kalimat simple present tense sederhana.',
    rekomendasiModel: 'Discovery Learning',
    alokasiWaktuDefault: '2 JP (2 x 35 Menit) - 1 Pertemuan',
    kataKunci: ['animals vocabulary', 'habitat', 'simple present tense', 'kosakata hewan']
  },

  // =========================================================================
  // MAPEL UMUM — SMP (PJOK, Seni Budaya, Prakarya)
  // =========================================================================
  {
    id: 'smp-fase-d-pjok-atletik-k7',
    jenjang: 'SMP',
    fase: 'Fase D',
    tingkat: 'Kelas 7',
    mataPelajaranKey: 'pjok',
    mataPelajaranName: 'PJOK',
    topik: 'Atletik Dasar: Teknik Start, Lari Jarak Pendek, dan Tolak Peluru Gaya Ortodoks',
    semester: 1,
    deskripsiTP: 'Peserta didik dapat mempraktikkan teknik start jongkok, lari 60 meter, dan tolak peluru dengan postur benar.',
    rekomendasiModel: 'Praktik Terbimbing',
    alokasiWaktuDefault: '3 JP (3 x 40 Menit) - 1 Pertemuan',
    kataKunci: ['atletik', 'start jongkok', 'lari jarak pendek', 'tolak peluru']
  },
  {
    id: 'smp-fase-d-pjok-bola-k8',
    jenjang: 'SMP',
    fase: 'Fase D',
    tingkat: 'Kelas 8',
    mataPelajaranKey: 'pjok',
    mataPelajaranName: 'PJOK',
    topik: 'Permainan Bola Besar: Passing, Dribbling, dan Kerja Sama Tim Sepak Bola',
    semester: 2,
    deskripsiTP: 'Peserta didik dapat mempraktikkan passing, dribbling, dan strategi kerja sama tim dalam permainan sepak bola.',
    rekomendasiModel: 'Cooperative Learning',
    alokasiWaktuDefault: '3 JP (3 x 40 Menit) - 1 Pertemuan',
    kataKunci: ['sepak bola', 'passing dribbling', 'kerja sama tim', 'bola besar']
  },
  {
    id: 'smp-fase-d-seni-musik-k7',
    jenjang: 'SMP',
    fase: 'Fase D',
    tingkat: 'Kelas 7',
    mataPelajaranKey: 'seni dan budaya',
    mataPelajaranName: 'Seni dan Budaya',
    topik: 'Notasi Balok dan Tangga Nada: Membaca Partitur Lagu Sederhana dan Memainkannya',
    semester: 1,
    deskripsiTP: 'Peserta didik dapat membaca notasi balok tangga nada C mayor dan memainkannya dengan pianika atau gitar.',
    rekomendasiModel: 'Praktik Terbimbing',
    alokasiWaktuDefault: '2 JP (2 x 40 Menit) - 1 Pertemuan',
    kataKunci: ['notasi balok', 'tangga nada', 'partitur', 'pianika gitar']
  },
  {
    id: 'smp-fase-d-seni-rupa-k8',
    jenjang: 'SMP',
    fase: 'Fase D',
    tingkat: 'Kelas 8',
    mataPelajaranKey: 'seni dan budaya',
    mataPelajaranName: 'Seni dan Budaya',
    topik: 'Menggambar Ilustrasi dan Komik Edukasi dengan Prinsip Komposisi',
    semester: 2,
    deskripsiTP: 'Peserta didik dapat membuat komik edukasi dua halaman dengan komposisi, proporsi, dan pewarnaan yang baik.',
    rekomendasiModel: 'Project Based Learning (PjBL)',
    alokasiWaktuDefault: '3 JP (3 x 40 Menit) - 1 Pertemuan',
    kataKunci: ['menggambar ilustrasi', 'komik edukasi', 'komposisi', 'pewarnaan']
  },
  {
    id: 'smp-fase-d-prakarya-kerajinan-k7',
    jenjang: 'SMP',
    fase: 'Fase D',
    tingkat: 'Kelas 7',
    mataPelajaranKey: 'prakarya',
    mataPelajaranName: 'Prakarya (Kerajinan, Rekayasa, Budidaya, Pengolahan)',
    topik: 'Kerajinan Bahan Alam: Anyaman Bambu dan Eceng Gondok Bernilai Jual',
    semester: 1,
    deskripsiTP: 'Peserta didik dapat membuat produk anyaman dari bahan alam dengan teknik dasar dan finishing rapi.',
    rekomendasiModel: 'Project Based Learning (PjBL)',
    alokasiWaktuDefault: '3 JP (3 x 40 Menit) - 1 Pertemuan',
    kataKunci: ['kerajinan anyaman', 'bahan alam', 'bambu eceng gondok', 'produk jual']
  },
  {
    id: 'smp-fase-d-prakarya-budidaya-k9',
    jenjang: 'SMP',
    fase: 'Fase D',
    tingkat: 'Kelas 9',
    mataPelajaranKey: 'prakarya',
    mataPelajaranName: 'Prakarya (Kerajinan, Rekayasa, Budidaya, Pengolahan)',
    topik: 'Budidaya Tanaman Hidroponik Sederhana dan Pembukuan Hasil Panen',
    semester: 2,
    deskripsiTP: 'Peserta didik dapat merakit instalasi hidroponik wick system, merawat tanaman, dan mencatat hasil panen.',
    rekomendasiModel: 'Project Based Learning (PjBL)',
    alokasiWaktuDefault: '4 JP (4 x 40 Menit) - 2 Pertemuan',
    kataKunci: ['hidroponik', 'budidaya tanaman', 'wick system', 'panen']
  },

  // =========================================================================
  // MAPEL UMUM — SMA (B. Indonesia, B. Inggris, Informatika, Pancasila, PJOK, Seni)
  // =========================================================================
  {
    id: 'sma-fase-e-bindo-teks-k10',
    jenjang: 'SMA',
    fase: 'Fase E',
    tingkat: 'Kelas 10',
    mataPelajaranKey: 'bahasa indonesia',
    mataPelajaranName: 'Bahasa Indonesia',
    topik: 'Teks Eksposisi dan Argumentasi: Struktur, Kaidah, dan Menulis Tajuk Rencana',
    semester: 1,
    deskripsiTP: 'Peserta didik dapat menganalisis struktur teks eksposisi dan menulis tajuk rencana 300 kata dengan argumen logis.',
    rekomendasiModel: 'Genre-Based Approach',
    alokasiWaktuDefault: '3 JP (3 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['teks eksposisi', 'tajuk rencana', 'argumentasi', 'kaidah kebahasaan']
  },
  {
    id: 'sma-fase-f-bindo-karya-k11',
    jenjang: 'SMA',
    fase: 'Fase F',
    tingkat: 'Kelas 11',
    mataPelajaranKey: 'bahasa indonesia',
    mataPelajaranName: 'Bahasa Indonesia',
    topik: 'Karya Ilmiah dan Proposal Penelitian: Sistematika, Kutipan, dan Daftar Pustaka',
    semester: 2,
    deskripsiTP: 'Peserta didik dapat menyusun proposal penelitian sederhana dengan sistematika, kutipan, dan daftar pustaka yang benar.',
    rekomendasiModel: 'Project Based Learning (PjBL)',
    alokasiWaktuDefault: '4 JP (4 x 45 Menit) - 2 Pertemuan',
    kataKunci: ['karya ilmiah', 'proposal penelitian', 'kutipan daftar pustaka', 'sistematika']
  },
  {
    id: 'sma-fase-e-binggris-descriptive-k10',
    jenjang: 'SMA',
    fase: 'Fase E',
    tingkat: 'Kelas 10',
    mataPelajaranKey: 'bahasa inggris',
    mataPelajaranName: 'Bahasa Inggris',
    topik: 'Descriptive Text: Mendeskripsikan Orang, Tempat Wisata, dan Benda Bersejarah',
    semester: 1,
    deskripsiTP: 'Peserta didik dapat menulis descriptive text 150 kata dengan identification-description dan simple present tense tepat.',
    rekomendasiModel: 'Genre-Based Approach',
    alokasiWaktuDefault: '2 JP (2 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['descriptive text', 'identification description', 'tourism places', 'simple present']
  },
  {
    id: 'sma-fase-f-binggris-discussion-k12',
    jenjang: 'SMA',
    fase: 'Fase F',
    tingkat: 'Kelas 12',
    mataPelajaranKey: 'bahasa inggris',
    mataPelajaranName: 'Bahasa Inggris',
    topik: 'Discussion Text dan Debat Mini: Pro-Kontra Media Sosial bagi Remaja',
    semester: 1,
    deskripsiTP: 'Peserta didik dapat menyusun discussion text dan melakukan debat mini dengan argumen serta rebuttal terstruktur.',
    rekomendasiModel: 'Cooperative Learning',
    alokasiWaktuDefault: '3 JP (3 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['discussion text', 'debat mini', 'pro kontra', 'rebuttal argument']
  },
  {
    id: 'sma-fase-e-informatika-algoritma-k10',
    jenjang: 'SMA',
    fase: 'Fase E',
    tingkat: 'Kelas 10',
    mataPelajaranKey: 'informatika',
    mataPelajaranName: 'Informatika',
    topik: 'Berpikir Komputasional: Dekomposisi, Abstraksi, dan Algoritma Flowchart',
    semester: 1,
    deskripsiTP: 'Peserta didik dapat memecah masalah menjadi langkah algoritmik dan menggambarkannya dalam flowchart.',
    rekomendasiModel: 'Discovery Learning',
    alokasiWaktuDefault: '2 JP (2 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['berpikir komputasional', 'algoritma flowchart', 'dekomposisi abstraksi', 'logika']
  },
  {
    id: 'sma-fase-f-informatika-python-k11',
    jenjang: 'SMA',
    fase: 'Fase F',
    tingkat: 'Kelas 11',
    mataPelajaranKey: 'informatika',
    mataPelajaranName: 'Informatika',
    topik: 'Pemrograman Python Dasar: Variabel, Percabangan, dan Perulangan untuk Studi Kasus',
    semester: 2,
    deskripsiTP: 'Peserta didik dapat menulis program Python dengan variabel, if-else, dan loop untuk menyelesaikan studi kasus.',
    rekomendasiModel: 'Project Based Learning (PjBL)',
    alokasiWaktuDefault: '4 JP (4 x 45 Menit) - 2 Pertemuan',
    kataKunci: ['python dasar', 'variabel percabangan', 'perulangan loop', 'coding']
  },
  {
    id: 'sma-fase-e-ppancasila-pancasila-k10',
    jenjang: 'SMA',
    fase: 'Fase E',
    tingkat: 'Kelas 10',
    mataPelajaranKey: 'pendidikan pancasila',
    mataPelajaranName: 'Pendidikan Pancasila',
    topik: 'Pancasila sebagai Ideologi Terbuka dan Dinamika Penerapannya Era Digital',
    semester: 2,
    deskripsiTP: 'Peserta didik dapat menganalisis Pancasila sebagai ideologi terbuka serta tantangannya di era digital.',
    rekomendasiModel: 'Inquiry Learning',
    alokasiWaktuDefault: '2 JP (2 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['pancasila ideologi terbuka', 'dinamika pancasila', 'era digital', 'pengamalan sila']
  },
  {
    id: 'sma-fase-e-pjok-voli-k10',
    jenjang: 'SMA',
    fase: 'Fase E',
    tingkat: 'Kelas 10',
    mataPelajaranKey: 'pjok',
    mataPelajaranName: 'PJOK',
    topik: 'Bola Voli: Passing Atas-Bawah, Servis, dan Pola Penyerangan 4-2',
    semester: 1,
    deskripsiTP: 'Peserta didik dapat mempraktikkan passing atas-bawah, servis bawah, dan pola penyerangan sederhana.',
    rekomendasiModel: 'Praktik Terbimbing',
    alokasiWaktuDefault: '3 JP (3 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['bola voli', 'passing atas bawah', 'servis', 'pola penyerangan']
  },
  {
    id: 'sma-fase-f-pjok-kebugaran-k11',
    jenjang: 'SMA',
    fase: 'Fase F',
    tingkat: 'Kelas 11',
    mataPelajaranKey: 'pjok',
    mataPelajaranName: 'PJOK',
    topik: 'Kebugaran Jasmani dan Pola Hidup Sehat: Tes Kebugaran dan Program Latihan Pribadi',
    semester: 2,
    deskripsiTP: 'Peserta didik dapat melakukan tes kebugaran dan menyusun program latihan pribadi berbasis hasil tes.',
    rekomendasiModel: 'Discovery Learning',
    alokasiWaktuDefault: '3 JP (3 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['kebugaran jasmani', 'tes kebugaran', 'pola hidup sehat', 'program latihan']
  },
  {
    id: 'sma-fase-e-seni-teater-k10',
    jenjang: 'SMA',
    fase: 'Fase E',
    tingkat: 'Kelas 10',
    mataPelajaranKey: 'seni budaya',
    mataPelajaranName: 'Seni Budaya & Keterampilan',
    topik: 'Teater Modern: Olah Tubuh, Olah Vokal, dan Pementasan Naskah Pendek',
    semester: 2,
    deskripsiTP: 'Peserta didik dapat melakukan olah tubuh-vokal dan mementaskan naskah pendek secara berkelompok.',
    rekomendasiModel: 'Project Based Learning (PjBL)',
    alokasiWaktuDefault: '4 JP (4 x 45 Menit) - 2 Pertemuan',
    kataKunci: ['teater modern', 'olah tubuh vokal', 'pementasan naskah', 'akting']
  },
  {
    id: 'sma-fase-f-seni-musik-k11',
    jenjang: 'SMA',
    fase: 'Fase F',
    tingkat: 'Kelas 11',
    mataPelajaranKey: 'seni budaya',
    mataPelajaranName: 'Seni Budaya & Keterampilan',
    topik: 'Aransemen Musik Ansambel: Mengaransemen Lagu Populer untuk Pentas Sekolah',
    semester: 1,
    deskripsiTP: 'Peserta didik dapat mengaransemen lagu populer untuk ansambel kelas dan menampilkannya di pentas.',
    rekomendasiModel: 'Project Based Learning (PjBL)',
    alokasiWaktuDefault: '4 JP (4 x 45 Menit) - 2 Pertemuan',
    kataKunci: ['aransemen musik', 'ansambel', 'pentas sekolah', 'lagu populer']
  },

  // =========================================================================
  // MAPEL UMUM SMK + PENGAYAAN MAPEL KEJURUAN
  // =========================================================================
  {
    id: 'smk-fase-e-mtk-trigonometri-k10',
    jenjang: 'SMK',
    fase: 'Fase E',
    tingkat: 'Kelas 10',
    mataPelajaranKey: 'matematika terapan',
    mataPelajaranName: 'Matematika Terapan',
    topik: 'Trigonometri Terapan: Menghitung Ketinggian dan Sudut pada Gambar Teknik',
    semester: 1,
    deskripsiTP: 'Peserta didik dapat menerapkan sinus, cosinus, dan tangen untuk menghitung ukuran pada gambar teknik kejuruan.',
    rekomendasiModel: 'Problem Based Learning (PBL)',
    alokasiWaktuDefault: '3 JP (3 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['trigonometri terapan', 'sinus cosinus', 'gambar teknik', 'sudut ketinggian']
  },
  {
    id: 'smk-fase-e-mtk-statistika-k10',
    jenjang: 'SMK',
    fase: 'Fase E',
    tingkat: 'Kelas 10',
    mataPelajaranKey: 'matematika terapan',
    mataPelajaranName: 'Matematika Terapan',
    topik: 'Statistika Terapan: Mean, Median, Modus Data Hasil Praktik Bengkel',
    semester: 2,
    deskripsiTP: 'Peserta didik dapat mengolah data hasil praktik menjadi tabel, diagram, dan ukuran pemusatan data.',
    rekomendasiModel: 'Discovery Learning',
    alokasiWaktuDefault: '3 JP (3 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['statistika terapan', 'mean median modus', 'diagram data', 'data praktik']
  },
  {
    id: 'smk-fase-e-bindo-lamaran-k10',
    jenjang: 'SMK',
    fase: 'Fase E',
    tingkat: 'Kelas 10',
    mataPelajaranKey: 'bahasa indonesia',
    mataPelajaranName: 'Bahasa Indonesia',
    topik: 'Surat Lamaran Pekerjaan dan CV ATS-Friendly untuk Dunia Kerja',
    semester: 1,
    deskripsiTP: 'Peserta didik dapat menulis surat lamaran dan CV sesuai standar rekrutmen industri.',
    rekomendasiModel: 'Project Based Learning (PjBL)',
    alokasiWaktuDefault: '3 JP (3 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['surat lamaran kerja', 'cv ats', 'rekrutmen industri', 'wawancara kerja']
  },
  {
    id: 'smk-fase-e-bindo-laporan-k10',
    jenjang: 'SMK',
    fase: 'Fase E',
    tingkat: 'Kelas 10',
    mataPelajaranKey: 'bahasa indonesia',
    mataPelajaranName: 'Bahasa Indonesia',
    topik: 'Laporan Praktik Kerja Lapangan (PKL): Sistematika dan Presentasi Hasil',
    semester: 2,
    deskripsiTP: 'Peserta didik dapat menyusun laporan PKL sistematis dan mempresentasikannya dengan percaya diri.',
    rekomendasiModel: 'Project Based Learning (PjBL)',
    alokasiWaktuDefault: '4 JP (4 x 45 Menit) - 2 Pertemuan',
    kataKunci: ['laporan pkl', 'sistematika laporan', 'presentasi hasil', 'dunia kerja']
  },
  {
    id: 'smk-fase-e-binggris-manual-k10',
    jenjang: 'SMK',
    fase: 'Fase E',
    tingkat: 'Kelas 10',
    mataPelajaranKey: 'bahasa inggris terapan',
    mataPelajaranName: 'Bahasa Inggris Terapan',
    topik: 'Workplace English: Manual Book, Safety Signs, dan Instruksi Kerja Berbahasa Inggris',
    semester: 1,
    deskripsiTP: 'Peserta didik dapat memahami manual, rambu keselamatan, dan instruksi kerja sederhana berbahasa Inggris.',
    rekomendasiModel: 'Contextual Teaching and Learning (CTL)',
    alokasiWaktuDefault: '2 JP (2 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['workplace english', 'manual book', 'safety signs', 'instruksi kerja']
  },
  {
    id: 'smk-fase-e-binggris-interview-k10',
    jenjang: 'SMK',
    fase: 'Fase E',
    tingkat: 'Kelas 10',
    mataPelajaranKey: 'bahasa inggris terapan',
    mataPelajaranName: 'Bahasa Inggris Terapan',
    topik: 'Job Interview in English: Perkenalan Diri dan Menjawab Pertanyaan HRD',
    semester: 2,
    deskripsiTP: 'Peserta didik dapat memperkenalkan diri dan menjawab pertanyaan wawancara kerja dasar dalam bahasa Inggris.',
    rekomendasiModel: 'Cooperative Learning',
    alokasiWaktuDefault: '2 JP (2 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['job interview', 'self introduction', 'wawancara hrd', 'speaking']
  },
  {
    id: 'smk-fase-e-ppancasila-hukum-k10',
    jenjang: 'SMK',
    fase: 'Fase E',
    tingkat: 'Kelas 10',
    mataPelajaranKey: 'pendidikan pancasila',
    mataPelajaranName: 'Pendidikan Pancasila',
    topik: 'Kesadaran Hukum Ketenagakerjaan: Hak-Kewajiban Pekerja dan PKWT',
    semester: 2,
    deskripsiTP: 'Peserta didik dapat menjelaskan hak-kewajiban pekerja serta isi pokok perjanjian kerja waktu tertentu.',
    rekomendasiModel: 'Inquiry Learning',
    alokasiWaktuDefault: '2 JP (2 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['hukum ketenagakerjaan', 'hak pekerja', 'pkwt kontrak', 'upah']
  },
  {
    id: 'smk-fase-e-projek-tefa-k10',
    jenjang: 'SMK',
    fase: 'Fase E',
    tingkat: 'Kelas 10',
    mataPelajaranKey: 'projek kreatif',
    mataPelajaranName: 'Projek Kreatif & Vokasi',
    topik: 'Mini Teaching Factory: Produksi Souvenir Sekolah Berstandar Mutu',
    semester: 2,
    deskripsiTP: 'Peserta didik dapat memproduksi souvenir dalam mini teaching factory dengan pembagian peran dan kontrol mutu.',
    rekomendasiModel: 'Teaching Factory (TEFA)',
    alokasiWaktuDefault: '6 JP (6 x 45 Menit) - 2 Pertemuan',
    kataKunci: ['teaching factory', 'produksi souvenir', 'kontrol mutu', 'pembagian peran']
  },
  {
    id: 'smk-fase-f-projek-pameran-k12',
    jenjang: 'SMK',
    fase: 'Fase F',
    tingkat: 'Kelas 12',
    mataPelajaranKey: 'projek kreatif',
    mataPelajaranName: 'Projek Kreatif & Vokasi',
    topik: 'Gelar Karya dan Uji Kompetensi: Pameran Produk Unggulan Program Keahlian',
    semester: 1,
    deskripsiTP: 'Peserta didik dapat memamerkan produk unggulan dan mendemonstrasikan kompetensi ke hadapan asesor.',
    rekomendasiModel: 'Project Based Learning (PjBL)',
    alokasiWaktuDefault: '6 JP (6 x 45 Menit) - 2 Pertemuan',
    kataKunci: ['gelar karya', 'uji kompetensi', 'pameran produk', 'asesor']
  },
  {
    id: 'smk-fase-e-mesin-gambar-k10',
    jenjang: 'SMK',
    fase: 'Fase E',
    tingkat: 'Kelas 10',
    mataPelajaranKey: 'teknik mesin',
    mataPelajaranName: 'Dasar-dasar Teknik Mesin',
    topik: 'Gambar Teknik Dasar: Proyeksi, Potongan, dan Pembacaan Toleransi',
    semester: 1,
    deskripsiTP: 'Peserta didik dapat membaca dan membuat gambar proyeksi Eropa-Amerika serta tanda toleransi dasar.',
    rekomendasiModel: 'Discovery Learning',
    alokasiWaktuDefault: '4 JP (4 x 45 Menit) - 2 Pertemuan',
    kataKunci: ['gambar teknik', 'proyeksi eropa', 'potongan gambar', 'toleransi']
  },
  {
    id: 'smk-fase-e-mesin-perkakas-k10',
    jenjang: 'SMK',
    fase: 'Fase E',
    tingkat: 'Kelas 10',
    mataPelajaranKey: 'teknik mesin',
    mataPelajaranName: 'Dasar-dasar Teknik Mesin',
    topik: 'Alat Ukur Presisi: Jangka Sorong, Mikrometer, dan K3 Bengkel',
    semester: 2,
    deskripsiTP: 'Peserta didik dapat menggunakan jangka sorong dan mikrometer dengan tepat serta menerapkan K3 bengkel.',
    rekomendasiModel: 'Praktik Terbimbing',
    alokasiWaktuDefault: '4 JP (4 x 45 Menit) - 2 Pertemuan',
    kataKunci: ['jangka sorong', 'mikrometer', 'alat ukur presisi', 'k3 bengkel']
  },
  {
    id: 'smk-fase-f-akuntansi-laporan-k11',
    jenjang: 'SMK',
    fase: 'Fase F',
    tingkat: 'Kelas 11',
    mataPelajaranKey: 'dasar-dasar akuntansi dan keuangan lembaga',
    mataPelajaranName: 'Dasar-dasar Akuntansi dan Keuangan Lembaga',
    topik: 'Siklus Akuntansi Jasa: Jurnal Umum hingga Laporan Keuangan dengan Spreadsheet',
    semester: 1,
    deskripsiTP: 'Peserta didik dapat mencatat jurnal umum, memposting buku besar, dan menyusun laporan laba rugi perusahaan jasa.',
    rekomendasiModel: 'Problem Based Learning (PBL)',
    alokasiWaktuDefault: '4 JP (4 x 45 Menit) - 2 Pertemuan',
    kataKunci: ['siklus akuntansi', 'jurnal umum', 'laporan keuangan', 'spreadsheet akuntansi']
  },
  {
    id: 'smk-fase-f-perkantoran-arsip-k11',
    jenjang: 'SMK',
    fase: 'Fase F',
    tingkat: 'Kelas 11',
    mataPelajaranKey: 'dasar-dasar manajemen perkantoran',
    mataPelajaranName: 'Dasar-dasar Manajemen Perkantoran',
    topik: 'Kearsipan Digital dan Manajemen Agenda Pimpinan Berbasis Aplikasi',
    semester: 2,
    deskripsiTP: 'Peserta didik dapat mengelola arsip digital dan agenda pimpinan memakai aplikasi perkantoran.',
    rekomendasiModel: 'Project Based Learning (PjBL)',
    alokasiWaktuDefault: '3 JP (3 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['kearsipan digital', 'agenda pimpinan', 'aplikasi perkantoran', 'surat menyurat']
  },
  {
    id: 'smk-fase-f-otomotif-tuneup-k11',
    jenjang: 'SMK',
    fase: 'Fase F',
    tingkat: 'Kelas 11',
    mataPelajaranKey: 'dasar-dasar teknik otomotif',
    mataPelajaranName: 'Dasar-dasar Teknik Otomotif',
    topik: 'Tune Up Mesin Bensin: Penyetelan Celah Katup, Busi, dan Karburator',
    semester: 1,
    deskripsiTP: 'Peserta didik dapat melakukan tune up ringan mesin bensin sesuai SOP dan lembar kerja.',
    rekomendasiModel: 'Praktik Terbimbing',
    alokasiWaktuDefault: '6 JP (6 x 45 Menit) - 2 Pertemuan',
    kataKunci: ['tune up', 'celah katup', 'busi karburator', 'sop bengkel']
  },
  {
    id: 'smk-fase-f-tkj-jaringan-k11',
    jenjang: 'SMK',
    fase: 'Fase F',
    tingkat: 'Kelas 11',
    mataPelajaranKey: 'dasar-dasar teknik komputer dan jaringan',
    mataPelajaranName: 'Dasar-dasar Teknik Komputer dan Jaringan',
    topik: 'Instalasi dan Konfigurasi Jaringan LAN dengan IP Static dan DHCP Server',
    semester: 2,
    deskripsiTP: 'Peserta didik dapat mengkrimping kabel UTP, memberi IP static, dan mengkonfigurasi DHCP server sederhana.',
    rekomendasiModel: 'Praktik Terbimbing',
    alokasiWaktuDefault: '4 JP (4 x 45 Menit) - 2 Pertemuan',
    kataKunci: ['jaringan lan', 'krimping utp', 'ip static', 'dhcp server']
  },
  {
    id: 'smk-fase-f-rpl-database-k11',
    jenjang: 'SMK',
    fase: 'Fase F',
    tingkat: 'Kelas 11',
    mataPelajaranKey: 'dasar-dasar rekayasa perangkat lunak',
    mataPelajaranName: 'Dasar-dasar Rekayasa Perangkat Lunak',
    topik: 'Basis Data MySQL: DDL-DML dan Aplikasi CRUD Sederhana',
    semester: 1,
    deskripsiTP: 'Peserta didik dapat membuat database, tabel, dan aplikasi CRUD sederhana dengan MySQL.',
    rekomendasiModel: 'Project Based Learning (PjBL)',
    alokasiWaktuDefault: '4 JP (4 x 45 Menit) - 2 Pertemuan',
    kataKunci: ['mysql', 'ddl dml', 'crud', 'basis data']
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
