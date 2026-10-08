import type { PromptContext, PromptSpec } from './types.js';

const AKTIVITAS_MASTER = [
  'Eksplorasi Konsep (Sediakan teks informasi singkat/tabel isian)',
  'Analisis & Pemecahan Masalah (Berikan pertanyaan esai berbasis HOTS)',
  'Aplikasi Karya (Instruksi membuat sesuatu/menghitung)',
  'Refleksi Diri'
];

export function buildAktivitasLines(jumlahAktivitas?: unknown, kunciLkpd?: unknown): string {
  const n = Math.min(Math.max(Number(jumlahAktivitas) || 3, 1), 4);
  const lines = AKTIVITAS_MASTER.slice(0, n).map((a, i) => `${5 + i}. Aktivitas ${i + 1}:${a}.`);
  let next = 5 + n;
  if (kunciLkpd) {
    lines.push(`${next}. Kunci Jawaban Guru (khusus guru, di akhir dokumen).`);
    next++;
  }
  lines.push(`${next}. Rubrik Penilaian Diri.`);
  return lines.join('\n');
}

export const lkpdSpec: PromptSpec = {
  docType: 'lkpd',
  render(ctx: PromptContext): string {
    return `TUGAS: Susunlah **LEMBAR KERJA PESERTA DIDIK (LKPD) INOVATIF & INTERAKTIF** siap cetak untuk ${ctx.mataPelajaran} ${ctx.tingkat} (${ctx.fase}), Topik: ${ctx.topik}.

PANDUAN GAYA PENULISAN (CRITICAL):
1. Tuliskan teks ini seolah-olah Anda berbicara langsung kepada siswa. Gunakan sapaan yang memotivasi (misal: "Halo, para peneliti muda! Mari kita pecahkan misteri hari ini...").
2. JANGAN HANYA MEMBERIKAN INSTRUKSI. Anda WAJIB membuat konten/soal/wacananya secara utuh. Jika ada tabel, buat format tabel kosongnya. Jika ada analisis masalah, tuliskan cerita masalahnya dengan detail.

KOMPONEN WAJIB:
1. Kop LKPD: Nama, Kelompok, Kelas, Tanggal.
2. Judul Aktivitas yang kreatif dan memancing rasa ingin tahu.
3. Petunjuk Belajar & Stimulus/Kasus Masalah Nyata.
${buildAktivitasLines((ctx.catatanTambahan as any)?.jumlahAktivitas, (ctx.catatanTambahan as any)?.kunciLkpd)}`;
  }
};
