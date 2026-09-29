export type Jenjang = 'SD' | 'SMP' | 'SMA' | 'SMK';

export type DocType = 
  | 'modul_ajar' 
  | 'rpp' 
  | 'soal_ujian' 
  | 'kktp_atp' 
  | 'lkpd' 
  | 'prota_promes' 
  | 'modul_p5';

export type DocumentStatus = 'DRAFT' | 'REVIEW' | 'APPROVED' | 'ARCHIVED';

export interface TeacherUser {
  id: string;
  name: string;
  email: string;
  schoolName: string;
  /** Immutable primary tenant/school identifier derived by the server. */
  schoolId: string;
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
  updatedAt?: string;
  status?: DocumentStatus;
  version?: number;
  authorId: string;
  authorName: string;
  schoolName: string;
  /** Server-owned tenant boundary. Never accepted from client input. */
  schoolId: string;
  isPublic?: boolean;
  durationMinutes?: number;
}

export interface SchoolConfig {
  id: string;
  name: string;
  npsn?: string;
  jenjang: string;
  status: string;
  address?: string;
  city?: string;
  accreditation?: string;
  principalName?: string;
  principalNip?: string;
  logoUrl?: string;
}

export interface MonthlyProductivityData {  month: string;
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
    levelKognitif?: string;
    komposisi?: { mudah: number; sedang: number; sukar: number };
  };
  authorName: string;
  schoolName: string;
  nip?: string;
  kepalaSekolah?: string;
  nipKepalaSekolah?: string;
  classroomContext?: ClassroomContext;
  catatanTambahan?: {
    temaP5?: string;
    instruksiKhusus?: string;
    lampiran?: string[];
    fokusRpp?: string;
    jumlahAktivitas?: number;
    kunciLkpd?: boolean;
    pendekatanKktp?: string;
    semesterProta?: string;
    tahunAjaran?: string;
  };
}

export type TeacherVoice = 'hangat' | 'reflektif' | 'praktis' | 'dialogis' | 'kreatif';

/** Cerita dan pertimbangan guru yang menjadi sumber konteks manusiawi dokumen. */
export interface ClassroomContext {
  teacherStory: string;
  studentProfile: string;
  learningNeeds: string;
  localContext: string;
  priorKnowledge: string;
  emotionalConsiderations: string;
  teacherIntent: string;
  teacherVoice: TeacherVoice;
}
