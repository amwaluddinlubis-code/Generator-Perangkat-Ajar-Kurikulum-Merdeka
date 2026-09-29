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
  dimensiP5?: string[];
  authorName?: string;
  schoolName?: string;
  soalConfig?: {
    jumlahSoal?: number;
    bentukSoal?: string[];
    komposisi?: { mudah?: number; sedang?: number; sukar?: number };
  };
  catatanTambahan?: Record<string, any>;
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
