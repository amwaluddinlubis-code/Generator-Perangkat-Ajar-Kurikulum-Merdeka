import type { PromptContext, PromptSpec } from './types.js';

export function cakupanLine(semesterProta?: unknown, tahunAjaran?: unknown): string {
  if (typeof semesterProta === 'string' && semesterProta) {
    const tahun = typeof tahunAjaran === 'string' && tahunAjaran.trim() ? ` Tahun Ajaran ${tahunAjaran.trim()}` : '';
    return `   CAKUPAN: Semester ${semesterProta}${tahun} — susun hanya semester tersebut.`;
  }
  return '';
}

export const protaPromesSpec: PromptSpec = {
  docType: 'prota_promes',
  render(ctx: PromptContext): string {
    return `TUGAS: Susunlah **PROGRAM TAHUNAN (PROTA) & PROGRAM SEMESTER (PROMES)** Kurikulum Merdeka untuk mata pelajaran ${ctx.mataPelajaran} kelas ${ctx.tingkat} (${ctx.fase}).

PANDUAN GAYA PENULISAN (CRITICAL):
1. Pecah materi pokok menjadi sub-topik yang masuk akal untuk diajarkan per minggu. Jangan hanya menyalin ulang kalimat CP secara gelondongan.
2. Buat distribusi waktu (JP) yang realistis dengan memperhitungkan minggu efektif, jeda ujian, dan waktu P5.

KOMPONEN WAJIB:
1. Identitas & Alokasi Total Jam Pelajaran (Intrakurikuler & P5).
${cakupanLine((ctx.catatanTambahan as any)?.semesterProta, (ctx.catatanTambahan as any)?.tahunAjaran)}
2. Tabel Prota: No, Materi Pokok/Sub-Topik, Alokasi Waktu (JP), Semester.
3. Tabel Promes: Distribusi JP per minggu efektif, jadwal asesmen, dan libur kalender pendidikan.`;
  }
};
