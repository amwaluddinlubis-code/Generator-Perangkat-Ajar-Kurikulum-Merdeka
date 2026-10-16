/**
 * Bank Soal Salah — F3-2 roadmap RGM.
 *
 * Menyimpan butir soal yang pernah dijawab salah saat "Coba Kerjakan" (F3-4).
 * Satu sumber kebenaran per sesi:
 *  - bila userId tersedia → Firestore (koleksi `bank_soal_salah`, dokumen per userId)
 *  - bila tidak (belum login) → localStorage `rgm-bank-soal-salah`
 * Jangan menulis ke dua sumber sekaligus agar tidak berkonflik.
 *
 * Fungsi catatHasil & idButir MURNI (tanpa DOM/network) agar bisa di-unit-test.
 */
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import type { ButirSoal } from '@/shared/soalTerstruktur';

export interface EntriSoalSalah {
  /** Hash stabil dari butir (lihat idButir). */
  id: string;
  butir: ButirSoal;
  /** Berapa kali butir ini dijawab salah (akumulatif). */
  kaliSalah: number;
  /** Berapa kali berturut-turut dijawab benar sejak salah terakhir. */
  benarBeruntun: number;
  /** ISO timestamp pembaruan terakhir. */
  terakhir: string;
}

const KOLEKSI = 'bank_soal_salah';
const KUNCI_LOCAL = 'rgm-bank-soal-salah';
const KUNCI_AMBANG = 'rgm-ambang-lunas';
export const AMBANG_LUNAS_DEFAULT = 3;

/** Normalisasi ringan agar hash stabil terhadap spasi/kapitalisasi. */
function normalisasiKunci(s: unknown): string {
  return String(s ?? '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

/** Hash string FNV-1a 32-bit → heksadesimal (cukup untuk id butir, tanpa dependency). */
function hashFNV1a(teks: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < teks.length; i++) {
    h ^= teks.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

/**
 * Id stabil sebuah butir: hash dari bentuk + pertanyaan + kunci.
 * Butir yang sama (mis. dari versi dokumen berbeda) mendapat id yang sama,
 * sehingga riwayat salah/benar-nya menyatu.
 */
export function idButir(b: ButirSoal): string {
  const bahan = [b.bentuk, normalisasiKunci(b.pertanyaan), normalisasiKunci(b.kunci)].join('|');
  return hashFNV1a(bahan);
}

/**
 * Catat hasil satu jawaban — MURNI (tidak menyentuh storage).
 *
 * - Salah → kaliSalah++, benarBeruntun=0 (entri baru dibuat bila belum ada).
 * - Benar → benarBeruntun++; bila benarBeruntun >= ambangLunas, entri DIBUANG (lunas).
 * - Benar untuk butir yang tidak ada di bank → bank tidak berubah.
 *
 * Mengembalikan array BARU (tidak memutasi argumen).
 */
export function catatHasil(
  entri: EntriSoalSalah[],
  butir: ButirSoal,
  benar: boolean,
  ambangLunas: number
): EntriSoalSalah[] {
  const daftar = Array.isArray(entri) ? entri : [];
  const id = idButir(butir);
  const sekarang = new Date().toISOString();
  const ambang = Math.max(1, Math.floor(Number(ambangLunas) || AMBANG_LUNAS_DEFAULT));
  const idx = daftar.findIndex((e) => e.id === id);

  if (benar) {
    if (idx < 0) return daftar;
    const lama = daftar[idx];
    const benarBeruntun = lama.benarBeruntun + 1;
    if (benarBeruntun >= ambang) {
      // Lunas: butir keluar dari bank.
      return daftar.filter((e) => e.id !== id);
    }
    return daftar.map((e, i) => (i === idx ? { ...e, benarBeruntun, terakhir: sekarang } : e));
  }

  if (idx < 0) {
    return [
      ...daftar,
      { id, butir, kaliSalah: 1, benarBeruntun: 0, terakhir: sekarang },
    ];
  }
  return daftar.map((e, i) =>
    i === idx ? { ...e, butir, kaliSalah: e.kaliSalah + 1, benarBeruntun: 0, terakhir: sekarang } : e
  );
}

// ---------------------------------------------------------------
// Pengaturan ambang lunas (localStorage, per perangkat)
// ---------------------------------------------------------------

/** Ambang benar-beruntun agar sebuah butir dianggap lunas (default 3). */
export function ambangLunas(): number {
  try {
    if (typeof localStorage === 'undefined') return AMBANG_LUNAS_DEFAULT;
    const mentah = localStorage.getItem(KUNCI_AMBANG);
    const n = Math.floor(Number(mentah));
    return Number.isFinite(n) && n >= 1 && n <= 20 ? n : AMBANG_LUNAS_DEFAULT;
  } catch {
    return AMBANG_LUNAS_DEFAULT;
  }
}

/** Simpan ambang lunas baru (1–20). */
export function simpanAmbangLunas(n: number): void {
  try {
    if (typeof localStorage === 'undefined') return;
    const v = Math.min(20, Math.max(1, Math.floor(Number(n) || AMBANG_LUNAS_DEFAULT)));
    localStorage.setItem(KUNCI_AMBANG, String(v));
  } catch {
    /* abaikan — penyimpanan lokal tidak tersedia */
  }
}

// ---------------------------------------------------------------
// Persistensi bank: firestore bila login, localStorage bila tidak
// ---------------------------------------------------------------

function bacaLocal(): EntriSoalSalah[] {
  try {
    if (typeof localStorage === 'undefined') return [];
    const mentah = localStorage.getItem(KUNCI_LOCAL);
    if (!mentah) return [];
    const data = JSON.parse(mentah) as { entri?: EntriSoalSalah[] };
    return Array.isArray(data?.entri) ? data.entri : [];
  } catch {
    return [];
  }
}

function tulisLocal(entri: EntriSoalSalah[]): void {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(KUNCI_LOCAL, JSON.stringify({ entri, disimpanPada: new Date().toISOString() }));
  } catch {
    /* abaikan */
  }
}

/**
 * Muat bank soal salah.
 * - userId ada → baca dokumen `bank_soal_salah/{userId}` dari Firestore.
 * - userId null → baca localStorage.
 */
export async function muatBank(userId: string | null): Promise<EntriSoalSalah[]> {
  if (userId) {
    try {
      const ref = doc(db, KOLEKSI, userId);
      const snap = await getDoc(ref);
      if (!snap.exists()) return [];
      const data = snap.data() as { entri?: EntriSoalSalah[] };
      return Array.isArray(data?.entri) ? data.entri : [];
    } catch (error) {
      console.warn('Firestore muatBank warning:', error);
      return [];
    }
  }
  return bacaLocal();
}

/**
 * Simpan bank soal salah.
 * - userId ada → tulis dokumen `bank_soal_salah/{userId}` ke Firestore (merge).
 * - userId null → tulis localStorage.
 */
export async function simpanBank(userId: string | null, entri: EntriSoalSalah[]): Promise<void> {
  const daftar = Array.isArray(entri) ? entri : [];
  if (userId) {
    try {
      const ref = doc(db, KOLEKSI, userId);
      await setDoc(
        ref,
        { entri: daftar, updatedAt: new Date().toISOString() },
        { merge: true }
      );
    } catch (error) {
      console.warn('Firestore simpanBank warning:', error);
    }
    return;
  }
  tulisLocal(daftar);
}
