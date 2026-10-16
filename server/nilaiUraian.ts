/**
 * nilaiUraian.ts — F3-5 roadmap RGM: "AI grading uraian".
 *
 * Modul MURNI: (1) builder prompt untuk AI sebagai juri penskoran,
 * (2) parser hasil penilaian AI yang toleran + fallback aman.
 * Tanpa dependency node/browser/DOM — bisa di-unit-test langsung.
 * Dipisah dari server.ts agar server.ts tetap di bawah batas push konektor.
 */
import { ekstrakJsonDariTeks } from '../shared/soalTerstruktur.js';

/** Hasil penilaian uraian oleh AI. Guru WAJIB memverifikasi (perluVerifikasi selalu true). */
export interface HasilNilaiAI {
  skor: number;
  skorMaks: number;
  alasan: string;
  perluVerifikasi: boolean;
}

export interface RubrikNilaiInput {
  skor: number;
  deskriptor: string;
}

/** Pesan fallback bila AI gagal menghasilkan penilaian yang bisa diparse. */
export const PESAN_GAGAL_NILAI = 'AI gagal menilai — perlu verifikasi guru';

/**
 * Bangun prompt "AI sebagai juri": nilai MAKNA/isi jawaban (bukan hafalan
 * kata-per-kata), bandingkan dengan kunci + rubrik, kembalikan HANYA JSON.
 */
export function bangunPromptNilaiUraian(p: {
  pertanyaan: string;
  kunci: string;
  rubrik: RubrikNilaiInput[];
  jawabanSiswa: string;
  skorMaks: number;
}): string {
  const rubrikTeks = p.rubrik.length > 0
    ? p.rubrik.map(r => `- Skor ${r.skor}: ${r.deskriptor}`).join('\n')
    : '(tidak ada rubrik terperinci — nilai berdasarkan kedekatan makna dengan kunci, skala 0 sampai skor maksimum)';

  return [
    'Kamu adalah guru Indonesia yang adil dan teliti, menilai jawaban uraian siswa.',
    'ATURAN PENILAIAN:',
    '1. Nilai MAKNA dan pemahaman jawaban, BUKAN hafalan kata-per-kata dari kunci.',
    '2. Bandingkan jawaban siswa dengan kunci jawaban dan rubrik di bawah.',
    '3. Beri skor parsial bila jawaban benar sebagian; 0 bila kosong/tidak relevan/salah total.',
    `4. Skor berupa bilangan bulat, minimum 0 dan maksimum ${p.skorMaks}.`,
    '',
    'PERTANYAAN:',
    p.pertanyaan,
    '',
    'KUNCI JAWABAN (jawaban model):',
    p.kunci,
    '',
    'RUBRIK PENSKORAN:',
    rubrikTeks,
    '',
    'JAWABAN SISWA:',
    p.jawabanSiswa,
    '',
    `SKOR MAKSIMUM: ${p.skorMaks}`,
    '',
    'Kembalikan HANYA JSON valid tanpa teks lain, persis format ini:',
    '{"skor": <bilangan bulat 0 sampai skor maksimum>, "alasan": "<1-2 kalimat bahasa Indonesia menjelaskan alasan skor>"}',
  ].join('\n');
}

/**
 * Parse hasil penilaian AI secara toleran (code fence / teks pengantar ikut
 * ditangani oleh ekstrakJsonDariTeks). Skor di-clamp ke 0..skorMaks.
 * Bila parse gagal total (atau skor bukan angka), kembalikan fallback aman:
 * skor 0 + pesan yang memaksa verifikasi guru. TIDAK PERNAH melempar.
 */
export function parseHasilNilai(teks: string, skorMaks: number): { skor: number; alasan: string } {
  const maks = Math.max(0, Math.round(Number(skorMaks) || 0));
  const parsed = ekstrakJsonDariTeks(teks) as { skor?: unknown; alasan?: unknown } | null;
  const skorMentah = parsed && typeof parsed.skor === 'number' && Number.isFinite(parsed.skor)
    ? parsed.skor
    : NaN;
  if (Number.isNaN(skorMentah)) {
    return { skor: 0, alasan: PESAN_GAGAL_NILAI };
  }
  const skor = Math.min(maks, Math.max(0, Math.round(skorMentah)));
  const alasan = String(parsed!.alasan ?? '').trim();
  return { skor, alasan: alasan || 'AI tidak menyertakan alasan — perlu verifikasi guru.' };
}
