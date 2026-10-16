/**
 * Penilaian jawaban latihan — F3-4 "Mode Coba Kerjakan".
 *
 * Modul MURNI: tanpa dependency node/browser/DOM. Hanya menilai jawaban
 * objektif yang bisa dinilai otomatis; uraian selalu dikembalikan sebagai
 * butuhPenilaianManual (dinilai guru atau via TombolNilaiAI).
 */
import type { ButirSoal } from '@/shared/soalTerstruktur';

export interface HasilPenilaian {
  /** true bila jawaban dinilai benar. */
  benar: boolean;
  /** true untuk uraian — jawaban tidak bisa dinilai otomatis. */
  butuhPenilaianManual?: boolean;
}

/**
 * Normalisasi teks: lowercase, trim, spasi ganda/lebih → satu spasi.
 * Dipakai untuk membandingkan jawaban isian secara toleran.
 */
export function normalisasiTeks(s: unknown): string {
  return String(s ?? '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

/**
 * Parse kunci bentuk "1-Benar, 2-Salah" atau "1-B, 2-A" menjadi map
 * nomor → nilai ternormalisasi. Toleran terhadap pemisah ',', ';',
 * '-' / ':' / spasi, dan spasi berlebih.
 */
function parseKunciBernomor(kunci: unknown): Map<string, string> {
  const hasil = new Map<string, string>();
  const teks = String(kunci ?? '');
  for (const bagian of teks.split(/[,;]/)) {
    const b = bagian.trim();
    if (!b) continue;
    let m = b.match(/^(\d+)\s*[-:–—]\s*(.+)$/);
    if (!m) m = b.match(/^(\d+)\s+(.+)$/);
    if (!m) continue;
    hasil.set(m[1], normalisasiTeks(m[2]));
  }
  return hasil;
}

/** true bila dua map bernomor sama persis (abaikan urutan penulisan). */
function mapSama(a: Map<string, string>, b: Map<string, string>): boolean {
  if (a.size !== b.size) return false;
  for (const [k, v] of a) {
    if (!b.has(k) || b.get(k) !== v) return false;
  }
  return true;
}

/**
 * Nilai satu jawaban siswa terhadap satu butir soal.
 *
 * - pg_biasa: cocokkan huruf opsi (case-insensitive; toleran spasi).
 * - pg_kompleks: cocokkan sebagai HIMPUNAN pasangan nomor→Benar/Salah
 *   (urutan penulisan & spasi diabaikan).
 * - menjodohkan: cocokkan sebagai HIMPUNAN pasangan nomor→huruf kanan.
 * - isian: cocokkan teks setelah normalisasiTeks.
 * - uraian: selalu { benar: false, butuhPenilaianManual: true }.
 */
export function nilaiJawaban(butir: ButirSoal, jawaban: string): HasilPenilaian {
  const bentuk = butir?.bentuk;
  const kunci = String(butir?.kunci ?? '');
  const jwb = String(jawaban ?? '');

  switch (bentuk) {
    case 'pg_biasa': {
      const a = jwb.trim().toUpperCase();
      const b = kunci.trim().toUpperCase();
      return { benar: a.length > 0 && a === b };
    }
    case 'pg_kompleks':
      return { benar: mapSama(parseKunciBernomor(kunci), parseKunciBernomor(jwb)) };
    case 'menjodohkan': {
      // Huruf kanan dinormalisasi ke huruf kapital agar "b" == "B".
      const norm = (m: Map<string, string>) => {
        const n = new Map<string, string>();
        for (const [k, v] of m) n.set(k, v.toUpperCase());
        return n;
      };
      return { benar: mapSama(norm(parseKunciBernomor(kunci)), norm(parseKunciBernomor(jwb))) };
    }
    case 'isian':
      return { benar: jwb.trim().length > 0 && normalisasiTeks(jwb) === normalisasiTeks(kunci) };
    case 'uraian':
      return { benar: false, butuhPenilaianManual: true };
    default:
      return { benar: false };
  }
}
