import { cpReference } from '../curriculumRefs.js';
import { dimensiText } from './base.js';
import type { PromptContext, PromptSpec } from './types.js';

function lampiranLine(ctx: PromptContext): string {
  const list = (ctx.catatanTambahan as any)?.lampiran;
  if (Array.isArray(list) && list.length) {
    return `   LAMPIRAN YANG DISUSUN (hanya jenis ini, jangan tambah yang lain): ${list.join(', ')}.`;
  }
  return '';
}

export const modulAjarSpec: PromptSpec = {
  docType: 'modul_ajar',
  render(ctx: PromptContext): string {
    return `TUGAS: Susunlah **MODUL AJAR LENGKAP & SISTEMATIS KURIKULUM MERDEKA** sesuai dengan **Permendikdasmen No. 13 Tahun 2025** dan **Panduan Pembelajaran dan Asesmen (PPA)**.
Modul ajar ini harus siap digunakan di kelas nyata, komprehensif, kaya akan diferensiasi pembelajaran, dan terstruktur rapi.

PANDUAN GAYA PENULISAN (CRITICAL - WAJIB DIPATUHI):
1. DILARANG KERAS mengulang variabel Judul/Topik secara verbatim (kata-per-kata) di setiap paragraf.
2. Konversikan topik menjadi fenomena kontekstual, skenario kasus nyata, atau contoh spesifik yang relevan dengan kehidupan sehari-hari siswa.
3. Gunakan Kata Kerja Operasional (KKO) yang konkret dan bisa diukur, hindari kata generik seperti "mengetahui" atau "memahami".
4. DILARANG menggunakan kalimat pengantar AI (seperti "Berikut adalah modul ajarnya..."). Langsung hasilkan dokumen.

STRUKTUR RESMI YANG WAJIB ADA:
1. **INFORMASI UMUM**:
   - Identitas: Nama Guru (${ctx.authorName || 'Guru Mata Pelajaran'}), Satuan Pendidikan (${ctx.schoolName || 'Satuan Pendidikan'}), Jenjang (${ctx.jenjang}), Tingkat/Kelas (${ctx.tingkat}), ${ctx.fase}, Semester, Alokasi Waktu (${ctx.alokasiWaktu || '2 x 40 menit / 1 Pertemuan'}).
   - Kompetensi Awal / Prasyarat Belajar.
    - Profil Lulusan (fokuskan pada dimensi: ${dimensiText(ctx.dimensiProfilLulusan ?? ctx.dimensiP5)}).
   - Sarana dan Prasarana (alat, media, teknologi kontekstual).
   - Target Peserta Didik (${ctx.targetPeserta || 'Reguler/tipikal, dengan diferensiasi kebutuhan belajar'}).
   - Model Pembelajaran: ${ctx.modelPembelajaran || 'Problem Based Learning (PBL)'} dengan moda Tatap Muka.

2. **KOMPONEN INTI**:
   - Capaian Pembelajaran (CP) sesuai ${cpReference(ctx.mataPelajaran)} untuk ${ctx.mataPelajaran} ${ctx.fase}.
   - Tujuan Pembelajaran (TP) yang spesifik (ABCD) dan operasional.
   - Indikator Ketercapaian Tujuan Pembelajaran (IKTP).
   - Pemahaman Bermakna (manfaat aplikatif nyata di kehidupan, bukan teori).
   - Pertanyaan Pemantik: Buat pertanyaan berupa studi kasus, dilema, atau teka-teki logika yang memancing nalar kritis. Jangan sekadar bertanya "Apa definisi dari materi ini?".
   - Persiapan Pembelajaran.

3. **KEGIATAN PEMBELAJARAN BERDIFERENSIASI (RINCI MENIT PER MENIT)**:
   - **Kegiatan Pendahuluan**: Salam, doa, presensi, apersepsi kontekstual, asesmen diagnostik singkat, penyampaian tujuan.
   - **Kegiatan Inti**: WAJIB Terapkan sintaks asli dari model (${ctx.modelPembelajaran || 'PBL'}). Jangan mencampuradukkan sintaksnya dengan model lain. Tuliskan aktivitas fisik/nyata yang dilakukan siswa (misal: "siswa menggunting", "siswa berdebat"), bukan sekadar "siswa berdiskusi". Sertakan instruksi eksplisit diferensiasi:
     * *Diferensiasi Konten*: materi teks, visual/gambar, objek konkret/video.
     * *Diferensiasi Proses*: scaffolding, bimbingan kelompok kecil vs mandiri, aktivitas hands-on.
     * *Diferensiasi Produk*: variasi penyajian hasil belajar.
   - **Kegiatan Penutup**: Kesimpulan bersama, refleksi murid & guru, asesmen formatif akhir (exit ticket), tindak lanjut & doa.

4. **ASESMEN DAN KRITERIA KETERCAPAIAN (KKTP)**:
   - Asesmen Diagnostik, Formatif, Sumatif.
   - Rubrik Penilaian KKTP dalam bentuk TABEL LENGKAP dengan 4 skala: *Baru Berkembang*, *Layak*, *Cakap*, *Mahir*. Deskriptor pada tabel WAJIB membedakan kualitas kinerja, bukan sekadar menambah kata "sangat" atau "kurang".

 5. **LAMPIRAN LENGKAP**:
    - Lembar Kerja Peserta Didik (LKPD): WAJIB buat 1 wacana/skenario studi kasus nyata beserta 2-3 soal esai/analisis aplikatif yang SIAP DIKERJAKAN siswa.
    - Bahan Bacaan Guru dan Peserta Didik (ringkasan materi esensial 1-2 halaman).
    - Program Pengayaan dan Remedial.
    - Glosarium (definisi istilah penting).
    - Daftar Pustaka resmi Kemendikbudristek.
${lampiranLine(ctx)}`;
  }
};
