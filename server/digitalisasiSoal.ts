/**
 * digitalisasiSoal.ts — F3-6 roadmap RGM: "Digitalisasi soal".
 *
 * Modul MURNI: (1) builder prompt untuk mengubah teks soal mentah menjadi
 * JSON array item rgm-soal-v1, (2) parser hasil yang toleran dan TIDAK PERNAH
 * memfabrikasi butir (gagal total → array kosong).
 * Tanpa dependency node/browser/DOM — bisa di-unit-test langsung.
 * Dipisah dari server.ts agar server.ts tetap di bawah batas push konektor.
 */
import {
  ekstrakJsonDariTeks,
  DAFTAR_BENTUK,
  type ButirSoal,
  type BentukSoal,
  type LevelKognitif,
  type RubrikSkor,
  type PasanganJodoh,
} from '../shared/soalTerstruktur.js';

/**
 * Bangun prompt: ubah teks soal mentah (hasil ketikan/foto) menjadi JSON array
 * item rgm-soal-v1. Minta HANYA JSON array, tanpa teks lain.
 */
export function bangunPromptDigitalisasi(teks: string): string {
  return [
    'Kamu adalah asisten guru Indonesia yang men-digitalisasi soal.',
    'Tugas: ubah TEKS SOAL MENTAH di bawah menjadi array JSON butir soal terstruktur.',
    '',
    'ATURAN:',
    '1. Setiap soal menjadi SATU objek dengan field WAJIB:',
    '   - "nomor": nomor urut soal (bilangan bulat, mulai dari 1)',
    '   - "bentuk": SALAH SATU dari "pg_biasa" | "pg_kompleks" | "menjodohkan" | "isian" | "uraian"',
    '     (pg_biasa = pilihan ganda satu jawaban; pg_kompleks = PG kompleks AKM benar/salah per pernyataan;',
    '      menjodohkan = memasangkan; isian = isian singkat; uraian = esai/HOTS)',
    '   - "pertanyaan": teks pertanyaan lengkap (string, wajib terisi)',
    '   - "opsi": array string opsi (WAJIB untuk pg_biasa/pg_kompleks, minimal 2)',
    '   - "pasangan": array {"kiri","kanan"} (WAJIB untuk menjodohkan, minimal 2)',
    '   - "kunci": kunci jawaban (string, wajib terisi; pg_biasa = huruf opsi, uraian = jawaban model)',
    '   - "pembahasan": 1-2 kalimat mengapa kunci itu benar',
    '   - "levelKognitif": SALAH SATU dari "C1".."C6" (tebak dari kata kerja soal bila tidak jelas)',
    '   - "indikator": indikator/tujuan soal (1 kalimat)',
    '   - "stimulus": teks/bacaan/gambar pendukung (opsional, hanya bila ada di teks)',
    '   - "rubrik": array {"skor","deskriptor"} (WAJIB untuk uraian, minimal 2 kriteria)',
    '2. JANGAN menambah soal yang tidak ada di teks. JANGAN mengubah isi soal.',
    '3. Bila suatu bagian teks tidak jelas sebagai soal, lewati saja — jangan difabrikasi.',
    '',
    'Kembalikan HANYA JSON array valid, tanpa code fence dan tanpa teks lain.',
    '',
    'TEKS SOAL MENTAH:',
    '---',
    teks,
    '---',
  ].join('\n');
}

const rapi = (s: unknown): string => String(s ?? '').trim();

/**
 * Parse balasan AI menjadi ButirSoal[] secara toleran (code fence / teks
 * pengantar ikut ditangani). Butir yang gagal dipetakan tidak difabrikasi —
 * ia tetap ada di array apa adanya; validasi minimal dilakukan pemanggil
 * (butirValidMinimal) agar butir tak valid bisa dibuang dengan hitungan.
 * Gagal total → [].
 */
export function parseHasilDigitalisasi(teks: string): ButirSoal[] {
  const bersih = String(teks || '').replace(/```(?:json)?/gi, '').trim();
  let data: unknown = null;
  try {
    data = JSON.parse(bersih);
  } catch {
    const awal = bersih.indexOf('[');
    const akhir = bersih.lastIndexOf(']');
    if (awal >= 0 && akhir > awal) {
      try {
        data = JSON.parse(bersih.slice(awal, akhir + 1));
      } catch { /* tetap null */ }
    }
  }
  if (!Array.isArray(data)) return [];

  return data
    .filter((x): x is Record<string, unknown> => !!x && typeof x === 'object')
    .map((raw): ButirSoal => {
      const opsi = Array.isArray(raw.opsi)
        ? (raw.opsi as unknown[]).map(rapi).filter(Boolean)
        : undefined;
      const pasangan = Array.isArray(raw.pasangan)
        ? (raw.pasangan as unknown[])
            .filter((x): x is Record<string, unknown> => !!x && typeof x === 'object')
            .map((x): PasanganJodoh => ({ kiri: rapi(x.kiri), kanan: rapi(x.kanan) }))
            .filter(x => x.kiri && x.kanan)
        : undefined;
      const rubrik = Array.isArray(raw.rubrik)
        ? (raw.rubrik as unknown[])
            .filter((x): x is Record<string, unknown> => !!x && typeof x === 'object')
            .map((x): RubrikSkor => ({ skor: Number(x.skor) || 0, deskriptor: rapi(x.deskriptor) }))
            .filter(r => r.skor > 0 && r.deskriptor)
        : undefined;
      return {
        nomor: Number(raw.nomor) || 0,
        bentuk: rapi(raw.bentuk) as BentukSoal,
        stimulus: rapi(raw.stimulus) || undefined,
        pertanyaan: rapi(raw.pertanyaan),
        opsi,
        pasangan,
        kunci: rapi(raw.kunci),
        pembahasan: rapi(raw.pembahasan),
        levelKognitif: rapi(raw.levelKognitif) as LevelKognitif,
        indikator: rapi(raw.indikator),
        rubrik,
      };
    });
}

/**
 * Validasi MINIMAL satu butir hasil digitalisasi: bentuk dikenal, pertanyaan
 * terisi, kunci terisi. Sengaja tidak mengisi default (nomor/levelKognitif/
 * indikator) — butir tak valid dibuang pemanggil dan dihitung butirDibuang.
 */
export function butirValidMinimal(it: ButirSoal): boolean {
  return (
    (DAFTAR_BENTUK as string[]).includes(it.bentuk) &&
    !!it.pertanyaan && !!it.pertanyaan.trim() &&
    !!it.kunci && !!it.kunci.trim()
  );
}
