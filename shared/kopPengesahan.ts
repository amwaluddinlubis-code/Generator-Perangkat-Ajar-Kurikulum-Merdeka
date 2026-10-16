/**
 * kopPengesahan.ts — Kontrak bersama FASE 2 ("Siap cetak & siap arsip").
 *
 * Dipakai oleh: Worker A (F2-1 kop & pengesahan), Worker B (F2-2 naskah ujian,
 * F2-3 admin ujian), Worker C (F2-4 penamaan file), dan integrasi DocumentViewer.
 *
 * ATURAN KERAS: tidak ada identitas dummy. Nama/NIP yang kosong dirender
 * sebagai garis kosong ("...................."), TIDAK PERNAH diisi nama/NIP palsu.
 */

import type { DocType } from '@/src/types/index.ts';

/** Data kop & pengesahan yang diisi guru lewat modal editor. */
export interface KopPengesahan {
  namaSekolah: string; // wajib
  alamatSekolah?: string;
  /** Logo sekolah sebagai dataURL (png/jpg), maksimal ~500KB. */
  logoDataUrl?: string;
  tahunAjaran: string; // wajib, cth "2026/2027"
  semester?: string; // cth "Ganjil" / "Genap"
  namaGuru: string; // wajib
  nipGuru?: string;
  namaKepsek: string; // wajib
  nipKepsek?: string;
  /** Wajib, cth "Panyabungan, 17 Oktober 2026". */
  kotaTanggal: string;
}

/** Field wajib yang harus diisi guru sebelum ekspor. */
export const KOP_FIELD_WAJIB: (keyof KopPengesahan)[] = [
  'namaSekolah',
  'tahunAjaran',
  'namaGuru',
  'namaKepsek',
  'kotaTanggal',
];

export const KOP_STORAGE_KEY = 'rgm-kop-pengesahan';
export const LOGO_MAX_BYTES = 500 * 1024;

/** Kembalikan daftar nama field wajib yang masih kosong. */
export function validasiKop(k: Partial<KopPengesahan>): string[] {
  return KOP_FIELD_WAJIB.filter((f) => !String(k[f] ?? '').trim());
}

export function kopLengkap(k: Partial<KopPengesahan> | null | undefined): k is KopPengesahan {
  return !!k && validasiKop(k).length === 0;
}

/** Default awal dari data profil pengguna yang sudah ada. */
export function kopDefaultDariUser(user: {
  schoolName?: string;
  name?: string;
  nip?: string;
}): Partial<KopPengesahan> {
  const tahun = new Date().getFullYear();
  const bulan = new Date().getMonth(); // 0-based
  return {
    namaSekolah: user.schoolName || '',
    namaGuru: user.name || '',
    nipGuru: user.nip || '',
    tahunAjaran: bulan >= 6 ? `${tahun}/${tahun + 1}` : `${tahun - 1}/${tahun}`,
  };
}

export function muatKop(): Partial<KopPengesahan> | null {
  try {
    const raw = localStorage.getItem(KOP_STORAGE_KEY);
    if (!raw) return null;
    const obj = JSON.parse(raw) as Partial<KopPengesahan>;
    if (typeof obj !== 'object' || obj === null) return null;
    return obj;
  } catch {
    return null;
  }
}

export function simpanKop(k: KopPengesahan): void {
  localStorage.setItem(KOP_STORAGE_KEY, JSON.stringify(k));
}

/** Ganti karakter ilegal nama file Windows/macOS dengan '-' dan rapikan. */
export function sanitasiNamaFile(nama: string): string {
  return nama
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[. ]+$/, '');
}

const LABEL_DOCTYPE: Record<DocType, string> = {
  modul_ajar: 'Modul_Ajar',
  rpp: 'RPP',
  soal_ujian: 'Paket_Soal',
  kktp_atp: 'ATP_KKTP',
  lkpd: 'LKPD',
  prota_promes: 'Prota_Promes',
  modul_p5: 'Modul_P5',
};

/**
 * Nama file cerdas: "<LabelDocType>_<judul disanitasi>", maks 80 karakter.
 * Tidak pernah mengembalikan string kosong.
 */
export function namaFileCerdas(judul: string, docType: DocType): string {
  const label = LABEL_DOCTYPE[docType] ?? 'Dokumen';
  const bersih = sanitasiNamaFile(judul).replace(/ /g, '_');
  const nama = bersih ? `${label}_${bersih}` : `${label}_RGM`;
  return nama.length > 80 ? nama.slice(0, 80) : nama;
}

/** Render baris identitas: nilai asli bila ada, garis kosong bila tidak (bukan dummy). */
export function barisIdentitas(nilai: string | undefined, kosong = '....................'): string {
  const v = (nilai ?? '').trim();
  return v ? v : kosong;
}
