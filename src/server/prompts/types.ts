/** Konteks bersama untuk merakit prompt generator per jenis dokumen. */
export interface PromptContext {
  docType: string;
  jenjang: string;
  tingkat: string;
  /** Fase final (hasil kalkulasi bila input kosong). */
  fase: string;
  mataPelajaran: string;
  topik: string;
  alokasiWaktu?: string;
  modelPembelajaran?: string;
  targetPeserta?: string;
  dimensiProfilLulusan?: string[];
  /** Alias lama (deprecated): dipakai fallback bila dimensiProfilLulusan kosong. */
  dimensiP5?: string[];
  authorName?: string;
  schoolName?: string;
  classroomContext?: ClassroomContext;
  soalConfig?: {
    jumlahSoal?: number;
    bentukSoal?: string[];
    jumlahPG?: number;
    jumlahPGKompleks?: number;
    jumlahMenjodohkan?: number;
    jumlahIsianSingkat?: number;
    jumlahUraian?: number;
    jumlahOpsiPilihanGanda?: number;
    komposisi?: { mudah?: number; sedang?: number; sukar?: number };
  };
  catatanTambahan?: Record<string, any>;
}

export interface ClassroomContext {
  teacherStory?: string;
  studentProfile?: string;
  learningNeeds?: string;
  localContext?: string;
  priorKnowledge?: string;
  emotionalConsiderations?: string;
  teacherIntent?: string;
  teacherVoice?: string;
}

/** Spesifikasi prompt satu jenis dokumen: tugas + struktur + gaya. */
export interface PromptSpec {
  docType: string;
  render(ctx: PromptContext): string;
}

/** Konteks regenerasi satu bagian dokumen. */
export interface SectionRegenContext {
  docType: string;
  jenjang: string;
  tingkat: string;
  fase: string;
  mataPelajaran: string;
  topik: string;
  sectionTitle: string;
  content: string;
}
