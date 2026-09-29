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
  // ==========================================
  // SD - FASE A (KELAS 1 & 2)
  // ==========================================
  {
    id: 'sd-fase-a-indo-1',
    jenjang: 'SD',
    fase: 'Fase A',
    tingkat: 'Kelas 1',
    mataPelajaranKey: 'bahasa indonesia',
    mataPelajaranName: 'Bahasa Indonesia',
    topik: 'Mengenal Huruf Vokal dan Konsonan melalui Cerita Bergambar',
    semester: 1,
    deskripsiTP: 'Peserta didik mampu melafalkan bunyi huruf serta membaca suku kata (ba-bi-bu-be-bo) dengan tepat.',
    rekomendasiModel: 'Discovery Learning',
    alokasiWaktuDefault: '2 JP (2 x 35 Menit) - 1 Pertemuan',
    kataKunci: ['huruf', 'vokal', 'konsonan', 'fonem', 'membaca permulaan']
  },
  {
    id: 'sd-fase-a-indo-2',
    jenjang: 'SD',
    fase: 'Fase A',
    tingkat: 'Kelas 1',
    mataPelajaranKey: 'bahasa indonesia',
    mataPelajaranName: 'Bahasa Indonesia',
    topik: 'Kosakata Anggota Tubuh dan Cara Merawat Kesehatan Diri',
    semester: 1,
    deskripsiTP: 'Peserta didik dapat menyebutkan nama anggota tubuh serta menceritakan kebiasaan hidup bersih sehari-hari.',
    rekomendasiModel: 'Contextual Teaching and Learning (CTL)',
    alokasiWaktuDefault: '2 JP (2 x 35 Menit) - 1 Pertemuan',
    kataKunci: ['anggota tubuh', 'merawat diri', 'kesehatan', 'berbicara']
  },
  {
    id: 'sd-fase-a-indo-3',
    jenjang: 'SD',
    fase: 'Fase A',
    tingkat: 'Kelas 2',
    mataPelajaranKey: 'bahasa indonesia',
    mataPelajaranName: 'Bahasa Indonesia',
    topik: 'Mengenal Ungkapan Permintaan Maaf dan Tolong dalam Teks Cerita',
    semester: 1,
    deskripsiTP: 'Peserta didik mampu memperagakan ungkapan santun menggunakan kata maaf, tolong, permisi, dan terima kasih.',
    rekomendasiModel: 'Problem Based Learning (PBL)',
    alokasiWaktuDefault: '2 JP (2 x 35 Menit) - 1 Pertemuan',
    kataKunci: ['sopantun', 'maaf', 'tolong', 'terima kasih', 'dialog']
  },
  {
    id: 'sd-fase-a-indo-4',
    jenjang: 'SD',
    fase: 'Fase A',
    tingkat: 'Kelas 2',
    mataPelajaranKey: 'bahasa indonesia',
    mataPelajaranName: 'Bahasa Indonesia',
    topik: 'Membaca Nyaring Teks Dongeng Fabel dan Menemukan Pesan Moral',
    semester: 2,
    deskripsiTP: 'Peserta didik dapat mengidentifikasi watak tokoh dan pesan kebaikan dari fabel binatang.',
    rekomendasiModel: 'Discovery Learning',
    alokasiWaktuDefault: '2 JP (2 x 35 Menit) - 1 Pertemuan',
    kataKunci: ['fabel', 'dongeng', 'karakter', 'pesan moral']
  },
  {
    id: 'sd-fase-a-mat-1',
    jenjang: 'SD',
    fase: 'Fase A',
    tingkat: 'Kelas 1',
    mataPelajaranKey: 'matematika',
    mataPelajaranName: 'Matematika',
    topik: 'Bilangan Cacah 1 sampai 20 dan Konsep Nilai Tempat Satuan-Puluhan',
    semester: 1,
    deskripsiTP: 'Peserta didik mampu membilang benda konkret, mengurutkan bilangan, dan menentukan nilai tempat.',
    rekomendasiModel: 'Discovery Learning',
    alokasiWaktuDefault: '2 JP (2 x 35 Menit) - 1 Pertemuan',
    kataKunci: ['bilangan cacah', 'nilai tempat', 'satuan', 'puluhan']
  },
  {
    id: 'sd-fase-a-mat-2',
    jenjang: 'SD',
    fase: 'Fase A',
    tingkat: 'Kelas 1',
    mataPelajaranKey: 'matematika',
    mataPelajaranName: 'Matematika',
    topik: 'Mengenal Bangun Datar Sederhana (Segitiga, Segiempat, dan Lingkaran)',
    semester: 2,
    deskripsiTP: 'Peserta didik dapat mengidentifikasi dan mengelompokkan bentuk bangun datar di lingkungan sekitar.',
    rekomendasiModel: 'Inquiry Learning',
    alokasiWaktuDefault: '2 JP (2 x 35 Menit) - 1 Pertemuan',
    kataKunci: ['bangun datar', 'segitiga', 'segiempat', 'lingkaran']
  },
  {
    id: 'sd-fase-a-mat-3',
    jenjang: 'SD',
    fase: 'Fase A',
    tingkat: 'Kelas 2',
    mataPelajaranKey: 'matematika',
    mataPelajaranName: 'Matematika',
    topik: 'Operasi Penjumlahan dan Pengurangan Bersusun Bilangan sampai 100',
    semester: 1,
    deskripsiTP: 'Peserta didik mampu menyelesaikan operasi penjumlahan dan pengurangan dengan teknik menyimpan/meminjam.',
    rekomendasiModel: 'Problem Based Learning (PBL)',
    alokasiWaktuDefault: '2 JP (2 x 35 Menit) - 1 Pertemuan',
    kataKunci: ['penjumlahan bersusun', 'pengurangan', 'teknik menyimpan', 'berhitung']
  },
  {
    id: 'sd-fase-a-mat-4',
    jenjang: 'SD',
    fase: 'Fase A',
    tingkat: 'Kelas 2',
    mataPelajaranKey: 'matematika',
    mataPelajaranName: 'Matematika',
    topik: 'Pengukuran Panjang dan Berat Benda dengan Satuan Baku (cm, m, gram, kg)',
    semester: 2,
    deskripsiTP: 'Peserta didik dapat melakukan estimasi dan pengukuran panjang serta berat benda memakai penggaris dan timbangan.',
    rekomendasiModel: 'Project Based Learning (PjBL)',
    alokasiWaktuDefault: '2 JP (2 x 35 Menit) - 1 Pertemuan',
    kataKunci: ['pengukuran', 'panjang', 'berat', 'penggaris', 'timbangan']
  },
  {
    id: 'sd-fase-a-pkn-1',
    jenjang: 'SD',
    fase: 'Fase A',
    tingkat: 'Kelas 1',
    mataPelajaranKey: 'pendidikan pancasila',
    mataPelajaranName: 'Pendidikan Pancasila',
    topik: 'Mengenal Simbol-Simbol Garuda Pancasila dan Makna Sila Pertama',
    semester: 1,
    deskripsiTP: 'Peserta didik mampu menyebutkan 5 simbol sila Pancasila serta memberikan contoh perilaku taat beribadah.',
    rekomendasiModel: 'Contextual Teaching and Learning (CTL)',
    alokasiWaktuDefault: '2 JP (2 x 35 Menit) - 1 Pertemuan',
    kataKunci: ['garuda pancasila', 'simbol sila', 'bintang', 'beribadah']
  },
  {
    id: 'sd-fase-a-pkn-2',
    jenjang: 'SD',
    fase: 'Fase A',
    tingkat: 'Kelas 2',
    mataPelajaranKey: 'pendidikan pancasila',
    mataPelajaranName: 'Pendidikan Pancasila',
    topik: 'Aturan dan Norma Tertib di Rumah serta di Lingkungan Sekolah',
    semester: 1,
    deskripsiTP: 'Peserta didik memahami pentingnya mematuhi tata tertib kelas dan kebiasaan santun bermusyawarah.',
    rekomendasiModel: 'Problem Based Learning (PBL)',
    alokasiWaktuDefault: '2 JP (2 x 35 Menit) - 1 Pertemuan',
    kataKunci: ['tata tertib', 'aturan rumah', 'disiplin sekolah', 'norma']
  },

  // ==========================================
  // SD - FASE B (KELAS 3 & 4)
  // ==========================================
  {
    id: 'sd-fase-b-ipas-1',
    jenjang: 'SD',
    fase: 'Fase B',
    tingkat: 'Kelas 3',
    mataPelajaranKey: 'ipas',
    mataPelajaranName: 'IPAS (Ilmu Pengetahuan Alam & Sosial)',
    topik: 'Daur Hidup Hewan: Metamorfosis Sempurna dan Tidak Sempurna',
    semester: 1,
    deskripsiTP: 'Peserta didik mampu membandingkan tahapan metamorfosis pada kupu-kupu, katak, dan kecoak secara runtut.',
    rekomendasiModel: 'Inquiry Learning',
    alokasiWaktuDefault: '2 JP (2 x 35 Menit) - 1 Pertemuan',
    kataKunci: ['metamorfosis', 'daur hidup', 'hewan', 'siklus biologis']
  },
  {
    id: 'sd-fase-b-ipas-2',
    jenjang: 'SD',
    fase: 'Fase B',
    tingkat: 'Kelas 3',
    mataPelajaranKey: 'ipas',
    mataPelajaranName: 'IPAS (Ilmu Pengetahuan Alam & Sosial)',
    topik: 'Wujud Zat dan Perubahan Bentuk Benda dalam Kehidupan Sehari-hari',
    semester: 2,
    deskripsiTP: 'Peserta didik dapat mendemonstrasikan proses mencair, membeku, menguap, mengembun, dan menyublim.',
    rekomendasiModel: 'Problem Based Learning (PBL)',
    alokasiWaktuDefault: '2 JP (2 x 35 Menit) - 1 Pertemuan',
    kataKunci: ['wujud zat', 'mencair', 'menguap', 'membeku', 'perubahan fisika']
  },
  {
    id: 'sd-fase-b-ipas-3',
    jenjang: 'SD',
    fase: 'Fase B',
    tingkat: 'Kelas 4',
    mataPelajaranKey: 'ipas',
    mataPelajaranName: 'IPAS (Ilmu Pengetahuan Alam & Sosial)',
    topik: 'Bagian Tubuh Tumbuhan dan Fungsinya serta Proses Fotosintesis',
    semester: 1,
    deskripsiTP: 'Peserta didik mampu menganalisis keterkaitan antara struktur akar, batang, daun, bunga dengan fotosintesis.',
    rekomendasiModel: 'Problem Based Learning (PBL)',
    alokasiWaktuDefault: '2 JP (2 x 35 Menit) - 1 Pertemuan',
    kataKunci: ['bagian tumbuhan', 'daun', 'akar', 'fotosintesis', 'klorofil']
  },
  {
    id: 'sd-fase-b-ipas-4',
    jenjang: 'SD',
    fase: 'Fase B',
    tingkat: 'Kelas 4',
    mataPelajaranKey: 'ipas',
    mataPelajaranName: 'IPAS (Ilmu Pengetahuan Alam & Sosial)',
    topik: 'Transformasi Energi di Sekitar Kita dan Energi Terbarukan',
    semester: 1,
    deskripsiTP: 'Peserta didik dapat mengidentifikasi perubahan energi gerak, panas, listrik, dan cahaya pada peralatan sehari-hari.',
    rekomendasiModel: 'Project Based Learning (PjBL)',
    alokasiWaktuDefault: '2 JP (2 x 35 Menit) - 1 Pertemuan',
    kataKunci: ['transformasi energi', 'energi listrik', 'energi surya', 'kekekalan energi']
  },
  {
    id: 'sd-fase-b-ipas-5',
    jenjang: 'SD',
    fase: 'Fase B',
    tingkat: 'Kelas 4',
    mataPelajaranKey: 'ipas',
    mataPelajaranName: 'IPAS (Ilmu Pengetahuan Alam & Sosial)',
    topik: 'Gaya di Sekitar Kita: Gaya Otot, Gesek, Magnet, dan Gravitasi',
    semester: 2,
    deskripsiTP: 'Peserta didik mampu membuktikan pengaruh berbagai jenis gaya terhadap gerak dan bentuk benda.',
    rekomendasiModel: 'Inquiry Learning',
    alokasiWaktuDefault: '2 JP (2 x 35 Menit) - 1 Pertemuan',
    kataKunci: ['gaya magnet', 'gaya gesek', 'gravitasi', 'gaya pegas']
  },
  {
    id: 'sd-fase-b-mat-1',
    jenjang: 'SD',
    fase: 'Fase B',
    tingkat: 'Kelas 4',
    mataPelajaranKey: 'matematika',
    mataPelajaranName: 'Matematika',
    topik: 'Pecahan Senilai, Menyederhanakan Pecahan, dan Membandingkan Pecahan',
    semester: 1,
    deskripsiTP: 'Peserta didik dapat menemukan pecahan senilai menggunakan gambar konkret dan garis bilangan.',
    rekomendasiModel: 'Discovery Learning',
    alokasiWaktuDefault: '2 JP (2 x 35 Menit) - 1 Pertemuan',
    kataKunci: ['pecahan senilai', 'pembilang', 'penyebut', 'garis bilangan']
  },
  {
    id: 'sd-fase-b-mat-2',
    jenjang: 'SD',
    fase: 'Fase B',
    tingkat: 'Kelas 4',
    mataPelajaranKey: 'matematika',
    mataPelajaranName: 'Matematika',
    topik: 'Keliling dan Luas Bangun Datar (Persegi, Persegi Panjang, Segitiga)',
    semester: 2,
    deskripsiTP: 'Peserta didik mampu menghitung keliling dan luas denah bidang datar serta menyelesaikan masalah sehari-hari.',
    rekomendasiModel: 'Problem Based Learning (PBL)',
    alokasiWaktuDefault: '2 JP (2 x 35 Menit) - 1 Pertemuan',
    kataKunci: ['keliling', 'luas', 'persegi panjang', 'rumus matematika']
  },
  {
    id: 'sd-fase-b-indo-1',
    jenjang: 'SD',
    fase: 'Fase B',
    tingkat: 'Kelas 4',
    mataPelajaranKey: 'bahasa indonesia',
    mataPelajaranName: 'Bahasa Indonesia',
    topik: 'Menulis Teks Petunjuk dan Prosedur Sederhana dengan Kalimat Efektif',
    semester: 1,
    deskripsiTP: 'Peserta didik mampu menyusun teks petunjuk membuat karya atau menggunakan alat dengan urutan logis.',
    rekomendasiModel: 'Project Based Learning (PjBL)',
    alokasiWaktuDefault: '2 JP (2 x 35 Menit) - 1 Pertemuan',
    kataKunci: ['teks prosedur', 'kalimat perintah', 'petunjuk kerja', 'langkah-langkah']
  },

  // ==========================================
  // SD - FASE C (KELAS 5 & 6)
  // ==========================================
  {
    id: 'sd-fase-c-ipas-1',
    jenjang: 'SD',
    fase: 'Fase C',
    tingkat: 'Kelas 5',
    mataPelajaranKey: 'ipas',
    mataPelajaranName: 'IPAS (Ilmu Pengetahuan Alam & Sosial)',
    topik: 'Organ Pernapasan Manusia dan Cara Memelihara Kesehatannya',
    semester: 1,
    deskripsiTP: 'Peserta didik dapat menjelaskan mekanisme pertukaran oksigen dan karbon dioksida di alveolus.',
    rekomendasiModel: 'Problem Based Learning (PBL)',
    alokasiWaktuDefault: '2 JP (2 x 35 Menit) - 1 Pertemuan',
    kataKunci: ['sistem pernapasan', 'paru-paru', 'alveolus', 'oksigen']
  },
  {
    id: 'sd-fase-c-ipas-2',
    jenjang: 'SD',
    fase: 'Fase C',
    tingkat: 'Kelas 5',
    mataPelajaranKey: 'ipas',
    mataPelajaranName: 'IPAS (Ilmu Pengetahuan Alam & Sosial)',
    topik: 'Ekosistem, Jaring-Jaring Makanan, dan Keseimbangan Alam',
    semester: 1,
    deskripsiTP: 'Peserta didik mampu menganalisis peran produsen, konsumen, dan pengurai serta dampak perburuan liar.',
    rekomendasiModel: 'Inquiry Learning',
    alokasiWaktuDefault: '2 JP (2 x 35 Menit) - 1 Pertemuan',
    kataKunci: ['ekosistem', 'rantai makanan', 'jaring-jaring makanan', 'konsumen']
  },
  {
    id: 'sd-fase-c-ipas-3',
    jenjang: 'SD',
    fase: 'Fase C',
    tingkat: 'Kelas 5',
    mataPelajaranKey: 'ipas',
    mataPelajaranName: 'IPAS (Ilmu Pengetahuan Alam & Sosial)',
    topik: 'Siklus Air dan Pentingnya Konservasi Sumber Daya Air Bersih',
    semester: 2,
    deskripsiTP: 'Peserta didik dapat membuat bagan daur air (evaporasi, kondensasi, presipitasi, infiltrasi).',
    rekomendasiModel: 'Project Based Learning (PjBL)',
    alokasiWaktuDefault: '2 JP (2 x 35 Menit) - 1 Pertemuan',
    kataKunci: ['siklus air', 'evaporasi', 'presipitasi', 'konservasi air']
  },
  {
    id: 'sd-fase-c-ipas-4',
    jenjang: 'SD',
    fase: 'Fase C',
    tingkat: 'Kelas 6',
    mataPelajaranKey: 'ipas',
    mataPelajaranName: 'IPAS (Ilmu Pengetahuan Alam & Sosial)',
    topik: 'Sistem Tata Surya, Karakteristik Planet, dan Peristiwa Gerhana',
    semester: 1,
    deskripsiTP: 'Peserta didik mampu membandingkan ciri planet serta menjelaskan terjadinya rotasi dan revolusi bumi.',
    rekomendasiModel: 'Discovery Learning',
    alokasiWaktuDefault: '2 JP (2 x 35 Menit) - 1 Pertemuan',
    kataKunci: ['tata surya', 'planet', 'rotasi bumi', 'gerhana matahari']
  },
  {
    id: 'sd-fase-c-ipas-5',
    jenjang: 'SD',
    fase: 'Fase C',
    tingkat: 'Kelas 6',
    mataPelajaranKey: 'ipas',
    mataPelajaranName: 'IPAS (Ilmu Pengetahuan Alam & Sosial)',
    topik: 'Perjuangan Mempertahankan Kemerdekaan dan Tokoh Proklamasi 1945',
    semester: 1,
    deskripsiTP: 'Peserta didik menghargai jasa para pahlawan bangsa dalam peristiwa sekitar proklamasi kemerdekaan.',
    rekomendasiModel: 'Contextual Teaching and Learning (CTL)',
    alokasiWaktuDefault: '2 JP (2 x 35 Menit) - 1 Pertemuan',
    kataKunci: ['proklamasi', 'kemerdekaan', 'pahlawan nasional', 'sejarah']
  },
  {
    id: 'sd-fase-c-mat-1',
    jenjang: 'SD',
    fase: 'Fase C',
    tingkat: 'Kelas 5',
    mataPelajaranKey: 'matematika',
    mataPelajaranName: 'Matematika',
    topik: 'Operasi Hitung Pecahan Biasa, Campuran, dan Desimal',
    semester: 1,
    deskripsiTP: 'Peserta didik mampu menyelesaikan masalah perkalian dan pembagian pecahan dalam konteks kehidupan nyata.',
    rekomendasiModel: 'Problem Based Learning (PBL)',
    alokasiWaktuDefault: '2 JP (2 x 35 Menit) - 1 Pertemuan',
    kataKunci: ['pecahan campuran', 'desimal', 'persen', 'operasi hitung']
  },
  {
    id: 'sd-fase-c-mat-2',
    jenjang: 'SD',
    fase: 'Fase C',
    tingkat: 'Kelas 6',
    mataPelajaranKey: 'matematika',
    mataPelajaranName: 'Matematika',
    topik: 'Lingkaran: Jari-Jari, Diameter, Keliling, dan Luas Lingkaran',
    semester: 1,
    deskripsiTP: 'Peserta didik dapat menghitung keliling dan luas lingkaran menggunakan nilai pendekatan phi 22/7 atau 3.14.',
    rekomendasiModel: 'Discovery Learning',
    alokasiWaktuDefault: '2 JP (2 x 35 Menit) - 1 Pertemuan',
    kataKunci: ['lingkaran', 'jari-jari', 'luas lingkaran', 'phi']
  },

  // ==========================================
  // SMP - FASE D (KELAS 7, 8, 9)
  // ==========================================
  {
    id: 'smp-fase-d-ipa-1',
    jenjang: 'SMP',
    fase: 'Fase D',
    tingkat: 'Kelas 7',
    mataPelajaranKey: 'ilmu pengetahuan alam (ipa)',
    mataPelajaranName: 'Ilmu Pengetahuan Alam (IPA)',
    topik: 'Metode Ilmiah, Pengukuran Besaran dan Satuan dalam Sains',
    semester: 1,
    deskripsiTP: 'Peserta didik mampu merancang percobaan ilmiah sederhana, melakukan pengukuran presisi, dan mencatat data.',
    rekomendasiModel: 'Inquiry Learning',
    alokasiWaktuDefault: '2 JP (2 x 40 Menit) - 1 Pertemuan',
    kataKunci: ['metode ilmiah', 'besaran pokok', 'besaran turunan', 'pengukuran laboratorium']
  },
  {
    id: 'smp-fase-d-ipa-2',
    jenjang: 'SMP',
    fase: 'Fase D',
    tingkat: 'Kelas 7',
    mataPelajaranKey: 'ilmu pengetahuan alam (ipa)',
    mataPelajaranName: 'Ilmu Pengetahuan Alam (IPA)',
    topik: 'Klasifikasi Makhluk Hidup Menggunakan Kunci Determinasi Sederhana',
    semester: 1,
    deskripsiTP: 'Peserta didik dapat mengidentifikasi ciri-ciri kingdom makhluk hidup dan menggunakan kunci dikotomi.',
    rekomendasiModel: 'Discovery Learning',
    alokasiWaktuDefault: '2 JP (2 x 40 Menit) - 1 Pertemuan',
    kataKunci: ['klasifikasi', 'kunci determinasi', 'kingdom', 'keanekaragaman hayati']
  },
  {
    id: 'smp-fase-d-ipa-3',
    jenjang: 'SMP',
    fase: 'Fase D',
    tingkat: 'Kelas 7',
    mataPelajaranKey: 'ilmu pengetahuan alam (ipa)',
    mataPelajaranName: 'Ilmu Pengetahuan Alam (IPA)',
    topik: 'Kalor dan Perpindahannya: Konduksi, Konveksi, dan Radiasi',
    semester: 2,
    deskripsiTP: 'Peserta didik mampu menganalisis mekanisme perpindahan panas dan penerapannya pada teknologi termos/panel surya.',
    rekomendasiModel: 'Problem Based Learning (PBL)',
    alokasiWaktuDefault: '2 JP (2 x 40 Menit) - 1 Pertemuan',
    kataKunci: ['kalor', 'konduksi', 'konveksi', 'radiasi', 'suhu']
  },
  {
    id: 'smp-fase-d-ipa-4',
    jenjang: 'SMP',
    fase: 'Fase D',
    tingkat: 'Kelas 8',
    mataPelajaranKey: 'ilmu pengetahuan alam (ipa)',
    mataPelajaranName: 'Ilmu Pengetahuan Alam (IPA)',
    topik: 'Struktur dan Fungsi Sel: Perbedaan Sel Hewan dan Sel Tumbuhan',
    semester: 1,
    deskripsiTP: 'Peserta didik mampu mengamati preparat mikroskopis sel dan menjelaskan fungsi membran sel, inti sel, dan kloroplas.',
    rekomendasiModel: 'Inquiry Learning',
    alokasiWaktuDefault: '2 JP (2 x 40 Menit) - 1 Pertemuan',
    kataKunci: ['sel hewan', 'sel tumbuhan', 'organel', 'mikroskop']
  },
  {
    id: 'smp-fase-d-ipa-5',
    jenjang: 'SMP',
    fase: 'Fase D',
    tingkat: 'Kelas 8',
    mataPelajaranKey: 'ilmu pengetahuan alam (ipa)',
    mataPelajaranName: 'Ilmu Pengetahuan Alam (IPA)',
    topik: 'Sistem Peredaran Darah Manusia dan Pencegahan Penyakit Kardiovaskular',
    semester: 1,
    deskripsiTP: 'Peserta didik dapat menganalisis fungsi jantung, pembuluh darah, dan faktor penyebab hipertensi.',
    rekomendasiModel: 'Problem Based Learning (PBL)',
    alokasiWaktuDefault: '2 JP (2 x 40 Menit) - 1 Pertemuan',
    kataKunci: ['jantung', 'peredaran darah besar', 'eritrosit', 'kardiovaskular']
  },
  {
    id: 'smp-fase-d-ipa-6',
    jenjang: 'SMP',
    fase: 'Fase D',
    tingkat: 'Kelas 8',
    mataPelajaranKey: 'ilmu pengetahuan alam (ipa)',
    mataPelajaranName: 'Ilmu Pengetahuan Alam (IPA)',
    topik: 'Pesawat Sederhana dan Keuntungan Mekanis dalam Kehidupan Sehari-hari',
    semester: 2,
    deskripsiTP: 'Peserta didik mampu menghitung keuntungan mekanis pada tuas, bidang miring, dan katrol.',
    rekomendasiModel: 'Discovery Learning',
    alokasiWaktuDefault: '2 JP (2 x 40 Menit) - 1 Pertemuan',
    kataKunci: ['pesawat sederhana', 'tuas', 'bidang miring', 'katrol', 'usaha']
  },
  {
    id: 'smp-fase-d-ipa-7',
    jenjang: 'SMP',
    fase: 'Fase D',
    tingkat: 'Kelas 9',
    mataPelajaranKey: 'ilmu pengetahuan alam (ipa)',
    mataPelajaranName: 'Ilmu Pengetahuan Alam (IPA)',
    topik: 'Pewarisan Sifat: Hukum Mendel dan Persilangan Monohibrid-Dihibrid',
    semester: 1,
    deskripsiTP: 'Peserta didik dapat memprediksi perbandingan genotipe dan fenotipe pada persilangan monohibrid dominan-resesif.',
    rekomendasiModel: 'Problem Based Learning (PBL)',
    alokasiWaktuDefault: '2 JP (2 x 40 Menit) - 1 Pertemuan',
    kataKunci: ['genetika', 'hukum mendel', 'monohibrid', 'fenotipe', 'genotipe']
  },
  {
    id: 'smp-fase-d-ipa-8',
    jenjang: 'SMP',
    fase: 'Fase D',
    tingkat: 'Kelas 9',
    mataPelajaranKey: 'ilmu pengetahuan alam (ipa)',
    mataPelajaranName: 'Ilmu Pengetahuan Alam (IPA)',
    topik: 'Listrik Dinamis, Rangkaian Seri-Paralel, dan Hukum Ohm',
    semester: 1,
    deskripsiTP: 'Peserta didik mampu merangkai komponen listrik, mengukur kuat arus, tegangan, dan menghitung hambatan pengganti.',
    rekomendasiModel: 'Inquiry Learning',
    alokasiWaktuDefault: '2 JP (2 x 40 Menit) - 1 Pertemuan',
    kataKunci: ['hukum ohm', 'rangkaian seri', 'rangkaian paralel', 'listrik dinamis']
  },
  {
    id: 'smp-fase-d-mat-1',
    jenjang: 'SMP',
    fase: 'Fase D',
    tingkat: 'Kelas 7',
    mataPelajaranKey: 'matematika',
    mataPelajaranName: 'Matematika',
    topik: 'Operasi Bilangan Bulat dan Bilangan Rasional dalam Konteks Finansial',
    semester: 1,
    deskripsiTP: 'Peserta didik mampu menghitung keuntungan, kerugian, dan persentase diskon belanja.',
    rekomendasiModel: 'Problem Based Learning (PBL)',
    alokasiWaktuDefault: '2 JP (2 x 40 Menit) - 1 Pertemuan',
    kataKunci: ['bilangan bulat', 'aritmatika sosial', 'untung rugi', 'diskon']
  },
  {
    id: 'smp-fase-d-mat-2',
    jenjang: 'SMP',
    fase: 'Fase D',
    tingkat: 'Kelas 7',
    mataPelajaranKey: 'matematika',
    mataPelajaranName: 'Matematika',
    topik: 'Bentuk Aljabar: Penyederhanaan Suku Sejenis dan Operasi Aljabar',
    semester: 1,
    deskripsiTP: 'Peserta didik mampu memodelkan situasi nyata ke dalam bentuk aljabar dan menyelesaikannya.',
    rekomendasiModel: 'Discovery Learning',
    alokasiWaktuDefault: '2 JP (2 x 40 Menit) - 1 Pertemuan',
    kataKunci: ['aljabar', 'variabel', 'koefisien', 'konstanta', 'suku sejenis']
  },
  {
    id: 'smp-fase-d-mat-3',
    jenjang: 'SMP',
    fase: 'Fase D',
    tingkat: 'Kelas 8',
    mataPelajaranKey: 'matematika',
    mataPelajaranName: 'Matematika',
    topik: 'Teorema Pythagoras dan Penerapan dalam Pemecahan Masalah Geometri',
    semester: 1,
    deskripsiTP: 'Peserta didik dapat membuktikan teorema Pythagoras dan menghitung jarak antara dua titik koordinat.',
    rekomendasiModel: 'Discovery Learning',
    alokasiWaktuDefault: '2 JP (2 x 40 Menit) - 1 Pertemuan',
    kataKunci: ['teorema pythagoras', 'segitiga siku-siku', 'hipotenusa', 'tripel pythagoras']
  },
  {
    id: 'smp-fase-d-mat-4',
    jenjang: 'SMP',
    fase: 'Fase D',
    tingkat: 'Kelas 8',
    mataPelajaranKey: 'matematika',
    mataPelajaranName: 'Matematika',
    topik: 'Sistem Persamaan Linear Dua Variabel (SPLDV) dengan Metode Eliminasi & Substitusi',
    semester: 1,
    deskripsiTP: 'Peserta didik mampu memodelkan masalah harga barang menjadi model matematika SPLDV.',
    rekomendasiModel: 'Problem Based Learning (PBL)',
    alokasiWaktuDefault: '2 JP (2 x 40 Menit) - 1 Pertemuan',
    kataKunci: ['spldv', 'eliminasi', 'substitusi', 'persamaan linear']
  },
  {
    id: 'smp-fase-d-mat-5',
    jenjang: 'SMP',
    fase: 'Fase D',
    tingkat: 'Kelas 9',
    mataPelajaranKey: 'matematika',
    mataPelajaranName: 'Matematika',
    topik: 'Fungsi Kuadrat: Menggambar Grafik Parabola dan Menentukan Titik Puncak',
    semester: 1,
    deskripsiTP: 'Peserta didik dapat membuat sketsa kurva fungsi kuadrat serta menentukan sumbu simetri dan nilai optimum.',
    rekomendasiModel: 'Inquiry Learning',
    alokasiWaktuDefault: '2 JP (2 x 40 Menit) - 1 Pertemuan',
    kataKunci: ['fungsi kuadrat', 'parabola', 'titik puncak', 'diskriminan']
  },
  {
    id: 'smp-fase-d-mat-6',
    jenjang: 'SMP',
    fase: 'Fase D',
    tingkat: 'Kelas 9',
    mataPelajaranKey: 'matematika',
    mataPelajaranName: 'Matematika',
    topik: 'Statistika: Analisis Ukuran Pemusatan Data (Mean, Median, Modus) dan Diagram Kotak',
    semester: 2,
    deskripsiTP: 'Peserta didik mampu mengolah data hasil survei sekolah ke dalam diagram batang, lingkaran, dan menyimpulkan mean.',
    rekomendasiModel: 'Project Based Learning (PjBL)',
    alokasiWaktuDefault: '2 JP (2 x 40 Menit) - 1 Pertemuan',
    kataKunci: ['statistika', 'mean', 'median', 'modus', 'analisis data']
  },
  {
    id: 'smp-fase-d-indo-1',
    jenjang: 'SMP',
    fase: 'Fase D',
    tingkat: 'Kelas 7',
    mataPelajaranKey: 'bahasa indonesia',
    mataPelajaranName: 'Bahasa Indonesia',
    topik: 'Menulis Teks Deskripsi Objek Wisata dan Budaya Nusantara Bermajas Sensorik',
    semester: 1,
    deskripsiTP: 'Peserta didik dapat menyusun deskripsi rincian indrawi tentang keelokan alam daerah tempat tinggalnya.',
    rekomendasiModel: 'Project Based Learning (PjBL)',
    alokasiWaktuDefault: '2 JP (2 x 40 Menit) - 1 Pertemuan',
    kataKunci: ['teks deskripsi', 'majas panca indera', 'objek wisata', 'literasi']
  },
  {
    id: 'smp-fase-d-indo-2',
    jenjang: 'SMP',
    fase: 'Fase D',
    tingkat: 'Kelas 8',
    mataPelajaranKey: 'bahasa indonesia',
    mataPelajaranName: 'Bahasa Indonesia',
    topik: 'Menganalisis Teks Eksplanasi Fenomena Bencana Alam dan Struktur Sebab-Akibat',
    semester: 1,
    deskripsiTP: 'Peserta didik dapat mengidentifikasi konjungsi kausalitas dan kronologis dalam teks banjir/gempa bumi.',
    rekomendasiModel: 'Problem Based Learning (PBL)',
    alokasiWaktuDefault: '2 JP (2 x 40 Menit) - 1 Pertemuan',
    kataKunci: ['teks eksplanasi', 'sebab akibat', 'kausalitas', 'fenomena alam']
  },
  {
    id: 'smp-fase-d-ing-1',
    jenjang: 'SMP',
    fase: 'Fase D',
    tingkat: 'Kelas 8',
    mataPelajaranKey: 'bahasa inggris',
    mataPelajaranName: 'Bahasa Inggris',
    topik: 'Recount Text: Sharing Memorable Past Experiences and Holiday Activities',
    semester: 1,
    deskripsiTP: 'Students are able to produce written recount texts using past tense and temporal conjunctions accurately.',
    rekomendasiModel: 'Contextual Teaching and Learning (CTL)',
    alokasiWaktuDefault: '2 JP (2 x 40 Menit) - 1 Pertemuan',
    kataKunci: ['recount text', 'simple past tense', 'regular irregular verbs', 'story telling']
  },
  {
    id: 'smp-fase-d-inf-1',
    jenjang: 'SMP',
    fase: 'Fase D',
    tingkat: 'Kelas 7',
    mataPelajaranKey: 'informatika',
    mataPelajaranName: 'Informatika',
    topik: 'Berpikir Komputasional (Computational Thinking): Dekomposisi dan Pola',
    semester: 1,
    deskripsiTP: 'Peserta didik mampu menyelesaikan masalah logis menggunakan 4 pilar computational thinking.',
    rekomendasiModel: 'Discovery Learning',
    alokasiWaktuDefault: '2 JP (2 x 40 Menit) - 1 Pertemuan',
    kataKunci: ['computational thinking', 'algoritma', 'dekomposisi', 'abstraksi']
  },

  // ==========================================
  // SMA - FASE E (KELAS 10)
  // ==========================================
  {
    id: 'sma-fase-e-bio-1',
    jenjang: 'SMA',
    fase: 'Fase E',
    tingkat: 'Kelas 10',
    mataPelajaranKey: 'biologi',
    mataPelajaranName: 'Biologi',
    topik: 'Perubahan Lingkungan, Pemanasan Global, dan Solusi Bioremediasi Limbah',
    semester: 2,
    deskripsiTP: 'Peserta didik mampu menganalisis data emisi gas rumah kaca serta merancang aksi konservasi lingkungan sekolah.',
    rekomendasiModel: 'Project Based Learning (PjBL)',
    alokasiWaktuDefault: '2 JP (2 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['pemanasan global', 'perubahan iklim', 'bioremediasi', 'jejak karbon']
  },
  {
    id: 'sma-fase-e-bio-2',
    jenjang: 'SMA',
    fase: 'Fase E',
    tingkat: 'Kelas 10',
    mataPelajaranKey: 'biologi',
    mataPelajaranName: 'Biologi',
    topik: 'Keanekaragaman Hayati Indonesia: Ancaman Kepunahan dan Upaya Pelestarian Insitu/Eksitu',
    semester: 1,
    deskripsiTP: 'Peserta didik dapat mengevaluasi sebaran flora fauna Wallace-Weber serta merumuskan strategi pelestarian habitat.',
    rekomendasiModel: 'Problem Based Learning (PBL)',
    alokasiWaktuDefault: '2 JP (2 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['biodiversitas', 'garis wallace', 'konservasi eksitu', 'spesies endemik']
  },
  {
    id: 'sma-fase-e-fis-1',
    jenjang: 'SMA',
    fase: 'Fase E',
    tingkat: 'Kelas 10',
    mataPelajaranKey: 'fisika',
    mataPelajaranName: 'Fisika',
    topik: 'Energi Terbarukan: Analisis Potensi Pembangkit Listrik Tenaga Surya dan Angin',
    semester: 2,
    deskripsiTP: 'Peserta didik mampu merancang miniatur generator energi terbarukan dan menghitung efisiensi konversi daya.',
    rekomendasiModel: 'Project Based Learning (PjBL)',
    alokasiWaktuDefault: '2 JP (2 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['energi terbarukan', 'panel surya', 'efisiensi energi', 'daya listrik']
  },
  {
    id: 'sma-fase-e-fis-2',
    jenjang: 'SMA',
    fase: 'Fase E',
    tingkat: 'Kelas 10',
    mataPelajaranKey: 'fisika',
    mataPelajaranName: 'Fisika',
    topik: 'Ketidakpastian Pengukuran, Angka Penting, dan Penggunaan Mikrometer Sekrup/Jangka Sorong',
    semester: 1,
    deskripsiTP: 'Peserta didik terampil melakukan pengukuran berulang dengan jangka sorong serta melaporkan nilai ketidakpastian.',
    rekomendasiModel: 'Inquiry Learning',
    alokasiWaktuDefault: '2 JP (2 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['jangka sorong', 'mikrometer sekrup', 'angka penting', 'ketidakpastian mutlak']
  },
  {
    id: 'sma-fase-e-kim-1',
    jenjang: 'SMA',
    fase: 'Fase E',
    tingkat: 'Kelas 10',
    mataPelajaranKey: 'kimia',
    mataPelajaranName: 'Kimia',
    topik: '12 Prinsip Kimia Hijau (Green Chemistry) dalam Pengelolaan Limbah Industri',
    semester: 1,
    deskripsiTP: 'Peserta didik mampu mengidentifikasi proses kimia tidak ramah lingkungan dan menawarkan alternatif kimia hijau.',
    rekomendasiModel: 'Problem Based Learning (PBL)',
    alokasiWaktuDefault: '2 JP (2 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['kimia hijau', 'green chemistry', 'ekonomi atom', 'katalisis']
  },
  {
    id: 'sma-fase-e-kim-2',
    jenjang: 'SMA',
    fase: 'Fase E',
    tingkat: 'Kelas 10',
    mataPelajaranKey: 'kimia',
    mataPelajaranName: 'Kimia',
    topik: 'Hukum-Hukum Dasar Kimia (Lavoisier, Proust, Dalton) dan Persamaan Reaksi Setara',
    semester: 2,
    deskripsiTP: 'Peserta didik dapat menyetarakan persamaan reaksi kimia dan menghitung massa zat reaktan serta produk.',
    rekomendasiModel: 'Discovery Learning',
    alokasiWaktuDefault: '2 JP (2 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['stoikiometri', 'hukum kekekalan massa', 'perbandingan tetap', 'penyetaraan reaksi']
  },
  {
    id: 'sma-fase-e-mat-1',
    jenjang: 'SMA',
    fase: 'Fase E',
    tingkat: 'Kelas 10',
    mataPelajaranKey: 'matematika',
    mataPelajaranName: 'Matematika',
    topik: 'Eksponen dan Logaritma: Pemodelan Pertumbuhan Bakteri dan Peluruhan Radioaktif',
    semester: 1,
    deskripsiTP: 'Peserta didik mampu menerapkan sifat-sifat eksponensial dalam menyelesaikan masalah eksponensial kontekstual.',
    rekomendasiModel: 'Problem Based Learning (PBL)',
    alokasiWaktuDefault: '2 JP (2 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['eksponen', 'logaritma', 'pertumbuhan eksponensial', 'peluruhan']
  },
  {
    id: 'sma-fase-e-mat-2',
    jenjang: 'SMA',
    fase: 'Fase E',
    tingkat: 'Kelas 10',
    mataPelajaranKey: 'matematika',
    mataPelajaranName: 'Matematika',
    topik: 'Barisan dan Deret Aritmatika serta Geometri dalam Masalah Keuangan & Bunga Majemuk',
    semester: 1,
    deskripsiTP: 'Peserta didik dapat menghitung nilai anuitas, cicilan pinjaman, dan proyeksi investasi bunga majemuk.',
    rekomendasiModel: 'Contextual Teaching and Learning (CTL)',
    alokasiWaktuDefault: '2 JP (2 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['barisan aritmatika', 'deret geometri', 'bunga majemuk', 'anuitas']
  },
  {
    id: 'sma-fase-e-mat-3',
    jenjang: 'SMA',
    fase: 'Fase E',
    tingkat: 'Kelas 10',
    mataPelajaranKey: 'matematika',
    mataPelajaranName: 'Matematika',
    topik: 'Trigonometri: Perbandingan Sinus, Cosinus, Tangen pada Segitiga Siku-Siku',
    semester: 2,
    deskripsiTP: 'Peserta didik terampil menggunakan klinometer sederhana untuk mengukur tinggi pohon atau tiang bendera.',
    rekomendasiModel: 'Project Based Learning (PjBL)',
    alokasiWaktuDefault: '2 JP (2 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['trigonometri', 'sinus', 'cosinus', 'tangen', 'klinometer']
  },
  {
    id: 'sma-fase-e-eko-1',
    jenjang: 'SMA',
    fase: 'Fase E',
    tingkat: 'Kelas 10',
    mataPelajaranKey: 'ekonomi',
    mataPelajaranName: 'Ekonomi',
    topik: 'Kelangkaan Sumber Daya, Skala Prioritas Kebutuhan, dan Biaya Peluang (Opportunity Cost)',
    semester: 1,
    deskripsiTP: 'Peserta didik mampu menyusun rencana keuangan pribadi dengan mempertimbangkan biaya peluang secara bijak.',
    rekomendasiModel: 'Problem Based Learning (PBL)',
    alokasiWaktuDefault: '2 JP (2 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['kelangkaan', 'biaya peluang', 'skala prioritas', 'literasi finansial']
  },
  {
    id: 'sma-fase-e-sos-1',
    jenjang: 'SMA',
    fase: 'Fase E',
    tingkat: 'Kelas 10',
    mataPelajaranKey: 'sosiologi',
    mataPelajaranName: 'Sosiologi',
    topik: 'Fungsi Sosiologi dalam Membedah Gejala Sosial dan Interaksi di Era Digital',
    semester: 1,
    deskripsiTP: 'Peserta didik dapat melakukan observasi sosiologis sederhana terkait dinamika interaksi sosial media remaja.',
    rekomendasiModel: 'Inquiry Learning',
    alokasiWaktuDefault: '2 JP (2 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['sosiologi', 'gejala sosial', 'interaksi sosial', 'digital society']
  },

  // ==========================================
  // SMA - FASE F (KELAS 11 & 12)
  // ==========================================
  {
    id: 'sma-fase-f-bio-1',
    jenjang: 'SMA',
    fase: 'Fase F',
    tingkat: 'Kelas 11',
    mataPelajaranKey: 'biologi',
    mataPelajaranName: 'Biologi',
    topik: 'Transpor Membran (Difusi, Osmosis, Endositosis) dan Fisiologi Sel',
    semester: 1,
    deskripsiTP: 'Peserta didik mampu membuktikan peristiwa plasmolisis sel tumbuhan melalui praktikum larutan garam/gula.',
    rekomendasiModel: 'Inquiry Learning',
    alokasiWaktuDefault: '2 JP (2 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['difusi', 'osmosis', 'plasmolisis', 'transpor aktif']
  },
  {
    id: 'sma-fase-f-bio-2',
    jenjang: 'SMA',
    fase: 'Fase F',
    tingkat: 'Kelas 11',
    mataPelajaranKey: 'biologi',
    mataPelajaranName: 'Biologi',
    topik: 'Sistem Imunitas Tubuh: Mekanisme Respon Kekebalan Spesifik & Vaksinasi',
    semester: 2,
    deskripsiTP: 'Peserta didik dapat mengevaluasi cara kerja antibodi, limfosit T & B, serta pentingnya imunisasi masyarakat.',
    rekomendasiModel: 'Problem Based Learning (PBL)',
    alokasiWaktuDefault: '2 JP (2 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['sistem imun', 'antibodi', 'vaksin', 'antigen', 'limfosit']
  },
  {
    id: 'sma-fase-f-bio-3',
    jenjang: 'SMA',
    fase: 'Fase F',
    tingkat: 'Kelas 12',
    mataPelajaranKey: 'biologi',
    mataPelajaranName: 'Biologi',
    topik: 'Sintesis Protein: Transkripsi DNA dan Translasi RNA menjadi Polipeptida',
    semester: 1,
    deskripsiTP: 'Peserta didik mampu menguraikan tahapan ekspresi genetik dari kode kodon mRNA menjadi urutan asam amino.',
    rekomendasiModel: 'Discovery Learning',
    alokasiWaktuDefault: '2 JP (2 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['sintesis protein', 'transkripsi', 'translasi', 'kodon', 'dna rna']
  },
  {
    id: 'sma-fase-f-bio-4',
    jenjang: 'SMA',
    fase: 'Fase F',
    tingkat: 'Kelas 12',
    mataPelajaranKey: 'biologi',
    mataPelajaranName: 'Biologi',
    topik: 'Bioteknologi Modern: Rekayasa Genetika, CRISPR-Cas9, dan Isu Bioetika',
    semester: 2,
    deskripsiTP: 'Peserta didik dapat berdebat kritis tentang dampak tanaman transgenik (GMO) dan kloning hewan.',
    rekomendasiModel: 'Problem Based Learning (PBL)',
    alokasiWaktuDefault: '2 JP (2 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['bioteknologi', 'rekayasa genetika', 'gmo', 'bioetika', 'crispr']
  },
  {
    id: 'sma-fase-f-fis-1',
    jenjang: 'SMA',
    fase: 'Fase F',
    tingkat: 'Kelas 11',
    mataPelajaranKey: 'fisika',
    mataPelajaranName: 'Fisika',
    topik: 'Dinamika Rotasi Benda Tegar, Momen Inersia, dan Hukum Kekekalan Momentum Sudut',
    semester: 1,
    deskripsiTP: 'Peserta didik mampu memecahkan persoalan silinder menggelinding pada bidang miring dengan hukum Newton rotasi.',
    rekomendasiModel: 'Problem Based Learning (PBL)',
    alokasiWaktuDefault: '2 JP (2 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['dinamika rotasi', 'momen inersia', 'torsi', 'momentum sudut']
  },
  {
    id: 'sma-fase-f-fis-2',
    jenjang: 'SMA',
    fase: 'Fase F',
    tingkat: 'Kelas 11',
    mataPelajaranKey: 'fisika',
    mataPelajaranName: 'Fisika',
    topik: 'Termodinamika: Mesin Carnot, Siklus Termal, dan Hukum Entropi',
    semester: 2,
    deskripsiTP: 'Peserta didik dapat menghitung efisiensi maksimum mesin kalor serta mendiskusikan batasan siklus pendingin.',
    rekomendasiModel: 'Discovery Learning',
    alokasiWaktuDefault: '2 JP (2 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['termodinamika', 'mesin carnot', 'efisiensi', 'siklus gas ideal']
  },
  {
    id: 'sma-fase-f-fis-3',
    jenjang: 'SMA',
    fase: 'Fase F',
    tingkat: 'Kelas 12',
    mataPelajaranKey: 'fisika',
    mataPelajaranName: 'Fisika',
    topik: 'Induksi Elektromagnetik, Hukum Faraday, Lenz, dan Prinsip Kerja Generator Listrik',
    semester: 1,
    deskripsiTP: 'Peserta didik dapat menganalisis faktor penentu timbulnya GGL induksi pada kumparan berputar dalam medan magnet.',
    rekomendasiModel: 'Inquiry Learning',
    alokasiWaktuDefault: '2 JP (2 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['induksi elektromagnetik', 'hukum faraday', 'hukum lenz', 'transformator']
  },
  {
    id: 'sma-fase-f-kim-1',
    jenjang: 'SMA',
    fase: 'Fase F',
    tingkat: 'Kelas 11',
    mataPelajaranKey: 'kimia',
    mataPelajaranName: 'Kimia',
    topik: 'Laju Reaksi dan Faktor Penentu (Konsentrasi, Suhu, Luas Permukaan, Katalis)',
    semester: 1,
    deskripsiTP: 'Peserta didik terampil merancang percobaan tabung reaksi untuk menentukan orde reaksi dan energi aktivasi.',
    rekomendasiModel: 'Inquiry Learning',
    alokasiWaktuDefault: '2 JP (2 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['laju reaksi', 'orde reaksi', 'katalis', 'teori tumbukan']
  },
  {
    id: 'sma-fase-f-kim-2',
    jenjang: 'SMA',
    fase: 'Fase F',
    tingkat: 'Kelas 11',
    mataPelajaranKey: 'kimia',
    mataPelajaranName: 'Kimia',
    topik: 'Kesetimbangan Kimia dan Pergeseran Kesetimbangan (Asas Le Chatelier)',
    semester: 1,
    deskripsiTP: 'Peserta didik mampu memprediksi arah pergeseran kesetimbangan dalam proses sintesis amonia Haber-Bosch.',
    rekomendasiModel: 'Problem Based Learning (PBL)',
    alokasiWaktuDefault: '2 JP (2 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['kesetimbangan kimia', 'le chatelier', 'kc kp', 'haber bosch']
  },
  {
    id: 'sma-fase-f-kim-3',
    jenjang: 'SMA',
    fase: 'Fase F',
    tingkat: 'Kelas 12',
    mataPelajaranKey: 'kimia',
    mataPelajaranName: 'Kimia',
    topik: 'Elektrokimia: Sel Volta, Deret Volta, dan Korosi Logam serta Cara Pencegahannya',
    semester: 1,
    deskripsiTP: 'Peserta didik mampu merangkai sel volta buah lemon dan merumuskan pencegahan karat besi dengan proteksi katodik.',
    rekomendasiModel: 'Project Based Learning (PjBL)',
    alokasiWaktuDefault: '2 JP (2 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['sel volta', 'potensial reduksi', 'korosi', 'proteksi katodik']
  },
  {
    id: 'sma-fase-f-mat-1',
    jenjang: 'SMA',
    fase: 'Fase F',
    tingkat: 'Kelas 11',
    mataPelajaranKey: 'matematika tingkat lanjut',
    mataPelajaranName: 'Matematika Tingkat Lanjut',
    topik: 'Polinomial (Suku Banyak): Teorema Sisa, Teorema Faktor, dan Operasi Aljabar Polinomial',
    semester: 1,
    deskripsiTP: 'Peserta didik mampu menyelesaikan pembagian suku banyak dengan skema Horner serta memfaktorkan polinomial.',
    rekomendasiModel: 'Discovery Learning',
    alokasiWaktuDefault: '2 JP (2 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['polinomial', 'teorema sisa', 'teorema faktor', 'metode horner']
  },
  {
    id: 'sma-fase-f-mat-2',
    jenjang: 'SMA',
    fase: 'Fase F',
    tingkat: 'Kelas 12',
    mataPelajaranKey: 'matematika',
    mataPelajaranName: 'Matematika',
    topik: 'Kalkulus: Turunan Fungsi Aljabar dan Aplikasi Nilai Maksimum-Minimum',
    semester: 1,
    deskripsiTP: 'Peserta didik mampu menentukan keuntungan optimal penjualan produk manufaktur menggunakan turunan pertama.',
    rekomendasiModel: 'Problem Based Learning (PBL)',
    alokasiWaktuDefault: '2 JP (2 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['kalkulus', 'turunan fungsi', 'nilai optimum', 'kecepatan sesaat']
  },
  {
    id: 'sma-fase-f-eko-1',
    jenjang: 'SMA',
    fase: 'Fase F',
    tingkat: 'Kelas 11',
    mataPelajaranKey: 'ekonomi',
    mataPelajaranName: 'Ekonomi',
    topik: 'Pendapatan Nasional (PDB, PNB, NNI) dan Kesenjangan Distribusi Pendapatan (Koefisien Gini)',
    semester: 1,
    deskripsiTP: 'Peserta didik dapat menganalisis data PDB Indonesia dan menghitung pendapatan per kapita.',
    rekomendasiModel: 'Inquiry Learning',
    alokasiWaktuDefault: '2 JP (2 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['pendapatan nasional', 'pdb pnb', 'koefisien gini', 'pertumbuhan ekonomi']
  },
  {
    id: 'sma-fase-f-eko-2',
    jenjang: 'SMA',
    fase: 'Fase F',
    tingkat: 'Kelas 12',
    mataPelajaranKey: 'ekonomi',
    mataPelajaranName: 'Ekonomi',
    topik: 'Kebijakan Moneter Bank Indonesia dan Kebijakan Fiskal dalam Mengendalikan Inflasi',
    semester: 1,
    deskripsiTP: 'Peserta didik dapat mengevaluasi instrumen suku bunga BI-Rate dan subsidi pemerintah dalam stabilitas harga.',
    rekomendasiModel: 'Problem Based Learning (PBL)',
    alokasiWaktuDefault: '2 JP (2 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['kebijakan moneter', 'kebijakan fiskal', 'inflasi', 'bank indonesia']
  },

  // ==========================================
  // SMK - FASE E & F
  // ==========================================
  {
    id: 'smk-fase-e-rpl-1',
    jenjang: 'SMK',
    fase: 'Fase E',
    tingkat: 'Kelas 10',
    mataPelajaranKey: 'dasar-dasar rekayasa perangkat lunak',
    mataPelajaranName: 'Dasar-dasar Rekayasa Perangkat Lunak',
    topik: 'Konsep Dasar Pemrograman Berorientasi Objek (OOP): Class, Object, dan Encapsulation',
    semester: 2,
    deskripsiTP: 'Peserta didik mampu membuat program aplikasi konsol sederhana dengan menerapkan prinsip modularitas OOP.',
    rekomendasiModel: 'Project Based Learning (PjBL)',
    alokasiWaktuDefault: '2 JP (2 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['oop', 'pemrograman berorientasi objek', 'class object', 'software engineering']
  },
  {
    id: 'smk-fase-f-rpl-2',
    jenjang: 'SMK',
    fase: 'Fase F',
    tingkat: 'Kelas 11',
    mataPelajaranKey: 'dasar-dasar rekayasa perangkat lunak',
    mataPelajaranName: 'Dasar-dasar Rekayasa Perangkat Lunak',
    topik: 'Pemrograman Web Responsif dan Integrasi RESTful API Menggunakan React & TypeScript',
    semester: 1,
    deskripsiTP: 'Peserta didik mampu membangun antarmuka web modern yang mengonsumsi endpoint data backend secara asinkron.',
    rekomendasiModel: 'Project Based Learning (PjBL)',
    alokasiWaktuDefault: '2 JP (2 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['web development', 'rest api', 'react', 'frontend', 'async fetch']
  },
  {
    id: 'smk-fase-f-pkk-1',
    jenjang: 'SMK',
    fase: 'Fase F',
    tingkat: 'Kelas 12',
    mataPelajaranKey: 'projek kreatif dan kewirausahaan',
    mataPelajaranName: 'Projek Kreatif dan Kewirausahaan (PKK)',
    topik: 'Perancangan Prototipe Produk Layanan Digital dan Analisis Kelayakan Usaha (Break Even Point)',
    semester: 1,
    deskripsiTP: 'Peserta didik mampu menyusun proposal Business Model Canvas (BMC) dan menghitung titik impas usaha.',
    rekomendasiModel: 'Project Based Learning (PjBL)',
    alokasiWaktuDefault: '2 JP (2 x 45 Menit) - 1 Pertemuan',
    kataKunci: ['kewirausahaan', 'bep break even point', 'prototipe', 'business model canvas']
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

  // 1. Exact match on jenjang, tingkat/fase, and subject
  const exactMatches = CURRICULUM_TOPICS.filter(item => {
    if (item.jenjang !== jenjang) return false;

    // Check class or fase
    const matchLevel = item.tingkat.toLowerCase() === tingkat.toLowerCase() || item.fase.toLowerCase() === fase.toLowerCase();
    if (!matchLevel) return false;

    // Check subject
    const itemMapel = item.mataPelajaranKey.toLowerCase();
    const isMapelMatch = 
      normMapel.includes(itemMapel) || 
      itemMapel.includes(normMapel) ||
      (normMapel.includes('ipa') && itemMapel.includes('ipa')) ||
      (normMapel.includes('ipas') && itemMapel.includes('ipas')) ||
      (normMapel.includes('matematika') && itemMapel.includes('matematika')) ||
      (normMapel.includes('biologi') && itemMapel.includes('biologi')) ||
      (normMapel.includes('fisika') && itemMapel.includes('fisika')) ||
      (normMapel.includes('kimia') && itemMapel.includes('kimia')) ||
      (normMapel.includes('indonesia') && itemMapel.includes('indonesia')) ||
      (normMapel.includes('inggris') && itemMapel.includes('inggris')) ||
      (normMapel.includes('ekonomi') && itemMapel.includes('ekonomi')) ||
      (normMapel.includes('sosiologi') && itemMapel.includes('sosiologi')) ||
      (normMapel.includes('informatika') && itemMapel.includes('informatika')) ||
      (normMapel.includes('pancasila') && itemMapel.includes('pancasila'));

    return isMapelMatch;
  });

  if (exactMatches.length > 0) {
    return exactMatches;
  }

  // 2. Fallback: match by subject and jenjang regardless of exact class
  const subjectMatches = CURRICULUM_TOPICS.filter(item => {
    if (item.jenjang !== jenjang) return false;
    const itemMapel = item.mataPelajaranKey.toLowerCase();
    return (
      normMapel.includes(itemMapel) || 
      itemMapel.includes(normMapel) ||
      (normMapel.includes('ipa') && itemMapel.includes('ipa')) ||
      (normMapel.includes('ipas') && itemMapel.includes('ipas')) ||
      (normMapel.includes('matematika') && itemMapel.includes('matematika')) ||
      (normMapel.includes('biologi') && itemMapel.includes('biologi')) ||
      (normMapel.includes('fisika') && itemMapel.includes('fisika')) ||
      (normMapel.includes('kimia') && itemMapel.includes('kimia')) ||
      (normMapel.includes('indonesia') && itemMapel.includes('indonesia')) ||
      (normMapel.includes('inggris') && itemMapel.includes('inggris'))
    );
  });

  if (subjectMatches.length > 0) {
    return subjectMatches;
  }

  // 3. Fallback: return popular topics for this Jenjang and Tingkat
  const jenjangMatches = CURRICULUM_TOPICS.filter(item => item.jenjang === jenjang);
  return jenjangMatches.slice(0, 4);
}
