import type { PromptContext, PromptSpec } from './types.js';

function fokusLine(ctx: PromptContext): string {
  const fokus = (ctx.catatanTambahan as any)?.fokusRpp;
  if (fokus && fokus !== 'Seimbang') {
    return `   FOKUS PENEKANAN: perdalam bagian ${fokus} melebihi komponen lain.`;
  }
  return '';
}

export const rppSpec: PromptSpec = {
  docType: 'rpp',
  render(ctx: PromptContext): string {
    return `TUGAS: Susunlah **RENCANA PELAKSANAAN PEMBELAJARAN (RPP) INOVATIF & RINGKAS (1-2 LEMBAR)** Kurikulum Merdeka sesuai Permendikbudristek No 12 Tahun 2024.
Fokus pada efisiensi, kemudahan dibaca kepala sekolah/pengawas saat supervisi, dan kejelasan operasional di kelas.

PANDUAN GAYA PENULISAN (CRITICAL):
1. Tuliskan langkah pembelajaran berupa instruksi operasional yang nyata (contoh: "Guru menayangkan video...", "Siswa menyusun balok...", "Kelompok mempresentasikan temuan..."). Hindari bahasa teoritis yang kaku.
2. Jangan mengulang variabel judul topik secara terus-menerus. Ganti dengan konteks materinya.

FORMAT WAJIB:
1. **IDENTITAS & KOMPONEN RPP**: Sekolah (${ctx.schoolName || 'Satuan Pendidikan'}), Mata Pelajaran (${ctx.mataPelajaran}), Kelas/Fase (${ctx.tingkat} / ${ctx.fase}), Topik (${ctx.topik}), Alokasi Waktu (${ctx.alokasiWaktu || '2 JP'}).
2. **TUJUAN PEMBELAJARAN**: Rumusan TP operasional berorientasi HOTS & Profil Lulusan.
3. **MEDIA, ALAT & SUMBER BELAJAR**: Alat praktis dan bahan ajar relevan.
4. **LANGKAH-LANGKAH PEMBELAJARAN**:
   - Pendahuluan (10 menit): Doa, Apersepsi kontekstual, Ice Breaking, Pertanyaan Pemantik berbasis nalar.
   - Kegiatan Inti (60 menit): Penerapan sintaks ${ctx.modelPembelajaran || 'Problem Based Learning'} dengan sentuhan diferensiasi. Tuliskan aktivitas dengan KKO yang jelas.
   - Penutup (10 menit): Refleksi, asesmen cepat (Exit Ticket), pesan moral dan doa.
5. **ASESMEN**: Asesmen Sikap, Pengetahuan, dan Keterampilan.
${fokusLine(ctx)}
6. **TANDA TANGAN PENGESAHAN**: Tempat & Tanggal, Mengetahui Kepala Sekolah & Guru Mata Pelajaran.`;
  }
};
