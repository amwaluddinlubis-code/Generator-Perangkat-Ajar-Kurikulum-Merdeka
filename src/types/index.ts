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
  docType: DocType;
  jenjang: Jenjang;
  tingkat: string;
  fase: string;
  mataPelajaran: string;
  topik: string;
  alokasiWaktu: string;
  modelPembelajaran: string;
  targetPeserta: string;
  dimensiP5: string[];
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
    instruksiKhusus?: string;
  };
}
