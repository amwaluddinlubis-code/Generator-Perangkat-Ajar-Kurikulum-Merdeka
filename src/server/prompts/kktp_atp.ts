import type { PromptContext, PromptSpec } from './types.js';

export function pendekatanLine(pendekatan?: unknown): string {
  if (typeof pendekatan === 'string' && pendekatan && pendekatan !== 'Ketiganya') {
    return `   Hanya gunakan pendekatan ${pendekatan}.`;
  }
  return '   a. Deskripsi Kriteria, b. Rubrik Skala Berkembang, c. Interval Nilai.';
}

export const kktpAtpSpec: PromptSpec = {
  docType: 'kktp_atp',
  render(ctx: PromptContext): string {
    return `TUGAS: Susunlah **ALUR TUJUAN PEMBELAJARAN (ATP) DAN KRITERIA KETERCAPAIAN TUJUAN PEMBELAJARAN (KKTP)** untuk ${ctx.mataPelajaran} ${ctx.tingkat} (${ctx.fase}).

PANDUAN GAYA PENULISAN (CRITICAL):
1. Pecah materi/topik menjadi tahapan alur yang logis (dari yang mudah ke sulit, atau kronologis).
2. Deskriptor rubrik KKTP harus mencerminkan perilaku siswa yang bisa diamati. Jangan hanya menggunakan kata sifat (misal: "kurang baik", "cukup baik"), melainkan operasional (misal: "Siswa mampu menyebutkan 2 dari 4 ciri utama tanpa bantuan guru").

KOMPONEN WAJIB:
1. Rasional dan CP.
2. Matriks ATP (Tabel: Elemen, CP, TP, Alur Pembelajaran, Alokasi Waktu, Profil Lulusan, Penilaian).
3. Penetapan KKTP dengan pendekatan:
${pendekatanLine((ctx.catatanTambahan as any)?.pendekatanKktp)}
4. Panduan Intervensi Remedial dan Pengayaan.`;
  }
};
