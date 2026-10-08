import { Jenjang, DocType } from '../types';

export interface JenjangConfig {
  jenjang: Jenjang;
  label: string;
  fases: {
    fase: string;
    kelas: string[];
    deskripsi: string;
  }[];
  defaultMapel: string[];
}

export const JENJANG_CONFIGS: Record<Jenjang, JenjangConfig> = {
  SD: {
    jenjang: 'SD',
    label: 'Sekolah Dasar (SD)',
    fases: [
      { fase: 'Fase A', kelas: ['Kelas 1', 'Kelas 2'], deskripsi: 'Pondasi literasi, numerasi dasar, dan penanaman karakter awal' },
      { fase: 'Fase B', kelas: ['Kelas 3', 'Kelas 4'], deskripsi: 'Pengembangan konsep sains terintegrasi (IPAS) dan penalaran' },
      { fase: 'Fase C', kelas: ['Kelas 5', 'Kelas 6'], deskripsi: 'Pemantapan kompetensi dasar dan kesiapan transisi ke SMP' },
    ],
    defaultMapel: [
      'IPAS (Ilmu Pengetahuan Alam & Sosial)',
      'Matematika',
      'Bahasa Indonesia',
      'Pendidikan Pancasila',
      'Pendidikan Agama Islam dan Budi Pekerti',
      'Pendidikan Agama Kristen dan Budi Pekerti',
      'Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)',
      'Seni Rupa',
      'Seni Musik',
      'Seni Tari / Teater',
      'Bahasa Inggris'
    ]
  },
  SMP: {
    jenjang: 'SMP',
    label: 'Sekolah Menengah Pertama (SMP)',
    fases: [
      { fase: 'Fase D', kelas: ['Kelas 7', 'Kelas 8', 'Kelas 9'], deskripsi: 'Pengembangan kemampuan berpikir analitis, pemecahan masalah, dan sains terpadu' },
    ],
    defaultMapel: [
      'Matematika',
      'Ilmu Pengetahuan Alam (IPA)',
      'Ilmu Pengetahuan Sosial (IPS)',
      'Bahasa Indonesia',
      'Bahasa Inggris',
      'Informatika',
      'Pendidikan Pancasila',
      'Pendidikan Agama dan Budi Pekerti',
      'PJOK',
      'Seni dan Budaya',
      'Prakarya (Kerajinan, Rekayasa, Budidaya, Pengolahan)'
    ]
  },
  SMA: {
    jenjang: 'SMA',
    label: 'Sekolah Menengah Atas (SMA)',
    fases: [
      { fase: 'Fase E', kelas: ['Kelas 10'], deskripsi: 'Fase eksplorasi minat, bakat, dan pemahaman konsep sains terpadu' },
      { fase: 'Fase F', kelas: ['Kelas 11', 'Kelas 12'], deskripsi: 'Fase peminatan mendalam dan persiapan perguruan tinggi / karir' },
    ],
    defaultMapel: [
      'Matematika (Umum)',
      'Matematika Tingkat Lanjut',
      'Bahasa Indonesia',
      'Bahasa Inggris',
      'Informatika',
      'Fisika',
      'Kimia',
      'Biologi',
      'Ekonomi',
      'Geografi',
      'Sosiologi',
      'Sejarah (Umum & Tingkat Lanjut)',
      'Pendidikan Pancasila',
      'Pendidikan Agama dan Budi Pekerti',
      'PJOK',
      'Seni Budaya & Keterampilan'
    ]
  },
  SMK: {
    jenjang: 'SMK',
    label: 'Sekolah Menengah Kejuruan (SMK)',
    fases: [
      { fase: 'Fase E', kelas: ['Kelas 10'], deskripsi: 'Dasar-dasar Program Keahlian dan literasi vokasi' },
      { fase: 'Fase F', kelas: ['Kelas 11', 'Kelas 12'], deskripsi: 'Konsentrasi Keahlian, Praktik Kerja Lapangan (PKL), dan Produk Kreatif Kewirausahaan' },
    ],
    defaultMapel: [
      'Dasar-dasar Rekayasa Perangkat Lunak',
      'Dasar-dasar Teknik Mesin',
      'Dasar-dasar Teknik Otomotif',
      'Dasar-dasar Teknik Komputer dan Jaringan',
      'Dasar-dasar Manajemen Perkantoran',
      'Dasar-dasar Akuntansi dan Keuangan Lembaga',
      'Produk Kreatif dan Kewirausahaan (PKK)',
      'Matematika Terapan',
      'Bahasa Indonesia',
      'Bahasa Inggris Terapan',
      'Pendidikan Pancasila',
      'Pendidikan Agama dan Budi Pekerti',
      'Projek Kreatif & Vokasi'
    ]
  }
};

