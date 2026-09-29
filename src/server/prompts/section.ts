import type { SectionRegenContext } from './types.js';

/** Prompt tulis-ulang satu bagian dokumen (heading asli wajib dipertahankan). */
export function buildSectionPrompt(ctx: SectionRegenContext): string {
  const cleanSection = String(ctx.sectionTitle || '').trim().slice(0, 120);
  const context = typeof ctx.content === 'string' ? ctx.content.slice(0, 6000) : '';
  return `Anda adalah Pakar Kurikulum Merdeka Indonesia & Pengembang Perangkat Ajar Senior di Kementerian Pendidikan Dasar dan Menengah RI (Kemendikdasmen).
Tugas: tulis ulang SATU bagian dokumen perangkat ajar berikut dengan kualitas lebih baik, tetap dalam Bahasa Indonesia formal dan format Markdown.

Konteks dokumen:
- Jenis: ${String(ctx.docType || 'modul_ajar')}
- Jenjang/Kelas/Fase: ${String(ctx.jenjang || '')} / ${String(ctx.tingkat || '')} / ${String(ctx.fase || '')}
- Mata Pelajaran: ${String(ctx.mataPelajaran || '')} • Topik: ${String(ctx.topik || '')}

Bagian yang ditulis ulang (heading asli wajib dipertahankan persis di baris pertama):
"${cleanSection}"

Isi dokumen saat ini (untuk konsistensi, jangan mengulang bagian lain):
${context}

Aturan:
1. Baris pertama HARUS heading asli bagian tersebut (tulis persis).
2. Hanya isi bagian itu; jangan menambah bagian baru di luar cakupannya.
3. Tidak ada placeholder kosong; gunakan tabel Markdown bila memuat matriks/rubrik/jadwal.
4. Langsung isi, tanpa pembuka/penutup percakapan.`;
}
