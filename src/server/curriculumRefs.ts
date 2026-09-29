/**
 * Rujukan regulasi kurikulum terpusat.
 *
 * - CP umum: Keputusan Kepala BSKAP No. 046/H/KR/2025
 *   (mencabut 032/H/KR/2024; Fase Fondasi PAUD + Fase A–F; selaras 6 kemampuan fondasi).
 * - CP Pendidikan Agama dan Budi Pekerti (+ pendidikan khusus):
 *   diubah dengan Keputusan Kepala BKPDM No. 020 Tahun 2026
 *   (penekanan iman-takwa, akhlak, dan pengamalan nilai sehari-hari).
 */

export const CP_BSKAP_KEP = '046/H/KR/2025';
export const CP_AGAMA_KEP = '020 Tahun 2026';

const AGAMA_KEYWORDS = [
  'agama',
  'budi pekerti',
  'budipekerti',
  'pai ',
  ' pai',
  'akhlak',
  'akidah',
  "qur'an",
  'quran',
  'hadis',
  'hadits',
  'fikih',
  'fiqih',
  'tauhid',
  'tauhiid',
  'ski',
  'sejarah kebudayaan islam',
  'kristen',
  'katolik',
  'hindu',
  'buddha',
  'khonghucu',
  'konghucu'
];

/** True bila mata pelajaran termasuk rumpun Agama & Budi Pekerti. */
export function isAgamaMapel(mapel?: string): boolean {
  const normalized = String(mapel || '').toLowerCase();
  return AGAMA_KEYWORDS.some(keyword => normalized.includes(keyword));
}

/** Sitasi CP yang benar sesuai mapel. */
export function cpReference(mapel?: string): string {
  if (isAgamaMapel(mapel)) {
    return (
      `Keputusan Kepala BSKAP No. ${CP_BSKAP_KEP} ` +
      `sebagaimana diubah dengan Keputusan Kepala BKPDM No. ${CP_AGAMA_KEP} ` +
      `(CP Pendidikan Agama dan Budi Pekerti)`
    );
  }
  return `Keputusan Kepala BSKAP No. ${CP_BSKAP_KEP}`;
}

/** Sitasi singkat untuk label UI. */
export function cpShortReference(mapel?: string): string {
  return isAgamaMapel(mapel)
    ? `BSKAP ${CP_BSKAP_KEP} + BKPDM ${CP_AGAMA_KEP}`
    : `BSKAP ${CP_BSKAP_KEP}`;
}

/** Blok instruksi prompt khusus mapel agama (020/2026). */
export function agamaCpGuidance(mapel: string, fase: string): string {
  return `
KETENTUAN KHUSUS MAPEL AGAMA (wajib dipatuhi):
Mata pelajaran "${mapel}" tunduk pada CP revisi ${cpReference(mapel)}.
- Rumuskan CP/TP mencakup TIGA ranah utuh: sikap (iman-takwa, akhlak mulia),
  pengetahuan (pemahaman ajaran), dan keterampilan (pengamalan nilai sehari-hari).
- Tekankan PENGAMALAN, bukan hafalan: setiap tujuan harus bermuara pada perilaku
  nyata di sekolah, keluarga, dan masyarakat sesuai ${fase}.
- Selaraskan dengan Profil Pelajar Pancasila dimensi Beriman-Bertakwa dan Berakhlak Mulia.
- Cantumkan dasar rujukan pada bagian Capaian Pembelajaran: tulis persis
  "Keputusan Kepala BSKAP No. 046/H/KR/2025 sebagaimana diubah dengan
  Keputusan Kepala BKPDM No. 020 Tahun 2026".
- Hindari pencampuran ajaran antar-agama; tetap dalam koridor satu mata pelajaran agama.
`.trim();
}