// 8 Dimensi Profil Lulusan — Permendikdasmen No. 10 Tahun 2025 tentang SKL
// (menggantikan 6 dimensi Profil Pelajar Pancasila).
export const DIMENSI_PROFIL_LULUSAN = [
  'Keimanan dan Ketakwaan kepada Tuhan YME',
  'Kewargaan',
  'Penalaran Kritis',
  'Kreativitas',
  'Kolaborasi',
  'Kemandirian',
  'Kesehatan',
  'Komunikasi'
];

/**
 * Model pembelajaran per jenjang — disesuaikan psikologi perkembangan siswa.
 * Bukan prinsip/pendekatan: diferensiasi & TaRL sengaja tidak dimasukkan.
 * Format label: "Nama Model - Penjelasan 3-5 kata".
 */
export const MODEL_PEMBELAJARAN_PER_JENJANG: Record<Jenjang, { value: string; label: string }[]> = {
  // SD Fase A–C: konkret, bermain, literasi dasar
  SD: [
    { value: 'Problem Based Learning (PBL)', label: 'Problem Based Learning - Pemecahan Masalah Kontekstual' },
    { value: 'Project Based Learning (PjBL)', label: 'Project Based Learning - Berkarya Lewat Proyek Nyata' },
    { value: 'Discovery Learning', label: 'Discovery Learning - Menemukan Konsep Terbimbing' },
    { value: 'Contextual Teaching and Learning (CTL)', label: 'Contextual Teaching and Learning - Mengaitkan Materi Kehidupan' },
    { value: 'Cooperative Learning', label: 'Cooperative Learning - Kerja Sama Kelompok' },
    { value: 'Inquiry Terbimbing', label: 'Inquiry Terbimbing - Penyelidikan Sederhana Bertahap' }
  ],
  // SMP Fase D: transisi, eksplorasi, inkuiri
  SMP: [
    { value: 'Problem Based Learning (PBL)', label: 'Problem Based Learning - Pemecahan Masalah Nyata' },
    { value: 'Project Based Learning (PjBL)', label: 'Project Based Learning - Proyek dan Produk' },
    { value: 'Discovery Learning', label: 'Discovery Learning - Penemuan Konsep Mandiri' },
    { value: 'Inquiry Learning', label: 'Inquiry Learning - Penyelidikan Ilmiah Terbimbing' },
    { value: 'Contextual Teaching and Learning (CTL)', label: 'Contextual Teaching and Learning - Kontekstual Kehidupan Nyata' },
    { value: 'Cooperative Learning (Jigsaw/STAD)', label: 'Cooperative Learning - Kolaborasi Tim Terstruktur' },
    { value: 'Flipped Classroom', label: 'Flipped Classroom - Belajar Mandiri lalu Diskusi' }
  ],
  // SMA Fase E–F: analitis, riset, masalah kompleks
  SMA: [
    { value: 'Problem Based Learning (PBL)', label: 'Problem Based Learning - Pemecahan Masalah Kompleks' },
    { value: 'Project Based Learning (PjBL)', label: 'Project Based Learning - Riset dan Karya Ilmiah' },
    { value: 'Inquiry Learning', label: 'Inquiry Learning - Investigasi Ilmiah Mandiri' },
    { value: 'Discovery Learning', label: 'Discovery Learning - Eksplorasi Konsep Mendalam' },
    { value: 'Group Investigation', label: 'Group Investigation - Penelitian Kelompok Mendalam' },
    { value: 'Cooperative Learning', label: 'Cooperative Learning - Diskusi Akademis Kolaboratif' },
    { value: 'Flipped Classroom', label: 'Flipped Classroom - Kajian Mandiri dan Seminar' }
  ],
  // SMK Fase E–F Kejuruan: keterampilan vokasi, industri, portofolio
  SMK: [
    { value: 'Project Based Learning (PjBL)', label: 'Project Based Learning - Produk dan Portofolio Vokasi' },
    { value: 'Teaching Factory (TEFA)', label: 'Teaching Factory - Produksi Standar Industri' },
    { value: 'Problem Based Learning (PBL)', label: 'Problem Based Learning - Troubleshooting Kasus Industri' },
    { value: 'Praktik Terbimbing', label: 'Praktik Terbimbing - Demonstrasi dan Latihan Keterampilan' },
    { value: 'Cooperative Learning', label: 'Cooperative Learning - Kerja Tim Produksi' },
    { value: 'Inquiry Learning', label: 'Inquiry Learning - Uji Coba dan Investigasi Mandiri' }
  ]
};

