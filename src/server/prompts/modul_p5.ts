import type { PromptContext, PromptSpec } from './types.js';

export const modulP5Spec: PromptSpec = {
  docType: 'modul_p5',
  render(ctx: PromptContext): string {
    const tema = (ctx.catatanTambahan as any)?.temaP5 || 'Gaya Hidup Berkelanjutan / Kewirausahaan';
    return `TUGAS: Susunlah **MODUL PROYEK PENGUATAN PROFIL PELAJAR PANCASILA (P5)** sesuai Panduan BSKAP 2024.

Tema Proyek: ${tema}
Topik: ${ctx.topik} | Jenjang: ${ctx.jenjang} (${ctx.fase})

PANDUAN GAYA PENULISAN (CRITICAL):
1. Proyek harus berfokus pada AKSI NYATA (aktivitas fisik, riset lapangan, pembuatan karya, kampanye), bukan hanya teori di dalam kelas.
2. Deskripsikan alur aktivitas dengan sangat konkret. Jangan hanya mengatakan "Siswa mengidentifikasi masalah", tapi jelaskan CARAnya (misal: "Siswa mewawancarai pedagang kantin tentang sampah plastik").

KOMPONEN WAJIB:
1. Profil Modul (Tema, Topik, Fase, Durasi JP).
2. Dimensi, Elemen, dan Subelemen (Matriks Target Pencapaian).
3. Alur Aktivitas Projek (Pengenalan, Kontekstualisasi, Aksi Nyata, Refleksi).
4. Asesmen Diagnostik, Formatif, dan Sumatif Projek (Rubrik Penilaian Subelemen).
5. Lampiran: Panduan Gelar Karya Projek.`;
  }
};
