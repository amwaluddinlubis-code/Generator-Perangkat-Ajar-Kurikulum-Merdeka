export type Jenjang = 'SD' | 'SMP' | 'SMA' | 'SMK';

export type DocType = 
  | 'modul_ajar' 
  | 'rpp' 
  | 'soal_ujian' 
  | 'kktp_atp' 
  | 'lkpd' 
  | 'prota_promes' 
  | 'modul_p5';

export interface TeacherUser {
  id: string;
  name: string;
  email: string;
  schoolName: string;
  npsn?: string;
  nip?: string;
  jenjang: Jenjang;
  mataPelajaran: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'GURU';
  status: 'VERIFIED' | 'PENDING' | 'REJECTED';
  avatarUrl?: string;
  registeredAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
  /** Hash password (scrypt). Opsional agar data seed lama tetap valid; tidak pernah dikirim ke client. */
  passwordHash?: string;
}

export interface EducationalDocument {
  id: string;
  title: string;
  docType: DocType;
  jenjang: Jenjang;
  tingkat: string;
  fase: string;
  mataPelajaran: string;
  topik: string;
  content: string;
  createdAt: string;
  authorId: string;
  authorName: string;
  schoolName: string;
  isPublic?: boolean;
  durationMinutes?: number;
  /** REDESIGN — penanda hasil migrasi dokumen lama ke struktur paket. */
  paketId?: string;
}

export interface MonthlyProductivityData {
  month: string;
  monthShort: string;
  year: number;
  total: number;
  modulAjar: number;
  rpp: number;
  soalUjian: number;
  lainnya: number;
  avgDurationMinutes: number;
}

export interface GeneratorParams {
  authorId?: string;
  docType: DocType;
  tiered?: boolean; // FITUR 1: LKPD 3 tingkat diferensiasi (hanya dipakai saat docType==='lkpd')
  jenjang: Jenjang;
  tingkat: string;
  fase: string;
  mataPelajaran: string;
  topik: string;
  alokasiWaktu: string;
  modelPembelajaran: string;
  targetPeserta: string;
  dimensiProfilLulusan: string[];
  soalConfig?: {
    jumlahSoal: number;
    bentukSoal: string[];
    levelKognitif: string;
  };
  authorName: string;
  schoolName: string;
  nip?: string;
  kepalaSekolah?: string;
  nipKepalaSekolah?: string;
  catatanTambahan?: {
    temaP5?: string;
    templateId?: string;
    judulProjek?: string;
    isuKontekstual?: string;
    bentukAksi?: string;
    sistemWaktu?: string;
    mitraProjek?: string;
    subelemenTarget?: string[];
    instruksiKhusus?: string;
  };
}

// REDESIGN — data layer paket perangkat ajar (menggantikan pola satu-dokumen-lepas).
// Satu Paket = satu topik pelajaran yang memuat 7 jenis dokumen perangkat ajar
// (satu per DocType), masing-masing dengan riwayat versi (VersiDokumen).
export interface Paket {
  id: string;
  topik: string;
  mataPelajaran: string;
  jenjang: Jenjang;
  fase: string;
  tingkat: string;
  pemilikId: string;
  sekolahId?: string;
  status: 'aktif' | 'arsip';
  dibuatPada: string;
  dibukaTerakhir: string;
  /** GEL2 — tandai paket untuk ditampilkan di Perpustakaan Sekolah. */
  publikasiSekolah?: boolean;
}

export interface DokumenPaket {
  id: string;
  paketId: string;
  docType: DocType;
  status: 'belum' | 'draf' | 'final';
  versiAktif: number;
  diperbaruiPada: string;
}

export interface VersiDokumen {
  id: string;
  dokumenPaketId: string;
  nomorVersi: number;
  content: string;
  title: string;
  dibuatPada: string;
  dibuatOleh: string;
}