/** Daftar gabungan (fallback kompatibilitas). */
export const MODEL_PEMBELAJARAN = [
  ...MODEL_PEMBELAJARAN_PER_JENJANG.SD,
  ...MODEL_PEMBELAJARAN_PER_JENJANG.SMP.filter(m => !MODEL_PEMBELAJARAN_PER_JENJANG.SD.some(s => s.value === m.value)),
  ...MODEL_PEMBELAJARAN_PER_JENJANG.SMA.filter(m =>
    ![...MODEL_PEMBELAJARAN_PER_JENJANG.SD, ...MODEL_PEMBELAJARAN_PER_JENJANG.SMP].some(s => s.value === m.value)),
  ...MODEL_PEMBELAJARAN_PER_JENJANG.SMK.filter(m =>
    ![...MODEL_PEMBELAJARAN_PER_JENJANG.SD, ...MODEL_PEMBELAJARAN_PER_JENJANG.SMP, ...MODEL_PEMBELAJARAN_PER_JENJANG.SMA].some(s => s.value === m.value))
];

export const TEMA_P5 = [
  'Gaya Hidup Berkelanjutan',
  'Kearifan Lokal',
  'Bhinneka Tunggal Ika',
  'Bangunlah Jiwa dan Raganya',
  'Suara Demokrasi',
  'Rekayasa dan Teknologi',
  'Kewirausahaan',
  'Kebekerjaan (Khusus SMK)'
];

/** Bentuk soal yang bisa dipilih guru (multi-pilih). */
export const BENTUK_SOAL_OPTIONS = [
  { value: 'Pilihan Ganda', desc: '4–5 opsi jawaban' },
  { value: 'Pilihan Ganda Kompleks (AKM)', desc: 'Benar/Salah atau multi-kunci' },
  { value: 'Menjodohkan', desc: 'Pasangan pernyataan–jawaban' },
  { value: 'Isian Singkat', desc: 'Jawaban pendek' },
  { value: 'Uraian HOTS', desc: 'Stimulus + analisis mendalam' }
];

export const DOC_TYPE_INFO: Record<DocType, { label: string; icon: string; desc: string; badge: string }> = {
  modul_ajar: {
    label: 'Modul Ajar Kurikulum Merdeka',
    icon: 'FileText',
    desc: 'Format lengkap mencakup Identitas, CP, TP, Pemahaman Bermakna, Pertanyaan Pemantik, Kegiatan Berdiferensiasi, Asesmen & Rubrik KKTP, LKPD, hingga Glosarium.',
    badge: 'Panduan Pembelajaran & Asesmen'
  },
  rpp: {
    label: 'RPP Ringkas (1-2 Lembar)',
    icon: 'Layers',
    desc: 'Format praktis, efisien, dan padat materi untuk persiapan mengajar harian serta supervisi kepala sekolah / pengawas.',
    badge: 'Supervisi Cepat'
  },
  soal_ujian: {
    label: 'Bank Soal Ujian & Kisi-Kisi',
    icon: 'HelpCircle',
    desc: 'Paket asesmen sumatif berstandar AKM & HOTS dilengkapi Kisi-kisi Soal (C1-C6), Kunci Jawaban Lengkap, dan Rubrik Pedoman Penskoran.',
    badge: 'AKM & HOTS'
  },
  lkpd: {
    label: 'Lembar Kerja Peserta Didik (LKPD)',
    icon: 'BookOpen',
    desc: 'Instrumen aktivitas siswa interaktif berbasis stimulus kasus nyata, penyelidikan kelompok, dan refleksi mandiri siap cetak.',
    badge: 'Siap Cetak'
  },
  kktp_atp: {
    label: 'ATP & Kriteria Ketuntasan (KKTP)',
    icon: 'Target',
    desc: 'Alur Tujuan Pembelajaran tahunan dan penentuan Kriteria Ketercapaian Tujuan Pembelajaran dengan rubrik deskripsi & interval.',
    badge: 'Administrasi Kurikulum'
  },
  prota_promes: {
    label: 'Prota & Promes (Tahunan & Semester)',
    icon: 'Calendar',
    desc: 'Pemetaan distribusi alokasi Jam Pelajaran (JP) intrakurikuler dan kokurikuler P5 per minggu efektif kalender pendidikan.',
    badge: 'Perencanaan Tahunan'
  },
  modul_p5: {
    label: 'Modul Projek Penguatan Profil Lulusan',
    icon: 'Sparkles',
    desc: 'Perangkat modul projek kokurikuler sesuai 8 tema resmi Kemendikdasmen dan 8 Dimensi Profil Lulusan, lengkap dengan matriks target capaian dan gelar karya.',
    badge: 'Kokurikuler'
  }
};

export const TOPIK_INSPIRASI: { jenjang: Jenjang; mapel: string; topik: string; tingkat: string }[] = [
  { jenjang: 'SD', tingkat: 'Kelas 4', mapel: 'IPAS', topik: 'Bagian Tubuh Tumbuhan dan Fungsinya' },
  { jenjang: 'SD', tingkat: 'Kelas 2', mapel: 'Matematika', topik: 'Operasi Penjumlahan dan Pengurangan Bersusun' },
  { jenjang: 'SD', tingkat: 'Kelas 5', mapel: 'Bahasa Indonesia', topik: 'Menulis Teks Eksplanasi tentang Siklus Air' },
  { jenjang: 'SMP', tingkat: 'Kelas 7', mapel: 'Ilmu Pengetahuan Alam (IPA)', topik: 'Ekologi, Interaksi Makhluk Hidup, dan Pelestarian Keanekaragaman Hayati' },
  { jenjang: 'SMP', tingkat: 'Kelas 8', mapel: 'Matematika', topik: 'Teorema Pythagoras dan Penerapan dalam Kehidupan Sehari-hari' },
  { jenjang: 'SMP', tingkat: 'Kelas 9', mapel: 'Bahasa Inggris', topik: 'Procedure Text: How to Make Traditional Indonesian Drink' },
  { jenjang: 'SMA', tingkat: 'Kelas 10', mapel: 'Biologi', topik: 'Perubahan Lingkungan, Pemanasan Global, dan Bioremediasi' },
  { jenjang: 'SMA', tingkat: 'Kelas 11', mapel: 'Fisika', topik: 'Dinamika Rotasi dan Keseimbangan Benda Tegar' },
  { jenjang: 'SMA', tingkat: 'Kelas 12', mapel: 'Ekonomi', topik: 'Kebijakan Moneter dan Fiskal dalam Menjaga Stabilitas Inflasi' },
  { jenjang: 'SMK', tingkat: 'Kelas 11', mapel: 'Dasar-dasar Rekayasa Perangkat Lunak', topik: 'Pemrograman Web Berbasis Komponen dan Integrasi API' }
];
